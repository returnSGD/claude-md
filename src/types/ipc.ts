export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export interface FileOpenResult {
  path: string;
  content: string;
}

export interface TerminalDataEvent {
  sessionId: number;
  data: string;
}

export interface ExportOptions {
  title?: string;
  customCSS?: string;
  pageSize?: string;
}

export interface ImageUploadResult {
  url: string;
  localPath?: string;
}

export interface AppConfig {
  apiKey?: string;
  apiBaseUrl?: string;
  theme?: 'light' | 'dark';
  fontSize?: number;
  recentFiles?: string[];
  bunPath?: string;
  firstLaunchCompleted?: boolean;
}

export interface ElectronAPI {
  file: {
    open(filePath?: string): Promise<FileOpenResult | null>;
    save(filePath: string, content: string): Promise<{ success: boolean }>;
    saveAs(content: string): Promise<string | null>;
    readDir(dirPath: string): Promise<FileTreeNode[]>;
    createFile(parentPath: string, name: string): Promise<string>;
    createDir(parentPath: string, name: string): Promise<string>;
    delete(filePath: string): Promise<{ success: boolean }>;
    rename(oldPath: string, newPath: string): Promise<{ success: boolean }>;
    onFileChange(callback: (events: any) => void): () => void;
  };
  terminal: {
    checkBun(): Promise<boolean>;
    create(workDir: string, options?: { cols?: number; rows?: number }): Promise<number>;
    write(sessionId: number, data: string): Promise<void>;
    resize(sessionId: number, cols: number, rows: number): Promise<void>;
    destroy(sessionId: number): Promise<void>;
    onData(callback: (data: TerminalDataEvent) => void): () => void;
  };
  export: {
    html(content: string, options?: ExportOptions): Promise<string | null>;
    pdf(content: string, options?: ExportOptions): Promise<string | null>;
    docx(content: string, options?: ExportOptions): Promise<string | null>;
  };
  image: {
    uploadFromPath(filePath: string): Promise<ImageUploadResult>;
    saveLocal(base64: string, fileName: string): Promise<ImageUploadResult>;
  };
  app: {
    getVersion(): Promise<string>;
    getPlatform(): Promise<string>;
    getUserDataPath(): Promise<string>;
    getConfigPath(): Promise<string>;
    onMenuAction(callback: (action: string) => void): () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
