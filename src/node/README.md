# `electron-helper/node`

Node-compatible helpers for Electron apps and tooling

These modules do not import Electron and can run in plain Node.js, Electron main, preload, utility processes, tests, and build scripts

## Exports

| Export | Source | Description |
| --- | --- | --- |
| `env` helpers | `electron-helper/node/env` | Dotenv-backed environment variable helpers |
| `os` helpers | `electron-helper/node/os` | Node platform, OS check, and hardware UUID helpers |
| `hardware UUID` helpers | `electron-helper/node/os/hardware` | Raw OS-provided hardware UUID lookup helpers |
| `path` helpers | `electron-helper/node/path` | Module and Electron resources path helpers |
| `updater` helpers | `electron-helper/node/updater` | Shared updater bridge types and serializers |

## Usage

```ts
import { getEnv } from 'electron-helper/node/env';
import { isMacOS } from 'electron-helper/node/os';
import { getHardwareUuid } from 'electron-helper/node/os/hardware';
import { resolveCurrentDir } from 'electron-helper/node/path/current';
import type { UpdaterState } from 'electron-helper/node/updater';

const apiUrl = getEnv('API_URL');
const hardwareUuid = await getHardwareUuid();
const preloadPath = resolveCurrentDir(import.meta.url, 'preload.js');
const shouldUseMacMenu = isMacOS();

function readUpdaterStatus(state: UpdaterState) {
  return state.status;
}
```
