/* =========================================================================
   VK Project Portfolio Manager — dragdrop.js
   Native HTML5 drag-and-drop reordering for project cards.
   Order is persisted to vk_order and restored after refresh.
   ========================================================================= */

window.VK = window.VK || {};

VK.dragdrop = (function () {
  let draggedId = null;

  /**
   * Wire up drag events on all `.project-card` elements inside `gridEl`.
   * @param {HTMLElement} gridEl
   * @param {(newOrderIds: string[]) => void} onReorder - called with the full new ID order
   */
  function enable(gridEl, onReorder) {
    if (!gridEl) return;

    gridEl.querySelectorAll('.project-card').forEach(card => {
      card.setAttribute('draggable', 'true');

      card.addEventListener('dragstart', (e) => {
        draggedId = card.dataset.id;
        card.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        // Some browsers require data to be set for drag to initiate
        e.dataTransfer.setData('text/plain', draggedId);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        gridEl.querySelectorAll('.project-card').forEach(c => c.classList.remove('drag-over'));
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (card.dataset.id !== draggedId) card.classList.add('drag-over');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const targetId = card.dataset.id;
        if (!draggedId || draggedId === targetId) return;

        const cards = Array.from(gridEl.querySelectorAll('.project-card'));
        const ids = cards.map(c => c.dataset.id);
        const fromIndex = ids.indexOf(draggedId);
        const toIndex = ids.indexOf(targetId);
        if (fromIndex === -1 || toIndex === -1) return;

        ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, draggedId);

        onReorder(ids);
      });
    });
  }

  return { enable };
})();
