/* =========================================================================
   VK Project Portfolio Manager — shortcuts.js
   Global keyboard shortcuts.
     Ctrl+N  New Project        Ctrl+F  Search        Ctrl+E  Export
     Ctrl+I  Import             Ctrl+D  Toggle Theme  Esc     Close Modal
     Delete  Delete Selected Project
   ========================================================================= */

window.VK = window.VK || {};

VK.shortcuts = (function () {

  /**
   * @param {Object} handlers - { newProject, focusSearch, exportData, importData, toggleTheme, deleteSelected }
   */
  function init(handlers) {
    document.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey; // support Cmd on Mac
      const tag = (e.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

      if (isCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handlers.newProject && handlers.newProject();
        return;
      }
      if (isCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handlers.focusSearch && handlers.focusSearch();
        return;
      }
      if (isCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handlers.exportData && handlers.exportData();
        return;
      }
      if (isCtrl && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        handlers.importData && handlers.importData();
        return;
      }
      if (isCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handlers.toggleTheme && handlers.toggleTheme();
        return;
      }
      // Delete key only acts when not typing in a field, and something is selected
      if (e.key === 'Delete' && !isTyping) {
        handlers.deleteSelected && handlers.deleteSelected();
        return;
      }
      // Esc is handled globally by modal.js
    });
  }

  return { init };
})();
