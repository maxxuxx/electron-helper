import { BrowserWindow } from 'electron';

import { createExternalOpenHandler } from '../shell/external/index.js';

import type { ExternalOpenHandlerOptions } from '../shell/external/index.js';

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

/** Sets a BrowserWindow to show when Electron emits ready-to-show */
export function setWindowShowWhenReady(
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

/** Backward-compatible alias for `setWindowShowWhenReady` */
export const showWindowWhenReady = setWindowShowWhenReady;

/** Short alias for `showWindowWhenReady` */
export const showWhenReady = setWindowShowWhenReady;

/** Registers a safe external URL handler on an existing BrowserWindow */
export function setExternalOpenHandler(
  browserWindow?: MaybeBrowserWindow,
  options: ExternalOpenHandlerOptions = {}
): boolean {
  if (!isUsableWindow(browserWindow)) {
    return false;
  }

  browserWindow.webContents.setWindowOpenHandler(
    createExternalOpenHandler(options)
  );
  return true;
}

export * from './bounds/index.js';
export * from './devtools/index.js';
