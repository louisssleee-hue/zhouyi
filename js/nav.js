/**
 * nav.js — 导航和通用交互
 * 包含：导航激活、Tab切换
 * 由 main.js 加载
 */

// 导出函数供外部调用
if (typeof window !== 'undefined') {
  window.openTab = openTab;
  window.initNavHighlight = initNavHighlight;
}
