import { afterEach, describe, expect, test } from 'vitest';

import { isProduction as isProductionFromRoot } from '../src/index.js';
import { isPackaged, isProduction } from '../src/main.js';

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
    return;
  }

  process.env.NODE_ENV = originalNodeEnv;
});

describe('main process helpers', () => {
  test('isPackaged returns true when the Electron app is packaged', () => {
    expect(isPackaged({ isPackaged: true })).toBe(true);
  });

  test('isPackaged returns false when the Electron app is not packaged', () => {
    expect(isPackaged({ isPackaged: false })).toBe(false);
  });

  test('isProduction follows app.isPackaged when an app object is provided', () => {
    process.env.NODE_ENV = 'development';

    expect(isProduction({ isPackaged: true })).toBe(true);
    expect(isProduction({ isPackaged: false })).toBe(false);
  });

  test('isProduction falls back to NODE_ENV when no app object is provided', () => {
    process.env.NODE_ENV = 'production';
    expect(isProduction()).toBe(true);

    process.env.NODE_ENV = 'development';
    expect(isProduction()).toBe(false);
  });

  test('NODE_ENV changes do not leak between tests', () => {
    expect(process.env.NODE_ENV).toBe(originalNodeEnv);
  });

  test('root export re-exports main process helpers', () => {
    expect(isProductionFromRoot({ isPackaged: true })).toBe(true);
  });
});
