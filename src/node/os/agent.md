## OS Module Rules

- Keep this module import-safe in plain Node.js and Electron runtimes
- Do not import `electron` from this module
- Prefer small direct checks over runtime detection abstractions
- Keep exported helpers deterministic by accepting an optional `NodeJS.Platform` value when useful for tests
- Keep hardware UUID behavior in the `hardware` submodule because it runs host-specific commands or file reads
