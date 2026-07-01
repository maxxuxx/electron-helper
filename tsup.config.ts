import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    'main/app/index': 'src/main/app/index.ts',
    'main/app/single-instance/index': 'src/main/app/single-instance/index.ts',
    'main/app/window-all-closed/index': 'src/main/app/window-all-closed/index.ts',
    'main/path/index': 'src/main/path/index.ts',
    'main/path/electron/index': 'src/main/path/electron/index.ts',
    'main/shell/index': 'src/main/shell/index.ts',
    'main/shell/external/index': 'src/main/shell/external/index.ts',
    'main/settings/index': 'src/main/settings/index.ts',
    'main/state/index': 'src/main/state/index.ts',
    'main/updater/index': 'src/main/updater/index.ts',
    'main/window/bounds/index': 'src/main/window/bounds/index.ts',
    'main/window/devtools/index': 'src/main/window/devtools/index.ts',
    'main/window/index': 'src/main/window/index.ts',
    'main/index': 'src/main/index.ts',
    'node/env/index': 'src/node/env/index.ts',
    'node/env/load/index': 'src/node/env/load/index.ts',
    'node/env/read/index': 'src/node/env/read/index.ts',
    'node/os/hardware/index': 'src/node/os/hardware/index.ts',
    'node/os/index': 'src/node/os/index.ts',
    'node/path/index': 'src/node/path/index.ts',
    'node/path/current/index': 'src/node/path/current/index.ts',
    'node/path/resources/index': 'src/node/path/resources/index.ts',
    'node/updater/index': 'src/node/updater/index.ts',
    'node/index': 'src/node/index.ts',
    'preload/updater/index': 'src/preload/updater/index.ts',
    'preload/index': 'src/preload/index.ts',
    'renderer/updater/index': 'src/renderer/updater/index.ts',
    'renderer/index': 'src/renderer/index.ts'
  },
  external: ['dotenv', 'electron', 'electron-updater'],
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js'
    };
  },
  splitting: false,
  sourcemap: true,
  target: 'es2022',
  treeshake: true
});
