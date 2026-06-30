# `electron-helper/preload`

Preload helper aggregate for Electron apps

Use this entrypoint when a preload script needs all currently available preload helpers from one import path

```ts
import { exposeUpdaterBridge } from 'electron-helper/preload';

exposeUpdaterBridge();
```

## Exports

| Export | Source | Description |
| --- | --- | --- |
| `updater` helpers | `electron-helper/preload/updater` | Context-isolated updater bridge helpers |
