/* =========================================================================
   VK Project Portfolio Manager — modal.js
   Generic modal open/close plumbing + promise-based confirm dialog.
   Field population for the form/details modals lives in ui.js / app.js,
   which is where the project data is available.
   ========================================================================= */

window.VK = window.VK || {};

VK.modal = (function () {
  let lastFocused = null;

  function open(overlayEl) {
    if (!overlayEl) return;
    lastFocused = document.activeElement;
    overlayEl.hidden = false;
    const focusable = overlayEl.querySelector('input, textarea, select, button');
    if (focusable) setTimeout(() => focusable.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function close(overlayEl) {
    if (!overlayEl) return;
    overlayEl.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(el => { el.hidden = true; });
    document.body.style.overflow = '';
  }

  function isAnyOpen() {
    return !!document.querySelector('.modal-overlay:not([hidden])');
  }

  /** Wire "click outside to close" + Escape key for a given overlay. */
  function bindDismiss(overlayEl, onClose) {
    if (!overlayEl) return;
    overlayEl.addEventListener('mousedown', (e) => {
      if (e.target === overlayEl) onClose ? onClose() : close(overlayEl);
    });
  }

  /**
   * Promise-based confirm dialog using the shared #confirmOverlay markup.
   * @returns {Promise<boolean>} resolves true if confirmed, false if cancelled
   */
  function confirmDialog(title, message, confirmLabel = 'Confirm') {
    const overlay = document.getElementById('confirmOverlay');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    titleEl.textContent = title;
    msgEl.textContent = message;
    okBtn.textContent = confirmLabel;

    open(overlay);

    return new Promise((resolve) => {
      function cleanup(result) {
        close(overlay);
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        resolve(result);
      }
      function onOk() { cleanup(true); }
      function onCancel() { cleanup(false); }
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
    });
  }

  // Global Escape key closes the topmost open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isAnyOpen()) {
      closeAll();
    }
  });

  return { open, close, closeAll, isAnyOpen, bindDismiss, confirmDialog };
})();
