# `electron-helper/main/app`

Application lifecycle helpers for Electron main-process code

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `setSingleInstance(window?)` | Function | Requests Electron's single-instance lock and focuses the provided window on later launches |
| `SingleInstanceWindowSource` | Type | `BrowserWindow | null | undefined | (() => BrowserWindow | null | undefined)` helper type |

## Usage

```ts
import { app, BrowserWindow } from 'electron';
import { setSingleInstance } from 'electron-helper/main/app';

let mainWindow: BrowserWindow | null = null;

if (setSingleInstance(() => mainWindow)) {
  await app.whenReady();

  mainWindow = new BrowserWindow();
}
```

Pass an existing window when the window is already created

```ts
setSingleInstance(mainWindow);
```

Pass a getter when the window will be assigned later

```ts
setSingleInstance(() => mainWindow);
```
