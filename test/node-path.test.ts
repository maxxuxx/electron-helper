import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import nodeOs from 'node:os';
import nodePath from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { afterEach, describe, expect, test } from 'vitest';

type ProcessWithResourcesPath = NodeJS.Process & {
  resourcesPath?: string;
};

const originalResourcesPath = (process as ProcessWithResourcesPath)
  .resourcesPath;

afterEach(() => {
  if (originalResourcesPath === undefined) {
    Reflect.deleteProperty(process, 'resourcesPath');
    return;
  }

  Object.defineProperty(process, 'resourcesPath', {
    configurable: true,
    value       : originalResourcesPath
  });
});

function setResourcesPath(resourcesPath: string): void {
  Object.defineProperty(process, 'resourcesPath', {
    configurable: true,
    value       : resourcesPath
  });
}

function createImportAliasPackage(): {
  readonly metaUrl: URL;
  readonly expectedPath: string;
  readonly cleanup: () => void;
} {
  const packageDir  = mkdtempSync(
    nodePath.join(nodeOs.tmpdir(), 'electron-helper-path-')
  );
  const preloadPath = nodePath.join(packageDir, 'dist', 'preload', 'index.js');
  const mainPath    = nodePath.join(packageDir, 'dist', 'main', 'index.js');

  mkdirSync(nodePath.dirname(preloadPath), { recursive: true });
  mkdirSync(nodePath.dirname(mainPath), { recursive: true });
  writeFileSync(
    nodePath.join(packageDir, 'package.json'),
    JSON.stringify(
      {
        type   : 'module',
        imports: {
          '#preload': './dist/preload/index.js'
        }
      },
      undefined,
      2
    )
  );
  writeFileSync(preloadPath, '');
  writeFileSync(mainPath, '');

  return {
    metaUrl     : pathToFileURL(mainPath),
    expectedPath: preloadPath,
    cleanup     : () => rmSync(packageDir, { recursive: true, force: true })
  };
}

describe('node path helpers', () => {
  const testModuleDirname = nodePath.dirname(fileURLToPath(import.meta.url));

  test('getCurrentDir resolves a dirname from a meta URL', async () => {
    const pathModule = await import('#node/path/current');

    expect(pathModule.getCurrentDir(import.meta.url)).toBe(testModuleDirname);
  });

  test('resolveCurrentDir resolves segments from a meta URL', async () => {
    const pathModule = await import('#node/path/current');

    expect(pathModule.resolveCurrentDir(import.meta.url, '../src')).toBe(
      nodePath.resolve(testModuleDirname, '../src')
    );
  });

  test('resolveModulePath resolves module specifiers from a meta URL', async () => {
    const pathModule   = await import('#node/path/current');
    const expectedPath = createRequire(import.meta.url).resolve('../package.json');

    expect(pathModule.resolveModulePath(import.meta.url, '../package.json')).toBe(
      expectedPath
    );
  });

  test('resolveModulePath resolves package imports from a meta URL', async () => {
    const pathModule = await import('#node/path/current');
    const fixture    = createImportAliasPackage();

    try {
      expect(pathModule.resolveModulePath(fixture.metaUrl, '#preload')).toBe(
        fixture.expectedPath
      );
    } finally {
      fixture.cleanup();
    }
  });

  test('node path route re-exports focused path modules', async () => {
    const pathModule      = await import('#node/path');
    const currentModule   = await import('#node/path/current');
    const resourcesModule = await import('#node/path/resources');

    expect(pathModule.getCurrentDir).toBe(currentModule.getCurrentDir);
    expect(pathModule.resolveCurrentDir).toBe(
      currentModule.resolveCurrentDir
    );
    expect(pathModule.resolveModulePath).toBe(
      currentModule.resolveModulePath
    );
    expect(pathModule.getResourcesPath).toBe(
      resourcesModule.getResourcesPath
    );
    expect(pathModule.resolveResourcesPath).toBe(
      resourcesModule.resolveResourcesPath
    );
  });

  test('resolveResourcesPath resolves from Electron resourcesPath', async () => {
    const pathModule = await import('#node/path/resources');

    setResourcesPath('/electron/resources');

    expect(pathModule.getResourcesPath()).toBe('/electron/resources');
    expect(pathModule.resolveResourcesPath('app.asar')).toBe(
      nodePath.resolve('/electron/resources', 'app.asar')
    );
  });

  test('getResourcesPath throws outside Electron resources context', async () => {
    const pathModule = await import('#node/path/resources');

    Reflect.deleteProperty(process, 'resourcesPath');

    expect(() => pathModule.getResourcesPath()).toThrow(/resourcesPath/);
  });
});
