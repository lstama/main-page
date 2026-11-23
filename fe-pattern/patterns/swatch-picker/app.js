/* Swatch picker.
 *
 * Accessibility backbone:
 *   - Native <input type="radio"> group. This gives full keyboard support for free:
 *     arrow keys move between options, Space selects, screen readers announce state.
 *   - Each radio is wrapped in a <label>, so tapping/clicking the swatch selects it.
 *   - role="radiogroup" + aria-label on the group; the legend shows the current value.
 *
 * Progressive enhancement (does NOT provide the core interaction):
 *   - On change, update the legend value text and a role=status aria-live region.
 *   - The check mark / selected style is driven purely by CSS (:checked).
 */
const groups = {
  color: {
    input: document.querySelector('#color-group input[name="color"]'),
    value: document.getElementById('color-value'),
  },
  size: {
    input: document.querySelector('#size-group input[name="size"]'),
    value: document.getElementById('size-value'),
  },
};

const status = document.getElementById('status');

function announce() {
  const colorInput = document.querySelector('#color-group input[name="color"]:checked');
  const sizeInput = document.querySelector('#size-group input[name="size"]:checked');
  const color = colorInput ? colorInput.value : '';
  const size = sizeInput ? sizeInput.value : '';
  groups.color.value.textContent = color;
  groups.size.value.textContent = size;
  status.textContent = `Selected: ${color}, size ${size}`;
}

Object.values(groups).forEach(({ input }) => {
  input.addEventListener('change', announce);
});

// Announce once on load.
announce();
