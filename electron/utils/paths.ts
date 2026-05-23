import { app } from 'electron';
import path from 'path';
import fs from 'fs';

export function getUserDataPath(): string {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  return userDataPath;
}

export function getConfigPath(): string {
  const configDir = getUserDataPath();
  const configPath = path.join(configDir, 'config.json');
  return configPath;
}

export function getAssetsDir(projectRoot: string): string {
  const assetsDir = path.join(projectRoot, 'assets', 'images');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  return assetsDir;
}
