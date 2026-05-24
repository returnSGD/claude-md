import { IpcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import MarkdownIt from 'markdown-it';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import markdownItMark from 'markdown-it-mark';
import hljs from 'highlight.js';
import katex from 'katex';

// ── markdown-it (mirrors PreviewPane pipeline) ──
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: true,
});

md.use(markdownItEmoji);
md.use(markdownItSub);
md.use(markdownItSup);
md.use(markdownItMark);

// ── cached CSS ──
let _cachedHighlightCSS = '';
let _cachedKatexCSS = '';

function getHighlightCSS(): string {
  if (_cachedHighlightCSS) return _cachedHighlightCSS;
  try {
    // Use require.resolve so Node module resolution finds the package
    // regardless of __dirname (works in both dev and packaged builds).
    const cssPath = require.resolve('highlight.js/styles/github.min.css');
    _cachedHighlightCSS = fs.readFileSync(cssPath, 'utf-8');
  } catch {
    _cachedHighlightCSS = '';
  }
  return _cachedHighlightCSS;
}

function getKatexCSS(): string {
  if (_cachedKatexCSS) return _cachedKatexCSS;
  try {
    const cssPath = require.resolve('katex/dist/katex.min.css');
    _cachedKatexCSS = fs.readFileSync(cssPath, 'utf-8');
  } catch {
    _cachedKatexCSS = '';
  }
  return _cachedKatexCSS;
}

// ── highlight.js post-processor ──
function highlightCodeBlocks(rawHtml: string): string {
  return rawHtml.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match: string, lang: string, codeText: string) => {
      const unescaped = codeText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      if (hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(unescaped, {
            language: lang,
            ignoreIllegals: true,
          }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch {
          // fall through
        }
      }

      const langClass = lang ? ` language-${lang}` : '';
      return `<pre><code class="hljs${langClass}">${codeText}</code></pre>`;
    }
  );
}

// ── full render pipeline (same as PreviewPane) ──
function renderMarkdown(content: string): string {
  // Step 0a: protect fenced code blocks
  const codeBlocks: string[] = [];
  const sourceNoCode = content.replace(
    /```[^\n]*\n[\s\S]*?```/g,
    (match) => {
      const idx = codeBlocks.length;
      codeBlocks.push(match);
      return `CB${idx}`;
    }
  );

  // Step 0b: protect math blocks
  const mathBlocks: string[] = [];
  let protectedSource = sourceNoCode.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (match) => {
      const idx = mathBlocks.length;
      mathBlocks.push(match);
      return `MB${idx}`;
    }
  );
  protectedSource = protectedSource.replace(
    /(?<!\$)\$(?!\$)([^$]+?)\$(?!\$)/g,
    (match) => {
      const idx = mathBlocks.length;
      mathBlocks.push(match);
      return `MI${idx}`;
    }
  );

  // 1. markdown-it
  const mdHtml = md.render(protectedSource);

  // 2. Restore code blocks
  const htmlWithCode = mdHtml.replace(
    /CB(\d+)/g,
    (_match, idx) => {
      const raw = codeBlocks[parseInt(idx, 10)];
      const m = raw.match(/^```(\w*)\n([\s\S]*?)\n?```$/);
      if (!m) return raw;
      const lang = m[1] || '';
      const code = m[2] || '';
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      const langAttr = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${langAttr}>${escaped}</code></pre>`;
    }
  );

  // 3. highlight.js
  const highlightedHtml = highlightCodeBlocks(htmlWithCode);

  // 4. Restore math with KaTeX
  return highlightedHtml.replace(
    /M([BI])(\d+)/g,
    (_match, type, idx) => {
      const block = mathBlocks[parseInt(idx, 10)];
      if (type === 'B') {
        const formula = block.replace(/^\$\$|\$\$$/g, '').trim();
        try {
          return katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
            strict: false,
          });
        } catch {
          return block;
        }
      } else {
        const formula = block.replace(/^\$|\$$/g, '').trim();
        try {
          return katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
            strict: false,
          });
        } catch {
          return block;
        }
      }
    }
  );
}

interface ExportSettings {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  pageSize?: 'A4' | 'Letter';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

// ── CSS shared by all export templates ──
function buildSharedCSS(customCSS?: string, exportSettings?: ExportSettings): string {
  const highlightCSS = getHighlightCSS();
  const katexCSS = getKatexCSS();
  const fontFamily = exportSettings?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif';
  const fontSize = exportSettings?.fontSize || 14;
  const lineHeight = exportSettings?.lineHeight || 1.7;
  return `
    ${highlightCSS}
    ${katexCSS}
    :root {
      --bg: #ffffff;
      --text: #1f2328;
      --text-secondary: #656d76;
      --border-color: #d0d7de;
      --accent-color: #0969da;
      --code-bg: #f6f8fa;
      --bg-secondary: #f6f8fa;
    }
    * { box-sizing: border-box; }
    body {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem;
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      color: var(--text);
      background: var(--bg);
    }
    h1 { font-size: 2em; margin: 0.67em 0; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; margin: 0.83em 0; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h3 { font-size: 1.17em; margin: 1em 0; }
    h4 { font-size: 1em; margin: 1.33em 0; }
    p { margin: 0.5em 0; }
    ul, ol { padding-left: 2em; margin: 0.5em 0; }
    li { margin: 0.25em 0; }
    blockquote {
      border-left: 4px solid var(--accent-color);
      padding-left: 1em;
      margin: 0.5em 0;
      color: var(--text-secondary);
    }
    code {
      background: var(--code-bg);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: Consolas, 'Courier New', 'Source Code Pro', monospace;
      font-size: 0.9em;
    }
    pre {
      background: var(--code-bg);
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0.5em 0;
    }
    pre code { background: none; padding: 0; }
    .katex {
      font-family: 'Times New Roman', 'STIX Two Text', 'Latin Modern Math', serif !important;
      font-size: 1.05em;
      line-height: 1.5;
    }
    .katex-display { margin: 1em 0; overflow-x: auto; overflow-y: hidden; }
    .katex * { font-family: 'Times New Roman', 'STIX Two Text', 'Latin Modern Math', serif !important; }
    table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
    th, td { border: 1px solid var(--border-color); padding: 6px 12px; text-align: left; }
    th { background: var(--bg-secondary); font-weight: 600; }
    img { max-width: 100%; border-radius: 4px; }
    a { color: var(--accent-color); text-decoration: none; }
    a:hover { text-decoration: underline; }
    hr { border: none; border-top: 1px solid var(--border-color); margin: 1em 0; }
    .mermaid-container { text-align: center; margin: 1em 0; }
    .mermaid-container svg { max-width: 100%; height: auto; }
    input[type="checkbox"] { margin-right: 0.5em; }
    ${customCSS || ''}
  `;
}

// ── HTML export template (with CDN Mermaid for interactive browser viewing) ──
function buildHTML(body: string, options?: any): string {
  const css = buildSharedCSS(options?.customCSS, options?.exportSettings);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options?.title || 'Exported Document'}</title>
  <style>${css}</style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
          async></script>
  <script>
    (function() {
      function initMermaid() {
        if (typeof mermaid === 'undefined') return;
        mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
        var blocks = document.querySelectorAll('pre code.language-mermaid');
        if (blocks.length === 0) return;
        Array.from(blocks).forEach(function(block, i) {
          var pre = block.parentElement;
          var code = block.textContent || '';
          var id = 'mermaid-' + i + '-' + Date.now();
          mermaid.render(id + '-svg', code).then(function(result) {
            var wrapper = document.createElement('div');
            wrapper.className = 'mermaid-container';
            wrapper.innerHTML = result.svg;
            pre.replaceWith(wrapper);
          }).catch(function() {
            block.classList.add('mermaid-error');
          });
        });
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMermaid);
      } else {
        initMermaid();
      }
    })();
  </script>
</head>
<body>${body}</body>
</html>`;
}

// ── PDF export template (no CDN scripts — self-contained, no network dependency) ──
function buildPDFHtml(body: string, options?: any): string {
  const css = buildSharedCSS(options?.customCSS, options?.exportSettings);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>${body}</body>
</html>`;
}

// ── IPC handlers ──
export function registerExportHandlers(ipcMain: IpcMain) {
  // ── HTML export ──
  ipcMain.handle(
    'export:html',
    async (event, content: string, options?: any) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return null;

      const result = await dialog.showSaveDialog(win, {
        title: 'Export as HTML',
        defaultPath: options?.defaultPath,
        filters: [{ name: 'HTML', extensions: ['html'] }],
      });

      if (result.canceled || !result.filePath) return null;

      const rendered = renderMarkdown(content);
      const fullHtml = buildHTML(rendered, options);

      fs.writeFileSync(result.filePath, fullHtml, 'utf-8');
      return result.filePath;
    }
  );

  // ── PDF export ──
  ipcMain.handle(
    'export:pdf',
    async (event, content: string, options?: any) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return null;

      const result = await dialog.showSaveDialog(win, {
        title: 'Export as PDF',
        defaultPath: options?.defaultPath,
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
      });

      if (result.canceled || !result.filePath) return null;

      const rendered = renderMarkdown(content);

      // Self-contained HTML — no CDN scripts, no network dependency.
      // This ensures the page loads instantly without blocking on external resources.
      const fullHtml = buildPDFHtml(rendered, options);

      const pdfWin = new BrowserWindow({
        width: 860,
        height: 800,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
        },
      });

      try {
        // Use base64 data URL — more reliable than encodeURIComponent for
        // large HTML content and avoids temp-file cleanup.
        const htmlBase64 = Buffer.from(fullHtml, 'utf-8').toString('base64');
        await pdfWin.loadURL(
          `data:text/html;charset=utf-8;base64,${htmlBase64}`
        );

        // Let the renderer settle (layout, fonts, CSS computed styles)
        await new Promise((r) => setTimeout(r, 200));

        const es = options?.exportSettings || {};
        const pdfData = await pdfWin.webContents.printToPDF({
          printBackground: true,
          pageSize: (es.pageSize || 'A4') as 'A4' | 'Letter',
          margins: {
            top: es.marginTop ?? 1.0,
            bottom: es.marginBottom ?? 1.0,
            left: es.marginLeft ?? 1.5,
            right: es.marginRight ?? 1.5,
          } as Electron.Margins,
        });

        fs.writeFileSync(result.filePath, pdfData);
        return result.filePath;
      } catch (err) {
        console.error('PDF export error:', err);
        // Show error dialog so user knows what went wrong
        dialog.showErrorBox(
          'PDF Export Failed',
          `Could not generate PDF:\n${String(err)}`
        );
        return null;
      } finally {
        pdfWin.close();
      }
    }
  );

  // ── DOCX export ──
  ipcMain.handle(
    'export:docx',
    async (event, content: string, options?: any) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (!win) return null;

      const result = await dialog.showSaveDialog(win, {
        title: 'Export as Word Document',
        defaultPath: options?.defaultPath,
        filters: [{ name: 'Word Document', extensions: ['doc'] }],
      });

      if (result.canceled || !result.filePath) return null;

      const rendered = renderMarkdown(content);
      const fullHtml = buildHTML(rendered, options);

      fs.writeFileSync(result.filePath, fullHtml, 'utf-8');
      return result.filePath;
    }
  );
}
