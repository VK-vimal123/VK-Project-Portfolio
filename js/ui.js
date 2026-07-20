/* =========================================================================
   VK Project Portfolio Manager — ui.js
   Rendering layer: project cards/grid, sidebar counts, modal population.
   Reads data prepared by app.js and writes it into the DOM.
   ========================================================================= */

window.VK = window.VK || {};

VK.ui = (function () {
  const u = VK.utils;

  const STATUS_LABEL = { planning: 'Planning', 'in-progress': 'In Progress', completed: 'Completed' };
  const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

  function statusBadge(status) {
    return `<span class="badge badge-${status}">${STATUS_LABEL[status] || status}</span>`;
  }
  function priorityBadge(priority) {
    return `<span class="badge badge-priority-${priority}">${PRIORITY_LABEL[priority] || priority}</span>`;
  }

  /** Build the HTML for a single project card. */
  function cardTemplate(p) {
    const techChips = (p.technologies || []).slice(0, 4)
      .map(t => `<span class="tech-chip">${u.escapeHtml(t)}</span>`).join('');
    const moreTech = (p.technologies || []).length > 4 ? `<span class="tech-chip">+${p.technologies.length - 4}</span>` : '';

    const thumb = p.thumbnail
      ? `<img src="${u.escapeHtml(p.thumbnail)}" alt="${u.escapeHtml(p.title)} thumbnail" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;card-thumb-fallback&quot;>${u.initials(p.title)}</div>'" />`
      : `<div class="card-thumb-fallback">${u.initials(p.title)}</div>`;

    return `
      <article class="project-card card-enter" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${u.escapeHtml(p.title)} details">
        <div class="card-thumb">
          ${thumb}
          <div class="card-thumb-actions">
            <button class="card-icon-btn js-toggle-fav ${p.favorite ? 'is-favorite' : ''}" data-id="${p.id}" aria-label="Toggle favorite" title="Favorite">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${p.favorite ? 'currentColor' : 'none'}"><path d="M12 21s-7.5-4.6-10-9.1C.5 8.1 2.3 4.8 5.8 4.2c2-.3 3.9.7 6.2 3 2.3-2.3 4.2-3.3 6.2-3 3.5.6 5.3 3.9 3.8 7.7C19.5 16.4 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </button>
            <button class="card-icon-btn js-toggle-pin ${p.pinned ? 'is-pinned' : ''}" data-id="${p.id}" aria-label="Toggle pin" title="Pin">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${p.pinned ? 'currentColor' : 'none'}"><path d="M12 2l1.9 5.8H20l-4.9 3.6 1.9 5.8-4.9-3.6L7.1 17.2l1.9-5.8L4 7.8h6.1L12 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-top">
            <div>
              <h3 class="card-title">${u.escapeHtml(p.title)}</h3>
              <div class="card-category">${u.escapeHtml(p.category || 'Uncategorized')}</div>
            </div>
          </div>
          <div class="card-badges">${statusBadge(p.status)}${priorityBadge(p.priority)}</div>
          <div class="card-progress">
            <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${p.progress || 0}%"></div></div>
            <span class="progress-label">${p.progress || 0}%</span>
          </div>
          <div class="card-chips">${techChips}${moreTech}</div>
          <div class="card-footer">
            <div class="card-links">
              ${p.github ? `<a class="card-link-btn js-stop-prop" href="${u.escapeHtml(p.github)}" target="_blank" rel="noopener" title="GitHub" aria-label="Open GitHub repository"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.8 5.4.8 11.7c0 5 3.2 9.2 7.7 10.7.6.1.8-.2.8-.6v-2.2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.6.1-.6.1-.6 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3 1.1a10 10 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.2 11.2 0 0 0 23.2 11.7C23.2 5.4 18.3.5 12 .5z"/></svg></a>` : ''}
              ${p.demo ? `<a class="card-link-btn js-stop-prop" href="${u.escapeHtml(p.demo)}" target="_blank" rel="noopener" title="Live Demo" aria-label="Open live demo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14 3h7v7M21 3l-9 9M5 5h6v2H7v10h10v-4h2v6H5V5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></a>` : ''}
            </div>
            <div class="card-edit-actions">
              <button class="card-link-btn js-edit-project js-stop-prop" data-id="${p.id}" title="Edit" aria-label="Edit project">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
              </button>
              <button class="card-link-btn js-delete-project js-stop-prop" data-id="${p.id}" title="Delete" aria-label="Delete project">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-7 0v13a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 20V7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  /** Render the full project grid, or the appropriate empty state. */
  function renderGrid(projects, { hasAnyProjects, hasActiveFilters, title }) {
    const grid = document.getElementById('projectGrid');
    const empty = document.getElementById('emptyState');
    const noResults = document.getElementById('noResultsState');
    const gridTitle = document.getElementById('gridTitle');
    const gridCount = document.getElementById('gridCount');

    gridTitle.textContent = title;
    gridCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'}`;

    if (!hasAnyProjects) {
      grid.innerHTML = '';
      grid.hidden = true;
      empty.hidden = false;
      noResults.hidden = true;
      return;
    }

    if (!projects.length) {
      grid.innerHTML = '';
      grid.hidden = true;
      empty.hidden = true;
      noResults.hidden = false;
      return;
    }

    empty.hidden = true;
    noResults.hidden = true;
    grid.hidden = false;
    grid.innerHTML = projects.map(cardTemplate).join('');
  }

  /** Update sidebar nav badge counts. */
  function renderNavCounts(all) {
    document.getElementById('navCountAll').textContent = all.length;
    document.getElementById('navCountPinned').textContent = all.filter(p => p.pinned).length;
    document.getElementById('navCountFav').textContent = all.filter(p => p.favorite).length;
    document.getElementById('navCountDone').textContent = all.filter(p => p.status === 'completed').length;
  }

  /** Populate the <datalist> of categories from existing projects, and the category filter <select>. */
  function renderCategoryOptions(projects) {
    const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean))).sort();

    const datalist = document.getElementById('categoryList');
    datalist.innerHTML = categories.map(c => `<option value="${u.escapeHtml(c)}"></option>`).join('');

    const select = document.getElementById('categoryFilter');
    const currentVal = select.value;
    select.innerHTML = `<option value="all">All Categories</option>` +
      categories.map(c => `<option value="${u.escapeHtml(c)}">${u.escapeHtml(c)}</option>`).join('');
    if (categories.includes(currentVal)) select.value = currentVal;
  }

  /** Fill the project form modal with an existing project's data (or reset it for "New Project"). */
  function fillForm(project) {
    document.getElementById('projectId').value = project ? project.id : '';
    document.getElementById('fTitle').value = project ? project.title : '';
    document.getElementById('fCategory').value = project ? project.category : '';
    document.getElementById('fThumbnail').value = project ? project.thumbnail : '';
    document.getElementById('fDescription').value = project ? project.description : '';
    document.getElementById('fTech').value = project ? (project.technologies || []).join(', ') : '';
    document.getElementById('fGithub').value = project ? project.github : '';
    document.getElementById('fDemo').value = project ? project.demo : '';
    document.getElementById('fStatus').value = project ? project.status : 'planning';
    document.getElementById('fPriority').value = project ? project.priority : 'medium';
    document.getElementById('fProgress').value = project ? project.progress : 0;
    document.getElementById('fProgressVal').textContent = `${project ? project.progress : 0}%`;
    document.getElementById('fStartDate').value = project ? (project.startDate || '') : '';
    document.getElementById('fEndDate').value = project ? (project.endDate || '') : '';
    document.getElementById('fTags').value = project ? (project.tags || []).join(', ') : '';
    document.getElementById('fNotes').value = project ? project.notes : '';
    document.getElementById('fFavorite').checked = project ? !!project.favorite : false;
    document.getElementById('fPinned').checked = project ? !!project.pinned : false;

    document.getElementById('formModalTitle').textContent = project ? 'Edit Project' : 'New Project';
    document.getElementById('formSubmitBtn').textContent = project ? 'Save Changes' : 'Save Project';

    ['errTitle', 'errGithub', 'errDemo', 'errProgress', 'errDates'].forEach(id => {
      document.getElementById(id).textContent = '';
    });
  }

  /** Populate the read-only project details modal. */
  function fillDetails(p) {
    const hero = document.getElementById('detailsHero');
    hero.style.backgroundImage = p.thumbnail ? `url('${p.thumbnail.replace(/'/g, "%27")}')` : '';

    document.getElementById('detailsCategory').textContent = p.category || 'Uncategorized';
    document.getElementById('detailsTitle').textContent = p.title;
    document.getElementById('detailsDescription').textContent = p.description || 'No description provided yet.';

    document.getElementById('detailsBadges').innerHTML = statusBadge(p.status) + priorityBadge(p.priority);

    document.getElementById('detailsProgressFill').style.width = `${p.progress || 0}%`;
    document.getElementById('detailsProgressLabel').textContent = `${p.progress || 0}%`;

    document.getElementById('detailsTech').innerHTML = (p.technologies || [])
      .map(t => `<span class="tech-chip">${u.escapeHtml(t)}</span>`).join('') || '<span style="color:var(--text-faint); font-size:12.5px;">No technologies listed</span>';

    document.getElementById('detailsTags').innerHTML = (p.tags || [])
      .map(t => `<span class="tag-chip">#${u.escapeHtml(t)}</span>`).join('') || '<span style="color:var(--text-faint); font-size:12.5px;">No tags</span>';

    const dateStr = (p.startDate || p.endDate)
      ? `${u.formatDate(p.startDate)} → ${p.endDate ? u.formatDate(p.endDate) : 'Ongoing'}`
      : 'No timeline set';
    document.getElementById('detailsDates').textContent = dateStr;

    const notesWrap = document.getElementById('detailsNotesWrap');
    if (p.notes) {
      notesWrap.dataset.empty = 'false';
      document.getElementById('detailsNotes').textContent = p.notes;
    } else {
      notesWrap.dataset.empty = 'true';
    }

    const githubLink = document.getElementById('detailsGithubLink');
    const demoLink = document.getElementById('detailsDemoLink');
    githubLink.style.display = p.github ? 'inline-flex' : 'none';
    demoLink.style.display = p.demo ? 'inline-flex' : 'none';
    if (p.github) githubLink.href = p.github;
    if (p.demo) demoLink.href = p.demo;

    document.getElementById('detailsCreated').textContent = `Created ${u.formatDate(p.createdAt)}`;
    document.getElementById('detailsUpdated').textContent = `Updated ${u.timeAgo(p.updatedAt)}`;
    document.getElementById('detailsIdLabel').textContent = p.id;

    const favBtn = document.getElementById('detailsFavoriteBtn');
    const pinBtn = document.getElementById('detailsPinBtn');
    favBtn.classList.toggle('is-active-fav', !!p.favorite);
    pinBtn.classList.toggle('is-active-pin', !!p.pinned);
    favBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="${p.favorite ? 'currentColor' : 'none'}"><path d="M12 21s-7.5-4.6-10-9.1C.5 8.1 2.3 4.8 5.8 4.2c2-.3 3.9.7 6.2 3 2.3-2.3 4.2-3.3 6.2-3 3.5.6 5.3 3.9 3.8 7.7C19.5 16.4 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
    pinBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="${p.pinned ? 'currentColor' : 'none'}"><path d="M12 2l1.9 5.8H20l-4.9 3.6 1.9 5.8-4.9-3.6L7.1 17.2l1.9-5.8L4 7.8h6.1L12 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  }

  return {
    cardTemplate, renderGrid, renderNavCounts, renderCategoryOptions,
    fillForm, fillDetails, statusBadge, priorityBadge
  };
})();
