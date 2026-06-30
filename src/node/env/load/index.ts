import { config as loadDotEnv } from 'dotenv';
import nodePath from 'node:path';

import { markEnvLoaded } from '../internal/state.js';

import type {
  DotenvConfigOptions,
  DotenvConfigOutput
} from 'dotenv';

function getDefaultEnvPath(): string {
  return nodePath.resolve(process.cwd(), '.env');
}

/** Loads a dotenv file once for process-level environment access */
export function loadEnv(
  options: DotenvConfigOptions = {}
): DotenvConfigOutput | undefined {
  if (!markEnvLoaded()) {
    return undefined;
  }

  return loadDotEnv({
    path : getDefaultEnvPath(),
    quiet: true,
    ...options
  });
}
