/* =========================================================================
   VK Project Portfolio Manager — statistics.js
   Computes live portfolio statistics and renders the stat cards.
   ========================================================================= */

window.VK = window.VK || {};

VK.statistics = (function () {
  const u = VK.utils;

  /** Compute the full statistics object from the current project list. */
  function compute(projects) {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const planning = projects.filter(p => p.status === 'planning').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const high = projects.filter(p => p.priority === 'high').length;
    const medium = projects.filter(p => p.priority === 'medium').length;
    const low = projects.filter(p => p.priority === 'low').length;
    const favorites = projects.filter(p => p.favorite).length;
    const pinned = projects.filter(p => p.pinned).length;
    const avgProgress = total ? Math.round(projects.reduce((sum, p) => sum + (Number(p.progress) || 0), 0) / total) : 0;

    const now = new Date();
    const thisMonth = projects.filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const recentlyUpdated = projects.filter(p => {
      const d = new Date(p.updatedAt);
      const diffDays = (now - d) / 86400000;
      return diffDays <= 7;
    }).length;

    return {
      total, completed, planning, inProgress,
      high, medium, low,
      favorites, pinned, avgProgress,
      thisMonth, recentlyUpdated
    };
  }

  const CARD_DEFS = [
    { key: 'total', label: 'Total Projects', color: '#7C6CFF', bg: 'rgba(124,108,255,0.14)', icon: iconGrid },
    { key: 'inProgress', label: 'In Progress', color: '#FFB84D', bg: 'rgba(255,184,77,0.14)', icon: iconClock },
    { key: 'completed', label: 'Completed', color: '#4ADE80', bg: 'rgba(74,222,128,0.14)', icon: iconCheck },
    { key: 'planning', label: 'Planning', color: '#5CB8FF', bg: 'rgba(92,184,255,0.14)', icon: iconCompass },
    { key: 'avgProgress', label: 'Average Progress', color: '#45E8D6', bg: 'rgba(69,232,214,0.14)', icon: iconTrend, suffix: '%' },
    { key: 'high', label: 'High Priority', color: '#FF5C7C', bg: 'rgba(255,92,124,0.14)', icon: iconFlag },
    { key: 'favorites', label: 'Favorites', color: '#FFC15C', bg: 'rgba(255,193,92,0.14)', icon: iconStar },
    { key: 'pinned', label: 'Pinned', color: '#45E8D6', bg: 'rgba(69,232,214,0.14)', icon: iconPin },
    { key: 'thisMonth', label: 'Added This Month', color: '#7C6CFF', bg: 'rgba(124,108,255,0.14)', icon: iconCalendar },
    { key: 'recentlyUpdated', label: 'Recently Updated', color: '#5CB8FF', bg: 'rgba(92,184,255,0.14)', icon: iconRefresh }
  ];

  function iconGrid(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="${c}" stroke-width="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="${c}" stroke-width="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="${c}" stroke-width="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="${c}" stroke-width="1.8"/></svg>`; }
  function iconClock(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="${c}" stroke-width="1.8"/><path d="M12 7v5l3.5 2" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></svg>`; }
  function iconCheck(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="${c}" stroke-width="1.8"/><path d="M8.5 12.5l2.3 2.3L16 9.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function iconCompass(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="${c}" stroke-width="1.8"/><path d="M15 9l-2 5-4 1 2-5z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`; }
  function iconTrend(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 17l5-6 4 3 6-8" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 6h5v5" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  function iconFlag(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 3v18" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4h12l-3 4 3 4H5" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/></svg>`; }
  function iconStar(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.7 5.9 6.3.7-4.7 4.4 1.3 6.3L12 17.4 6.4 20.3l1.3-6.3L3 9.6l6.3-.7z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`; }
  function iconPin(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.9 5.8H20l-4.9 3.6 1.9 5.8-4.9-3.6L7.1 17.2l1.9-5.8L4 7.8h6.1L12 2z" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`; }
  function iconCalendar(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="${c}" stroke-width="1.8"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/></svg>`; }
  function iconRefresh(c){ return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M4 12a8 8 0 0 0 13.7 5.7L20 16" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><path d="M20 4v4h-4M4 20v-4h4" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }

  /** Render stat cards into #statsGrid, animating each value on first paint. */
  function render(projects) {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    const stats = compute(projects);

    grid.innerHTML = CARD_DEFS.map(def => `
      <div class="stat-card" style="--stat-color:${def.color}; --stat-bg:${def.bg}; --stat-glow:${def.bg}">
        <div class="stat-icon">${def.icon(def.color)}</div>
        <div class="stat-value" data-stat="${def.key}">0${def.suffix || ''}</div>
        <div class="stat-label">${def.label}</div>
      </div>
    `).join('');

    // Animate each counter up to its real value
    CARD_DEFS.forEach(def => {
      const el = grid.querySelector(`[data-stat="${def.key}"]`);
      if (el) u.animateCounter(el, stats[def.key], 750, def.suffix || '');
    });

    return stats;
  }

  return { compute, render };
})();
