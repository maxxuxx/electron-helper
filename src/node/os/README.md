# `electron-helper/node/os`

OS helpers that do not import Electron

Use these helpers from Node-compatible Electron code such as main process modules, preload scripts, utility processes, tests, and build scripts

## Exports

| Export | Description |
| --- | --- |
| `getOsPlatform` | Returns the current Node `process.platform` value |
| `getHardwareUuid` | Returns the normalized OS-provided hardware UUID or `undefined` |
| `isMacOS` | Returns true for `darwin` platforms |
| `isWindows` | Returns true for `win32` platforms |
| `isLinux` | Returns true for `linux` platforms |
| `requireHardwareUuid` | Returns the normalized OS-provided hardware UUID or throws when unavailable |
| `HardwareUuidCommandRunner` | Type for command-based hardware UUID adapters |
| `HardwareUuidFileReader` | Type for file-based hardware UUID adapters |
| `HardwareUuidOptions` | Type for hardware UUID lookup options |
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

## Hardware UUID

```ts
import { getHardwareUuid } from 'electron-helper/node/os/hardware';

const hardwareUuid = await getHardwareUuid();
```

Use `electron-helper/node/os/hardware` when an app needs the raw OS-provided hardware UUID without importing Electron
