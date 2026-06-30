import { app } from 'electron';
import nodePath from 'node:path';

import type { App } from 'electron';

/** Name type accepted by Electron's `app.getPath` */
export type ElectronPathName = Parameters<App['getPath']>[0];

/** Resolves path segments from Electron's app path */
export function resolveAppPath(...segments: string[]): string {
  return nodePath.resolve(app.getAppPath(), ...segments);
}

/** Resolves path segments from one of Electron's named app paths */
export function resolveElectronPath(
  name: ElectronPathName,
  ...segments: string[]
): string {
  return nodePath.resolve(app.getPath(name), ...segments);
}
