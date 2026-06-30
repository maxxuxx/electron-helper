import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { BrowserWindow, Rectangle } from 'electron';

const electronBrowserWindow = vi.hoisted(() => ({
  getFocusedWindow: vi.fn()
}));

const electronScreen = vi.hoisted(() => ({
  getDisplayMatching: vi.fn()
}));

vi.mock('electron', () => ({
  BrowserWindow: electronBrowserWindow,
  screen       : electronScreen
}));

type FakeWindowState = {
  readonly destroyed?: boolean;
  readonly minimized?: boolean;
  readonly visible?: boolean;
};

type FakeBrowserWindow = {
  readonly focus       : ReturnType<typeof vi.fn>;
  readonly getBounds   : ReturnType<typeof vi.fn>;
  readonly isDestroyed : ReturnType<typeof vi.fn>;
  readonly isMinimized : ReturnType<typeof vi.fn>;
  readonly isVisible   : ReturnType<typeof vi.fn>;
  readonly once        : ReturnType<typeof vi.fn>;
  readonly restore     : ReturnType<typeof vi.fn>;
  readonly setBounds   : ReturnType<typeof vi.fn>;
  readonly show        : ReturnType<typeof vi.fn>;
  readonly emitReadyToShow: () => void;
  readonly setDestroyed  : (value: boolean) => void;
};

function createFakeWindow({
  destroyed = false,
  minimized = false,
  visible   = true
}: FakeWindowState = {}): FakeBrowserWindow {
  const readyToShowListeners: Array<() => void> = [];
  let isDestroyed = destroyed;

  const fakeWindow = {
    focus      : vi.fn(),
    getBounds  : vi.fn(() => ({
      height: 300,
      width : 500,
      x     : 100,
      y     : 100
    })),
    isDestroyed: vi.fn(() => isDestroyed),
    isMinimized: vi.fn(() => minimized),
    isVisible  : vi.fn(() => visible),
    once       : vi.fn((eventName: string, listener: () => void) => {
      if (eventName === 'ready-to-show') {
        readyToShowListeners.push(listener);
      }

      return fakeWindow;
    }),
    restore        : vi.fn(),
    setBounds      : vi.fn(),
    show           : vi.fn(),
    emitReadyToShow: () => {
      for (const listener of readyToShowListeners) {
        listener();
      }
    },
    setDestroyed: (value: boolean) => {
      isDestroyed = value;
    }
  };

  return fakeWindow;
}

function asBrowserWindow(window: FakeBrowserWindow): BrowserWindow {
  return window as unknown as BrowserWindow;
}

beforeEach(() => {
  electronBrowserWindow.getFocusedWindow.mockReset();
  electronScreen.getDisplayMatching.mockReset();
});

describe('main window helpers', () => {
  test('activeWindow returns the focused BrowserWindow when it can be used', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow();

    electronBrowserWindow.getFocusedWindow.mockReturnValue(asBrowserWindow(window));

    expect(windowModule.activeWindow()).toBe(window);
  });

  test('activeWindow returns undefined for missing or destroyed windows', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow({ destroyed: true });

    electronBrowserWindow.getFocusedWindow.mockReturnValue(null);

    expect(windowModule.activeWindow()).toBeUndefined();

    electronBrowserWindow.getFocusedWindow.mockReturnValue(asBrowserWindow(window));

    expect(windowModule.activeWindow()).toBeUndefined();
  });

  test('showAndFocusWindow restores minimized hidden windows before focusing', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow({
      minimized: true,
      visible  : false
    });

    expect(windowModule.showAndFocusWindow(asBrowserWindow(window))).toBe(true);
    expect(window.restore).toHaveBeenCalledOnce();
    expect(window.show).toHaveBeenCalledOnce();
    expect(window.focus).toHaveBeenCalledOnce();
    expect(window.restore.mock.invocationCallOrder[0]).toBeLessThan(
      window.show.mock.invocationCallOrder[0]!
    );
    expect(window.show.mock.invocationCallOrder[0]).toBeLessThan(
      window.focus.mock.invocationCallOrder[0]!
    );
  });

  test('focusWindow is a short alias for showAndFocusWindow', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow({
      minimized: true,
      visible  : false
    });

    expect(windowModule.focusWindow).toBe(windowModule.showAndFocusWindow);
    expect(windowModule.focusWindow(asBrowserWindow(window))).toBe(true);
    expect(window.restore).toHaveBeenCalledOnce();
    expect(window.show).toHaveBeenCalledOnce();
    expect(window.focus).toHaveBeenCalledOnce();
  });

  test('showAndFocusWindow returns false for missing or destroyed windows', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow({ destroyed: true });

    expect(windowModule.showAndFocusWindow()).toBe(false);
    expect(windowModule.showAndFocusWindow(null)).toBe(false);
    expect(windowModule.showAndFocusWindow(asBrowserWindow(window))).toBe(false);
    expect(window.restore).not.toHaveBeenCalled();
    expect(window.show).not.toHaveBeenCalled();
    expect(window.focus).not.toHaveBeenCalled();
  });

  test('showWindowWhenReady shows the window after ready-to-show', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow();

    expect(windowModule.showWindowWhenReady(asBrowserWindow(window))).toBe(true);
    expect(window.once).toHaveBeenCalledWith('ready-to-show', expect.any(Function));
    expect(window.show).not.toHaveBeenCalled();

    window.emitReadyToShow();

    expect(window.show).toHaveBeenCalledOnce();
  });

  test('showWindowWhenReady returns false for missing or destroyed windows', async () => {
    const windowModule    = await import('#main/window');
    const destroyedWindow = createFakeWindow({ destroyed: true });
    const readyWindow     = createFakeWindow();

    expect(windowModule.showWindowWhenReady()).toBe(false);
    expect(windowModule.showWindowWhenReady(null)).toBe(false);
    expect(
      windowModule.showWindowWhenReady(asBrowserWindow(destroyedWindow))
    ).toBe(false);
    expect(destroyedWindow.once).not.toHaveBeenCalled();

    expect(windowModule.showWindowWhenReady(asBrowserWindow(readyWindow))).toBe(
      true
    );

    readyWindow.setDestroyed(true);
    readyWindow.emitReadyToShow();

    expect(readyWindow.show).not.toHaveBeenCalled();
  });

  test('showWhenReady is a short alias for showWindowWhenReady', async () => {
    const windowModule = await import('#main/window');
    const window       = createFakeWindow();

    expect(windowModule.showWhenReady).toBe(windowModule.showWindowWhenReady);
    expect(windowModule.showWhenReady(asBrowserWindow(window))).toBe(true);

    window.emitReadyToShow();

    expect(window.show).toHaveBeenCalledOnce();
  });

  test('getCenteredBounds returns centered bounds inside the matching display work area', async () => {
    const boundsModule = await import('#main/window/bounds');
    const window       = createFakeWindow();

    window.getBounds.mockReturnValue({
      height: 400,
      width : 600,
      x     : 200,
      y     : 300
    } satisfies Rectangle);
    electronScreen.getDisplayMatching.mockReturnValue({
      bounds: {
        height: 1080,
        width : 1920,
        x     : 0,
        y     : 0
      },
      workArea: {
        height: 1040,
        width : 1920,
        x     : 0,
        y     : 40
      }
    });

    expect(boundsModule.getCenteredBounds(asBrowserWindow(window))).toEqual({
      height: 400,
      width : 600,
      x     : 660,
      y     : 360
    });
    expect(electronScreen.getDisplayMatching).toHaveBeenCalledWith({
      height: 400,
      width : 600,
      x     : 200,
      y     : 300
    });
  });

  test('getCenteredBounds can center a provided size against full display bounds', async () => {
    const boundsModule = await import('#main/window/bounds');
    const window       = createFakeWindow();

    electronScreen.getDisplayMatching.mockReturnValue({
      bounds: {
        height: 900,
        width : 1600,
        x     : 100,
        y     : 50
      },
      workArea: {
        height: 860,
        width : 1600,
        x     : 100,
        y     : 90
      }
    });

    expect(
      boundsModule.getCenteredBounds(asBrowserWindow(window), {
        size: {
          height: 500,
          width : 800
        },
        useFullBounds: true
      })
    ).toEqual({
      height: 500,
      width : 800,
      x     : 500,
      y     : 250
    });
  });

  test('centerWindow applies centered bounds and returns false for unusable windows', async () => {
    const boundsModule = await import('#main/window/bounds');
    const window       = createFakeWindow();
    const destroyed    = createFakeWindow({ destroyed: true });

    electronScreen.getDisplayMatching.mockReturnValue({
      bounds: {
        height: 900,
        width : 1600,
        x     : 0,
        y     : 0
      },
      workArea: {
        height: 900,
        width : 1600,
        x     : 0,
        y     : 0
      }
    });

    expect(
      boundsModule.centerWindow(asBrowserWindow(window), {
        animated: true,
        size    : {
          height: 500,
          width : 800
        }
      })
    ).toBe(true);
    expect(window.setBounds).toHaveBeenCalledWith(
      {
        height: 500,
        width : 800,
        x     : 400,
        y     : 200
      },
      true
    );

    expect(boundsModule.centerWindow()).toBe(false);
    expect(boundsModule.centerWindow(null)).toBe(false);
    expect(boundsModule.centerWindow(asBrowserWindow(destroyed))).toBe(false);
    expect(destroyed.setBounds).not.toHaveBeenCalled();
  });

  test('main window route re-exports bounds helpers', async () => {
    const boundsModule = await import('#main/window/bounds');
    const windowModule = await import('#main/window');

    expect(windowModule.centerWindow).toBe(boundsModule.centerWindow);
    expect(windowModule.getCenteredBounds).toBe(boundsModule.getCenteredBounds);
  });

  test('main index re-exports window helpers', async () => {
    const windowModule = await import('#main/window');
    const mainModule   = await import('../src/main/index.js');

    expect(mainModule.activeWindow).toBe(windowModule.activeWindow);
    expect(mainModule.focusWindow).toBe(windowModule.focusWindow);
    expect(mainModule.showWhenReady).toBe(windowModule.showWhenReady);
    expect(mainModule.centerWindow).toBe(windowModule.centerWindow);
    expect(mainModule.getCenteredBounds).toBe(windowModule.getCenteredBounds);
    expect(mainModule.showAndFocusWindow).toBe(windowModule.showAndFocusWindow);
    expect(mainModule.showWindowWhenReady).toBe(
      windowModule.showWindowWhenReady
    );
  });
});
