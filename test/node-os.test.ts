import { describe, expect, test } from 'vitest';

describe('node os helpers', () => {
  test('getOsPlatform returns the current Node platform', async () => {
    const osModule = await import('#node/os');

    expect(osModule.getOsPlatform()).toBe(process.platform);
  });

  test('isMacOS checks darwin platforms', async () => {
    const osModule = await import('#node/os');

    expect(osModule.isMacOS('darwin')).toBe(true);
    expect(osModule.isMacOS('win32')).toBe(false);
    expect(osModule.isMacOS('linux')).toBe(false);
  });

  test('isWindows checks win32 platforms', async () => {
    const osModule = await import('#node/os');

    expect(osModule.isWindows('win32')).toBe(true);
    expect(osModule.isWindows('darwin')).toBe(false);
    expect(osModule.isWindows('linux')).toBe(false);
  });

  test('isLinux checks linux platforms', async () => {
    const osModule = await import('#node/os');

    expect(osModule.isLinux('linux')).toBe(true);
    expect(osModule.isLinux('darwin')).toBe(false);
    expect(osModule.isLinux('win32')).toBe(false);
  });

  test('node route re-exports os helpers', async () => {
    const nodeModule = await import('#node');
    const osModule   = await import('#node/os');

    expect(nodeModule.getOsPlatform).toBe(osModule.getOsPlatform);
    expect(nodeModule.isMacOS).toBe(osModule.isMacOS);
    expect(nodeModule.isWindows).toBe(osModule.isWindows);
    expect(nodeModule.isLinux).toBe(osModule.isLinux);
  });
});
