# `electron-helper/main/settings`

JSON-backed settings helpers for Electron main processes

Use this module when an app needs a small settings store under Electron's `userData` path with default values, save, update, restore, and migration support

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `createSettingsStore(options)` | Function | Creates a JSON-backed settings store |
| `SettingsDefaults` | Type | Default settings value or factory |
| `SettingsStoreOptions` | Type | Store path, default value, and migration options |
| `SettingsStore` | Type | Store controller returned by `createSettingsStore` |

## Usage

```ts
import { createSettingsStore } from 'electron-helper/main/settings';

type AppSettings = {
  readonly schemaVersion: number;
  readonly theme: 'dark' | 'light' | 'system';
  readonly useAutoStart: boolean;
};

const settings = createSettingsStore<AppSettings>({
  defaults: () => ({
    schemaVersion: 2,
    theme        : 'system',
    useAutoStart : false
  }),
  migrate: (raw, defaults) => ({
    ...defaults,
    ...(typeof raw === 'object' && raw !== null ? raw : {}),
    schemaVersion: 2
  })
});

const currentSettings = settings.read();

settings.update((current) => ({
  ...current,
  theme: 'dark'
}));

settings.restore();
```

By default, the store writes `settings.json` inside `app.getPath('userData')`

Use `fileName`, `directory`, or `filePath` when an app needs a different location

```ts
createSettingsStore({
  defaults: () => ({ usePrinter: true }),
  fileName: 'printer-settings.json'
});
```

## Behavior

`read()` creates the file from `defaults` when it does not exist

`save(settings)` writes the full settings object and returns the same value

`update(updater)` reads the current settings, passes them to `updater`, saves the returned value, and returns it

`restore()` writes a fresh default value and returns it

When a settings file exists and `migrate` is provided, `read()` passes the parsed raw value and a fresh default value to `migrate`, saves the migrated value, and returns it

When the settings file cannot be parsed as JSON, `read()` restores defaults

This module does not validate app-specific schemas. Keep validation and shape decisions in the consuming app's `migrate` function
