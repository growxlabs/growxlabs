import { BrowserWindow, shell } from 'electron';

// ---------------------------------------------------------------------------
// Domain allowlist — derived from codebase research
// ---------------------------------------------------------------------------

/** GrowxLabs internal domains (main + all subdomains from lib/subdomains.ts) */
const GROWX_DOMAINS = [
  'growxlabs.tech',
  'www.growxlabs.tech',
  'admin.growxlabs.tech',
  'client.growxlabs.tech',
  'restaurant.growxlabs.tech',
  'hotel.growxlabs.tech',
  'realestate.growxlabs.tech',
  'courses.growxlabs.tech',
  'careers.growxlabs.tech',
];

/** Third-party domains allowed inside the Electron window (auth, payments) */
const TRUSTED_POPUP_DOMAINS = [
  'checkout.razorpay.com',
  'api.razorpay.com',
  'accounts.google.com',
];

/** Domains allowed for web requests only (APIs, CDNs, monitoring) */
const ALLOWED_REQUEST_DOMAINS = [
  'supabase.co',
  'images.unsplash.com',
  'sentry.io',
];

/** Allowed protocols for shell.openExternal */
const SAFE_EXTERNAL_PROTOCOLS = ['https:', 'mailto:', 'tel:'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isGrowxDomain(hostname: string): boolean {
  return GROWX_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function isTrustedPopupDomain(hostname: string): boolean {
  return TRUSTED_POPUP_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function isGrowxOrTrusted(hostname: string): boolean {
  return isGrowxDomain(hostname) || isTrustedPopupDomain(hostname);
}

function safeOpenExternal(url: string): void {
  try {
    const parsed = new URL(url);
    if (SAFE_EXTERNAL_PROTOCOLS.includes(parsed.protocol)) {
      shell.openExternal(url);
    }
  } catch {
    // Malformed URL — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Navigation setup
// ---------------------------------------------------------------------------

export function setupNavigation(mainWindow: BrowserWindow): void {
  const PRODUCTION_URL = process.env.GROWX_DESKTOP_URL || 'https://growxlabs.tech';

  // -----------------------------------------------------------------------
  // will-navigate: controls top-level navigation within the main window
  // -----------------------------------------------------------------------
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    // Allow data: URLs (our loading/error screens)
    if (navigationUrl.startsWith('data:')) return;

    try {
      const parsed = new URL(navigationUrl);

      // Block non-HTTPS navigation
      if (parsed.protocol !== 'https:') {
        event.preventDefault();
        if (parsed.protocol === 'mailto:' || parsed.protocol === 'tel:') {
          safeOpenExternal(navigationUrl);
        }
        return;
      }

      // Allow GrowxLabs domains inside the window
      if (isGrowxDomain(parsed.hostname)) {
        return; // Allow navigation
      }

      // Everything else opens in the default browser
      event.preventDefault();
      safeOpenExternal(navigationUrl);
    } catch {
      event.preventDefault();
    }
  });

  // -----------------------------------------------------------------------
  // setWindowOpenHandler: controls window.open(), target="_blank", popups
  // -----------------------------------------------------------------------
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsed = new URL(url);

      // GrowxLabs internal links: load in the main window instead of a popup
      if (isGrowxDomain(parsed.hostname)) {
        mainWindow.loadURL(url);
        return { action: 'deny' };
      }

      // Razorpay checkout or Google OAuth: open in a restricted child window
      if (isTrustedPopupDomain(parsed.hostname)) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            title: 'GrowxLabs',
            width: 600,
            height: 700,
            modal: false,
            parent: mainWindow,
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
              sandbox: true,
              webSecurity: true,
              allowRunningInsecureContent: false,
            },
          },
        };
      }

      // External links: open in default browser
      safeOpenExternal(url);
      return { action: 'deny' };
    } catch {
      return { action: 'deny' };
    }
  });

  // -----------------------------------------------------------------------
  // Handle child windows created for trusted popups (Razorpay, OAuth)
  // -----------------------------------------------------------------------
  mainWindow.webContents.on('did-create-window', (childWindow) => {
    // Monitor child window navigation for OAuth callback completion
    childWindow.webContents.on('will-navigate', (_event, navUrl) => {
      try {
        const parsed = new URL(navUrl);
        // If the popup navigates back to GrowxLabs, close it and load in main
        if (isGrowxDomain(parsed.hostname)) {
          mainWindow.loadURL(navUrl);
          childWindow.close();
        }
      } catch {
        // Ignore parse errors
      }
    });

    // Prevent child windows from opening further popups
    childWindow.webContents.setWindowOpenHandler(({ url: childUrl }) => {
      try {
        const parsed = new URL(childUrl);
        if (isGrowxDomain(parsed.hostname)) {
          mainWindow.loadURL(childUrl);
          childWindow.close();
        } else {
          safeOpenExternal(childUrl);
        }
      } catch {
        // Ignore
      }
      return { action: 'deny' };
    });

    // Auto-close child window if it navigates to a GrowxLabs URL after completion
    childWindow.webContents.on('did-navigate', (_event, navUrl) => {
      try {
        const parsed = new URL(navUrl);
        if (isGrowxDomain(parsed.hostname)) {
          mainWindow.loadURL(navUrl);
          childWindow.close();
        }
      } catch {
        // Ignore
      }
    });
  });
}
