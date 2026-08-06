# GrowxLabs Desktop

Native Windows desktop application for the [GrowxLabs](https://growxlabs.tech) platform, built with Electron.

This is a **thin desktop shell** — it loads the complete production GrowxLabs application from Vercel. No local server is required. All routes, authentication, payments, and integrations work exactly as they do in the browser.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** (ships with Node.js)
- Internet connection (the app loads `https://growxlabs.tech`)

## Quick Start

```bash
# From the repository root
cd desktop
npm install

# Run in development mode
npm run dev

# Or from the repository root (convenience alias)
npm run desktop:dev
```

## Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Build TypeScript and launch Electron (dev mode, DevTools available) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run package` | Build + package Windows installer (`release/`) |
| `npm run package:portable` | Build + package portable `.exe` |
| `npm run typecheck` | Type-check without emitting |

From the repository root, convenience aliases are available:

```bash
npm run desktop:dev        # → cd desktop && npm run dev
npm run desktop:build      # → cd desktop && npm run build
npm run desktop:package    # → cd desktop && npm run package
```

## Environment Configuration

Copy `.env.example` to `.env` to customize the loaded URL:

```bash
cp .env.example .env
```

```env
# Production (default)
GROWX_DESKTOP_URL=https://growxlabs.tech

# Staging
# GROWX_DESKTOP_URL=https://staging.growxlabs.tech
```

If no `.env` file exists, the app defaults to `https://growxlabs.tech`.

## Installer Output

After running `npm run package`, the installer files are generated in `desktop/release/`:

```
release/
├── GrowxLabs-Desktop-Setup.exe      # NSIS installer (desktop + Start Menu shortcuts)
└── GrowxLabs-Desktop-Portable.exe   # Standalone portable executable
```

## Architecture

```
desktop/
├── src/
│   ├── main/
│   │   ├── index.ts          # App entry: single-instance lock, lifecycle events
│   │   ├── window.ts         # BrowserWindow: loading screen, error screen, state persistence
│   │   ├── navigation.ts     # Domain allowlist, external link handling, popup control
│   │   ├── permissions.ts    # Permission deny-by-default policy
│   │   ├── downloads.ts      # Native save dialog, progress bar, file filters
│   │   └── updater.ts        # Auto-update placeholder (future)
│   └── preload/
│       └── index.ts          # Minimal bridge: { platform, isDesktop }
├── assets/
│   ├── icon.png              # App icon (512px, from GrowxLabs logo)
│   └── tray.png              # Reserved system tray icon
├── package.json              # Dependencies & electron-builder config
├── tsconfig.json             # TypeScript config (Node/CommonJS target)
├── .env.example              # Environment variable template
└── README.md                 # This file
```

## Security Model

| Control | Implementation |
| :--- | :--- |
| Node.js in renderer | **Disabled** (`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`) |
| Secrets | **None in Electron** — all API keys remain server-side on Vercel |
| HTTPS enforcement | Rejects non-HTTPS navigation |
| Domain locking | Only `*.growxlabs.tech` + Razorpay + Google OAuth allowed inside window |
| Preload bridge | Exposes only `{ platform, isDesktop }` — no filesystem, no IPC |
| Permissions | Deny-by-default; only notifications & clipboard for GrowxLabs origins |
| DevTools | Disabled in packaged builds; available in development |
| Single instance | `requestSingleInstanceLock()` prevents duplicate windows |
| External links | Validated protocols only (`https:`, `mailto:`, `tel:`) via `shell.openExternal()` |

## Domain Allowlist

**Internal navigation** (stays inside Electron):
- `growxlabs.tech` and all subdomains (`admin.`, `client.`, `restaurant.`, `hotel.`, `realestate.`, `courses.`, `careers.`)

**Trusted popups** (restricted child windows):
- `checkout.razorpay.com` — payment checkout
- `accounts.google.com` — OAuth login

**External** (opens in default browser):
- All other URLs

## Authentication

The desktop app uses the exact same authentication as the web app:
- NextAuth JWT sessions with 30-day expiry
- Cookies persisted in Electron's Chromium user data directory
- Sessions survive app restarts
- Google OAuth flows handled via restricted popup windows
- No separate desktop authentication system

## Code Signing (Optional)

For production distribution, code signing is recommended but not required for internal builds:

1. Obtain a Windows code signing certificate (EV or standard)
2. Configure in `package.json` under `build.win`:
   ```json
   "certificateFile": "path/to/certificate.pfx",
   "certificatePassword": "YOUR_PASSWORD"
   ```
3. Or use `signtool` with a hardware token

## Troubleshooting

**White screen on launch**: Check your internet connection. The app requires connectivity to load `https://growxlabs.tech`.

**Login not working**: Ensure you're loading the HTTPS production URL, not an HTTP variant. The `__Secure-` cookie prefix requires HTTPS.

**Razorpay popup blocked**: The popup should open in a child window automatically. If it doesn't, check that `checkout.razorpay.com` is in the domain allowlist.

**DevTools**: Press `Ctrl+Shift+I` in development mode. DevTools are disabled in packaged builds.
