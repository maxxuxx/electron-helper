# `electron-helper/main`

Main-process helper aggregate for Electron apps

Use this entrypoint when you want all currently available main-process helpers from one import path

```ts
import {
  createSettingsStore,
  getEnv,
  isProduction,
  quitWhenAllWindowsClosed,
  registerUpdaterBridge,
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
| `settings` helpers | `electron-helper/main/settings` | JSON-backed Electron settings helpers |
| `state` helpers | `electron-helper/main/state` | Electron runtime state helpers |
| `updater` helpers | `electron-helper/main/updater` | Main-process updater bridge helpers |
| `window` helpers | `electron-helper/main/window` | BrowserWindow visibility and focus helpers |

## Usage

```ts
import { app, BrowserWindow } from 'electron';
import {
  centerWindow,
  createExternalOpenHandler,
  createSettingsStore,
  isProduction,
  quitWhenAllWindowsClosed,
  registerUpdaterBridge,
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
registerUpdaterBridge({
  autoDownload: false,
  getWindows  : () => BrowserWindow.getAllWindows()
});

const apiUrl = getEnv('API_URL');
const preload = resolveCurrentDir(import.meta.url, 'preload.js');
const settings = createSettingsStore({
  defaults: () => ({
    theme: 'system'
  })
});

mainWindow = new BrowserWindow({
  show: false,
  webPreferences: {
    preload
  }
});

centerWindow(mainWindow, {
  size: { width: 1000, height: 700 }
});
settings.read();
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
import { createSettingsStore } from 'electron-helper/main/settings';
import { isProduction } from 'electron-helper/main/state';
import { registerUpdaterBridge } from 'electron-helper/main/updater';
import { centerWindow, focusWindow } from 'electron-helper/main/window';
import { setUseDevTools } from 'electron-helper/main/window/devtools';
import { getEnv } from 'electron-helper/node/env';
import { resolveCurrentDir } from 'electron-helper/node/path/current';
```

Direct imports keep the callsite explicit and avoid pulling unrelated helper names into the file
