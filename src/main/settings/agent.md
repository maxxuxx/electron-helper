## Settings Helpers

- Keep this module focused on Electron main-process JSON settings storage
- Keep app-specific schemas, key names, and validation in consuming apps
- Use `createSettingsStore(options)` as the public factory API
- Default to `app.getPath('userData')` and `settings.json`
- Treat `migrate(raw, defaults)` as the only place for consumer-specific shape conversion
- Preserve `read`, `save`, `update`, and `restore` as the small core operation set
