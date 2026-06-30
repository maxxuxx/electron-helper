import { describe, expect, test, vi } from 'vitest';

import type { UpdaterBridgeApi, UpdaterState } from '#node/updater';

function createBridgeApi(): UpdaterBridgeApi & {
  readonly emitState: (state: UpdaterState) => void;
} {
  const listeners = new Set<(state: UpdaterState) => void>();

  return {
    checkForUpdates: vi.fn(async () => undefined),
    downloadUpdate : vi.fn(async () => undefined),
    getState       : vi.fn(async () => ({
      status: 'idle' as const
    })),
    onState: vi.fn((listener: (state: UpdaterState) => void) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }),
    quitAndInstall: vi.fn(async () => undefined),
    emitState: (state: UpdaterState) => {
      for (const listener of listeners) {
        listener(state);
      }
    }
  };
}

describe('renderer updater client helpers', () => {
  test('createUpdaterClient wraps bridge commands and tracks subscribed state', async () => {
    const rendererModule = await import('#renderer/updater');
    const bridgeApi      = createBridgeApi();
    const updaterClient  = rendererModule.createUpdaterClient(bridgeApi);
    const listener       = vi.fn();

    const unsubscribe = updaterClient.subscribe(listener);

    bridgeApi.emitState({
      progress: {
        bytesPerSecond: 1024,
        percent       : 25,
        total         : 400,
        transferred   : 100
      },
      status: 'downloading'
    });

    await updaterClient.checkForUpdates();
    await updaterClient.downloadUpdate();
    await updaterClient.quitAndInstall();
    unsubscribe();

    expect(listener).toHaveBeenCalledWith({
      progress: {
        bytesPerSecond: 1024,
        percent       : 25,
        total         : 400,
        transferred   : 100
      },
      status: 'downloading'
    });
    expect(updaterClient.getSnapshot()).toEqual({
      progress: {
        bytesPerSecond: 1024,
        percent       : 25,
        total         : 400,
        transferred   : 100
      },
      status: 'downloading'
    });
    expect(bridgeApi.checkForUpdates).toHaveBeenCalledOnce();
    expect(bridgeApi.downloadUpdate).toHaveBeenCalledOnce();
    expect(bridgeApi.quitAndInstall).toHaveBeenCalledOnce();
  });
});
