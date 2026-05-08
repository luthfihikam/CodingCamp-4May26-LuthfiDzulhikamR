/* ============================================================
   Life Dashboard — js/app.js
   Aurora-themed single-page productivity dashboard.
   All state is persisted in localStorage under a single key.
   ============================================================ */

/* ----------------------------------------------------------
   Storage Module
   Handles all localStorage read/write operations.
   ---------------------------------------------------------- */
const Storage = {
  KEY: 'lifeDashboard_v1',

  /** Returns a fresh AppState with all default values. */
  defaultState() {
    return {
      theme: 'light',
      userName: '',
      pomodoroDuration: 25,
      tasks: [],
      links: []
    };
  },

  /**
   * Loads AppState from localStorage.
   * On success, merges the parsed object with defaultState() so that
   * any missing keys (e.g. from an older schema) are filled in.
   * On failure (missing key, invalid JSON, etc.) returns defaultState()
   * and logs a console warning.
   * @returns {object} AppState
   */
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw === null) {
        return this.defaultState();
      }
      const parsed = JSON.parse(raw);
      // Merge with defaults so new keys are always present
      return Object.assign(this.defaultState(), parsed);
    } catch (err) {
      console.warn('[Storage.load] Failed to parse saved state; using defaults.', err);
      return this.defaultState();
    }
  },

  /**
   * Persists the given AppState to localStorage.
   * Handles QuotaExceededError gracefully — logs the error without crashing.
   * @param {object} state - The current AppState to persist.
   */
  save(state) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(state));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        console.error('[Storage.save] QuotaExceededError: unable to persist state.', err);
      } else {
        console.error('[Storage.save] Unexpected error while saving state.', err);
      }
    }
  }
};

/* ----------------------------------------------------------
   AppState
   Module-level variable that holds the single source of truth
   for all widget data. Populated on DOMContentLoaded.
   ---------------------------------------------------------- */
let AppState;

/* ----------------------------------------------------------
   ThemeController
   Manages the Light/Dark theme toggle.
   Reads and writes AppState.theme, applies data-theme to <html>,
   and updates the toggle button label to reflect the active theme.
   ---------------------------------------------------------- */
const ThemeController = {
  /** @type {HTMLButtonElement|null} */
  _btn: null,

  /**
   * Binds the #theme-toggle button and attaches a click listener
   * that toggles the theme, persists it, and re-renders.
   */
  init() {
    this._btn = document.getElementById('theme-toggle');
    if (!this._btn) return;

    this._btn.addEventListener('click', () => {
      AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
      Storage.save(AppState);
      this.render();
    });
  },

  /**
   * Applies the current theme to the document and updates the
   * toggle button's text content and aria-label to reflect the
   * active theme (🌙 when light — clicking will switch to dark;
   * ☀️ when dark — clicking will switch to light).
   */
  render() {
    document.documentElement.setAttribute('data-theme', AppState.theme);

    if (!this._btn) {
      // Button may not be bound yet (render called before init)
      this._btn = document.getElementById('theme-toggle');
    }
    if (!this._btn) return;

    if (AppState.theme === 'light') {
      this._btn.textContent = '🌙';
      this._btn.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      this._btn.textContent = '☀️';
      this._btn.setAttribute('aria-label', 'Switch to light mode');
    }
  }
};

/* ----------------------------------------------------------
   GreetingController
   Manages the live clock, date display, time-of-day greeting,
   and the user name input/save flow.
   ---------------------------------------------------------- */
const GreetingController = {
  /** @type {HTMLInputElement|null} */
  _nameInput: null,
  /** @type {HTMLButtonElement|null} */
  _nameSave: null,

  /**
   * Pure function — maps an hour (0–23) to a greeting string.
   * Bands:
   *   05–10 → "Good Morning"
   *   11–16 → "Good Afternoon"
   *   17–21 → "Good Evening"
   *   22–23, 00–04 → "Good Night"
   * @param {number} hour - Integer in [0, 23]
   * @returns {string}
   */
  getGreeting(hour) {
    if (hour >= 5 && hour <= 10) return 'Good Morning';
    if (hour >= 11 && hour <= 16) return 'Good Afternoon';
    if (hour >= 17 && hour <= 21) return 'Good Evening';
    return 'Good Night'; // 22–23 and 0–4
  },

  /**
   * Reads the current Date, formats the time as HH:MM:SS and the
   * date as "Weekday, DD Month YYYY", computes the greeting (with
   * optional user name suffix), then updates the #clock, #date,
   * and #greeting DOM nodes.
   */
  updateClock() {
    const now = new Date();

    // --- Time: HH:MM:SS (zero-padded) ---
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hh}:${mm}:${ss}`;

    // --- Date: "Weekday, DD Month YYYY" ---
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const weekday = weekdays[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateStr = `${weekday}, ${day} ${month} ${year}`;

    // --- Greeting (with optional name suffix) ---
    const hour = now.getHours();
    let greeting = this.getGreeting(hour);
    if (AppState.userName && AppState.userName.trim().length > 0) {
      greeting = `${greeting}, ${AppState.userName}`;
    }

    // --- Update DOM ---
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    const greetingEl = document.getElementById('greeting');

    if (clockEl) clockEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
    if (greetingEl) greetingEl.textContent = greeting;
  },

  /**
   * Calls updateClock() immediately, then schedules it to run
   * every second via setInterval.
   */
  startClock() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  },

  /**
   * Trims the provided name, truncates to 50 characters if needed,
   * updates AppState.userName, persists to localStorage, and re-renders.
   * @param {string} name - Raw value from the name input field.
   */
  saveName(name) {
    let trimmed = name.trim();
    if (trimmed.length > 50) {
      trimmed = trimmed.slice(0, 50);
    }
    AppState.userName = trimmed;
    Storage.save(AppState);
    this.render();
  },

  /**
   * Updates the #name-input value to reflect the current AppState.userName.
   */
  render() {
    if (this._nameInput) {
      this._nameInput.value = AppState.userName;
    }
  },

  /**
   * Caches DOM references, pre-populates the name input, attaches
   * the save button click listener, then calls render() and startClock().
   */
  init() {
    this._nameInput = document.getElementById('name-input');
    this._nameSave = document.getElementById('name-save');

    // Pre-populate the name input with the stored user name
    if (this._nameInput) {
      this._nameInput.value = AppState.userName;
    }

    // Attach save listener
    if (this._nameSave) {
      this._nameSave.addEventListener('click', () => {
        this.saveName(this._nameInput ? this._nameInput.value : '');
      });
    }

    this.render();
    this.startClock();
  }
};

/* ----------------------------------------------------------
   TimerController
   Manages the Pomodoro focus timer state machine:
     stopped → running → paused → running → stopped (on complete / reset)
   Renders the MM:SS display, SVG progress ring, and button states.
   ---------------------------------------------------------- */
const TimerController = {
  /** @type {'stopped'|'running'|'paused'} */
  state: 'stopped',
  /** @type {number|null} */
  intervalId: null,
  /** @type {number} */
  remainingSeconds: 0,

  // --- Cached DOM references ---
  /** @type {HTMLSpanElement|null} */
  _display: null,
  /** @type {SVGCircleElement|null} */
  _ring: null,
  /** @type {HTMLButtonElement|null} */
  _startBtn: null,
  /** @type {HTMLButtonElement|null} */
  _stopBtn: null,
  /** @type {HTMLButtonElement|null} */
  _resetBtn: null,
  /** @type {HTMLInputElement|null} */
  _durationInput: null,
  /** @type {HTMLButtonElement|null} */
  _durationSave: null,
  /** @type {HTMLSpanElement|null} */
  _durationError: null,
  /** @type {number} */
  _circumference: 0,

  /**
   * Pure function — converts a total number of seconds into a "MM:SS" string.
   * Both MM and SS are zero-padded to at least two digits.
   * @param {number} seconds - Non-negative integer
   * @returns {string} e.g. "25:00", "01:30", "00:05"
   */
  formatTime(seconds) {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  },

  /**
   * Validates and saves a new Pomodoro duration.
   * Accepts only integers in the inclusive range [1, 120].
   * On success: clears error, updates AppState, persists, and resets the timer.
   * On failure: shows the inline #duration-error message and returns early.
   * @param {string|number} minutes - Raw value from the duration input
   */
  saveDuration(minutes) {
    const parsed = Number(minutes);
    const isValid =
      Number.isInteger(parsed) &&
      parsed >= 1 &&
      parsed <= 120;

    if (!isValid) {
      if (this._durationError) {
        this._durationError.textContent = 'Duration must be between 1 and 120 minutes.';
        this._durationError.style.display = 'inline';
      }
      return;
    }

    // Clear error
    if (this._durationError) {
      this._durationError.textContent = '';
      this._durationError.style.display = 'none';
    }

    AppState.pomodoroDuration = parsed;
    Storage.save(AppState);
    this.reset();
  },

  /**
   * Transitions the timer from stopped/paused → running.
   * Starts a 1-second interval that calls tick().
   */
  start() {
    if (this.state !== 'running') {
      this.state = 'running';
      this.intervalId = setInterval(() => this.tick(), 1000);
      this.render();
    }
  },

  /**
   * Transitions the timer from running → paused.
   * Clears the interval but retains the remaining time.
   */
  stop() {
    if (this.state === 'running') {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.state = 'paused';
      this.render();
    }
  },

  /**
   * Resets the timer to stopped state with the full Pomodoro duration.
   * Safe to call from any state.
   */
  reset() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.state = 'stopped';
    this.remainingSeconds = AppState.pomodoroDuration * 60;
    this.render();
  },

  /**
   * Called every second while the timer is running.
   * Decrements remainingSeconds; triggers onComplete() when it reaches 0.
   */
  tick() {
    this.remainingSeconds -= 1;
    if (this.remainingSeconds <= 0) {
      this.onComplete();
    } else {
      this.render();
    }
  },

  /**
   * Called when the countdown reaches zero.
   * Stops the timer, resets remaining time to 0, re-renders, then alerts the user.
   */
  onComplete() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.state = 'stopped';
    this.remainingSeconds = 0;
    this.render();
    window.alert('Focus session complete! Take a break.');
  },

  /**
   * Rebuilds the timer UI from the current in-memory state:
   *  - Updates #timer-display text
   *  - Animates the SVG ring stroke-dashoffset
   *  - Enables/disables Start, Stop, Reset buttons per Requirements 3.7–3.8
   *  - Syncs #duration-input value with AppState.pomodoroDuration
   */
  render() {
    // --- Timer display ---
    if (this._display) {
      this._display.textContent = this.formatTime(this.remainingSeconds);
    }

    // --- SVG ring ---
    if (this._ring && this._circumference > 0) {
      const totalSeconds = AppState.pomodoroDuration * 60;
      const fraction = totalSeconds > 0 ? this.remainingSeconds / totalSeconds : 0;
      const offset = this._circumference * (1 - fraction);
      this._ring.style.strokeDashoffset = offset;
    }

    // --- Button states (Requirements 3.7–3.8) ---
    if (this._startBtn) {
      // Start is disabled while running
      this._startBtn.disabled = this.state === 'running';
    }
    if (this._stopBtn) {
      // Stop is only enabled while running
      this._stopBtn.disabled = this.state !== 'running';
    }
    if (this._resetBtn) {
      // Reset is always enabled (allows reset from any state)
      this._resetBtn.disabled = false;
    }

    // --- Duration input ---
    if (this._durationInput) {
      this._durationInput.value = AppState.pomodoroDuration;
    }
  },

  /**
   * One-time setup:
   *  - Sets initial remainingSeconds from AppState
   *  - Caches all DOM references
   *  - Attaches click listeners for Start, Stop, Reset, and duration-save
   *  - Builds the SVG ring (stroke-dasharray / initial stroke-dashoffset)
   *  - Calls render() to paint the initial state
   */
  init() {
    // Set initial remaining time
    this.remainingSeconds = AppState.pomodoroDuration * 60;

    // Cache DOM references
    this._display = document.getElementById('timer-display');
    this._startBtn = document.getElementById('timer-start');
    this._stopBtn = document.getElementById('timer-stop');
    this._resetBtn = document.getElementById('timer-reset');
    this._durationInput = document.getElementById('duration-input');
    this._durationSave = document.getElementById('duration-save');
    this._durationError = document.getElementById('duration-error');

    // Cache the SVG progress circle
    const svg = document.getElementById('timer-ring');
    if (svg) {
      this._ring = svg.querySelector('.timer-ring-progress');
    }

    // Build SVG ring geometry
    // The circle already has r="85" set in the HTML; read it from the element.
    if (this._ring) {
      const r = parseFloat(this._ring.getAttribute('r')) || 85;
      this._circumference = 2 * Math.PI * r;
      this._ring.style.strokeDasharray = this._circumference;
      // Initial offset: full ring visible (no progress consumed yet)
      this._ring.style.strokeDashoffset = 0;
    }

    // Attach button listeners
    if (this._startBtn) {
      this._startBtn.addEventListener('click', () => this.start());
    }
    if (this._stopBtn) {
      this._stopBtn.addEventListener('click', () => this.stop());
    }
    if (this._resetBtn) {
      this._resetBtn.addEventListener('click', () => this.reset());
    }
    if (this._durationSave) {
      this._durationSave.addEventListener('click', () => {
        this.saveDuration(this._durationInput ? this._durationInput.value : '');
      });
    }

    // Initial render
    this.render();
  }
};

/* ----------------------------------------------------------
   TaskController
   Manages the Task Manager widget: add, edit, delete, toggle,
   sort, and render tasks. All mutations go through AppState and
   are persisted via Storage.save().
   ---------------------------------------------------------- */
const TaskController = {
  /** @type {'default'|'az'|'za'|'completedLast'} */
  currentSort: 'default',

  // --- Cached DOM references ---
  /** @type {HTMLInputElement|null} */
  _taskInput: null,
  /** @type {HTMLButtonElement|null} */
  _taskAdd: null,
  /** @type {HTMLSelectElement|null} */
  _taskSort: null,
  /** @type {HTMLSpanElement|null} */
  _taskError: null,
  /** @type {HTMLUListElement|null} */
  _taskList: null,

  /**
   * Returns true if any task in AppState.tasks (excluding the task
   * with excludeId, if provided) has a title that matches title.trim()
   * case-insensitively.
   * @param {string} title
   * @param {string} [excludeId]
   * @returns {boolean}
   */
  isDuplicate(title, excludeId) {
    const normalised = title.trim().toLowerCase();
    return AppState.tasks.some(task => {
      if (excludeId !== undefined && task.id === excludeId) return false;
      return task.title.toLowerCase() === normalised;
    });
  },

  /**
   * Validates and adds a new task.
   * - Trims the title; rejects empty/whitespace-only strings.
   * - Rejects duplicate titles (case-insensitive).
   * - On success: pushes a new Task onto AppState.tasks, persists,
   *   re-renders, and clears the input field.
   * @param {string} title - Raw value from the task input field.
   */
  addTask(title) {
    const trimmed = title.trim();

    if (trimmed.length === 0) {
      if (this._taskError) {
        this._taskError.textContent = 'Task title cannot be empty.';
      }
      return;
    }

    if (this.isDuplicate(trimmed)) {
      if (this._taskError) {
        this._taskError.textContent = 'A task with this title already exists.';
      }
      return;
    }

    // Clear any previous error
    if (this._taskError) {
      this._taskError.textContent = '';
    }

    const newTask = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      title: trimmed,
      completed: false,
      createdAt: Date.now()
    };

    AppState.tasks.push(newTask);
    Storage.save(AppState);
    this.render();

    // Clear the input field
    if (this._taskInput) {
      this._taskInput.value = '';
    }
  },

  /**
   * Validates and applies an inline edit to an existing task.
   * - Trims the new title; rejects empty/whitespace-only strings.
   * - Rejects duplicate titles (excluding the task being edited).
   * - On success: updates the task title, persists, and re-renders.
   * @param {string} id - The task's unique identifier.
   * @param {string} newTitle - The proposed new title from the inline input.
   */
  editTask(id, newTitle) {
    const trimmed = newTitle.trim();

    if (trimmed.length === 0) {
      // Show inline error on the task row
      const li = this._taskList
        ? this._taskList.querySelector(`[data-id="${id}"]`)
        : null;
      if (li) {
        let errSpan = li.querySelector('.task-inline-error');
        if (!errSpan) {
          errSpan = document.createElement('span');
          errSpan.className = 'task-inline-error error-msg';
          li.appendChild(errSpan);
        }
        errSpan.textContent = 'Task title cannot be empty.';
      }
      return;
    }

    if (this.isDuplicate(trimmed, id)) {
      // Show inline duplicate warning on the task row
      const li = this._taskList
        ? this._taskList.querySelector(`[data-id="${id}"]`)
        : null;
      if (li) {
        let warnSpan = li.querySelector('.task-inline-error');
        if (!warnSpan) {
          warnSpan = document.createElement('span');
          warnSpan.className = 'task-inline-error warn-msg';
          li.appendChild(warnSpan);
        }
        warnSpan.className = 'task-inline-error warn-msg';
        warnSpan.textContent = 'A task with this title already exists.';
      }
      return;
    }

    const task = AppState.tasks.find(t => t.id === id);
    if (task) {
      task.title = trimmed;
      Storage.save(AppState);
      this.render();
    }
  },

  /**
   * Removes the task with the given id from AppState.tasks,
   * persists the change, and re-renders.
   * @param {string} id
   */
  deleteTask(id) {
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    Storage.save(AppState);
    this.render();
  },

  /**
   * Flips the completed status of the task with the given id,
   * persists the change, and re-renders.
   * @param {string} id
   */
  toggleTask(id) {
    const task = AppState.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      Storage.save(AppState);
      this.render();
    }
  },

  /**
   * Returns a sorted copy of AppState.tasks according to currentSort.
   * Does NOT mutate the original array.
   * Sort options:
   *   'default'       → by createdAt ascending
   *   'az'            → by title.toLowerCase() ascending
   *   'za'            → by title.toLowerCase() descending
   *   'completedLast' → incomplete first, then complete; each group by createdAt asc
   * @returns {Task[]}
   */
  getSortedTasks() {
    const copy = AppState.tasks.slice();

    switch (this.currentSort) {
      case 'az':
        copy.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
        break;

      case 'za':
        copy.sort((a, b) => b.title.toLowerCase().localeCompare(a.title.toLowerCase()));
        break;

      case 'completedLast':
        copy.sort((a, b) => {
          // Incomplete (false) before complete (true)
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Within each group, sort by createdAt ascending
          return a.createdAt - b.createdAt;
        });
        break;

      case 'default':
      default:
        copy.sort((a, b) => a.createdAt - b.createdAt);
        break;
    }

    return copy;
  },

  /**
   * Updates currentSort and re-renders the task list.
   * @param {string} option - One of 'default', 'az', 'za', 'completedLast'
   */
  setSort(option) {
    this.currentSort = option;
    this.render();
  },

  /**
   * Rebuilds the #task-list <ul> from the sorted task array.
   * Each <li> contains:
   *   - A checkbox (checked if completed)
   *   - A title <span class="task-title"> (with "completed" class if completed)
   *   - An Edit button (class="btn-edit")
   *   - A Delete button (class="btn-danger")
   * Clicking Edit replaces the title span with an inline input + Save/Cancel buttons.
   */
  render() {
    if (!this._taskList) return;

    const tasks = this.getSortedTasks();
    const ul = this._taskList;

    // Clear existing content
    ul.innerHTML = '';

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.setAttribute('data-id', task.id);

      // --- Checkbox ---
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => this.toggleTask(task.id));

      // --- Title span ---
      const titleSpan = document.createElement('span');
      titleSpan.className = 'task-title' + (task.completed ? ' completed' : '');
      titleSpan.textContent = task.title;

      // --- Edit button ---
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
      editBtn.addEventListener('click', () => {
        // Replace title span with inline edit input + Save/Cancel
        const currentLi = this._taskList
          ? this._taskList.querySelector(`[data-id="${task.id}"]`)
          : null;
        if (!currentLi) return;

        // Remove the title span and edit/delete buttons; replace with edit UI
        const existingTitle = currentLi.querySelector('.task-title');
        const existingEdit = currentLi.querySelector('.btn-edit');
        const existingDelete = currentLi.querySelector('.btn-danger');

        // Build inline edit input
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-edit-input';
        editInput.value = task.title;
        editInput.setAttribute('aria-label', 'Edit task title');

        // Save button
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-primary';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => {
          this.editTask(task.id, editInput.value);
        });

        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
          this.render();
        });

        // Swap out the static elements for the edit UI
        if (existingTitle) currentLi.replaceChild(editInput, existingTitle);
        if (existingEdit) currentLi.replaceChild(saveBtn, existingEdit);
        if (existingDelete) currentLi.replaceChild(cancelBtn, existingDelete);

        // Focus the input for immediate typing
        editInput.focus();
        editInput.select();
      });

      // --- Delete button ---
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger';
      deleteBtn.textContent = '🗑';
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(titleSpan);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

      ul.appendChild(li);
    });
  },

  /**
   * One-time setup:
   *  - Caches DOM references
   *  - Pre-populates #task-sort to 'default'
   *  - Attaches click listener on #task-add → addTask(input.value)
   *  - Attaches change listener on #task-sort → setSort(select.value)
   *  - Calls render() to display any persisted tasks
   */
  init() {
    this._taskInput = document.getElementById('task-input');
    this._taskAdd = document.getElementById('task-add');
    this._taskSort = document.getElementById('task-sort');
    this._taskError = document.getElementById('task-error');
    this._taskList = document.getElementById('task-list');

    // Pre-populate sort select to 'default'
    if (this._taskSort) {
      this._taskSort.value = 'default';
    }

    // Add task on button click
    if (this._taskAdd) {
      this._taskAdd.addEventListener('click', () => {
        this.addTask(this._taskInput ? this._taskInput.value : '');
      });
    }

    // Also allow adding task by pressing Enter in the input
    if (this._taskInput) {
      this._taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.addTask(this._taskInput.value);
        }
      });
    }

    // Sort change
    if (this._taskSort) {
      this._taskSort.addEventListener('change', () => {
        this.setSort(this._taskSort.value);
      });
    }

    // Render persisted tasks
    this.render();
  }
};

/* ----------------------------------------------------------
   LinksController
   Manages the Quick Links widget: add, delete, and render link
   buttons. All mutations go through AppState and are persisted
   via Storage.save().
   ---------------------------------------------------------- */
const LinksController = {
  // --- Cached DOM references ---
  /** @type {HTMLInputElement|null} */
  _labelInput: null,
  /** @type {HTMLInputElement|null} */
  _urlInput: null,
  /** @type {HTMLButtonElement|null} */
  _addBtn: null,
  /** @type {HTMLSpanElement|null} */
  _errorSpan: null,
  /** @type {HTMLDivElement|null} */
  _linksList: null,

  /**
   * Pure function — returns true if and only if the given URL
   * begins with 'http://' or 'https://' (case-sensitive).
   * @param {string} url
   * @returns {boolean}
   */
  isValidUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  },

  /**
   * Validates and adds a new link.
   * - Trims both label and URL inputs.
   * - Rejects empty labels with an inline error message.
   * - Rejects URLs that don't start with http:// or https://.
   * - On success: pushes a new Link onto AppState.links, persists,
   *   re-renders, and clears both input fields.
   * @param {string} label - Raw value from the label input field.
   * @param {string} url   - Raw value from the URL input field.
   */
  addLink(label, url) {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();

    if (trimmedLabel.length === 0) {
      if (this._errorSpan) {
        this._errorSpan.textContent = 'Label cannot be empty.';
      }
      return;
    }

    if (!this.isValidUrl(trimmedUrl)) {
      if (this._errorSpan) {
        this._errorSpan.textContent = 'URL must start with http:// or https://';
      }
      return;
    }

    // Clear any previous error
    if (this._errorSpan) {
      this._errorSpan.textContent = '';
    }

    const newLink = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: trimmedLabel,
      url: trimmedUrl
    };

    AppState.links.push(newLink);
    Storage.save(AppState);
    this.render();

    // Clear the input fields
    if (this._labelInput) this._labelInput.value = '';
    if (this._urlInput) this._urlInput.value = '';
  },

  /**
   * Removes the link with the given id from AppState.links,
   * persists the change, and re-renders.
   * @param {string} id
   */
  deleteLink(id) {
    AppState.links = AppState.links.filter(link => link.id !== id);
    Storage.save(AppState);
    this.render();
  },

  /**
   * Rebuilds the #links-list container from AppState.links.
   * Each link is rendered as a .link-item div containing:
   *   - A .btn-primary button that opens the URL in a new tab
   *   - A small delete button (.btn-danger) to remove the link
   */
  render() {
    if (!this._linksList) return;

    // Clear existing content
    this._linksList.innerHTML = '';

    AppState.links.forEach(link => {
      const item = document.createElement('div');
      item.className = 'link-item';
      item.setAttribute('data-id', link.id);

      // --- Link launch button ---
      const linkBtn = document.createElement('button');
      linkBtn.className = 'btn-primary';
      linkBtn.textContent = link.label;
      linkBtn.setAttribute('aria-label', `Open ${link.label}`);
      linkBtn.addEventListener('click', () => {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      });

      // --- Delete button ---
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-danger';
      deleteBtn.textContent = '🗑';
      deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
      deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

      item.appendChild(linkBtn);
      item.appendChild(deleteBtn);
      this._linksList.appendChild(item);
    });
  },

  /**
   * One-time setup:
   *  - Caches DOM references for label input, URL input, add button,
   *    error span, and links list container
   *  - Attaches click listener on #link-add → addLink(label, url)
   *  - Calls render() to display any persisted links
   */
  init() {
    this._labelInput = document.getElementById('link-label');
    this._urlInput = document.getElementById('link-url');
    this._addBtn = document.getElementById('link-add');
    this._errorSpan = document.getElementById('link-error');
    this._linksList = document.getElementById('links-list');

    if (this._addBtn) {
      this._addBtn.addEventListener('click', () => {
        this.addLink(
          this._labelInput ? this._labelInput.value : '',
          this._urlInput ? this._urlInput.value : ''
        );
      });
    }

    this.render();
  }
};

/* ----------------------------------------------------------
   DOMContentLoaded — Startup Sequence
   1. Load persisted state (or defaults) into AppState.
   2. Apply theme immediately (before any other rendering).
   Additional controller init() calls will be added in later tasks.
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  // Step 1: Restore persisted state (must be first)
  AppState = Storage.load();

  // Step 2: Apply theme before any other rendering
  ThemeController.render();

  // Step 3: Initialise ThemeController (bind button + listener)
  ThemeController.init();

  // Step 4: Initialise GreetingController (clock, greeting, name input)
  GreetingController.init();

  // Step 5: Initialise TimerController (countdown timer, SVG ring, duration input)
  TimerController.init();

  // Step 6: Initialise TaskController (task list, add/edit/delete/sort)
  TaskController.init();

  // Step 7: Initialise LinksController (quick links, add/delete)
  LinksController.init();
});
