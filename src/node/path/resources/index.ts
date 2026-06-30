import nodePath from 'node:path';

type ProcessWithResourcesPath = NodeJS.Process & {
  readonly resourcesPath?: string;
};

/** Returns Electron's resources directory from the process object */
export function getResourcesPath(): string {
  const resourcesPath = (process as ProcessWithResourcesPath).resourcesPath;

  if (resourcesPath === undefined) {
    throw new Error(
      'process.resourcesPath is not available in this runtime.'
    );
  }

  return resourcesPath;
}

/** Resolves path segments from Electron's resources directory */
export function resolveResourcesPath(...segments: string[]): string {
  return nodePath.resolve(getResourcesPath(), ...segments);
}
