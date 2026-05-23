import React, { useEffect, useCallback, useState } from 'react';
import AppShell from './components/layout/AppShell';
import GlobalSearchDialog from './components/dialogs/GlobalSearchDialog';
import FirstLaunchWizard from './components/dialogs/FirstLaunchWizard';
import { useThemeStore } from './stores/useThemeStore';
import { useEditorStore } from './stores/useEditorStore';
import { useFileStore } from './stores/useFileStore';
import { useTerminalStore } from './stores/useTerminalStore';
import { usePreviewStore } from './stores/usePreviewStore';
import { useAutoSave } from './hooks/useAutoSave';

export default function App() {
  const setMode = useThemeStore((s) => s.setMode);
  const mode = useThemeStore((s) => s.mode);
  const isFocusMode = useThemeStore((s) => s.isFocusMode);

  const activeTabId = useEditorStore((s) => s.activeTabId);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const openFile = useEditorStore((s) => s.openFile);
  const updateContent = useEditorStore((s) => s.updateContent);
  const markSaved = useEditorStore((s) => s.markSaved);

  const setRootPath = useFileStore((s) => s.setRootPath);
  const refreshTree = useFileStore((s) => s.refreshTree);
  const rootPath = useFileStore((s) => s.rootPath);

  const isConnected = useTerminalStore((s) => s.isConnected);
  const connect = useTerminalStore((s) => s.connect);

  const viewMode = usePreviewStore((s) => s.viewMode);
  const setViewMode = usePreviewStore((s) => s.setViewMode);

  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);
  const toggleTerminal = useTerminalStore((s) => s.toggleVisible);
  const toggleFocusMode = useThemeStore((s) => s.toggleFocusMode);
  const toggleMode = useThemeStore((s) => s.toggleMode);

  // Dialog state
  const [showSearch, setShowSearch] = useState(false);
  const [showFirstLaunch, setShowFirstLaunch] = useState(false);

  // Auto-save
  useAutoSave();

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  // Check first launch
  useEffect(() => {
    const completed = localStorage.getItem('md-editor-first-launch');
    if (!completed && !showFirstLaunch) {
      setShowFirstLaunch(true);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+F → Global search
      if (ctrl && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setShowSearch(true);
      }

      // Escape → exit focus mode
      if (e.key === 'Escape' && isFocusMode) {
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Listen for menu actions from Electron
  useEffect(() => {
    if (!window.electronAPI) return;
    const cleanup = window.electronAPI.app.onMenuAction((action: string) => {
      switch (action) {
        case 'new-file':
          openFile('untitled.md', '');
          break;
        case 'open-file':
          handleOpenFile();
          break;
        case 'open-folder':
          handleOpenFolder();
          break;
        case 'save':
          handleSave();
          break;
        case 'save-as':
          handleSaveAs();
          break;
        case 'export-html':
          handleExport('html');
          break;
        case 'export-pdf':
          handleExport('pdf');
          break;
        case 'export-docx':
          handleExport('docx');
          break;
        case 'find':
          setShowSearch(true);
          break;
        case 'replace':
          setShowSearch(true);
          break;
        case 'view-split':
          setViewMode('split');
          break;
        case 'view-edit':
          setViewMode('edit-only');
          break;
        case 'view-preview':
          setViewMode('preview-only');
          break;
        case 'toggle-terminal':
          toggleTerminal();
          break;
        case 'toggle-sidebar':
          toggleSidebar();
          break;
        case 'focus-mode':
          toggleFocusMode();
          break;
        case 'theme-dark':
          setMode('dark');
          break;
        case 'theme-light':
          setMode('light');
          break;
      }
    });
    return cleanup;
  }, []);

  const handleOpenFile = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.file.open();
    if (result) {
      openFile(result.path, result.content);
      if (!rootPath) {
        const dir = result.path.split(/[/\\]/).slice(0, -1).join('/');
        setRootPath(dir);
        refreshTree();
      }
    }
  }, [rootPath]);

  const handleOpenFolder = useCallback(async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.file.open();
    if (result) {
      const dir = result.path.split(/[/\\]/).slice(0, -1).join('/');
      setRootPath(dir);
      refreshTree();
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!window.electronAPI) return;
    const tab = getActiveTab();
    if (!tab) return;

    if (tab.filePath === 'untitled.md') {
      const savedPath = await window.electronAPI.file.saveAs(tab.content);
      if (savedPath) {
        updateContent(tab.id, tab.content);
        markSaved(tab.id);
      }
    } else {
      await window.electronAPI.file.save(tab.filePath, tab.content);
      markSaved(tab.id);
    }
  }, [activeTabId]);

  const handleSaveAs = useCallback(async () => {
    if (!window.electronAPI) return;
    const tab = getActiveTab();
    if (!tab) return;
    const savedPath = await window.electronAPI.file.saveAs(tab.content);
    if (savedPath) {
      markSaved(tab.id);
    }
  }, [activeTabId]);

  const handleExport = useCallback(
    async (format: 'html' | 'pdf' | 'docx') => {
      if (!window.electronAPI) return;
      const tab = getActiveTab();
      if (!tab) return;
      await window.electronAPI.export[format](tab.content);
    },
    [activeTabId]
  );

  const handleFirstLaunchComplete = useCallback(
    (apiKey?: string, apiBaseUrl?: string) => {
      localStorage.setItem('md-editor-first-launch', 'true');
      setShowFirstLaunch(false);
      // In production, save apiKey to encrypted config via IPC
    },
    []
  );

  // Connect terminal on first load
  useEffect(() => {
    if (!isConnected && rootPath && window.electronAPI) {
      connect(rootPath);
    }
  }, [rootPath]);

  return (
    <>
      <AppShell />
      <GlobalSearchDialog
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
      {showFirstLaunch && (
        <FirstLaunchWizard onComplete={handleFirstLaunchComplete} />
      )}
    </>
  );
}
