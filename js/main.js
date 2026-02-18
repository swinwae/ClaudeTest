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

// ===========================
// Mobile Menu
// ===========================
document.getElementById('menuToggle')?.addEventListener('click', () => {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('open');
  }
});

// ===========================
// Posts Rendering
// ===========================
let currentTag = 'all';
let currentSearch = '';
let displayedCount = 0;
const PAGE_SIZE = 4;

function getAllTags() {
  const tagSet = new Set();
  POSTS.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

function getFilteredPosts() {
  return POSTS.filter(post => {
    const matchesTag = currentTag === 'all' || post.tags.includes(currentTag);
    const matchesSearch = !currentSearch ||
      post.title.toLowerCase().includes(currentSearch) ||
      post.excerpt.toLowerCase().includes(currentSearch) ||
      post.tags.some(t => t.toLowerCase().includes(currentSearch));
    return matchesTag && matchesSearch;
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function createPostCard(post, index) {
  const isFeatured = index === 0 && currentTag === 'all' && !currentSearch;
  const card = document.createElement('div');
  card.className = `post-card${isFeatured ? ' featured' : ''}`;
  card.style.animationDelay = `${index * 0.05}s`;
  card.onclick = () => {
    window.location.href = `post.html?id=${post.id}`;
  };

  card.innerHTML = `
    <div class="post-card-cover" style="background: linear-gradient(135deg, ${getGradient(post.id)});">
      <span style="position:relative;z-index:1;">${post.emoji}</span>
    </div>
    <div class="post-card-inner">
      <div class="post-card-body">
        <div class="post-meta">
          <span class="post-meta-tag">${post.tags[0]}</span>
          <span>${formatDate(post.date)}</span>
        </div>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
      </div>
      <div class="post-card-footer">
        <span class="read-more">阅读全文</span>
        <span class="post-read-time">${post.readTime}阅读</span>
      </div>
    </div>
  `;

  return card;
}

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

function renderPosts() {
  const grid = document.getElementById('postsGrid');
  if (!grid) return;

  const filtered = getFilteredPosts();
  const searchMsg = document.getElementById('searchResultsMsg');

  if (currentSearch && searchMsg) {
    searchMsg.style.display = 'block';
    searchMsg.textContent = `找到 ${filtered.length} 篇与"${currentSearch}"相关的文章`;
  } else if (searchMsg) {
    searchMsg.style.display = 'none';
  }

  grid.innerHTML = '';
  displayedCount = 0;

  const toShow = filtered.slice(0, PAGE_SIZE);
  toShow.forEach((post, i) => {
    grid.appendChild(createPostCard(post, i));
    displayedCount++;
  });

  const loadMore = document.getElementById('loadMoreWrapper');
  if (loadMore) {
    loadMore.style.display = filtered.length > displayedCount ? 'block' : 'none';
  }
}

function loadMore() {
  const grid = document.getElementById('postsGrid');
  if (!grid) return;

  const filtered = getFilteredPosts();
  const nextBatch = filtered.slice(displayedCount, displayedCount + PAGE_SIZE);

  nextBatch.forEach((post, i) => {
    grid.appendChild(createPostCard(post, displayedCount + i));
    displayedCount++;
  });

  const loadMore = document.getElementById('loadMoreWrapper');
  if (loadMore) {
    loadMore.style.display = filtered.length > displayedCount ? 'block' : 'none';
  }
}

// ===========================
// Tags Filter
// ===========================
function initTagsFilter() {
  const filter = document.getElementById('tagsFilter');
  if (!filter) return;

  const tags = getAllTags();
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.dataset.tag = tag;
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      currentTag = tag;
      currentSearch = '';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPosts();
    });
    filter.appendChild(btn);
  });

  // "All" button click
  filter.querySelector('[data-tag="all"]').addEventListener('click', () => {
    currentTag = 'all';
    currentSearch = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
    filter.querySelector('[data-tag="all"]').classList.add('active');
    renderPosts();
  });
}

// ===========================
// Search
// ===========================
function performSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  currentSearch = input.value.trim().toLowerCase();
  currentTag = 'all';
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('[data-tag="all"]');
  if (allBtn) allBtn.classList.add('active');
  renderPosts();
}

document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

// ===========================
// Sidebar
// ===========================
function initSidebar() {
  // Recent Posts
  const recentEl = document.getElementById('recentPosts');
  if (recentEl) {
    const recent = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    recentEl.innerHTML = recent.map(p => `
      <li>
        <a href="post.html?id=${p.id}">${p.title}</a>
        <span class="post-date">${formatDate(p.date)}</span>
      </li>
    `).join('');
  }

  // Tags Cloud
  const tagsEl = document.getElementById('tagsCloud');
  if (tagsEl) {
    const tags = getAllTags();
    tagsEl.innerHTML = tags.map(t => `
      <span class="tag-cloud-item" onclick="filterByTag('${t}')">${t}</span>
    `).join('');
  }

  // Stats
  const totalPosts = document.getElementById('totalPosts');
  if (totalPosts) totalPosts.textContent = POSTS.length;

  const totalTags = document.getElementById('totalTags');
  if (totalTags) totalTags.textContent = getAllTags().length;
}

function filterByTag(tag) {
  currentTag = tag;
  currentSearch = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.tag-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tag === tag);
  });
  renderPosts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initTagsFilter();
  renderPosts();
  initSidebar();
});
