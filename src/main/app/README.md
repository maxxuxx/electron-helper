# `electron-helper/main/app`

Application lifecycle helpers for Electron main-process code

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `setSingleInstance(window?)` | Function | Requests Electron's single-instance lock and focuses the provided window on later launches |
| `SingleInstanceWindowSource` | Type | `BrowserWindow | null | undefined | (() => BrowserWindow | null | undefined)` helper type |
| `quitWhenAllWindowsClosed(options?)` | Function | Quits the app when Electron emits `window-all-closed`, except on macOS by default |
| `QuitWhenAllWindowsClosedOptions` | Type | Options for macOS quit behavior |

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

Quit after the last window closes, while keeping the usual macOS behavior

```ts
import { quitWhenAllWindowsClosed } from 'electron-helper/main/app';

quitWhenAllWindowsClosed();
```

Quit on macOS too when your app needs that behavior

```ts
quitWhenAllWindowsClosed({ quitOnDarwin: true });
```
