import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Apply KaTeX regex replacements to a raw HTML string.
 * WARNING: only call this on HTML that does NOT contain raw $ chars
 * (i.e. code blocks must be protected / extracted first).
 */
function applyKatexToString(html: string): string {
  // Render block math $$...$$
  let result = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula: string) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return _match;
    }
  });

  // Render inline math $...$ (not $$, not $)
  result = result.replace(/(?<!\$)\$(?!\$)([^$]+?)\$(?!\$)/g, (_match: string, formula: string) => {
    try {
      return katex.renderToString(formula.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return _match;
    }
  });

  return result;
}

/**
 * Protect `<pre><code>...</code></pre>` blocks from KaTeX regex.
 * $ chars inside code (bash `$(cmd)`, JS template literals `${x}`,
 * LaTeX in markdown code snippets, etc.) would cause the inline-math
 * regex to bleed across the code block boundary and corrupt the HTML.
 *
 * Strategy:
 *  1. Extract every <pre><code>...</code></pre> block → placeholder
 *  2. Apply KaTeX to the remaining text
 *  3. Restore code blocks
 */
export function renderMathInHtml(html: string): string {
  const codeBlocks: string[] = [];

  // Step 1: extract code blocks
  const htmlNoCode = html.replace(
    /<pre><code[^>]*>[\s\S]*?<\/code><\/pre>/g,
    (match) => {
      const idx = codeBlocks.length;
      codeBlocks.push(match);
      return `\x00CODE${idx}\x00`;
    }
  );

  // Step 2: apply KaTeX to non-code HTML
  const rendered = applyKatexToString(htmlNoCode);

  // Step 3: restore code blocks
  return rendered.replace(/\x00CODE(\d+)\x00/g, (_match, idx) => {
    return codeBlocks[parseInt(idx, 10)];
  });
}

export function useMathRenderer(html: string): string {
  const prevRef = useRef('');

  const rendered = useRef(html);
  if (html !== prevRef.current) {
    prevRef.current = html;
    rendered.current = renderMathInHtml(html);
  }

  return rendered.current;
}
