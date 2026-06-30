import { app } from 'electron';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';

import type { App } from 'electron';

export type ModuleMetaUrl = string | URL;

export type PathConfig =
  | ModuleMetaUrl
  | {
      readonly metaUrl: ModuleMetaUrl;
    };

export type ElectronPathName = Parameters<App['getPath']>[0];

let getConfiguredModuleDirname: () => string | undefined = () => undefined;

function getMetaUrl(config: PathConfig): ModuleMetaUrl {
  if (typeof config === 'object' && 'metaUrl' in config) {
    return config.metaUrl;
  }

  return config;
}

function getRequiredModuleDirname(): string {
  const moduleDirname = getConfiguredModuleDirname();

  if (moduleDirname === undefined) {
    throw new Error(
      'electron-helper path is not configured. Call configurePath(import.meta.url) first.'
    );
  }

  return moduleDirname;
}

/** Registers a module meta URL for parameterless path resolution. */
export function configurePath(config: PathConfig): () => void {
  const restoreModuleDirname = getConfiguredModuleDirname;
  const moduleDirname        = getModuleDirname(getMetaUrl(config));

  getConfiguredModuleDirname = () => moduleDirname;

  return () => {
    getConfiguredModuleDirname = restoreModuleDirname;
  };
}

/** Returns the dirname for an explicit meta URL or the configured module. */
export function getModuleDirname(metaUrl?: ModuleMetaUrl): string {
  if (metaUrl === undefined) {
    return getRequiredModuleDirname();
  }

  return nodePath.dirname(fileURLToPath(metaUrl));
}

/** Resolves path segments from the configured module dirname. */
export function resolvePath(...segments: string[]): string {
  return nodePath.resolve(getRequiredModuleDirname(), ...segments);
}

/** Resolves path segments from an explicit module meta URL. */
export function resolvePathFromMetaUrl(
  metaUrl: ModuleMetaUrl,
  ...segments: string[]
): string {
  return nodePath.resolve(getModuleDirname(metaUrl), ...segments);
}

/** Resolves path segments from Electron's app path. */
export function resolveAppPath(...segments: string[]): string {
  return nodePath.resolve(app.getAppPath(), ...segments);
}

/** Resolves path segments from one of Electron's named app paths. */
export function resolveElectronPath(
  name: ElectronPathName,
  ...segments: string[]
): string {
  return nodePath.resolve(app.getPath(name), ...segments);
}
