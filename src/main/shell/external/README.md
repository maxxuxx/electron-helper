# `electron-helper/main/shell/external`

Safe external URL opener for Electron window-open requests

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `createExternalOpenHandler(options?)` | Function | Creates a `setWindowOpenHandler` callback for allowed external URLs |
| `ExternalOpenHandlerOptions` | Type | Allow-list options for protocols and hosts |
| `ExternalOpenHandler` | Type | Electron window-open handler that always returns a deny response |

## Usage

```ts
import { createExternalOpenHandler } from 'electron-helper/main/shell/external';

mainWindow.webContents.setWindowOpenHandler(
  createExternalOpenHandler({
    allowedHosts    : ['example.com'],
    allowedProtocols: ['https:']
  })
);
```

Allowed URLs are opened with `shell.openExternal`

Electron child windows are always denied by returning `{ action: 'deny' }`
