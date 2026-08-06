import { BrowserWindow, session } from 'electron';

// ---------------------------------------------------------------------------
// Permission handling — deny by default, allow only what GrowxLabs needs
// ---------------------------------------------------------------------------

const GROWX_ORIGIN = 'https://growxlabs.tech';

/** Permissions explicitly allowed for GrowxLabs origins */
const ALLOWED_PERMISSIONS: string[] = [
  'notifications',
  'clipboard-read',
  'clipboard-sanitized-write',
];

function isGrowxOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin);
    return (
      parsed.hostname === 'growxlabs.tech' ||
      parsed.hostname.endsWith('.growxlabs.tech')
    );
  } catch {
    return false;
  }
}

export function setupPermissions(mainWindow: BrowserWindow): void {
  const ses = mainWindow.webContents.session;

  // -----------------------------------------------------------------------
  // Permission request handler — gates runtime permission prompts
  // -----------------------------------------------------------------------
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const origin = details.requestingUrl || '';

    if (isGrowxOrigin(origin) && ALLOWED_PERMISSIONS.includes(permission)) {
      callback(true);
      return;
    }

    // Deny everything else
    callback(false);
  });

  // -----------------------------------------------------------------------
  // Permission check handler — gates synchronous permission checks
  // -----------------------------------------------------------------------
  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (isGrowxOrigin(requestingOrigin) && ALLOWED_PERMISSIONS.includes(permission)) {
      return true;
    }

    return false;
  });
}
