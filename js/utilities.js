/* =========================================================================
   VK Project Portfolio Manager — utilities.js
   Small, reusable, dependency-free helper functions.
   Exposed on the global `VK.utils` namespace.
   ========================================================================= */

window.VK = window.VK || {};

VK.utils = (function () {

  /** Generate a reasonably unique ID (timestamp + random base36). */
  function uid() {
    return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  /** Escape a string for safe HTML insertion (prevents injected markup/XSS from user data). */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /** Debounce a function call by `wait` milliseconds. */
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /** Format an ISO date string into a short human readable label, e.g. "Jul 20, 2026". */
  function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /** Format a full datetime, e.g. "Jul 20, 2026, 3:45 PM". */
  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  /** Relative time label, e.g. "3 days ago". Falls back to formatDate for old items. */
  function timeAgo(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(isoStr);
  }

  /** Basic, permissive URL validator — requires http(s) scheme. */
  function isValidUrl(str) {
    if (!str) return true; // empty is allowed (optional field)
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /** Split a comma-separated string into a clean array of trimmed, non-empty, deduped values. */
  function splitList(str) {
    if (!str) return [];
    const seen = new Set();
    return String(str)
      .split(',')
      .map(s => s.trim())
      .filter(s => {
        if (!s || seen.has(s.toLowerCase())) return false;
        seen.add(s.toLowerCase());
        return true;
      });
  }

  /** Clamp a number between min and max. */
  function clamp(n, min, max) {
    n = Number(n);
    if (isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  /** Simple deep clone via JSON (sufficient for our plain-data project objects). */
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /** Generate a two-letter (or fewer) initials string from a title, for thumbnail fallbacks. */
  function initials(title) {
    if (!title) return 'VK';
    const words = title.trim().split(/\s+/).slice(0, 2);
    return words.map(w => w[0].toUpperCase()).join('');
  }

  /** Animate a number counting up inside an element over `duration` ms. */
  function animateCounter(el, endValue, duration = 700, suffix = '') {
    const startValue = 0;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(startValue + (endValue - startValue) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = endValue + suffix;
    }
    requestAnimationFrame(tick);
  }

  /** Copy text to the clipboard, returns a Promise<boolean>. */
  async function copyToClipboard(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback for older browsers / insecure contexts
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  /** Trigger a browser download of a text blob. */
  function downloadFile(filename, content, mime = 'application/json') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    uid, escapeHtml, debounce, formatDate, formatDateTime, timeAgo,
    isValidUrl, splitList, clamp, clone, initials, animateCounter,
    copyToClipboard, downloadFile
  };
})();
