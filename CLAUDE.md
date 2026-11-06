# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # tsc -p tsconfig.build.json  →  src/ into build/
npm run lint           # eslint -c eslint.config.mjs
npm test               # alias for test:integration
npm run test:integration   # mocha test/adapter.test.js --exit
npm run test:package       # validates package.json / io-package.json consistency

npx mocha test/adapter.test.js --exit --grep "reconnection"   # single test case
npx translate-adapter                                          # regenerate admin/i18n from English
npm run update-oui                                             # refresh data/oui.txt (MAC manufacturers) from the IEEE
npm run release-patch                                          # @alcalzone/release-script (also minor/major)
```

`npm run build` before running the integration test — `package.json` `main` points at `build/main.js`, and the test starts a real adapter process.

The root `tsconfig.json` sets `noEmit: true` and exists only for editor/type-check support (`npx tsc` type-checks, emits nothing). `tsconfig.build.json` flips `noEmit` off and is the only config that produces output.

The integration test downloads and boots a real `js-controller` via `@iobroker/legacy-testing` on first run — budget several minutes (the `before` hook allows 600 s).

## Architecture

This ioBroker adapter is an **MQTT broker**, not an MQTT client. Teltonika routers are configured to connect *to* it (default port **1885**, chosen to avoid clashing with other ioBroker MQTT adapters). It is built on a raw `node:net` `Server` wrapped per-socket by `mqtt-connection` — there is no MQTT library abstraction, so every packet type (`publish`, `puback`, `pubrec`, `pubrel`, `pubcomp`, `subscribe`, `pingreq`) is handled by hand in `src/lib/server.ts`.

Three source files carry everything:

- `src/main.ts` — thin `Adapter` subclass. On `ready` it walks all existing states, forces every `*.alive` to `false`, then constructs the server. On `unload` it destroys it.
- `src/lib/server.ts` — the broker plus all ioBroker object/state writing.
- `src/lib/topics.ts` — `SUPPORTED_TOPICS`, the single source of truth for which datapoints exist.

### Request/response protocol

The routers do not push data on their own; the adapter **polls** them over MQTT:

1. Router connects → adapter publishes `router/get` with payload `id`.
2. Router replies on topic `router/id` with its serial. This sets `client.routerId`, creates the channel object, and starts the poll timer (`pollInterval`, default 5000 ms).
3. Each poll tick publishes `router/get` once per key in `SUPPORTED_TOPICS`, and the router answers on `router/<serial>/<key>`.
4. `receivedTopic()` takes the **last path segment** of the incoming topic, looks it up in `SUPPORTED_TOPICS`, applies `convert` if present, and writes the state.

`client.states[topic]` is a small `requested`/`received` state machine that prevents re-requesting a topic that is still outstanding. The poll timer is global (started on the first router that reports an id, cleared only when no clients remain).

### Object layout

```
teltonika.<n>.info.connection    string — COMMA-SEPARATED LIST of connected client IDs, not a boolean
teltonika.<n>.<routerId>         channel
teltonika.<n>.<routerId>.alive   boolean, created lazily on first packet
teltonika.<n>.<routerId>.<topic> one per SUPPORTED_TOPICS key
teltonika.<n>.<routerId>.uptimeStr  derived state, written alongside `uptime` (see seconds2time)
```

Objects are created on demand and memoised in `cacheAddedObjects`, so a datapoint only appears once its router has actually reported it.

### Adding a datapoint

Add an entry to `SUPPORTED_TOPICS` in `src/lib/topics.ts` (`devices`, `common`, optional `convert`). Nothing else in `server.ts` needs to change — creation, conversion and polling are all driven from that map. A `convert` returning `null` writes a `null` state; this is how routers' `"N/A"` payloads are represented. Then mirror the new key in the mock `SUPPORTED_TOPICS` in `test/adapter.test.js` (the fake router only answers keys it knows, and throws otherwise) and in the feature list in `README.md`.

Note that the `devices` array on each topic is currently **documentation only** — nothing reads it, and the `routerType` config field is likewise unused by the server. Every connected router is polled for every topic regardless of model.

### Client identity

`client.__secret` (timestamp + random) distinguishes sockets when a router reconnects on the same client ID before the old socket is torn down; every packet handler compares it against the registered client and ignores stale sockets. `client.iobId` is the client ID with `FORBIDDEN_CHARS` replaced — ioBroker object IDs cannot contain `[]*,;'"\`<>\\?`.

### Presence (`src/lib/presence.ts`)

Persons like fb-checkpresence, with the **same object tree as ioBroker.tr-064** (`presence.persons.<name>`, `presence.groups.<group>`, `presence.guests`, `presence.unknown`, summary states on `presence`) - the vis-2 and devices widgets of both adapters rely on it, so keep the two in sync. A row of `presenceDevices` is a person: `name`, `group`, `mac` (several, comma separated, `splitMacs()`), `grace`.

- The SNMP poller hands every association list to `report(deviceId, clients)`; the tracker keeps the last list per device for guests (SSID in `presenceGuestSsids`) and unknown stations. Never a state per observed MAC - only counts and one JSON list.
- A person is present while one of its MACs was seen within its grace period. The departure is the last sighting, not the end of the grace period.
- The first determination is no event; "never seen" is only decided after the grace period, when every router had the chance to report.
- `start()` runs even without configuration: it deletes everything below `presence` that is not wanted any more (removed persons, the flat `presence.<name>.connected` layout of the first version) and takes over `present`, times, `lastSeen`, `history` and the sums of today from the stored states. Objects are written with `extendObject()`, which keeps `common.custom` (history settings).
- The channel of a person carries `native.person` = the configured name: the widgets store the name, not an object ID. Messages `presence` (`{ persons, groups }`) and `personList` (`[{ label, value }]` for `autocompleteSendTo`).

### Web components (`src-webcomponents/`)

The four vis-2 widgets as `@iobroker/web-components` (`<iob-teltonika-devices>`, `-ports`, `-person`, `-presence`), listed in `common.webComponents`. Own `package.json`; plain React + CSS in a shadow root, React taken from the host. One `vite build --mode <name>` per component, so each is one module file; the build writes the manifests and fails if one does not pass `checkManifest()`. Output `admin/webcomponents/` is committed - `npm run build:wc`, `npm run lint:wc`, `npm run check:wc`.

- The device views compile in `readInstance()`/`applyState()` of `src-devices/src/utils.ts`, the presence views `src-devices/src/presenceApi.ts` - change those and the web components follow on the next build.
- `name` of a manifest must equal the `label` of the devices widget in `common.deviceWidgets` in every language (the build checks it), so devices shows its own widget instead of the component.
- The words come from the dictionaries of `src-devices` (`telt_*`), `src-widgets` (the rest) and `src/ownWords.ts` (`wc_*`); `src/wordKeys.ts` picks the ones each module carries.

## Conventions

- Changelog entries go in `README.md` under a `### **WORK IN PROGRESS**` heading (the placeholder comment above the Changelog section marks the spot). Do **not** hand-edit the `news` block in `io-package.json` — the release script generates it from the README and bumps versions in both files.
- `password` is listed in `encryptedNative`/`protectedNative`; the integration test therefore has to encrypt the configured password with the legacy XOR scheme against `system.config.native.secret` before writing the instance config.
- ESLint (`@iobroker/eslint-config`, includes Prettier) covers only `src/` — `test/`, `admin/`, `build/` and `*.mjs` are ignored.
- Node >= 20 in `package.json`; CI matrix runs 22/24/26.
