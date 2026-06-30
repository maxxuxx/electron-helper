# `electron-helper/main/app/single-instance`

Focused single-instance helper for Electron main-process code

```ts
import { setSingleInstance } from 'electron-helper/main/app/single-instance';

setSingleInstance(() => mainWindow);
```

Use `setSingleInstance(mainWindow)` only when the window already exists. Use
`setSingleInstance(() => mainWindow)` when the window is assigned after
requesting the single-instance lock.
