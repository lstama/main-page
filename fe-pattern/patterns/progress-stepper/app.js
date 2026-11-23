/* Progress stepper.
 *
 * Accessibility:
 *   - <nav aria-label="Checkout progress"> wraps an <ol>.
 *   - Each step is a focusable <li role="listitem">. The active step carries
 *     aria-current="step"; completed steps are interactive (role="button", tabindex=0);
 *     upcoming steps are aria-disabled.
 *   - A role=status aria-live region announces the current step.
 *
 * Behaviour:
 *   - Steps are rendered from a path array; status is derived from the current index
 *     (everything before current is completed, current is active, after is upcoming).
 *   - Clicking/tapping a completed step moves the current position back to it (so users
 *     can edit a previous step). This works with keyboard (Enter/Space) and touch.
 */
const STEPS = ["Cart", "Shipping", "Payment", "Confirmation"];
let currentIndex = 0;

const list = document.getElementById("stepper-list");
const status = document.getElementById("status");
const select = document.getElementById("step-select");

function statusFor(index) {
  if (index < currentIndex) return "completed";
  if (index === currentIndex) return "current";
  return "upcoming";
}

function render() {
  list.innerHTML = "";

  STEPS.forEach((label, index) => {
    const statusName = statusFor(index);
    const li = document.createElement("li");
    li.className = `stepper-step is-${statusName}`;
    li.setAttribute("role", "listitem");

    // Marker (circle with number, or check when completed).
    const marker = document.createElement("span");
    marker.className = "stepper-marker";
    marker.setAttribute("aria-hidden", "true");
    const number = document.createElement("span");
    number.className = "stepper-number";
    number.textContent = String(index + 1);
    marker.appendChild(number);
    li.appendChild(marker);

    // Label.
    const labelEl = document.createElement("span");
    labelEl.className = "stepper-label";
    labelEl.textContent = `Step ${index + 1} — ${label}`;
    li.appendChild(labelEl);

    // Completed steps are interactive (jump back); current is the active position.
    if (statusName === "completed") {
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", `${label}, completed. Click to edit.`);
      li.addEventListener("click", () => goTo(index));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goTo(index);
        }
      });
    } else if (statusName === "current") {
      li.setAttribute("aria-current", "step");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", `${label}, current step. Click to focus.`);
      li.addEventListener("click", () => li.focus());
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.focus();
        }
      });
    } else {
      li.setAttribute("aria-disabled", "true");
    }

    list.appendChild(li);
  });

  // Announce the current step (count only, to avoid flooding).
  status.textContent = `Step ${currentIndex + 1} of ${STEPS.length}: ${STEPS[currentIndex]}`;
}

function goTo(index) {
  if (index < 0 || index >= STEPS.length) return;
  currentIndex = index;
  select.value = String(index);
  render();
}

select.addEventListener("change", () => {
  goTo(Number(select.value));
});

// Announce once on load.
status.textContent = `Step 1 of ${STEPS.length}: ${STEPS[0]}`;
render();
