# `electron-helper/renderer/updater`

Renderer updater client for update UI state

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `createUpdaterClient(bridgeApi)` | Function | Wraps a preload updater bridge API with renderer-friendly helpers |
| `UpdaterClient` | Type | Client with commands, subscription, and cached snapshot access |

## Usage

```ts
import { createUpdaterClient } from 'electron-helper/renderer/updater';

const updater = createUpdaterClient(window.updater);

const unsubscribe = updater.subscribe((state) => {
  if (state.status === 'downloading') {
    renderProgress(state.progress?.percent ?? 0);
  }
});

await updater.checkForUpdates();
```
