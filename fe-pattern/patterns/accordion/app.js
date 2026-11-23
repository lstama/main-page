// Accessible accordion.
//
// Implements the WAI-ARIA Accordion pattern. Each header is a real <button> with
// `aria-expanded` (open/closed) and `aria-controls` (the id of the panel it toggles).
// The panel it controls is hidden with the `hidden` attribute when collapsed, so a
// closed panel is removed from the accessibility tree and the tab order.
//
// Behavior: only one panel is open at a time. Clicking an open header closes it;
// clicking a closed header opens it and closes the others.
//
// Keyboard: Tab moves between the header buttons — they are the only tab stops in
// the group. No arrow-key roving is required for accordions, since each header is a
// genuinely independent, focusable button.

const accordion = document.getElementById('faq-accordion');

accordion.addEventListener('click', (e) => {
  const button = e.target.closest('.panel-header');
  if (!button) return;

  const wasExpanded = button.getAttribute('aria-expanded') === 'true';

  // Collapse every panel first, so the group never has two open at once.
  accordion.querySelectorAll('.panel-header').forEach((other) => {
    other.setAttribute('aria-expanded', 'false');
    document.getElementById(other.getAttribute('aria-controls')).hidden = true;
  });

  // If the clicked header was closed, open it now. If it was open, leave it closed.
  if (!wasExpanded) {
    button.setAttribute('aria-expanded', 'true');
    document.getElementById(button.getAttribute('aria-controls')).hidden = false;
  }
});
