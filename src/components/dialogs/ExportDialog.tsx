import React, { useState } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'html' | 'pdf' | 'docx', options?: { customCSS?: string }) => void;
}

export default function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [customCSS, setCustomCSS] = useState('');

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
          width: 420,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Export Document
        </h2>

        <div className="space-y-2 mb-4">
          {([
            { format: 'html', label: 'HTML', ext: '.html', desc: 'Self-contained web page with styles' },
            { format: 'pdf', label: 'PDF', ext: '.pdf', desc: 'Print-ready PDF document' },
            { format: 'docx', label: 'Word (DOCX)', ext: '.docx', desc: 'Microsoft Word compatible' },
          ] as const).map(({ format, label, ext, desc }) => (
            <button
              key={format}
              className="w-full text-left px-4 py-3 rounded-lg text-sm transition-colors"
              style={{
                border: '1px solid var(--border-color)',
                background: 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => onExport(format, customCSS ? { customCSS } : undefined)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {label} <span style={{ color: 'var(--text-muted)' }}>{ext}</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {desc}
              </div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            Custom CSS (optional)
          </label>
          <textarea
            value={customCSS}
            onChange={(e) => setCustomCSS(e.target.value)}
            className="w-full px-3 py-2 rounded text-xs font-mono"
            rows={3}
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
            }}
            placeholder="body { font-family: Georgia, serif; }"
          />
        </div>

        <div className="flex justify-end gap-2">
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
        </div>
      </div>
    </div>
  );
}
