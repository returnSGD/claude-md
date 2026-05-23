import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Detect Bun runtime installation path.
 * Returns the Bun executable path if found, null otherwise.
 */
export function findBun(): string | null {
  const platform = process.platform;
  const cmd = platform === 'win32' ? 'where bun' : 'which bun';

  try {
    const result = execSync(cmd, { encoding: 'utf-8' }).trim();
    const lines = result.split('\n').filter(Boolean);
    if (lines.length > 0) {
      const bunPath = lines[0].trim();
      if (fs.existsSync(bunPath)) {
        return bunPath;
      }
    }
  } catch {
    // which/where returned non-zero, try common paths
  }

  // Fallback: check common install paths
  const homeDir = process.env.HOME || process.env.USERPROFILE || '~';
  const commonPaths = [
    path.join(homeDir, '.bun', 'bin', 'bun'),
    '/usr/local/bin/bun',
    '/usr/bin/bun',
    'C:\\Program Files\\bun\\bun.exe',
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

/**
 * Get the install command for the current platform.
 */
export function getBunInstallCommand(): string {
  switch (process.platform) {
    case 'win32':
      return 'powershell -c "irm bun.sh/install.ps1 | iex"';
    case 'darwin':
    case 'linux':
    default:
      return 'curl -fsSL https://bun.sh/install | bash';
  }
}
