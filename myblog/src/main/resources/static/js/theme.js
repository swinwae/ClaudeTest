// ===========================
// 主题切换（深色 / 浅色）
// 从原 js/main.js 提取，供所有页面复用
// ===========================
(function () {
  // 从 localStorage 读取已保存的主题，默认浅色
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });

    // 移动端菜单切换
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', function () {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.toggle('open');
      });
    }
  });
})();
