import { app } from 'electron';

/** Returns the current Electron app version */
export function getVersion(): string {
  return app.getVersion();
}

/** Returns true when Electron is running from a packaged app */
export function isProduction(): boolean {
  return app.isPackaged;
}
