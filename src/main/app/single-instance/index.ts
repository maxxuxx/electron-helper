import { app } from 'electron';

import type { BrowserWindow } from 'electron';

type MaybeBrowserWindow = BrowserWindow | null | undefined;

export type SingleInstanceWindowSource =
  | MaybeBrowserWindow
  | (() => MaybeBrowserWindow);

function resolveWindowSource(
  windowSource: SingleInstanceWindowSource
): MaybeBrowserWindow {
  return typeof windowSource === 'function' ? windowSource() : windowSource;
}

function showAndFocusSingleInstanceWindow(
  browserWindow: MaybeBrowserWindow
): boolean {
  if (
    browserWindow === null
    || browserWindow === undefined
    || browserWindow.isDestroyed()
  ) {
    return false;
  }

  if (browserWindow.isMinimized()) {
    browserWindow.restore();
  }

  if (!browserWindow.isVisible()) {
    browserWindow.show();
  }

  browserWindow.focus();
  return true;
}

/** Requests Electron's single-instance lock and focuses the supplied window on later launches */
export function setSingleInstance(
  windowSource?: SingleInstanceWindowSource
): boolean {
  const hasLock = app.requestSingleInstanceLock();

  if (!hasLock) {
    app.quit();
    return false;
  }

  if (windowSource !== undefined) {
    app.on('second-instance', () => {
      showAndFocusSingleInstanceWindow(resolveWindowSource(windowSource));
    });
  }

  return true;
}
