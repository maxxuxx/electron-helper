import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';

import { afterEach, describe, expect, test, vi } from 'vitest';

type EnvModule = {
  readonly getEnv: (
    key: string,
    source?: Record<string, string | undefined>
  ) => string | undefined;
  readonly loadEnv: (options?: { readonly path?: string }) => unknown;
  readonly requireEnv: (
    key: string,
    source?: Record<string, string | undefined>
  ) => string;
};

const originalCwd = process.cwd();
let tempDir: string | undefined;

afterEach(() => {
  process.chdir(originalCwd);
  delete process.env.ELECTRON_HELPER_ENV_VALUE;
  delete process.env.ELECTRON_HELPER_ENV_EMPTY;
  delete process.env.ELECTRON_HELPER_ENV_ONCE;
  delete (globalThis as Record<symbol, unknown>)[
    Symbol.for('electron-helper.node.env.state')
  ];

  if (tempDir !== undefined) {
    rmSync(tempDir, { force: true, recursive: true });
    tempDir = undefined;
  }

  vi.resetModules();
});

async function loadEnvModule(): Promise<EnvModule> {
  vi.resetModules();
  return await import('#node/env') as EnvModule;
}

function createTempEnv(contents: string): string {
  tempDir = mkdtempSync(nodePath.join(tmpdir(), 'electron-helper-env-'));
  const envFilePath = nodePath.join(tempDir, '.env');

  writeFileSync(envFilePath, contents);
  return envFilePath;
}

describe('node env helpers', () => {
  test('getEnv loads a .env file from the current working directory', async () => {
    createTempEnv([
      'ELECTRON_HELPER_ENV_VALUE=loaded',
      'ELECTRON_HELPER_ENV_EMPTY='
    ].join('\n'));
    process.chdir(tempDir!);

    const envModule = await loadEnvModule();

    expect(envModule.getEnv('ELECTRON_HELPER_ENV_VALUE')).toBe('loaded');
    expect(envModule.getEnv('ELECTRON_HELPER_ENV_EMPTY')).toBeUndefined();
  });

  test('getEnv reads custom sources without loading process env', async () => {
    const envModule = await loadEnvModule();
    const source = {
      EMPTY: '',
      VALUE: 'custom'
    };

    expect(envModule.getEnv('VALUE', source)).toBe('custom');
    expect(envModule.getEnv('EMPTY', source)).toBeUndefined();
  });

  test('requireEnv returns values or throws when missing', async () => {
    const envModule = await loadEnvModule();
    const source = {
      VALUE: 'required'
    };

    expect(envModule.requireEnv('VALUE', source)).toBe('required');
    expect(() => envModule.requireEnv('MISSING', source)).toThrow(
      'Missing required env value: MISSING'
    );
  });

  test('node env route re-exports focused env modules', async () => {
    const envModule  = await loadEnvModule();
    const loadModule = await import('#node/env/load');
    const readModule = await import('#node/env/read');

    expect(envModule.loadEnv).toBe(loadModule.loadEnv);
    expect(envModule.getEnv).toBe(readModule.getEnv);
    expect(envModule.requireEnv).toBe(readModule.requireEnv);
  });

  test('loadEnv only loads once across node env subpaths', async () => {
    const firstEnvPath = createTempEnv('ELECTRON_HELPER_ENV_ONCE=first');
    const secondEnvPath = nodePath.join(tempDir!, '.env.second');

    writeFileSync(secondEnvPath, 'ELECTRON_HELPER_ENV_ONCE=second');

    const loadModule = await import('#node/env/load');
    const readModule = await import('#node/env/read');

    loadModule.loadEnv({ path: firstEnvPath });
    loadModule.loadEnv({ path: secondEnvPath });

    expect(readModule.getEnv('ELECTRON_HELPER_ENV_ONCE')).toBe('first');
  });
});
