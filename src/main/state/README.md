# `electron-helper/main/state`

Runtime state helpers for Electron main processes

This module currently exposes a single helper for checking whether the app is running from a packaged Electron build

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `isProduction()` | Function | Returns whether Electron is running from a packaged app |

## Usage

```ts
import { isProduction } from 'electron-helper/main/state';

if (!isProduction()) {
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}
```

`isProduction` returns `electron.app.isPackaged`

## Behavior

Use this helper from the Electron main process after Electron is available

It does not inspect `NODE_ENV`, because packaged state is the source of truth for Electron runtime behavior
