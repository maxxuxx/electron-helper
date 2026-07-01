# `electron-helper/main/state`

Runtime state helpers for Electron main processes

This module exposes helpers for reading Electron app runtime state and metadata

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `getVersion()` | Function | Returns the current Electron app version |
| `isProduction()` | Function | Returns whether Electron is running from a packaged app |

## Usage

```ts
import { getVersion, isProduction } from 'electron-helper/main/state';

const appVersion = getVersion();

if (!isProduction()) {
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}
```

`getVersion` returns `electron.app.getVersion()`

`isProduction` returns `electron.app.isPackaged`

## Behavior

Use this helper from the Electron main process after Electron is available

It does not inspect `NODE_ENV`, because packaged state is the source of truth for Electron runtime behavior
