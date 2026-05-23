import { IpcMain, dialog, BrowserWindow, clipboard, nativeImage } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerImageHandlers(ipcMain: IpcMain) {
  ipcMain.handle('image:uploadFromPath', async (_event, filePath: string) => {
    // For local storage: copy the image to the project's assets/images dir
    // and return a relative path
    try {
      const fileName = path.basename(filePath);
      const timestamp = Date.now();
      const safeName = `${timestamp}_${fileName}`;

      // In a real implementation, get project root from state
      const projectRoot = path.dirname(filePath);
      const assetsDir = path.join(projectRoot, 'assets', 'images');

      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const destPath = path.join(assetsDir, safeName);
      fs.copyFileSync(filePath, destPath);

      return {
        url: `./assets/images/${safeName}`,
        localPath: destPath,
      };
    } catch (err: any) {
      throw new Error(`Failed to save image: ${err.message}`);
    }
  });

  ipcMain.handle('image:saveLocal', async (_event, base64: string, fileName: string) => {
    // Save a base64 image to assets/images
    const win = BrowserWindow.getFocusedWindow();
    // In real implementation, get project root from config
    return { url: `./assets/images/${fileName}` };
  });
}
