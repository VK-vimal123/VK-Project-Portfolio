# VK Project Portfolio Manager

A premium, personal **Project Portfolio Manager** for tracking software projects — built entirely with **HTML5, CSS3, and Vanilla JavaScript (ES6+)**. No frameworks, no backend, no build step. Everything runs in the browser and saves permanently to `localStorage`.

> Created by **Vimal Kumar** — [github.com/VK-vimal123](https://github.com/VK-vimal123)

---

## Overview

VK Project Portfolio Manager is a single-user dashboard for organizing an unlimited number of personal software projects. It looks and feels like a premium SaaS product — glassmorphism, gradient accents, animated statistics, and smooth micro-interactions — while remaining 100% static and framework-free.

Everything you do — creating a project, editing it, favoriting it, pinning it, reordering cards, switching themes — is saved instantly to `localStorage` and restored exactly as you left it the next time you open the app.

---

## Features

- **Full CRUD** — create, read, update, and delete projects through a polished modal workflow, with a confirmation step before every delete.
- **Rich project data** — title, category, description, technologies, GitHub repo, live demo link, status, priority, progress percentage, start/end dates, thumbnail, tags, notes, favorite & pinned flags.
- **Live dashboard statistics** — total, completed, in-progress, planning, priority breakdowns, favorites, pinned, average progress, projects added this month, and recently updated — all animated and recalculated automatically.
- **Instant search** across title, category, technologies, tags, and description.
- **Filters** by status, priority, and category, plus dedicated views for Pinned, Favorites, and Completed.
- **Sorting** — newest, oldest, A–Z, Z–A, progress, priority, recently updated.
- **Drag-and-drop card reordering**, persisted across refreshes.
- **Light & dark themes**, restored automatically on startup.
- **Toast notifications** for every meaningful action.
- **Import / Export** your entire portfolio as a single JSON file, with merge or replace options on import.
- **Client-side validation** — no empty or duplicate titles, valid URLs only, progress clamped 0–100, sane date ranges.
- **Keyboard shortcuts** for power users (see below).
- **Fully responsive** — desktop, laptop, tablet, and mobile, portrait and landscape.
- **Accessible** — keyboard navigable, ARIA labels, visible focus states, reduced-motion support.
- **Nothing is ever lost** — refreshing or closing the browser never clears your data. Only the explicit "Clear All Projects" action does.

---

## Folder Structure

```
Project-Portfolio-Manager/
├── index.html
├── README.md
├── css/
│   ├── style.css          Base tokens, resets, sidebar & topbar layout
│   ├── dashboard.css      Statistics, toolbar, project cards, empty states
│   ├── modal.css          Loading screen, overlays, form/details/confirm modals
│   ├── animations.css     Keyframes & animation utility classes
│   ├── components.css     Buttons, chips, badges, inputs, toasts, FAB
│   └── responsive.css     Breakpoints for tablet & mobile
├── js/
│   ├── app.js             Application state, init, event wiring
│   ├── storage.js         LocalStorage persistence layer
│   ├── ui.js               Card/grid/modal rendering
│   ├── modal.js            Generic modal open/close + confirm dialog
│   ├── search.js           Instant search logic
│   ├── filter.js           Filtering & sorting logic
│   ├── statistics.js       Dashboard statistics computation & rendering
│   ├── theme.js             Light/dark theme handling
│   ├── dragdrop.js          Drag-and-drop card reordering
│   ├── importExport.js      JSON import/export
│   ├── notifications.js     Toast notification system
│   ├── validation.js        Form validation rules
│   ├── shortcuts.js         Keyboard shortcut handling
│   └── utilities.js         Shared helper functions
└── assets/
    ├── icons/
    ├── images/
    ├── illustrations/
    └── logo/
        └── favicon.svg
```

---

## Installation

No build tools, no dependencies, no server required.

1. Download or clone this folder.
2. Open `index.html` directly in your browser, **or** serve it locally for the best experience:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8080
   ```
3. Visit the local address shown in your terminal (or just double-click `index.html`).

---

## Usage

- Click **New Project** (top bar, quick actions, empty state, or the floating action button) to add a project.
- Click any project card to open its full details.
- Use the star and pin icons on a card to favorite or pin it.
- Use the search bar, filter chips, dropdowns, and sort menu to narrow the grid.
- Drag cards to reorder them manually — your order is remembered.
- Use the **⋯** menu in the top bar to export, import, view shortcuts, or clear all projects.
- Toggle the sun/moon icon (or `Ctrl+D`) to switch between light and dark themes.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` + `N` | New Project |
| `Ctrl` + `F` | Focus Search |
| `Ctrl` + `E` | Export Portfolio |
| `Ctrl` + `I` | Import Portfolio |
| `Ctrl` + `D` | Toggle Theme |
| `Esc` | Close Modal |
| `Delete` | Delete Selected Project |

---

## Technology Stack

- **HTML5** — semantic structure, accessible forms and dialogs
- **CSS3** — custom properties, gradients, glassmorphism, grid/flexbox, animations
- **Vanilla JavaScript (ES6+)** — modular, dependency-free application logic
- **LocalStorage API** — persistent, offline-first data storage
- **Google Fonts** — Space Grotesk, Inter, JetBrains Mono

No React, Vue, Angular, Bootstrap, Tailwind, jQuery, or backend of any kind.

---

## Browser Support

Latest versions of Chrome, Edge, Firefox, and Safari. Requires a browser with `localStorage`, the Clipboard API (for copy buttons), and native HTML5 drag-and-drop support.

---

## Future Improvements

- Optional cloud sync / multi-device backup
- Project templates and cloning
- Kanban-style board view by status
- Image upload with automatic compression for thumbnails
- Activity timeline per project

---

## Author

**Vimal Kumar**
Frontend Developer
GitHub: [github.com/VK-vimal123](https://github.com/VK-vimal123)

## License

MIT © 2026 Vimal Kumar
