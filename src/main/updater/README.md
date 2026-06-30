# `electron-helper/main/updater`

Main-process updater bridge for Electron update UI

Use this module to connect `electron-updater` events to renderer windows through a typed IPC bridge

## Install

```bash
npm install electron-updater
```

`electron-updater` is an optional peer dependency. Install it in apps that use this module

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `registerUpdaterBridge(options)` | Function | Registers updater event listeners, IPC handlers, and window broadcasts |
| `UpdaterBridgeOptions` | Type | Options for updater bridge registration |
| `UpdaterTargetWindow` | Type | BrowserWindow-compatible broadcast target |
| `RegisteredUpdaterBridge` | Type | Controller returned by `registerUpdaterBridge` |

## Usage

```ts
import { BrowserWindow } from 'electron';
import { registerUpdaterBridge } from 'electron-helper/main/updater';

registerUpdaterBridge({
  autoDownload: false,
  getWindows  : () => BrowserWindow.getAllWindows()
});
```

Pass `updater` only when tests or custom updater implementations need to override the default `electron-updater` `autoUpdater`

```ts
import { autoUpdater } from 'electron-updater';

registerUpdaterBridge({
  getWindows: () => BrowserWindow.getAllWindows(),
  updater   : autoUpdater
});
```
