import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts', 'src/main.ts'],
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
