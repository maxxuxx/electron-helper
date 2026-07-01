# `electron-helper/node/os`

OS helpers that do not import Electron

Use these helpers from Node-compatible Electron code such as main process modules, preload scripts, utility processes, tests, and build scripts

## Exports

| Export | Description |
| --- | --- |
| `getOsPlatform` | Returns the current Node `process.platform` value |
| `isMacOS` | Returns true for `darwin` platforms |
| `isWindows` | Returns true for `win32` platforms |
| `isLinux` | Returns true for `linux` platforms |
| `OsPlatform` | Type alias for Node platform values |

## Usage

```ts
import { isLinux, isMacOS, isWindows } from 'electron-helper/node/os';

if (isMacOS()) {
  console.log('Run macOS-specific setup');
}

if (isWindows()) {
  console.log('Run Windows-specific setup');
}

if (isLinux()) {
  console.log('Run Linux-specific setup');
}
```
