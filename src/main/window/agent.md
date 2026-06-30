## Window Helpers

- Keep helpers focused on existing `BrowserWindow` instances instead of creating windows
- Return `false` when the provided window is missing or destroyed
- Use `setWindowShowWhenReady(window)` to register the `ready-to-show` show handler
- Use `setUseDevTools(window, enabled, options?)` to apply DevTools open or closed state
