# `electron-helper/main`

Main-process helper aggregate for Electron apps

Use this entrypoint when you want all currently available main-process helpers from one import path

```ts
import {
  getEnv,
  isProduction,
  quitWhenAllWindowsClosed,
  resolveAppPath,
  setUseDevTools,
  setSingleInstance,
  setWindowShowWhenReady
} from 'electron-helper/main';
```

## Exports

| Export | Source | Description |
| --- | --- | --- |
| `app` helpers | `electron-helper/main/app` | App lifecycle helpers |
| `path` helpers | `electron-helper/main/path` | Electron app path helpers |
| `shell` helpers | `electron-helper/main/shell` | Safe external URL open handler helpers |
| `state` helpers | `electron-helper/main/state` | Electron runtime state helpers |
| `window` helpers | `electron-helper/main/window` | BrowserWindow visibility and focus helpers |

## Usage

```ts
import { app, BrowserWindow } from 'electron';
import {
  centerWindow,
  createExternalOpenHandler,
  isProduction,
  quitWhenAllWindowsClosed,
  resolveAppPath,
  setUseDevTools,
  setSingleInstance,
  setWindowShowWhenReady
} from 'electron-helper/main';
import { getEnv } from 'electron-helper/node/env';
import { resolveCurrentDir } from 'electron-helper/node/path/current';

let mainWindow: BrowserWindow | null = null;

setSingleInstance(() => mainWindow);
quitWhenAllWindowsClosed();

const apiUrl = getEnv('API_URL');
const preload = resolveCurrentDir(import.meta.url, 'preload.js');

mainWindow = new BrowserWindow({
  show: false,
  webPreferences: {
    preload
  }
});

centerWindow(mainWindow, {
  size: { width: 1000, height: 700 }
});
setWindowShowWhenReady(mainWindow);

mainWindow.webContents.setWindowOpenHandler(
  createExternalOpenHandler({
    allowedHosts    : ['example.com'],
    allowedProtocols: ['https:']
  })
);

setUseDevTools(mainWindow, !isProduction());

await app.whenReady();
await mainWindow.loadURL(apiUrl ?? 'http://localhost:5173');
```

## When to import submodules directly

Prefer direct subpath imports when a file only needs one module

```ts
import { setSingleInstance } from 'electron-helper/main/app';
import { resolveAppPath } from 'electron-helper/main/path';
import { createExternalOpenHandler } from 'electron-helper/main/shell';
import { isProduction } from 'electron-helper/main/state';
import { centerWindow, focusWindow } from 'electron-helper/main/window';
import { setUseDevTools } from 'electron-helper/main/window/devtools';
import { getEnv } from 'electron-helper/node/env';
import { resolveCurrentDir } from 'electron-helper/node/path/current';
```

Direct imports keep the callsite explicit and avoid pulling unrelated helper names into the file
