# `electron-helper/main/window/bounds`

BrowserWindow bounds calculation and centering helpers

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `getCenteredBounds(window, options?)` | Function | Calculates centered bounds on the matching display |
| `centerWindow(window?, options?)` | Function | Applies centered bounds with `window.setBounds()` |
| `WindowBoundsOptions` | Type | Bounds calculation options |
| `CenterWindowOptions` | Type | Centering options including `animated` |

## Usage

```ts
import {
  centerWindow,
  getCenteredBounds
} from 'electron-helper/main/window/bounds';

centerWindow(mainWindow, {
  size: { width: 1000, height: 700 }
});

const bounds = getCenteredBounds(mainWindow);
```

By default, helpers center inside the matching display `workArea`. Use
`useFullBounds: true` to include areas such as the taskbar or Dock.
