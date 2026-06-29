import { afterEach, describe, expect, test } from 'vitest';

import { isProduction as isProductionFromRoot } from '../src/index.js';
import { isProduction } from '../src/main/index.js';

type ConfigureEnvironment = (config: {
  readonly isPackaged?: boolean | (() => boolean);
}) => () => void;

const originalNodeEnv = process.env.NODE_ENV;
let restoreConfiguredEnvironment: (() => void) | undefined;

afterEach(() => {
  restoreConfiguredEnvironment?.();
  restoreConfiguredEnvironment = undefined;

  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
    return;
  }

  process.env.NODE_ENV = originalNodeEnv;
});

async function loadConfigureEnvironment(): Promise<ConfigureEnvironment> {
  const mainModule = await import('../src/main/index.js') as {
    readonly configureEnvironment?: unknown;
  };

  expect(typeof mainModule.configureEnvironment).toBe('function');
  return mainModule.configureEnvironment as ConfigureEnvironment;
}

function rememberRestore(restore: () => void): void {
  restoreConfiguredEnvironment = restore;
}

describe('main process helpers', () => {
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

  test('isProduction can use explicit nodeEnv without mutating process env', () => {
    expect(isProduction({ nodeEnv: 'production' })).toBe(true);
    expect(isProduction({ nodeEnv: 'development' })).toBe(false);
  });

  test('configureEnvironment registers an app-like packaged state', async () => {
    process.env.NODE_ENV = 'development';

    const configureEnvironment = await loadConfigureEnvironment();
    rememberRestore(configureEnvironment({ isPackaged: true }));

    expect(isProduction()).toBe(true);
  });

  test('configureEnvironment supports a lazy packaged state resolver', async () => {
    process.env.NODE_ENV = 'development';
    let isPackaged = false;

    const configureEnvironment = await loadConfigureEnvironment();
    rememberRestore(configureEnvironment({ isPackaged: () => isPackaged }));

    expect(isProduction()).toBe(false);

    isPackaged = true;
    expect(isProduction()).toBe(true);
  });

  test('configureEnvironment returns a restore function', async () => {
    process.env.NODE_ENV = 'development';

    const configureEnvironment = await loadConfigureEnvironment();
    const restore = configureEnvironment({ isPackaged: true });

    expect(isProduction()).toBe(true);

    restore();
    expect(isProduction()).toBe(false);
  });

  test('NODE_ENV changes do not leak between tests', () => {
    expect(process.env.NODE_ENV).toBe(originalNodeEnv);
  });

  test('main enviroment route exports main process helpers', async () => {
    const environmentModule = await import('../src/main/enviroment/index.js');

    expect(typeof environmentModule.configureEnvironment).toBe('function');
    expect(environmentModule.isProduction({ isPackaged: true })).toBe(true);
    expect('isPackaged' in environmentModule).toBe(false);
  });

  test('main alias resolves enviroment helpers', async () => {
    const environmentModule = await import('#main/enviroment');

    expect(typeof environmentModule.configureEnvironment).toBe('function');
    expect(environmentModule.isProduction({ isPackaged: true })).toBe(true);
    expect('isPackaged' in environmentModule).toBe(false);
  });

  test('main index re-exports enviroment helpers', async () => {
    const environmentModule = await import('../src/main/enviroment/index.js');
    const mainModule = await import('../src/main/index.js');

    expect(isProduction).toBe(environmentModule.isProduction);
    expect(mainModule.configureEnvironment).toBe(environmentModule.configureEnvironment);
    expect(mainModule.isProduction).toBe(environmentModule.isProduction);
    expect('isPackaged' in mainModule).toBe(false);
  });

  test('root export re-exports main process helpers', async () => {
    const rootModule = await import('../src/index.js');

    expect(isProductionFromRoot({ isPackaged: true })).toBe(true);
    expect(rootModule.isProduction).toBe(isProduction);
    expect(rootModule.configureEnvironment).toBeDefined();
    expect('isPackaged' in rootModule).toBe(false);
  });
});
