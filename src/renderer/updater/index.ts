import type {
  UpdaterBridgeApi,
  UpdaterState
} from '#node/updater';

/** Renderer updater client with commands, subscriptions, and cached state */
export type UpdaterClient = {
  readonly checkForUpdates: () => Promise<void>;
  readonly downloadUpdate: () => Promise<void>;
  readonly getSnapshot: () => UpdaterState | undefined;
  readonly getState: () => Promise<UpdaterState>;
  readonly quitAndInstall: () => Promise<void>;
  readonly subscribe: (
    listener: (state: UpdaterState) => void
  ) => () => void;
};

/** Creates a renderer-friendly updater client from a preload bridge API */
export function createUpdaterClient(
  bridgeApi: UpdaterBridgeApi
): UpdaterClient {
  let currentState: UpdaterState | undefined;

  return {
    checkForUpdates: bridgeApi.checkForUpdates,
    downloadUpdate : bridgeApi.downloadUpdate,
    getSnapshot    : () => currentState,
    getState       : async () => {
      currentState = await bridgeApi.getState();

      return currentState;
    },
    quitAndInstall: bridgeApi.quitAndInstall,
    subscribe     : (listener) => {
      return bridgeApi.onState((state) => {
        currentState = state;
        listener(state);
      });
    }
  };
}
