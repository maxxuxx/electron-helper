// Exports
export * from './hardware/index.js';

// Types

/** Node platform value used by OS helper checks */
export type OsPlatform = NodeJS.Platform;

// Platform checks

/** Returns the current Node platform value */
export function getOsPlatform(): OsPlatform {
  return process.platform;
}

/** Returns true when the platform is macOS */
export function isMacOS(platform: OsPlatform = getOsPlatform()): boolean {
  return platform === 'darwin';
}

/** Returns true when the platform is Windows */
export function isWindows(platform: OsPlatform = getOsPlatform()): boolean {
  return platform === 'win32';
}

/** Returns true when the platform is Linux */
export function isLinux(platform: OsPlatform = getOsPlatform()): boolean {
  return platform === 'linux';
}
