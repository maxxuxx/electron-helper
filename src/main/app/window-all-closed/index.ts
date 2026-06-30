import { app } from 'electron';

export type QuitWhenAllWindowsClosedOptions = {
  /** Quit the app on macOS too when every window closes */
  readonly quitOnDarwin?: boolean;
};

/** Quits the app when every window closes, keeping macOS apps alive by default */
export function quitWhenAllWindowsClosed({
  quitOnDarwin = false
}: QuitWhenAllWindowsClosedOptions = {}): void {
  app.on('window-all-closed', () => {
    if (quitOnDarwin || process.platform !== 'darwin') {
      app.quit();
    }
  });
}
