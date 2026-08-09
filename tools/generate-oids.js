'use strict';
/**
 * Turns the MIB files a device offers under SNMP -> System Summary into a checked-in OID table.
 *
 *   npm run generate-oids [-- <mib-dir> ]
 *
 * The device family is taken from the file name, which must keep the firmware naming Teltonika uses
 * (`RUTC_R_00.07.24.1.mib` -> family `RUTC`). That is the same prefix the adapter reads back from `fwVersion`
 * at runtime, which is how a polled device finds its table.
 *
 * Why generate instead of resolving MIBs at runtime: the same OID means different things on different families.
 * On a RUTC `.8.2.1.4` is `pVlanVID`, on a TSW202 it is `pVlanPortsUntag`. A single shared table would report
 * wrong values without ever raising an error.
 */
const fs = require('node:fs');
const path = require('node:path');

const { parseMib } = require('../build/lib/snmp/mib.js');
const { TOPIC_ALIASES, TABLE_ALIASES, BRANCH_SCALARS } = require('../build/lib/snmp/aliases.js');

const ROOT = path.join(__dirname, '..');
const MIB_DIR = process.argv[2] || path.join(ROOT, 'MIBs');
const TARGET = path.join(ROOT, 'src', 'lib', 'snmp', 'oids.generated.ts');

/** `RUTC_R_00.07.24.1.mib` -> `RUTC`, matching the prefix of the `fwVersion` object */
function familyOf(file) {
    const match = /^([A-Za-z0-9]+)_R_/.exec(path.basename(file));
    return match ? match[1] : path.basename(file, path.extname(file));
}

/** Locate the conceptual row an object belongs to, or null when it is a plain scalar. */
function rowOf(objects, object) {
    for (const row of objects) {
        if (row.index?.length && object.oid.startsWith(`${row.oid}.`)) {
            return row;
        }
    }
    return null;
}

function tableOfRow(objects, row) {
    return objects.find(object => object.table && row.oid.startsWith(`${object.oid}.`)) || null;
}

function collect(file) {
    const mib = parseMib(fs.readFileSync(file, 'utf8'));
    const objects = Object.values(mib.objects);
    const family = familyOf(file);

    const scalars = {};
    const rows = {};
    const tables = {};
    const missing = [];

    for (const [topic, names] of Object.entries(TOPIC_ALIASES)) {
        const name = names.find(candidate => mib.objects[candidate]);
        if (!name) {
            missing.push(topic);
            continue;
        }
        const object = mib.objects[name];
        const row = rowOf(objects, object);
        if (row) {
            const table = tableOfRow(objects, row);
            const key = table ? table.name : row.name;
            rows[key] ||= {};
            rows[key][topic] = object.oid;
        } else {
            scalars[topic] = object.oid;
        }
    }

    for (const [tableName, alias] of Object.entries(TABLE_ALIASES)) {
        const table = mib.objects[tableName];
        if (!table?.table) {
            continue;
        }
        const row = objects.find(object => object.index?.length && object.oid.startsWith(`${table.oid}.`));
        if (!row) {
            continue;
        }
        const present = new Map(
            objects.filter(object => object.oid.startsWith(`${row.oid}.`)).map(object => [object.name, object.oid]),
        );
        if (!present.has(alias.rowName)) {
            // Without its naming column the table cannot be addressed stably, so skip it rather than fall back
            // to the SNMP index, which shifts when the device is reconfigured.
            console.warn(`  ! ${tableName}: no "${alias.rowName}" column, skipped`);
            continue;
        }
        // Only aliased columns become states, keyed by the ioBroker name rather than the MIB name
        const columns = {};
        for (const [column, state] of Object.entries(alias.columns)) {
            const oid = present.get(column);
            if (oid) {
                columns[state] = oid;
            }
        }
        tables[tableName] = {
            channel: alias.channel,
            branch: alias.branch,
            oid: table.oid,
            rowName: present.get(alias.rowName),
            label: alias.label ? present.get(alias.label) : undefined,
            index: row.index.join('.'),
            columns,
        };
    }

    // Scalars of the optional branches, resolved the same way as the fixed datapoints
    const branches = {};
    for (const [branch, states] of Object.entries(BRANCH_SCALARS)) {
        const resolved = {};
        for (const [state, names] of Object.entries(states)) {
            const name = names.find(candidate => mib.objects[candidate]);
            if (name) {
                resolved[state] = mib.objects[name].oid;
            }
        }
        if (Object.keys(resolved).length) {
            branches[branch] = resolved;
        }
    }

    // What the device may send on its own, so an incoming trap can be named instead of logged as a bare OID
    const notifications = {};
    for (const object of objects) {
        if (object.notification) {
            notifications[object.name] = object.oid;
        }
    }

    return {
        family,
        source: path.basename(file),
        module: mib.module,
        scalars,
        rows,
        tables,
        branches,
        notifications,
        missing,
    };
}

function quote(value) {
    return `'${String(value).replace(/'/g, "\\'")}'`;
}

function renderMap(map, indent) {
    const pad = ' '.repeat(indent);
    const keys = Object.keys(map).sort();
    if (!keys.length) {
        return '{}';
    }
    return `{\n${keys.map(key => `${pad}${key}: ${quote(map[key])},`).join('\n')}\n${' '.repeat(indent - 4)}}`;
}

function render(families) {
    const lines = [];
    lines.push('// AUTOMATICALLY GENERATED by tools/generate-oids.js -- do not edit by hand.');
    lines.push('// Regenerate with `npm run generate-oids` after adding or refreshing a MIB file.');
    lines.push('');
    lines.push('export interface FamilyTable {');
    lines.push('    /** Channel the rows are created under, for example `ports` */');
    lines.push('    channel: string;');
    lines.push('    /** Only polled when the user switched this branch on. Absent means always polled. */');
    lines.push('    branch?: string;');
    lines.push('    oid: string;');
    lines.push('    /** OID of the column whose value names each row, preferred over the volatile SNMP index */');
    lines.push('    rowName: string;');
    lines.push('    /** OID of the column shown as `common.name` */');
    lines.push('    label?: string;');
    lines.push('    /** INDEX clause of the conceptual row, dot separated when it is composite */');
    lines.push('    index: string;');
    lines.push('    /** ioBroker state name to the OID of the column carrying it */');
    lines.push('    columns: { [state: string]: string };');
    lines.push('}');
    lines.push('');
    lines.push('export interface FamilyOids {');
    lines.push('    family: string;');
    lines.push('    /** MIB file this entry was generated from */');
    lines.push('    source: string;');
    lines.push('    /** Datapoint to OID of a scalar object, polled as `<oid>.0` */');
    lines.push('    scalars: { [topic: string]: string };');
    lines.push('    /** Table name to its datapoints, polled as `<oid>.<rowIndex>` */');
    lines.push('    rows: { [table: string]: { [topic: string]: string } };');
    lines.push('    tables: { [table: string]: FamilyTable };');
    lines.push('    /** Scalars of the optional branches, polled as `<oid>.0` when the branch is enabled */');
    lines.push('    branches: { [branch: string]: { [state: string]: string } };');
    lines.push('    /** Notification name to its OID, used to name an incoming trap */');
    lines.push('    notifications: { [name: string]: string };');
    lines.push('    /** Datapoints this family does not expose over SNMP */');
    lines.push('    missing: string[];');
    lines.push('}');
    lines.push('');
    lines.push('export const FAMILY_OIDS: { [family: string]: FamilyOids } = {');

    for (const entry of families.sort((a, b) => a.family.localeCompare(b.family))) {
        lines.push(`    ${entry.family}: {`);
        lines.push(`        family: ${quote(entry.family)},`);
        lines.push(`        source: ${quote(entry.source)},`);
        lines.push(`        scalars: ${renderMap(entry.scalars, 12)},`);
        const rowTables = Object.keys(entry.rows).sort();
        lines.push(rowTables.length ? '        rows: {' : '        rows: {},');
        for (const table of rowTables) {
            lines.push(`            ${table}: ${renderMap(entry.rows[table], 16)},`);
        }
        if (rowTables.length) {
            lines.push('        },');
        }
        const tableNames = Object.keys(entry.tables).sort();
        lines.push(tableNames.length ? '        tables: {' : '        tables: {},');
        for (const name of tableNames) {
            const table = entry.tables[name];
            lines.push(`            ${name}: {`);
            lines.push(`                channel: ${quote(table.channel)},`);
            if (table.branch) {
                lines.push(`                branch: ${quote(table.branch)},`);
            }
            lines.push(`                oid: ${quote(table.oid)},`);
            lines.push(`                rowName: ${quote(table.rowName)},`);
            if (table.label) {
                lines.push(`                label: ${quote(table.label)},`);
            }
            lines.push(`                index: ${quote(table.index)},`);
            lines.push(`                columns: ${renderMap(table.columns, 20)},`);
            lines.push('            },');
        }
        if (tableNames.length) {
            lines.push('        },');
        }
        const branchNames = Object.keys(entry.branches).sort();
        lines.push(branchNames.length ? '        branches: {' : '        branches: {},');
        for (const branch of branchNames) {
            lines.push(`            ${branch}: ${renderMap(entry.branches[branch], 16)},`);
        }
        if (branchNames.length) {
            lines.push('        },');
        }
        lines.push(`        notifications: ${renderMap(entry.notifications, 12)},`);
        lines.push(`        missing: [${entry.missing.sort().map(quote).join(', ')}],`);
        lines.push('    },');
    }

    lines.push('};');
    lines.push('');
    return lines.join('\n');
}

const files = fs
    .readdirSync(MIB_DIR)
    .filter(file => /\.(mib|txt)$/i.test(file))
    .map(file => path.join(MIB_DIR, file));

if (!files.length) {
    console.error(`No MIB files in ${MIB_DIR}`);
    process.exit(1);
}

const families = [];
for (const file of files) {
    const entry = collect(file);
    const rowValues = Object.values(entry.rows).reduce((sum, row) => sum + Object.keys(row).length, 0);
    const missing = entry.missing.length ? `, missing: ${entry.missing.join(', ')}` : '';
    console.log(
        `${entry.source} -> ${entry.family}: ${Object.keys(entry.scalars).length} scalars, ${rowValues} row values, ${Object.keys(entry.tables).length} tables${missing}`,
    );
    families.push(entry);
}

fs.writeFileSync(TARGET, render(families), 'utf8');
console.log(`\nwrote ${path.relative(ROOT, TARGET)}`);
