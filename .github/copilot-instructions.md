# Copilot Instructions for ioBroker.teltonika

## Project Overview

This is an ioBroker adapter for Teltonika routers (RUT/TRB/OTD families). It reads router data such as
temperature, signal strength, operator, network state, WAN IP, uptime and digital/analog inputs over MQTT.

The adapter is written in TypeScript and acts as an **MQTT broker**, not an MQTT client: the routers are
configured to connect *to* it. The default port is **1885** so it does not clash with other ioBroker MQTT adapters.

## Repository Structure

- `src/` - TypeScript sources (compiled to `build/`)
  - `main.ts` - Adapter entry point
  - `lib/server.ts` - MQTT broker and all ioBroker object/state handling
  - `lib/topics.ts` - `SUPPORTED_TOPICS`, the definition of every supported datapoint
  - `types.d.ts` - Router type enum and adapter config interface
- `admin/` - Admin UI configuration (`jsonConfig.json`) and translations
- `test/`
  - `adapter.test.js` - Integration test: boots js-controller and a fake router
  - `lib/mqttClient.js` - MQTT client used by the test to impersonate a router
  - `package.test.js` - Validates `package.json` and `io-package.json`

## Key Concepts

### Topics

`SUPPORTED_TOPICS` in `src/lib/topics.ts` maps each router variable to an ioBroker state. Each entry has:
- `devices` - Router models that support the variable (documentation only; not evaluated at runtime)
- `common` - The ioBroker `StateCommon` used to create the object (`name`, `type`, `role`, `read`/`write`, optional `unit`/`desc`)
- `convert` - Optional transform from the raw MQTT payload string to the state value

`convert` returns `null` to represent the routers' `"N/A"` payloads.

### MQTT Message Processing

Routers do not push data on their own - the adapter polls them:
- The adapter publishes `router/get` with the wanted variable name as payload
- On connect it first asks for `id`; the router answers on `router/id` with its serial
- Once the serial is known, a channel is created and the poll timer starts (`pollInterval`, default 5000 ms)
- Each further variable is answered on `router/<serial>/<variable>`
- `receivedTopic()` resolves the last path segment against `SUPPORTED_TOPICS`, applies `convert` and writes the state

States are created lazily under `teltonika.<instance>.<serial>.<variable>`, plus `alive` and the derived
`uptimeStr`. `info.connection` holds a comma-separated list of connected client IDs, not a boolean.

### Testing

`test/adapter.test.js` starts a real js-controller and a fake router that answers `router/get` requests from a
table of sample payloads. It verifies that states are created with the converted values and that a router
reconnect is reflected in `info.connection`. Run `npm run build` first - the test starts the compiled adapter.

## Development Guidelines

1. **Adding New Datapoints**: Add an entry to `SUPPORTED_TOPICS` in `src/lib/topics.ts`. Object creation,
   conversion and polling are all driven from that map, so `server.ts` normally needs no change.
2. **Testing**: Mirror the new key in the `SUPPORTED_TOPICS` table in `test/adapter.test.js` - the fake router
   throws on requests it does not know - and add an assertion for the converted value.
3. **Documentation**: List new datapoints in the feature list in `README.md`.
4. **Translations**: Update `admin/i18n/*/translations.json` (`npx translate-adapter` regenerates them from English).
5. **Changelog**: Add entries to `README.md` under `### **WORK IN PROGRESS**`. DO NOT modify the `news` section
   of `io-package.json` - it is generated during releases.

## Code Style

- TypeScript with `strict` and `strictNullChecks` enabled
- Formatting and linting come from `@iobroker/eslint-config` (includes Prettier); run `npm run lint`
- Linting covers `src/` only - `test/`, `admin/`, `build/` and `*.mjs` are ignored
- Follow existing patterns for consistency and add comments for non-obvious protocol handling

## Testing Strategy

- Integration tests validate end-to-end MQTT polling and state creation
- Use realistic router payloads, including `"N/A"` for unavailable inputs
- Cover conversion edge cases (unparsable numbers, `"N/A"`) alongside the happy path
