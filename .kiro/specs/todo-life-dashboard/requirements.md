# Requirements Document

## Introduction

The To-Do List Life Dashboard is a single-page web application built with HTML, CSS, and Vanilla JavaScript. It provides a personal productivity hub that combines a live clock/greeting, a Pomodoro focus timer, a task manager, and a quick-links launcher — all persisted in the browser's Local Storage with no backend server required. The app must work in modern browsers (Chrome, Firefox, Edge, Safari) and be delivered as a single CSS file and a single JavaScript file. The visual design follows the **Aurora** aesthetic — an elegant glassmorphism style with deep jewel-tone backgrounds, frosted-glass widget cards, and a purple-to-indigo accent gradient, available in both a "Pearl Aurora" light theme and a "Midnight Aurora" dark theme.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI section that displays the current time, date, and a personalised greeting message.
- **Focus_Timer**: The Pomodoro-style countdown timer widget.
- **Task_Manager**: The UI section that manages the user's to-do list.
- **Task**: A single to-do item with a title, completion status, and creation timestamp.
- **Quick_Links**: The UI section that stores and displays user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Theme**: The visual colour scheme of the Dashboard, either Light or Dark.
- **Pomodoro_Duration**: The configurable countdown length for the Focus_Timer, defaulting to 25 minutes.
- **User_Name**: The optional custom name entered by the user, displayed in the Greeting_Widget.
- **Aurora_Theme**: The visual design language used by the Dashboard, characterised by glassmorphism cards, a purple-to-indigo accent gradient, and a radial gradient mesh page background.
- **Pearl_Aurora**: The Light Theme variant of the Aurora_Theme, using a cool off-white page background (`#f0f0f7`) and a purple-to-indigo accent gradient.
- **Midnight_Aurora**: The Dark Theme variant of the Aurora_Theme, using a deep navy-black page background (`#0d0d1a`) and a soft violet-to-indigo accent gradient.

---

## Requirements

### Requirement 1: Live Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a personalised greeting when I open the Dashboard, so that I have immediate situational awareness and feel welcomed.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM:SS format, updated every second.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 14 July 2025").
3. WHEN the current hour is between 05:00 and 10:59 (inclusive), THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the current hour is between 11:00 and 16:59 (inclusive), THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the current hour is between 17:00 and 21:59 (inclusive), THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the current hour is between 22:00 and 04:59 (inclusive), THE Greeting_Widget SHALL display the greeting "Good Night".
7. WHERE a User_Name has been saved, THE Greeting_Widget SHALL append the User_Name to the greeting (e.g., "Good Morning, Alex").
8. WHERE no User_Name has been saved, THE Greeting_Widget SHALL display the greeting without a name suffix.

---

### Requirement 2: Custom Name Setting

**User Story:** As a user, I want to set my name so that the greeting feels personal.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field that allows the user to enter a User_Name of up to 50 characters.
2. WHEN the user submits a non-empty User_Name, THE Dashboard SHALL save the User_Name to Local_Storage.
3. WHEN the user submits an empty User_Name, THE Dashboard SHALL remove any previously saved User_Name from Local_Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL read the User_Name from Local_Storage and pre-populate the name input field with the stored value.
5. IF the stored User_Name exceeds 50 characters, THEN THE Dashboard SHALL truncate the displayed value to 50 characters.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a Pomodoro-style countdown timer so that I can work in focused intervals.

#### Acceptance Criteria

1. THE Focus_Timer SHALL display the remaining time in MM:SS format.
2. WHEN the Focus_Timer is in the stopped state, THE Focus_Timer SHALL display the full Pomodoro_Duration.
3. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down from the current displayed time at one-second intervals.
4. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop the countdown and reset the displayed time to the full Pomodoro_Duration.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and notify the user with a browser alert or audio cue.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control and enable the Stop and Reset controls.
8. WHILE the Focus_Timer is stopped or paused, THE Focus_Timer SHALL enable the Start control and disable the Stop control.

---

### Requirement 4: Configurable Pomodoro Duration

**User Story:** As a user, I want to change the timer duration so that I can adapt the Focus_Timer to my preferred work interval.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a numeric input that accepts a Pomodoro_Duration between 1 and 120 minutes (inclusive).
2. WHEN the user saves a valid Pomodoro_Duration, THE Dashboard SHALL persist the value to Local_Storage.
3. WHEN the Dashboard loads, THE Dashboard SHALL read the Pomodoro_Duration from Local_Storage and apply it as the Focus_Timer's starting value.
4. WHERE no Pomodoro_Duration has been saved, THE Dashboard SHALL default the Pomodoro_Duration to 25 minutes.
5. IF the user enters a Pomodoro_Duration outside the range 1–120, THEN THE Dashboard SHALL display an inline validation message and reject the value.
6. WHEN a new Pomodoro_Duration is saved while the Focus_Timer is stopped, THE Focus_Timer SHALL immediately update its display to reflect the new duration.

---

### Requirement 5: Task Manager — Adding Tasks

**User Story:** As a user, I want to add tasks to my to-do list so that I can track what I need to do.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a text input and an Add control for creating new Tasks.
2. WHEN the user submits a non-empty task title, THE Task_Manager SHALL create a new Task with a unique identifier, the trimmed title, a completion status of false, and the current timestamp.
3. WHEN the user submits a task title that, after trimming and case-insensitive comparison, matches an existing Task title, THE Task_Manager SHALL display an inline duplicate-warning message and SHALL NOT create a new Task.
4. WHEN the user submits an empty or whitespace-only task title, THE Task_Manager SHALL display an inline validation message and SHALL NOT create a new Task.
5. WHEN a new Task is created, THE Task_Manager SHALL persist the updated task list to Local_Storage.
6. WHEN the Dashboard loads, THE Task_Manager SHALL read and render all Tasks from Local_Storage.

---

### Requirement 6: Task Manager — Editing Tasks

**User Story:** As a user, I want to edit existing task titles so that I can correct or update them.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide an Edit control for each Task that places the task title into an editable state.
2. WHEN the user confirms an edit with a non-empty, non-duplicate title, THE Task_Manager SHALL update the Task's title and persist the change to Local_Storage.
3. WHEN the user confirms an edit with an empty or whitespace-only title, THE Task_Manager SHALL display an inline validation message and retain the original title.
4. WHEN the user confirms an edit with a title that, after trimming and case-insensitive comparison, matches a different existing Task's title, THE Task_Manager SHALL display an inline duplicate-warning message and retain the original title.
5. WHEN the user cancels an edit, THE Task_Manager SHALL discard the changes and restore the original title display.

---

### Requirement 7: Task Manager — Completing and Deleting Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can maintain an accurate list.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a checkbox or toggle control for each Task to mark it as complete or incomplete.
2. WHEN the user toggles a Task's completion control, THE Task_Manager SHALL update the Task's completion status and persist the change to Local_Storage.
3. WHILE a Task has a completion status of true, THE Task_Manager SHALL render the task title with a visual strikethrough style.
4. THE Task_Manager SHALL provide a Delete control for each Task.
5. WHEN the user activates the Delete control for a Task, THE Task_Manager SHALL remove the Task from the list and persist the updated list to Local_Storage.

---

### Requirement 8: Task Manager — Sorting Tasks

**User Story:** As a user, I want to sort my task list so that I can view tasks in a meaningful order.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a sort control with the following options: "Default (Date Added)", "A–Z", "Z–A", and "Completed Last".
2. WHEN the user selects a sort option, THE Task_Manager SHALL re-render the task list in the selected order without modifying the underlying stored data.
3. WHEN the sort option is "Default (Date Added)", THE Task_Manager SHALL render Tasks ordered by creation timestamp, oldest first.
4. WHEN the sort option is "A–Z", THE Task_Manager SHALL render Tasks ordered alphabetically by title, ascending, case-insensitively.
5. WHEN the sort option is "Z–A", THE Task_Manager SHALL render Tasks ordered alphabetically by title, descending, case-insensitively.
6. WHEN the sort option is "Completed Last", THE Task_Manager SHALL render incomplete Tasks before complete Tasks, with each group ordered by creation timestamp.
7. WHEN the Dashboard loads, THE Task_Manager SHALL apply the "Default (Date Added)" sort order.

---

### Requirement 9: Quick Links — Adding and Launching Links

**User Story:** As a user, I want to save favourite website shortcuts so that I can open them with a single click.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a label input and a URL input for creating new Links.
2. WHEN the user submits a Link with a non-empty label and a valid URL (beginning with `http://` or `https://`), THE Quick_Links SHALL create the Link and persist the updated link list to Local_Storage.
3. WHEN the user submits a Link with an empty label or an invalid URL, THE Quick_Links SHALL display an inline validation message and SHALL NOT create the Link.
4. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
5. WHEN the Dashboard loads, THE Quick_Links SHALL read and render all Links from Local_Storage.

---

### Requirement 10: Quick Links — Deleting Links

**User Story:** As a user, I want to remove quick links I no longer need so that my launcher stays tidy.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a Delete control for each Link.
2. WHEN the user activates the Delete control for a Link, THE Quick_Links SHALL remove the Link from the list and persist the updated list to Local_Storage.

---

### Requirement 11: Light/Dark Mode Toggle

**User Story:** As a user, I want to switch between light and dark colour schemes so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Theme toggle control that switches between Light and Dark modes.
2. WHEN the user activates the Theme toggle, THE Dashboard SHALL apply the selected Theme to all visible UI elements immediately.
3. WHEN the user activates the Theme toggle, THE Dashboard SHALL persist the selected Theme to Local_Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL read the Theme from Local_Storage and apply it before rendering content.
5. WHERE no Theme has been saved, THE Dashboard SHALL default to the Light Theme.

---

### Requirement 12: Responsive and Accessible UI

**User Story:** As a user, I want the Dashboard to be readable and usable on different screen sizes and with keyboard navigation, so that I can use it on any device.

#### Acceptance Criteria

1. THE Dashboard SHALL render without horizontal scrolling on viewport widths from 320px to 1920px.
2. THE Dashboard SHALL use a single CSS file located at `css/style.css` and a single JavaScript file located at `js/app.js`.
3. THE Dashboard SHALL load and become interactive within 3 seconds on a standard broadband connection with no external network requests.
4. THE Dashboard SHALL use font sizes no smaller than 14px for body text to maintain readability.
5. THE Dashboard SHALL provide sufficient colour contrast between text and background in both Light and Dark Themes, meeting WCAG 2.1 AA contrast ratio requirements (minimum 4.5:1 for normal text).
6. WHEN a user navigates the Dashboard using only a keyboard, THE Dashboard SHALL allow focus to reach all interactive controls in a logical tab order.
7. WHEN the viewport width is 1024px or greater, THE Dashboard SHALL arrange widget cards in a 2-column grid layout.
8. WHEN the viewport width is between 640px and 1023px (inclusive), THE Dashboard SHALL arrange widget cards in a 2-column grid with widgets stacked within each column.
9. WHEN the viewport width is less than 640px, THE Dashboard SHALL arrange widget cards in a single-column layout with each card spanning the full available width.

---

### Requirement 13: Aurora Visual Theme

**User Story:** As a user, I want the Dashboard to have an elegant, premium visual design so that using it feels polished and enjoyable.

#### Acceptance Criteria

1. THE Dashboard SHALL implement the Aurora visual theme using CSS custom properties for all colour tokens, defined on the `:root` selector and overridden under `[data-theme="dark"]`.
2. WHILE the Light Theme ("Pearl Aurora") is active, THE Dashboard SHALL apply the following colour tokens: `--bg-page: #f0f0f7`, `--bg-card: rgba(255,255,255,0.72)`, `--bg-card-border: rgba(255,255,255,0.9)`, `--text-primary: #1a1a2e`, `--text-secondary: #4a4a6a`, `--text-muted: #8888aa`, `--accent-start: #7c3aed`, `--accent-end: #4f46e5`, `--accent-solid: #6d28d9`, `--accent-hover: #5b21b6`, `--success: #059669`, `--danger: #dc2626`, `--warning: #d97706`, `--shadow-card: 0 8px 32px rgba(99,102,241,0.12)`, `--shadow-hover: 0 16px 48px rgba(99,102,241,0.22)`, and `--blur: 16px`.
3. WHILE the Dark Theme ("Midnight Aurora") is active, THE Dashboard SHALL apply the following colour tokens: `--bg-page: #0d0d1a`, `--bg-card: rgba(255,255,255,0.06)`, `--bg-card-border: rgba(255,255,255,0.12)`, `--text-primary: #f0f0ff`, `--text-secondary: #b0b0d0`, `--text-muted: #6060a0`, `--accent-start: #a78bfa`, `--accent-end: #818cf8`, `--accent-solid: #8b5cf6`, `--accent-hover: #7c3aed`, `--success: #34d399`, `--danger: #f87171`, `--warning: #fbbf24`, `--shadow-card: 0 8px 32px rgba(0,0,0,0.4)`, `--shadow-hover: 0 16px 48px rgba(139,92,246,0.3)`, and `--blur: 20px`.
4. THE Dashboard SHALL render widget cards with a glassmorphism effect, applying a semi-transparent background using `--bg-card` and a `backdrop-filter: blur(var(--blur))` to create a frosted-glass depth effect.
5. THE Dashboard SHALL render the page background using a radial gradient mesh layered over `--bg-page`, with two elliptical gradients positioned at 20% 50% and 80% 20% respectively, in both Light and Dark Themes.
6. THE Focus_Timer SHALL display a circular SVG progress ring surrounding the MM:SS digit display, where the ring stroke uses the accent gradient and animates `stroke-dashoffset` as the timer counts down.
7. THE Dashboard SHALL render primary action controls (Start, Add, Save) with a gradient fill from `--accent-start` to `--accent-end`, white text, and a subtle box-shadow.
8. THE Dashboard SHALL render widget cards with `border-radius: 20px`, a 1px border using `--bg-card-border`, and `box-shadow: var(--shadow-card)`.
9. WHEN the user hovers over a widget card, THE Dashboard SHALL apply `transform: translateY(-2px)` and `box-shadow: var(--shadow-hover)` to that card.
10. THE Greeting_Widget SHALL render the clock digits using `font-size: clamp(3rem, 8vw, 6rem)` and `font-weight: 300`.
