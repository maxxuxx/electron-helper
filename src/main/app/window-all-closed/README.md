# `electron-helper/main/app/window-all-closed`

Focused `window-all-closed` lifecycle helper for Electron main-process code

```ts
import { quitWhenAllWindowsClosed } from 'electron-helper/main/app/window-all-closed';

quitWhenAllWindowsClosed();
```

By default, macOS keeps the app running after the last window closes. Pass
`quitOnDarwin: true` when the app should quit on macOS too

```ts
quitWhenAllWindowsClosed({ quitOnDarwin: true });
```
