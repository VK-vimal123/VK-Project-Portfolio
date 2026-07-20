/* =========================================================================
   VK Project Portfolio Manager — theme.js
   Light / Dark theme handling, restored from vk_theme on startup.
   ========================================================================= */

window.VK = window.VK || {};

VK.theme = (function () {
  const s = VK.storage;

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const sun = document.getElementById('themeIconSun');
    const moon = document.getElementById('themeIconMoon');
    if (sun && moon) {
      sun.hidden = theme === 'dark';
      moon.hidden = theme !== 'dark';
    }
  }

  function current() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  /** Restore saved theme, or fall back to the OS preference. */
  function init() {
    let theme = s.getTheme();
    if (!theme) {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    apply(theme);
  }

  function toggle() {
    const next = current() === 'dark' ? 'light' : 'dark';
    apply(next);
    s.saveTheme(next);
    if (VK.notifications) VK.notifications.info('Theme changed', next === 'dark' ? 'Dark mode enabled' : 'Light mode enabled');
    return next;
  }

  return { init, toggle, current, apply };
})();
