/* Entry routing only. Does not read or write planner data or browser storage. */
(() => {
  const path = location.pathname;
  const isLanding = path.endsWith('/') || /\/(?:index|landing)\.html$/.test(path);
  // Keep links saved before the dashboard moved usable as planning deep links.
  if (isLanding && /^#(?:workspace|area|workstream|list|review)(?:\/|$)/.test(location.hash)) {
    location.replace('workspace.html' + location.search + location.hash);
    return;
  }
  const navigation = performance.getEntriesByType('navigation')[0];
  if (path.endsWith('/dashboard.html') && !location.hash && navigation?.type === 'reload') {
    location.replace('index.html' + location.search);
  }
})();
