/* Planning dashboard, search and editable lists. */

(() => {
  "use strict";
  const KEY = "intellibus-love-speed-universe-v1";
  const CORE = [
    "work",
    "milestones",
    "roles",
    "people",
    "places",
    "things",
    "dates",
    "decisions",
    "risks",
  ];
  const FIVE = ["map", "menu", "message", "metrics", "money"];
  const AREAS = [
    ["event", "Event & Competition"],
    ["participants", "Participants & Talent"],
    ["people", "People & Workforce"],
    ["experience", "Experience & Venue"],
    ["operations", "Operations & Technology"],
    ["commercial", "Commercial & External"],
    ["governance", "Governance & Control"],
  ];
  const SPEED = [
    ["schedule", "Schedule", "When will this happen?"],
    ["punctuality", "Punctuality", "What must start or finish on time?"],
    [
      "energy",
      "Energy",
      "How will people eat, hydrate, rest and keep a sustainable pace?",
    ],
    ["efficiency", "Efficiency", "Which tools or simpler ways will help?"],
    [
      "discipline",
      "Discipline",
      "When will we check the list and follow through?",
    ],
  ];
  const app = document.getElementById("app");
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const uid = () =>
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
  let data = load();
  // Import saved entries once per workstream without replacing the current plan or later edits.
  window.AtlasSavedPlan.merge(data);
  // Add unknown live measures without changing existing targets or saved counts.
  function ensureLiveMeasures() {
    for (const [id, name] of [
      ["confirmations", "Participation confirmations"],
      ["invitations", "Invitations sent"],
    ])
      if (!data.command.metrics.some((m) => m.id === id))
        data.command.metrics.push({
          id,
          name,
          target: null,
          current: null,
          source: "Meeting measure; definition and target pending review",
        });
    data.command.headlines ||= ["registrations", "confirmations"];
  }
  ensureLiveMeasures();
  let ui = {
    screen: "home",
    areaId: null,
    wsId: null,
    listId: null,
    mode: "list",
    search: "",
    tag: "",
    listTag: "",
    homeFiltersOpen: false,
    addWorkstreamOpen: false,
  };
  let drag = null;
  let deck = { query: "", area: "", mode: "workstreams", page: 0 };
  let motionPaused = localStorage.getItem("atlas-motion-paused") === "true";

  function ensureMilestones(plan) {
    for (const w of plan.workstreams) {
      if (!w.lists?.some((l) => l.kind === "milestones")) {
        const list = {
          id: w.id + "-milestones",
          kind: "milestones",
          title: "Milestones",
          prompt:
            "The important points this work must reach, each with an owner and date.",
          review: "Needs review",
          reviewNote: "",
          items: [],
          children: [],
        };
        const at = w.lists.findIndex((l) => l.kind === "work");
        w.lists.splice(at < 0 ? 0 : at + 1, 0, list);
      }
    }
    return plan;
  }
  function ensureCommandAreas(plan) {
    plan.command ||= clone(STARTER_DATA.command);
    plan.command.metrics ||= clone(STARTER_DATA.command.metrics);
    for (const metric of STARTER_DATA.command.metrics)
      if (!plan.command.metrics.some((x) => x.id === metric.id))
        plan.command.metrics.push(clone(metric));
    for (const w of plan.workstreams)
      if (!w.area)
        w.area =
          STARTER_DATA.workstreams.find((x) => x.id === w.id)?.area ||
          "governance";
    return plan;
  }

  // Restore the existing saved plan and apply backward-compatible schema defaults.
  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || v.version !== 1 || !Array.isArray(v.workstreams))
        return clone(STARTER_DATA);
      ensureMilestones(v);
      ensureCommandAreas(v);
      for (const w of v.workstreams) {
        if (w.id === "ws17" && w.title === "Event tools") w.title = "Atlas";
        const work = w.lists?.find((l) => l.kind === "work");
        if (work?.title === "What needs doing?")
          work.title = "What do we need to do?";
        for (const list of w.lists || [])
          for (const entry of list.items || []) {
            const match =
              typeof entry.text === "string" &&
              entry.text.match(/^(.{2,45}?)\s+-\s+(.+)$/);
            if (match && entry.source === "Existing planner") {
              entry.text = match[2];
              entry.tags = [
                ...new Set([...(entry.tags || []), match[1].trim()]),
              ];
            } else if (!Array.isArray(entry.tags)) entry.tags = [];
          }
      }
      const old = v.workstreams.find((w) => w.id === "ws08"),
        fresh = STARTER_DATA.workstreams.find((w) => w.id === "ws08");
      if (old && fresh) {
        if (old.brief?.includes("60-person judging function"))
          old.brief = fresh.brief;
        for (const kind of ["work", "roles", "decisions", "metrics"]) {
          const target = old.lists?.find((l) => l.kind === kind),
            source = fresh.lists.find((l) => l.kind === kind);
          if (!target) continue;
          for (const entry of source.items) {
            const existing = target.items.find((x) => x.id === entry.id);
            if (!existing && entry.id.startsWith("judge-"))
              target.items.push(clone(entry));
            else if (existing) {
              if (
                entry.id === "ws08-task-0" &&
                existing.text.startsWith("Model - Lock the 60-person")
              )
                existing.text = entry.text;
              if (
                entry.id === "ws08-metric-1" &&
                existing.text ===
                  "30 Senior Technical Reviewers confirmed and separated from coaching"
              )
                existing.text = entry.text;
              if (
                entry.text.startsWith("If the reviewer panel is approved: ") &&
                existing.text ===
                  entry.text.slice("If the reviewer panel is approved: ".length)
              )
                existing.text = entry.text;
              if (entry.notes && !existing.notes) existing.notes = entry.notes;
            }
          }
        }
      }
      for (const freshW of STARTER_DATA.workstreams) {
        const existing = v.workstreams.find((w) => w.id === freshW.id);
        if (!existing) {
          v.workstreams.push(clone(freshW));
          continue;
        }
        if (!existing.area) existing.area = freshW.area;
        const ids = new Set(allItems(existing).map((x) => x.id));
        for (const freshList of freshW.lists) {
          const target = existing.lists.find((l) => l.kind === freshList.kind);
          if (!target) continue;
          for (const entry of freshList.items) {
            if (entry.id.startsWith("enrich-") && !ids.has(entry.id)) {
              target.items.push(clone(entry));
              ids.add(entry.id);
            }
          }
        }
      }
      return v;
    } catch {
      return clone(STARTER_DATA);
    }
  }
  // Persist edits under the original browser storage key so upgrades retain user work.
  function save() {
    try {
      window.AtlasSave.write(
        window.AtlasTeam?.active ? KEY + window.AtlasTeam.draftSuffix : KEY,
        JSON.stringify(data),
      );
      window.AtlasTeam?.changed(data);
      return true;
    } catch {
      alert(
        "This browser could not save your changes. Export the plan before closing it.",
      );
      return false;
    }
  }
  document.addEventListener('atlas-save-now',save);
  window.AtlasSave.snapshot = () => ({type:'command',data});
  function wsById(id) {
    return data.workstreams.find((w) => w.id === id);
  }
  function findList(ws, id, lists = ws?.lists || [], parents = []) {
    for (const list of lists) {
      if (list.id === id) return { list, parents, siblings: lists };
      const found = findList(ws, id, list.children || [], [...parents, list]);
      if (found) return found;
    }
    return null;
  }
  function itemCount(list) {
    return (
      (list.items || []).length +
      (list.children || []).reduce((n, x) => n + itemCount(x), 0)
    );
  }
  function allLists(ws) {
    const walk = (lists) =>
      lists.flatMap((l) => [l, ...walk(l.children || [])]);
    return walk(ws.lists);
  }
  function allItems(ws) {
    return allLists(ws).flatMap((l) => l.items || []);
  }
  function reviewed(list) {
    return list.review === "Checked" || list.review === "Not needed";
  }
  const READINESS = [
    ["activities", "Activities checked"],
    ["milestones", "Milestones checked"],
    ["dates", "All activities and milestones dated"],
    ["owners", "All activities and milestones owned"],
    ["budget", "Budget recorded or No cost confirmed"],
  ];
  function readiness(w) {
    const activities = w.lists.find((l) => l.kind === "work"),
      milestones = w.lists.find((l) => l.kind === "milestones");
    const entriesOf = (list) =>
      list
        ? [...(list.items || []), ...(list.children || []).flatMap(entriesOf)]
        : [];
    const activityItems = entriesOf(activities),
      milestoneItems = entriesOf(milestones),
      entries = [...activityItems, ...milestoneItems];
    const budget = w.readinessBudget || {};
    return {
      activities: activityItems.length > 0 && activities.review === "Checked",
      milestones: milestoneItems.length > 0 && milestones.review === "Checked",
      dates:
        activityItems.length > 0 &&
        milestoneItems.length > 0 &&
        entries.every((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date || "")),
      owners:
        activityItems.length > 0 &&
        milestoneItems.length > 0 &&
        entries.every((x) => !!x.owner?.trim()),
      budget:
        budget.type === "no-cost" ||
        (budget.type === "amount" && Number(budget.amount) > 0),
    };
  }
  function readinessDots(w) {
    const state = readiness(w),
      count = READINESS.filter(([key]) => state[key]).length;
    return `<span class="readiness-dots" role="img" aria-label="${count} of 5 readiness checks met">${READINESS.map(([key, label]) => `<span class="readiness-dot ${state[key] ? "ready" : ""}" title="${esc(label)}: ${state[key] ? "ready" : "needs attention"}"></span>`).join("")}</span>`;
  }
  function readinessPanel(w) {
    const state = readiness(w),
      budget = w.readinessBudget || {},
      count = READINESS.filter(([key]) => state[key]).length;
    return `<details class="brief readiness-panel" data-persist="readiness"><summary>Plan readiness · ${count} of 5 ${readinessDots(w)}</summary><p>These checks show whether the plan is filled in. They do not mean the work is finished. Suggested items count only after you check their list.</p><div class="readiness-checks">${READINESS.map(([key, label]) => `<div class="readiness-check"><span class="readiness-dot ${state[key] ? "ready" : ""}" aria-hidden="true"></span><span>${esc(label)}</span>${key === "activities" || key === "milestones" ? `<button type="button" data-action="open-list" data-id="${esc(w.id + "-" + (key === "activities" ? "work" : "milestones"))}">Open list</button>` : ""}</div>`).join("")}</div><div class="fields"><label class="field">Budget decision<select data-budget-type="${esc(w.id)}"><option value="" ${!budget.type ? "selected" : ""}>Not set</option><option value="amount" ${budget.type === "amount" ? "selected" : ""}>Budget amount</option><option value="no-cost" ${budget.type === "no-cost" ? "selected" : ""}>No cost</option></select></label>${budget.type === "amount" ? `<label class="field">Approved or planned amount<input data-budget-amount="${esc(w.id)}" type="number" min="0" step="0.01" value="${esc(budget.amount || "")}" placeholder="Enter amount"></label>` : ""}</div><p>Use the Money list for cost lines and decisions. Mark “No cost” only when someone has confirmed it.</p></details>`;
  }
  function move(arr, id, by) {
    const i = arr.findIndex((x) => x.id === id),
      j = i + by;
    if (i < 0 || j < 0 || j >= arr.length) return false;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    save();
    render(true);
    return true;
  }
  function reorder(arr, fromId, toId) {
    const from = arr.findIndex((x) => x.id === fromId),
      to = arr.findIndex((x) => x.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    save();
    render(true);
  }
  // Navigate to a planning screen, allowing a matched search item to control the final scroll.
  function nav(screen, wsId = null, listId = null, areaId = null) {
    ui = {
      ...ui,
      screen,
      wsId,
      listId,
      areaId:
        areaId ||
        (screen === "workstream" || screen === "list"
          ? wsById(wsId)?.area
          : null),
      mode: screen === "workstream" ? "list" : ui.mode,
      listTag: "",
    };
    writeRoute();
    window.scrollTo(0, 0);
    render();
  }
  // View state belongs in the URL, never in planning records.
  function writeRoute() {
    const enc = encodeURIComponent;
    const hash = ui.screen === "home" ? "" : ui.screen === "area" ? `#area/${enc(ui.areaId)}` : ui.screen === "workstream" ? `#workstream/${enc(ui.wsId)}/${ui.mode}` : ui.screen === "list" ? `#list/${enc(ui.wsId)}/${enc(ui.listId)}` : `#review/${window.AtlasReview.currentTab()}`;
    if (location.hash !== hash) history.pushState(null, "", location.pathname + location.search + hash);
  }
  function readRoute() {
    let parts;
    try { parts = location.hash.slice(1).split("/").map(decodeURIComponent); } catch { return false; }
    const [view, first, second] = parts;
    if (view === "workspace" && !location.pathname.endsWith("/workspace.html")) { location.replace("workspace.html"); return true; }
    if (view === "review") { window.AtlasReview.open(first); return true; }
    if (view === "area" && AREAS.some(([id]) => id === first)) { nav("area", null, null, first); return true; }
    if (["workstream", "list"].includes(view) && wsById(first)) {
      if (view === "list" && !findList(wsById(first), second)) return false;
      ui = {...ui, screen:view, wsId:first, listId:view === "list" ? second : null, areaId:wsById(first).area, mode:["list","organize","validate","execute"].includes(second) ? second : "list", listTag:""};
      render(); return true;
    }
    if (!view) { ui.screen = "home"; render(); return true; }
    return false;
  }
  addEventListener("popstate", readRoute);
  addEventListener("hashchange", readRoute);
  // Render the shared Intellibus navigation around the current planning view.
  function shell(inner) {
    document.body.classList.toggle("motion-paused", motionPaused);
    document.body.classList.toggle("sphere-dashboard", ui.screen === "home" && !location.pathname.endsWith("/workspace.html"));
    if (ui.screen !== "home")
      inner = `<section class="atlas-surface planning-surface">${inner}</section>`;
    app.innerHTML = `<nav class="mission-nav" aria-label="Main navigation"><button class="logo-home" data-action="home" aria-label="Intellibus Atlas dashboard"><img src="assets/intellibus-logo.svg" alt="Intellibus" width="166" height="31"></button><span class="nav-divider"></span><span class="product-name">ATLAS <small>2027</small></span><div class="nav-tools"><button class="nav-link" data-action="home">Overview</button><button class="nav-link workspace-nav" data-action="workspace">Workspace</button><a class="nav-link" href="atlas-reference.html#people">People</a><a class="nav-link" href="atlas-reference.html#transport">Transport</a><a class="nav-link" href="atlas-reference.html#direction">Operations</a><button class="motion-toggle" data-action="toggle-motion" aria-pressed="${motionPaused}" aria-label="${motionPaused ? "Play decorative motion" : "Pause decorative motion"}" title="Pause or resume decorative animation">${motionPaused ? "Play motion" : "Pause motion"}</button></div></nav>${inner}`;
    window.AtlasSphere?.mount();
  }
  function number(n) {
    return String(n).padStart(2, "0");
  }
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function areaName(id) {
    return AREAS.find(([key]) => key === id)?.[1] || "All areas";
  }
  function tagsOf(items) {
    return [...new Set(items.flatMap((x) => x.tags || []))].sort((a, b) =>
      a.localeCompare(b),
    );
  }
  function tagOptions(tags, selected) {
    return `<option value="">All tags</option>${tags.map((t) => `<option value="${esc(t)}" ${selected === t ? "selected" : ""}>${esc(t)}</option>`).join("")}`;
  }
  function tagPills(it) {
    return (it.tags || [])
      .map(
        (t) =>
          `<button class="tag" type="button" data-action="show-tag" data-tag="${esc(t)}" title="See all ${esc(t)} tasks">${esc(t)}</button>`,
      )
      .join("");
  }
  function dueChip(it) {
    if (it.status === "Done") return "";
    if (!it.date) return "";
    const [year, month, day] = it.date.split("-").map(Number);
    const due = Date.UTC(year, month - 1, day),
      now = new Date(),
      today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    if (!Number.isFinite(due)) return "";
    const days = Math.round((due - today) / 86400000),
      label =
        days < 0 ? `${-days}d late` : days === 0 ? "Today" : `${days}d left`,
      tone = days < 0 ? "late" : days === 0 ? "today" : "ahead";
    return `<span class="due-chip ${tone}" title="Due ${esc(it.date)}" aria-label="Due ${esc(it.date)}: ${label}">${label}</span>`;
  }
  function plainRow(id, title, sub, i, total, kind, action, extra = "") {
    return `<article class="row" draggable="true" data-drag-kind="${kind}" data-open-action="${action}" data-id="${esc(id)}"><button class="drag-grip" type="button" data-action="toggle-move" aria-label="Show move controls for ${esc(title)}" aria-expanded="false">⠿</button><span class="row-index"><span class="row-number">${number(i + 1)}</span><span class="reorder-controls"><button class="arrow" type="button" data-action="move-${kind}" data-id="${esc(id)}" data-by="-1" aria-label="Move ${esc(title)} up" ${i === 0 ? "disabled" : ""}>↑</button><button class="arrow" type="button" data-action="move-${kind}" data-id="${esc(id)}" data-by="1" aria-label="Move ${esc(title)} down" ${i === total - 1 ? "disabled" : ""}>↓</button></span></span><div><button class="row-title" type="button" data-action="${action}" data-id="${esc(id)}">${esc(title)}</button>${sub ? `<p class="row-sub">${esc(sub)}</p>` : ""}</div><div class="row-actions">${extra}</div></article>`;
  }
  function reviewControl(l) {
    return `<select class="review-select" data-review="${esc(l.id)}" aria-label="Review ${esc(l.title)}">${["Needs review", "Checked", "Not needed"].map((v) => `<option value="${v}" ${l.review === v ? "selected" : ""}>${v}</option>`).join("")}</select>`;
  }
  function areaStats(id) {
    const workstreams = data.workstreams.filter((w) => w.area === id),
      checks = workstreams.flatMap((w) => Object.values(readiness(w))),
      ready = checks.filter(Boolean).length;
    const percent = checks.length
      ? Math.round((ready / checks.length) * 100)
      : 0;
    const overdue = workstreams.some((w) =>
      allItems(w).some(
        (it) => it.date && it.status !== "Done" && it.date < todayKey(),
      ),
    );
    return {
      workstreams,
      ready,
      total: checks.length,
      percent,
      state: overdue
        ? "attention"
        : ready === 0
          ? "unknown"
          : ready === checks.length
            ? "met"
            : "watch",
    };
  }
  function attentionItems() {
    const today = todayKey();
    return data.workstreams
      .flatMap((w) =>
        allLists(w).flatMap((l) =>
          (l.items || [])
            .filter(
              (it) =>
                it.status !== "Done" &&
                (it.focus ||
                  it.status === "Waiting" ||
                  (it.date && it.date <= today)),
            )
            .map((it) => ({ w, l, it, overdue: !!it.date && it.date < today })),
        ),
      )
      .sort(
        (a, b) =>
          Number(!!b.it.focus) - Number(!!a.it.focus) ||
          Number(b.overdue) - Number(a.overdue) ||
          (a.it.date || "9999").localeCompare(b.it.date || "9999"),
      )
      .slice(0, 4);
  }
  function upcomingMilestones() {
    return data.workstreams
      .flatMap((w) =>
        allLists(w)
          .filter((l) => l.kind === "milestones")
          .flatMap((l) =>
            (l.items || [])
              .filter((it) => it.date && it.status !== "Done")
              .map((it) => ({ w, l, it })),
          ),
      )
      .sort((a, b) => a.it.date.localeCompare(b.it.date))
      .slice(0, 4);
  }
  // Filter and paginate the workspace without changing the underlying planning records.
  function deckContent() {
    const q = deck.query.trim().toLowerCase();
    const streams = data.workstreams.filter(
      (w) => !deck.area || w.area === deck.area,
    );
    const isStreams = deck.mode === "workstreams";
    const entries = isStreams
      ? streams.filter((w) =>
          [w.title, w.originalTitle, w.lead]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : streams.flatMap((w) =>
          allLists(w)
            .filter((l) => deck.mode === "search" || l.kind === deck.mode)
            .flatMap((l) =>
              (l.items || [])
                .filter((it) =>
                  [it.text, it.owner, it.notes, w.title, ...(it.tags || [])]
                    .join(" ")
                    .toLowerCase()
                    .includes(q),
                )
                .map((it) => ({ w, l, it })),
            ),
        );
    const size = window.matchMedia("(max-width:600px)").matches ? 4 : 6,
      pages = Math.max(1, Math.ceil(entries.length / size));
    deck.page = Math.min(deck.page, pages - 1);
    const visible = entries.slice(deck.page * size, (deck.page + 1) * size);
    return `<div class="deck-results">${
      visible.length
        ? visible
            .map((entry) => {
              if (isStreams) {
                const w = entry,
                  items = allItems(w),
                  done = items.filter((it) => it.status === "Done").length;
                return `<article class="deck-row"><div class="stream-info"><button class="stream-title" data-action="open-workstream" data-id="${esc(w.id)}">${esc(w.title)} <span>↗</span></button><small>${esc(w.lead || "Lead not assigned")} · ${done}/${items.length} items done</small></div><div class="direct-links">${[
                  ["work", "Tasks"],
                  ["people", "People"],
                  ["milestones", "Dates"],
                ]
                  .map(([kind, label]) => {
                    const l = w.lists.find((l) => l.kind === kind);
                    return l
                      ? `<button data-action="quick-list" data-ws="${esc(w.id)}" data-list="${esc(l.id)}">${label} <span>${itemCount(l)}</span></button>`
                      : "";
                  })
                  .join("")}</div></article>`;
              }
              const { w, l, it } = entry;
              return `<button class="deck-row search-result" data-action="open-attention" data-ws="${esc(w.id)}" data-list="${esc(l.id)}" data-item="${esc(it.id)}"><span class="stream-info"><strong>${esc(it.text)}</strong><small>${esc(w.title)} · ${esc(l.title)}${it.owner ? " · " + esc(it.owner) : ""}</small></span><span class="result-status">${esc(it.date || it.status)} ↗</span></button>`;
            })
            .join("")
        : '<p class="empty">No matches. Try a different search or area.</p>'
    }</div><div class="deck-pagination"><span>${entries.length ? deck.page * size + 1 : 0}–${Math.min((deck.page + 1) * size, entries.length)} of ${entries.length} ${isStreams ? "workstreams" : "items"}</span><div><button data-action="deck-page" data-by="-1" ${deck.page === 0 ? "disabled" : ""} aria-label="Previous results">←</button><span>${deck.page + 1} / ${pages}</span><button data-action="deck-page" data-by="1" ${deck.page === pages - 1 ? "disabled" : ""} aria-label="Next results">→</button></div></div>`;
  }
  // Gauges always pair a visual range with a text value; missing data is never treated as zero.
  function statusGauge({ title, value, total, detail, action, mode, tone = "blue" }) {
    const known = value !== null && value !== "" && value !== undefined && Number.isFinite(Number(value));
    const ranged = known && Number(total) > 0;
    const percent = ranged ? Math.max(0, Math.min(100, Number(value) / Number(total) * 100)) : 0;
    const display = known ? Number(value).toLocaleString() : "Not reported";
    return `<article class="status-gauge ${tone} ${known ? "" : "unreported"}"><header><span>${esc(title)}</span><span class="gauge-tag">${known ? "Recorded" : "Awaiting data"}</span></header><div class="gauge-visual"><svg viewBox="0 0 160 94" aria-hidden="true"><path class="gauge-track" d="M16 80 A64 64 0 0 1 144 80" pathLength="100"/><path class="gauge-fill" d="M16 80 A64 64 0 0 1 144 80" pathLength="100" stroke-dasharray="${percent} 100"/></svg><strong class="${known ? "" : "gauge-unknown"}">${display}</strong></div><p class="gauge-range">${ranged ? `${Math.round(percent)}% · of ${Number(total).toLocaleString()} ${title === "Items completed" || title === "Items waiting" ? "items" : "target"}` : Number(total) > 0 ? `Target: ${Number(total).toLocaleString()}` : "Target not set"}</p><p class="gauge-detail">${esc(detail)}</p><button data-action="${action}" ${mode ? `data-mode="${mode}"` : ""}>${action === "edit-numbers" ? "Update count" : "View details"} <span aria-hidden="true">↗</span></button></article>`;
  }

  // Compose verified targets, direct workstream shortcuts, attention items and milestones.
  function home() {
    // The landing page is a short destination menu; planning has its own URL.
    if (!location.pathname.endsWith('/workspace.html')) {
      shell(`<div class="command-home compact-home">${window.AtlasSphereView({})}</div>`);
      return;
    }
    const list = data.workstreams.filter((w) =>
      (w.title + " " + w.originalTitle)
        .toLowerCase()
        .includes(ui.search.toLowerCase()),
    );
    const tagged = data.workstreams.flatMap((w) =>
      allLists(w).flatMap((l) =>
        (l.items || [])
          .filter((it) => (it.tags || []).includes(ui.tag))
          .map((it) => ({ w, l, it })),
      ),
    );
    const tags = tagsOf(data.workstreams.flatMap(allItems));
    const attention = attentionItems(),
      milestones = upcomingMilestones();
    const items = data.workstreams.flatMap(allItems),
      done = items.filter((it) => it.status === "Done").length,
      waiting = items.filter((it) => it.status === "Waiting").length;
    shell(`<div class="command-home"><section class="workspace-shell atlas-surface" id="workspace" aria-label="Planning workspace"><header class="workspace-heading"><div><p class="eyebrow">ATLAS / EVENT OPERATIONS</p><h1>Planning workspace</h1><p class="small">Review tasks, owners and deadlines. Search below, then open a workstream to see or edit its lists.</p></div><p class="dashboard-state">${window.AtlasTeam?.active ? "Shared team plan" : "Personal browser draft"}<br><span>23–24 Jan 2027 · Montego Bay</span></p></header>
      <nav class="review-tabs review-shortcuts" aria-label="Planning views">${[
        ["progress", "Progress & attention"],
        ["owners", "Ownership"],
        ["recruitment", "Recruitment"],
        ["dependencies", "Dependencies"],
        ["decisions", "Decisions"],
        ["publication", "Website readiness"],
      ]
        .map(
          ([key, label]) =>
            `<button data-action="delivery" data-mode="${key}">${label}</button>`,
        )
        .join("")}</nav>
      ${window.AtlasVisuals.command(data)}<section class="dashboard-gauges" aria-label="Event status at a glance">${statusGauge({title:"Items completed",value:done,total:items.length,detail:"Unweighted planning checklist",action:"delivery",mode:"progress"})}${statusGauge({title:"Items waiting",value:waiting,total:items.length,detail:"Waiting items need follow-up",action:"delivery",mode:"progress",tone:"amber"})}${data.command.headlines.map(id => data.command.metrics.find(m => m.id === id)).filter(Boolean).map(m => statusGauge({title:m.name,value:m.current,total:m.target,detail:m.current == null || m.current === "" ? "No verified count entered yet" : "Recorded count against planning target",action:"edit-numbers"})).join("")}</section>
      <p class="dashboard-caption">Counts reflect this plan. Targets are planning assumptions; missing counts are not zero.</p>
      <div class="flight-grid"><section class="command-panel explorer-panel"><div class="panel-heading"><div><p class="eyebrow">YOUR WORKSPACE</p><h2>Workstream register</h2></div><span class="live-label">${window.AtlasTeam?.active ? "Shared team plan" : "Browser-saved plan"}</span></div><div class="deck-tools"><label class="deck-search"><span aria-hidden="true">⌕</span><input id="deck-search" type="search" value="${esc(deck.query)}" placeholder="Search this view…" aria-label="Search planning data"></label><select id="deck-area" aria-label="Filter by main area"><option value="">All areas</option>${AREAS.map(([id, title]) => `<option value="${id}" ${deck.area === id ? "selected" : ""}>${esc(title)}</option>`).join("")}</select></div><div class="deck-tabs" role="group" aria-label="Data to explore">${[
        ["workstreams", "Workstreams"],
        ["people", "People"],
        ["work", "Tasks"],
        ["milestones", "Milestones"],
        ["search", "All data"],
      ]
        .map(
          ([key, label]) =>
            `<button data-action="deck-mode" data-mode="${key}" aria-pressed="${deck.mode === key}">${label}</button>`,
        )
        .join("")}</div><div id="deck-content">${deckContent()}</div></section>
      <aside class="signal-stack"><section class="command-panel"><div class="panel-heading"><h2><span class="heading-dot amber"></span>Needs attention</h2><span class="small">${attention.length ? "Top " + attention.length : ""}</span></div>${attention.length ? attention.map(({ w, l, it }) => `<button class="signal-entry" data-action="open-attention" data-ws="${esc(w.id)}" data-list="${esc(l.id)}" data-item="${esc(it.id)}"><strong>${esc(it.text)}</strong><small>${esc(w.title)} · ${esc(it.date || "Pinned")}</small></button>`).join("") : '<div class="clear-state"><span>✓</span><div><strong>No items flagged</strong><p>Waiting, due and pinned items appear here.</p></div></div>'}</section><section class="command-panel"><div class="panel-heading"><h2><span class="heading-dot"></span>Next milestones</h2></div>${
        milestones.length
          ? milestones
              .map(({ w, l, it }) => {
                const d = new Date(it.date + "T12:00:00");
                return `<button class="timeline-entry" data-action="open-attention" data-ws="${esc(w.id)}" data-list="${esc(l.id)}" data-item="${esc(it.id)}"><span class="date-tile"><small>${d.toLocaleString("en-US", { month: "short" })}</small><b>${d.getDate()}</b></span><span><strong>${esc(it.text)}</strong><small>${esc(w.title)}</small></span><span>↗</span></button>`;
              })
              .join("")
          : '<p class="small">Add a date to a milestone to see it here.</p>'
      }</section><a class="reference-shortcut" href="atlas-reference.html#people"><span>PEOPLE · PHOTOS · TRANSPORT<strong>Explore people & operations</strong></span><b>↗</b></a></aside></div><div class="workspace-utilities">
      <details class="brief numbers-panel" data-persist="numbers"><summary>Update target & current numbers</summary><div class="command-settings"><p>All planning targets are editable assumptions. Current values must be verified; blank means unknown. Roster prospects are not confirmations. Other workstream targets stay here to keep the headline view focused.</p><div class="fields">${data.command.headlines.map((id, i) => `<label class="field">Headline measure ${i + 1}<select data-headline="${i}">${data.command.metrics.map((m) => `<option value="${esc(m.id)}" ${m.id === id ? "selected" : ""}>${esc(m.name)}</option>`).join("")}</select></label>`).join("")}</div><div class="metric-edit-grid">${data.command.metrics.map((m) => `<div class="metric-edit"><strong>${esc(m.name)}</strong><small>${esc(m.source)}</small><label class="field">Target<input type="number" min="1" step="1" data-metric-target="${esc(m.id)}" value="${esc(m.target)}"></label><label class="field">Current<input type="number" min="0" step="1" data-metric-current="${esc(m.id)}" value="${m.current == null ? "" : esc(m.current)}" placeholder="Not entered"></label></div>`).join("")}</div></div></details>
      <details class="brief command-goal"><summary>Event outcomes & planning assumptions</summary><p>Connect talent, coaches and real business problems through the Atlas Agentic AI Hackathon 2027. Attendance and hacker figures remain planning targets. Confirm the participation buffer, trade-fair scope and Guinness requirements in Decisions before publishing commitments. The wider jobs ambition is not an event-day employment guarantee.</p></details>
      <details class="brief all-workstreams" data-persist="all-workstreams" ${ui.search || ui.tag ? "open" : ""}><summary>All workstreams · ${data.workstreams.length}</summary><div class="all-workstream-tools"><button class="btn" type="button" data-action="show-home-filter">${ui.search || ui.tag ? "Filter · on" : "Filter"}</button><button class="btn" type="button" data-action="show-add-workstream">+ Add workstream</button></div>
      ${ui.addWorkstreamOpen ? `<form class="form-row add-first" id="addWorkstreamForm"><input name="title" required maxlength="100" placeholder="New workstream" aria-label="New workstream"><select name="area" aria-label="Area">${AREAS.map(([id, title]) => `<option value="${id}">${esc(title)}</option>`).join("")}</select><button class="btn primary">Add</button></form>` : ""}
      ${ui.homeFiltersOpen ? `<section class="filter-panel"><label class="field">Find a workstream<input id="search" type="search" placeholder="Search workstreams" value="${esc(ui.search)}"></label><label class="field">See tasks by tag<select id="globalTag">${tagOptions(tags, ui.tag)}</select></label></section>` : ""}
      ${ui.tag ? `<section class="sheet tag-results">${tagged.length ? tagged.map(({ w, l, it }) => `<button class="tag-result" type="button" data-action="open-tag-item" data-ws="${esc(w.id)}" data-list="${esc(l.id)}"><span>${esc(it.text)}</span><small>${esc(w.title)} · ${esc(l.title)}</small></button>`).join("") : '<p class="empty">No tasks have this tag yet.</p>'}</section>` : ""}
      <section class="sheet" id="homeRows">${list.length ? list.map((w, i) => plainRow(w.id, w.title, "", i, list.length, "workstream", "open-workstream", readinessDots(w))).join("") : '<p class="empty">No matching workstream. Try another word.</p>'}</section></details>
      <details class="brief"><summary>Save or move this plan</summary><p>${window.AtlasTeam?.active ? "Edits autosave to the shared plan. Check the save status before leaving; unresolved edits remain in this account’s recovery draft." : "You are editing a personal draft saved in this browser. Sign in to load the separate shared plan."} Export a copy to keep or share.</p><button class="btn" type="button" data-action="export">Export plan</button> <button class="btn" type="button" data-action="import">Import plan</button><input id="importFile" type="file" accept="application/json,.json" hidden><p><a href="atlas-reference.html#people">People, profiles & transport</a></p></details></div></section></div>`);
  }
  function areaView() {
    const id = ui.areaId,
      stats = areaStats(id),
      list = stats.workstreams;
    shell(
      `<div class="crumb"><button type="button" data-action="workspace">Planning workspace</button><span>›</span><span>${esc(areaName(id))}</span></div><header class="compact-heading"><div><p class="eyebrow">Main area</p><h1>${esc(areaName(id))}</h1><p class="small">${stats.ready} of ${stats.total} planning checks ready across ${list.length} workstreams</p></div></header><section class="sheet">${list.map((w, i) => plainRow(w.id, w.title, "", i, list.length, "workstream", "open-workstream", readinessDots(w))).join("")}</section>`,
    );
  }
  function modeBar() {
    return `<nav class="steps" aria-label="LOVE planning steps">${[
      ["list", "Lists"],
      ["organize", "Organize lists"],
      ["validate", "Check lists"],
      ["execute", "Work to finish"],
    ]
      .map(
        ([key, label]) =>
          `<button class="step ${ui.mode === key ? "on" : ""}" type="button" data-action="mode" data-mode="${key}" aria-current="${ui.mode === key ? "step" : "false"}">${label}</button>`,
      )
      .join("")}</nav>`;
  }
  function workstream() {
    const w = wsById(ui.wsId);
    if (!w) return nav("home");
    const total = allItems(w).length,
      done = allItems(w).filter((x) => x.status === "Done").length;
    const head = `<div class="crumb"><button type="button" data-action="workspace">Planning workspace</button><span>›</span><button type="button" data-action="open-area" data-id="${esc(w.area)}">${esc(areaName(w.area))}</button><span>›</span><span>${esc(w.title)}</span></div><header class="compact-heading"><div><p class="eyebrow">Workstream</p><h1>${esc(w.title)}</h1><p class="small">${done} of ${total} items completed · Unweighted task count</p><div class="workstream-progress">${readinessDots(w)} <span>Planning completeness · five checks</span></div></div></header>${modeBar()}`;
    const after = `${readinessPanel(w)}<details class="brief"><summary>Edit this workstream</summary><div class="fields"><label class="field wide">Objective<textarea data-ws-brief="${esc(w.id)}">${esc(w.brief || "")}</textarea></label><label class="field wide">Measures of success<textarea data-ws-success="${esc(w.id)}">${esc(w.success || "")}</textarea></label><label class="field wide">Name<input data-ws-title="${esc(w.id)}" value="${esc(w.title)}" maxlength="100"></label></div></details>`;
    let body = "";
    if (
      ui.mode === "list" ||
      ui.mode === "organize" ||
      ui.mode === "validate"
    ) {
      const roots = w.lists.filter((l) => CORE.includes(l.kind) || !l.kind);
      const five = w.lists.filter((l) => FIVE.includes(l.kind));
      body = `<div class="bar"><div><h2>${ui.mode === "organize" ? "Put the lists in order" : ui.mode === "validate" ? "Check the lists" : "Lists"}</h2></div><button class="btn primary" type="button" data-action="show-add-list">+ Add list</button></div><div id="addList"></div><section class="sheet" id="listRows">${roots.map((l, i) => plainRow(l.id, l.title, `${itemCount(l)} item${itemCount(l) === 1 ? "" : "s"}`, i, roots.length, "list", "open-list", reviewControl(l))).join("")}</section>
      <details class="five"><summary>Map, Menu, Message, Metrics, Money</summary><section class="sheet" id="fiveRows">${five.map((l, i) => plainRow(l.id, l.title, `${itemCount(l)} item${itemCount(l) === 1 ? "" : "s"}`, i, five.length, "five", "open-list", reviewControl(l))).join("")}</section></details>`;
    } else {
      const open = allItems(w)
        .filter((x) => x.status !== "Done")
        .sort(
          (a, b) =>
            Number(b.status === "Waiting") - Number(a.status === "Waiting"),
        );
      body = `<div class="bar"><div><h2>Work to finish</h2><p>Give each item a person and a date. Mark it done when the work is complete.</p></div></div><div class="notice">SPEED means keeping the schedule, arriving on time, protecting energy, using useful tools, and reviewing the plan consistently.</div><section class="sheet section">${open.length ? open.map((x) => `<div class="check-row"><div><h3>${esc(x.text)}</h3><p>${x.owner ? `For ${esc(x.owner)}` : "Needs a person"} · ${x.date ? esc(x.date) : "Needs a date"}</p></div><button class="btn" type="button" data-action="mark-done" data-id="${esc(x.id)}">Mark done</button></div>`).join("") : '<p class="empty">No open items. Add more to any list if something is missing.</p>'}</section>
      <details class="brief"><summary>How will we work at SPEED?</summary><div class="speed-grid">${SPEED.map(([key, label, prompt]) => `<label class="field">${label}<span class="small">${prompt}</span><textarea data-speed="${key}" placeholder="Add a short note">${esc(w.speed?.[key] || "")}</textarea></label>`).join("")}</div></details>`;
    }
    shell(
      head +
        `<section class="workstream-purpose"><p><strong>Objective</strong> · ${esc(w.brief || "Objective needs review")}</p><p><strong>Accountable owner</strong> · ${esc(w.accountableOwner || "Not verified")}</p><p><strong>Success measures</strong> · ${esc(w.success || "Not yet defined")}</p><p class="small">Source planning content · review before approval</p></section>` +
        body + window.AtlasSavedPlan.render(w).replace(" open>", ' data-persist="saved-plan">') + window.AtlasPrizes.render(w.id) +
        after,
    );
  }
  function listView() {
    const w = wsById(ui.wsId),
      found = findList(w, ui.listId);
    if (!found) return nav("workstream", ui.wsId);
    const { list, parents } = found,
      children = list.children || [],
      items = [...(list.items || [])].sort(
        (a, b) => Number(a.status === "Done") - Number(b.status === "Done"),
      ),
      tags = tagsOf(items),
      visible = ui.listTag
        ? items.filter((it) => (it.tags || []).includes(ui.listTag))
        : items;
    const crumbs = `<div class="crumb"><button type="button" data-action="workspace">Planning workspace</button><span>›</span><button type="button" data-action="open-area" data-id="${esc(w.area)}">${esc(areaName(w.area))}</button><span>›</span><button type="button" data-action="open-workstream" data-id="${esc(w.id)}">${esc(w.title)}</button>${parents.map((p) => `<span>›</span><button type="button" data-action="open-list" data-id="${esc(p.id)}">${esc(p.title)}</button>`).join("")}<span>›</span><span>${esc(list.title)}</span></div>`;
    shell(`${crumbs}<header class="compact-heading"><div><p class="eyebrow workstream-context">${esc(w.title)}</p><h1>${esc(list.title)}</h1>${list.prompt ? `<p class="small">${esc(list.prompt)}</p>` : ""}</div><button class="btn primary" type="button" data-action="show-add-item">+ Add item</button></header>
      <div id="addItemMount"></div>
      <section class="sheet" id="itemRows">${
        visible.filter((it) => it.status !== "Done").length
          ? visible
              .filter((it) => it.status !== "Done")
              .map((it, i, arr) => itemRow(it, i, arr.length))
              .join("")
          : `<p class="empty">${ui.listTag && !visible.length ? "No items have this tag. Choose another tag or clear the filter." : visible.length ? "All items shown are completed. Open Completed below to review them." : "Nothing here yet. Add the first item above."}</p>`
      }</section>
      <details class="brief completed-items" data-persist="completed"><summary>Completed · ${visible.filter((it) => it.status === "Done").length}</summary>${visible
        .filter((it) => it.status === "Done")
        .map((it, i, arr) => itemRow(it, i, arr.length))
        .join("")}</details>
      ${tags.length ? `<details class="brief" data-persist="list-filter"><summary>Filter this list${ui.listTag ? ` · ${esc(ui.listTag)}` : ""}</summary><label class="field tag-filter">Show items by tag<select id="listTag">${tagOptions(tags, ui.listTag)}</select></label></details>` : ""}
      <details class="brief list-options" data-persist="list-options"><summary>Smaller lists and list settings ${children.length ? `· ${children.length} smaller list${children.length === 1 ? "" : "s"}` : ""}</summary>
        <div class="bar"><div><h2>Smaller lists</h2><p>Make a smaller list when a topic needs its own detail.</p></div></div><section class="sheet" id="subRows">${children.length ? children.map((l, i) => plainRow(l.id, l.title, `${itemCount(l)} items`, i, children.length, "sublist", "open-list")).join("") : '<p class="empty">No smaller lists yet.</p>'}</section>
        <form class="form-row" id="addSublist"><input name="title" required maxlength="100" placeholder="Name a smaller list" aria-label="Name a smaller list"><button class="btn" type="submit">+ Add smaller list</button></form>
        <div class="review"><label for="review">Checked?</label><select id="review" data-review="${esc(list.id)}">${["Needs review", "Checked", "Not needed"].map((v) => `<option value="${v}" ${list.review === v ? "selected" : ""}>${v}</option>`).join("")}</select><input data-review-note="${esc(list.id)}" value="${esc(list.reviewNote || "")}" placeholder="Why? Add a short note"></div>
        <div class="fields"><label class="field wide">List name<input data-list-title="${esc(list.id)}" value="${esc(list.title)}" maxlength="100"></label><label class="field wide">What belongs here?<input data-list-prompt="${esc(list.id)}" value="${esc(list.prompt || "")}" maxlength="240"></label></div>
      </details>`);
  }
  function itemRow(it, i, total) {
    const updates = it.updates || [];
    return `<article class="item-row" draggable="true" data-drag-kind="item" data-id="${esc(it.id)}"><button class="drag-grip" type="button" data-action="toggle-move" aria-label="Show move controls for ${esc(it.text)}" aria-expanded="false">⠿</button><span class="row-index item-index"><span class="item-number">${number(i + 1)}</span><span class="reorder-controls"><button class="arrow" type="button" data-action="move-item" data-id="${esc(it.id)}" data-by="-1" aria-label="Move item up" ${i === 0 ? "disabled" : ""}>↑</button><button class="arrow" type="button" data-action="move-item" data-id="${esc(it.id)}" data-by="1" aria-label="Move item down" ${i === total - 1 ? "disabled" : ""}>↓</button></span></span><div><div class="item-title">${esc(it.text)}</div><div class="item-meta">${dueChip(it)}<span class="item-tags">${tagPills(it)}</span></div>${it.owner ? `<div class="item-note">${esc(it.owner)}</div>` : ""}</div><div class="item-controls"><label class="task-complete"><input type="checkbox" data-item-complete="${esc(it.id)}" ${it.status === "Done" ? "checked" : ""} aria-label="Complete ${esc(it.text)}"> Done</label><select data-item-status="${esc(it.id)}" aria-label="Status for ${esc(it.text)}">${["To do", "Doing", "Waiting", "Done"].map((v) => `<option value="${v}" ${it.status === v ? "selected" : ""}>${v === "To do" ? "To Do" : v}</option>`).join("")}</select></div><details class="item-more"><summary>Details${updates.length ? ` · ${updates.length} update${updates.length === 1 ? "" : "s"}` : ""}</summary><div class="fields"><label class="field wide">Item<input data-item-text="${esc(it.id)}" value="${esc(it.text)}"></label><label class="field wide">Tags<input data-item-tags="${esc(it.id)}" value="${esc((it.tags || []).join(", "))}" placeholder="Add tags separated by commas"></label><label class="field">Person responsible<input data-item-owner="${esc(it.id)}" value="${esc(it.owner)}" placeholder="Name a person"></label><label class="field">Due date<input data-item-date="${esc(it.id)}" type="date" value="${esc(it.date)}"></label><label class="field wide focus-field"><input type="checkbox" data-item-focus="${esc(it.id)}" ${it.focus ? "checked" : ""}> Pin this item to Needs attention</label><label class="field wide">Working notes<textarea data-item-notes="${esc(it.id)}" placeholder="Add useful detail">${esc(it.notes)}</textarea></label></div><h4 class="updates-title">Notes and decisions</h4><ol class="updates">${updates.length ? updates.map((u) => `<li><b>${esc(u.kind)}</b> · <time>${esc(new Date(u.at).toLocaleString())}</time><p>${esc(u.text)}</p></li>`).join("") : '<li class="empty-update">No updates yet.</li>'}</ol><form class="form-row update-form" id="addUpdate" data-item-id="${esc(it.id)}"><select name="kind" aria-label="Update type"><option>Note</option><option>Decision</option></select><input name="text" required maxlength="1000" placeholder="What changed or was decided?" aria-label="New note or decision"><button class="btn" type="submit">Add update</button></form>${it.source ? `<div class="source">From ${esc(it.source)}</div>` : ""}<button class="btn quiet" type="button" data-action="promote-item" data-id="${esc(it.id)}">Make this a smaller list</button></details></article>`;
  }
  // Refresh the selected screen while retaining expanded panels and edit context.
  function render(keepScroll = false) {
    const y = window.scrollY;
    // Restore each data viewport after a save so an edit deep in a roster does not jump to its first row.
    const regionScroll = keepScroll
      ? [...app.querySelectorAll(".depth-chapter[id] > .glass-scroll")].map(
          (el) => [el.parentElement.id, el.scrollTop, el.scrollLeft],
        )
      : [];
    const openItems = keepScroll
      ? [...app.querySelectorAll(".item-row[data-id]")]
          .filter((row) => row.querySelector("details.item-more")?.open)
          .map((row) => row.dataset.id)
      : [];
    const openPanels = keepScroll
      ? [...app.querySelectorAll("details[data-persist]")]
          .filter((x) => x.open)
          .map((x) => x.dataset.persist)
      : [];
    if (ui.screen === "home") home();
    else if (ui.screen === "delivery") shell(window.AtlasReview.render());
    else if (ui.screen === "area") areaView();
    else if (ui.screen === "workstream") workstream();
    else listView();
    if (ui.openItemId && ui.screen === "list") {
      const row = [...app.querySelectorAll(".item-row[data-id]")].find(
        (x) => x.dataset.id === ui.openItemId,
      );
      if (row) {
        row.querySelector("details.item-more").open = true;
        if (row.closest(".completed-items"))
          row.closest(".completed-items").open = true;
        row.scrollIntoView?.({ block: "center" });
      }
      ui.openItemId = null;
    }
    if (keepScroll) {
      for (const row of app.querySelectorAll(".item-row[data-id]"))
        if (openItems.includes(row.dataset.id))
          row.querySelector("details.item-more").open = true;
      for (const panel of app.querySelectorAll("details[data-persist]"))
        if (openPanels.includes(panel.dataset.persist)) panel.open = true;
      for (const [id, top, left] of regionScroll) {
        const region = document
          .getElementById(id)
          ?.querySelector(".glass-scroll");
        if (region) {
          region.scrollTop = top;
          region.scrollLeft = left;
        }
      }
      window.scrollTo(0, y);
    }
  }
  function currentList() {
    return findList(wsById(ui.wsId), ui.listId)?.list;
  }
  function itemById(id) {
    const w = wsById(ui.wsId);
    return w ? allItems(w).find((x) => x.id === id) : null;
  }
  function listById(id) {
    return findList(wsById(ui.wsId), id)?.list;
  }
  function newList(title) {
    return {
      id: "list-" + uid(),
      kind: "",
      title,
      prompt: "Add everything this list needs.",
      review: "Needs review",
      reviewNote: "",
      items: [],
      children: [],
    };
  }

  app.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) {
      const item = e.target.closest(".item-row");
      if (
        item &&
        !e.target.closest("button,input,select,textarea,a,summary,.item-more")
      ) {
        const details = item.querySelector("details.item-more");
        if (details) details.open = !details.open;
        return;
      }
      const row = e.target.closest("[data-open-action]");
      if (row && !e.target.closest("button,input,select,textarea,a,summary"))
        return row.dataset.openAction === "open-workstream"
          ? nav("workstream", row.dataset.id)
          : nav("list", ui.wsId, row.dataset.id);
      return;
    }
    const { action, id, by, mode } = button.dataset,
      w = wsById(ui.wsId);
    if (action === "toggle-move") {
      const row = button.closest(".row,.item-row");
      if (row) {
        const open = row.classList.toggle("move-open");
        button.setAttribute("aria-expanded", String(open));
      }
      return;
    }
    if (action === "toggle-motion") {
      motionPaused = !motionPaused;
      window.AtlasSave.write("atlas-motion-paused", String(motionPaused));
      document.body.classList.toggle("motion-paused", motionPaused);
      button.textContent = motionPaused ? "Play motion" : "Pause motion";
      button.setAttribute("aria-pressed", String(motionPaused));
      return;
    }
    if (action === "deck-mode") {
      deck.mode = mode;
      deck.page = 0;
      return render(true);
    }
    if (action === "deck-page") {
      deck.page += Number(by);
      document.getElementById("deck-content").innerHTML = deckContent();
      return;
    }
    if (action === "quick-list")
      return nav("list", button.dataset.ws, button.dataset.list);
    // The workspace shortcut bypasses the cinematic scroll without changing any data.
    if (action === "workspace") {
      location.href = 'workspace.html';
      return;
    }
    if (action === "edit-numbers") {
      const panel = document.querySelector('.numbers-panel');
      if (panel) { panel.open = true; panel.scrollIntoView({block:'start',behavior:'instant'}); panel.querySelector('input')?.focus({preventScroll:true}); }
      return;
    }
    if (action === "delivery") return window.AtlasReview.open(mode);
    if (action === "home") { location.href = "index.html"; return; }
    if (action === "open-area") return nav("area", null, null, id);
    if (action === "open-attention") {
      ui.openItemId = button.dataset.item;
      return nav("list", button.dataset.ws, button.dataset.list);
    }
    if (action === "show-tag") {
      ui.tag = button.dataset.tag;
      ui.homeFiltersOpen = true;
      return nav("home");
    }
    if (action === "open-tag-item") {
      nav("list", button.dataset.ws, button.dataset.list);
      ui.listTag = ui.tag;
      return render();
    }
    if (action === "open-workstream") return nav("workstream", id);
    if (action === "open-list") return nav("list", ui.wsId, id);
    if (action === "mode") {
      ui.mode = mode;
      writeRoute();
      return render(true);
    }
    if (action === "show-home-filter") {
      ui.homeFiltersOpen = !ui.homeFiltersOpen;
      return render(true);
    }
    if (action === "show-add-workstream") {
      ui.addWorkstreamOpen = !ui.addWorkstreamOpen;
      render(true);
      if (ui.addWorkstreamOpen)
        document.querySelector("#addWorkstreamForm input").focus();
      return;
    }
    if (action === "cancel-add") {
      const form=button.closest("form");
      const trigger=document.querySelector(form?.id === "addItem" ? '[data-action="show-add-item"]' : '[data-action="show-add-list"]');
      form?.remove();trigger?.focus();return;
    }
    if (action === "show-add-item") {
      const mount = document.getElementById("addItemMount");
      mount.innerHTML =
        '<form class="form-row add-first" id="addItem"><input name="text" required maxlength="500" placeholder="New item" aria-label="New item"><button class="btn primary" type="submit">Add item</button><button class="btn" type="button" data-action="cancel-add">Cancel</button></form>';
      mount.querySelector("input").focus();
      return;
    }
    if (action === "export") {
      const file = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(file),
        a = document.createElement("a");
      a.href = url;
      a.download = "intellibus-love-speed-plan.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (action === "import") {
      if(window.AtlasTeam?.active && !window.AtlasTeam.canAdmin()){alert("Only the planner owner may import a saved backup.");return;}
      document.getElementById("importFile").click();
      return;
    }
    if (action === "show-add-list") {
      document.getElementById("addList").innerHTML =
        '<form class="form-row" id="addListForm"><input name="title" required maxlength="100" placeholder="Name the list" aria-label="Name the list"><button class="btn primary">Add list</button><button class="btn" type="button" data-action="cancel-add">Cancel</button></form>';
      document.querySelector("#addList input").focus();
      return;
    }
    if (
      action.startsWith("move-") &&
      window.AtlasTeam?.active &&
      (action === "move-workstream"
        ? !window.AtlasTeam.canManage()
        : !window.AtlasTeam.canOwn(w))
    ) {
      alert(
        "Only the assigned owner or a manager can reorder this shared workstream.",
      );
      return;
    }
    if (action === "move-workstream")
      return move(data.workstreams, id, Number(by));
    if (action === "move-list" || action === "move-five")
      return move(w.lists, id, Number(by));
    if (action === "move-sublist")
      return move(currentList().children, id, Number(by));
    if (action === "move-item") {
      // Move only within the visible completion group; hidden completed records never absorb a move.
      const arr = currentList().items,
        it = arr.find((x) => x.id === id);
      const group = arr.filter(
        (x) =>
          (x.status === "Done") === (it.status === "Done") &&
          (!ui.listTag || (x.tags || []).includes(ui.listTag)),
      );
      const i = group.findIndex((x) => x.id === id),
        j = i + Number(by);
      if (j >= 0 && j < group.length) {
        const a = arr.indexOf(group[i]),
          b = arr.indexOf(group[j]);
        [arr[a], arr[b]] = [arr[b], arr[a]];
        save();
        render(true);
      }
      return;
    }
    if (action === "mark-done") {
      const it = itemById(id);
      if (it) {
        (it.updates ||= []).push({
          kind: "Status",
          text: `${it.status} → Done`,
          at: new Date().toISOString(),
        });
        it.status = "Done";
        save();
        render(true);
      }
      return;
    }
    if (action === "promote-item") {
      const list = currentList(),
        i = list.items.findIndex((x) => x.id === id);
      if (i < 0) return;
      const it = list.items.splice(i, 1)[0],
        sub = newList(it.text);
      sub.items.push({ ...it, id: "item-" + uid() });
      list.children.push(sub);
      if (["work", "milestones"].includes(list.kind))
        list.review = "Needs review";
      save();
      render(true);
      return;
    }
  });
  app.addEventListener("submit", (e) => {
    const form = e.target;
    if (
      ![
        "addWorkstreamForm",
        "addListForm",
        "addSublist",
        "addItem",
        "addUpdate",
      ].includes(form.id)
    )
      return;
    e.preventDefault();
    if (form.id === "addUpdate") {
      const it = itemById(form.dataset.itemId),
        f = new FormData(form),
        text = String(f.get("text") || "").trim(),
        kind = String(f.get("kind") || "Note");
      if (!it || !text) return;
      (it.updates || (it.updates = [])).push({
        kind: kind === "Decision" ? "Decision" : "Note",
        text,
        at: new Date().toISOString(),
      });
      save();
      render(true);
      return;
    }
    const val = String(
      new FormData(form).get(form.id === "addItem" ? "text" : "title") || "",
    ).trim();
    if (!val) return;
    if (form.id === "addWorkstreamForm") {
      const lists = STARTER_DATA.workstreams[0].lists.map((l) => ({
          ...newList(l.title),
          kind: l.kind,
          prompt: l.prompt,
        })),
        area = String(new FormData(form).get("area") || "governance");
      data.workstreams.push({
        id: "ws-" + uid(),
        area: AREAS.some(([key]) => key === area) ? area : "governance",
        title: val,
        originalTitle: val,
        brief: "",
        lead: "",
        lists,
        speed: {},
      });
      ui.addWorkstreamOpen = false;
      save();
      render(true);
      return;
    }
    if (form.id === "addListForm") {
      const lists = wsById(ui.wsId).lists,
        at = lists.findIndex((l) => FIVE.includes(l.kind));
      lists.splice(at < 0 ? lists.length : at, 0, newList(val));
      save();
      render(true);
      return;
    }
    if (form.id === "addSublist") {
      currentList().children.push(newList(val));
      save();
      render(true);
      return;
    }
    if (form.id === "addItem") {
      const list = currentList();
      list.items.push({
        id: "item-" + uid(),
        text: val,
        tags: [],
        owner: "",
        date: "",
        status: "To do",
        notes: "",
        source: "",
      });
      if (["work", "milestones"].includes(list.kind))
        list.review = "Needs review";
      save();
      render(true);
    }
  });
  app.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.wsBrief || t.dataset.wsSuccess) {
      const w = wsById(t.dataset.wsBrief || t.dataset.wsSuccess);
      if (w) {
        w[t.dataset.wsBrief ? "brief" : "success"] = t.value;
        save();
      }
      return;
    }
    if (t.dataset.itemComplete) {
      const it = itemById(t.dataset.itemComplete);
      if (it) {
        it.status = t.checked ? "Done" : "To do";
        (it.updates ||= []).push({
          kind: "Status",
          text: it.status,
          at: new Date().toISOString(),
        });
        save();
        render(true);
      }
      return;
    }
    if (t.id === "deck-area") {
      deck.area = t.value;
      deck.page = 0;
      document.getElementById("deck-content").innerHTML = deckContent();
      return;
    }
    if (t.id === "globalTag") {
      ui.tag = t.value;
      render(true);
      return;
    }
    if (t.id === "listTag") {
      ui.listTag = t.value;
      render(true);
      return;
    }
    if (t.id === "importFile") {
      const file = t.files?.[0];
      if (!file) return;
      file
        .text()
        .then((text) => {
          let incoming;
          try {
            incoming = JSON.parse(text);
          } catch {
            alert("That is not a readable plan file.");
            return;
          }
          if (
            incoming.version !== 1 ||
            !Array.isArray(incoming.workstreams) ||
            !incoming.workstreams.every(
              (w) => w && typeof w.id === "string" && Array.isArray(w.lists),
            )
          ) {
            alert("That file is not a LOVE & SPEED plan.");
            return;
          }
          if (
            !confirm(
              "Replace this browser’s current plan with the imported copy? Export first if you want a backup.",
            )
          )
            return;
          data = ensureCommandAreas(ensureMilestones(incoming));
          ensureLiveMeasures();
          save();
          nav("home");
        })
        .catch(() => alert("The plan file could not be read."));
      return;
    }
    if (t.dataset.headline !== undefined) {
      const i = Number(t.dataset.headline);
      if (data.command.headlines[1 - i] === t.value) {
        alert("Choose two different measures.");
        render(true);
        return;
      }
      data.command.headlines[i] = t.value;
      save();
      render(true);
      return;
    }
    if (t.dataset.metricCurrent) {
      const metric = data.command.metrics.find(
        (x) => x.id === t.dataset.metricCurrent,
      );
      if (metric) {
        metric.current = t.value === "" ? null : Math.max(0, Number(t.value));
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.metricTarget) {
      const metric = data.command.metrics.find(
        (x) => x.id === t.dataset.metricTarget,
      );
      if (metric && Number(t.value) > 0) {
        metric.target = Number(t.value);
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.itemFocus) {
      const it = itemById(t.dataset.itemFocus);
      if (it) {
        it.focus = !!t.checked;
        save();
        render(true);
      }
      return;
    }
    if (
      t.dataset.review &&
      window.AtlasTeam?.active &&
      !window.AtlasTeam.canOwn(wsById(ui.wsId))
    ) {
      alert("Only the assigned owner or a manager can sign off this list.");
      render(true);
      return;
    }
    if (t.dataset.review) {
      const l = listById(t.dataset.review);
      if (l) {
        l.review = t.value;
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.wsTitle) {
      const w = wsById(t.dataset.wsTitle),
        v = t.value.trim();
      if (w && v) {
        w.title = v;
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.listTitle) {
      const l = listById(t.dataset.listTitle),
        v = t.value.trim();
      if (l && v) {
        l.title = v;
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.listPrompt) {
      const l = listById(t.dataset.listPrompt);
      if (l) {
        l.prompt = t.value.trim();
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.reviewNote) {
      const l = listById(t.dataset.reviewNote);
      if (l) {
        l.reviewNote = t.value;
        save();
      }
      return;
    }
    if (t.dataset.speed) {
      const w = wsById(ui.wsId);
      (w.speed || (w.speed = {}))[t.dataset.speed] = t.value;
      save();
      return;
    }
    if (t.dataset.budgetType) {
      const w = wsById(t.dataset.budgetType);
      if (w) {
        w.readinessBudget = { ...(w.readinessBudget || {}), type: t.value };
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.budgetAmount) {
      const w = wsById(t.dataset.budgetAmount);
      if (w) {
        w.readinessBudget = { ...(w.readinessBudget || {}), amount: t.value };
        save();
        render(true);
      }
      return;
    }
    if (t.dataset.itemTags) {
      const it = itemById(t.dataset.itemTags);
      if (it) {
        it.tags = [
          ...new Set(
            t.value
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
          ),
        ];
        save();
        render(true);
      }
      return;
    }
    const fields = [
      ["itemStatus", "status"],
      ["itemText", "text"],
      ["itemOwner", "owner"],
      ["itemDate", "date"],
      ["itemNotes", "notes"],
    ];
    for (const [attr, field] of fields)
      if (t.dataset[attr]) {
        const it = itemById(t.dataset[attr]);
        if (it) {
          if (field === "status" && it.status !== t.value)
            (it.updates ||= []).push({
              kind: "Status",
              text: `${it.status} → ${t.value}`,
              at: new Date().toISOString(),
            });
          it[field] = t.value;
          if (
            field === "text" &&
            ["work", "milestones"].includes(currentList()?.kind)
          )
            currentList().review = "Needs review";
          save();
          if (field !== "notes") render(true);
        }
        return;
      }
  });
  app.addEventListener("input", (e) => {
    if (e.target.id === "deck-search") {
      deck.query = e.target.value;
      deck.page = 0;
      document.getElementById("deck-content").innerHTML = deckContent();
      return;
    }
    if (e.target.id === "search") {
      ui.search = e.target.value;
      const selection = e.target.selectionStart;
      render(true);
      const next = document.getElementById("search");
      next.focus();
      next.setSelectionRange(selection, selection);
    }
  });
  app.addEventListener("dragstart", (e) => {
    const row = e.target.closest("[data-drag-kind][data-id]");
    if (!row) return;
    if (
      window.AtlasTeam?.active &&
      (row.dataset.dragKind === "workstream"
        ? !window.AtlasTeam.canManage()
        : !window.AtlasTeam.canOwn(wsById(ui.wsId)))
    ) {
      e.preventDefault();
      return;
    }
    drag = { kind: row.dataset.dragKind, id: row.dataset.id };
    row.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", drag.id);
  });
  app.addEventListener("dragover", (e) => {
    const row = e.target.closest("[data-drag-kind][data-id]");
    if (!row || !drag || drag.kind !== row.dataset.dragKind) return;
    e.preventDefault();
    row.classList.add("drop-target");
  });
  app.addEventListener("dragleave", (e) =>
    e.target.closest(".drop-target")?.classList.remove("drop-target"),
  );
  app.addEventListener("drop", (e) => {
    const row = e.target.closest("[data-drag-kind][data-id]");
    if (!row || !drag || drag.kind !== row.dataset.dragKind) return;
    e.preventDefault();
    const kind = drag.kind,
      w = wsById(ui.wsId);
    const arr =
      kind === "workstream"
        ? data.workstreams
        : kind === "item"
          ? currentList().items
          : kind === "sublist"
            ? currentList().children
            : w.lists;
    if (
      kind === "item" &&
      (arr.find((x) => x.id === drag.id)?.status === "Done") !==
        (arr.find((x) => x.id === row.dataset.id)?.status === "Done")
    ) {
      drag = null;
      return;
    }
    reorder(arr, drag.id, row.dataset.id);
    drag = null;
  });
  app.addEventListener("dragend", () => {
    drag = null;
    app
      .querySelectorAll(".dragging,.drop-target")
      .forEach((x) => x.classList.remove("dragging", "drop-target"));
  });
  // Reuse the same state, export and save flow for the delivery workspace.
  window.AtlasReview.init({
    data: () => data,
    lists: allLists,
    today: todayKey,
    save,
    refresh: () => render(true),
    open: () => nav("delivery"),
  });
  window.AtlasTeam.init({
    snapshot: () => data,
    replace(plan) {
      data = ensureCommandAreas(ensureMilestones(plan));
      ensureLiveMeasures();
      render(true);
    },
  });
  // Read-only navigation metadata. Route changes never enter saved records.
  window.AtlasPlannerNavigation = {
    context: () => ({screen:ui.screen,wsId:ui.wsId,listId:ui.listId,areaId:ui.areaId,mode:ui.mode}),
    areas: () => AREAS.map(([id,title])=>({id,title})),
    workstreams: () => data.workstreams.map(w=>({id:w.id,title:w.title,area:w.area,lists:allLists(w).map(l=>({id:l.id,title:l.title}))})),
  };
  // Open a shared workstream link directly without changing saved planning data.
  const linkedWorkstream = new URLSearchParams(location.search).get("workstream");
  if (location.hash && readRoute()) {}
  else if (linkedWorkstream && wsById(linkedWorkstream)) nav("workstream", linkedWorkstream);
  else render();
})();
