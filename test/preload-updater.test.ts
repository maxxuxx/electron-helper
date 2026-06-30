import { beforeEach, describe, expect, test, vi } from 'vitest';

import { updaterBridgeChannels } from '#node/updater';

import type { UpdaterBridgeApi, UpdaterState } from '#node/updater';

const electronContextBridge = vi.hoisted(() => ({
  exposeInMainWorld: vi.fn()
}));

const electronIpcRenderer = vi.hoisted(() => ({
  invoke: vi.fn(),
  off   : vi.fn(),
  on    : vi.fn()
}));

vi.mock('electron', () => ({
  contextBridge: electronContextBridge,
  ipcRenderer  : electronIpcRenderer
}));

beforeEach(() => {
  electronContextBridge.exposeInMainWorld.mockClear();
  electronIpcRenderer.invoke.mockReset();
  electronIpcRenderer.off.mockClear();
  electronIpcRenderer.on.mockClear();
});

describe('preload updater bridge helpers', () => {
  test('exposeUpdaterBridge exposes updater commands and state subscription', async () => {
    const preloadModule = await import('#preload/updater');
    const state = {
      status: 'checking'
    } satisfies UpdaterState;

    electronIpcRenderer.invoke.mockResolvedValue(state);

    preloadModule.exposeUpdaterBridge({
      key: 'updater'
    });

    const [, api] = electronContextBridge.exposeInMainWorld.mock.calls[0]! as [
      string,
      UpdaterBridgeApi
    ];
    const listener = vi.fn();
    const unsubscribe = api.onState(listener);

    const stateListenerCall = electronIpcRenderer.on.mock.calls[0];

    expect(stateListenerCall).toBeDefined();

    const [, ipcListener] = stateListenerCall!;

    ipcListener({}, state);

    await expect(api.getState()).resolves.toEqual(state);
    await api.checkForUpdates();
    await api.downloadUpdate();
    await api.quitAndInstall();
    unsubscribe();

    expect(electronContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
      'updater',
      expect.any(Object)
    );
    expect(electronIpcRenderer.invoke).toHaveBeenCalledWith(
      updaterBridgeChannels.getState
    );
    expect(electronIpcRenderer.invoke).toHaveBeenCalledWith(
      updaterBridgeChannels.checkForUpdates
    );
    expect(electronIpcRenderer.invoke).toHaveBeenCalledWith(
      updaterBridgeChannels.downloadUpdate
    );
    expect(electronIpcRenderer.invoke).toHaveBeenCalledWith(
      updaterBridgeChannels.quitAndInstall
    );
    expect(electronIpcRenderer.on).toHaveBeenCalledWith(
      updaterBridgeChannels.state,
      expect.any(Function)
    );
    expect(listener).toHaveBeenCalledWith(state);
    expect(electronIpcRenderer.off).toHaveBeenCalledWith(
      updaterBridgeChannels.state,
      ipcListener
    );
  });
});
