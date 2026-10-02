/* Show Kandia's source award menu within the Prizes workstream; reviews stay in Operations. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.AtlasPrizes = {
    render(id) {
      if (id !== 'ws35' || !window.ATLAS_PRIZES) return '';
      const {awards, images, rules, tracks} = window.ATLAS_PRIZES;
      const table = rows => `<dl class="prize-rule-list">${rows.map(row => `<div><dt>${esc(row[0])}</dt><dd>${esc(row.slice(1).join(' · '))}</dd></div>`).join('')}</dl>`;
      return `<section class="prize-catalog" aria-labelledby="prize-catalog-title"><header><h2 id="prize-catalog-title">Prizes & recognition</h2><p>Kandia’s update · 14 active awards and recognitions · planning details for review.</p><p><a href="atlas-reference.html#web">Open Website review to edit prize approvals</a> · <a href="workspace.html?workstream=ws35">Direct link to this workstream</a></p></header><div class="prize-gallery">${awards.map(row => `<article class="prize-award panel"><img src="${esc(images[row[0]])}" alt="${esc(row[1])} prize illustration" loading="lazy"><div><h3>${esc(row[1])}</h3><p class="prize-amount">${esc(row[3])}</p><p>${esc(row[2])}</p><details><summary>Scoring & winner selection</summary><h4>Scoring</h4><p>${esc(row[4])}</p><h4>Winner selection</h4><p>${esc(row[5])}</p></details></div></article>`).join('')}</div><details class="prize-support"><summary>Prize rules · ${rules.length}</summary>${table(rules)}</details><details class="prize-support"><summary>Challenge tracks · ${tracks.length}</summary>${table(tracks)}</details></section>`;
    }
  };
})();
