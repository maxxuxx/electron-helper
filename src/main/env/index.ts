import { config as loadDotEnv } from 'dotenv';
import nodePath from 'node:path';

import type {
  DotenvConfigOptions,
  DotenvConfigOutput
} from 'dotenv';

export type EnvSource = Record<string, string | undefined>;

let isEnvLoaded = false;

function getDefaultEnvPath(): string {
  return nodePath.resolve(process.cwd(), '.env');
}

function loadEnvForProcess(source: EnvSource): void {
  if (source === process.env) {
    loadEnv();
  }
}

/** Loads a dotenv file once for process-level environment access */
export function loadEnv(
  options: DotenvConfigOptions = {}
): DotenvConfigOutput | undefined {
  if (isEnvLoaded) {
    return undefined;
  }

  isEnvLoaded = true;

  return loadDotEnv({
    path : getDefaultEnvPath(),
    quiet: true,
    ...options
  });
}

/** Returns an env value and treats an empty string as missing */
export function getEnv(
  key: string,
  source: EnvSource = process.env
): string | undefined {
  loadEnvForProcess(source);

  const value = source[key];
  return value === '' ? undefined : value;
}

/** Returns a required env value or throws when it is missing */
export function requireEnv(key: string, source: EnvSource = process.env): string {
  const value = getEnv(key, source);

  if (!value) {
    throw new Error(`Missing required env value: ${key}`);
  }

  return value;
}
