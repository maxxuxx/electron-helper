# `electron-helper/node/updater`

Shared updater bridge types, channel names, and serializers

This module does not import Electron or `electron-updater`

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `updaterBridgeChannels` | Constant | IPC channel names shared by main and preload updater modules |
| `UpdaterState` | Type | Renderer-safe updater state DTO |
| `UpdaterBridgeApi` | Type | Preload bridge API consumed by renderer updater clients |
| `UpdaterAdapter` | Type | Minimal updater surface accepted by the main updater bridge |
| `serializeUpdaterInfo(info)` | Function | Converts update metadata into a serializable DTO |
| `serializeUpdaterProgress(progress)` | Function | Converts download progress into a serializable DTO |
| `serializeUpdaterError(error)` | Function | Converts unknown errors into a serializable DTO |

## Usage

```ts
import type { UpdaterState } from 'electron-helper/node/updater';

function renderUpdaterState(state: UpdaterState) {
  if (state.status === 'downloading') {
    renderProgress(state.progress?.percent ?? 0);
  }
}
```
