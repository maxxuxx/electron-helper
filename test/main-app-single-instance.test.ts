import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { BrowserWindow } from 'electron';

const electronApp = vi.hoisted(() => ({
  on                       : vi.fn(),
  quit                     : vi.fn(),
  requestSingleInstanceLock: vi.fn(() => true)
}));

const electronBrowserWindow = vi.hoisted(() => ({
  getFocusedWindow: vi.fn()
}));

vi.mock('electron', () => ({
  app          : electronApp,
  BrowserWindow: electronBrowserWindow
}));

type FakeBrowserWindow = {
  readonly focus      : ReturnType<typeof vi.fn>;
  readonly isDestroyed: ReturnType<typeof vi.fn>;
  readonly isMinimized: ReturnType<typeof vi.fn>;
  readonly isVisible  : ReturnType<typeof vi.fn>;
  readonly restore    : ReturnType<typeof vi.fn>;
  readonly show       : ReturnType<typeof vi.fn>;
};

function createFakeWindow({
  destroyed = false,
  minimized = false,
  visible   = true
}: {
  readonly destroyed?: boolean;
  readonly minimized?: boolean;
  readonly visible?: boolean;
} = {}): FakeBrowserWindow {
  return {
    focus      : vi.fn(),
    isDestroyed: vi.fn(() => destroyed),
    isMinimized: vi.fn(() => minimized),
    isVisible  : vi.fn(() => visible),
    restore    : vi.fn(),
    show       : vi.fn()
  };
}

function asBrowserWindow(window: FakeBrowserWindow): BrowserWindow {
  return window as unknown as BrowserWindow;
}

function emitSecondInstance() {
  const listener = electronApp.on.mock.calls.find(
    ([eventName]) => eventName === 'second-instance'
  )?.[1];

  expect(listener).toEqual(expect.any(Function));

  listener();
}

beforeEach(() => {
  electronApp.on.mockClear();
  electronApp.quit.mockClear();
  electronApp.requestSingleInstanceLock.mockReset();
  electronApp.requestSingleInstanceLock.mockReturnValue(true);
  electronBrowserWindow.getFocusedWindow.mockReset();
});

describe('main app single-instance helpers', () => {
  test('setSingleInstance accepts an existing window', async () => {
    const appModule = await import('#main/app/single-instance');
    const window    = createFakeWindow({
      minimized: true,
      visible  : false
    });

    expect(appModule.setSingleInstance(asBrowserWindow(window))).toBe(true);

    emitSecondInstance();

    expect(window.restore).toHaveBeenCalledOnce();
    expect(window.show).toHaveBeenCalledOnce();
    expect(window.focus).toHaveBeenCalledOnce();
  });

  test('setSingleInstance accepts a window getter', async () => {
    const appModule = await import('#main/app/single-instance');
    let window      = createFakeWindow({
      minimized: true,
      visible  : false
    });

    expect(appModule.setSingleInstance(() => asBrowserWindow(window))).toBe(true);

    window = createFakeWindow();

    emitSecondInstance();

    expect(window.focus).toHaveBeenCalledOnce();
  });

  test('setSingleInstance quits and returns false when another instance owns the lock', async () => {
    const appModule = await import('#main/app/single-instance');

    electronApp.requestSingleInstanceLock.mockReturnValue(false);

    expect(appModule.setSingleInstance()).toBe(false);
    expect(electronApp.quit).toHaveBeenCalledOnce();
    expect(electronApp.on).not.toHaveBeenCalled();
  });

  test('main app route re-exports single-instance helpers', async () => {
    const appModule            = await import('#main/app');
    const singleInstanceModule = await import('#main/app/single-instance');

    expect(appModule.setSingleInstance).toBe(
      singleInstanceModule.setSingleInstance
    );
  });

  test('main index re-exports app helpers', async () => {
    const appModule  = await import('#main/app');
    const mainModule = await import('../src/main/index.js');

    expect(mainModule.setSingleInstance).toBe(appModule.setSingleInstance);
  });
});
