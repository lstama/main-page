/* fe-pattern — main site controller.
 * Handles: theme toggle, routing (gallery vs pattern detail), search,
 * live preview (iframe), copyable source tabs, and copy feedback.
 */

// ---- Pattern registry -----------------------------------------------------
// Each pattern is a standalone demo under patterns/<id>/{index.html,styles.css,app.js}.
// Add a folder there and an entry here to grow the gallery.
const PATTERNS = [
  {
    id: 'dark-mode-toggle',
    title: 'Dark Mode Toggle',
    desc: 'Theme switching with CSS variables, system preference detection, and persisted user choice.',
    tags: ['CSS', 'JS', 'a11y', 'theming'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Store colors in <span class="key">CSS custom properties</span> and switch the whole theme by changing one attribute on <code>&lt;html&gt;</code>.',
      'Read <span class="key">prefers-color-scheme</span> so a first visit matches the OS, then let the user override it.',
      'Persist the choice in <span class="key">localStorage</span> so it survives reloads.',
    ],
  },
  {
    id: 'toast',
    title: 'Toast Notifications',
    desc: 'Transient messages that appear, auto-dismiss, and stack. Accessible and dependency-free.',
    tags: ['JS', 'a11y', 'feedback'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">toast()</span> helper creates a <code>role="status"</code> region so screen readers announce the message.',
      'Each toast <span class="key">auto-dismisses</span> on a timer and can be dismissed manually via the button.',
      'Toasts <span class="key">stack</span> in a fixed host container with a slide-in animation.',
    ],
  },
  {
    id: 'modal',
    title: 'Modal Dialog',
    desc: 'An accessible dialog with focus trapping, ESC/backdrop to close, and focus restoration.',
    tags: ['JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Set <span class="key">role="dialog"</span> + <code>aria-modal</code> and move focus inside when it opens.',
      '<span class="key">Trap focus</span> inside the dialog so Tab never escapes to page content behind it.',
      'Close on <span class="key">Esc</span> or backdrop click, then return focus to the button that opened it.',
    ],
  },
  {
    id: 'form-validation',
    title: 'Form Validation',
    desc: 'Real-time validation on blur, inline errors, and accessible aria wiring.',
    tags: ['JS', 'a11y', 'forms'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Validate each field on <span class="key">blur</span> and all fields on submit.',
      'Mark invalid fields with <span class="key">aria-invalid</span> and link the message via <code>aria-describedby</code>.',
      'Use <code>role="alert"</code> on messages so screen readers announce validation feedback.',
    ],
  },
  {
    id: 'loading-skeleton',
    title: 'Loading Skeleton',
    desc: 'Placeholder shapes fill the layout while data loads, then swap in real content.',
    tags: ['JS', 'CSS', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Render <span class="key">skeleton</span> placeholders with the same layout as the real content, so the page does not jump.',
      'Add a <span class="key">shimmer</span> animation to signal activity.',
      'Swap skeletons for real data when the fetch resolves.',
    ],
  },
  {
    id: 'debounce-search',
    title: 'Debounce Search',
    desc: 'Waits until the user stops typing before firing — fewer requests, less spam.',
    tags: ['JS', 'performance', 'search'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      '<span class="key">debounce()</span> delays the callback until `wait` ms pass with no new input.',
      'Fire the search only after the pause, and show a live <code>role="status"</code> update.',
      'Highlight matches with <code>&lt;mark&gt;</code> so users see why something matched.',
    ],
  },
  {
    id: 'data-fetching',
    title: 'Data Fetching States',
    desc: 'Explicitly render loading, success, error, and empty — the four outcomes every fetch needs.',
    tags: ['JS', 'a11y', 'data'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A fetch has four outcomes — <span class="key">loading</span>, <span class="key">success</span>, <span class="key">error</span>, <span class="key">empty</span>. Render each explicitly instead of a blank screen.',
      'Use one <span class="key">render(state)</span> function as the single source of truth, so the UI can never show conflicting states.',
      'Show <span class="key">retry</span> on error, a distinct <span class="key">empty</span> message (not an error), and keep the button disabled while loading.',
    ],
  },
  {
    id: 'password-strength',
    title: 'Password Strength Meter',
    desc: 'Real-time feedback that measures a password against concrete, visible criteria.',
    tags: ['JS', 'a11y', 'forms'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Check the password against <span class="key">concrete criteria</span> (length, lowercase, uppercase, digit, special) and count how many are met.',
      'Map the count to a <span class="key">5-level meter</span> via a single <code>data-level</code> attribute, so the bar and the checklist stay in sync.',
      'Expose it as <span class="key">role="status"</span> with <code>aria-live</code> so screen readers announce strength changes.',
    ],
  },
  {
    id: 'accordion',
    title: 'Accessible Accordion',
    desc: 'Collapsible panels with WAI-ARIA states, keyboard support, and single-expand behavior.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each header is a real <code>&lt;button&gt;</code> with <span class="key">aria-expanded</span> (open/closed) and <span class="key">aria-controls</span> pointing at its panel id.',
      'Panels are hidden with the <span class="key">hidden</span> attribute, so a collapsed panel is removed from the accessibility tree and the tab order.',
      'Only one panel opens at a time: clicking a header closes the others. Tab moves between headers — they are the only tab stops in the group.',
    ],
  },
  {
    id: 'dropdown-menu',
    title: 'Dropdown Menu',
    desc: 'WAI-ARIA menu pattern: arrow keys, type-ahead, Escape, and keyboard/mouse focus management.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The trigger is a <code>&lt;button&gt;</code> with <span class="key">aria-haspopup="menu"</span>, <span class="key">aria-expanded</span>, and <span class="key">aria-controls</span>; items live in a <span class="key">role="menu"</span> list.',
      'Keyboard: ArrowUp/Down move (wrapping), Home/End jump, Escape closes and returns focus to the trigger, Tab closes, and typing jumps to the first matching item.',
      'Focus: opened by keyboard it moves to the first item; opened by mouse it stays on the trigger. Closed items are <span class="key">hidden</span>, leaving the a11y tree and tab order.',
    ],
  },
  {
    id: 'carousel',
    title: 'Accessible Carousel',
    desc: 'WAI-ARIA carousel with keyboard, touch swipe, and autoplay with a pause control.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The region is <span class="key">aria-roledescription="carousel"</span>; each slide is <span class="key">aria-roledescription="slide"</span>, and inactive slides are <span class="key">aria-hidden</span> so screen readers announce only the current one.',
      'Navigation funnels through one <span class="key">goTo()</span>: prev/next buttons, indicator dots, keyboard <span class="key">ArrowLeft/Right</span> (Home/End), and horizontal touch swipe.',
      'Autoplay pauses on hover, when the tab is hidden, and via a <span class="key">pause/play</span> toggle (aria-pressed) — required so auto-advancing content is user-controllable.',
    ],
  },
  {
    id: 'data-table',
    title: 'Responsive Data Table',
    desc: 'Grid on desktop, cards on mobile, with sortable columns — no data duplication.',
    tags: ['HTML', 'CSS', 'JS', 'responsive', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'On desktop it is a real <code>&lt;table&gt;</code>; below the breakpoint CSS reflows each <code>&lt;tr&gt;</code> into a card and each <code>&lt;td&gt;</code> into a label/value pair using <span class="key">data-label</span>.',
      'The collapse is <span class="key">pure CSS</span> — no JS needed to go responsive — so the table works even with scripting disabled.',
      'Clicking a <span class="key">sortable</span> header reorders the existing rows in place (no data duplication) and updates <span class="key">aria-sort</span> + the sort arrow.',
    ],
  },
  {
    id: 'off-canvas-nav',
    title: 'Off-Canvas Navigation',
    desc: 'Hamburger + overlay on mobile, persistent drawer on desktop — with focus trap and ESC to close.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'navigation'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Responsive layout is <span class="key">pure CSS</span>: below 768px a hamburger opens the drawer over a backdrop; at/above 768px the drawer is persistent and content flows beside it (no toggle, no overlay).',
      'The mobile drawer is <span class="key">modal</span>: <span class="key">aria-hidden</span> is the single source of truth for open state, Tab is trapped inside, Escape closes, and focus returns to the toggle.',
      'The toggle uses <span class="key">aria-controls</span> + <span class="key">aria-expanded</span>; the skip link and focus restoration keep keyboard/screen-reader users oriented.',
    ],
  },
  {
    id: 'star-rating',
    title: 'Star Rating',
    desc: 'Mouse drag or tap to rate — native radio group for full keyboard + screen reader support.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'forms'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The control is a <span class="key">native radio group</span>: keyboard (arrow keys), focus ring, and screen readers work with zero JS. JS progressively enhances it.',
      'Hover previews stars up to the hovered star without committing; mouse drag (brush) and touch tap/drag commit by checking the matching radio.',
      'The checked radio is the single source of truth — JS only mirrors it into <span class="key">.on</span> star classes and updates the <span class="key">role="status"</span> result text.',
    ],
  },
  {
    id: 'image-lightbox',
    title: 'Image Lightbox',
    desc: 'Click to open, arrow keys / swipe to navigate, ESC or backdrop to close — modal with focus trap.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'media'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The viewer is a <span class="key">role="dialog"</span> + <span class="key">aria-modal</span> overlay. On open it traps Tab focus inside, locks body scroll, and restores focus to the clicked thumbnail on close.',
      'Navigation funnels through one render(): prev/next buttons, keyboard <span class="key">ArrowLeft/Right</span> (Esc closes), and horizontal touch swipe (50px threshold).',
      'The backdrop (click outside the image) closes; <span class="key">aria-hidden</span> + <span class="key">hidden</span> gate the closed state. Images are inline data-URI SVGs, so the demo is self-contained.',
    ],
  },
  {
    id: 'file-upload',
    title: 'File Upload with Preview',
    desc: 'Drag-drop or pick files; image thumbnails + file info, remove before submit — native input for a11y.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'forms'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The native <code>&lt;input type="file"&gt;</code> is the a11y backbone — visually hidden but focusable, so mobile tap, keyboard (Enter/Space on the drop zone), and screen readers all work. The drop zone is a <span class="key">role="button"</span> that opens the picker.',
      'A <span class="key">files</span> array is the single source of truth; <span class="key">render()</span> paints image thumbnails or file info + size, and each row has a remove button.',
      'Drag-drop adds visual feedback (drag-over state). A <span class="key">role="status"</span> aria-live region announces what was selected; the submit button is disabled until at least one file is chosen.',
    ],
  },

  {
    id: 'sticky-navbar',
    title: 'Responsive Sticky Navbar',
    desc: 'Sticks to the top; collapses to a hamburger on mobile with keyboard + focus support.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'nav'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="navigation"</span> header is <span class="key">position: sticky</span> so it stays pinned while scrolling. On mobile the links collapse into a real <span class="key">&lt;button&gt;</span> hamburger with <span class="key">aria-controls</span>/<span class="key">aria-expanded</span> and a dynamic Open/Close label.',
      'Keyboard: <span class="key">Escape</span> closes the menu, <span class="key">ArrowUp/Down</span> moves focus between links while open, and focus is restored to the hamburger on close.',
      'Progressive enhancement: the menu slides in over a dimmed backdrop on mobile, closes on link tap, and the navbar hides on scroll-down then reappears on scroll-up.',
    ],
  },

  {
    id: 'pagination',
    title: 'Pagination',
    desc: 'Page buttons with prev/next; tap on mobile, keyboard (arrows/Home/End) on PC.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'nav'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="navigation"</span> aria-labeled region wraps real <span class="key">&lt;button&gt;</span> page controls. The active page carries <span class="key">aria-current="page"</span>; prev/next have descriptive aria-labels and disable at the ends.',
      'A <span class="key">role="status"</span> aria-live region announces "Page X of Y — Showing a-b of N". Page numbers collapse with ellipsis when there are many pages.',
      'Keyboard: Tab moves between buttons, ArrowLeft/Right step a page, Home/End jump to first/last. Mouse/touch: click/tap any control. Items re-render from a single source-of-truth array on each page change.',
    ],
  },

  {
    id: 'toggle-switch',
    title: 'Toggle Switch',
    desc: 'A checkbox styled as a switch; tap/click or keyboard (Space), screen-reader friendly.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The control is a <span class="key">native &lt;input type="checkbox"&gt;</span> — visually hidden but focusable, so keyboard (Space to toggle), focus ring, and screen readers all work with <span class="key">zero JS</span>. <span class="key">role="switch"</span> tells assistive tech it is an on/off switch.',
      'The visual switch (track + thumb) is a sibling of the input inside a <span class="key">&lt;label&gt;</span>, so tapping/clicking the thumb toggles the hidden checkbox. CSS drives the thumb slide from the checkbox state (:checked).',
      'Progressive enhancement only: a <span class="key">role="status"</span> aria-live region announces each switch state on change. The core interaction never depends on JS.',
    ],
  },

  {
    id: 'count-up-counter',
    title: 'Count-up Counter',
    desc: 'Numbers animate 0→target when scrolled into view; responsive grid, screen-reader friendly.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'animation'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each <span class="key">.stat-num</span> carries <span class="key">data-target</span> (and optional <span class="key">data-suffix</span>). Counting starts when the element scrolls into view via <span class="key">IntersectionObserver</span>, so mobile users trigger it by scrolling and off-screen numbers stay at 0.',
      'Animation uses <span class="key">requestAnimationFrame</span> with an easeOutCubic curve over ~1.2s. <span class="key">prefers-reduced-motion</span> is respected: if set, the counter jumps straight to its target.',
      'Accessibility: only the <span class="key">final</span> value is announced via a <span class="key">role="status"</span> aria-live region — intermediate frames are NOT announced, so screen-reader users are not flooded with every number. Gallery uses a responsive grid (2 cols → 4 cols).',
    ],
  },

  {
    id: 'search-autocomplete',
    title: 'Search Autocomplete',
    desc: 'Type-ahead combobox; keyboard navigate + tap to select, screen-reader friendly.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The input is <span class="key">role="combobox"</span> with <span class="key">aria-autocomplete="list"</span> and <span class="key">aria-controls</span> pointing at the <span class="key">role="listbox"</span>; each item is <span class="key">role="option"</span> with <span class="key">aria-selected</span>.',
      'Keyboard (PC): type to filter, <span class="key">ArrowDown/Up</span> move the active highlight (wrapping), <span class="key">Enter</span> selects, <span class="key">Escape</span> closes and refocuses the input. Mouse/touch: click/tap an option to select.',
      'Accessibility: a <span class="key">role="status"</span> aria-live region announces the result count (not the spoken list) to avoid flooding screen-reader users. Highlighted chars are wrapped in <span class="key">.match</span>; results filter case-insensitively.',
    ],
  },

  {
    id: 'breadcrumb-trail',
    title: 'Breadcrumb Trail',
    desc: 'Location-in-hierarchy nav; current page marked; collapses to ellipsis on mobile.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'nav'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="navigation"</span> with <span class="key">aria-label="Breadcrumb"</span> wraps an <span class="key">&lt;ol&gt;</span>. Each step is a <span class="key">&lt;li&gt;&lt;a&gt;</span>; the current page is the last step with <span class="key">aria-current="page"</span>.',
      'Separators are real characters ("/"), not decorative CSS, so screen readers announce them correctly. The trail is built from a path array, so it works for any depth.',
      'Responsive (cross-device): on narrow screens (≤480px) with more than 3 steps, the middle steps collapse behind an <span class="key">…</span> toggle so the trail stays compact on mobile. Expanding reveals all steps.',
    ],
  },

  {
    id: 'progress-stepper',
    title: 'Progress Stepper',
    desc: 'Multi-step flow indicator; horizontal on desktop, vertical stack on mobile.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'nav'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="navigation"</span> with <span class="key">aria-label="Checkout progress"</span> wraps an <span class="key">&lt;ol&gt;</span>. Each step is a focusable <span class="key">&lt;li&gt;</span>; the active step carries <span class="key">aria-current="step"</span>, completed steps are <span class="key">role="button"</span>, upcoming steps are <span class="key">aria-disabled</span>.',
      'Status is derived from the current index: everything before it is completed (✓), the current one is active, and the rest are upcoming. A <span class="key">role="status"</span> aria-live region announces the current step.',
      'Cross-device: horizontal on desktop, vertical stack on narrow screens (≤600px). Clicking/tapping a completed step moves the current position back to it, so users can edit a previous step — works with keyboard (Enter/Space) and touch.',
    ],
  },

  {
    id: 'image-gallery-zoom',
    title: 'Image Gallery with Zoom',
    desc: 'Thumbnail grid + lightbox; navigate, zoom (+/-/scroll/double-tap), keyboard + touch.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'media'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A thumbnail grid opens a <span class="key">role="dialog"</span> <span class="key">aria-modal="true"</span> viewer. Keyboard: <span class="key">ArrowLeft/Right</span> navigate, <span class="key">Esc</span> closes, <span class="key">+/−</span> (or scroll wheel) zoom, <span class="key">Home/End</span> jump to first/last. Focus is trapped inside and restored to the opening thumbnail on close.',
      'Zoom: +/- buttons, scroll wheel on PC, and double-tap on mobile to toggle. A live counter + <span class="key">role="status"</span> announce the current image and zoom level.',
      'Images carry descriptive <span class="key">alt</span> text. The backdrop click closes; background scroll is locked while open. Fully self-contained (inline data-URI SVGs).',
    ],
  },

  {
    id: 'swatch-picker',
    title: 'Swatch Picker',
    desc: 'Color/size swatches backed by native radio group; full keyboard + touch support.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Accessibility backbone: a native <span class="key">&lt;input type="radio"&gt;</span> group — keyboard works for free (arrow keys move, Space selects, screen readers announce state). Each radio is wrapped in a <span class="key">&lt;label&gt;</span>, so tapping/clicking a swatch selects it.',
      'Structure: <span class="key">role="radiogroup"</span> + aria-label on the group; the fieldset legend shows the current value. The check mark / selected style is driven purely by CSS (<span class="key">:checked</span>).',
      'Progressive enhancement only: on change, the legend value and a <span class="key">role="status"</span> aria-live region update. The core selection never depends on JS. Works on PC and mobile.',
    ],
  },

  {
    id: 'cookie-consent',
    title: 'Cookie Consent Banner',
    desc: 'Dialog-style consent bar; focus trap, focus restore, persists choice, keyboard + touch.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'overlay'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The banner is a <span class="key">role="dialog"</span> <span class="key">aria-modal="true"</span> with <span class="key">aria-labelledby</span>. On open, focus moves into the banner and is trapped (Tab/Shift+Tab wrap within it); <span class="key">Esc</span> returns focus to the opener.',
      'On close, focus is restored to the element that opened the banner, and a <span class="key">role="status"</span> aria-live region announces the outcome (Accepted / Rejected).',
      'The choice is persisted in <span class="key">localStorage</span> so it survives reloads; the banner only shows when no choice has been made. Responsive: buttons stack on narrow screens.',
    ],
  },

  {
    id: 'back-to-top',
    title: 'Back to Top Button',
    desc: 'Scroll-triggered floating button; smooth scroll to top; keyboard + touch.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'nav'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A native <span class="key">&lt;button&gt;</span> = keyboard + screen reader support for free, with <span class="key">aria-label="Back to top"</span>. It is hidden until the user scrolls past a threshold, then fades in.',
      'On click/tap it <span class="key">window.scrollTo({ top: 0, behavior: "smooth" })</span>. A passive scroll listener toggles the <span class="key">.is-visible</span> class (opacity + transform transition); the button is hidden again when back at the top.',
      'Responsive pure-CSS: positioned fixed bottom-right, slightly smaller on narrow screens. No framework, no build step.',
    ],
  },

  {
    id: 'pricing-table',
    title: 'Pricing Table',
    desc: 'Responsive pricing cards; featured plan highlighted; stacks on mobile.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'layout'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">CSS grid</span> with <span class="key">grid-template-columns: repeat(3, 1fr)</span> expands to a single column at ≤800px via a media query. Each <span class="key">&lt;article&gt;</span> is a plan card with name, price, feature list, and CTA button.',
      'The featured plan is highlighted with a border, shadow, and a <span class="key">.plan-badge</span> ("Most popular"). Buttons have visible focus rings for keyboard users.',
      'Progressive enhancement only: clicking a plan button announces the selection in a <span class="key">role="status"</span> aria-live region. The responsive layout never depends on JS.',
    ],
  },

  {
    id: 'timeline',
    title: 'Timeline',
    desc: 'Chronological event list; vertical spine with dots; filter + select via progressive enhancement.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'layout'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A semantic <span class="key">&lt;section&gt;</span> with <span class="key">&lt;article&gt;</span> children, each holding a <span class="key">&lt;time datetime&gt;</span>, an <span class="key">&lt;h2&gt;</span> title, and a description. A <span class="key">.timeline::before</span> draws the vertical spine; each <span class="key">.event::before</span> draws a dot.',
      'Responsive layout is pure CSS: single column with the spine on the left at all sizes; slightly tighter padding at ≤480px. No framework, no build step.',
      'Progressive enhancement only: an optional <span class="key">#timeline-filter</span> input filters events by text (announces count in a <span class="key">role="status"</span> region), and clicking/activating an event marks it selected and announces the title + date. Keyboard (Enter/Space) and touch both work.',
    ],
  },

  {
    id: 'inline-editing',
    title: 'Inline Editing',
    desc: 'Editable content with a formatting toolbar; bold/italic/underline; saves to localStorage.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">contenteditable</span> region with role="textbox" aria-multiline="true", wrapped in a toolbar of <span class="key">document.execCommand</span> buttons (bold, italic, underline, list, undo, redo). Each button tracks its state via <span class="key">aria-pressed</span> using document.queryCommandState.',
      'Keyboard shortcuts: Ctrl/Cmd+B/I/U trigger bold/italic/underline. The toolbar updates on selectionchange so pressed state stays accurate. A placeholder shows when empty via CSS ::before on :empty.',
      'Progressive enhancement only: content is saved to localStorage on every input and restored on load. A role="status" aria-live region announces save/reset/apply actions. Reset button clears content with a confirm. Works with mouse, keyboard, and touch.',
    ],
  },

  {
    id: 'kanban-board',
    title: 'Kanban Board',
    desc: 'Drag-and-drop columns with cards; mouse, touch, and keyboard support; saves to localStorage.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'layout'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">.board</span> of <span class="key">.column</span> sections (To Do, In Progress, Done). Each column has a title, a live card count, and a <span class="key">.dropzone</span> holding <span class="key">.card</span> items. Cards are focusable buttons (tabindex=0, role=button) with aria-labels.',
      'Three input methods share one moveCard() function: HTML5 drag-and-drop (mouse + keyboard), touch drag via touchstart/move/end with a floating clone, and keyboard arrow keys (Left/Right move the focused card between columns and refocus it).',
      'Progressive enhancement only: state lives in a plain JS object persisted to <span class="key">localStorage</span>. Moving a card updates counts, saves state, re-renders, and announces the destination in a role="status" aria-live region. Reset restores defaults. Responsive: columns stack vertically at ≤720px.',
    ],
  },

  {
    id: 'tabs',
    title: 'Tabs',
    desc: 'Accessible tabbed interface; arrow keys, Home/End; roving tabindex; ARIA tabs pattern.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'navigation'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="tablist"</span> containing <span class="key">role="tab"</span> buttons, each linked to a <span class="key">role="tabpanel"</span> via aria-controls/aria-labelledby. Follows the WAI-ARIA authoring practices for tabs. Active tab has aria-selected=true; inactive tabs get tabindex=-1 (roving tabindex) so only one tab is in the tab order.',
      'Keyboard: arrow keys (Left/Right for horizontal, Up/Down as alternative) move focus with wrap-around; Home/End jump to first/last. The active panel is focusable (tabindex=0) and its content is announced. Hidden panels use the hidden attribute.',
      'Progressive enhancement only: clicking a tab activates it and moves focus. A role="status" aria-live region announces tab changes. Responsive: tabs stack as full-width rows at ≤480px. Works with mouse, keyboard, and touch.',
    ],
  },

  {
    id: 'date-picker',
    title: 'Date Picker',
    desc: 'Calendar popup with keyboard/touch support; month nav; today/selection; YYYY-MM-DD output.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A readonly text input with a trigger button (aria-haspopup=dialog, aria-expanded) that opens a <span class="key">role="dialog"</span> calendar. The calendar has prev/next month buttons, a month/year title, a Sunday-start weekday row, and a 6-row × 7-day grid of <span class="key">role="gridcell"</span> buttons. Other-month days are dimmed and aria-disabled; today is highlighted; the selected day gets aria-selected.',
      'Keyboard: arrow keys move focus one day (Left/Right) or one week (Up/Down) with auto-scroll; Home/End jump to first/last visible day; PageUp/PageDown shift the month with Shift held; Enter/Space selects the focused day; Esc or Tab closes; outside-click closes. Navigation auto-advances the displayed month when focus crosses into it.',
      'Progressive enhancement only: selecting a date fills the input as YYYY-MM-DD, updates a role="status" aria-live region, and closes the calendar. Today and Selected buttons work; the input is readonly so the calendar is the single source of truth. Responsive: calendar takes full width at ≤400px.',
    ],
  },

  {
    id: 'date-range-picker',
    title: 'Date Range Picker',
    desc: 'Pick a start/end range by click or drag; keyboard nav; prev/next month; today/clear; YYYY-MM-DD – YYYY-MM-DD output.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A readonly input with a calendar trigger (aria-haspopup=dialog, aria-expanded) opens a role="dialog" calendar: prev/next month buttons, a capitalized month/year title, a Sunday-start weekday row, and a 42-cell (6×7) grid of role="gridcell" buttons. Other-month cells are aria-disabled; today gets is-today; the selected endpoints get aria-selected.',
      'Two ways to set a range: click a start then an end (clicking before the start extends it backward), or press-and-drag across days. Drag uses pointerdown to seed a preview, pointerover to grow the highlighted span, and a document-level pointerup to commit; earlier/later normalize reverse drags so the range is always start≤end.',
      'Keyboard: arrows move one day (L/R) or one week (U/D), Home/End jump to the Sunday/Saturday of the focused week, PageUp/PageDown shift a week, Enter/Space sets the range, T jumps to today, Esc closes. Selection fills the input as YYYY-MM-DD – YYYY-MM-DD, updates a role="status" aria-live region, and the Clear button resets while keeping the dialog open.',
    ],
  },

  {
    id: 'range-slider',
    title: 'Range Slider',
    desc: 'Custom-styled range input; mouse/touch drag; keyboard arrows/Home/End; live value output.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A native <span class="key">&lt;input type="range"&gt;</span> (min/max/step) with the default appearance stripped (-webkit-appearance/-moz-appearance:none) and restyled track + thumb. The thumb is a 20px circle with a focus ring; the track uses border-radius for rounded ends. The native control already provides mouse drag, touch drag, and keyboard (arrows/Home/End) support.',
      'An <span class="key">&lt;output&gt;</span> sits beside each slider and mirrors its value; a role="status" aria-live region shows a combined reading of all sliders. Each input is labelled (aria-labelledby) with a help text (aria-describedby) describing keyboard usage.',
      'Progressive enhancement only: the input event updates the outputs and combined reading. Works with mouse, touch, and keyboard. Responsive: gap and output width shrink at ≤400px.',
    ],
  },

  {
    id: 'color-picker',
    title: 'Color Picker',
    desc: 'Preset swatches + custom color input; hex output; keyboard nav; dialog pattern.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A trigger button (aria-haspopup=dialog, aria-expanded) opens a <span class="key">role="dialog"</span> picker. Inside: a grid of preset <span class="key">.cp-swatch</span> buttons (role=group, aria-label per color, aria-selected on the active one) and a native <span class="key">&lt;input type="color"&gt;</span> for arbitrary colors with an "Use this color" button.',
      'Keyboard: arrow keys (Left/Right or Up/Down) move between swatches with wrap-around; Home/End jump to first/last; Enter/Space selects the focused swatch; Esc or Tab closes; outside-click closes. Selecting updates the swatch, hex label, readonly display, native input, and preview.',
      'Progressive enhancement only: the native color input updates live on input; the apply button commits it. A role="status" aria-live region announces changes. Responsive: swatch grid reduces columns at ≤400px; trigger stacks vertically.',
    ],
  },

  {
    id: 'mega-menu',
    title: 'Mega Menu',
    desc: 'Multi-column navigation popup; keyboard nav; focus management; responsive stack.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'navigation'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="menu"</span> panel opened by a trigger button (aria-haspopup=menu, aria-expanded, aria-controls). The panel is a CSS grid of <span class="key">.mega-col</span> groups, each with a heading and <span class="key">role="menuitem"</span> links, plus a CTA column. Items are wrapped in <span class="key">&lt;a&gt;</span> for real navigation.',
      'Keyboard: arrow keys (Up/Down) move focus between items with wrap-around; Home/End jump to first/last; Esc or Tab closes and returns focus to the trigger; Enter/Space on the trigger opens. Focus management: opening focuses the first item; closing refocuses the trigger.',
      'Progressive enhancement only: outside-click closes. Responsive: panel is centered absolute on desktop (720px grid, 3 columns) and becomes a full-width fixed panel with stacked columns and scroll at ≤640px.',
    ],
  },

  {
    id: 'sortable-list',
    title: 'Sortable List',
    desc: 'Reorder items by drag (mouse/touch) or keyboard; localStorage; aria-live.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">role="list"</span> of <span class="key">role="listitem"</span> rows. Each row has a drag <span class="key">grip</span> handle, a label, and a remove button. The array is the single source of truth — <span class="key">render()</span> rebuilds the DOM from it on every reorder.',
      'Pointer events drive the drag: <span class="key">pointerdown</span> starts it (works for mouse AND touch uniformly), <span class="key">pointermove</span> uses elementFromPoint to find the target row and reorders the array, and <span class="key">pointerup</span> commits. <span class="key">touch-action:none</span> on the list stops page scroll while dragging on mobile.',
      'Keyboard: <span class="key">ArrowUp/Down</span> move the focused item, <span class="key">Home/End</span> jump to the ends — all re-render and restore focus. A <span class="key">role="status"</span> aria-live region announces each move. Order persists in <span class="key">localStorage</span>. Responsive: tighter spacing at ≤480px.',
    ],
  },

  {
    id: 'multi-step-form',
    title: 'Multi-step Form',
    desc: 'Guided form with stepper, per-step validation, focus move, aria-current, save.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'form'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A form split into <span class="key">steps</span> (Account → Profile → Review → Done). A progress bar and a numbered <span class="key">stepper</span> show where you are; the active step gets <span class="key">aria-current="step"</span> and a check mark once completed.',
      'Each step has its own <span class="key">validate()</span>. Next validates the current step, focuses the first invalid field, and refuses to advance; Back never validates. On advance, focus moves to the new step heading and an aria-live region announces the step.',
      'The Review step renders a summary from the entered values. Progress is saved to <span class="key">localStorage</span> and restored on reload. Responsive: the stepper stacks vertically at ≤480px and the action buttons become full-width.',
    ],
  },
  {
    id: 'infinite-scroll',
    title: 'Infinite Scroll Feed',
    desc: 'Lazy-loads chunks into a fixed pool of recycled card nodes; like, reset, end-of-feed.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'performance'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Posts load in <span class="key">chunks</span> as the user scrolls. An <span class="key">IntersectionObserver</span> watches a sentinel below the feed; when it enters view it loads the next chunk. A fallback timer also fires the first chunk in case the sentinel is off-screen at load.',
      'The feed keeps a <span class="key">fixed pool</span> of card nodes. Each new post reuses the oldest node in place (its content replaced, not a new element), so the DOM never grows unbounded — the classic virtualization trick for long feeds.',
      'Each card has a working like toggle (aria-pressed flips, heart fills), relative timestamps, and optional media. The footer shows a running count; Reset clears state and re-observes. The feed stops after a set total and shows an end message.',
    ],
  },
  {
    id: 'command-palette',
    title: 'Command Palette',
    desc: 'Fuzzy ⌘K menu with keyboard nav, live filtering, highlighted matches, and run-on-Enter.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'keyboard'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Open with <span class="key">⌘K</span> / <span class="key">Ctrl+K</span> (a document-level keydown handler) or the button. A frosted overlay with a dialog (aria-modal) focuses the search input; Esc or a backdrop click closes and returns focus to the trigger.',
      'Commands are ranked with a <span class="key">fuzzy</span> matcher over title and subtitle; matching characters are wrapped in <span class="key">&lt;mark&gt;</span>. Results are grouped by category and sorted by match quality.',
      'Navigation uses a roving selection (ArrowUp/Down wrap, Home/End jump); Enter runs the highlighted command and logs it to the live region. The command list stays in a fixed pool so typing never rebuilds the DOM.',
    ],
  },
  {
    id: 'ai-prompt-composer',
    title: 'AI Prompt Composer',
    desc: 'A chat-style prompt box with auto-resizing textarea, attach toggles, char counter, and Enter-to-send with a loading state.',
    tags: ['HTML', 'CSS', 'JS', 'chat', 'ai', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The <span class="key">textarea</span> auto-resizes as you type (capped in height) and a live <span class="key">counter</span> shows characters vs. a 2000 max, turning amber near the limit and red past it.',
      'Keyboard: <span class="key">Enter</span> sends, <span class="key">Shift+Enter</span> inserts a newline. Attach buttons toggle an active state; the send button disables and shows a spinner while a simulated reply streams in.',
      'The thread is a <span class="key">role="log"</span> live region so new user/assistant messages are announced; the reply shows a typing indicator before resolving.',
    ],
  },
  {
    id: 'wishlist-heart',
    title: 'Wishlist Heart',
    desc: 'A favorite toggle that fills with a pop animation, updates aria-pressed, and reflects state in a hint.',
    tags: ['HTML', 'CSS', 'JS', 'animation', 'accessibility', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">heart</span> button overlays a product card. The outline stays visible; a matching heart shape <span class="key">.heart-fill</span> scales up from 0 when liked.',
      'Clicking toggles <span class="key">aria-pressed</span> (true/false), plays a one-shot <span class="key">pop</span> scale animation, and swaps the hint text between "add to wishlist" and "added".',
      'The fill animation restarts on each add by removing and re-adding the <span class="key">pop</span> class after a reflow.',
    ],
  },
  {
    id: 'rich-text-toolbar',
    title: 'Rich Text Toolbar',
    desc: 'A floating toolbar that appears over a text selection and applies bold/italic/underline/lists/links.',
    tags: ['HTML', 'CSS', 'JS', 'contenteditable', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">contenteditable</span> region listens for <span class="key">selectionchange</span>; when the selection is inside it, the toolbar positions itself over the selection rect (clamped to the viewport).',
      'Formatting is applied with the browser\'s native <span class="key">execCommand</span> (bold, italic, underline, lists, createLink). Buttons reflect their on/off state via <span class="key">queryCommandState</span>.',
      'The toolbar fades out after each action and when focus leaves the editor. Ctrl/Cmd+B/I/U shortcuts are supported.',
    ],
  },
  {
    id: 'emoji-picker',
    title: 'Emoji Picker',
    category: 'Input',
    desc: 'A text field with a searchable emoji grid that inserts the chosen emoji at the cursor.',
    tags: ['HTML', 'CSS', 'JS', 'emoji', 'dialog', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">toggle</span> button opens a <span class="key">role="dialog"</span> picker with a grid of emoji buttons; the button reflects state via <span class="key">aria-expanded</span>.',
      'Selecting an emoji inserts it at the input\'s cursor (<span class="key">selectionStart/End</span>) without clobbering any selected text, then closes the picker and returns focus to the field.',
      'Clicking outside the field or pressing <span class="key">Esc</span> closes the picker. The grid re-renders on open so the current selection state is fresh.',
    ],
  },
  {
    id: 'resizable-split-view',
    title: 'Resizable Split View',
    category: 'Layout',
    desc: 'Two panels separated by a draggable handle that resizes each as a clamped percentage of the container.',
    tags: ['HTML', 'CSS', 'JS', 'layout', 'drag', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">.handle</span> separator sits between two flex panels. A <span class="key">mousedown</span> on the handle starts a drag; <span class="key">mousemove</span>/<span class="key">mouseup</span> on <span class="key">document</span> track and end the drag.',
      'Each drag updates the panels\' <span class="key">flex-basis</span> as a percentage of the container width, clamped between 20% and 80% so neither panel collapses.',
      'The handle is a <span class="key">role="separator"</span> with a focus ring and arrow-key support (5% steps) for keyboard users, and a live readout reports both percentages.',
    ],
  },
  {
    id: 'calendar-grid',
    title: 'Calendar Grid',
    category: 'Date & Time',
    desc: 'A monthly calendar with month navigation, a day-of-week grid, out-of-month dimming, a today marker, and day selection.',
    tags: ['HTML', 'CSS', 'JS', 'calendar', 'date', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A <span class="key">.cal-title</span> shows the current month/year with <span class="key">prev</span>/<span class="key">next</span> buttons that shift the view by a month using a <span class="key">viewYear/viewMonth</span> state object.',
      'The grid is built from the Sunday before the 1st across six weeks (42 cells); days outside the month get <span class="key">other-month</span>, the current day gets <span class="key">today</span>, and the active day gets <span class="key">selected</span>.',
      'Clicking a day selects it; hovering updates the live readout as a preview. Dates are formatted as <span class="key">YYYY-MM-DD</span> for downstream use.',
    ],
  },
  {
    id: 'contribution-heatmap',
    title: 'Contribution Heat Map',
    category: 'Data Viz',
    desc: 'A GitHub-style year of activity: a weeks-by-days grid with four activity levels and a hover tooltip.',
    tags: ['HTML', 'CSS', 'JS', 'data-viz', 'heatmap', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Data is generated for ~53 weeks ending today, then rendered into a grid with <span class="key">grid-auto-flow: column</span> so cells fill down each week column. Each cell carries a <span class="key">data-level</span> (0-4) that maps to a background shade.',
      'Hover shows a <span class="key">role="tooltip"</span> positioned above the cell (clamped to the container) with the formatted date and count; the same info is in <span class="key">aria-label</span> for screen readers.',
      'A visually-hidden legend at the bottom maps the five shades from "Less" to "More" so the color encoding is explainable without the data.',
    ],
  },
  {
    id: 'view-toggle',
    title: 'View Toggle',
    category: 'Layout',
    desc: 'A segmented control that switches a card board between grid and list layouts, persisted to localStorage.',
    tags: ['HTML', 'CSS', 'JS', 'layout', 'segmented-control', 'post-2023'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'An ARIA <span class="key">tablist</span> with two <span class="key">tab</span>s drives the layout. Clicking a tab calls <span class="key">applyView</span>, which toggles <span class="key">.grid</span>/<span class="key">.list</span> on the board and updates <span class="key">aria-selected</span> + a highlight class.',
      'The board is a CSS grid: <span class="key">auto-fill minmax(180px,1fr)</span> for grid, a single column for list. The list layout re-stacks each card with <span class="key">flex-direction: row</span> so the avatar row, description, and footer sit side by side.',
      'The chosen view is saved to <span class="key">localStorage</span> and restored on load; arrow keys rove the selection between the two tabs.',
    ],
  },
  {
    id: 'tree-view',
    title: 'Tree View',
    desc: 'Nested file tree with expand/collapse, keyboard nav (arrows/Home/End/Enter), and persisted state.',
    tags: ['HTML', 'CSS', 'JS', 'a11y', 'keyboard'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each node is a role=treeitem; folders carry aria-expanded and a chevron button, leaves show an icon. A single delegated click handler on the<ul> decides: chevron = expand/collapse only, elsewhere = select (folders also expand). Arrow keys move within the visible list, ArrowRight/Left expand and collapse, Home/End jump, Enter expands folders and selects leaves.',
      'Visibility is computed from a flat visibleList() (collapsed subtrees are pruned), so keyboard navigation and ARIA never expose hidden nodes. Expanded ids and the selected id persist in localStorage and are restored on load.',
      'Expand all / Collapse all / Clear selection buttons drive the same state functions. Rendered nodes are recycled in place via refreshNode so focus and state survive expand/collapse.',
    ],
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    desc: 'Accessible tooltips that show on hover and focus, track the pointer, and hide on Esc.',
    tags: ['CSS', 'JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The tip is a <span class="key">role="tooltip"</span> element linked to its host via <code>aria-describedby</code>, and shown on both <span class="key">hover</span> and <span class="key">focus</span>.',
      'JS positions the tip relative to the host (top/bottom/right) and re-positions it as the pointer moves.',
      'Escape and blur hide the tip; the element is created lazily and removed when dismissed.',
    ],
  },
  {
    id: 'lightbox',
    title: 'Lightbox',
    desc: 'A full-screen image viewer with keyboard navigation and focus trapping.',
    tags: ['JS', 'a11y', 'media', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Thumbnails carry <span class="key">data-src</span> (full size) and data-caption; the overlay DOM is built once and reused across views.',
      'Navigate with <code>←</code>/<code>→</code>, close with <code>Esc</code> or a backdrop click; navigation wraps around the ends.',
      'While open, focus is <span class="key">trapped</span> inside the dialog and returns to the opened thumbnail on close.',
    ],
  },
  {
    id: 'typography-scale',
    title: 'Typography Scale',
    desc: 'A live type-scale generator driven by musical ratios and a base size.',
    tags: ['CSS', 'JS', 'design', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each step size is <span class="key">base × ratio^step</span>, so the numbers follow real musical intervals (whole tone 1.25, perfect fifth 1.5, golden ratio 1.618).',
      'Changing the ratio, base size, or step count re-renders every row instantly — no page reload.',
      'Each row shows the semantic label (H1…body), a live sample sentence, and the exact pixel size.',
    ],
  },
  {
    id: 'color-contrast-checker',
    title: 'Contrast Checker',
    desc: 'Compute WCAG contrast ratio between two colors and report AA / AAA pass status.',
    tags: ['CSS', 'JS', 'a11y', 'design'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Convert hex to linearized sRGB and compute relative luminance, then contrast = (Llight + 0.05) / (Ldark + 0.05).',
      'Compare the ratio against WCAG thresholds: AA 4.5:1, AA large 3:1, AAA 7:1, AAA large 4.5:1.',
      'A live preview applies the chosen colors so you see the result as the grades update.',
    ],
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    desc: 'Validate, pretty-print, and compact JSON with the parser own error messages.',
    tags: ['JS', 'tool', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Format uses <span class="key">JSON.stringify(value, null, 2)</span>; compact uses the zero-indent form.',
      'Errors surface the parser message, with line/column extracted when the engine provides it.',
      'Input is validated live (debounced) as you type, and Clear resets both panes.',
    ],
  },
  {
    id: 'stopwatch',
    title: 'Stopwatch',
    desc: 'Start, stop, and record laps with automatic best/worst detection.',
    tags: ['JS', 'ux', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Display is driven by <span class="key">requestAnimationFrame</span> reading <span class="key">Date.now()</span>, so the readout stays smooth without a busy timer.',
      'Each Lap records the split since the previous lap and the total elapsed time.',
      'Best and worst splits are recomputed and highlighted every time a lap is added.',
    ],
  },
  {
    id: 'markdown-editor',
    title: 'Markdown Editor',
    desc: 'A dependency-free split preview supporting common Markdown syntax.',
    tags: ['JS', 'editor', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'HTML is escaped first, then inline formatting (bold, italic, code, links, images) is applied so untrusted input can’t inject markup.',
      'Line-by-line parsing handles headings, fenced code blocks, blockquotes, and ordered/unordered lists.',
      'The preview re-renders on every keystroke; a sample document is shown on load.',
    ],
  },
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    desc: 'Convert length, weight, and temperature across common units.',
    tags: ['JS', 'ux', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each category has a base unit; non-base units carry a conversion factor, so conversion goes value × factorIn / factorOut.',
      'Temperature uses dedicated C/F/K formulas since it isn’t a simple ratio.',
      'Changing the input or either unit selector re-converts immediately.',
    ],
  },
  {
    id: 'avatar-stack',
    title: 'Avatar Stack',
    desc: 'Overlapping avatars that collapse the overflow into a +N count.',
    tags: ['CSS', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Avatars overlap via a negative margin on each avatar; the last visible one sits on top.',
      'JS counts the total and hides avatars past a max-visible threshold, then renders a +N badge.',
      'Hover lifts an avatar for emphasis. Pure CSS overlap, JS only handles the overflow count.',
    ],
  },
  {
    id: 'alert',
    title: 'Alerts',
    desc: 'Dismissible status messages with roles, icons, and keyboard support.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Uses role=status for polite updates and role=alert for urgent messages.',
      'Each alert has a dismiss button (accessible label) and closes on Escape.',
      'Color variants (info, success, warning, error) are driven by modifier classes for light and dark themes.',
    ],
  },
  {
    id: 'countdown',
    title: 'Countdown',
    desc: 'Set a duration, start, pause, and reset a timer with a completion event.',
    tags: ['JS', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Tracks time with an end timestamp and Date.now() delta, so it stays accurate even if the tab throttles.',
      'Start reads the inputs once; pause keeps the remaining time; reset restores the clock to the inputs.',
      'On completion it dispatches a custom countdown:complete event host apps can listen for.',
    ],
  },
  {
    id: 'gradient-generator',
    title: 'Gradient Generator',
    desc: 'Pick two colors and an angle, then copy the generated CSS gradient.',
    tags: ['JS', 'CSS', 'tool'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Live-updates a preview and a read-only CSS field as colors or angle change.',
      'Copies via the async Clipboard API with an execCommand fallback for older browsers.',
      'Shows a Copied! state so users get confirmation before reverting.',
    ],
  },
  {
    id: 'copy-to-clipboard',
    title: 'Copy to Clipboard',
    desc: 'Copy text with visual feedback and keyboard support.',
    tags: ['JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Reads text from a data-copy selector or data-text attribute, so it works on any element.',
      'Prefers the async Clipboard API and falls back to a hidden textarea + execCommand.',
      'Emits a Copied! state and an aria-live status message for screen reader confirmation.',
    ],
  },
  {
    id: 'context-menu',
    title: 'Context Menu',
    desc: 'A custom right-click menu with full keyboard navigation.',
    tags: ['JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Opens on contextmenu, positions itself to stay on screen, and closes on outside click or Escape.',
      'Keyboard: Menu/Shift+F10 opens, arrows move, Home/End jump, Enter/Space executes, Escape closes.',
      'Supports separators and danger-styled items; dispatches the chosen action to the host.',
    ],
  },
  {
    id: 'pomodoro-timer',
    title: 'Pomodoro Timer',
    desc: 'Work / short break / long break sessions with auto-advance and a completion beep.',
    tags: ['JS', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Three modes with fixed durations (25 / 5 / 15 min); a ring progress indicator uses stroke-dashoffset.',
      'Auto-advances work -> short break, and every 4 work sessions -> long break; counts completed pomodoros.',
      'Completion plays a WebAudio beep; honors prefers-reduced-motion by not forcing audio; Start/Pause/Reset/Skip.',
    ],
  },
  {
    id: 'color-mixer',
    title: 'Color Mixer',
    desc: 'Blend two colors with a ratio slider; copy the result in HEX or RGB.',
    tags: ['JS', 'CSS'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Converts both hex values to RGB and linearly interpolates each channel by the slider ratio.',
      'Outputs a live preview swatch plus HEX and rgb() values, and picks black/white text by luminance.',
      'Pure math, no image assets; re-mixes on any color or slider change.',
    ],
  },
  {
    id: 'parallax',
    title: 'Parallax',
    desc: 'Stacked layers that scroll at different speeds to create depth.',
    tags: ['CSS', 'JS', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Layers are positioned absolutely; a rAF-debounced scroll listener translates each by its own speed factor.',
      'Background moves slowest, foreground fastest; animation stops once the hero scrolls out of view.',
      'Respects prefers-reduced-motion by leaving transforms unset; uses CSS gradients so no images are needed.',
    ],
  },
  {
    id: 'masonry',
    title: 'Masonry',
    desc: 'Variable-height cards flow into balanced CSS columns.',
    tags: ['CSS', 'responsive'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Uses CSS columns (column-count) so tiles drop into the shortest column with break-inside: avoid.',
      'Responsive: 3 columns -> 2 at 700px -> 1 under 480px; no JS layout, only demo data generation.',
      'Each tile is independent, so dynamic content of any height stacks cleanly.',
    ],
  },

  {
    id: 'quiz',
    title: 'Quiz',
    desc: 'A multiple-choice quiz with instant scoring, feedback, and retry.',
    tags: ['JS', 'forms', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Questions are rendered from a data array; each uses a radio group (native, keyboard + a11y friendly).',
      'On submit, correct options are highlighted green and wrong picks struck through, with per-question borders.',
      'Score computes correct/total and shows a result panel; Retry clears selections and hides results.',
    ],
  },

  {
    id: 'progress-bar',
    title: 'Progress Bar',
    desc: 'Determinate bar with a percentage and an indeterminate bar for unknown progress.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The determinate bar is a fill whose width is driven by a range slider and updates the role=progressbar aria-valuenow.',
      'The indeterminate bar uses a pure-CSS translateX sweep animation for unknown-length work.',
      'Start runs a decaying random-interval animation to 100%; Reset zeroes both bars.',
    ],
  },
  {
    id: 'empty-state',
    title: 'Empty State',
    desc: 'A friendly placeholder with a call to action for when a list has no items.',
    tags: ['CSS', 'JS', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'An inline SVG illustration with a title, description, and primary action swaps with the populated list.',
      'The toggle demonstrates both states; the empty-state CTA switches to the filled list.',
      'Uses hidden attribute to switch views; the list uses status dots for on/off states.',
    ],
  },
  {
    id: 'error-state',
    title: 'Error State',
    desc: 'A recoverable error message with a retry action that simulates a fresh request.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The error panel carries role=alert, a danger-colored icon, title, description, and Retry/Dismiss actions.',
      'Retry shows a loading state, then after a delay swaps to a success panel with a check icon.',
      'Dismiss cycles back to the error; the two panels are toggled with the hidden attribute.',
    ],
  },
  {
    id: 'popover',
    title: 'Popover',
    desc: 'A floating panel anchored to a trigger with focus trapping and keyboard support.',
    tags: ['CSS', 'JS', 'a11y', 'interaction'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Opens on click or Enter/Space; closes on Esc, outside click, or the panel button; aria-expanded + aria-haspopup wire it to the trigger.',
      'Positioning keeps the panel on-screen, flipping above the trigger if it would clip the bottom.',
      'Focus is trapped inside while open and returns to the trigger on close.',
    ],
  },
  {
    id: 'tag-input',
    title: 'Tag Input',
    desc: 'Add tags with Enter or comma, remove with Backspace or the remove button; no duplicates.',
    tags: ['JS', 'forms', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Enter/comma/semicolon adds a trimmed tag; duplicates are ignored; the value is stored in a hidden field as JSON.',
      'Backspace on an empty field removes the last tag; each tag has an accessible remove button.',
      'The live value is re-rendered on every change and shown in a read-only code block.',
    ],
  },
  {
    id: 'sparkline',
    title: 'Sparkline',
    desc: 'A tiny inline SVG line chart for embedding next to numbers, with min/max highlights.',
    tags: ['JS', 'data-viz'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Builds a <polyline> plus a low-opacity <path> area from a values array, scaled to fit a fixed viewBox.',
      'The minimum and maximum points are drawn with a distinct stroke so trends read at a glance.',
      'Transparent hit-circle overlays carry hover tooltips with each value; up/down is shown by color.',
    ],
  },
  {
    id: 'gauge',
    title: 'Gauge',
    desc: 'A semicircle SVG meter with a sweeping needle and a green-to-red fill arc.',
    tags: ['JS', 'data-viz'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The fill arc uses stroke-dashoffset against a fixed arc length; the needle rotates from -90deg to +90deg.',
      'Fill color is computed as an HSL hue that shifts green -> yellow -> red as the value rises.',
      'A range slider drives the value; the numeric readout updates via aria-live.',
    ],
  },
  {
    id: 'todo',
    title: 'Todo List',
    desc: 'Add, toggle, and delete tasks with localStorage persistence and all/active/done filters.',
    tags: ['JS', 'forms', 'ux'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Tasks are stored as JSON in localStorage; load() reads and save() writes on every mutation.',
      'Filter buttons set currentFilter; the count updates to remaining active items.',
      'Clear completed removes done tasks; each item has an accessible checkbox, text, and delete button.',
    ],
  },
  {
    id: 'toggle-group',
    title: 'Toggle Group',
    desc: 'Mutually exclusive toggle buttons as a native radio group with full ARIA keyboard support.',
    tags: ['JS', 'a11y', 'input'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each button is role=radio with aria-checked; clicking or Space/Enter selects the target.',
      'Arrow keys move within the group, Home/End jump to the first/last, wrapping at the edges.',
      'Type-ahead jumps to a radio whose label starts with the pressed key; focus moves with selection.',
    ],
  },
  {
    id: 'callout',
    title: 'Callout',
    desc: 'Inline contextual note/tip/warning/error blocks with a color-coded accent bar.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Static content with semantic roles (note/comment/alert) and a left accent border per variant.',
      'JS optionally injects a dismiss button and persists dismissed callouts in localStorage.',
      'A restore link appears only if something was dismissed; callouts work without JS.',
    ],
  },
  {
    id: 'box-shadow-generator',
    title: 'Box Shadow Generator',
    desc: 'Tune a box shadow with sliders and copy the generated CSS.',
    tags: ['JS', 'tool', 'design'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Six controls (offset X/Y, blur, spread, opacity, color) feed a live box-shadow string.',
      'The hex color is converted to RGBA; the preview box updates on every slider input.',
      'Copy writes the CSS to the clipboard and shows a transient "Copied!" state.',
    ],
  },

  {
    id: 'avatar',
    title: 'Avatar',
    desc: 'A circular avatar with image-to-initials fallback and a status dot, sized via a CSS variable.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Uses --size to scale; shows an <img> or falls back to initials derived from the aria-label.',
      'A positioned status dot (online/away/offline) sits at the bottom-right with a ring border.',
      'JS swaps in initials if the image fails to load so the avatar never breaks.',
    ],
  },
  {
    id: 'spinner',
    title: 'Spinner',
    desc: 'An accessible indeterminate loading spinner that scales and respects reduced motion.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A conic-gradient ring with a radial-mask hole creates the arc; a rotate keyframe spins it.',
      'role=status + aria-busy announce loading; sizes scale via --size, reduced motion stops the spin.',
      'The button toggles an inline spinner and sets aria-busy on the host region.',
    ],
  },
  {
    id: 'notification-badge',
    title: 'Notification Badge',
    desc: 'A count badge anchored to an icon that decrements on click and hides at zero.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Count badges cap at 99+; the badge gets a badge-hidden class at zero. A separate dot badge marks "new".',
      'Clicking the badge decrements its data-count and re-renders; buttons add and reset the count.',
      'Each icon button exposes its unread total via aria-label for screen readers.',
    ],
  },

  {
    id: 'chip',
    title: 'Chip',
    desc: 'Compact removable content units with a dismiss animation and Undo.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Each chip has a keyboard-activatable remove button (role=button, Enter/Space); color variants carry meaning.',
      'Removing a chip animates it out and reveals an Undo button that re-appends the last dismissed chip.',
      'Outlined chips are decorative/label-only; the row is a role=group for screen readers.',
    ],
  },
  {
    id: 'filter',
    title: 'Filter Panel',
    desc: 'Filter a card grid by category with checkboxes; live count and empty state.',
    tags: ['JS', 'ux', 'responsive'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Checkboxes carry data-cat; the grid is rebuilt from a data array keeping only selected categories.',
      'The result count updates via aria-live and an empty state appears when nothing matches.',
      'Reset re-checks all filters; the panel is sticky on desktop and stacks on mobile.',
    ],
  },
  {
    id: 'quote',
    title: 'Quote',
    desc: 'A styled blockquote with accent bar, inline citation, and optional avatar.',
    tags: ['CSS', 'JS', 'a11y'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Semantic <blockquote> + <cite>; a left accent border and italic type signal quoted text.',
      'A figure groups the quote with a citation row that can include an initials avatar.',
      'JS injects a Copy button that writes the quote text to the clipboard; works without JS.',
    ],
  },
  {
    id: 'card-grid',
    title: 'Card Grid',
    desc: 'A responsive grid of feature cards that reflows from many columns to one using CSS grid auto-fill.',
    tags: ['CSS', 'JS', 'responsive'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'A single <span class="key">display:grid</span> with <span class="key">repeat(auto-fill, minmax(240px, 1fr))</span> reflows columns automatically — no media queries needed.',
      'Each <span class="key">&lt;article&gt;</span> is a self-contained card with icon, title, and text.',
      'JS reveals cards with a staggered fade-up via IntersectionObserver; they work without JS.',
    ],
  },
  {
    id: 'custom-checkbox',
    title: 'Custom Checkbox',
    desc: 'A native checkbox kept for accessibility, with a styled box on the label plus indeterminate state.',
    tags: ['CSS', 'JS', 'a11y', 'forms'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'The native <span class="key">&lt;input type="checkbox"&gt;</span> is visually hidden but stays focusable and submittable.',
      'The visible box is the sibling <span class="key">&lt;label&gt;</span>, styled via :checked and :focus-visible.',
      'JS adds a "select all" parent with an indeterminate (–) state when only some children are checked.',
    ],
  },
  {
    id: 'custom-radio',
    title: 'Custom Radio',
    desc: 'A grouped set of radios for single-select choices, styled with a native input underneath.',
    tags: ['CSS', 'JS', 'a11y', 'forms'],
    files: ['index.html', 'styles.css', 'app.js'],
    explain: [
      'Native <span class="key">&lt;input type="radio"&gt;</span> inputs share a name for single-select; the dot is drawn with ::after.',
      'The label ring uses :checked and :focus-visible so keyboard and screen-reader users are covered.',
      'JS announces the currently selected plan in an aria-live region.',
    ],
  },
];

// ---- Theme toggle ---------------------------------------------------------
const ROOT = '';
const htmlEl = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');

function getStoredTheme() {
  return localStorage.getItem('fe-theme');
}
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('fe-theme', theme);
}
(function initTheme() {
  const theme = getStoredTheme() || getSystemTheme();
  applyTheme(theme);
})();
toggleBtn.addEventListener('click', () => {
  const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});
// Follow OS changes only if the user hasn't picked manually.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
});

// ---- Toast (copy feedback) ------------------------------------------------
function toast(message, type = 'success') {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  el.style.cssText = `padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-elev);box-shadow:var(--shadow-lg);font-size:0.88rem;opacity:0;transform:translateY(8px);transition:all .2s;max-width:320px;`;
  host.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 200);
  }, 1800);
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard', 'success');
  } catch {
    // Fallback for older browsers / insecure contexts.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Copied to clipboard', 'success'); }
    catch { toast('Copy failed — select and copy manually', 'error'); }
    ta.remove();
  }
}

// ---- Routing --------------------------------------------------------------
// Bumped on every navigation so a slow source fetch from an earlier detail view
// cannot write into a newer one (or into the gallery).
let detailRenderToken = 0;

function getRoute() {
  const hash = location.hash.replace(/^#\/?pattern\//, '');
  if (hash) return decodeURIComponent(hash);
  const params = new URLSearchParams(location.search);
  return params.get('p') || null;
}

const app = document.getElementById('app');

async function render() {
  detailRenderToken += 1;
  const id = getRoute();
  if (id) return renderDetail(id);
  return renderGallery();
}

function renderGallery(filter = '') {
  const q = filter.trim().toLowerCase();
  const matched = PATTERNS.filter((p) => {
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    );
  });

  // Build the "chrome" (hero + search + section head) only once. Recreating the
  // search input on every keystroke would reset its caret to position 0, so each
  // new character would be inserted at the start — typing "grid" would render as
  // "dirg". Keeping the input stable lets the caret stay put.
  if (!document.getElementById('search')) {
    app.innerHTML = `
      <section class="hero">
        <h1>Modern frontend patterns, ready to copy.</h1>
        <p>A curated starting point for building a frontend without reinventing the wheel.
           Pick a pattern, preview it, and paste the code into your project.</p>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input id="search" type="search" placeholder="Search patterns — e.g. modal, form, toast" aria-label="Search patterns" />
        </div>
      </section>
      <div class="section-head">
        <h2>Patterns</h2>
        <span class="count-badge" id="count-badge"></span>
      </div>
    `;
    attachSearchHandler();
  }

  // Update the count badge.
  const badge = document.getElementById('count-badge');
  if (badge) {
    badge.textContent = matched.length + ' pattern' + (matched.length === 1 ? '' : 's');
  }

  // Update only the gallery content (grid or empty message). This container is
  // stable across keystrokes, so nothing else in the page is disturbed.
  const gallery = document.getElementById('gallery-container');
  if (!gallery) {
    const container = document.createElement('div');
    container.id = 'gallery-container';
    app.appendChild(container);
  }
  const target = document.getElementById('gallery-container');
  target.innerHTML = matched.length
    ? `<div class="grid">${matched
        .map(
          (p) => `
        <button class="card" data-id="${p.id}" type="button">
          <div class="card-head">
            <span class="card-title">${p.title}</span>
            <span class="card-id">${p.id}</span>
          </div>
          <p class="card-desc">${p.desc}</p>
          <div class="tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
        </button>`
        )
        .join('')}</div>`
    : `<div class="empty">No patterns match "${escapeAttr(filter)}".<br/>Try a different keyword.</div>`;

  target.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      location.hash = `#pattern/${card.dataset.id}`;
    });
  });
}

function attachSearchHandler() {
  const search = document.getElementById('search');
  search?.addEventListener('input', () => {
    renderGallery(search.value);
  });
  search?.focus();
}

async function renderDetail(id) {
  const token = detailRenderToken;
  const pattern = PATTERNS.find((p) => p.id === id);

  // Hash navigation swaps #app content without resetting scroll, so on mobile (where
  // the gallery is scrolled near the footer) a pattern tap would leave you at the bottom.
  // Scroll past the sticky 64px header + .detail's 28px padding so the pattern is visible.
  const header = document.querySelector('.site-header');
  window.scrollTo({ top: (header?.offsetHeight || 64) + 28 });

  if (!pattern) {
    app.innerHTML = `
      <div class="detail">
        <a class="back-link" href="./">← All patterns</a>
        <div class="empty">Pattern “${id}” not found.</div>
      </div>`;
    return;
  }

  // Render the shell first — the click gets an instant response while the source
  // files are still loading. The code panel shows a loading state until they arrive.
  app.innerHTML = `
    <div class="detail">
      <a class="back-link" href="./">← All patterns</a>
      <div class="detail-head">
        <h1>${pattern.title}</h1>
        <p>${pattern.desc}</p>
      </div>
      <div class="detail-meta">${pattern.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>

      <div class="action-bar">
        <button class="btn primary" data-copy-all disabled>📋 Copy all files</button>
        <a class="btn" href="${ROOT}patterns/${id}/index.html" target="_blank" rel="noopener">↗ Open standalone</a>
      </div>

      <div class="layout-split">
        <div class="preview-panel">
          <div class="panel-title">Live preview</div>
          <iframe class="preview-frame" src="${ROOT}patterns/${id}/index.html" title="Preview of ${pattern.title}" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
        <div class="code-panel">
          <div class="panel-title">
            Source
            <button class="btn copy-btn" data-copy-current disabled>Copy</button>
          </div>
          <div class="code-tabs">
            ${pattern.files
              .map(
                (f, i) => `<button class="code-tab ${i === 0 ? 'active' : ''}" data-tab="${f}" type="button" disabled>${f}</button>`
              )
              .join('')}
          </div>
          <pre class="code"><code id="code-view" aria-busy="true"><span class="source-loading"><span class="source-spinner" aria-hidden="true"></span>Loading source files…</span></code></pre>
        </div>
      </div>

      <section class="explain">
        <h3>Why this pattern</h3>
        <ul>${pattern.explain.map((s) => `<li>${s}</li>`).join('')}</ul>
      </section>
    </div>
  `;

  // Fetch all source files in parallel — one round-trip instead of three.
  const entries = await Promise.all(
    pattern.files.map(async (file) => {
      try {
        return [file, await (await fetch(`${ROOT}patterns/${id}/${file}`)).text()];
      } catch (err) {
        return [file, `// Could not load ${file}\n// ${err.message}`];
      }
    })
  );

  // A newer navigation superseded this one — don't write into its DOM.
  if (token !== detailRenderToken) return;
  const sources = Object.fromEntries(entries);

  // Tab switching
  const codeView = document.getElementById('code-view');
  let currentFile = pattern.files[0];
  const showTab = (file) => {
    currentFile = file;
    codeView.textContent = sources[file] ?? '';
    app.querySelectorAll('.code-tab').forEach((t) =>
      t.classList.toggle('active', t.dataset.tab === file)
    );
  };
  codeView.removeAttribute('aria-busy');
  showTab(currentFile);
  app.querySelectorAll('.code-tab, [data-copy-current], [data-copy-all]').forEach((el) => {
    el.disabled = false;
  });
  app.querySelectorAll('.code-tab').forEach((tab) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });

  // Copy current tab
  app.querySelector('[data-copy-current]').addEventListener('click', () => {
    copyText(sources[currentFile] ?? '', null);
  });

  // Copy all files
  app.querySelector('[data-copy-all]').addEventListener('click', async () => {
    const bundle = pattern.files
      .map((f) => `<!-- ===== ${f} ===== -->\n${sources[f] ?? ''}`)
      .join('\n\n');
    await copyText(bundle, null);
  });
}

function escapeAttr(s) {
  return String(s).replace(/["\\]/g, '\\$&');
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

window.addEventListener('hashchange', render);
render();
