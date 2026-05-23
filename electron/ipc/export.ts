import { IpcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';

export function registerExportHandlers(ipcMain: IpcMain) {
  ipcMain.handle('export:html', async (_event, content: string, options?: any) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export as HTML',
      filters: [{ name: 'HTML', extensions: ['html'] }],
    });

    if (result.canceled || !result.filePath) return null;

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
    }
    ${options?.customCSS || ''}
  </style>
</head>
<body>${content}</body>
</html>`;

    fs.writeFileSync(result.filePath, fullHtml, 'utf-8');
    return result.filePath;
  });

  ipcMain.handle('export:pdf', async (_event, content: string, options?: any) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export as PDF',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) return null;

    // Use a hidden BrowserWindow to render and print to PDF
    const pdfWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif;line-height:1.6;}</style>
</head><body>${content}</body></html>`;

    await pdfWin.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`
    );

    const pdfData = await pdfWin.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: '1cm', bottom: '1cm', left: '1.5cm', right: '1.5cm' },
      ...options,
    });

    pdfWin.close();
    fs.writeFileSync(result.filePath, pdfData);
    return result.filePath;
  });

  ipcMain.handle('export:docx', async (_event, content: string, options?: any) => {
    // For production, integrate the docx.js library here
    // For now, export as HTML with .doc extension (Word can open HTML)
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export as Word Document',
      filters: [{ name: 'Word Document', extensions: ['doc'] }],
    });

    if (result.canceled || !result.filePath) return null;

    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif;line-height:1.6;}</style>
</head><body>${content}</body></html>`;

    fs.writeFileSync(result.filePath, fullHtml, 'utf-8');
    return result.filePath;
  });
}
