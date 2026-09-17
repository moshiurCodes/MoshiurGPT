import { Marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked with highlight.js
const marked = new Marked({
  gfm: true,
  breaks: true,
});

// Custom renderer for code blocks to add header bar, language label, and copy button
const renderer = {
  code({ text, lang }) {
    const validLang = lang && hljs.getLanguage(lang) ? lang : '';
    let highlighted;
    
    try {
      if (validLang) {
        highlighted = hljs.highlight(text, { language: validLang, ignoreIllegals: true }).value;
      } else {
        highlighted = hljs.highlightAuto(text).value;
      }
    } catch (e) {
      highlighted = escapeHtml(text);
    }

    const displayLang = validLang || 'code';
    const encodedCode = encodeURIComponent(text);

    return `
      <div class="code-block-container" data-lang="${displayLang}">
        <div class="code-block-header">
          <span class="code-block-lang">
            <svg class="code-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            ${displayLang}
          </span>
          <button class="code-copy-btn" data-code="${encodedCode}" onclick="window.copyCodeFromBlock(this)" title="Copy code">
            <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span class="copy-text">Copy</span>
          </button>
        </div>
        <pre><code class="hljs language-${displayLang}">${highlighted}</code></pre>
      </div>
    `;
  },
  
  table({ header, rows }) {
    return `
      <div class="table-responsive-wrapper">
        <table class="gemini-table">
          <thead>${header}</thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  },
  
  link({ href, title, text }) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="gemini-link"${titleAttr}>${text} <svg class="external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`;
  }
};

marked.use({ renderer });

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderMarkdown(content) {
  if (!content) return '';
  try {
    return marked.parse(content);
  } catch (err) {
    console.error('Markdown parse error:', err);
    return escapeHtml(content);
  }
}
