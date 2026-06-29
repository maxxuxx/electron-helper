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
import { isProduction } from 'electron-helper/main/state';

console.log(isProduction());
```

This package is intended for Electron apps. It does not install Electron for consumers; use it from an Electron project.

## API

### `isProduction()`

Returns true when Electron's `app.isPackaged` is true.

```ts
isProduction();
```

### `getEnv(key)`

Loads `.env` from the current working directory once, then returns the requested value.

```ts
import { getEnv, requireEnv } from 'electron-helper/main/env';

const apiUrl = getEnv('API_URL');
const token = requireEnv('API_TOKEN');
```

Use `loadEnv({ path })` when the `.env` file lives somewhere else.

```ts
import { loadEnv } from 'electron-helper/main/env';

loadEnv({ path: '/path/to/.env' });
```

### `configurePath(metaUrl)`

Registers a module `import.meta.url` for path helpers that resolve from the current main-process module.

```ts
import { configurePath, resolvePath } from 'electron-helper/main/path';

configurePath(import.meta.url);

const preload = resolvePath('preload.js');
const rendererEntry = resolvePath('../../react/dist/index.html');
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

## Exports

- `electron-helper`
- `electron-helper/main`
- `electron-helper/main/env`
- `electron-helper/main/path`
- `electron-helper/main/state`

Both ESM `import` and CommonJS `require` are supported.
