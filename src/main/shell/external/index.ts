import { shell } from 'electron';

import type { HandlerDetails, WindowOpenHandlerResponse } from 'electron';

/** Allow-list options for external URL window-open handling */
export type ExternalOpenHandlerOptions = {
  readonly allowedHosts?: readonly string[];
  readonly allowedProtocols?: readonly string[];
};

/** Electron window-open handler that always returns a deny response */
export type ExternalOpenHandler = (
  details: HandlerDetails
) => WindowOpenHandlerResponse;

const denyWindowOpenResponse = { action: 'deny' } as const;

function createAllowedSet(values: readonly string[] | undefined): Set<string> {
  return new Set(values?.map((value) => value.toLowerCase()) ?? []);
}

function isAllowedExternalUrl(
  url: URL,
  allowedProtocols: ReadonlySet<string>,
  allowedHosts: ReadonlySet<string>
): boolean {
  if (!allowedProtocols.has(url.protocol.toLowerCase())) {
    return false;
  }

  if (allowedHosts.size === 0) {
    return true;
  }

  return allowedHosts.has(url.hostname.toLowerCase());
}

function openExternalUrl(url: string): void {
  try {
    void shell.openExternal(url).catch(() => undefined);
  } catch {
    // Keep Electron's window-open handler synchronous and deny the new window
  }
}

/** Creates a setWindowOpenHandler callback that opens allowed URLs externally */
export function createExternalOpenHandler({
  allowedHosts,
  allowedProtocols
}: ExternalOpenHandlerOptions = {}): ExternalOpenHandler {
  const normalizedAllowedHosts     = createAllowedSet(allowedHosts);
  const normalizedAllowedProtocols = createAllowedSet(allowedProtocols);

  return ({ url }) => {
    try {
      const externalUrl = new URL(url);

      if (
        isAllowedExternalUrl(
          externalUrl,
          normalizedAllowedProtocols,
          normalizedAllowedHosts
        )
      ) {
        openExternalUrl(url);
      }
    } catch {
      // Invalid URLs are denied by falling through to the shared deny response
    }

    return denyWindowOpenResponse;
  };
}
