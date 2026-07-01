## Hardware UUID Module Rules

- Keep this module import-safe in plain Node.js and Electron runtimes
- Do not import `electron` from this module
- Use `execFile` with fixed command and argument arrays, never shell interpolation
- Do not use `/etc/machine-id` as a fallback because it is not a hardware UUID
- Return `undefined` from optional reads when commands fail, files are unreadable, or UUID output is invalid
- Keep renderer exposure out of this module because hardware identifiers should cross process boundaries only by explicit app choice
- Keep command and file adapters injectable so platform behavior remains testable without running host-specific commands
