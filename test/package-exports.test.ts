import { readFileSync } from 'node:fs';

import { describe, expect, test } from 'vitest';

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as {
  readonly exports: Record<string, unknown>;
};

describe('package exports', () => {
  test('exports focused main helper routes as canonical APIs', () => {
    expect(packageJson.exports).toHaveProperty('./main/app/window-all-closed');
    expect(packageJson.exports).toHaveProperty('./main/window/devtools');
  });

  test('exports node env and path routes as canonical APIs', () => {
    expect(packageJson.exports).toHaveProperty('./node');
    expect(packageJson.exports).toHaveProperty('./node/env');
    expect(packageJson.exports).toHaveProperty('./node/env/load');
    expect(packageJson.exports).toHaveProperty('./node/env/read');
    expect(packageJson.exports).toHaveProperty('./node/path');
    expect(packageJson.exports).toHaveProperty('./node/path/current');
    expect(packageJson.exports).toHaveProperty('./node/path/resources');
  });

  test('exports updater bridge routes as canonical APIs', () => {
    expect(packageJson.exports).toHaveProperty('./main/updater');
    expect(packageJson.exports).toHaveProperty('./node/updater');
    expect(packageJson.exports).toHaveProperty('./preload/updater');
    expect(packageJson.exports).toHaveProperty('./renderer/updater');
  });

  test('does not export replaced main env and Node-only path routes', () => {
    expect(packageJson.exports).not.toHaveProperty('./main/env');
    expect(packageJson.exports).not.toHaveProperty('./main/env/load');
    expect(packageJson.exports).not.toHaveProperty('./main/env/read');
    expect(packageJson.exports).not.toHaveProperty('./main/path/config');
    expect(packageJson.exports).not.toHaveProperty('./main/path/module');
    expect(packageJson.exports).not.toHaveProperty('./main/path/resolve');
  });
});
