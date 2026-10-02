/* Upgrade untouched imported fields; retain conflicting local edits and remember this backup version. */
(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  function merge(current, previous, incoming) {
    if (current === undefined || same(current,previous)) return clone(incoming);
    if (incoming && typeof incoming === 'object' && !Array.isArray(incoming) && current && typeof current === 'object' && !Array.isArray(current)) {
      const result = {...current};
      for (const [key,value] of Object.entries(incoming)) result[key] = merge(current[key],previous?.[key],value);
      return result;
    }
    return current;
  }
  window.AtlasBackupUpdate = {merge, apply(plans,reviews,key) {
    const update = window.ATLAS_BACKUP_UPDATE;
    if (!update) return {plans,reviews};
    const marker = key + '-backup-' + update.version;
    if (localStorage.getItem(marker)) return {plans,reviews};
    const nextPlans = merge(plans,update.previousPlans,update.plans);
    const nextReviews = merge(reviews,update.previousReviews,update.reviews);
    // Persist data before the marker so failed storage writes can be retried safely.
    window.AtlasSave.write(key,JSON.stringify(nextPlans));
    window.AtlasSave.write(key+'-review',JSON.stringify(nextReviews));
    localStorage.setItem(marker,'1');
    return {plans:nextPlans,reviews:nextReviews};
  }};
})();
