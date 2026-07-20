/* =========================================================================
   VK Project Portfolio Manager — filter.js
   Applies status / priority / category / view filters, and sorting.
   ========================================================================= */

window.VK = window.VK || {};

VK.filter = (function () {

  /**
   * Apply the active filter set to a project list.
   * @param {Array} projects
   * @param {Object} filters - { status, priority, category, view }
   */
  function apply(projects, filters) {
    let result = projects.slice();

    if (filters.status && filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(p => p.priority === filters.priority);
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => (p.category || '').toLowerCase() === filters.category.toLowerCase());
    }
    switch (filters.view) {
      case 'pinned': result = result.filter(p => p.pinned); break;
      case 'favorites': result = result.filter(p => p.favorite); break;
      case 'completed': result = result.filter(p => p.status === 'completed'); break;
      default: break; // 'all' / 'dashboard' — no extra filtering
    }
    return result;
  }

  /** Sort a project list in-place-safe (returns a new array) by the given sort key. */
  function sort(projects, sortKey) {
    const arr = projects.slice();
    switch (sortKey) {
      case 'oldest':
        return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'az':
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case 'za':
        return arr.sort((a, b) => b.title.localeCompare(a.title));
      case 'progress':
        return arr.sort((a, b) => (b.progress || 0) - (a.progress || 0));
      case 'priority': {
        const rank = { high: 0, medium: 1, low: 2 };
        return arr.sort((a, b) => rank[a.priority] - rank[b.priority]);
      }
      case 'updated':
        return arr.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'newest':
      default:
        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  /** Pull pinned projects to the front, preserving relative order otherwise. */
  function pinnedFirst(projects) {
    const pinned = projects.filter(p => p.pinned);
    const rest = projects.filter(p => !p.pinned);
    return [...pinned, ...rest];
  }

  /** Reorder a project list to match a saved manual order (array of IDs); unknown items keep relative order at the end. */
  function applyManualOrder(projects, orderIds) {
    if (!orderIds || !orderIds.length) return projects;
    const byId = new Map(projects.map(p => [p.id, p]));
    const ordered = [];
    orderIds.forEach(id => {
      if (byId.has(id)) { ordered.push(byId.get(id)); byId.delete(id); }
    });
    // Append any projects not present in the saved order (e.g. newly created)
    byId.forEach(p => ordered.push(p));
    return ordered;
  }

  return { apply, sort, pinnedFirst, applyManualOrder };
})();
