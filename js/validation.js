/* =========================================================================
   VK Project Portfolio Manager — validation.js
   Validates project payloads before create/update.
   ========================================================================= */

window.VK = window.VK || {};

VK.validation = (function () {
  const u = VK.utils;

  /**
   * Validate a draft project object.
   * @param {Object} draft - fields pulled straight from the form
   * @param {Array}  existingProjects - all current projects (for duplicate-title check)
   * @param {String} [editingId] - id of the project being edited (excluded from duplicate check)
   * @returns {Object} { valid: boolean, errors: { field: message } }
   */
  function validateProject(draft, existingProjects, editingId) {
    const errors = {};

    // Title: required, non-empty
    const title = (draft.title || '').trim();
    if (!title) {
      errors.title = 'Project title is required.';
    } else {
      // Duplicate title check (case-insensitive, ignores self when editing)
      const dupe = existingProjects.some(p =>
        p.id !== editingId && p.title.trim().toLowerCase() === title.toLowerCase()
      );
      if (dupe) errors.title = 'A project with this title already exists.';
    }

    // GitHub URL
    if (draft.github && !u.isValidUrl(draft.github)) {
      errors.github = 'Enter a valid GitHub URL (must start with http:// or https://).';
    }

    // Live demo URL
    if (draft.demo && !u.isValidUrl(draft.demo)) {
      errors.demo = 'Enter a valid demo URL (must start with http:// or https://).';
    }

    // Thumbnail URL (optional but must be valid if provided)
    if (draft.thumbnail && !u.isValidUrl(draft.thumbnail)) {
      errors.thumbnail = 'Enter a valid image URL.';
    }

    // Progress
    const progress = Number(draft.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      errors.progress = 'Progress must be a number between 0 and 100.';
    }

    // Dates
    if (draft.startDate && draft.endDate) {
      const start = new Date(draft.startDate);
      const end = new Date(draft.endDate);
      if (!isNaN(start) && !isNaN(end) && end < start) {
        errors.dates = 'End date cannot be before the start date.';
      }
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }

  return { validateProject };
})();
