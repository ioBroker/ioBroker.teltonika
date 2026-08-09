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

## Conventions

- Changelog entries go in `README.md` under a `### **WORK IN PROGRESS**` heading (the placeholder comment above the Changelog section marks the spot). Do **not** hand-edit the `news` block in `io-package.json` — the release script generates it from the README and bumps versions in both files.
- `password` is listed in `encryptedNative`/`protectedNative`; the integration test therefore has to encrypt the configured password with the legacy XOR scheme against `system.config.native.secret` before writing the instance config.
- ESLint (`@iobroker/eslint-config`, includes Prettier) covers only `src/` — `test/`, `admin/`, `build/` and `*.mjs` are ignored.
- Node >= 20 in `package.json`; CI matrix runs 22/24/26.
