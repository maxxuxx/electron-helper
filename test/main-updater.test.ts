import { beforeEach, describe, expect, test, vi } from 'vitest';

const electronIpcMain = vi.hoisted(() => ({
  handle       : vi.fn(),
  removeHandler: vi.fn()
}));

vi.mock('electron', () => ({
  ipcMain: electronIpcMain
}));

type FakeUpdaterListener = (...args: unknown[]) => void;

type FakeUpdater = {
  autoDownload: boolean;
  checkForUpdates: ReturnType<typeof vi.fn>;
  downloadUpdate: ReturnType<typeof vi.fn>;
  quitAndInstall: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  emit: (eventName: string, ...args: unknown[]) => void;
};

type FakeWindow = {
  readonly isDestroyed: ReturnType<typeof vi.fn>;
  readonly webContents: {
    readonly send: ReturnType<typeof vi.fn>;
  };
};

function createFakeUpdater(): FakeUpdater {
  const listeners = new Map<string, FakeUpdaterListener[]>();

  return {
    autoDownload   : true,
    checkForUpdates: vi.fn(async () => undefined),
    downloadUpdate : vi.fn(async () => undefined),
    quitAndInstall : vi.fn(),
    on             : vi.fn((eventName: string, listener: FakeUpdaterListener) => {
      listeners.set(eventName, [
        ...(listeners.get(eventName) ?? []),
        listener
      ]);
    }),
    off: vi.fn((eventName: string, listener: FakeUpdaterListener) => {
      listeners.set(
        eventName,
        (listeners.get(eventName) ?? []).filter((value) => value !== listener)
      );
    }),
    emit: (eventName: string, ...args: unknown[]) => {
      for (const listener of listeners.get(eventName) ?? []) {
        listener(...args);
      }
    }
  };
}

function createFakeWindow(): FakeWindow {
  return {
    isDestroyed: vi.fn(() => false),
    webContents: {
      send: vi.fn()
    }
  };
}

beforeEach(() => {
  electronIpcMain.handle.mockClear();
  electronIpcMain.removeHandler.mockClear();
});

describe('main updater bridge helpers', () => {
  test('registerUpdaterBridge broadcasts normalized updater state to every target window', async () => {
    const updaterModule = await import('#main/updater');
    const updater       = createFakeUpdater();
    const firstWindow   = createFakeWindow();
    const secondWindow  = createFakeWindow();

    updaterModule.registerUpdaterBridge({
      autoDownload: false,
      getWindows  : () => [firstWindow, secondWindow],
      updater
    });

    updater.emit('checking-for-update');
    updater.emit('update-available', {
      version: '1.2.3'
    });
    updater.emit('download-progress', {
      bytesPerSecond: 2048,
      percent       : 50,
      total         : 1000,
      transferred   : 500
    });

    expect(updater.autoDownload).toBe(false);
    expect(firstWindow.webContents.send).toHaveBeenCalledWith(
      'electron-helper:updater:state',
      {
        status: 'checking'
      }
    );
    expect(secondWindow.webContents.send).toHaveBeenCalledWith(
      'electron-helper:updater:state',
      {
        progress: {
          bytesPerSecond: 2048,
          percent       : 50,
          total         : 1000,
          transferred   : 500
        },
        status : 'downloading',
        version: '1.2.3'
      }
    );
  });

  test('main index re-exports updater bridge helpers', async () => {
    const updaterModule = await import('#main/updater');
    const mainModule    = await import('../src/main/index.js');

    expect(mainModule.registerUpdaterBridge).toBe(
      updaterModule.registerUpdaterBridge
    );
  });
});
