# `electron-helper/node/path/current`

Helpers for resolving paths from module meta URLs

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `getCurrentDir(metaUrl)` | Function | Returns the dirname for a module meta URL |
| `resolveCurrentDir(metaUrl, ...segments)` | Function | Resolves path segments from a module meta URL |
| `resolveModulePath(metaUrl, specifier)` | Function | Resolves package imports and module specifiers from a module meta URL |
| `ModuleMetaUrl` | Type | Accepted `import.meta.url` input shape |

## Usage

```ts
import {
  getCurrentDir,
  resolveCurrentDir,
  resolveModulePath
} from 'electron-helper/node/path/current';

const currentDir = getCurrentDir(import.meta.url);
const preload = resolveCurrentDir(import.meta.url, 'preload.js');
const preloadEntry = resolveModulePath(import.meta.url, '#preload');
```

Pass the caller's `import.meta.url` so resolution stays local to that module
