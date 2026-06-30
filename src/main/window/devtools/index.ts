import type { BrowserWindow, OpenDevToolsOptions } from 'electron';

type MaybeBrowserWindow = BrowserWindow | null | undefined;

function isUsableWindow(
  browserWindow: MaybeBrowserWindow
): browserWindow is BrowserWindow {
  return browserWindow !== null
    && browserWindow !== undefined
    && !browserWindow.isDestroyed();
}

/** Opens or closes BrowserWindow DevTools to match the requested state */
export function setUseDevTools(
  browserWindow: MaybeBrowserWindow,
  enabled: boolean,
  options?: OpenDevToolsOptions
): boolean {
  if (!isUsableWindow(browserWindow)) {
    return false;
  }

  const isOpened = browserWindow.webContents.isDevToolsOpened();

  if (enabled && !isOpened) {
    browserWindow.webContents.openDevTools(options);
  }

  if (!enabled && isOpened) {
    browserWindow.webContents.closeDevTools();
  }

  return true;
}
