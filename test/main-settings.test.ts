import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import nodeOs from 'node:os';
import nodePath from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({
  getPath: vi.fn((name: string) => `/electron/${name}`)
}));

vi.mock('electron', () => ({
  app    : electronApp,
  default: {
    app: electronApp
  }
}));

type SettingsStore<TSettings> = {
  readonly filePath: string;
  readonly read: () => TSettings;
  readonly restore: () => TSettings;
  readonly save: (settings: TSettings) => TSettings;
  readonly update: (updater: (settings: TSettings) => TSettings) => TSettings;
};

type SettingsModule = {
  readonly createSettingsStore: <TSettings>(
    options: {
      readonly defaults: TSettings | (() => TSettings);
      readonly fileName?: string;
      readonly migrate?: (raw: unknown, defaults: TSettings) => TSettings;
    }
  ) => SettingsStore<TSettings>;
};

let userDataDir: string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value);
}

function writeSettingsFile(filePath: string, settings: unknown): void {
  writeFileSync(filePath, JSON.stringify(settings, undefined, 2), 'utf8');
}

beforeEach(() => {
  userDataDir = mkdtempSync(
    nodePath.join(nodeOs.tmpdir(), 'electron-helper-settings-')
  );
  electronApp.getPath.mockReturnValue(userDataDir);
});

afterEach(() => {
  rmSync(userDataDir, { force: true, recursive: true });
  vi.clearAllMocks();
});

async function loadSettingsModule(): Promise<SettingsModule> {
  return await import('#main/settings') as SettingsModule;
}

describe('main settings helpers', () => {
  test('read creates a missing settings file from defaults', async () => {
    const settingsModule = await loadSettingsModule();
    const store          = settingsModule.createSettingsStore({
      defaults: () => ({
        theme       : 'system',
        useAutoStart: false
      })
    });

    expect(store.filePath).toBe(nodePath.join(userDataDir, 'settings.json'));
    expect(store.read()).toEqual({
      theme       : 'system',
      useAutoStart: false
    });
    expect(JSON.parse(readFileSync(store.filePath, 'utf8'))).toEqual({
      theme       : 'system',
      useAutoStart: false
    });
    expect(electronApp.getPath).toHaveBeenCalledWith('userData');
  });

  test('save persists settings for the next read', async () => {
    const settingsModule = await loadSettingsModule();
    const store          = settingsModule.createSettingsStore({
      defaults: () => ({
        theme       : 'system',
        useAutoStart: false
      })
    });

    expect(store.save({
      theme       : 'dark',
      useAutoStart: true
    })).toEqual({
      theme       : 'dark',
      useAutoStart: true
    });
    expect(JSON.parse(readFileSync(store.filePath, 'utf8'))).toEqual({
      theme       : 'dark',
      useAutoStart: true
    });
    expect(store.read()).toEqual({
      theme       : 'dark',
      useAutoStart: true
    });
  });

  test('update saves settings derived from the current snapshot', async () => {
    const settingsModule = await loadSettingsModule();
    const store          = settingsModule.createSettingsStore({
      defaults: () => ({
        theme       : 'system',
        useAutoStart: false
      })
    });

    expect(
      store.update((settings) => ({
        ...settings,
        theme: 'dark'
      }))
    ).toEqual({
      theme       : 'dark',
      useAutoStart: false
    });
    expect(store.read()).toEqual({
      theme       : 'dark',
      useAutoStart: false
    });
  });

  test('restore resets settings to defaults and persists them', async () => {
    const settingsModule = await loadSettingsModule();
    const store          = settingsModule.createSettingsStore({
      defaults: () => ({
        theme       : 'system',
        useAutoStart: false
      })
    });

    store.save({
      theme       : 'dark',
      useAutoStart: true
    });

    expect(store.restore()).toEqual({
      theme       : 'system',
      useAutoStart: false
    });
    expect(JSON.parse(readFileSync(store.filePath, 'utf8'))).toEqual({
      theme       : 'system',
      useAutoStart: false
    });
  });

  test('restore uses a fresh copy of object defaults', async () => {
    const settingsModule = await loadSettingsModule();
    const defaultSettings: {
      nested: {
        theme: string;
      };
    } = {
      nested: {
        theme: 'system'
      }
    };
    const store = settingsModule.createSettingsStore({
      defaults: defaultSettings
    });
    const firstRead = store.read();

    firstRead.nested.theme = 'dark';

    expect(store.restore()).toEqual({
      nested: {
        theme: 'system'
      }
    });
  });

  test('read migrates existing settings and persists the migrated shape', async () => {
    const settingsModule = await loadSettingsModule();
    const filePath       = nodePath.join(userDataDir, 'settings.json');

    writeSettingsFile(filePath, {
      theme: 'dark'
    });

    const store = settingsModule.createSettingsStore({
      defaults: () => ({
        schemaVersion: 2,
        theme        : 'system',
        useAutoStart : false
      }),
      migrate: (raw, defaults) => ({
        ...defaults,
        ...(isRecord(raw) ? raw : {}),
        schemaVersion: 2
      })
    });

    expect(store.read()).toEqual({
      schemaVersion: 2,
      theme        : 'dark',
      useAutoStart : false
    });
    expect(JSON.parse(readFileSync(filePath, 'utf8'))).toEqual({
      schemaVersion: 2,
      theme        : 'dark',
      useAutoStart : false
    });
  });

  test('read restores defaults when the settings file is invalid JSON', async () => {
    const settingsModule = await loadSettingsModule();
    const filePath       = nodePath.join(userDataDir, 'settings.json');

    writeFileSync(filePath, '{ invalid json', 'utf8');

    const store = settingsModule.createSettingsStore({
      defaults: () => ({
        theme       : 'system',
        useAutoStart: false
      })
    });

    expect(store.read()).toEqual({
      theme       : 'system',
      useAutoStart: false
    });
    expect(JSON.parse(readFileSync(filePath, 'utf8'))).toEqual({
      theme       : 'system',
      useAutoStart: false
    });
  });

  test('main index re-exports settings helpers', async () => {
    const settingsModule = await loadSettingsModule();
    const mainModule     = await import('../src/main/index.js');

    expect(mainModule.createSettingsStore).toBe(
      settingsModule.createSettingsStore
    );
  });
});
