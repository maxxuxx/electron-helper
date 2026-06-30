# `electron-helper/node/path/resources`

Helpers for resolving paths from Electron's resources directory without importing Electron

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `getResourcesPath()` | Function | Returns Electron's resources directory from `process.resourcesPath` |
| `resolveResourcesPath(...segments)` | Function | Resolves path segments from Electron's resources directory |

## Usage

```ts
import { resolveResourcesPath } from 'electron-helper/node/path/resources';

const appArchive = resolveResourcesPath('app.asar');
```

This module reads `process.resourcesPath`, which Electron adds to the Node process object

It throws when the current runtime does not provide `process.resourcesPath`
