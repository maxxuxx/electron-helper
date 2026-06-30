## Node Updater Bridge Types

- Keep this module Electron-free and safe for Node, main, preload, renderer, tests, and build tooling
- Export only serializable updater DTOs, channel names, and adapter types
- Do not import `electron-updater` here because it is an optional peer dependency
- Preserve `UpdaterState` as the renderer contract and convert unknown external payloads through serializer helpers
