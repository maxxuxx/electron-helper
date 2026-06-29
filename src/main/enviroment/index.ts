export type IsProductionOptions = {
  readonly isPackaged?: boolean;
  readonly nodeEnv?: string;
};

export type PackagedState = boolean | (() => boolean);

export type EnvironmentConfig = {
  readonly isPackaged?: PackagedState;
};

let getConfiguredIsPackaged: () => boolean = () => false;

function resolvePackagedState(isPackaged: PackagedState): boolean {
  return typeof isPackaged === 'function' ? isPackaged() : isPackaged;
}

export function configureEnvironment({
  isPackaged
}: EnvironmentConfig): () => void {
  const restoreIsPackaged = getConfiguredIsPackaged;

  if (isPackaged !== undefined) {
    getConfiguredIsPackaged = () => resolvePackagedState(isPackaged);
  }

  return () => {
    getConfiguredIsPackaged = restoreIsPackaged;
  };
}

export function isProduction({
  isPackaged = getConfiguredIsPackaged(),
  nodeEnv = process.env.NODE_ENV
}: IsProductionOptions = {}): boolean {
  return isPackaged || nodeEnv === 'production';
}
