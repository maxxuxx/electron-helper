export type ElectronAppLike = {
  readonly isPackaged: boolean;
};

export type OptionalElectronAppLike = {
  readonly isPackaged?: boolean;
};

export function isPackaged(app: ElectronAppLike): boolean {
  return app.isPackaged;
}

export function isProduction(app?: OptionalElectronAppLike): boolean {
  if (typeof app?.isPackaged === 'boolean') {
    return app.isPackaged;
  }

  return process.env.NODE_ENV === 'production';
}
