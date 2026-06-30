# `electron-helper/renderer`

Renderer helper aggregate for Electron apps

Use this entrypoint when renderer code needs all currently available renderer helpers from one import path

```ts
import { createUpdaterClient } from 'electron-helper/renderer';

const updater = createUpdaterClient(window.updater);
```

## Exports

| Export | Source | Description |
| --- | --- | --- |
| `updater` helpers | `electron-helper/renderer/updater` | Renderer updater client helpers |
