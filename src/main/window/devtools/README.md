# `electron-helper/main/window/devtools`

BrowserWindow DevTools state helper

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `setUseDevTools(window, enabled, options?)` | Function | Opens or closes BrowserWindow DevTools |

## Usage

```ts
import { setUseDevTools } from 'electron-helper/main/window/devtools';

setUseDevTools(mainWindow, process.env.NODE_ENV === 'development', {
  mode: 'detach'
});
```

The helper returns `false` when the provided window is missing or destroyed
