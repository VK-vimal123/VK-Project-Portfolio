/* =========================================================================
   VK Project Portfolio Manager — search.js
   Instant search across title, technologies, category, tags & description.
   ========================================================================= */

window.VK = window.VK || {};

VK.search = (function () {

  /**
   * Return only the projects whose searchable fields include `query`.
   * Case-insensitive, matches partial words. Empty query returns all projects.
   */
  function apply(projects, query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return projects;

    return projects.filter(p => {
      const haystack = [
        p.title,
        p.category,
        p.description,
        ...(p.technologies || []),
        ...(p.tags || [])
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }

  return { apply };
})();
