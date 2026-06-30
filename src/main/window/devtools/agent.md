## Window DevTools Helpers

- Keep this module focused on existing `BrowserWindow` instances
- Use `setUseDevTools(window, enabled, options?)` as the public API
- Return `false` when the provided window is missing or destroyed
- Forward `OpenDevToolsOptions` only when opening DevTools
