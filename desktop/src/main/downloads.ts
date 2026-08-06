import { BrowserWindow, dialog, app, FileFilter } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// ---------------------------------------------------------------------------
// Download handling — native save dialogs for PDFs, CSVs, reports
// ---------------------------------------------------------------------------

export function setupDownloads(mainWindow: BrowserWindow): void {
  const ses = mainWindow.webContents.session;

  ses.on('will-download', (_event, item) => {
    const suggestedFilename = item.getFilename();
    const defaultDownloadPath = app.getPath('downloads');

    // Generate a unique filename to prevent silent overwrites
    const targetPath = getUniqueFilePath(defaultDownloadPath, suggestedFilename);

    // Show native save dialog
    dialog
      .showSaveDialog(mainWindow, {
        title: 'Save File',
        defaultPath: targetPath,
        filters: getFileFilters(suggestedFilename),
      })
      .then((result) => {
        if (result.canceled || !result.filePath) {
          item.cancel();
          return;
        }

        item.setSavePath(result.filePath);

        // Show download progress in Windows taskbar
        item.on('updated', (_updateEvent, state) => {
          if (state === 'progressing') {
            if (item.getTotalBytes() > 0) {
              const progress = item.getReceivedBytes() / item.getTotalBytes();
              mainWindow.setProgressBar(progress);
            } else {
              // Indeterminate progress
              mainWindow.setProgressBar(-1);
            }
          } else if (state === 'interrupted') {
            mainWindow.setProgressBar(-1);
          }
        });

        item.once('done', (_doneEvent, state) => {
          // Clear taskbar progress
          mainWindow.setProgressBar(-1);

          if (state === 'completed') {
            // Optionally flash the taskbar to indicate completion
            mainWindow.flashFrame(true);
            setTimeout(() => mainWindow.flashFrame(false), 2000);
          }
        });
      })
      .catch(() => {
        item.cancel();
      });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a unique file path by appending a counter if the file already exists.
 * e.g. "Invoice.pdf" → "Invoice (1).pdf" → "Invoice (2).pdf"
 */
function getUniqueFilePath(dir: string, filename: string): string {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  let candidate = path.join(dir, filename);
  let counter = 1;

  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${basename} (${counter})${ext}`);
    counter++;
  }

  return candidate;
}

/**
 * Build file dialog filters based on file extension.
 */
function getFileFilters(filename: string): FileFilter[] {
  const ext = path.extname(filename).toLowerCase().replace('.', '');

  const filterMap: Record<string, FileFilter> = {
    pdf: { name: 'PDF Documents', extensions: ['pdf'] },
    csv: { name: 'CSV Files', extensions: ['csv'] },
    xlsx: { name: 'Excel Files', extensions: ['xlsx'] },
    xls: { name: 'Excel Files', extensions: ['xls'] },
    docx: { name: 'Word Documents', extensions: ['docx'] },
    doc: { name: 'Word Documents', extensions: ['doc'] },
    png: { name: 'PNG Images', extensions: ['png'] },
    jpg: { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
    jpeg: { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
    svg: { name: 'SVG Images', extensions: ['svg'] },
    zip: { name: 'ZIP Archives', extensions: ['zip'] },
    json: { name: 'JSON Files', extensions: ['json'] },
  };

  const filters: FileFilter[] = [];
  if (filterMap[ext]) {
    filters.push(filterMap[ext]);
  }
  filters.push({ name: 'All Files', extensions: ['*'] });

  return filters;
}
