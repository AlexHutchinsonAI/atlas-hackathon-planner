/* Apply the saved appearance before paint and keep every Atlas page and embedded viewer in sync. */
(() => {
  const key = 'atlas-appearance';
  let mode = 'light';
  try { mode = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch (_) {}
  function apply(value) {
    mode = value === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = mode;
    const button = document.getElementById('atlas-theme-toggle');
    if (button) {
      button.textContent = mode === 'dark' ? '☀ Light mode' : '☾ Dark mode';
      button.setAttribute('aria-label', 'Switch to ' + (mode === 'dark' ? 'light' : 'dark') + ' mode');
      button.setAttribute('aria-pressed', String(mode === 'dark'));
    }
  }
  apply(mode);
  window.addEventListener('storage', event => { if (event.key === key) apply(event.newValue); });
  document.addEventListener('DOMContentLoaded', () => {
    // The containing page supplies the toggle for embedded venue viewers.
    if (window.self !== window.top) return;
    const button = document.createElement('button');
    button.id = 'atlas-theme-toggle'; button.type = 'button';
    button.addEventListener('click', () => {
      apply(mode === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem(key, mode); } catch (_) {}
    });
    document.body.append(button); apply(mode);
  });
})();
