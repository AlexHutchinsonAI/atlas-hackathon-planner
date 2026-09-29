/* Meeting feedback becomes editable planning records; proposals never become confirmations automatically. */
(() => {
  "use strict";
  const esc = (value) =>
    String(value ?? "").replace(
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
  const tabs = [
    ["progress", "Progress"],
    ["owners", "Ownership"],
    ["recruitment", "Recruitment"],
    ["dependencies", "Dependencies"],
    ["decisions", "Decisions"],
    ["publication", "Website readiness"],
  ];
  const decisions = [
    [
      "Headline measures",
      "Agree registration/confirmation versus invitation/confirmation, and define each count.",
    ],
    [
      "Participation targets",
      "Reconcile 2,200 hackers, possible 2,500 buffer and the registration funnel. Existing targets remain provisional.",
    ],
    [
      "Guinness and start waves",
      "Obtain written approval before publishing the proposed 9:30 / 10:30 / 11:30 starts.",
    ],
    [
      "Sunday finish and transport",
      "Confirm judging, awards and return buses fit the desired Sunday 3 PM finish.",
    ],
    [
      "Trade fair scope",
      "Decide go/no-go, venue space, merchant count, booth fees and visitor marketing.",
    ],
    [
      "Venue agreement",
      "Review the latest complete contract, total/discounts, AC, setup, rehearsal, security and emergency coverage.",
    ],
    [
      "Speakers and roundtables",
      "Verify confirmation emails, identities and commitments against the approved programme.",
    ],
    [
      "Progress weighting",
      "Agree effort points and criticality before introducing a weighted percentage.",
    ],
    [
      "Continuous medical support",
      "Confirm overnight staffing, ambulance coverage, relief and provider quote scope.",
    ],
    [
      "Food village",
      "Confirm fresh-food service, queues, coupons, allergy handling and age-aware drinks service.",
    ],
    [
      "Volunteer coverage",
      "Separate ambassadors from volunteers; assign shifts, relief, transport support and organization coordinators.",
    ],
    [
      "Bus sponsorship",
      "Cost school, campus and town-center routes before offering feed-20 / two-bus sponsorship packages.",
    ],
    [
      "Master plan baseline",
      "Compare existing versions and reconcile source records before archiving duplicates.",
    ],
    [
      "Team access",
      "Verified @intellibus.com sign-in and shared storage need a connected authentication/database service.",
    ],
  ];
  let api,
    active = "progress",
    query = "";
  const allTasks = () =>
    api
      .data()
      .workstreams.flatMap((w) =>
        api
          .lists(w)
          .flatMap((l) => (l.items || []).map((it) => ({ w, l, it }))),
      );
  // Backward-compatible defaults live inside the exported command plan, preserving all older records.
  function model() {
    const d = api.data();
    d.walkthrough ||= {};
    const m = d.walkthrough;
    m.decisions ||= decisions.map(([title, notes], i) => ({
      id: `decision-${i}`,
      title,
      notes,
      status: "Pending",
      owner: "",
      date: "",
      evidence: "",
    }));
    m.recruitment ||= [];
    m.dependencies ||= [];
    m.publication ||= [
      "Judges",
      "Coaches",
      "Speakers",
      "Prizes",
      "Agenda and schedule",
      "Competition rules",
      "Transport information",
      "Trade fair",
    ].map((title, i) => ({
      id: `publication-${i}`,
      title,
      status: "Draft",
      owner: "",
      date: "",
      evidence: "",
      notes: "Verify source information before publication.",
    }));
    return m;
  }
  function field(label, key, value, id, collection, type = "text") {
    return `<label class="field">${esc(label)}<input data-review-record="${esc(id)}" data-collection="${collection}" data-field="${key}" type="${type}" ${type === "number" ? 'min="0" step="1"' : ""} ${["share", "conversion"].includes(key) ? 'max="100"' : ""} value="${esc(value)}"></label>`;
  }
  function workOptions() {
    return api
      .data()
      .workstreams.map(
        (w) => `<option value="${esc(w.id)}">${esc(w.title)}</option>`,
      )
      .join("");
  }
  function link(w) {
    return `<button class="review-link" data-action="open-workstream" data-id="${esc(w.id)}">${esc(w.title)} ↗</button>`;
  }
  function taskLink({ w, l, it }) {
    return `<button class="review-link" data-action="open-attention" data-ws="${esc(w.id)}" data-list="${esc(l.id)}" data-item="${esc(it.id)}">${esc(it.text)} ↗</button>`;
  }
  const number = (n) =>
    n === null || n === "" || n === undefined
      ? "—"
      : Number(n).toLocaleString();
  function progress() {
    const tasks = allTasks(),
      done = tasks.filter((x) => x.it.status === "Done"),
      waiting = tasks.filter((x) => x.it.status === "Waiting");
    const attention = tasks.filter(
      (x) =>
        x.it.status !== "Done" &&
        (x.it.focus ||
          x.it.status === "Waiting" ||
          (x.it.date && x.it.date <= api.today())),
    );
    const filtered = attention.filter((x) =>
      [x.it.text, x.it.owner, x.w.title]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    return `<div class="review-summary"><article><b>${done.length} / ${tasks.length}</b><span>Recorded items completed</span></article><article><b>${waiting.length}</b><span>Waiting on something</span></article><article><b>${attention.length}</b><span>Need attention</span></article></div><p class="review-note">Completion counts are unweighted. Planning targets are separate from verified results; critical-path weighting is pending a decision.</p><label class="field">Find a blocker or owner<input id="review-search" type="search" value="${esc(query)}" placeholder="Search all attention items"></label><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Next action</th><th>Owner / due</th><th>Status</th></tr></thead><tbody>${filtered.map((x) => `<tr><td>${taskLink(x)}<small>${esc(x.w.title)}</small></td><td>${esc(x.it.owner || "Unassigned")}<small>${esc(x.it.date || "No date")}</small></td><td>${esc(x.it.status)}${x.it.focus ? " · Flagged" : ""}</td></tr>`).join("") || '<tr><td colspan="3">No matching attention items.</td></tr>'}</tbody></table></div>`;
  }
  function owners() {
    const ws = api.data().workstreams;
    return `<p class="review-note">Source leads may name several people. Set one accountable owner and separate supporting/communications roles. ${window.AtlasTeam?.active ? "Only managers assign owners; assigned owners can reorder and sign off their workstream." : "Personal draft assignments do not grant team permissions."}</p><div class="review-summary"><article><b>${ws.filter((w) => !w.accountableOwner).length}</b><span>Accountable owner not verified</span></article><article><b>${ws.length}</b><span>Workstreams to cover</span></article></div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Workstream / source lead</th><th>Accountable owner / verified email</th><th>Support / communications</th><th>Open items</th></tr></thead><tbody>${ws
      .map(
        (w) =>
          `<tr><td>${link(w)}<small>${esc(w.lead || "No source lead")}</small></td><td><input aria-label="Accountable owner for ${esc(w.title)}" data-owner-field="accountableOwner" data-ws="${esc(w.id)}" value="${esc(w.accountableOwner || "")}" ${window.AtlasTeam?.active && !window.AtlasTeam.canManage() ? "disabled" : ""}><input aria-label="Owner email for ${esc(w.title)}" type="email" placeholder="owner@intellibus.com" data-owner-field="ownerEmail" data-ws="${esc(w.id)}" value="${esc(w.ownerEmail || "")}" ${window.AtlasTeam?.active && !window.AtlasTeam.canManage() ? "disabled" : ""}></td><td><input aria-label="Supporting roles for ${esc(w.title)}" data-owner-field="support" data-ws="${esc(w.id)}" value="${esc(w.support || "")}"></td><td>${
            api
              .lists(w)
              .flatMap((l) => l.items || [])
              .filter((it) => it.status !== "Done").length
          }</td></tr>`,
      )
      .join(
        "",
      )}</tbody></table></div><h3>Assignment distribution</h3><p class="review-note">Counts show assignments, not hours or proof of overload.</p><div class="review-summary">${
      Object.entries(
        ws.reduce((m, w) => {
          if (w.accountableOwner)
            m[w.accountableOwner] = (m[w.accountableOwner] || 0) + 1;
          return m;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .map(
          ([name, count]) =>
            `<article><b>${count}</b><span>${esc(name)}</span></article>`,
        )
        .join("") || "<p>No accountable owners have been verified yet.</p>"
    }</div>`;
  }
  // Missing inputs stay unknown; forecasts are per segment because audiences can overlap.
  function forecast(r) {
    if (
      [r.population, r.share, r.conversion].some((v) => v === "" || v == null)
    )
      return null;
    return Math.floor(
      (((Number(r.population) * Number(r.share)) / 100) *
        Number(r.conversion)) /
        100,
    );
  }
  function recruitment() {
    return `<p class="review-note">Build an evidence-based funnel for schools, campuses and professional groups. Forecast = eligible population × reach % × conversion %. Segment forecasts are not summed: people may overlap.</p><form id="add-recruitment" class="form-row"><input name="title" required maxlength="150" aria-label="Recruitment segment" placeholder="Institution or audience segment"><select name="group" aria-label="Participant group"><option>Curious</option><option>Capable</option><option>Closers</option></select><button class="btn primary">Add segment</button></form><div class="review-records">${
      model()
        .recruitment.map(
          (r) =>
            `<details class="review-record" data-persist="${esc(r.id)}"><summary>${esc(r.title)} · ${esc(r.group)} <span>Forecast ${number(forecast(r))} · Confirmed ${number(r.confirmed)}</span></summary><div class="fields">${[
              ["Institution / segment", "title"],
              ["Participant group", "group"],
              ["Acquisition steps / channel", "steps"],
              ["Owner", "owner"],
              ["Evidence source", "evidence"],
              ["Next activity date", "date", "date"],
              ["Eligible population", "population", "number"],
              ["Reach %", "share", "number"],
              ["Conversion %", "conversion", "number"],
              ["Registrations", "registered", "number"],
              ["Confirmed people", "confirmed", "number"],
              ["Overlap / deduplication notes", "overlap"],
            ]
              .map(([label, key, type]) =>
                field(label, key, r[key], r.id, "recruitment", type),
              )
              .join("")}</div></details>`,
        )
        .join("") ||
      '<p class="empty">No evidence-based segments entered. Add the first institution or professional group.</p>'
    }</div>`;
  }
  function dependencies() {
    const m = model(),
      ws = api.data().workstreams;
    return `<p class="review-note">A dependency links two workstreams and records what must be delivered. Release it only when the condition is met; cyclic dependencies are rejected.</p><form id="add-dependency" class="review-form"><label class="field">Required first<select name="from">${workOptions()}</select></label><label class="field">Waiting workstream<select name="to">${workOptions()}</select></label><label class="field">Release condition<input name="condition" required maxlength="300"></label><button class="btn primary">Add dependency</button></form><div class="review-records">${m.dependencies.map((r) => `<details class="review-record" data-persist="${esc(r.id)}"><summary>${esc(ws.find((w) => w.id === r.from)?.title || "Missing workstream")} → ${esc(ws.find((w) => w.id === r.to)?.title || "Missing workstream")} <span>${esc(r.status)}</span></summary><div class="fields">${field("Release condition", "condition", r.condition, r.id, "dependencies")}${field("Owner", "owner", r.owner, r.id, "dependencies")}${field("Evidence", "evidence", r.evidence, r.id, "dependencies")}<label class="field">Status<select data-review-record="${r.id}" data-collection="dependencies" data-field="status">${["Blocked", "Released"].map((s) => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label></div></details>`).join("") || '<p class="empty">No cross-workstream dependencies recorded yet.</p>'}</div>`;
  }
  function register(collection) {
    const publishing = collection === "publication";
    return `<p class="review-note">${publishing ? "Draft → In review → Ready. Ready requires a named reviewer, review date and evidence. This records local readiness only; it does not publish content or authenticate approval." : "Meeting proposals remain pending until a named decision owner records a date and supporting evidence. Relative dates were not guessed."}</p><div class="review-records">${model()
      [collection].map(
        (r) =>
          `<details class="review-record" data-persist="${r.id}"><summary>${esc(r.title)} <span class="status-pill">${esc(r.status)}</span></summary><p>${esc(r.notes)}</p><div class="fields">${field(publishing ? "Reviewer" : "Decision owner", "owner", r.owner, r.id, collection)}${field("Decision / review date", "date", r.date, r.id, collection, "date")}${field("Evidence / decision record", "evidence", r.evidence, r.id, collection)}<label class="field">Status<select data-review-record="${r.id}" data-collection="${collection}" data-field="status">${(publishing ? ["Draft", "In review", "Ready"] : ["Pending", "Decided", "Deferred"]).map((s) => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></label>${field("Notes", "notes", r.notes, r.id, collection)}</div></details>`,
      )
      .join("")}</div>`;
  }
  function render() {
    model();
    const heading = tabs.find(([k]) => k === active)?.[1] || "Progress";
    return `<div class="crumb"><button data-action="workspace">Workspace</button><span>›</span><span>${heading}</span></div><header class="compact-heading"><div><p class="eyebrow">ATLAS · DELIVERY WORKSPACE</p><h1>${heading}</h1></div><span class="live-label">${window.AtlasTeam?.active ? "Shared team plan" : "Saved in this browser"}</span></header><nav class="review-tabs" aria-label="Delivery views">${tabs.map(([key, label]) => `<button data-review-tab="${key}" aria-pressed="${active === key}">${label}</button>`).join("")}</nav><div id="review-content">${active === "progress" ? progress() : active === "owners" ? owners() : active === "recruitment" ? recruitment() : active === "dependencies" ? dependencies() : register(active)}</div><p id="review-message" role="status"></p>`;
  }
  function message(text) {
    const el = document.getElementById("review-message");
    if (el) {
      el.textContent = text;
      el.scrollIntoView({ block: "nearest" });
    }
  }
  // Detect a cycle before adding a dependency so a team cannot create an impossible release chain.
  function hasPath(from, to, seen = new Set()) {
    if (from === to) return true;
    if (seen.has(from)) return false;
    seen.add(from);
    return model()
      .dependencies.filter((r) => r.from === from)
      .some((r) => hasPath(r.to, to, seen));
  }
  function init(bridge) {
    api = bridge;
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-review-tab]");
      if (!b) return;
      active = b.dataset.reviewTab;
      query = "";
      api.open();
    });
    document.addEventListener("input", (e) => {
      if (e.target.id !== "review-search") return;
      query = e.target.value;
      const start = e.target.selectionStart;
      document.getElementById("review-content").innerHTML = progress();
      const t = document.getElementById("review-search");
      t.focus();
      if (start !== null) t.setSelectionRange(start, start);
    });
    document.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.ownerField) {
        if (
          t.dataset.ownerField === "ownerEmail" &&
          t.value &&
          !/^[^@\s]+@intellibus\.com$/i.test(t.value)
        ) {
          message("Use an @intellibus.com owner email.");
          return;
        }
        const w = api.data().workstreams.find((w) => w.id === t.dataset.ws);
        if (w) {
          w[t.dataset.ownerField] = t.value.trim();
          api.save();
          api.refresh();
        }
        return;
      }
      if (!t.dataset.reviewRecord) return;
      const collection = t.dataset.collection,
        r = model()[collection]?.find((r) => r.id === t.dataset.reviewRecord);
      if (!r) return;
      const key = t.dataset.field,
        value =
          t.type === "number"
            ? t.value === ""
              ? null
              : Number(t.value)
            : t.value.trim();
      if (!t.checkValidity()) {
        message("Enter a valid value within the stated range.");
        return;
      }
      if (
        key === "status" &&
        ["Ready", "Decided", "Released"].includes(value) &&
        (!r.owner || !r.evidence || (value !== "Released" && !r.date))
      ) {
        t.value = r.status;
        message(
          "Add a named owner/reviewer, evidence and (for decisions/readiness) a date first.",
        );
        return;
      }
      r[key] = value;
      // Removing required evidence invalidates the local readiness label immediately.
      if (
        ["Ready", "Decided", "Released"].includes(r.status) &&
        (!r.owner || !r.evidence || (r.status !== "Released" && !r.date))
      )
        r.status =
          collection === "publication"
            ? "In review"
            : collection === "decisions"
              ? "Pending"
              : "Blocked";
      api.save();
      api.refresh();
    });
    document.addEventListener("submit", (e) => {
      const form = e.target;
      if (!["add-recruitment", "add-dependency"].includes(form.id)) return;
      e.preventDefault();
      const f = new FormData(form),
        id = crypto.randomUUID();
      if (form.id === "add-recruitment")
        model().recruitment.push({
          id,
          title: String(f.get("title")).trim(),
          group: f.get("group"),
          population: null,
          share: null,
          conversion: null,
          registered: null,
          confirmed: null,
        });
      else {
        const from = f.get("from"),
          to = f.get("to");
        if (hasPath(to, from)) {
          message(
            "That dependency would create a cycle. Choose a different predecessor.",
          );
          return;
        }
        if (model().dependencies.some((r) => r.from === from && r.to === to)) {
          message(
            "That pair is already linked. Update its release condition instead.",
          );
          return;
        }
        model().dependencies.push({
          id,
          from,
          to,
          condition: String(f.get("condition")).trim(),
          status: "Blocked",
          owner: "",
          evidence: "",
        });
      }
      api.save();
      api.refresh();
    });
  }
  window.AtlasReview = {
    init,
    render,
    open(tab) {
      active = tabs.some(([key]) => key === tab) ? tab : "progress";
      api.open();
    },
  };
})();
