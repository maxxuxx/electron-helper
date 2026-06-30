## Preload Updater Bridge

- Keep this module focused on `contextBridge` exposure and IPC wrapping
- Never expose `ipcRenderer` itself to renderer code
- Use channel names from `electron-helper/node/updater`
- Keep the default exposed key as `updater` and allow custom keys through options
