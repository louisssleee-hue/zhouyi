/**
 * main.js — 通用交互逻辑
 * 包含：导航激活、Tab切换、滚动行为
 */

// ── Tab 切换 ──
function openTab(btn, tabId) {
  const tabButtons = btn.closest('.tab-buttons');
  const tabContents = tabButtons.parentElement.querySelectorAll('.tab-content');

  tabContents.forEach(t => t.classList.remove('active'));
  tabButtons.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  btn.classList.add('active');
}

// ── 导航高亮 ──
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });
}

// ── 卡片动画（Intersection Observer）──
function initCardAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // 交错延迟
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        // 只触发一次
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // 观察卡片
  document.querySelectorAll('.card-grid .card').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.1) + 's';
    observer.observe(el);
  });

  // 观察 section 内容
  document.querySelectorAll('section > *:not(.page-hero):not(.hero):not(.section-header)').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.1) + 's';
    el.classList.add('fade-in-up');
    observer.observe(el);
  });
}

// ── 工具提示 ──
function initTooltips() {
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const tip = document.createElement('div');
      tip.className = 'tooltip-popup';
      tip.textContent = el.dataset.tooltip;
      tip.style.cssText = `
        position:fixed;z-index:1000;
        background:rgba(10,10,15,0.95);
        border:1px solid rgba(201,168,76,0.4);
        color:#f0e6cc;font-size:0.8rem;
        padding:0.5rem 0.8rem;border-radius:4px;
        pointer-events:none;max-width:200px;
        font-family:'Noto Serif SC',serif;
      `;
      document.body.appendChild(tip);
      const rect = el.getBoundingClientRect();
      tip.style.left = rect.left + 'px';
      tip.style.top = (rect.top - tip.offsetHeight - 8) + 'px';
      el._tooltip = tip;
    });
    el.addEventListener('mouseleave', () => {
      if (el._tooltip) { el._tooltip.remove(); el._tooltip = null; }
    });
  });
}

// ── 初始化 ──
document.addEventListener('DOMContentLoaded', () => {
  initNavHighlight();
  initTooltips();
  initCardAnimations();
});
