import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CODE_THEMES = [
  { id: 'one-dark', label: 'One Dark' },
  { id: 'github', label: 'GitHub' },
  { id: 'monokai', label: 'Monokai' },
  { id: 'solarized', label: 'Solarized' },
  { id: 'dracula', label: 'Dracula' },
];

const FONT_FAMILIES = [
  { id: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif', label: 'System Default' },
  { id: '"Microsoft YaHei", "微软雅黑", sans-serif', label: 'Microsoft YaHei' },
  { id: '"STSong", "华文宋体", "SimSun", "宋体", serif', label: 'Song / SimSun' },
  { id: '"STKaiti", "华文楷体", "KaiTi", "楷体", serif', label: 'KaiTi' },
  { id: 'Georgia, "Times New Roman", serif', label: 'Times New Roman' },
  { id: 'Consolas, "Courier New", monospace', label: 'Monospace' },
];

const PAGE_SIZES = [
  { id: 'A4', label: 'A4 (210×297mm)' },
  { id: 'Letter', label: 'Letter (216×279mm)' },
];

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  // Theme settings
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const codeTheme = useThemeStore((s) => s.codeTheme);
  const setCodeTheme = useThemeStore((s) => s.setCodeTheme);
  const fontSize = useThemeStore((s) => s.fontSize);
  const setFontSize = useThemeStore((s) => s.setFontSize);
  const lineHeight = useThemeStore((s) => s.lineHeight);
  const setLineHeight = useThemeStore((s) => s.setLineHeight);
  const maxWidth = useThemeStore((s) => s.maxWidth);
  const setMaxWidth = useThemeStore((s) => s.setMaxWidth);

  // Persistent settings
  const apiKey = useSettingsStore((s) => s.apiKey);
  const apiBaseUrl = useSettingsStore((s) => s.apiBaseUrl);
  const exportSettings = useSettingsStore((s) => s.exportSettings);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const setApiBaseUrl = useSettingsStore((s) => s.setApiBaseUrl);
  const setExportSettings = useSettingsStore((s) => s.setExportSettings);
  const save = useSettingsStore((s) => s.save);
  const loaded = useSettingsStore((s) => s.loaded);
  const load = useSettingsStore((s) => s.load);

  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'export'>('general');

  // Load persisted settings on open
  useEffect(() => {
    if (isOpen && !loaded) {
      load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in rounded-xl shadow-2xl flex flex-col"
        style={{
          width: 580,
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <button
            className="text-lg leading-none px-1"
            style={{ color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'none' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-2 gap-1" style={{ borderBottom: '1px solid var(--border-color)' }}>
          {(['general', 'editor', 'export'] as const).map((t) => (
            <button
              key={t}
              className="px-4 py-2 text-sm rounded-t capitalize"
              style={{
                backgroundColor: activeTab === t ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === t ? 'var(--accent-color)' : 'var(--text-muted)',
                border: activeTab === t ? '1px solid var(--border-color)' : '1px solid transparent',
                borderBottom: activeTab === t ? '1px solid var(--bg-primary)' : 'none',
                marginBottom: -1,
                cursor: 'pointer',
                position: 'relative' as const,
                zIndex: activeTab === t ? 1 : 0,
              }}
              onClick={() => setActiveTab(t)}
            >
              {t === 'general' ? 'API' : t === 'editor' ? 'Editor' : 'Export'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {activeTab === 'general' && (
            <>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Configure your Anthropic API key for Claude Code chat.
                Get a key at{' '}
                <a href="https://console.anthropic.com" target="_blank" style={{ color: 'var(--accent-color)' }}>
                  console.anthropic.com
                </a>
              </p>

              {/* API Key */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="flex-1 px-3 py-2 rounded text-sm font-mono"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  <button
                    className="px-3 py-2 rounded text-xs"
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* API Base URL */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  API Base URL <span className="opacity-50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="https://api.anthropic.com"
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'editor' && (
            <>
              {/* Theme */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Theme Mode
                </label>
                <div className="flex gap-2">
                  {(['dark', 'light'] as const).map((m) => (
                    <button
                      key={m}
                      className="flex-1 px-3 py-2 rounded text-sm capitalize"
                      style={{
                        backgroundColor: mode === m ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                        color: mode === m ? '#fff' : 'var(--text-primary)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code theme */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Code Highlight Theme
                </label>
                <select
                  value={codeTheme}
                  onChange={(e) => setCodeTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  {CODE_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Font size */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Editor Font Size: {fontSize}px
                </label>
                <input type="range" min={12} max={24} value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))} className="w-full" />
              </div>

              {/* Line height */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Line Height: {lineHeight}
                </label>
                <input type="range" min={1.2} max={2.4} step={0.1} value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))} className="w-full" />
              </div>

              {/* Max width */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Preview Max Width: {maxWidth}px
                </label>
                <input type="range" min={500} max={1400} step={50} value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full" />
              </div>
            </>
          )}

          {activeTab === 'export' && (
            <>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                These settings apply when exporting to PDF or Word.
              </p>

              {/* Font family */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Font Family
                </label>
                <select
                  value={exportSettings.fontFamily}
                  onChange={(e) => setExportSettings({ fontFamily: e.target.value })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Font size */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Font Size: {exportSettings.fontSize}px
                </label>
                <input type="range" min={10} max={22} value={exportSettings.fontSize}
                  onChange={(e) => setExportSettings({ fontSize: Number(e.target.value) })} className="w-full" />
              </div>

              {/* Line height */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Line Spacing: {exportSettings.lineHeight}
                </label>
                <input type="range" min={1.0} max={2.5} step={0.1} value={exportSettings.lineHeight}
                  onChange={(e) => setExportSettings({ lineHeight: Number(e.target.value) })} className="w-full" />
              </div>

              {/* Page size */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Page Size
                </label>
                <select
                  value={exportSettings.pageSize}
                  onChange={(e) => setExportSettings({ pageSize: e.target.value as 'A4' | 'Letter' })}
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  {PAGE_SIZES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Margins */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Margins (cm)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ['marginTop', 'Top'],
                    ['marginBottom', 'Bottom'],
                    ['marginLeft', 'Left'],
                    ['marginRight', 'Right'],
                  ] as const).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs w-12" style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <input
                        type="number"
                        min={0.5}
                        max={5}
                        step={0.1}
                        value={exportSettings[key]}
                        onChange={(e) => setExportSettings({ [key]: Number(e.target.value) })}
                        className="flex-1 px-2 py-1.5 rounded text-sm text-center"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          width: '60px',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            className="px-4 py-1.5 rounded text-sm"
            style={{
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1.5 rounded text-sm font-medium"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={async () => {
              await save();
              onClose();
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
