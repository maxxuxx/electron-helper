# `electron-helper/node/os/hardware`

Hardware UUID helpers that do not import Electron

These helpers read the raw OS-provided hardware UUID from Node-compatible Electron code such as main process modules, preload scripts, utility processes, tests, and build scripts

## Exports

| Export | Kind | Description |
| --- | --- | --- |
| `getHardwareUuid(options?)` | Function | Returns the normalized hardware UUID or `undefined` |
| `requireHardwareUuid(options?)` | Function | Returns the normalized hardware UUID or throws when unavailable |
| `HardwareUuidCommandRunner` | Type | Command runner shape used for command-based UUID sources |
| `HardwareUuidFileReader` | Type | File reader shape used for file-based UUID sources |
| `HardwareUuidOptions` | Type | Options for platform override, timeout, and test adapters |

## Usage

```ts
import { getHardwareUuid, requireHardwareUuid } from 'electron-helper/node/os/hardware';

const hardwareUuid = await getHardwareUuid();

if (hardwareUuid !== undefined) {
  console.log(hardwareUuid);
}

const requiredHardwareUuid = await requireHardwareUuid();
```

`getHardwareUuid()` returns `undefined` when the platform is unsupported, the OS command fails, the Linux sysfs file is unreadable, or the value is missing or invalid

`requireHardwareUuid()` throws `Missing hardware UUID for platform: ${platform}` when no UUID is available

## OS sources

| Platform | Source |
| --- | --- |
| Windows | PowerShell CIM `Win32_ComputerSystemProduct.UUID`, then `wmic csproduct get UUID` |
| macOS | `ioreg -rd1 -c IOPlatformExpertDevice` `IOPlatformUUID` |
| Linux | `/sys/class/dmi/id/product_uuid` |

The helper returns the raw OS-provided UUID in lowercase and does not hash or cache it

`/etc/machine-id` is intentionally not used because it is not a hardware UUID
