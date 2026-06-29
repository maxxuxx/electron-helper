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
import { configureEnvironment, isProduction } from 'electron-helper/main';

configureEnvironment(app);

console.log(isProduction());
```

The package does not depend on Electron. It accepts the Electron `app` object structurally, so consumers keep control over their Electron version.

## API

### `configureEnvironment(config)`

Registers an app-like object or lazy packaged-state resolver for parameterless environment checks.

```ts
const restore = configureEnvironment({ isPackaged: true });

isProduction(); // true

restore();
```

### `isProduction(options?)`

Returns true when the configured or provided `isPackaged` value is true, or when `nodeEnv` is `production`.

```ts
isProduction({ isPackaged: true }); // true
isProduction({ isPackaged: false }); // false
isProduction({ nodeEnv: 'production' }); // true
```

## Exports

- `electron-helper`
- `electron-helper/main`

Both ESM `import` and CommonJS `require` are supported.
