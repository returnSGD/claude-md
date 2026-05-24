import { IpcMain } from 'electron';
import fs from 'fs';
import { getConfigPath } from '../utils/paths';

interface SettingsData {
  apiKey?: string;
  apiBaseUrl?: string;
  exportSettings?: {
    fontFamily?: string;
    fontSize?: number;
    lineHeight?: number;
    pageSize?: string;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
  };
}

export function readConfig(): SettingsData {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeConfig(data: SettingsData): void {
  const p = getConfigPath();
  const existing = readConfig();
  const merged = { ...existing, ...data };
  fs.writeFileSync(p, JSON.stringify(merged, null, 2), 'utf-8');
}

export function registerSettingsHandlers(ipcMain: IpcMain) {
  ipcMain.handle('settings:getAll', async () => {
    return readConfig();
  });

  ipcMain.handle('settings:saveAll', async (_event, data: SettingsData) => {
    writeConfig(data);
    return true;
  });

  ipcMain.handle('settings:getApiKey', async () => {
    const cfg = readConfig();
    return cfg.apiKey || '';
  });

  ipcMain.handle('settings:getExportSettings', async () => {
    const cfg = readConfig();
    return cfg.exportSettings || {};
  });
}
