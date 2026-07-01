import { beforeEach, describe, expect, test, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({
  getVersion: vi.fn(() => '0.0.0'),
  isPackaged: false
}));

vi.mock('electron', () => ({
  app: electronApp
}));

import {
  getVersion as getVersionFromRoot,
  isProduction as isProductionFromRoot
} from '../src/index.js';
import { getVersion, isProduction } from '../src/main/index.js';

beforeEach(() => {
  electronApp.getVersion.mockReturnValue('0.0.0');
  electronApp.isPackaged = false;
  process.env.NODE_ENV = 'development';
});

describe('main process helpers', () => {
  test('isProduction returns true when the Electron app is packaged', () => {
    electronApp.isPackaged = true;

    expect(isProduction()).toBe(true);
  });

  test('isProduction returns false when the Electron app is not packaged', () => {
    electronApp.isPackaged = false;
    process.env.NODE_ENV = 'production';

    expect(isProduction()).toBe(false);
  });

  test('getVersion returns the Electron app version', () => {
    electronApp.getVersion.mockReturnValue('1.2.3');

    expect(getVersion()).toBe('1.2.3');
    expect(electronApp.getVersion).toHaveBeenCalledOnce();
  });

  test('main state route exports Electron-backed helpers', async () => {
    const stateModule = await import('#main/state');

    electronApp.isPackaged = true;

    expect(stateModule.isProduction()).toBe(true);
    expect(stateModule.getVersion()).toBe('0.0.0');
  });

  test('main index re-exports state helpers', async () => {
    const environmentModule = await import('#main/state');
    const mainModule = await import('../src/main/index.js');

    expect(mainModule.isProduction).toBe(environmentModule.isProduction);
    expect(mainModule.getVersion).toBe(environmentModule.getVersion);
  });

  test('root export re-exports main process helpers', async () => {
    const rootModule = await import('../src/index.js');

    expect(rootModule.isProduction).toBe(isProduction);
    expect(isProductionFromRoot).toBe(isProduction);
    expect(rootModule.getVersion).toBe(getVersion);
    expect(getVersionFromRoot).toBe(getVersion);
  });
});
