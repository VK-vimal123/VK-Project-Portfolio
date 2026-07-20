/* =========================================================================
   VK Project Portfolio Manager — storage.js
   Thin, safe wrapper around the LocalStorage API.
   All persistence for the app flows through this module.
   ========================================================================= */

window.VK = window.VK || {};

VK.storage = (function () {

  const KEYS = {
    projects: 'vk_projects',   // array of project objects
    theme: 'vk_theme',         // 'dark' | 'light'
    settings: 'vk_settings',   // { sidebarCollapsed, filters, sort, searchHistory, recentlyOpened }
    order: 'vk_order',         // array of project IDs representing manual drag order
    favorites: 'vk_favorites'  // array of favorited project IDs (mirrors project.favorite, kept for redundancy/spec)
  };

  /** Safely read + JSON-parse a key, returning `fallback` on any failure or absence. */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[VK.storage] Failed to read "${key}", using fallback.`, e);
      return fallback;
    }
  }

  /** Safely JSON-stringify + write a key. Returns true on success. */
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[VK.storage] Failed to write "${key}".`, e);
      if (VK.notifications) {
        VK.notifications.show('error', 'Storage full', 'Could not save — your browser storage may be full.');
      }
      return false;
    }
  }

  // ---------- Projects ----------
  function getProjects() { return read(KEYS.projects, []); }
  function saveProjects(projects) { return write(KEYS.projects, projects); }

  // ---------- Theme ----------
  function getTheme() { return read(KEYS.theme, null); } // null => not set yet, follow system
  function saveTheme(theme) { return write(KEYS.theme, theme); }

  // ---------- Settings (grab-bag of app state) ----------
  const DEFAULT_SETTINGS = {
    sidebarCollapsed: false,
    filters: { status: 'all', priority: 'all', category: 'all', view: 'all' },
    sort: 'newest',
    searchHistory: [],
    recentlyOpened: []
  };
  function getSettings() {
    const s = read(KEYS.settings, DEFAULT_SETTINGS);
    return Object.assign({}, DEFAULT_SETTINGS, s, {
      filters: Object.assign({}, DEFAULT_SETTINGS.filters, s.filters || {})
    });
  }
  function saveSettings(settings) { return write(KEYS.settings, settings); }
  function patchSettings(partial) {
    const current = getSettings();
    const next = Object.assign({}, current, partial);
    return saveSettings(next) && next;
  }

  // ---------- Manual drag order ----------
  function getOrder() { return read(KEYS.order, []); }
  function saveOrder(orderArr) { return write(KEYS.order, orderArr); }

  // ---------- Favorites (redundant index, kept in sync with project.favorite) ----------
  function getFavorites() { return read(KEYS.favorites, []); }
  function saveFavorites(idsArr) { return write(KEYS.favorites, idsArr); }

  /** Wipe every VK key — used only by the explicit "Clear All Projects" action. */
  function clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  return {
    KEYS,
    getProjects, saveProjects,
    getTheme, saveTheme,
    getSettings, saveSettings, patchSettings,
    getOrder, saveOrder,
    getFavorites, saveFavorites,
    clearAll
  };
})();
