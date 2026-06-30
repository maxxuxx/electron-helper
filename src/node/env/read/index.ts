import { loadEnv } from '../load/index.js';

/** Record shape for custom environment sources */
export type EnvSource = Record<string, string | undefined>;

function loadEnvForProcess(source: EnvSource): void {
  if (source === process.env) {
    loadEnv();
  }
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
