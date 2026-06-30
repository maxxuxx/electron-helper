# `electron-helper/node/path`

Path helpers that do not import Electron

Use these helpers from Node-compatible Electron code such as main process modules, preload scripts, utility processes, tests, and build scripts

## Exports

| Import path | Folder | Exports |
| --- | --- | --- |
| `electron-helper/node/path` | [`./`](./) | All node path helpers |
| `electron-helper/node/path/current` | [`./current`](./current/README.md) | `getCurrentDir`, `resolveCurrentDir`, `resolveModulePath`, `ModuleMetaUrl` |
| `electron-helper/node/path/resources` | [`./resources`](./resources/README.md) | `getResourcesPath`, `resolveResourcesPath` |

## Current module paths

```ts
import { resolveCurrentDir } from 'electron-helper/node/path';

const preload = resolveCurrentDir(import.meta.url, 'preload.js');
```

## Electron resources paths

```ts
import { resolveResourcesPath } from 'electron-helper/node/path';

const appArchive = resolveResourcesPath('app.asar');
```
