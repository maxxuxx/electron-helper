# `electron-helper/main/shell`

Shell helpers for Electron main-process window behavior

This module currently focuses on safely handling renderer attempts to open new windows by validating the URL, opening allowed URLs with Electron's `shell.openExternal`, and always denying Electron-created child windows

## Exports

| Import path | Folder | Exports |
| --- | --- | --- |
| `electron-helper/main/shell` | [`./`](./) | All shell helpers |
| `electron-helper/main/shell/external` | [`./external`](./external/README.md) | `createExternalOpenHandler`, `ExternalOpenHandlerOptions`, `ExternalOpenHandler` |

## Usage

```ts
import { BrowserWindow } from 'electron';
import { createExternalOpenHandler } from 'electron-helper/main/shell';

const mainWindow = new BrowserWindow();

mainWindow.webContents.setWindowOpenHandler(
  createExternalOpenHandler({
    allowedHosts    : ['example.com'],
    allowedProtocols: ['https:']
  })
);
```

When a renderer requests `https://example.com/docs`, the handler opens it externally and returns `{ action: 'deny' }` so Electron does not create a child window

URLs outside the allow list are denied without calling `shell.openExternal`

## Options

### `allowedProtocols`

List of allowed URL protocols

```ts
createExternalOpenHandler({
  allowedProtocols: ['https:']
});
```

The protocol value should include the trailing colon, matching `URL.protocol`

### `allowedHosts`

List of allowed hostnames

```ts
createExternalOpenHandler({
  allowedHosts    : ['example.com'],
  allowedProtocols: ['https:']
});
```

When omitted, any host is allowed as long as the protocol is allowed

For app links or payment links, prefer setting both `allowedProtocols` and `allowedHosts`
