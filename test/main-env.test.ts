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

  if (tempDir !== undefined) {
    rmSync(tempDir, { force: true, recursive: true });
    tempDir = undefined;
  }

  vi.resetModules();
});

async function loadEnvModule(): Promise<EnvModule> {
  vi.resetModules();
  return await import('#main/env') as EnvModule;
}

function createTempEnv(contents: string): string {
  tempDir = mkdtempSync(nodePath.join(tmpdir(), 'electron-helper-env-'));
  const envFilePath = nodePath.join(tempDir, '.env');

  writeFileSync(envFilePath, contents);
  return envFilePath;
}

describe('main env helpers', () => {
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

  test('loadEnv only loads once', async () => {
    const firstEnvPath = createTempEnv('ELECTRON_HELPER_ENV_ONCE=first');
    const secondEnvPath = nodePath.join(tempDir!, '.env.second');

    writeFileSync(secondEnvPath, 'ELECTRON_HELPER_ENV_ONCE=second');

    const envModule = await loadEnvModule();

    envModule.loadEnv({ path: firstEnvPath });
    envModule.loadEnv({ path: secondEnvPath });

    expect(process.env.ELECTRON_HELPER_ENV_ONCE).toBe('first');
  });
});
