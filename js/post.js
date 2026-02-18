// ===========================
// Theme Management
// ===========================
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

document.getElementById('themeToggle')?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Mobile Menu
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

// ===========================
// Parse URL params
// ===========================
const params = new URLSearchParams(window.location.search);
const postId = parseInt(params.get('id'), 10);

// ===========================
// Simple Markdown Renderer
// ===========================
function renderMarkdown(md) {
  let html = md
    // Code blocks (must be before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre><code class="lang-${lang}">${escaped.trimEnd()}</code></pre>`;
    })
    // Headings
    .replace(/^#### (.+)$/gm, '<h4 id="$1">$1</h4>')
    .replace(/^### (.+)$/gm, (_, t) => `<h3 id="${slugify(t)}">${t}</h3>`)
    .replace(/^## (.+)$/gm, (_, t) => `<h2 id="${slugify(t)}">${t}</h2>`)
    .replace(/^# (.+)$/gm, (_, t) => `<h1 id="${slugify(t)}">${t}</h1>`)
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // HR
    .replace(/^---$/gm, '<hr>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => match)
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered lists (collect consecutive items)
    .replace(/((?:^- .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n')
        .map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    })
    // Ordered lists
    .replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
      const items = block.trim().split('\n')
        .map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    });

  // Handle tables
  html = renderTables(html);

  // Wrap remaining lines in paragraphs
  const lines = html.split('\n');
  const result = [];
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const isBlock = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|table|tr|thead|tbody|th|td)/.test(trimmed);
    if (isBlock) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  return result.join('\n');
}

function renderTables(html) {
  const tableRegex = /((?:^\|.+\|\n?)+)/gm;
  return html.replace(tableRegex, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    let tableHtml = '<table>';
    rows.forEach((row, i) => {
      if (row.match(/^\|[-\s|:]+\|$/)) return; // separator row
      const cells = row.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
      const tag = i === 0 ? 'th' : 'td';
      tableHtml += `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    });
    tableHtml += '</table>';
    return tableHtml;
  });
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// ===========================
// Get gradient
// ===========================
function getGradient(id) {
  const gradients = [
    '#6366f1, #8b5cf6',
    '#06b6d4, #3b82f6',
    '#10b981, #6366f1',
    '#f59e0b, #ef4444',
    '#ec4899, #8b5cf6',
    '#14b8a6, #06b6d4',
    '#f97316, #eab308',
    '#6366f1, #06b6d4',
  ];
  return gradients[(id - 1) % gradients.length];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===========================
// Render Post
// ===========================
function renderPost(post) {
  document.title = `${post.title} - MyBlog`;

  const articleEl = document.getElementById('articleContent');
  if (!articleEl) return;

  const content = renderMarkdown(post.content);

  // Find adjacent posts
  const idx = POSTS.findIndex(p => p.id === post.id);
  const prev = POSTS[idx + 1];
  const next = POSTS[idx - 1];

  articleEl.innerHTML = `
    <div class="article-header">
      <div class="article-tags">
        ${post.tags.map(t => `<span class="article-tag">${t}</span>`).join('')}
      </div>
      <h1 class="article-title">${post.title}</h1>
      <div class="article-meta">
        <span class="article-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${formatDate(post.date)}
        </span>
        <span class="article-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${post.readTime}阅读
        </span>
      </div>
    </div>

    <div class="article-cover" style="background: linear-gradient(135deg, ${getGradient(post.id)});">
      <span style="font-size:5rem;">${post.emoji}</span>
    </div>

    <div class="article-body">
      ${content}
    </div>

    <div class="article-footer">
      ${prev ? `<button class="article-nav-btn" onclick="location.href='post.html?id=${prev.id}'">← ${prev.title.substring(0,20)}...</button>` : '<div></div>'}
      ${next ? `<button class="article-nav-btn" onclick="location.href='post.html?id=${next.id}'">${next.title.substring(0,20)}... →</button>` : '<div></div>'}
    </div>
  `;
}

// ===========================
// Table of Contents
// ===========================
function buildTOC() {
  const headings = document.querySelectorAll('.article-body h2, .article-body h3');
  const tocEl = document.getElementById('toc');
  const tocWidget = document.getElementById('tocWidget');

  if (!tocEl || headings.length === 0) {
    if (tocWidget) tocWidget.style.display = 'none';
    return;
  }

  headings.forEach(h => {
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    a.className = h.tagName === 'H3' ? 'toc-h3' : '';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tocEl.appendChild(a);
  });

  // Highlight active TOC item
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = tocEl.querySelector(`a[href="#${id}"]`);
      if (entry.isIntersecting && link) {
        tocEl.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

// ===========================
// Related Posts
// ===========================
function renderRelatedPosts(post) {
  const el = document.getElementById('relatedPosts');
  if (!el) return;

  const related = POSTS
    .filter(p => p.id !== post.id && p.tags.some(t => post.tags.includes(t)))
    .slice(0, 4);

  if (related.length === 0) {
    el.innerHTML = '<li style="color:var(--text-muted);font-size:0.875rem;">暂无相关文章</li>';
    return;
  }

  el.innerHTML = related.map(p => `
    <li>
      <a href="post.html?id=${p.id}">${p.title}</a>
      <span class="post-date">${formatDate(p.date)}</span>
    </li>
  `).join('');
}

// ===========================
// Back to Top
// ===========================
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  const post = POSTS.find(p => p.id === postId);

  if (!post) {
    document.getElementById('articleContent').innerHTML = `
      <div style="padding:60px 40px;text-align:center;">
        <h2 style="margin-bottom:16px;">文章不存在</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;">该文章可能已被删除或链接有误。</p>
        <a href="index.html" style="color:var(--accent-primary);font-weight:600;">← 返回首页</a>
      </div>
    `;
    return;
  }

  renderPost(post);

  // Build TOC after render
  setTimeout(() => {
    buildTOC();
  }, 50);

  renderRelatedPosts(post);
});
