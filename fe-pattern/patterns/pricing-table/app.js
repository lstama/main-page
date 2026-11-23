/* Pricing table.
 *
 * The layout is pure HTML/CSS (responsive grid -> single column on mobile).
 * Progressive enhancement: clicking a plan button announces the selection in a
 * role=status aria-live region. The core layout never depends on JS.
 */
const buttons = [...document.querySelectorAll('.plan-btn')];
const status = document.getElementById('status');

if (!status) {
  const region = document.createElement('p');
  region.id = 'status';
  region.role = 'status';
  region.setAttribute('aria-live', 'polite');
  region.style.marginTop = '20px';
  region.style.fontWeight = '600';
  region.style.color = '#4f46e5';
  region.textContent = '';
  document.getElementById('main').appendChild(region);
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const plan = btn.closest('.plan').querySelector('.plan-name').textContent;
    document.getElementById('status').textContent = `Selected: ${plan} plan`;
  });
});
