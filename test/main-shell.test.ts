import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { HandlerDetails } from 'electron';

const electronShell = vi.hoisted(() => ({
  openExternal: vi.fn(async () => undefined)
}));

vi.mock('electron', () => ({
  shell: electronShell
}));

function createWindowOpenDetails(url: string): HandlerDetails {
  return {
    disposition: 'default',
    features   : '',
    frameName  : '',
    referrer   : {
      policy: 'default',
      url   : ''
    },
    url
  } as HandlerDetails;
}

beforeEach(() => {
  electronShell.openExternal.mockClear();
});

describe('main shell helpers', () => {
  test('createExternalOpenHandler opens allowed URLs externally and denies Electron windows', async () => {
    const shellModule = await import('#main/shell');
    const handler     = shellModule.createExternalOpenHandler({
      allowedHosts    : ['example.com'],
      allowedProtocols: ['https:']
    });

    const response = handler(createWindowOpenDetails('https://example.com/docs'));

    expect(response).toEqual({ action: 'deny' });
    expect(electronShell.openExternal).toHaveBeenCalledWith(
      'https://example.com/docs'
    );
  });

  test('createExternalOpenHandler blocks URLs outside the allow list', async () => {
    const shellModule = await import('#main/shell');
    const handler     = shellModule.createExternalOpenHandler({
      allowedHosts    : ['example.com'],
      allowedProtocols: ['https:']
    });

    handler(createWindowOpenDetails('https://evil.example/docs'));
    handler(createWindowOpenDetails('http://example.com/docs'));
    handler(createWindowOpenDetails('not a url'));

    expect(electronShell.openExternal).not.toHaveBeenCalled();
  });

  test('main index re-exports shell helpers', async () => {
    const shellModule = await import('#main/shell');
    const mainModule  = await import('../src/main/index.js');

    expect(mainModule.createExternalOpenHandler).toBe(
      shellModule.createExternalOpenHandler
    );
  });

  test('shell route re-exports focused shell modules', async () => {
    const shellModule    = await import('#main/shell');
    const externalModule = await import('#main/shell/external');

    expect(shellModule.createExternalOpenHandler).toBe(
      externalModule.createExternalOpenHandler
    );
  });
});
