/** Shared IPC channel names for updater bridge commands and state events */
export const updaterBridgeChannels = {
  checkForUpdates : 'electron-helper:updater:check-for-updates',
  downloadUpdate  : 'electron-helper:updater:download-update',
  getState        : 'electron-helper:updater:get-state',
  quitAndInstall  : 'electron-helper:updater:quit-and-install',
  state           : 'electron-helper:updater:state'
} as const;

/** Normalized updater state names used by renderer UI code */
export type UpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

/** Serializable download progress payload for updater state changes */
export type UpdaterProgress = {
  readonly bytesPerSecond: number;
  readonly percent: number;
  readonly total: number;
  readonly transferred: number;
};

/** Serializable updater error payload for renderer-safe state changes */
export type UpdaterError = {
  readonly message: string;
  readonly name?: string;
  readonly stack?: string;
};

/** Serializable update metadata used by available and downloaded states */
export type UpdaterInfo = {
  readonly releaseDate?: string;
  readonly version?: string;
};

/** Renderer-safe updater state shared by main, preload, and renderer modules */
export type UpdaterState = UpdaterInfo & {
  readonly error?: UpdaterError;
  readonly progress?: UpdaterProgress;
  readonly status: UpdaterStatus;
};

/** Event names consumed from electron-updater compatible adapters */
export type UpdaterEventName =
  | 'checking-for-update'
  | 'update-available'
  | 'update-not-available'
  | 'download-progress'
  | 'update-downloaded'
  | 'error';

/** Minimal updater surface required by the updater bridge */
export type UpdaterAdapter = {
  autoDownload: boolean;
  checkForUpdates: () => Promise<unknown>;
  downloadUpdate: () => Promise<unknown>;
  off?: (
    eventName: UpdaterEventName,
    listener: (...args: unknown[]) => void
  ) => unknown;
  on: (
    eventName: UpdaterEventName,
    listener: (...args: unknown[]) => void
  ) => unknown;
  quitAndInstall: () => void;
};

/** API shape exposed from preload to renderer updater clients */
export type UpdaterBridgeApi = {
  readonly checkForUpdates: () => Promise<void>;
  readonly downloadUpdate: () => Promise<void>;
  readonly getState: () => Promise<UpdaterState>;
  readonly onState: (
    listener: (state: UpdaterState) => void
  ) => () => void;
  readonly quitAndInstall: () => Promise<void>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(
  source: Record<string, unknown>,
  key: string
): number | undefined {
  const value = source[key];

  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function readString(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  const value = source[key];

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Converts unknown update metadata into a renderer-safe update info object */
export function serializeUpdaterInfo(info: unknown): UpdaterInfo {
  if (!isRecord(info)) {
    return {};
  }

  const releaseDate = readString(info, 'releaseDate');
  const version     = readString(info, 'version');

  return {
    ...(releaseDate !== undefined ? { releaseDate } : {}),
    ...(version !== undefined ? { version } : {})
  };
}

/** Converts unknown progress metadata into a renderer-safe progress object */
export function serializeUpdaterProgress(
  progress: unknown
): UpdaterProgress | undefined {
  if (!isRecord(progress)) {
    return undefined;
  }

  const bytesPerSecond = readNumber(progress, 'bytesPerSecond');
  const percent        = readNumber(progress, 'percent');
  const total          = readNumber(progress, 'total');
  const transferred    = readNumber(progress, 'transferred');

  if (
    bytesPerSecond === undefined
    || percent === undefined
    || total === undefined
    || transferred === undefined
  ) {
    return undefined;
  }

  return {
    bytesPerSecond,
    percent,
    total,
    transferred
  };
}

/** Converts unknown errors into renderer-safe updater error payloads */
export function serializeUpdaterError(error: unknown): UpdaterError {
  if (error instanceof Error) {
    return {
      message: error.message,
      ...(error.name.length > 0 ? { name: error.name } : {}),
      ...(error.stack !== undefined ? { stack: error.stack } : {})
    };
  }

  if (typeof error === 'string') {
    return {
      message: error
    };
  }

  return {
    message: 'Unknown updater error'
  };
}
