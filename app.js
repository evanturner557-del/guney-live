// Progressive enhancement only: the page is fully usable without this file.
(() => {
  const lang = document.documentElement.lang || 'en';
  const fmt = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB');

  // Copy e-mail address
  const btn = document.querySelector('button[data-copy]');
  const status = document.querySelector('[role="status"]');
  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        ta.setAttribute('readonly', ''); ta.className = 'sr-only';
        document.body.append(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove();
      }
      status.textContent = ok ? btn.dataset.done : btn.dataset.fail;
    });
  }

  // Chart tooltip (mouse, touch and keyboard)
  const chart = document.querySelector('.chart');
  if (!chart) return;
  const tip = chart.querySelector('.tip');
  const svg = chart.querySelector('svg');
  let active = null;
  const show = hit => {
    const bar = hit.previousElementSibling;
    if (active) active.classList.remove('on');
    active = bar; bar.classList.add('on');
    tip.textContent = `${hit.dataset.year}: ${fmt.format(+hit.dataset.value)}`;
    const c = chart.getBoundingClientRect(), b = bar.getBoundingClientRect();
    tip.style.left = `${b.left - c.left + b.width / 2}px`;
    tip.style.top = `${b.top - c.top - 8}px`;
    tip.classList.add('show');
  };
  const hide = () => { tip.classList.remove('show'); if (active) active.classList.remove('on'); active = null; };
  chart.querySelectorAll('.hit').forEach(h => {
    h.addEventListener('pointerenter', () => show(h));
    h.addEventListener('pointerdown', () => show(h));
    h.addEventListener('focus', () => show(h));
    h.addEventListener('blur', hide);
  });
  svg.addEventListener('pointerleave', hide);
})();
