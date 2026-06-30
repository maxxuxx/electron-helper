import { BrowserWindow } from 'electron';

export type MaybeBrowserWindow = BrowserWindow | null | undefined;

function isUsableWindow(
  browserWindow: MaybeBrowserWindow
): browserWindow is BrowserWindow {
  return browserWindow !== null
    && browserWindow !== undefined
    && !browserWindow.isDestroyed();
}

/** Returns the currently focused BrowserWindow when it can be used */
export function activeWindow(): BrowserWindow | undefined {
  const browserWindow = BrowserWindow.getFocusedWindow();

  return isUsableWindow(browserWindow) ? browserWindow : undefined;
}

/** Restores, shows, and focuses an existing BrowserWindow when it can be used */
export function showAndFocusWindow(
  browserWindow?: MaybeBrowserWindow
): boolean {
  if (!isUsableWindow(browserWindow)) {
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

export const focusWindow = showAndFocusWindow;

/** Shows a BrowserWindow when Electron emits ready-to-show */
export function showWindowWhenReady(
  browserWindow?: MaybeBrowserWindow
): boolean {
  if (!isUsableWindow(browserWindow)) {
    return false;
  }

  browserWindow.once('ready-to-show', () => {
    if (!browserWindow.isDestroyed()) {
      browserWindow.show();
    }
  });

  return true;
}

export const showWhenReady = showWindowWhenReady;

export * from './bounds/index.js';
