/**
 * Minimal SMIv2 reader for the MIB files Teltonika devices offer for download.
 *
 * It is deliberately not a general purpose ASN.1 compiler: it only extracts what the adapter needs to poll a
 * device, namely the numeric OID, the syntax and the table structure of every defined object. Anything it cannot
 * resolve is reported in `unresolved` instead of throwing, so one odd definition never costs us a whole file.
 */

export interface MibObject {
    name: string;
    /** Fully resolved numeric OID, for example `1.3.6.1.4.1.48690.2.2.1.12` */
    oid: string;
    /** SYNTAX clause with the whitespace collapsed, for example `DisplayString (SIZE (0..255))` */
    syntax?: string;
    access?: string;
    description?: string;
    /** Column names of the INDEX clause. Only conceptual rows carry it. */
    index?: string[];
    /** True when SYNTAX is `SEQUENCE OF …`, which makes the object a table rather than a value */
    table?: boolean;
    /** True for a NOTIFICATION-TYPE, i.e. something the device sends as a trap rather than answers on request */
    notification?: boolean;
    /** Names of the OBJECTS a notification carries as payload */
    objects?: string[];
}

export interface ParsedMib {
    /** Name of the MODULE-IDENTITY, for example `TELTONIKA-MIB` */
    module: string;
    objects: { [name: string]: MibObject };
    /** Definitions whose OID could not be resolved, mapped to their raw specification */
    unresolved: { [name: string]: string };
}

/**
 * Roots every MIB may reference without importing them. Without these seeds nothing anchored at `enterprises`
 * would ever resolve, because that name is only ever imported, never defined.
 */
const WELL_KNOWN_ROOTS: { [name: string]: string } = {
    ccitt: '0',
    iso: '1',
    org: '1.3',
    dod: '1.3.6',
    internet: '1.3.6.1',
    directory: '1.3.6.1.1',
    mgmt: '1.3.6.1.2',
    'mib-2': '1.3.6.1.2.1',
    transmission: '1.3.6.1.2.1.10',
    experimental: '1.3.6.1.3',
    private: '1.3.6.1.4',
    enterprises: '1.3.6.1.4.1',
    security: '1.3.6.1.5',
    snmpV2: '1.3.6.1.6',
    snmpDomains: '1.3.6.1.6.1',
    snmpProxys: '1.3.6.1.6.2',
    snmpModules: '1.3.6.1.6.3',
};

/** Clauses that may follow SYNTAX and therefore terminate it */
const CLAUSE_AFTER_SYNTAX = 'UNITS|MAX-ACCESS|ACCESS|STATUS|DESCRIPTION|REFERENCE|INDEX|AUGMENTS|DEFVAL';

/**
 * Replace every quoted string with a placeholder. DESCRIPTION texts routinely contain `--`, braces and even
 * `::=`, all of which would otherwise be mistaken for syntax by the parsing below.
 */
function maskStrings(source: string): { text: string; strings: string[] } {
    const strings: string[] = [];
    const text = source.replace(/"[^"]*"/g, match => {
        strings.push(match.slice(1, -1));
        return `"@@STR${strings.length - 1}@@"`;
    });
    return { text, strings };
}

function unmaskString(value: string | undefined, strings: string[]): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    const match = /@@STR(\d+)@@/.exec(value);
    if (!match) {
        return value;
    }
    return strings[parseInt(match[1], 10)]?.replace(/\s+/g, ' ').trim();
}

/** ASN.1 comments run from `--` to the end of the line. Only safe to call once strings are masked. */
function stripComments(text: string): string {
    return text.replace(/--[^\n]*/g, ' ');
}

/**
 * Split an OID specification such as `enterprises 48690` or `iso org(3) dod(6)` into its elements. Symbolic
 * names are kept as strings, everything numeric becomes a number.
 */
function parseOidSpec(spec: string): (string | number)[] {
    return spec
        .trim()
        .split(/\s+/)
        .filter(token => token.length)
        .map(token => {
            const named = /^[A-Za-z][\w-]*\((\d+)\)$/.exec(token);
            if (named) {
                return parseInt(named[1], 10);
            }
            if (/^\d+$/.test(token)) {
                return parseInt(token, 10);
            }
            return token;
        });
}

/** Resolve a specification against the names known so far, or null while its anchor is still unknown. */
function resolveSpec(spec: (string | number)[], known: { [name: string]: string }): string | null {
    if (!spec.length) {
        return null;
    }
    const parts: string[] = [];
    for (let i = 0; i < spec.length; i++) {
        const token = spec[i];
        if (typeof token === 'number') {
            parts.push(String(token));
            continue;
        }
        // A symbolic name can only anchor the specification, never appear in the middle of it
        if (i > 0) {
            return null;
        }
        const base = known[token];
        if (base === undefined) {
            return null;
        }
        parts.push(base);
    }
    return parts.join('.');
}

function collapse(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

interface Definition {
    name: string;
    spec: (string | number)[];
    object?: MibObject;
}

/** Pull SYNTAX, ACCESS, DESCRIPTION and INDEX out of an OBJECT-TYPE body. */
function parseObjectBody(name: string, body: string, strings: string[]): MibObject {
    const object: MibObject = { name, oid: '' };

    const syntax = new RegExp(`\\bSYNTAX\\s+([\\s\\S]*?)(?=\\b(?:${CLAUSE_AFTER_SYNTAX})\\b|$)`).exec(body);
    if (syntax) {
        object.syntax = collapse(syntax[1]);
        if (/^SEQUENCE\s+OF\b/.test(object.syntax)) {
            object.table = true;
        }
    }

    const access = /\b(?:MAX-ACCESS|ACCESS)\s+([\w-]+)/.exec(body);
    if (access) {
        object.access = access[1];
    }

    const description = /\bDESCRIPTION\s+"?(@@STR\d+@@)"?/.exec(body);
    if (description) {
        object.description = unmaskString(description[1], strings);
    }

    const index = /\bINDEX\s*\{([^}]*)\}/.exec(body);
    if (index) {
        object.index = index[1]
            .split(',')
            .map(entry => entry.replace(/\bIMPLIED\b/, '').trim())
            .filter(entry => entry.length);
    }

    // OBJECTS is what a NOTIFICATION-TYPE carries; the varbinds of an incoming trap follow this order
    const objects = /\bOBJECTS\s*\{([^}]*)\}/.exec(body);
    if (objects) {
        object.objects = objects[1]
            .split(',')
            .map(entry => entry.trim())
            .filter(entry => entry.length);
    }

    return object;
}

export function parseMib(source: string): ParsedMib {
    const { text: masked, strings } = maskStrings(source);
    const text = stripComments(masked);

    const known: { [name: string]: string } = { ...WELL_KNOWN_ROOTS };
    const definitions: Definition[] = [];
    let module = '';

    const moduleIdentity = /([A-Za-z][\w-]*)\s+MODULE-IDENTITY\b[\s\S]*?::=\s*\{([^}]*)\}/g;
    for (let match = moduleIdentity.exec(text); match; match = moduleIdentity.exec(text)) {
        definitions.push({ name: match[1], spec: parseOidSpec(match[2]) });
    }

    // The module name is the identifier in front of DEFINITIONS, not the MODULE-IDENTITY symbol
    const header = /([A-Za-z][\w-]*)\s+DEFINITIONS\s*::=\s*BEGIN/.exec(text);
    if (header) {
        module = header[1];
    }

    const objectIdentifier = /([A-Za-z][\w-]*)\s+OBJECT\s+IDENTIFIER\s*::=\s*\{([^}]*)\}/g;
    for (let match = objectIdentifier.exec(text); match; match = objectIdentifier.exec(text)) {
        definitions.push({ name: match[1], spec: parseOidSpec(match[2]) });
    }

    const objectIdentity = /([A-Za-z][\w-]*)\s+OBJECT-IDENTITY\b[\s\S]*?::=\s*\{([^}]*)\}/g;
    for (let match = objectIdentity.exec(text); match; match = objectIdentity.exec(text)) {
        definitions.push({ name: match[1], spec: parseOidSpec(match[2]) });
    }

    // Non-greedy up to the first `::=`, so an enumeration inside SYNTAX never swallows the assignment
    const objectType = /([A-Za-z][\w-]*)\s+OBJECT-TYPE\b([\s\S]*?)::=\s*\{([^}]*)\}/g;
    for (let match = objectType.exec(text); match; match = objectType.exec(text)) {
        definitions.push({
            name: match[1],
            spec: parseOidSpec(match[3]),
            object: parseObjectBody(match[1], match[2], strings),
        });
    }

    // What the device sends on its own. Needed to name an incoming trap instead of logging a bare OID.
    const notificationType = /([A-Za-z][\w-]*)\s+NOTIFICATION-TYPE\b([\s\S]*?)::=\s*\{([^}]*)\}/g;
    for (let match = notificationType.exec(text); match; match = notificationType.exec(text)) {
        const object = parseObjectBody(match[1], match[2], strings);
        object.notification = true;
        definitions.push({ name: match[1], spec: parseOidSpec(match[3]), object });
    }

    // Definitions may reference names declared further down, so resolve repeatedly until nothing moves
    let progressed = true;
    while (progressed) {
        progressed = false;
        for (const definition of definitions) {
            if (known[definition.name] !== undefined) {
                continue;
            }
            const oid = resolveSpec(definition.spec, known);
            if (oid !== null) {
                known[definition.name] = oid;
                progressed = true;
            }
        }
    }

    const objects: { [name: string]: MibObject } = {};
    const unresolved: { [name: string]: string } = {};
    for (const definition of definitions) {
        const oid = known[definition.name];
        if (oid === undefined) {
            unresolved[definition.name] = definition.spec.join(' ');
            continue;
        }
        if (definition.object) {
            definition.object.oid = oid;
            objects[definition.name] = definition.object;
        }
    }

    return { module, objects, unresolved };
}

/** Numeric OID of a named object, or undefined when the MIB does not define it. */
export function oidOf(mib: ParsedMib, name: string): string | undefined {
    return mib.objects[name]?.oid;
}

/**
 * Columns of a table, keyed by column name. Teltonika exposes per-port statistics this way, and the row object
 * sits between the table and its columns, hence the two-step lookup.
 */
export function columnsOf(mib: ParsedMib, tableName: string): MibObject[] {
    const table = mib.objects[tableName];
    if (!table?.table) {
        return [];
    }
    const row = Object.values(mib.objects).find(
        object => object.index?.length && object.oid.startsWith(`${table.oid}.`),
    );
    if (!row) {
        return [];
    }
    return Object.values(mib.objects).filter(object => object.oid.startsWith(`${row.oid}.`));
}
