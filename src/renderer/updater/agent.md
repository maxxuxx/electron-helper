## Renderer Updater Client

- Keep this module framework-agnostic and free of Electron imports
- Consume only the preload-exposed `UpdaterBridgeApi`
- Keep `subscribe()` as the renderer UI state entrypoint and update the cached snapshot from bridge events
- Do not expose IPC channel names or `electron-updater` event names to renderer callers
