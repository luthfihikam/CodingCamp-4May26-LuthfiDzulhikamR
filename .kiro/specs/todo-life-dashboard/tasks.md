# Implementation Plan: To-Do List Life Dashboard

## Overview

Implement the Aurora-themed Life Dashboard as three files: `index.html` (workspace root), `css/style.css`, and `js/app.js`. All tasks involve writing or modifying those three files only — no test files, no shell commands, no build steps. Each task builds incrementally on the previous one, ending with all widgets wired together and fully functional.

## Tasks

- [x] 1. Create `index.html` — document skeleton and widget markup
  - Create `index.html` at the workspace root with `<!DOCTYPE html>`, `lang="en"`, and `data-theme="light"` on `<html>`
  - Add `<meta charset>`, `<meta viewport>`, `<title>Life Dashboard</title>`, and `<link rel="stylesheet" href="css/style.css">`
  - Add `<header class="app-header">` containing `<div id="greeting-widget">` (clock `<span id="clock">`, date `<span id="date">`, greeting `<span id="greeting">`, name input `<input id="name-input" maxlength="50">`, and save button `<button id="name-save">`) plus `<button id="theme-toggle" aria-label="Toggle dark mode">`
  - Add `<main class="dashboard-grid">` with three `<section>` elements: `id="timer-widget"`, `id="task-widget"`, `id="links-widget"`, each with an `aria-labelledby` attribute pointing to its heading
  - Inside `#timer-widget`: heading, SVG ring element (`<svg id="timer-ring">`), `<span id="timer-display">`, duration input `<input id="duration-input" type="number" min="1" max="120">`, save-duration button, Start/Stop/Reset buttons, and an inline validation `<span id="duration-error">`
  - Inside `#task-widget`: heading, task text input `<input id="task-input">`, Add button `<button id="task-add">`, sort `<select id="task-sort">` with options (default, az, za, completedLast), inline error `<span id="task-error">`, and `<ul id="task-list">`
  - Inside `#links-widget`: heading, label input `<input id="link-label">`, URL input `<input id="link-url">`, Add button `<button id="link-add">`, inline error `<span id="link-error">`, and `<div id="links-list">`
  - Close with `<script src="js/app.js"></script>` before `</body>`
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 7.4, 8.1, 9.1, 10.1, 12.2, 12.6_

- [x] 2. Create `css/style.css` — Aurora CSS custom properties and base reset
  - Create `css/style.css`
  - Define all Pearl Aurora (light) tokens on `:root`: `--bg-page: #f0f0f7`, `--bg-card: rgba(255,255,255,0.72)`, `--bg-card-border: rgba(255,255,255,0.9)`, `--text-primary: #1a1a2e`, `--text-secondary: #4a4a6a`, `--text-muted: #8888aa`, `--accent-start: #7c3aed`, `--accent-end: #4f46e5`, `--accent-solid: #6d28d9`, `--accent-hover: #5b21b6`, `--success: #059669`, `--danger: #dc2626`, `--warning: #d97706`, `--shadow-card: 0 8px 32px rgba(99,102,241,0.12)`, `--shadow-hover: 0 16px 48px rgba(99,102,241,0.22)`, `--blur: 16px`
  - Define all Midnight Aurora (dark) token overrides under `[data-theme="dark"]` with the exact values from Requirement 13.3
  - Add a CSS reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`) and set `body` to use the system font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`), `color: var(--text-primary)`, and `min-height: 100vh`
  - Set `body` background to the radial gradient mesh: two elliptical gradients at `20% 50%` and `80% 20%` layered over `var(--bg-page)` (light uses `rgba(124,58,237,0.08)` / `rgba(79,70,229,0.08)`; dark uses `0.15` opacity variants via the dark-theme override)
  - Ensure all font sizes for body text are `≥ 14px`
  - _Requirements: 13.1, 13.2, 13.3, 13.5, 12.4_

- [x] 3. Add `css/style.css` — card, header, and grid layout styles
  - Style `.app-header` with padding, flex layout (space-between), and the theme-toggle button as a 36×36px circular icon button with semi-transparent background
  - Style `.dashboard-grid` as a CSS Grid with `gap` of 24px and `padding` of 24–32px; apply the three responsive breakpoints:
    - `≥ 1024px`: `grid-template-columns: 1fr 1fr` (2-column, Greeting+Timer left, Tasks+Links right)
    - `640px–1023px`: `grid-template-columns: 1fr 1fr` with widgets stacking within each column
    - `< 640px`: `grid-template-columns: 1fr` (single column, full-width cards)
  - Style `.card` (applied to each `<section>`): `background: var(--bg-card)`, `backdrop-filter: blur(var(--blur))`, `-webkit-backdrop-filter: blur(var(--blur))`, `border: 1px solid var(--bg-card-border)`, `border-radius: 20px`, `box-shadow: var(--shadow-card)`, `padding: 24px`, `transition: transform 200ms ease, box-shadow 200ms ease`
  - Add `.card:hover` rule: `transform: translateY(-2px)`, `box-shadow: var(--shadow-hover)`
  - Ensure no horizontal scrolling occurs from 320px to 1920px viewport widths (use `max-width: 100%` and `overflow-x: hidden` on body)
  - _Requirements: 12.1, 12.7, 12.8, 12.9, 13.4, 13.8, 13.9_

- [x] 4. Add `css/style.css` — typography, button variants, and form element styles
  - Style the clock `#clock` with `font-size: clamp(3rem, 8vw, 6rem)` and `font-weight: 300`, `color: var(--text-primary)`
  - Style `#date` and `#greeting` with appropriate secondary/muted text colours
  - Style `.btn-primary` (Start, Add, Save buttons): `background: linear-gradient(135deg, var(--accent-start), var(--accent-end))`, `color: #fff`, `border: none`, `border-radius: 8px`, `padding: 8px 20px`, `cursor: pointer`, `box-shadow: 0 2px 8px rgba(99,102,241,0.25)`, `transition: background 200ms ease`
  - Style `.btn-secondary` (Stop, Cancel): transparent fill, `border: 1px solid var(--accent-solid)`, `color: var(--accent-solid)`, `border-radius: 8px`
  - Style `.btn-danger` (Delete): transparent fill, `color: var(--danger)`, visible on row hover
  - Style `input`, `select` elements: `border: 1px solid var(--bg-card-border)`, `border-radius: 8px`, `padding: 8px 12px`, `background: transparent`, `color: var(--text-primary)`, `font-size: 14px`
  - Style inline error/warning spans: `.error-msg { color: var(--danger); font-size: 13px; }` and `.warn-msg { color: var(--warning); font-size: 13px; }`
  - Style completed task titles with `text-decoration: line-through` and `color: var(--text-muted)`
  - Ensure all interactive controls have visible `:focus-visible` outlines for keyboard navigation
  - _Requirements: 7.3, 12.5, 12.6, 13.7, 13.10_

- [x] 5. Add `css/style.css` — Focus Timer SVG ring and task/links list styles
  - Style `#timer-widget` centre layout: flex column, align-items center
  - Style the SVG ring container: position the `<svg id="timer-ring">` as a relative block with the `#timer-display` absolutely centred inside it
  - Set the SVG circle's `stroke` to use a `linearGradient` defined in the SVG (referenced from `js/app.js` when building the SVG), `stroke-width: 8`, `fill: none`, `stroke-linecap: round`
  - Add `transition: stroke-dashoffset 1s linear` on the progress circle element so the arc animates smoothly each tick
  - Style `#task-list` as a plain list (`list-style: none`); each `<li>` as a flex row with checkbox, title span, edit button, and delete button
  - Style `#links-list` as a flex wrap container; each link as a `.btn-primary`-styled button with a small delete icon overlay on hover
  - _Requirements: 13.6, 3.1_

- [x] 6. Create `js/app.js` — Storage module and AppState bootstrap
  - Create `js/app.js`
  - Define the `Storage` object with:
    - `KEY: 'lifeDashboard_v1'`
    - `defaultState()` returning `{ theme: 'light', userName: '', pomodoroDuration: 25, tasks: [], links: [] }`
    - `load()`: wraps `JSON.parse(localStorage.getItem(this.KEY))` in `try/catch`; returns parsed state merged with `defaultState()` on success, or `defaultState()` (with `console.warn`) on failure
    - `save(state)`: wraps `localStorage.setItem(this.KEY, JSON.stringify(state))` in `try/catch`; logs `QuotaExceededError` without crashing
  - Declare a module-level `let AppState` variable
  - Add a `DOMContentLoaded` listener that calls `AppState = Storage.load()` as the first action
  - _Requirements: 2.2, 2.3, 2.4, 4.2, 4.3, 5.5, 5.6, 7.2, 9.2, 9.5, 10.2, 11.3, 11.4_

- [x] 7. Add `js/app.js` — ThemeController
  - Define `ThemeController` object with `init()` and `render()` methods
  - `init()`: get reference to `#theme-toggle` button; attach `click` listener that toggles `AppState.theme` between `'light'` and `'dark'`, calls `Storage.save(AppState)`, then calls `render()`
  - `render()`: set `document.documentElement.setAttribute('data-theme', AppState.theme)`; update the toggle button's text/aria-label to reflect the current theme (e.g., `🌙` for light, `☀️` for dark)
  - Apply theme before any other rendering by calling `ThemeController.render()` immediately after `Storage.load()` in the `DOMContentLoaded` handler (before other `init()` calls)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 8. Add `js/app.js` — GreetingController
  - Define `GreetingController` with `init()`, `render()`, `startClock()`, `updateClock()`, `getGreeting(hour)`, and `saveName(name)` methods
  - `getGreeting(hour)`: pure function returning `'Good Morning'` for hours 5–10, `'Good Afternoon'` for 11–16, `'Good Evening'` for 17–21, `'Good Night'` for 22–23 and 0–4
  - `updateClock()`: read `new Date()`, format time as `HH:MM:SS` (zero-padded), format date as `"Weekday, DD Month YYYY"` (e.g., "Monday, 14 July 2025"), compute greeting via `getGreeting(hour)`, append `AppState.userName` if non-empty (e.g., `"Good Morning, Alex"`), update `#clock`, `#date`, and `#greeting` DOM nodes
  - `startClock()`: call `updateClock()` immediately, then `setInterval(updateClock, 1000)`
  - `saveName(name)`: trim input; if length > 50 truncate to 50; update `AppState.userName`; call `Storage.save(AppState)`; call `render()`
  - `init()`: cache DOM refs for `#name-input`, `#name-save`; pre-populate `#name-input` with `AppState.userName`; attach `click` listener on `#name-save` that calls `saveName(input.value)`; call `render()`; call `startClock()`
  - `render()`: update `#name-input` value to `AppState.userName`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 9. Add `js/app.js` — TimerController
  - Define `TimerController` with properties `state: 'stopped'`, `intervalId: null`, `remainingSeconds: 0`, and methods `init()`, `render()`, `start()`, `stop()`, `reset()`, `tick()`, `onComplete()`, `saveDuration(minutes)`, `formatTime(seconds)`
  - `formatTime(seconds)`: pure function; compute `mm = Math.floor(seconds / 60)`, `ss = seconds % 60`; return `String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0')`
  - `saveDuration(minutes)`: validate `minutes` is an integer in [1, 120]; if invalid show `#duration-error` message `"Duration must be between 1 and 120 minutes."` and return; otherwise clear error, update `AppState.pomodoroDuration`, call `Storage.save(AppState)`, call `reset()`
  - `start()`: if `state !== 'running'`, set `state = 'running'`, start `setInterval(tick, 1000)` stored in `intervalId`, call `render()`
  - `stop()`: if `state === 'running'`, clear interval, set `state = 'paused'`, call `render()`
  - `reset()`: clear interval, set `state = 'stopped'`, set `remainingSeconds = AppState.pomodoroDuration * 60`, call `render()`
  - `tick()`: decrement `remainingSeconds`; if `remainingSeconds <= 0` call `onComplete()`; else call `render()`
  - `onComplete()`: clear interval, set `state = 'stopped'`, set `remainingSeconds = 0`, call `render()`, then call `window.alert('Focus session complete! Take a break.')`
  - `render()`: update `#timer-display` with `formatTime(remainingSeconds)`; update SVG ring `stroke-dashoffset` proportionally (`offset = circumference * (1 - remainingSeconds / totalSeconds)`); enable/disable Start, Stop, Reset buttons per Requirement 3.7–3.8; update `#duration-input` value
  - `init()`: set `remainingSeconds = AppState.pomodoroDuration * 60`; cache DOM refs; attach click listeners for Start (`start()`), Stop (`stop()`), Reset (`reset()`), and duration-save (`saveDuration(input.value)`); build the SVG ring (set `r`, compute `circumference = 2 * Math.PI * r`, set `stroke-dasharray = circumference`); call `render()`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 13.6_

- [x] 10. Add `js/app.js` — TaskController
  - Define `TaskController` with property `currentSort: 'default'` and methods `init()`, `render()`, `addTask(title)`, `editTask(id, newTitle)`, `deleteTask(id)`, `toggleTask(id)`, `setSort(option)`, `getSortedTasks()`, `isDuplicate(title, excludeId)`
  - `isDuplicate(title, excludeId)`: return `true` if any task in `AppState.tasks` (excluding `excludeId` if provided) has a title that matches `title.trim()` case-insensitively
  - `addTask(title)`: trim title; if empty show `#task-error` `"Task title cannot be empty."` and return; if `isDuplicate(title)` show `"A task with this title already exists."` and return; clear error; push `{ id: crypto.randomUUID?.() ?? Date.now().toString(), title: trimmed, completed: false, createdAt: Date.now() }` onto `AppState.tasks`; call `Storage.save(AppState)`; call `render()`; clear input
  - `editTask(id, newTitle)`: trim; if empty show inline error on that task row and return; if `isDuplicate(newTitle, id)` show inline duplicate warning and return; find task by id, update `title`; call `Storage.save(AppState)`; call `render()`
  - `deleteTask(id)`: filter out task with matching id from `AppState.tasks`; call `Storage.save(AppState)`; call `render()`
  - `toggleTask(id)`: find task by id, flip `completed`; call `Storage.save(AppState)`; call `render()`
  - `getSortedTasks()`: return a sorted copy of `AppState.tasks` (do NOT mutate the original array) according to `currentSort`: `'default'` → by `createdAt` asc; `'az'` → by `title.toLowerCase()` asc; `'za'` → by `title.toLowerCase()` desc; `'completedLast'` → incomplete first (each group by `createdAt` asc)
  - `setSort(option)`: set `currentSort = option`; call `render()`
  - `render()`: build `<li>` elements from `getSortedTasks()`; each `<li>` contains a checkbox (checked if `completed`), a title `<span>` (with `line-through` class if `completed`), an Edit button, and a Delete button; attach event listeners inline; replace `#task-list` contents
  - `init()`: cache DOM refs; pre-populate `#task-sort` to `'default'`; attach `click` on `#task-add` → `addTask(input.value)`; attach `change` on `#task-sort` → `setSort(select.value)`; call `render()`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 11. Add `js/app.js` — LinksController
  - Define `LinksController` with methods `init()`, `render()`, `addLink(label, url)`, `deleteLink(id)`, `isValidUrl(url)`
  - `isValidUrl(url)`: return `true` if and only if `url` starts with `'http://'` or `'https://'` (case-sensitive)
  - `addLink(label, url)`: trim both inputs; if label is empty show `#link-error` `"Label cannot be empty."` and return; if `!isValidUrl(url)` show `"URL must start with http:// or https://"` and return; clear error; push `{ id: crypto.randomUUID?.() ?? Date.now().toString(), label: trimmedLabel, url: trimmedUrl }` onto `AppState.links`; call `Storage.save(AppState)`; call `render()`; clear inputs
  - `deleteLink(id)`: filter out link with matching id from `AppState.links`; call `Storage.save(AppState)`; call `render()`
  - `render()`: build a button for each link in `AppState.links` with `class="btn-primary"`, text = `link.label`, `onclick` opens `link.url` in a new tab (`window.open(link.url, '_blank', 'noopener,noreferrer')`); add a small delete control per link; replace `#links-list` contents
  - `init()`: cache DOM refs for `#link-label`, `#link-url`, `#link-add`, `#link-error`, `#links-list`; attach `click` on `#link-add` → `addLink(labelInput.value, urlInput.value)`; call `render()`
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2_

- [x] 12. Add `js/app.js` — wire all controllers in DOMContentLoaded and finalise startup sequence
  - In the `DOMContentLoaded` handler, after `AppState = Storage.load()`, call controllers in this order: `ThemeController.render()` (apply theme before paint), then `ThemeController.init()`, `GreetingController.init()`, `TimerController.init()`, `TaskController.init()`, `LinksController.init()`
  - Ensure `GreetingController.startClock()` is called inside `GreetingController.init()` so the clock begins ticking immediately on load
  - Verify that `#duration-input` is pre-populated with `AppState.pomodoroDuration` and `#name-input` is pre-populated with `AppState.userName` during their respective `init()` calls
  - Verify that `TaskController.render()` and `LinksController.render()` read from `AppState.tasks` and `AppState.links` respectively, so all persisted data is displayed on load
  - _Requirements: 1.1, 2.4, 4.3, 5.6, 9.5, 11.4, 12.3_

- [x] 13. Final checkpoint — review all three files for completeness and correctness
  - Open `index.html` and confirm every widget section has the correct `id` attributes, `aria-labelledby` references, and that `<link>` and `<script>` paths match `css/style.css` and `js/app.js`
  - Open `css/style.css` and confirm all 16 light-theme tokens and all 16 dark-theme tokens are present with the exact values from Requirements 13.2 and 13.3; confirm the three responsive breakpoints are present; confirm `.card:hover` lift is defined
  - Open `js/app.js` and confirm: `Storage.KEY` is `'lifeDashboard_v1'`; `defaultState()` returns `pomodoroDuration: 25`; `getGreeting` covers all four time bands; `formatTime` zero-pads both `MM` and `SS`; `getSortedTasks` returns a copy (not a mutation); `isValidUrl` checks `http://` and `https://` only; all five controllers are initialised in `DOMContentLoaded`
  - Ensure all tasks pass, ask the user if questions arise.
  - _Requirements: 1–13 (all)_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP — there are none here per project constraints (no test files)
- Each task references specific requirements for traceability
- Tasks 1–5 build the static shell (HTML + CSS); Tasks 6–11 build the JavaScript logic; Task 12 wires everything together; Task 13 is the final review checkpoint
- The three output files are: `index.html` (root), `css/style.css`, `js/app.js`
- No external dependencies, no build step, no shell commands required
