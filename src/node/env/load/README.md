# `electron-helper/node/env/load`

Dotenv loading helper for Node-compatible Electron code

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `loadEnv(options?)` | Function | Loads a dotenv file once for process-level env access |

## Usage

```ts
import { loadEnv } from 'electron-helper/node/env/load';

loadEnv({ path: '/absolute/path/to/.env' });
```

By default, `loadEnv` reads `process.cwd()/.env`

`loadEnv` returns `undefined` after the first load attempt so repeated calls stay no-op
