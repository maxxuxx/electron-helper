import { describe, expect, test, vi } from 'vitest';

const sampleUuid = 'ABCDEF12-3456-7890-ABCD-EF1234567890';
const normalizedSampleUuid = 'abcdef12-3456-7890-abcd-ef1234567890';

describe('node hardware UUID helpers', () => {
  test('windows CIM output parses correctly', async () => {
    const hardwareModule = await import('#node/os/hardware');
    const commandRunner  = vi.fn(async () => `${sampleUuid}\r\n`);

    await expect(hardwareModule.getHardwareUuid({
      commandRunner,
      platform : 'win32',
      timeoutMs: 1234
    })).resolves.toBe(normalizedSampleUuid);

    expect(commandRunner).toHaveBeenCalledOnce();
    expect(commandRunner).toHaveBeenCalledWith(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        '(Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID'
      ],
      { timeoutMs: 1234 }
    );
  });

  test('windows falls back to WMIC when CIM fails', async () => {
    const hardwareModule = await import('#node/os/hardware');
    const commandRunner  = vi.fn(async (command: string) => {
      if (command === 'powershell.exe') {
        throw new Error('missing powershell');
      }

      return `UUID\r\n${sampleUuid}\r\n`;
    });

    await expect(hardwareModule.getHardwareUuid({
      commandRunner,
      platform: 'win32'
    })).resolves.toBe(normalizedSampleUuid);

    expect(commandRunner).toHaveBeenCalledTimes(2);
    expect(commandRunner).toHaveBeenLastCalledWith(
      'wmic',
      ['csproduct', 'get', 'UUID'],
      { timeoutMs: 5000 }
    );
  });

  test('macOS ioreg output parses correctly', async () => {
    const hardwareModule = await import('#node/os/hardware');
    const commandRunner  = vi.fn(async () => (
      `    "IOPlatformUUID" = "${sampleUuid}"\n`
    ));

    await expect(hardwareModule.getHardwareUuid({
      commandRunner,
      platform: 'darwin'
    })).resolves.toBe(normalizedSampleUuid);

    expect(commandRunner).toHaveBeenCalledWith(
      'ioreg',
      ['-rd1', '-c', 'IOPlatformExpertDevice'],
      { timeoutMs: 5000 }
    );
  });

  test('linux reads product uuid from sysfs', async () => {
    const hardwareModule = await import('#node/os/hardware');
    const commandRunner  = vi.fn(async () => sampleUuid);
    const fileReader     = vi.fn(async () => `${sampleUuid}\n`);

    await expect(hardwareModule.getHardwareUuid({
      commandRunner,
      fileReader,
      platform: 'linux'
    })).resolves.toBe(normalizedSampleUuid);

    expect(fileReader).toHaveBeenCalledWith('/sys/class/dmi/id/product_uuid');
    expect(commandRunner).not.toHaveBeenCalled();
  });

  test.each([
    '',
    'not-a-uuid',
    '00000000-0000-0000-0000-000000000000',
    'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF'
  ])('invalid hardware UUID output returns undefined for %j', async (output) => {
    const hardwareModule = await import('#node/os/hardware');
    const commandRunner  = vi.fn(async () => output);

    await expect(hardwareModule.getHardwareUuid({
      commandRunner,
      platform: 'darwin'
    })).resolves.toBeUndefined();
  });

  test('unsupported platforms return undefined', async () => {
    const hardwareModule = await import('#node/os/hardware');

    await expect(hardwareModule.getHardwareUuid({
      platform: 'freebsd'
    })).resolves.toBeUndefined();
  });

  test('requireHardwareUuid returns the normalized hardware UUID', async () => {
    const hardwareModule = await import('#node/os/hardware');
    const commandRunner  = vi.fn(async () => sampleUuid);

    await expect(hardwareModule.requireHardwareUuid({
      commandRunner,
      platform: 'darwin'
    })).resolves.toBe(normalizedSampleUuid);
  });

  test('requireHardwareUuid throws when the hardware UUID is missing', async () => {
    const hardwareModule = await import('#node/os/hardware');

    await expect(hardwareModule.requireHardwareUuid({
      platform: 'freebsd'
    })).rejects.toThrow('Missing hardware UUID for platform: freebsd');
  });

  test('node os and node routes re-export hardware UUID helpers', async () => {
    const hardwareModule = await import('#node/os/hardware');
    const osModule       = await import('#node/os');
    const nodeModule     = await import('#node');

    expect(osModule.getHardwareUuid).toBe(hardwareModule.getHardwareUuid);
    expect(osModule.requireHardwareUuid).toBe(hardwareModule.requireHardwareUuid);
    expect(nodeModule.getHardwareUuid).toBe(hardwareModule.getHardwareUuid);
    expect(nodeModule.requireHardwareUuid).toBe(hardwareModule.requireHardwareUuid);
  });
});
