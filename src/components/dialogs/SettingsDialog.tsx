import React, { useState } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';

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

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-in rounded-xl shadow-2xl p-6"
        style={{
          width: 500,
          maxHeight: '80vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h2>

        {/* Theme mode */}
        <div className="mb-4">
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
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
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
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min={12}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Line height */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Line Height: {lineHeight}
          </label>
          <input
            type="range"
            min={1.2}
            max={2.4}
            step={0.1}
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Max width (typewriter mode) */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Preview Max Width: {maxWidth}px
          </label>
          <input
            type="range"
            min={500}
            max={1400}
            step={50}
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            className="px-4 py-1.5 rounded text-sm"
            style={{
              backgroundColor: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
