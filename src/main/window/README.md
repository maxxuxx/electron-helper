# `electron-helper/main/window`

BrowserWindow visibility, focus, and bounds helpers for Electron main-process code

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `activeWindow()` | Function | Returns the currently focused usable BrowserWindow |
| `focusWindow(window?)` | Function | Short alias for `showAndFocusWindow` |
| `showWhenReady(window?)` | Function | Short alias for `showWindowWhenReady` |
| `centerWindow(window?, options?)` | Function | Centers an existing BrowserWindow on its matching display |
| `getCenteredBounds(window, options?)` | Function | Calculates centered bounds without applying them |
| `showAndFocusWindow(window?)` | Function | Restores, shows, and focuses an existing BrowserWindow |
| `showWindowWhenReady(window?)` | Function | Shows a BrowserWindow when Electron emits `ready-to-show` |
| `MaybeBrowserWindow` | Type | `BrowserWindow | null | undefined` helper type |

## Usage

```ts
import { app, BrowserWindow } from 'electron';
import {
  centerWindow,
  focusWindow,
  showWhenReady
} from 'electron-helper/main/window';

let mainWindow: BrowserWindow | null = null;

mainWindow = new BrowserWindow({ show: false });
centerWindow(mainWindow, {
  size: { width: 1000, height: 700 }
});
showWhenReady(mainWindow);

app.on('second-instance', () => {
  focusWindow(mainWindow);
});
```

Both helpers return `false` when the provided window is missing or destroyed

## Focused Bounds Import

```ts
import {
  centerWindow,
  getCenteredBounds
} from 'electron-helper/main/window/bounds';
```
