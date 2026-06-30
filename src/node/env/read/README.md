# `electron-helper/node/env/read`

Environment value readers for Node-compatible Electron code

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `getEnv(key, source?)` | Function | Returns an optional env value and treats an empty string as missing |
| `requireEnv(key, source?)` | Function | Returns a required env value or throws when it is missing |
| `EnvSource` | Type | Record shape for custom env sources |

## Usage

```ts
import { getEnv, requireEnv } from 'electron-helper/node/env/read';

const apiUrl = getEnv('API_URL');
const apiToken = requireEnv('API_TOKEN');
```

When reading from `process.env`, this module calls `loadEnv()` automatically before returning values

Pass a custom source object to read values without loading `.env`
