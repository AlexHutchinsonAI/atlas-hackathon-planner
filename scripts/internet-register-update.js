/* Merge Internet only; preserve conflicting local edits and all other workstreams. */
(() => {
  window.AtlasInternetRegisterUpdate = {apply(plans, key) {
    const update = window.ATLAS_INTERNET_REGISTER_UPDATE;
    if (!update) return plans;
    const marker = key + '-internet-' + update.version;
    if (localStorage.getItem(marker)) return plans;
    const next = {...plans, ws16: window.AtlasBackupUpdate.merge(plans.ws16, update.previous, update.plan)};
    for (const field of ['handled', 'khandled']) {
      next.ws16[field] = [...new Set([...(next.ws16[field] || []), ...(update.plan[field] || [])])];
    }
    window.AtlasSave.write(key, JSON.stringify(next));
    localStorage.setItem(marker, '1');
    return next;
  }};
})();
