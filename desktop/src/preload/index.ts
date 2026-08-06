import { contextBridge } from 'electron';

// ---------------------------------------------------------------------------
// Preload script — minimal bridge, no Node.js APIs exposed
//
// Security: The preload intentionally exposes almost nothing. The website
// runs entirely through its existing web APIs. The only exposed values are
// a platform identifier and a boolean flag for desktop feature detection.
//
// DO NOT add filesystem, shell, IPC, or secret-passing APIs here.
// ---------------------------------------------------------------------------

contextBridge.exposeInMainWorld('growxDesktop', {
  /** The operating system platform (e.g. 'win32', 'darwin', 'linux') */
  platform: process.platform,

  /** True when running inside the Electron desktop shell */
  isDesktop: true,
});
