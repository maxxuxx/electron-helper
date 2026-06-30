import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    'main/env/index': 'src/main/env/index.ts',
    'main/path/index': 'src/main/path/index.ts',
    'main/state/index': 'src/main/state/index.ts',
    'main/index': 'src/main/index.ts'
  },
  external: ['dotenv', 'electron'],
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
