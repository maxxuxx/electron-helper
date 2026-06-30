import { contextBridge, ipcRenderer } from 'electron';

import { updaterBridgeChannels } from '#node/updater';

import type {
  UpdaterBridgeApi,
  UpdaterState
} from '#node/updater';

/** Options used to expose the updater bridge from preload */
export type ExposeUpdaterBridgeOptions = {
  readonly key?: string;
};

const defaultUpdaterBridgeKey = 'updater';

/** Creates a preload-safe updater API backed by Electron IPC */
export function createUpdaterBridgeApi(): UpdaterBridgeApi {
  return {
    checkForUpdates: async () => {
      await ipcRenderer.invoke(updaterBridgeChannels.checkForUpdates);
    },
    downloadUpdate: async () => {
      await ipcRenderer.invoke(updaterBridgeChannels.downloadUpdate);
    },
    getState: async () => {
      return await ipcRenderer.invoke(
        updaterBridgeChannels.getState
      ) as UpdaterState;
    },
    onState: (listener) => {
      const ipcListener = (_event: unknown, state: UpdaterState): void => {
        listener(state);
      };

      ipcRenderer.on(updaterBridgeChannels.state, ipcListener);

      return () => {
        ipcRenderer.off(updaterBridgeChannels.state, ipcListener);
      };
    },
    quitAndInstall: async () => {
      await ipcRenderer.invoke(updaterBridgeChannels.quitAndInstall);
    }
  };
}

/** Exposes the updater bridge API on the renderer global object */
export function exposeUpdaterBridge({
  key = defaultUpdaterBridgeKey
}: ExposeUpdaterBridgeOptions = {}): UpdaterBridgeApi {
  const api = createUpdaterBridgeApi();

  contextBridge.exposeInMainWorld(key, api);

  return api;
}
