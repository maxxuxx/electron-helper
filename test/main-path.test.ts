import nodePath from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({
  getAppPath: vi.fn(() => '/electron/app'),
  getPath   : vi.fn((name: string) => `/electron/${name}`)
}));

vi.mock('electron', () => ({
  app: electronApp
}));

type ModuleMetaUrl = string | URL;

type PathModule = {
  readonly configurePath: (
    config: ModuleMetaUrl | { readonly metaUrl: ModuleMetaUrl }
  ) => () => void;
  readonly getModuleDirname: (metaUrl?: ModuleMetaUrl) => string;
  readonly resolveAppPath: (...segments: string[]) => string;
  readonly resolveElectronPath: (name: string, ...segments: string[]) => string;
  readonly resolvePath: (...segments: string[]) => string;
  readonly resolvePathFromMetaUrl: (
    metaUrl: ModuleMetaUrl,
    ...segments: string[]
  ) => string;
};

let restoreConfiguredPath: (() => void) | undefined;

beforeEach(() => {
  electronApp.getAppPath.mockReturnValue('/electron/app');
  electronApp.getPath.mockImplementation((name: string) => `/electron/${name}`);
});

afterEach(() => {
  restoreConfiguredPath?.();
  restoreConfiguredPath = undefined;
});

async function loadPathModule(): Promise<PathModule> {
  const pathModule = await import('#main/path') as Partial<PathModule>;

  expect(typeof pathModule.configurePath).toBe('function');
  expect(typeof pathModule.getModuleDirname).toBe('function');
  expect(typeof pathModule.resolveAppPath).toBe('function');
  expect(typeof pathModule.resolveElectronPath).toBe('function');
  expect(typeof pathModule.resolvePath).toBe('function');
  expect(typeof pathModule.resolvePathFromMetaUrl).toBe('function');

  return pathModule as PathModule;
}

function rememberRestore(restore: () => void): void {
  restoreConfiguredPath = restore;
}

describe('main path helpers', () => {
  const testModuleDirname = nodePath.dirname(fileURLToPath(import.meta.url));

  test('getModuleDirname resolves a dirname from an explicit metaUrl', async () => {
    const pathModule = await loadPathModule();

    expect(pathModule.getModuleDirname(import.meta.url)).toBe(testModuleDirname);
  });

  test('resolvePathFromMetaUrl resolves segments from an explicit metaUrl', async () => {
    const pathModule = await loadPathModule();

    expect(pathModule.resolvePathFromMetaUrl(import.meta.url, '../src')).toBe(
      nodePath.resolve(testModuleDirname, '../src')
    );
  });

  test('configurePath registers a metaUrl for parameterless helpers', async () => {
    const pathModule = await loadPathModule();

    rememberRestore(pathModule.configurePath(import.meta.url));

    expect(pathModule.getModuleDirname()).toBe(testModuleDirname);
    expect(pathModule.resolvePath('fixtures', 'file.txt')).toBe(
      nodePath.resolve(testModuleDirname, 'fixtures', 'file.txt')
    );
  });

  test('configurePath accepts an object config', async () => {
    const pathModule = await loadPathModule();
    const mainUrl = pathToFileURL(
      nodePath.join(testModuleDirname, 'nested', 'main.js')
    );

    rememberRestore(pathModule.configurePath({ metaUrl: mainUrl }));

    expect(pathModule.getModuleDirname()).toBe(
      nodePath.join(testModuleDirname, 'nested')
    );
  });

  test('configurePath returns a restore function', async () => {
    const pathModule = await loadPathModule();
    const firstUrl = pathToFileURL(
      nodePath.join(testModuleDirname, 'first', 'main.js')
    );
    const secondUrl = pathToFileURL(
      nodePath.join(testModuleDirname, 'second', 'main.js')
    );

    const restoreFirst = pathModule.configurePath(firstUrl);
    restoreConfiguredPath = restoreFirst;

    expect(pathModule.resolvePath('preload.js')).toBe(
      nodePath.resolve(testModuleDirname, 'first', 'preload.js')
    );

    const restoreSecond = pathModule.configurePath(secondUrl);
    restoreConfiguredPath = () => {
      restoreSecond();
      restoreFirst();
    };

    expect(pathModule.resolvePath('preload.js')).toBe(
      nodePath.resolve(testModuleDirname, 'second', 'preload.js')
    );

    restoreSecond();

    expect(pathModule.resolvePath('preload.js')).toBe(
      nodePath.resolve(testModuleDirname, 'first', 'preload.js')
    );

    restoreFirst();
    restoreConfiguredPath = undefined;

    expect(() => pathModule.getModuleDirname()).toThrow(/configurePath/);
  });

  test('configured path helpers throw before configurePath is called', async () => {
    const pathModule = await loadPathModule();

    expect(() => pathModule.getModuleDirname()).toThrow(/configurePath/);
    expect(() => pathModule.resolvePath('preload.js')).toThrow(/configurePath/);
  });

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

  test('main index re-exports path helpers', async () => {
    const pathModule = await loadPathModule();
    const mainModule = await import('../src/main/index.js');

    expect(mainModule.configurePath).toBe(pathModule.configurePath);
    expect(mainModule.resolvePath).toBe(pathModule.resolvePath);
  });
});
