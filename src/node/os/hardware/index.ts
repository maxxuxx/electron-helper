import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';

// Types

/** Runs a hardware UUID lookup command and returns stdout */
export type HardwareUuidCommandRunner = (
  command: string,
  args: readonly string[],
  options: { readonly timeoutMs: number }
) => Promise<string>;

/** Reads a hardware UUID source file and returns its text contents */
export type HardwareUuidFileReader = (filePath: string) => Promise<string>;

/** Options used to read the OS-provided hardware UUID */
export type HardwareUuidOptions = {
  readonly commandRunner?: HardwareUuidCommandRunner;
  readonly fileReader?: HardwareUuidFileReader;
  readonly platform?: NodeJS.Platform;
  readonly timeoutMs?: number;
};

// Constants

const DEFAULT_TIMEOUT_MS = 5000;
const HARDWARE_UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const LINUX_HARDWARE_UUID_PATH = '/sys/class/dmi/id/product_uuid';
const MACOS_HARDWARE_UUID_ARGS = [
  '-rd1',
  '-c',
  'IOPlatformExpertDevice'
] as const;
const WINDOWS_CIM_UUID_ARGS = [
  '-NoProfile',
  '-NonInteractive',
  '-ExecutionPolicy',
  'Bypass',
  '-Command',
  '(Get-CimInstance -ClassName Win32_ComputerSystemProduct).UUID'
] as const;
const WINDOWS_WMIC_UUID_ARGS = ['csproduct', 'get', 'UUID'] as const;

// Default adapters

function runHardwareUuidCommand(
  command: string,
  args: readonly string[],
  options: { readonly timeoutMs: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      [...args],
      {
        encoding   : 'utf8',
        timeout    : options.timeoutMs,
        windowsHide: true
      },
      (error, stdout) => {
        if (error !== null) {
          reject(error);
          return;
        }

        resolve(stdout);
      }
    );
  });
}

async function readHardwareUuidFile(filePath: string): Promise<string> {
  return await readFile(filePath, 'utf8');
}

// Value helpers

function normalizeHardwareUuid(output: string): string | undefined {
  const uuid = output.trim().match(HARDWARE_UUID_PATTERN)?.[0].toLowerCase();

  if (
    uuid === undefined
    || uuid === '00000000-0000-0000-0000-000000000000'
    || uuid === 'ffffffff-ffff-ffff-ffff-ffffffffffff'
  ) {
    return undefined;
  }

  return uuid;
}

async function readCommandHardwareUuid(
  commandRunner: HardwareUuidCommandRunner,
  timeoutMs: number,
  command: string,
  args: readonly string[]
): Promise<string | undefined> {
  try {
    return normalizeHardwareUuid(
      await commandRunner(command, args, { timeoutMs })
    );
  } catch {
    return undefined;
  }
}

// Platform readers

async function readWindowsHardwareUuid(
  commandRunner: HardwareUuidCommandRunner,
  timeoutMs: number
): Promise<string | undefined> {
  const cimUuid = await readCommandHardwareUuid(
    commandRunner,
    timeoutMs,
    'powershell.exe',
    WINDOWS_CIM_UUID_ARGS
  );

  if (cimUuid !== undefined) {
    return cimUuid;
  }

  return await readCommandHardwareUuid(
    commandRunner,
    timeoutMs,
    'wmic',
    WINDOWS_WMIC_UUID_ARGS
  );
}

async function readMacOSHardwareUuid(
  commandRunner: HardwareUuidCommandRunner,
  timeoutMs: number
): Promise<string | undefined> {
  return await readCommandHardwareUuid(
    commandRunner,
    timeoutMs,
    'ioreg',
    MACOS_HARDWARE_UUID_ARGS
  );
}

async function readLinuxHardwareUuid(
  fileReader: HardwareUuidFileReader
): Promise<string | undefined> {
  try {
    return normalizeHardwareUuid(
      await fileReader(LINUX_HARDWARE_UUID_PATH)
    );
  } catch {
    return undefined;
  }
}

// Public API

/** Returns the OS-provided hardware UUID when the current platform exposes one */
export async function getHardwareUuid(
  options: HardwareUuidOptions = {}
): Promise<string | undefined> {
  const commandRunner = options.commandRunner ?? runHardwareUuidCommand;
  const fileReader    = options.fileReader ?? readHardwareUuidFile;
  const platform      = options.platform ?? process.platform;
  const timeoutMs     = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  if (platform === 'win32') {
    return await readWindowsHardwareUuid(commandRunner, timeoutMs);
  }

  if (platform === 'darwin') {
    return await readMacOSHardwareUuid(commandRunner, timeoutMs);
  }

  if (platform === 'linux') {
    return await readLinuxHardwareUuid(fileReader);
  }

  return undefined;
}

/** Returns the OS-provided hardware UUID or throws when it cannot be read */
export async function requireHardwareUuid(
  options: HardwareUuidOptions = {}
): Promise<string> {
  const platform = options.platform ?? process.platform;
  const uuid     = await getHardwareUuid(options);

  if (uuid === undefined) {
    throw new Error(`Missing hardware UUID for platform: ${platform}`);
  }

  return uuid;
}
