# electron-helper

[![npm version](https://img.shields.io/npm/v/electron-helper.svg)](https://www.npmjs.com/package/electron-helper)

Small helpers for Electron apps and modules.

## Install

```bash
npm install electron-helper
```

## Main Process Helpers

Use the `main` subpath from Electron's main process:

```ts
import { getVersion, isProduction } from 'electron-helper/main/state';

console.log(getVersion());
console.log(isProduction());
```

This package is intended for Electron apps. It does not install Electron for consumers; use it from an Electron project.

## API

### `getVersion()`

Returns the current Electron app version from `app.getVersion()`

```ts
getVersion();
```

### `isProduction()`

Returns true when Electron's `app.isPackaged` is true.

```ts
isProduction();
```

### `getEnv(key)`

Loads `.env` from the current working directory once, then returns the requested value.

```ts
import { getEnv, requireEnv } from 'electron-helper/node/env';

const apiUrl = getEnv('API_URL');
const token = requireEnv('API_TOKEN');
```

Use `loadEnv({ path })` when the `.env` file lives somewhere else.

```ts
import { loadEnv } from 'electron-helper/node/env';

loadEnv({ path: '/path/to/.env' });
```

### `isMacOS()`, `isWindows()`, `isLinux()`

Checks the current Node platform without importing Electron

```ts
import { isLinux, isMacOS, isWindows } from 'electron-helper/node/os';

isMacOS();
isWindows();
isLinux();
```

### `getHardwareUuid(options?)`, `requireHardwareUuid(options?)`

Reads the raw OS-provided hardware UUID from Node-compatible Electron code without importing Electron

```ts
import { getHardwareUuid, requireHardwareUuid } from 'electron-helper/node/os/hardware';

const hardwareUuid = await getHardwareUuid();
const requiredHardwareUuid = await requireHardwareUuid();
```

`getHardwareUuid()` returns `undefined` when the platform is unsupported, the OS command fails, the Linux sysfs file is unreadable, or the UUID output is invalid

Windows uses PowerShell CIM first and falls back to WMIC, macOS reads `IOPlatformUUID` from `ioreg`, and Linux reads `/sys/class/dmi/id/product_uuid`

### `resolveCurrentDir(metaUrl, ...segments)`

Resolves path segments from a module `import.meta.url`.

```ts
import { resolveCurrentDir } from 'electron-helper/node/path/current';

const preload = resolveCurrentDir(import.meta.url, 'preload.js');
const rendererEntry = resolveCurrentDir(
  import.meta.url,
  '../../react/dist/index.html'
);
```

### `resolveAppPath(...segments)`

Resolves path segments from Electron's `app.getAppPath()`.

```ts
import { resolveAppPath } from 'electron-helper/main/path';

resolveAppPath('assets', 'logo.png');
```

### `resolveElectronPath(name, ...segments)`

Resolves path segments from one of Electron's named app paths.

```ts
import { resolveElectronPath } from 'electron-helper/main/path';

resolveElectronPath('userData', 'settings.json');
```

### `createSettingsStore(options)`

Creates a JSON-backed settings store under Electron's `userData` path by default

```ts
import { createSettingsStore } from 'electron-helper/main/settings';

const settings = createSettingsStore({
  defaults: () => ({
    theme       : 'system',
    useAutoStart: false
  }),
  migrate: (raw, defaults) => ({
    ...defaults,
    ...(typeof raw === 'object' && raw !== null ? raw : {})
  })
});

settings.read();
settings.update((current) => ({
  ...current,
  theme: 'dark'
}));
settings.restore();
```

Use `fileName`, `directory`, or `filePath` when an app needs a different settings file location

### `createExternalOpenHandler(options)`

Creates a `webContents.setWindowOpenHandler()` callback that opens allowed URLs
with Electron's `shell.openExternal()` and denies Electron-created child windows.

```ts
import { createExternalOpenHandler } from 'electron-helper/main/shell';

mainWindow.webContents.setWindowOpenHandler(
  createExternalOpenHandler({
    allowedHosts    : ['example.com'],
    allowedProtocols: ['https:']
  })
);
```

### `setSingleInstance(window)`

Requests Electron's single-instance lock. Later app launches focus the provided
window instead of creating a second running app instance.

```ts
import { app, BrowserWindow } from 'electron';
import { setSingleInstance } from 'electron-helper/main/app';

let mainWindow: BrowserWindow | null = null;

if (setSingleInstance(() => mainWindow)) {
  await app.whenReady();

  mainWindow = new BrowserWindow();
}
```

Use `setSingleInstance(mainWindow)` when the window already exists. Use
`setSingleInstance(() => mainWindow)` when the window is assigned later.

### `quitWhenAllWindowsClosed(options)`

Registers Electron's `window-all-closed` behavior. By default, macOS keeps the
app running after the last window closes

```ts
import { quitWhenAllWindowsClosed } from 'electron-helper/main/app';

quitWhenAllWindowsClosed();
```

Pass `quitOnDarwin: true` when the app should quit on macOS too

```ts
quitWhenAllWindowsClosed({ quitOnDarwin: true });
```

### `activeWindow()`

Returns the currently focused Electron `BrowserWindow`, or `undefined` when no
usable window is focused.

```ts
import { activeWindow } from 'electron-helper/main/window';

activeWindow()?.webContents.openDevTools({ mode: 'detach' });
```

### `focusWindow(window)`

Restores a minimized window, shows a hidden window, then focuses it.

```ts
import { focusWindow } from 'electron-helper/main/window';

app.on('second-instance', () => {
  focusWindow(mainWindow);
});
```

### `setWindowShowWhenReady(window)`

Registers a `ready-to-show` listener that shows the window after Electron has
finished preparing the first paint.

```ts
import { BrowserWindow } from 'electron';
import { setWindowShowWhenReady } from 'electron-helper/main/window';

const mainWindow = new BrowserWindow({ show: false });

setWindowShowWhenReady(mainWindow);
```

### `setUseDevTools(window, enabled, options?)`

Opens or closes BrowserWindow DevTools to match the requested state

```ts
import { setUseDevTools } from 'electron-helper/main/window';

setUseDevTools(mainWindow, process.env.NODE_ENV === 'development', {
  mode: 'detach'
});
```

### `centerWindow(window, options)`

Centers a window on its matching display.

```ts
import { centerWindow } from 'electron-helper/main/window';

centerWindow(mainWindow, {
  size: { width: 1000, height: 700 }
});
```

### `getCenteredBounds(window, options)`

Calculates centered bounds without applying them.

```ts
import { getCenteredBounds } from 'electron-helper/main/window/bounds';

const bounds = getCenteredBounds(mainWindow, {
  size: { width: 1000, height: 700 }
});
```

### `registerUpdaterBridge(options)`

Connects `electron-updater` events from the main process to preload and renderer updater UI helpers.

Install `electron-updater` in apps that use this module

```bash
npm install electron-updater
```

```ts
// main
import { BrowserWindow } from 'electron';
import { registerUpdaterBridge } from 'electron-helper/main/updater';

registerUpdaterBridge({
  autoDownload: false,
  getWindows  : () => BrowserWindow.getAllWindows()
});
```

```ts
// preload
import { exposeUpdaterBridge } from 'electron-helper/preload/updater';

exposeUpdaterBridge({
  key: 'updater'
});
```

```ts
// renderer
import { createUpdaterClient } from 'electron-helper/renderer/updater';

const updater = createUpdaterClient(window.updater);

updater.subscribe((state) => {
  if (state.status === 'downloading') {
    renderProgress(state.progress?.percent ?? 0);
  }
});

await updater.checkForUpdates();
```

## Exports

| Export | Description |
| --- | --- |
| `electron-helper` | Root aggregate for the current helper modules |
| `electron-helper/main` | Main-process aggregate for app, path, shell, state, and window helpers |
| `electron-helper/main/app` | App lifecycle helpers |
| `electron-helper/main/app/single-instance` | Focused single-instance helper |
| `electron-helper/main/app/window-all-closed` | Focused all-windows-closed quit helper |
| `electron-helper/main/path` | Electron app path helpers |
| `electron-helper/main/path/electron` | Electron app path helpers |
| `electron-helper/main/shell` | Safe external URL open handler helpers |
| `electron-helper/main/shell/external` | Focused external URL open handler helper |
| `electron-helper/main/settings` | JSON-backed Electron settings helpers |
| `electron-helper/main/state` | Electron runtime state helpers |
| `electron-helper/main/updater` | Main-process updater bridge helpers |
| `electron-helper/main/window` | BrowserWindow visibility and focus helpers |
| `electron-helper/main/window/bounds` | BrowserWindow bounds calculation and centering helpers |
| `electron-helper/main/window/devtools` | BrowserWindow DevTools state helper |
| `electron-helper/node` | Node-compatible aggregate for env and path helpers |
| `electron-helper/node/env` | Dotenv-backed environment variable helpers |
| `electron-helper/node/env/load` | Focused dotenv loading helper |
| `electron-helper/node/env/read` | Focused env value reading helpers |
| `electron-helper/node/path` | Node-compatible path helpers |
| `electron-helper/node/path/current` | `import.meta.url` dirname and module resolution helpers |
| `electron-helper/node/path/resources` | Electron resources path helpers without importing Electron |
| `electron-helper/node/updater` | Shared updater bridge types and serializers |
| `electron-helper/preload` | Preload aggregate for updater bridge helpers |
| `electron-helper/preload/updater` | Context-isolated updater bridge helpers |
| `electron-helper/renderer` | Renderer aggregate for updater client helpers |
| `electron-helper/renderer/updater` | Renderer updater client helpers |

Both ESM `import` and CommonJS `require` are supported

## Module Docs

- [`electron-helper/main`](src/main/README.md)
- [`electron-helper/main/app`](src/main/app/README.md)
- [`electron-helper/main/app/single-instance`](src/main/app/single-instance/README.md)
- [`electron-helper/main/app/window-all-closed`](src/main/app/window-all-closed/README.md)
- [`electron-helper/main/path`](src/main/path/README.md)
- [`electron-helper/main/path/electron`](src/main/path/electron/README.md)
- [`electron-helper/main/shell`](src/main/shell/README.md)
- [`electron-helper/main/shell/external`](src/main/shell/external/README.md)
- [`electron-helper/main/settings`](src/main/settings/README.md)
- [`electron-helper/main/state`](src/main/state/README.md)
- [`electron-helper/main/updater`](src/main/updater/README.md)
- [`electron-helper/main/window`](src/main/window/README.md)
- [`electron-helper/main/window/bounds`](src/main/window/bounds/README.md)
- [`electron-helper/main/window/devtools`](src/main/window/devtools/README.md)
- [`electron-helper/node`](src/node/README.md)
- [`electron-helper/node/env`](src/node/env/README.md)
- [`electron-helper/node/env/load`](src/node/env/load/README.md)
- [`electron-helper/node/env/read`](src/node/env/read/README.md)
- [`electron-helper/node/path`](src/node/path/README.md)
- [`electron-helper/node/path/current`](src/node/path/current/README.md)
- [`electron-helper/node/path/resources`](src/node/path/resources/README.md)
- [`electron-helper/node/updater`](src/node/updater/README.md)
- [`electron-helper/preload`](src/preload/README.md)
- [`electron-helper/preload/updater`](src/preload/updater/README.md)
- [`electron-helper/renderer`](src/renderer/README.md)
- [`electron-helper/renderer/updater`](src/renderer/updater/README.md)
