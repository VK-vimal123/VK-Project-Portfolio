/* =========================================================================
   VK Project Portfolio Manager — app.js
   Application state, initialization, and event wiring. This is the file
   that ties every other module together.
   Author: Vimal Kumar
   ========================================================================= */

(function () {
  const u = VK.utils;
  const storage = VK.storage;
  const notify = VK.notifications;

  /** ---------------------------- Application State ---------------------------- */
  const state = {
    projects: [],
    currentView: 'dashboard',       // dashboard | all | pinned | favorites | completed
    filters: { status: 'all', priority: 'all', category: 'all' },
    sort: 'newest',
    search: '',
    selectedId: null
  };

  const VIEW_TITLES = {
    dashboard: 'All Projects',
    all: 'All Projects',
    pinned: 'Pinned Projects',
    favorites: 'Favorite Projects',
    completed: 'Completed Projects'
  };

  /** ------------------------------- Seed Data ------------------------------- */
  function seedIfFirstRun() {
    const raw = localStorage.getItem(storage.KEYS.projects);
    if (raw !== null) return; // user has already interacted with storage — never overwrite

    const now = Date.now();
    const iso = (daysAgo) => new Date(now - daysAgo * 86400000).toISOString();

    const seed = [
      {
        id: u.uid(), title: 'VK Task Tracker', category: 'Web App',
        description: 'A minimalist task and habit tracker with drag-and-drop boards, local-first storage, and a focus-mode timer.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'LocalStorage'],
        github: 'https://github.com/VK-vimal123/vk-task-tracker', demo: 'https://vk-task-tracker.vercel.app',
        status: 'in-progress', priority: 'high', progress: 68,
        startDate: '2026-04-01', endDate: '', thumbnail: '',
        tags: ['productivity', 'personal'], notes: 'Add recurring tasks next.',
        favorite: true, pinned: true, createdAt: iso(40), updatedAt: iso(2)
      },
      {
        id: u.uid(), title: 'VK Weather Now', category: 'Utility',
        description: 'A clean weather dashboard with animated conditions and a 5-day forecast, built on a public weather API.',
        technologies: ['JavaScript', 'CSS Grid', 'REST API'],
        github: 'https://github.com/VK-vimal123/vk-weather-now', demo: 'https://vk-weather-now.vercel.app',
        status: 'completed', priority: 'medium', progress: 100,
        startDate: '2026-01-10', endDate: '2026-02-02', thumbnail: '',
        tags: ['api', 'weather'], notes: '',
        favorite: false, pinned: false, createdAt: iso(160), updatedAt: iso(150)
      },
      {
        id: u.uid(), title: 'VK Portfolio Manager', category: 'Dashboard',
        description: 'This very app — a premium personal project portfolio dashboard with full CRUD, search, filters and themes.',
        technologies: ['HTML', 'CSS3', 'Vanilla JS'],
        github: 'https://github.com/VK-vimal123/vk-project-portfolio-manager', demo: '',
        status: 'planning', priority: 'high', progress: 20,
        startDate: '2026-07-15', endDate: '', thumbnail: '',
        tags: ['meta', 'showcase'], notes: 'Keep iterating on animations.',
        favorite: true, pinned: false, createdAt: iso(5), updatedAt: iso(1)
      }
    ];
    storage.saveProjects(seed);
  }

  /** ------------------------------- Data Helpers ------------------------------- */
  function loadProjects() { state.projects = storage.getProjects(); }
  function persistProjects() { storage.saveProjects(state.projects); }

  function findProject(id) { return state.projects.find(p => p.id === id); }

  function computeVisibleProjects() {
    let list = state.projects.slice();
    list = VK.search.apply(list, state.search);
    list = VK.filter.apply(list, {
      status: state.filters.status,
      priority: state.filters.priority,
      category: state.filters.category,
      view: state.currentView
    });
    if (state.sort === 'newest') {
      const order = storage.getOrder();
      list = VK.filter.applyManualOrder(list, order);
    } else {
      list = VK.filter.sort(list, state.sort);
    }
    list = VK.filter.pinnedFirst(list);
    return list;
  }

  function gridTitle() {
    if (state.search.trim()) return `Search Results for "${state.search.trim()}"`;
    return VIEW_TITLES[state.currentView] || 'All Projects';
  }

  /** ------------------------------- Core Render ------------------------------- */
  function render() {
    VK.ui.renderNavCounts(state.projects);
    VK.ui.renderCategoryOptions(state.projects);

    const visible = computeVisibleProjects();
    VK.ui.renderGrid(visible, { hasAnyProjects: state.projects.length > 0, title: gridTitle() });
    VK.statistics.render(state.projects);

    const grid = document.getElementById('projectGrid');
    VK.dragdrop.enable(grid, handleReorder);
  }

  function handleReorder(newOrderIds) {
    storage.saveOrder(newOrderIds);
    // Re-render so pinned-first + persisted order both apply consistently
    render();
  }

  /** ------------------------------- CRUD Actions ------------------------------- */
  function openNewProjectModal() {
    VK.ui.fillForm(null);
    VK.modal.open(document.getElementById('formModalOverlay'));
  }

  function openEditProjectModal(id) {
    const project = findProject(id);
    if (!project) return;
    VK.ui.fillForm(project);
    VK.modal.open(document.getElementById('formModalOverlay'));
  }

  function readFormDraft() {
    return {
      id: document.getElementById('projectId').value || null,
      title: document.getElementById('fTitle').value.trim(),
      category: document.getElementById('fCategory').value.trim(),
      thumbnail: document.getElementById('fThumbnail').value.trim(),
      description: document.getElementById('fDescription').value.trim(),
      technologies: u.splitList(document.getElementById('fTech').value),
      github: document.getElementById('fGithub').value.trim(),
      demo: document.getElementById('fDemo').value.trim(),
      status: document.getElementById('fStatus').value,
      priority: document.getElementById('fPriority').value,
      progress: u.clamp(document.getElementById('fProgress').value, 0, 100),
      startDate: document.getElementById('fStartDate').value,
      endDate: document.getElementById('fEndDate').value,
      tags: u.splitList(document.getElementById('fTags').value),
      notes: document.getElementById('fNotes').value.trim(),
      favorite: document.getElementById('fFavorite').checked,
      pinned: document.getElementById('fPinned').checked
    };
  }

  function showFieldErrors(errors) {
    const map = { title: 'errTitle', github: 'errGithub', demo: 'errDemo', progress: 'errProgress', dates: 'errDates' };
    Object.entries(map).forEach(([field, elId]) => {
      document.getElementById(elId).textContent = errors[field] || '';
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const draft = readFormDraft();
    const { valid, errors } = VK.validation.validateProject(draft, state.projects, draft.id);
    showFieldErrors(errors);
    if (!valid) {
      notify.error('Please fix the highlighted fields', Object.values(errors)[0]);
      return;
    }

    const now = new Date().toISOString();
    if (draft.id) {
      // Update existing
      const idx = state.projects.findIndex(p => p.id === draft.id);
      if (idx !== -1) {
        const existing = state.projects[idx];
        state.projects[idx] = Object.assign({}, existing, draft, { updatedAt: now });
        persistProjects();
        notify.success('Project updated', `"${draft.title}" was saved.`);
      }
    } else {
      // Create new
      const project = Object.assign({}, draft, {
        id: u.uid(), createdAt: now, updatedAt: now
      });
      delete project.id; // remove null placeholder then set fresh uid cleanly
      project.id = u.uid();
      state.projects.unshift(project);
      persistProjects();
      notify.success('Project created', `"${draft.title}" was added to your portfolio.`);
    }

    VK.modal.close(document.getElementById('formModalOverlay'));
    render();
  }

  async function deleteProject(id) {
    const project = findProject(id);
    if (!project) return;
    const confirmed = await VK.modal.confirmDialog(
      'Delete this project?',
      `"${project.title}" will be permanently removed. This cannot be undone.`,
      'Delete'
    );
    if (!confirmed) return;

    state.projects = state.projects.filter(p => p.id !== id);
    persistProjects();
    // Keep manual order list tidy
    storage.saveOrder(storage.getOrder().filter(oid => oid !== id));
    notify.success('Project deleted', `"${project.title}" was removed.`);
    VK.modal.closeAll();
    render();
  }

  function toggleFavorite(id) {
    const project = findProject(id);
    if (!project) return;
    project.favorite = !project.favorite;
    project.updatedAt = new Date().toISOString();
    persistProjects();
    render();
  }

  function togglePinned(id) {
    const project = findProject(id);
    if (!project) return;
    project.pinned = !project.pinned;
    project.updatedAt = new Date().toISOString();
    persistProjects();
    render();
  }

  function openDetails(id) {
    const project = findProject(id);
    if (!project) return;
    state.selectedId = id;
    VK.ui.fillDetails(project);
    VK.modal.open(document.getElementById('detailsModalOverlay'));

    // Track "recently opened" in settings (kept for completeness of app state persistence)
    const settings = storage.getSettings();
    const recents = [id, ...settings.recentlyOpened.filter(x => x !== id)].slice(0, 10);
    storage.patchSettings({ recentlyOpened: recents });
  }

  /** ------------------------------- Import / Export ------------------------------- */
  function doExport() {
    VK.importExport.exportProjects(state.projects);
    notify.success('Exported', `Saved as ${VK.importExport.EXPORT_FILENAME}`);
  }

  function openImportModal() {
    VK.modal.open(document.getElementById('importOverlay'));
  }

  async function doImport() {
    const fileInput = document.getElementById('importFileInput');
    const file = fileInput.files[0];
    const mode = document.querySelector('input[name="importMode"]:checked').value;

    if (!file) { notify.error('No file selected', 'Choose a JSON file to import.'); return; }

    try {
      const parsed = await VK.importExport.readFileAsJson(file);
      const { valid, projects, error } = VK.importExport.validateImportPayload(parsed);
      if (!valid) { notify.error('Import failed', error); return; }

      if (mode === 'replace') {
        state.projects = projects;
      } else {
        state.projects = VK.importExport.mergeProjects(state.projects, projects);
      }
      persistProjects();
      notify.success('Imported', `${projects.length} project(s) imported (${mode}).`);
      VK.modal.close(document.getElementById('importOverlay'));
      fileInput.value = '';
      render();
    } catch (err) {
      notify.error('Import failed', err.message);
    }
  }

  async function clearAllProjects() {
    const confirmed = await VK.modal.confirmDialog(
      'Clear all projects?',
      'This permanently deletes every project in your portfolio. This cannot be undone.',
      'Clear All'
    );
    if (!confirmed) return;
    state.projects = [];
    persistProjects();
    storage.saveOrder([]);
    notify.success('Cleared', 'All projects were removed.');
    render();
  }

  /** ------------------------------- Event Wiring ------------------------------- */
  function wireSidebar() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        state.currentView = btn.dataset.view;
        document.getElementById('app').classList.remove('mobile-nav-open');
        render();
      });
    });

    document.getElementById('sidebarCollapseBtn').addEventListener('click', () => {
      const app = document.getElementById('app');
      app.classList.toggle('sidebar-collapsed');
      storage.patchSettings({ sidebarCollapsed: app.classList.contains('sidebar-collapsed') });
    });

    document.getElementById('sidebarToggleMobile').addEventListener('click', () => {
      document.getElementById('app').classList.add('mobile-nav-open');
    });
  }

  function wireMobileBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-nav-backdrop';
    document.getElementById('app').prepend(backdrop);
    backdrop.addEventListener('click', () => document.getElementById('app').classList.remove('mobile-nav-open'));
  }

  function wireSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', u.debounce(() => {
      state.search = input.value;
      render();
    }, 180));
  }

  function wireFilters() {
    document.getElementById('filterChips').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      state.filters.status = chip.dataset.filterStatus;
      render();
    });

    document.getElementById('priorityFilter').addEventListener('change', (e) => {
      state.filters.priority = e.target.value;
      render();
    });
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      render();
    });
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      state.sort = e.target.value;
      render();
    });
    document.getElementById('clearFiltersBtn').addEventListener('click', resetFilters);
    document.getElementById('noResultsResetBtn').addEventListener('click', resetFilters);
  }

  function resetFilters() {
    state.filters = { status: 'all', priority: 'all', category: 'all' };
    state.search = '';
    state.sort = 'newest';
    document.getElementById('searchInput').value = '';
    document.getElementById('priorityFilter').value = 'all';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('sortSelect').value = 'newest';
    document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.remove('is-active'));
    document.querySelector('#filterChips .chip[data-filter-status="all"]').classList.add('is-active');
    render();
  }

  function wireGridDelegation() {
    const grid = document.getElementById('projectGrid');
    grid.addEventListener('click', (e) => {
      const favBtn = e.target.closest('.js-toggle-fav');
      const pinBtn = e.target.closest('.js-toggle-pin');
      const editBtn = e.target.closest('.js-edit-project');
      const delBtn = e.target.closest('.js-delete-project');
      const stopProp = e.target.closest('.js-stop-prop');

      if (favBtn) { e.stopPropagation(); toggleFavorite(favBtn.dataset.id); return; }
      if (pinBtn) { e.stopPropagation(); togglePinned(pinBtn.dataset.id); return; }
      if (editBtn) { e.stopPropagation(); openEditProjectModal(editBtn.dataset.id); return; }
      if (delBtn) { e.stopPropagation(); deleteProject(delBtn.dataset.id); return; }
      if (stopProp) { e.stopPropagation(); return; } // links (github/demo) open natively

      const card = e.target.closest('.project-card');
      if (card) {
        state.selectedId = card.dataset.id;
        openDetails(card.dataset.id);
      }
    });

    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.project-card');
      if (card) { e.preventDefault(); openDetails(card.dataset.id); }
    });
  }

  function wireFormModal() {
    document.getElementById('newProjectBtn').addEventListener('click', openNewProjectModal);
    document.getElementById('quickNew').addEventListener('click', openNewProjectModal);
    document.getElementById('emptyStateNewBtn').addEventListener('click', openNewProjectModal);
    document.getElementById('fabBtn').addEventListener('click', openNewProjectModal);

    document.getElementById('formModalClose').addEventListener('click', () => VK.modal.close(document.getElementById('formModalOverlay')));
    document.getElementById('formCancelBtn').addEventListener('click', () => VK.modal.close(document.getElementById('formModalOverlay')));
    VK.modal.bindDismiss(document.getElementById('formModalOverlay'));

    document.getElementById('projectForm').addEventListener('submit', handleFormSubmit);

    const progressInput = document.getElementById('fProgress');
    progressInput.addEventListener('input', () => {
      document.getElementById('fProgressVal').textContent = `${progressInput.value}%`;
    });
  }

  function wireDetailsModal() {
    document.getElementById('detailsModalClose').addEventListener('click', () => VK.modal.close(document.getElementById('detailsModalOverlay')));
    VK.modal.bindDismiss(document.getElementById('detailsModalOverlay'));

    document.getElementById('detailsFavoriteBtn').addEventListener('click', () => {
      toggleFavorite(state.selectedId);
      VK.ui.fillDetails(findProject(state.selectedId));
    });
    document.getElementById('detailsPinBtn').addEventListener('click', () => {
      togglePinned(state.selectedId);
      VK.ui.fillDetails(findProject(state.selectedId));
    });
    document.getElementById('detailsEditBtn').addEventListener('click', () => {
      VK.modal.close(document.getElementById('detailsModalOverlay'));
      openEditProjectModal(state.selectedId);
    });
    document.getElementById('detailsDeleteBtn').addEventListener('click', () => deleteProject(state.selectedId));

    document.getElementById('detailsGithubCopy').addEventListener('click', async () => {
      const ok = await u.copyToClipboard(document.getElementById('detailsGithubLink').href);
      notify.show(ok ? 'success' : 'error', ok ? 'Copied' : 'Copy failed', ok ? 'GitHub link copied to clipboard.' : '');
    });
    document.getElementById('detailsDemoCopy').addEventListener('click', async () => {
      const ok = await u.copyToClipboard(document.getElementById('detailsDemoLink').href);
      notify.show(ok ? 'success' : 'error', ok ? 'Copied' : 'Copy failed', ok ? 'Demo link copied to clipboard.' : '');
    });
  }

  function wireConfirmAndMisc() {
    VK.modal.bindDismiss(document.getElementById('confirmOverlay'));
    VK.modal.bindDismiss(document.getElementById('shortcutsOverlay'));
    VK.modal.bindDismiss(document.getElementById('importOverlay'));
  }

  function wireTopbarMenu() {
    const btn = document.getElementById('moreMenuBtn');
    const dropdown = document.getElementById('moreMenuDropdown');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.hidden = !dropdown.hidden;
    });
    document.addEventListener('click', () => { dropdown.hidden = true; });

    document.getElementById('menuExport').addEventListener('click', doExport);
    document.getElementById('quickExport').addEventListener('click', doExport);
    document.getElementById('menuImport').addEventListener('click', openImportModal);
    document.getElementById('quickImport').addEventListener('click', openImportModal);
    document.getElementById('menuShortcuts').addEventListener('click', () => VK.modal.open(document.getElementById('shortcutsOverlay')));
    document.getElementById('shortcutsCloseBtn').addEventListener('click', () => VK.modal.close(document.getElementById('shortcutsOverlay')));
    document.getElementById('menuClearAll').addEventListener('click', () => { dropdown.hidden = true; clearAllProjects(); });

    document.getElementById('importCancelBtn').addEventListener('click', () => VK.modal.close(document.getElementById('importOverlay')));
    document.getElementById('importConfirmBtn').addEventListener('click', doImport);

    document.getElementById('notifBtn').addEventListener('click', () => {
      document.getElementById('notifDot').hidden = true;
      notify.info('You\'re all caught up', 'No new notifications right now.');
    });

    document.getElementById('themeToggleBtn').addEventListener('click', () => VK.theme.toggle());
    document.getElementById('profileCard').addEventListener('click', () => {
      notify.info('Vimal Kumar', 'Frontend Developer — VK Project Portfolio Manager');
    });
  }

  function wireShortcuts() {
    VK.shortcuts.init({
      newProject: openNewProjectModal,
      focusSearch: () => document.getElementById('searchInput').focus(),
      exportData: doExport,
      importData: openImportModal,
      toggleTheme: () => VK.theme.toggle(),
      deleteSelected: () => { if (state.selectedId) deleteProject(state.selectedId); }
    });
  }

  /** ------------------------------- Boot Sequence ------------------------------- */
  function restoreUiSettings() {
    const settings = storage.getSettings();
    if (settings.sidebarCollapsed) document.getElementById('app').classList.add('sidebar-collapsed');
    state.sort = settings.sort || 'newest';
    document.getElementById('sortSelect').value = state.sort;
  }

  function hideLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    setTimeout(() => {
      screen.classList.add('is-hidden');
      document.getElementById('app').hidden = false;
      setTimeout(() => screen.remove(), 550);
    }, 550);
  }

  function init() {
    VK.notifications.init();
    VK.theme.init();
    seedIfFirstRun();
    loadProjects();
    restoreUiSettings();

    wireSidebar();
    wireMobileBackdrop();
    wireSearch();
    wireFilters();
    wireGridDelegation();
    wireFormModal();
    wireDetailsModal();
    wireConfirmAndMisc();
    wireTopbarMenu();
    wireShortcuts();

    render();
    hideLoadingScreen();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
