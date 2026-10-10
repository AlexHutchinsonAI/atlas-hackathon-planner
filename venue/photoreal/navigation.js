/* Read-only room navigation. No planning records, authentication or storage. */
(() => {
  let host = window;
  try { if (parent !== window && parent.location.origin === location.origin) host = parent; } catch {}
  const selected = () => {
    let id;
    try { id = decodeURIComponent(host.location.hash.slice(1)); } catch { return 0; }
    const i = rooms.findIndex(room => room.id === id);
    return i < 0 ? 0 : i;
  };
  function restore() {
    const i = selected();
    menu.value = String(i);
    if (window.currentProofRoom !== rooms[i].id) loadRoom(i);
  }
  menu.addEventListener('change', () => {
    const id = rooms[Number(menu.value)]?.id;
    if (id && host.location.hash !== '#' + id) host.history.pushState(null, '', '#' + id);
  });
  host.addEventListener('hashchange', restore);
  host.addEventListener('popstate', restore);
  addEventListener('pagehide', () => {
    host.removeEventListener('hashchange', restore);
    host.removeEventListener('popstate', restore);
  }, {once: true});
  restore();
})();
