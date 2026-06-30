import nodePath from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({
  getAppPath: vi.fn(() => '/electron/app'),
  getPath   : vi.fn((name: string) => `/electron/${name}`)
}));

vi.mock('electron', () => ({
  app: electronApp
}));

type PathModule = {
  readonly resolveAppPath: (...segments: string[]) => string;
  readonly resolveElectronPath: (name: string, ...segments: string[]) => string;
};

beforeEach(() => {
  electronApp.getAppPath.mockReturnValue('/electron/app');
  electronApp.getPath.mockImplementation((name: string) => `/electron/${name}`);
});

afterEach(() => {
  vi.clearAllMocks();
});

async function loadPathModule(): Promise<PathModule> {
  const pathModule = await import('#main/path') as Partial<PathModule>;

  expect(typeof pathModule.resolveAppPath).toBe('function');
  expect(typeof pathModule.resolveElectronPath).toBe('function');

  return pathModule as PathModule;
}

describe('main path helpers', () => {
  test('resolveAppPath resolves segments from Electron app path', async () => {
    const pathModule = await loadPathModule();

    expect(pathModule.resolveAppPath('renderer', 'index.html')).toBe(
      nodePath.resolve('/electron/app', 'renderer', 'index.html')
    );
  });

  test('resolveElectronPath resolves segments from Electron named paths', async () => {
    const pathModule = await loadPathModule();

    expect(pathModule.resolveElectronPath('userData', 'db.sqlite')).toBe(
      nodePath.resolve('/electron/userData', 'db.sqlite')
    );
  });

  test('main index re-exports Electron path helpers', async () => {
    const pathModule = await loadPathModule();
    const mainModule = await import('../src/main/index.js');

    expect(mainModule.resolveAppPath).toBe(pathModule.resolveAppPath);
  });

  test('main path no longer exports Node-only helpers', async () => {
    const pathModule = await import('#main/path');

    expect('configurePath' in pathModule).toBe(false);
    expect('getModuleDirname' in pathModule).toBe(false);
    expect('resolvePath' in pathModule).toBe(false);
    expect('resolvePathFromMetaUrl' in pathModule).toBe(false);
    expect('resolveModulePath' in pathModule).toBe(false);
  });
});
