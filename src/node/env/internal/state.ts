type EnvState = {
  isLoaded: boolean;
};

const envStateKey = Symbol.for('electron-helper.node.env.state');

type GlobalWithEnvState = typeof globalThis & {
  [envStateKey]?: EnvState;
};

function getEnvState(): EnvState {
  const globalScope = globalThis as GlobalWithEnvState;

  globalScope[envStateKey] ??= {
    isLoaded: false
  };

  return globalScope[envStateKey];
}

/** Marks dotenv loading as attempted across package subpath bundles */
export function markEnvLoaded(): boolean {
  const state = getEnvState();

  if (state.isLoaded) {
    return false;
  }

  state.isLoaded = true;

  return true;
}
