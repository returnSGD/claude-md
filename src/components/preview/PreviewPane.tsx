import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import MarkdownIt from 'markdown-it';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import markdownItSub from 'markdown-it-sub';
import markdownItSup from 'markdown-it-sup';
import markdownItMark from 'markdown-it-mark';
import hljs from 'highlight.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useEditorStore } from '../../stores/useEditorStore';
import { usePreviewStore } from '../../stores/usePreviewStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useMermaidRenderer } from '../../hooks/useMermaidRenderer';

// markdown-it: no highlight option — produce clean <pre><code> first,
// then post-process to apply highlight.js.  This avoids markdown-it
// escaping or mis-wrapping the highlight output.
const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: true,
});

md.use(markdownItEmoji);
md.use(markdownItSub);
md.use(markdownItSup);
md.use(markdownItMark);

/**
 * Post-process raw HTML from markdown-it: find every
 * <pre><code class="language-xxx"> and replace its inner text
 * with highlight.js output.  Non-highlighted blocks are left as-is
 * (markdown-it already HTML-escaped the source).
 */
function highlightCodeBlocks(rawHtml: string): string {
  // Use a regex that matches <pre><code class="language-XXX">...</code></pre>
  return rawHtml.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match: string, lang: string, codeText: string) => {
      // codeText is the HTML-escaped source; unescape before passing to hljs
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
          // fall through: keep original escaped text
        }
      }

      // No language match — wrap with hljs for consistent styling,
      // but preserve the original language class so Mermaid renderer can find it
      const langClass = lang ? ` language-${lang}` : '';
      return `<pre><code class="hljs${langClass}">${codeText}</code></pre>`;
    }
  );
}

export default function PreviewPane() {
  const previewRef = useRef<HTMLDivElement>(null);
  const getActiveContent = useEditorStore((s) => s.getActiveContent);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const scrollRatio = usePreviewStore((s) => s.scrollRatio);
  const setScrollRatio = usePreviewStore((s) => s.setScrollRatio);
  const viewMode = usePreviewStore((s) => s.viewMode);
  const setRenderedHtml = usePreviewStore((s) => s.setRenderedHtml);
  const fontSize = useThemeStore((s) => s.fontSize);

  const content = getActiveContent();

  // Render pipeline:
  //   protect code → protect math → md → restore code → highlight → render math
  const html = useMemo(() => {
    try {
      const source = content || '';

      // Step 0a: protect fenced code blocks so that $ inside code
      // (bash $(cmd), JS template ${x}, etc.) never reaches the math regex
      const codeBlocks: string[] = [];
      const sourceNoCode = source.replace(
        /```[^\n]*\n[\s\S]*?```/g,
        (match) => {
          const idx = codeBlocks.length;
          codeBlocks.push(match);
          return `CB${idx}`;
        }
      );

      // Step 0b: protect math blocks before markdown-it so that
      // breaks:true does not inject <br> inside $$...$$ or $...$
      // (which would corrupt LaTeX \\ row separators in matrices etc.)
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

      // 1. markdown-it produces clean <pre><code> with escaped text
      const mdHtml = md.render(protectedSource);

      // 2. Restore code blocks as <pre><code>…</code></pre> in the HTML
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

      // 3. Post-process: highlight.js on code blocks
      const highlightedHtml = highlightCodeBlocks(htmlWithCode);

      // 4. Restore math placeholders with KaTeX rendering
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
            } catch { return block; }
          } else {
            const formula = block.replace(/^\$|\$$/g, '').trim();
            try {
              return katex.renderToString(formula, {
                displayMode: false,
                throwOnError: false,
                strict: false,
              });
            } catch { return block; }
          }
        }
      );
    } catch {
      return '<p style="color: #e06c75">Render error</p>';
    }
  }, [content]);

  // Mermaid renderer
  const renderMermaid = useMermaidRenderer(html);

  // After HTML is rendered, process Mermaid blocks
  useEffect(() => {
    if (previewRef.current) {
      // Delay to let React commit the DOM
      const timer = setTimeout(() => {
        renderMermaid(previewRef.current);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [html, renderMermaid]);

  useEffect(() => {
    setRenderedHtml(html);
  }, [html]);

  // Scroll sync: respond to editor scroll
  useEffect(() => {
    if (!previewRef.current) return;
    const el = previewRef.current.parentElement;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTop = scrollRatio * maxScroll;
  }, [scrollRatio]);

  // Emit scroll events back to editor
  const handleScroll = useCallback(() => {
    if (!previewRef.current) return;
    const el = previewRef.current.parentElement;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const ratio = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
    setScrollRatio(ratio);
  }, []);

  if (!content) {
    return (
      <div
        className="h-full flex items-center justify-center p-8"
        style={{
          backgroundColor: 'var(--preview-bg)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="text-center">
          <p className="text-lg mb-2">Preview</p>
          <p className="text-sm">Start typing in the editor to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-auto"
      style={{
        backgroundColor: 'var(--preview-bg)',
        fontSize: `${fontSize}px`,
      }}
      onScroll={handleScroll}
    >
      <div
        ref={previewRef}
        className="markdown-preview p-6"
        style={{
          maxWidth: 'var(--preview-max-width, 800px)',
          margin: '0 auto',
          minHeight: '100%',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
