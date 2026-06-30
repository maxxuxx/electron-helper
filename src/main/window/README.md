# `electron-helper/main/window`

BrowserWindow visibility, focus, and bounds helpers for Electron main-process code

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `activeWindow()` | Function | Returns the currently focused usable BrowserWindow |
| `focusWindow(window?)` | Function | Short alias for `showAndFocusWindow` |
| `centerWindow(window?, options?)` | Function | Centers an existing BrowserWindow on its matching display |
| `getCenteredBounds(window, options?)` | Function | Calculates centered bounds without applying them |
| `setExternalOpenHandler(window?, options?)` | Function | Registers a safe external URL handler on an existing BrowserWindow |
| `setUseDevTools(window, enabled, options?)` | Function | Opens or closes BrowserWindow DevTools |
| `setWindowShowWhenReady(window?)` | Function | Sets a BrowserWindow to show when Electron emits `ready-to-show` |
| `showAndFocusWindow(window?)` | Function | Restores, shows, and focuses an existing BrowserWindow |
| `showWhenReady(window?)` | Function | Short alias for `setWindowShowWhenReady` |
| `showWindowWhenReady(window?)` | Function | Backward-compatible alias for `setWindowShowWhenReady` |
| `MaybeBrowserWindow` | Type | `BrowserWindow | null | undefined` helper type |

## Usage

```ts
import { app, BrowserWindow } from 'electron';
import {
  centerWindow,
  focusWindow,
  setExternalOpenHandler,
  setUseDevTools,
  setWindowShowWhenReady
} from 'electron-helper/main/window';

let mainWindow: BrowserWindow | null = null;

mainWindow = new BrowserWindow({ show: false });
centerWindow(mainWindow, {
  size: { width: 1000, height: 700 }
});
setWindowShowWhenReady(mainWindow);
setUseDevTools(mainWindow, process.env.NODE_ENV === 'development', {
  mode: 'detach'
});
setExternalOpenHandler(mainWindow, {
  allowedHosts    : ['example.com'],
  allowedProtocols: ['https:']
});

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

## Focused DevTools Import

```ts
import { setUseDevTools } from 'electron-helper/main/window/devtools';
```
