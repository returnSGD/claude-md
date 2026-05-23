import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'app-bg-primary': 'var(--bg-primary)',
        'app-bg-secondary': 'var(--bg-secondary)',
        'app-text-primary': 'var(--text-primary)',
        'app-text-secondary': 'var(--text-secondary)',
        'app-border': 'var(--border-color)',
        'app-accent': 'var(--accent-color)',
        'editor-bg': 'var(--editor-bg)',
        'preview-bg': 'var(--preview-bg)',
        'terminal-bg': 'var(--terminal-bg)',
      },
    },
  },
  plugins: [],
} satisfies Config;
