import { beforeEach, describe, expect, test, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({
  isPackaged: false
}));

vi.mock('electron', () => ({
  app: electronApp
}));

import { isProduction as isProductionFromRoot } from '../src/index.js';
import { isProduction } from '../src/main/index.js';

beforeEach(() => {
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

  test('main state route exports Electron-backed helpers', async () => {
    const stateModule = await import('#main/state');

    electronApp.isPackaged = true;

    expect(stateModule.isProduction()).toBe(true);
  });

  test('main index re-exports state helpers', async () => {
    const environmentModule = await import('#main/state');
    const mainModule = await import('../src/main/index.js');

    expect(mainModule.isProduction).toBe(environmentModule.isProduction);
  });

  test('root export re-exports main process helpers', async () => {
    const rootModule = await import('../src/index.js');

    expect(rootModule.isProduction).toBe(isProduction);
    expect(isProductionFromRoot).toBe(isProduction);
  });
});
