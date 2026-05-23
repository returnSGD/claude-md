import { useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'inherit',
  });
  mermaidInitialized = true;
}

/**
 * After the preview HTML is rendered, find <code class="language-mermaid">
 * blocks and replace them with rendered Mermaid SVGs.
 */
export function useMermaidRenderer(html: string): (container: HTMLElement | null) => void {
  const renderedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    renderedRef.current.clear();
  }, [html]);

  return useCallback(
    async (container: HTMLElement | null) => {
      if (!container) return;

      initMermaid();

      const mermaidBlocks = container.querySelectorAll<HTMLElement>(
        'pre code.language-mermaid'
      );

      for (const block of mermaidBlocks) {
        const code = block.textContent || '';
        const id = `mermaid-${hashCode(code)}`;

        if (renderedRef.current.has(id)) continue;
        renderedRef.current.add(id);

        try {
          const { svg } = await mermaid.render(id + '-svg', code);
          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-container';
          wrapper.innerHTML = svg;
          wrapper.style.textAlign = 'center';
          wrapper.style.margin = '1em 0';

          const pre = block.closest('pre');
          if (pre) {
            pre.replaceWith(wrapper);
          }
        } catch {
          // Keep original code block on render error
          block.classList.add('mermaid-error');
        }
      }
    },
    [html]
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
