/* =========================================================================
   VK Project Portfolio Manager — notifications.js
   Animated toast notification system.
   ========================================================================= */

window.VK = window.VK || {};

VK.notifications = (function () {
  let container = null;

  function init() {
    container = document.getElementById('toastContainer');
  }

  const ICONS = {
    success: '✓',
    error: '!',
    info: 'i'
  };

  /**
   * Show a toast.
   * @param {'success'|'error'|'info'} type
   * @param {string} title
   * @param {string} [message]
   * @param {number} [duration=3200]
   */
  function show(type, title, message, duration = 3200) {
    if (!container) init();
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span class="toast-text">
        <strong>${VK.utils.escapeHtml(title)}</strong>
        ${message ? `<br/><span style="color:var(--text-muted); font-size:12px;">${VK.utils.escapeHtml(message)}</span>` : ''}
      </span>
      <button class="toast-close" aria-label="Dismiss notification">✕</button>
    `;

    const remove = () => {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 220);
    };

    toast.querySelector('.toast-close').addEventListener('click', remove);
    container.appendChild(toast);

    if (duration > 0) setTimeout(remove, duration);
    return toast;
  }

  return {
    init,
    show,
    success: (title, message) => show('success', title, message),
    error: (title, message) => show('error', title, message),
    info: (title, message) => show('info', title, message)
  };
})();
