import { app } from 'electron';

/** Returns true when Electron is running from a packaged app */
export function isProduction(): boolean {
  return app.isPackaged;
}
