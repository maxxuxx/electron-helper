import { createRequire } from 'node:module';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';

/** Accepted `import.meta.url` input shape */
export type ModuleMetaUrl = string | URL;

/** Returns the dirname for a module meta URL */
export function getCurrentDir(metaUrl: ModuleMetaUrl): string {
  return nodePath.dirname(fileURLToPath(metaUrl));
}

/** Resolves path segments from a module meta URL */
export function resolveCurrentDir(
  metaUrl: ModuleMetaUrl,
  ...segments: string[]
): string {
  return nodePath.resolve(getCurrentDir(metaUrl), ...segments);
}

/** Resolves a package import or module specifier from a module meta URL */
export function resolveModulePath(
  metaUrl: ModuleMetaUrl,
  specifier: string
): string {
  return createRequire(metaUrl).resolve(specifier);
}
