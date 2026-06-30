# `electron-helper/preload/updater`

Context-isolated preload bridge for updater UI

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `createUpdaterBridgeApi()` | Function | Creates an IPC-backed updater bridge API |
| `exposeUpdaterBridge(options)` | Function | Exposes the updater bridge API through `contextBridge` |
| `ExposeUpdaterBridgeOptions` | Type | Options for the exposed global key |

## Usage

```ts
import { exposeUpdaterBridge } from 'electron-helper/preload/updater';

exposeUpdaterBridge({
  key: 'updater'
});
```

The exposed API supports `getState`, `checkForUpdates`, `downloadUpdate`, `quitAndInstall`, and `onState`
