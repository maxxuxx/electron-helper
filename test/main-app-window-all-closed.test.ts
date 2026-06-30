import { beforeEach, describe, expect, test, vi } from 'vitest';

const electronApp = vi.hoisted(() => ({
  on  : vi.fn(),
  quit: vi.fn()
}));

vi.mock('electron', () => ({
  app: electronApp
}));

type WindowAllClosedListener = () => void;

const originalPlatform = process.platform;

function setPlatform(platform: NodeJS.Platform): void {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value       : platform
  });
}

function restorePlatform(): void {
  setPlatform(originalPlatform);
}

function emitWindowAllClosed(): void {
  const listener = electronApp.on.mock.calls.find(
    ([eventName]) => eventName === 'window-all-closed'
  )?.[1] as WindowAllClosedListener | undefined;

  if (listener === undefined) {
    throw new Error('Expected window-all-closed listener to be registered');
  }

  listener();
}

beforeEach(() => {
  electronApp.on.mockClear();
  electronApp.quit.mockClear();
  restorePlatform();
});

describe('main app window-all-closed helpers', () => {
  test('quitWhenAllWindowsClosed quits when all windows close outside macOS', async () => {
    const appModule = await import('#main/app/window-all-closed');

    setPlatform('linux');

    appModule.quitWhenAllWindowsClosed();
    emitWindowAllClosed();

    expect(electronApp.quit).toHaveBeenCalledOnce();
  });

  test('quitWhenAllWindowsClosed keeps the app running on macOS by default', async () => {
    const appModule = await import('#main/app/window-all-closed');

    setPlatform('darwin');

    appModule.quitWhenAllWindowsClosed();
    emitWindowAllClosed();

    expect(electronApp.quit).not.toHaveBeenCalled();
  });

  test('quitWhenAllWindowsClosed can be configured to quit on macOS', async () => {
    const appModule = await import('#main/app/window-all-closed');

    setPlatform('darwin');

    appModule.quitWhenAllWindowsClosed({ quitOnDarwin: true });
    emitWindowAllClosed();

    expect(electronApp.quit).toHaveBeenCalledOnce();
  });

  test('main app route re-exports window-all-closed helpers', async () => {
    const appModule             = await import('#main/app');
    const windowAllClosedModule = await import('#main/app/window-all-closed');

    expect(appModule.quitWhenAllWindowsClosed).toBe(
      windowAllClosedModule.quitWhenAllWindowsClosed
    );
  });
});
