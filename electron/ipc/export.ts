import { IpcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function renderMarkdown(content: string): string {
  return md.render(content);
}

export function registerExportHandlers(ipcMain: IpcMain) {
  ipcMain.handle('export:html', async (event, content: string, options?: any) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export as HTML',
      filters: [{ name: 'HTML', extensions: ['html'] }],
    });

    if (result.canceled || !result.filePath) return null;

    const rendered = renderMarkdown(content);
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
<body>${rendered}</body>
</html>`;

    fs.writeFileSync(result.filePath, fullHtml, 'utf-8');
    return result.filePath;
  });

  ipcMain.handle('export:pdf', async (event, content: string, options?: any) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export as PDF',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) return null;

    const rendered = renderMarkdown(content);
    const pdfWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    });

    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif;line-height:1.6;}</style>
</head><body>${rendered}</body></html>`;

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

  ipcMain.handle('export:docx', async (event, content: string, options?: any) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;

    const result = await dialog.showSaveDialog(win, {
      title: 'Export as Word Document',
      filters: [{ name: 'Word Document', extensions: ['doc'] }],
    });

    if (result.canceled || !result.filePath) return null;

    const rendered = renderMarkdown(content);
    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>body{max-width:800px;margin:0 auto;padding:2rem;font-family:sans-serif;line-height:1.6;}</style>
</head><body>${rendered}</body></html>`;

    fs.writeFileSync(result.filePath, fullHtml, 'utf-8');
    return result.filePath;
  });
}
