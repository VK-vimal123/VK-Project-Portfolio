/* =========================================================================
   VK Project Portfolio Manager — importExport.js
   Export the full portfolio to JSON, and import/validate/merge JSON back in.
   ========================================================================= */

window.VK = window.VK || {};

VK.importExport = (function () {
  const u = VK.utils;

  const EXPORT_FILENAME = 'VK_Project_Portfolio.json';

  /** Export all projects (plus a little metadata) as a downloadable JSON file. */
  function exportProjects(projects) {
    const payload = {
      app: 'VK Project Portfolio Manager',
      author: 'Vimal Kumar',
      exportedAt: new Date().toISOString(),
      version: 1,
      projects
    };
    u.downloadFile(EXPORT_FILENAME, JSON.stringify(payload, null, 2));
    return true;
  }

  /**
   * Validate a parsed import payload.
   * Accepts either { projects: [...] } (our own export format) or a raw array.
   * @returns {{ valid:boolean, projects:Array, error?:string }}
   */
  function validateImportPayload(parsed) {
    let list = null;
    if (Array.isArray(parsed)) list = parsed;
    else if (parsed && Array.isArray(parsed.projects)) list = parsed.projects;

    if (!list) {
      return { valid: false, projects: [], error: 'This file does not look like a VK Portfolio export.' };
    }

    const cleaned = [];
    for (const raw of list) {
      if (!raw || typeof raw !== 'object' || !raw.title) continue; // skip malformed entries
      cleaned.push(normalizeProject(raw));
    }

    if (!cleaned.length) {
      return { valid: false, projects: [], error: 'No valid projects were found in this file.' };
    }
    return { valid: true, projects: cleaned };
  }

  /** Ensure an imported project has every field our app expects, filling in safe defaults. */
  function normalizeProject(raw) {
    const now = new Date().toISOString();
    return {
      id: raw.id && typeof raw.id === 'string' ? raw.id : u.uid(),
      title: String(raw.title).slice(0, 80),
      category: raw.category || '',
      description: raw.description || '',
      technologies: Array.isArray(raw.technologies) ? raw.technologies : u.splitList(raw.technologies),
      github: raw.github || '',
      demo: raw.demo || '',
      status: ['planning', 'in-progress', 'completed'].includes(raw.status) ? raw.status : 'planning',
      priority: ['low', 'medium', 'high'].includes(raw.priority) ? raw.priority : 'medium',
      progress: u.clamp(raw.progress || 0, 0, 100),
      startDate: raw.startDate || '',
      endDate: raw.endDate || '',
      thumbnail: raw.thumbnail || '',
      tags: Array.isArray(raw.tags) ? raw.tags : u.splitList(raw.tags),
      notes: raw.notes || '',
      favorite: !!raw.favorite,
      pinned: !!raw.pinned,
      createdAt: raw.createdAt || now,
      updatedAt: raw.updatedAt || now
    };
  }

  /**
   * Merge imported projects into the existing list.
   * Projects with a matching ID overwrite the existing entry; others are appended.
   */
  function mergeProjects(existing, incoming) {
    const map = new Map(existing.map(p => [p.id, p]));
    incoming.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }

  /** Read a File object and resolve with its parsed JSON contents. */
  function readFileAsJson(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file selected.'));
      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(JSON.parse(reader.result));
        } catch (e) {
          reject(new Error('This file is not valid JSON.'));
        }
      };
      reader.onerror = () => reject(new Error('Could not read the file.'));
      reader.readAsText(file);
    });
  }

  return { exportProjects, validateImportPayload, mergeProjects, readFileAsJson, EXPORT_FILENAME };
})();
