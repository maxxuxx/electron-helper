# `electron-helper/main/path`

Electron app path helpers for main-process modules

This module only contains helpers that require Electron's `app` API

## Exports

| Import path | Folder | Exports |
| --- | --- | --- |
| `electron-helper/main/path` | [`./`](./) | Electron app path helpers |
| `electron-helper/main/path/electron` | [`./electron`](./electron/README.md) | `resolveAppPath`, `resolveElectronPath`, `ElectronPathName` |

## Resolve Electron paths

Use `resolveAppPath` for files under Electron's app path

```ts
import { resolveAppPath } from 'electron-helper/main/path';

const assetPath = resolveAppPath('assets', 'logo.png');
```

Use `resolveElectronPath` for named Electron paths such as `userData`, `logs`, or `documents`

```ts
import { resolveElectronPath } from 'electron-helper/main/path';

const settingsPath = resolveElectronPath('userData', 'settings.json');
const logPath = resolveElectronPath('logs', 'main.log');
```

The `name` parameter is typed from Electron's `app.getPath` names

Use `electron-helper/node/path/current` for `import.meta.url` based module paths
