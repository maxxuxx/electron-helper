import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs';
import nodePath from 'node:path';

import electron from 'electron';

import type { App } from 'electron';

/** Factory or value used to create default Electron settings */
export type SettingsDefaults<TSettings> = TSettings | (() => TSettings);

/** Options used to create a JSON-backed Electron settings store */
export type SettingsStoreOptions<TSettings> = {
  readonly defaults: SettingsDefaults<TSettings>;
  readonly directory?: string;
  readonly fileName?: string;
  readonly filePath?: string;
  readonly migrate?: (raw: unknown, defaults: TSettings) => TSettings;
};

/** JSON-backed settings store for Electron main processes */
export type SettingsStore<TSettings> = {
  readonly filePath: string;
  readonly read: () => TSettings;
  readonly restore: () => TSettings;
  readonly save: (settings: TSettings) => TSettings;
  readonly update: (updater: (settings: TSettings) => TSettings) => TSettings;
};

// Path helpers
function getElectronApp(): App {
  const electronApp = typeof electron === 'object' && electron !== null
    ? (electron as { readonly app?: App }).app
    : undefined;

  if (electronApp === undefined) {
    throw new Error(
      'Electron app is required to resolve the settings directory. Pass directory or filePath outside Electron'
    );
  }

  return electronApp;
}

function resolveSettingsFilePath<TSettings>({
  directory,
  fileName = 'settings.json',
  filePath
}: SettingsStoreOptions<TSettings>): string {
  if (filePath !== undefined) {
    return filePath;
  }

  return nodePath.join(
    directory ?? getElectronApp().getPath('userData'),
    fileName
  );
}

// Value helpers
function cloneSettings<TSettings>(settings: TSettings): TSettings {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(settings);
  }

  return JSON.parse(JSON.stringify(settings)) as TSettings;
}

function createDefaults<TSettings>(
  defaults: SettingsDefaults<TSettings>
): TSettings {
  const settings = typeof defaults === 'function'
    ? (defaults as () => TSettings)()
    : defaults;

  return cloneSettings(settings);
}

function writeSettingsFile(filePath: string, settings: unknown): void {
  mkdirSync(nodePath.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(settings, undefined, 2), 'utf8');
}

function readSettingsFile(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
}

function migrateSettings<TSettings>(
  rawSettings: unknown,
  filePath: string,
  options: SettingsStoreOptions<TSettings>
): TSettings {
  if (options.migrate === undefined) {
    return rawSettings as TSettings;
  }

  const settings = options.migrate(rawSettings, createDefaults(options.defaults));

  writeSettingsFile(filePath, settings);

  return settings;
}

function restoreSettings<TSettings>(
  filePath: string,
  defaults: SettingsDefaults<TSettings>
): TSettings {
  const settings = createDefaults(defaults);

  writeSettingsFile(filePath, settings);

  return settings;
}

/** Creates a JSON-backed settings store under Electron's `userData` path */
export function createSettingsStore<TSettings>(
  options: SettingsStoreOptions<TSettings>
): SettingsStore<TSettings> {
  const filePath = resolveSettingsFilePath(options);
  const read     = (): TSettings => {
    if (existsSync(filePath)) {
      let rawSettings: unknown;

      try {
        rawSettings = readSettingsFile(filePath);
      } catch {
        return restoreSettings(filePath, options.defaults);
      }

      return migrateSettings(rawSettings, filePath, options);
    }

    return restoreSettings(filePath, options.defaults);
  };
  const restore  = (): TSettings => restoreSettings(filePath, options.defaults);
  const save     = (settings: TSettings): TSettings => {
    writeSettingsFile(filePath, settings);

    return settings;
  };

  return {
    filePath,
    read,
    restore,
    save,
    update: (updater) => save(updater(read()))
  };
}
