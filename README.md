# electron-helper

[![npm version](https://img.shields.io/npm/v/electron-helper.svg)](https://www.npmjs.com/package/electron-helper)

Small dependency-free helpers for Electron apps and modules.

## Install

```bash
npm install electron-helper
```

## Main Process Helpers

Use the `main` subpath from Electron's main process:

```ts
import { app } from 'electron';
import { isPackaged, isProduction } from 'electron-helper/main';

console.log(isPackaged(app));
console.log(isProduction(app));
```

The package does not depend on Electron. It accepts the Electron `app` object structurally, so consumers keep control over their Electron version.

## API

### `isPackaged(app)`

Returns `app.isPackaged`.

```ts
isPackaged({ isPackaged: true }); // true
isPackaged({ isPackaged: false }); // false
```

### `isProduction(app?)`

Returns `app.isPackaged` when an app-like object is provided. When no app is provided, it falls back to `process.env.NODE_ENV === 'production'`.

```ts
isProduction({ isPackaged: true }); // true
isProduction({ isPackaged: false }); // false
```

## Exports

- `electron-helper`
- `electron-helper/main`

Both ESM `import` and CommonJS `require` are supported.
