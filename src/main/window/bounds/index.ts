import { screen } from 'electron';

import type { BrowserWindow, Rectangle, Size } from 'electron';

export type WindowBoundsOptions = {
  readonly size?: Size;
  readonly useFullBounds?: boolean;
};

export type CenterWindowOptions = WindowBoundsOptions & {
  readonly animated?: boolean;
};

export type MaybeBrowserWindow = BrowserWindow | null | undefined;

function isUsableWindow(
  browserWindow: MaybeBrowserWindow
): browserWindow is BrowserWindow {
  return browserWindow !== null
    && browserWindow !== undefined
    && !browserWindow.isDestroyed();
}

function getBoundsSize(bounds: Rectangle): Size {
  return {
    height: bounds.height,
    width : bounds.width
  };
}

/** Returns the bounds needed to center a BrowserWindow on its matching display */
export function getCenteredBounds(
  browserWindow: BrowserWindow,
  {
    size,
    useFullBounds = false
  }: WindowBoundsOptions = {}
): Rectangle {
  const currentBounds = browserWindow.getBounds();
  const display       = screen.getDisplayMatching(currentBounds);
  const area          = useFullBounds ? display.bounds : display.workArea;
  const nextSize      = size ?? getBoundsSize(currentBounds);

  return {
    height: nextSize.height,
    width : nextSize.width,
    x     : Math.floor(area.x + ((area.width - nextSize.width) / 2)),
    y     : Math.floor(area.y + ((area.height - nextSize.height) / 2))
  };
}

/** Centers a BrowserWindow on its matching display */
export function centerWindow(
  browserWindow?: MaybeBrowserWindow,
  options: CenterWindowOptions = {}
): boolean {
  if (!isUsableWindow(browserWindow)) {
    return false;
  }

  browserWindow.setBounds(
    getCenteredBounds(browserWindow, options),
    options.animated ?? false
  );

  return true;
}
