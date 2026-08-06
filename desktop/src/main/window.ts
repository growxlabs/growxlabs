import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import { WindowStateStore } from './store';
import { setupNavigation } from './navigation';
import { setupPermissions } from './permissions';
import { setupDownloads } from './downloads';

// ---------------------------------------------------------------------------
// Window state persistence
// ---------------------------------------------------------------------------
const store = new WindowStateStore();

// ---------------------------------------------------------------------------
// Production URL
// ---------------------------------------------------------------------------
const PRODUCTION_URL = process.env.GROWX_DESKTOP_URL || 'https://growxlabs.tech';

// ---------------------------------------------------------------------------
// Loading & error screen HTML
// ---------------------------------------------------------------------------
const LOGO_SVG_BASE64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMkwzOCAyMEwyMCAzOEwyIDIwWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTg1NWY3IiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwYXRoIGQ9Ik0xMiAxMkwyMCAyME0yMCAyMEwyOCAxMk0yMCAyMEwxMiAyOE0yMCAyMEwyOCAyOCIgc3Ryb2tlPSIjYTg1NWY3IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=';

function getLoadingHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      color: #e5e5e5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      -webkit-app-region: drag;
    }
    .container { text-align: center; }
    .logo {
      width: 72px; height: 72px;
      margin: 0 auto 24px;
      animation: pulse 2s ease-in-out infinite;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #a855f7, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #1a1a2e;
      border-top-color: #a855f7;
      border-radius: 50%;
      margin: 0 auto;
      animation: spin 0.8s linear infinite;
    }
    .status {
      margin-top: 16px;
      font-size: 13px;
      color: #737373;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="data:image/svg+xml;base64,${LOGO_SVG_BASE64}" alt="GrowxLabs">
    <div class="title">GrowxLabs</div>
    <div class="spinner"></div>
    <div class="status">Connecting to platform…</div>
  </div>
</body>
</html>`;
}

function getErrorHTML(errorMessage: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      color: #e5e5e5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
    }
    .container { text-align: center; max-width: 420px; padding: 32px; }
    .logo {
      width: 64px; height: 64px;
      margin: 0 auto 20px;
      opacity: 0.7;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #f5f5f5;
    }
    .message {
      font-size: 14px;
      color: #a3a3a3;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .error-detail {
      font-size: 12px;
      color: #737373;
      background: #141414;
      border: 1px solid #262626;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 24px;
      word-break: break-word;
    }
    .actions { display: flex; gap: 12px; justify-content: center; }
    button {
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: white;
    }
    .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-secondary {
      background: #1a1a2e;
      color: #d4d4d4;
      border: 1px solid #333;
    }
    .btn-secondary:hover { background: #262640; }
  </style>
</head>
<body>
  <div class="container">
    <img class="logo" src="data:image/svg+xml;base64,${LOGO_SVG_BASE64}" alt="GrowxLabs">
    <div class="title">Connection Lost</div>
    <div class="message">
      Unable to reach the GrowxLabs platform. Please check your internet connection and try again.
    </div>
    <div class="error-detail">${errorMessage}</div>
    <div class="actions">
      <button class="btn-primary" onclick="window.location.reload()">Retry</button>
      <button class="btn-secondary" onclick="require('electron').shell.openExternal('https://growxlabs.tech')">Open in Browser</button>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Window management
// ---------------------------------------------------------------------------
let mainWindow: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function createMainWindow(): void {
  const savedState = store.get();

  mainWindow = new BrowserWindow({
    title: 'GrowxLabs',
    width: savedState.width,
    height: savedState.height,
    x: savedState.x,
    y: savedState.y,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
    },
  });

  // Remove default menu in production
  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  // Restore maximized state
  if (savedState.isMaximized) {
    mainWindow.maximize();
  }

  // -----------------------------------------------------------------------
  // Loading screen: show branded loading HTML while page loads
  // -----------------------------------------------------------------------
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getLoadingHTML())}`);
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // After loading screen is visible, navigate to the production URL
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow?.loadURL(PRODUCTION_URL);
  });

  // -----------------------------------------------------------------------
  // Error handling: show branded error screen on load failure
  // -----------------------------------------------------------------------
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    // Ignore aborted loads (e.g. user navigated away before page finished)
    if (errorCode === -3) return;

    const currentURL = mainWindow?.webContents.getURL() || '';
    // Don't show error for data: URLs (our own loading/error screens)
    if (currentURL.startsWith('data:')) return;

    const errorMsg = `${errorDescription} (code: ${errorCode})`;
    mainWindow?.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getErrorHTML(errorMsg))}`);

    // Auto-retry after 10 seconds
    if (retryTimeout) clearTimeout(retryTimeout);
    retryTimeout = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(PRODUCTION_URL);
      }
    }, 10000);
  });

  // Clear retry timeout on successful load
  mainWindow.webContents.on('did-finish-load', () => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  });

  // -----------------------------------------------------------------------
  // Window state persistence
  // -----------------------------------------------------------------------
  function saveWindowState(): void {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    const isMaximized = mainWindow.isMaximized();
    const bounds = isMaximized ? store.get() : mainWindow.getBounds();

    store.set({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized,
    });
  }

  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);

  // -----------------------------------------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------------------------------------
  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (!mainWindow) return;

    // F5 or Ctrl+R: Refresh
    if (input.key === 'F5' || (input.control && input.key === 'r')) {
      const currentURL = mainWindow.webContents.getURL();
      if (currentURL.startsWith('data:')) {
        mainWindow.loadURL(PRODUCTION_URL);
      } else {
        mainWindow.webContents.reload();
      }
    }

    // F11: Toggle fullscreen
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }

    // Ctrl+Shift+I: DevTools (development only)
    if (!app.isPackaged && input.control && input.shift && input.key === 'I') {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // -----------------------------------------------------------------------
  // Setup navigation, permissions, and downloads
  // -----------------------------------------------------------------------
  setupNavigation(mainWindow);
  setupPermissions(mainWindow);
  setupDownloads(mainWindow);

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
