/* Toggle switch.
 *
 * Accessibility backbone:
 *   - Each control is a NATIVE <input type="checkbox"> — visually hidden but focusable, so
 *     keyboard (Space to toggle), focus ring, and screen readers all work with ZERO JS.
 *   - role="switch" tells assistive tech this checkbox behaves as an on/off switch.
 *   - The visual <span class="switch"> sits right after the input in DOM order, so the label
 *     click toggles the hidden checkbox (label-for + sibling visual).
 *
 * Progressive enhancement (does NOT provide the core interaction):
 *   - On change, a role=status aria-live region announces the new state.
 */
const inputs = [...document.querySelectorAll('.switch-input')];
const status = document.getElementById('status');

function announce() {
  const on = inputs.filter((i) => i.checked).map((i) => {
    const label = i.closest('.row')?.querySelector('.row-label')?.textContent ?? i.id;
    return `${label} ${i.checked ? 'on' : 'off'}`;
  });
  status.textContent = on.length
    ? on.join('; ')
    : 'All switches off';
}

inputs.forEach((input) => {
  input.addEventListener('change', announce);
});

// Announce once on load so the live region has an initial value.
announce();
