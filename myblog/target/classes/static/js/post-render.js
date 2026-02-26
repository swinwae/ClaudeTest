// ===========================
// Markdown 渲染器
// 从原 js/post.js 提取，去掉与 POSTS 数组耦合的部分，
// 供文章详情页和管理后台实时预览共同复用。
// ===========================

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '');
}

function renderTables(html) {
  const tableRegex = /((?:^\|.+\|\n?)+)/gm;
  return html.replace(tableRegex, function (block) {
    const rows = block.trim().split('\n').filter(function (r) { return r.trim(); });
    let tableHtml = '<table>';
    rows.forEach(function (row, i) {
      if (row.match(/^\|[-\s|:]+\|$/)) return; // 分隔行
      const cells = row.split('|').filter(function (_, idx, arr) {
        return idx !== 0 && idx !== arr.length - 1;
      });
      const tag = i === 0 ? 'th' : 'td';
      tableHtml += '<tr>' + cells.map(function (c) {
        return '<' + tag + '>' + c.trim() + '</' + tag + '>';
      }).join('') + '</tr>';
    });
    tableHtml += '</table>';
    return tableHtml;
  });
}

function renderMarkdown(md) {
  let html = md
    // 代码块（优先处理，避免内部语法被替换）
    .replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
      const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return '<pre><code class="lang-' + lang + '">' + escaped.trimEnd() + '</code></pre>';
    })
    // 标题 h4–h1
    .replace(/^#### (.+)$/gm, function (_, t) { return '<h4 id="' + slugify(t) + '">' + t + '</h4>'; })
    .replace(/^### (.+)$/gm, function (_, t)  { return '<h3 id="' + slugify(t) + '">' + t + '</h3>'; })
    .replace(/^## (.+)$/gm,  function (_, t)  { return '<h2 id="' + slugify(t) + '">' + t + '</h2>'; })
    .replace(/^# (.+)$/gm,   function (_, t)  { return '<h1 id="' + slugify(t) + '">' + t + '</h1>'; })
    // 粗斜体 / 粗体 / 斜体
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 引用块
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // 分割线
    .replace(/^---$/gm, '<hr>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // 无序列表
    .replace(/((?:^- .+\n?)+)/gm, function (block) {
      const items = block.trim().split('\n')
        .map(function (line) { return '<li>' + line.replace(/^- /, '') + '</li>'; }).join('');
      return '<ul>' + items + '</ul>';
    })
    // 有序列表
    .replace(/((?:^\d+\. .+\n?)+)/gm, function (block) {
      const items = block.trim().split('\n')
        .map(function (line) { return '<li>' + line.replace(/^\d+\. /, '') + '</li>'; }).join('');
      return '<ol>' + items + '</ol>';
    });

  // 处理表格
  html = renderTables(html);

  // 剩余行包裹 <p>
  const lines = html.split('\n');
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    const isBlock = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|table|tr|thead|tbody|th|td)/.test(trimmed);
    result.push(isBlock ? trimmed : '<p>' + trimmed + '</p>');
  }

  return result.join('\n');
}

// ===========================
// 目录（TOC）构建
// ===========================
function buildTOC() {
  const headings = document.querySelectorAll('.article-body h2, .article-body h3');
  const tocEl = document.getElementById('toc');
  const tocWidget = document.getElementById('tocWidget');

  if (!tocEl || headings.length === 0) {
    if (tocWidget) tocWidget.style.display = 'none';
    return;
  }

  headings.forEach(function (h) {
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = h.tagName === 'H3' ? 'toc-h3' : '';
    a.addEventListener('click', function (e) {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    tocEl.appendChild(a);
  });

  // 滚动高亮当前标题
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const id = entry.target.id;
      const link = tocEl.querySelector('a[href="#' + id + '"]');
      if (entry.isIntersecting && link) {
        tocEl.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  headings.forEach(function (h) { observer.observe(h); });
}
