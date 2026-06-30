## Main Updater Bridge

- Keep this module focused on main-process registration for updater events, IPC handlers, and BrowserWindow broadcasts
- Use `getWindows()` to resolve current targets at broadcast time instead of storing a stale window array
- Load `electron-updater` lazily only when a custom `updater` adapter is not provided
- Do not expose raw `electron-updater` payloads to renderer windows; serialize them through `electron-helper/node/updater`
- Return a controller with `getState()` and `unregister()` so tests and advanced apps can inspect or clean up the bridge
