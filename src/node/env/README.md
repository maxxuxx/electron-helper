# `electron-helper/node/env`

Dotenv-backed environment variable helpers for Node-compatible Electron code

This module loads `.env` from the current working directory once when reading from `process.env`, then provides small helpers for optional and required values

## Exports

| Import path | Folder | Exports |
| --- | --- | --- |
| `electron-helper/node/env` | [`./`](./) | All env helpers |
| `electron-helper/node/env/load` | [`./load`](./load/README.md) | `loadEnv` |
| `electron-helper/node/env/read` | [`./read`](./read/README.md) | `getEnv`, `requireEnv`, `EnvSource` |

## Basic usage

```ts
import { getEnv, requireEnv } from 'electron-helper/node/env';

const apiUrl = getEnv('API_URL');
const apiToken = requireEnv('API_TOKEN');
```

`getEnv` returns `undefined` when the value is missing or an empty string

`requireEnv` returns the value or throws when the value is missing

## Loading a custom file

By default, `process.cwd()/.env` is loaded

Use `loadEnv` before reading values when the file lives somewhere else

```ts
import { loadEnv, requireEnv } from 'electron-helper/node/env';

loadEnv({ path: '/absolute/path/to/.env' });

const apiToken = requireEnv('API_TOKEN');
```

`loadEnv` only runs once, so call it early if you need custom dotenv options

## Reading from a custom source

Pass a source object to read values without loading `.env`

```ts
import { getEnv, requireEnv } from 'electron-helper/node/env';

const source = {
  API_URL: 'https://example.com'
};

const apiUrl = getEnv('API_URL', source);
const token = requireEnv('API_TOKEN', source);
```

This is useful for tests and for code that receives environment values from a separate configuration layer
