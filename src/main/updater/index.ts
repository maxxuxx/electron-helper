import { createRequire } from 'node:module';

import { ipcMain } from 'electron';

import {
  serializeUpdaterError,
  serializeUpdaterInfo,
  serializeUpdaterProgress,
  updaterBridgeChannels
} from '#node/updater';

import type {
  UpdaterAdapter,
  UpdaterEventName,
  UpdaterInfo,
  UpdaterState
} from '#node/updater';

type UpdaterEventListener = (...args: unknown[]) => void;

/** BrowserWindow-compatible target that can receive updater bridge state */
export type UpdaterTargetWindow = {
  readonly isDestroyed: () => boolean;
  readonly webContents: {
    readonly send: (channel: string, ...args: unknown[]) => void;
  };
};

/** Options used to connect electron-updater state to renderer windows */
export type UpdaterBridgeOptions = {
  readonly autoDownload?: boolean;
  readonly getWindows: () => readonly UpdaterTargetWindow[];
  readonly updater?: UpdaterAdapter;
};

/** Registered updater bridge controller for inspection and cleanup */
export type RegisteredUpdaterBridge = {
  readonly getState: () => UpdaterState;
  readonly unregister: () => void;
};

const requireOptionalPeer = createRequire(import.meta.url);

function resolveUpdaterAdapter(
  updater: UpdaterAdapter | undefined
): UpdaterAdapter {
  if (updater !== undefined) {
    return updater;
  }

  try {
    const updaterModule = requireOptionalPeer('electron-updater') as {
      readonly autoUpdater?: UpdaterAdapter;
    };

    if (updaterModule.autoUpdater !== undefined) {
      return updaterModule.autoUpdater;
    }
  } catch {
    // Fall through to the explicit optional peer error below
  }

  throw new Error(
    'electron-updater is required to use registerUpdaterBridge without a custom updater.'
  );
}

function sendStateToWindow(
  browserWindow: UpdaterTargetWindow,
  state: UpdaterState
): void {
  if (browserWindow.isDestroyed()) {
    return;
  }

  browserWindow.webContents.send(updaterBridgeChannels.state, state);
}

function getCurrentUpdateInfo(state: UpdaterState): UpdaterInfo {
  return {
    ...(state.releaseDate !== undefined
      ? { releaseDate: state.releaseDate }
      : {}),
    ...(state.version !== undefined ? { version: state.version } : {})
  };
}

/** Registers electron-updater event and IPC handlers for renderer update UI */
export function registerUpdaterBridge({
  autoDownload,
  getWindows,
  updater
}: UpdaterBridgeOptions): RegisteredUpdaterBridge {
  const updaterAdapter = resolveUpdaterAdapter(updater);
  let currentState: UpdaterState = {
    status: 'idle'
  };

  if (autoDownload !== undefined) {
    updaterAdapter.autoDownload = autoDownload;
  }

  const setState = (state: UpdaterState): void => {
    currentState = state;

    for (const browserWindow of getWindows()) {
      sendStateToWindow(browserWindow, currentState);
    }
  };

  const listeners: Array<readonly [UpdaterEventName, UpdaterEventListener]> = [
    [
      'checking-for-update',
      () => {
        setState({
          status: 'checking'
        });
      }
    ],
    [
      'update-available',
      (info) => {
        setState({
          ...serializeUpdaterInfo(info),
          status: 'available'
        });
      }
    ],
    [
      'update-not-available',
      (info) => {
        setState({
          ...serializeUpdaterInfo(info),
          status: 'not-available'
        });
      }
    ],
    [
      'download-progress',
      (progress) => {
        const serializedProgress = serializeUpdaterProgress(progress);

        setState({
          ...getCurrentUpdateInfo(currentState),
          ...(serializedProgress !== undefined
            ? { progress: serializedProgress }
            : {}),
          status: 'downloading'
        });
      }
    ],
    [
      'update-downloaded',
      (info) => {
        setState({
          ...serializeUpdaterInfo(info),
          status: 'downloaded'
        });
      }
    ],
    [
      'error',
      (error) => {
        setState({
          error : serializeUpdaterError(error),
          status: 'error'
        });
      }
    ]
  ];

  for (const [eventName, listener] of listeners) {
    updaterAdapter.on(eventName, listener);
  }

  ipcMain.handle(updaterBridgeChannels.getState, () => currentState);
  ipcMain.handle(updaterBridgeChannels.checkForUpdates, async () => {
    await updaterAdapter.checkForUpdates();
  });
  ipcMain.handle(updaterBridgeChannels.downloadUpdate, async () => {
    await updaterAdapter.downloadUpdate();
  });
  ipcMain.handle(updaterBridgeChannels.quitAndInstall, () => {
    updaterAdapter.quitAndInstall();
  });

  return {
    getState: () => currentState,
    unregister: () => {
      for (const [eventName, listener] of listeners) {
        updaterAdapter.off?.(eventName, listener);
      }

      ipcMain.removeHandler(updaterBridgeChannels.getState);
      ipcMain.removeHandler(updaterBridgeChannels.checkForUpdates);
      ipcMain.removeHandler(updaterBridgeChannels.downloadUpdate);
      ipcMain.removeHandler(updaterBridgeChannels.quitAndInstall);
    }
  };
}
