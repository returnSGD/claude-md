import { Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';

export function buildAppMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: 'Claude MD Editor',
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:action', 'new-file'),
        },
        {
          label: 'Open File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:action', 'open-file'),
        },
        {
          label: 'Open Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow.webContents.send('menu:action', 'open-folder'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:action', 'save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu:action', 'save-as'),
        },
        { type: 'separator' },
        {
          label: 'Export as HTML...',
          click: () => mainWindow.webContents.send('menu:action', 'export-html'),
        },
        {
          label: 'Export as PDF...',
          click: () => mainWindow.webContents.send('menu:action', 'export-pdf'),
        },
        {
          label: 'Export as Word...',
          click: () => mainWindow.webContents.send('menu:action', 'export-docx'),
        },
        { type: 'separator' },
        ...(isMac ? [] : [{ role: 'quit' as const }]),
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow.webContents.send('menu:action', 'find'),
        },
        {
          label: 'Replace',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow.webContents.send('menu:action', 'replace'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Edit + Preview',
          click: () => mainWindow.webContents.send('menu:action', 'view-split'),
        },
        {
          label: 'Edit Only',
          click: () => mainWindow.webContents.send('menu:action', 'view-edit'),
        },
        {
          label: 'Preview Only',
          click: () => mainWindow.webContents.send('menu:action', 'view-preview'),
        },
        { type: 'separator' },
        {
          label: 'Toggle Terminal',
          accelerator: 'CmdOrCtrl+J',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-terminal'),
        },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow.webContents.send('menu:action', 'toggle-sidebar'),
        },
        { type: 'separator' },
        {
          label: 'Focus Mode',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => mainWindow.webContents.send('menu:action', 'focus-mode'),
        },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Theme',
      submenu: [
        {
          label: 'Dark Theme',
          type: 'radio',
          checked: true,
          click: () => mainWindow.webContents.send('menu:action', 'theme-dark'),
        },
        {
          label: 'Light Theme',
          type: 'radio',
          click: () => mainWindow.webContents.send('menu:action', 'theme-light'),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Claude MD Editor',
          click: () => mainWindow.webContents.send('menu:action', 'about'),
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
