# `electron-helper/main/path/electron`

Electron app path resolvers

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `resolveAppPath(...segments)` | Function | Resolves path segments from Electron's app path |
| `resolveElectronPath(name, ...segments)` | Function | Resolves path segments from an Electron named app path |
| `ElectronPathName` | Type | Name type accepted by Electron's `app.getPath` |

## Usage

```ts
import {
  resolveAppPath,
  resolveElectronPath
} from 'electron-helper/main/path/electron';

const assetPath = resolveAppPath('assets', 'logo.png');
const settingsPath = resolveElectronPath('userData', 'settings.json');
```

Use `resolveAppPath` for files under `app.getAppPath()`

Use `resolveElectronPath` for named Electron paths such as `userData`, `logs`, or `documents`
