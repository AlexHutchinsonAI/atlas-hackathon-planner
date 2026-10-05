/* People, event operations and Leaflet transport workflows. */

"use strict";
const continuousOperations = new URLSearchParams(location.search).has("flow");
const flowSections = [
  ["people", "peopleView", "People & rosters"],
  ["direction", "directionView", "Operations overview"],
  ["outcomes", "outcomesView", "Outcomes"],
  ["notebook", "notebookView", "Workstreams"],
  ["web", "webView", "Website readiness"],
  ["transport", "transportPageView", "Transport"],
  ["open", "openView", "Actions"],
];

/* ---------- seed: register from the preliminary planning document ---------- */
const SEED = [
  [
    "Programme Integration",
    "Camile / functional owners",
    "Integrated master plan, dependencies, milestones and decisions stay aligned across all workstreams.",
    "Close ownership gaps and lock cross-workstream dependencies and required decision dates.",
    0,
  ],
  [
    "Website Readiness",
    "Alexia / Jamari",
    "All public content, forms, integrations, flows, analytics, privacy controls and launch QA are complete.",
    "Confirm every content and technical launch gate, plus final Go/No-Go approval.",
    0,
  ],
  [
    "Merchant & Enterprise",
    "Alexia / To Assign",
    "At least 1 Enterprise Sponsor and 100 merchant participants are contracted or confirmed with challenges and participation requirements captured.",
    "Confirm enterprise sponsor, merchant target list, priority verticals, enterprise challenge package and participation agreements.",
    0,
  ],
  [
    "Trade Fair & Merchant Experience",
    "Alexia / Camile / Nakia",
    "Trade Fair operating model, merchant onboarding, public access, Atlas participation and venue requirements are complete.",
    "Confirm booth model, final public admission position, inclusions and overflow approach if merchant demand exceeds 100.",
    0,
  ],
  [
    "Food / Culinary Village / Hacker Fuel",
    "Nakia / Alexia",
    "Vendor-led food operation, Hacker Fuel and hydration support, overnight provision and servicing are integrated into venue operations.",
    "Confirm free Hacker Fuel entitlement, voucher model, overnight food approach, vendor responsibilities and redemption mechanics.",
    0,
  ],
  [
    "Competition & Rules",
    "Dennis / To Assign",
    "Eligibility, build window, pre-existing assets, Atlas requirements, submissions, judging, GQ and enforcement rules are approved and published.",
    "Confirm permitted pre-event work, acceptable pre-built assets, Atlas minimum submission requirements and evidence-retention model.",
    0,
  ],
  [
    "Legal / IP / Data & Agreements",
    "To Assign / Camile / Dennis / Rojae / Alexia",
    "Required terms, privacy, conduct, IP, confidentiality, merchant, enterprise, sponsor and continuation agreements are approved.",
    "Confirm IP ownership and licensing, business rights, prohibited data, media consent and post-event continuation terms.",
    1,
  ],
  [
    "Judges & Judging",
    "Andre Boothe / Shevanese / Dennis",
    "Plan for 30 official judges and a separate senior technical review panel. Confirm panel size, roles, judging rules, conflicts and results certification.",
    "Confirm the 30-official-judge target, reviewer-panel size, rubrics, shortlist mechanics, digital scoring, conflicts, finals and certification workflow.",
    0,
  ],
  [
    "Coaches & Mentors",
    "To Assign / Dennis / Nakia",
    "Build the coaching roster separately from judging, with specialties, availability, shifts, zones, guardrails and escalation confirmed. Senior Technical Reviewers are not counted as coaches.",
    "Assign owner; issue coach invitations, resolve TBDs, close the coaching roster gap and confirm specialty, zone and overnight coverage. Keep all Senior Technical Reviewer roles entirely within Judges & Judging.",
    1,
  ],
  [
    "Speakers",
    "Camile / Shevanese",
    "Speaker programme, invitations, confirmations, profiles, session roles and logistics are complete.",
    "Convert working and invited list to written confirmations and close coverage gaps; only confirmed speakers publish publicly.",
    0,
  ],
  [
    "Talent / GQ / Jobs",
    "Shevanese / Tiffany / Dennis",
    "GQ requirements, prize eligibility, talent data, Academy, apprenticeship and client pathway and post-event review are defined.",
    "Confirm exact GQ requirements and deadlines, eligibility rules, data fields and system links, and post-event decision cadence.",
    0,
  ],
  [
    "Participant Acquisition",
    "Travis / To Assign",
    "8,000 minimum / 10,000 stretch acquisition model is converted into qualified, confirmed attendance with source attribution.",
    "Confirm waitlist and throttling rule, prioritization method if oversubscribed, and populations that close the registration gap.",
    0,
  ],
  [
    "Ambassador Network",
    "Travis",
    "Ambassador network is recruited, onboarded and activated across priority institutions, communities and professional networks, with clear targets, tools, referral attribution and reporting.",
    "Confirm network size, priority institutions and communities, ambassador selection criteria, onboarding model, outreach targets, toolkit, incentives and reporting cadence.",
    0,
  ],
  [
    "Registration & Check-In",
    "To Assign / Travis / Jamari",
    "Participant identity, final-pass, transport, check-in and offline fallback processes work at required throughput.",
    "Assign accountable owner and confirm peak throughput, lane design, offline fallback and identity and manifest controls.",
    1,
  ],
  [
    "Venue & Space",
    "Nakia / Daniel",
    "Room-by-room operating plan safely accommodates 2,200 hackers plus all additional event populations and functions.",
    "Confirm Hall A split, total-event design population, rest and sleep capacity, Guinness multi-hall implications, egress, accessibility and infrastructure.",
    0,
  ],
  [
    "Network & Internet",
    "Alex / Daniel",
    "Vendor-managed connectivity across agreed event areas for 23–24 January 2027, demonstrated against confirmed load and agreed acceptance criteria, with tested recovery and continuous support.",
    "Review vendor-led proposal for 3,000 attendees stated at the 5 October 2026 Flow kickoff; concurrent device count is unconfirmed and the earlier 8,000–12,000 assumption requires reconciliation. Bandwidth, acceptance criteria, delivery, testing and support responsibilities remain to agree.",
    0,
  ],
  [
    "Atlas / Platform / Systems",
    "Daniel / Dennis",
    "Atlas, registration, judging and core event systems are capacity-tested with fallback and recovery procedures.",
    "Confirm Atlas event functions, recovery model, required data rules and system connections.",
    0,
  ],
  [
    "AV / Livestream / Production",
    "To Assign / To Assign",
    "Production, livestream, recording, stage and AV, and redundant evidence capture are fully planned and staffed.",
    "Assign owner; confirm production scale, equipment model, schedule, staffing and redundant capture and storage.",
    1,
  ],
  [
    "Procurement & Inventory",
    "Daniel / Alex",
    "Critical equipment is sourced, received, cleared, inspected, tested, labelled, stored and assigned with spares.",
    "Confirm own-vs-rent categories, import and shipping cutoff, design-dependent quantities, and whether any onsite capability should be owned.",
    0,
  ],
  [
    "Transport",
    "Travis / Nakia",
    "National parish bus programme, institution and sponsored buses, manifests, arrival and return flows and special transport are operationally ready.",
    "Confirm parish pickup points, departure and return windows, demand triggers, sponsor-a-bus process and VIP and specialist transport.",
    0,
  ],
  [
    "Security",
    "Andre Fuller / Nakia",
    "Access zones, entrances, shifts, overnight coverage, incident escalation and staffing are validated against final layout.",
    "Confirm final zones, overnight operating areas, security headcount and shifts, and event-lead escalation matrix.",
    0,
  ],
  [
    "Medical / EMS",
    "To Assign / To Assign",
    "Provider-led medical coverage, escalation, response points and full-duration coverage are based on professional risk assessment.",
    "Assign owner and provider, and confirm level of medical presence for the full event duration.",
    1,
  ],
  [
    "Care & Volunteers",
    "Nakia / To Assign",
    "Hydration, rest and recovery, accessibility, participant and staff wellbeing, lost property and persons, and overnight care are covered.",
    "Confirm volunteer and care staffing, overnight model, rest and sleep capacity, and escalation boundary to medical.",
    0,
  ],
  [
    "Staffing / Workforce Scheduling",
    "To Assign / functional owners",
    "All event roles are calculated from throughput, coverage, zones and operating hours; shifts and handoffs are scheduled.",
    "Assign workforce scheduling owner and convert all To Calculate roles into validated staffing and shift numbers.",
    1,
  ],
  [
    "Marketing & Communications",
    "To Assign / To Assign",
    "One approved source of truth drives paid, earned, owned and partner communications across participant, merchant and public audiences.",
    "Assign accountable owner; confirm primary public story, audience investment, Guinness, jobs and Atlas balance, and paid media budget.",
    1,
  ],
  [
    "Participant & Merchant Campaigns",
    "Travis / Alexia",
    "Separate participant and merchant funnels are activated with campaign and source attribution through attendance and conversion.",
    "Confirm campaign calendar, outreach channels, partner amplification and conversion targets by source population.",
    0,
  ],
  [
    "Media / Content / Attribution",
    "To Assign / Alexia / Shevanese",
    "Print, radio, TV, digital, success-story content and attribution operate from the approved source of truth.",
    "Assign media schedule owner; confirm media calendar, approved assets, claims controls and reporting.",
    1,
  ],
  [
    "Guinness World Record",
    "Camile (interim) / To Assign",
    "Record-specific requirements are translated into participant qualification, staffing, stewarding, evidence, video and photo, and custody controls.",
    "Obtain official record-specific guidelines; get written confirmation on whether fixed staggered 24-hour start/finish waves are permitted; confirm target margin, onsite adjudicator, multi-hall and re-entry rules, witnesses, stewards and evidence owner.",
    1,
  ],
  [
    "Budget & Financial Tracking",
    "To Assign / To Assign",
    "Validated budget reflects committed, forecast and proposed spend, landed cost, contingency and funding offsets.",
    "Assign owner; confirm final budget ceiling, sponsorship offset target, contingency percentage and cost-control cadence.",
    1,
  ],
  [
    "Commercial Model & Sponsorship",
    "Alexia / To Assign",
    "Sponsor, merchant, Trade Fair, vendor and in-kind commercial positions are documented and tied to clear deliverables.",
    "Confirm sponsorship packages and offsets, merchant fee position, Trade Fair fee purpose, and sponsor-funded and in-kind contributions.",
    0,
  ],
  [
    "Contracts / Insurance / Force Majeure",
    "To Assign / To Assign",
    "Material commitments have documented scope, pricing, payment, change control, liability and insurance, force majeure, dates and remedies.",
    "Assign legal and commercial coordination owner and close required agreements before material commitments.",
    1,
  ],
  [
    "Post-Event Conversion",
    "To Assign / Tiffany / Alexia / Dennis",
    "Talent, merchants, enterprises and promising solutions move into defined follow-up paths immediately after the event.",
    "Confirm decision owner for continuing solutions, talent decision timing and standard post-event support for merchants and enterprises.",
    1,
  ],
  [
    "Impact & Sponsor Reporting",
    "To Assign / Alexia",
    "Executive KPIs, campaign conversion, sponsor evidence and public and internal reporting are defined before event day.",
    "Confirm top 5–10 success outcomes, public vs internal metrics, and reporting owner and cadence.",
    1,
  ],
].map((r, i) => ({
  id: "ws" + String(i + 1).padStart(2, "0"),
  n: i + 1,
  name: r[0],
  leads: r[1],
  dod: r[2],
  decision: r[3],
  gap: !!r[4],
}));

/* ---------- recommended breakdown per workstream ---------- */

/* ---------- recommended outcome + key results ---------- */

let WS = SEED.slice();
let custom = [];

function guessEvidence(t) {
  const x = t.toLowerCase();
  if (
    /test|rehears|load|swap|sustain|activat|dry-run|demonstrat|tried|timed/.test(
      x,
    )
  )
    return EVIDENCE[5];
  if (/sign(ed)?[- ]off|signed off|approv|accepted|validated by|logged/.test(x))
    return EVIDENCE[3];
  if (
    /contract|agreement|signed contract|insurance|force majeure|terms|template/.test(
      x,
    )
  )
    return EVIDENCE[0];
  if (/publish|live on|website|version-dated|posted/.test(x))
    return EVIDENCE[4];
  if (
    /alert|monitor|within \[x\] minutes|capture|recording|photo|video|custody|traceab/.test(
      x,
    )
  )
    return EVIDENCE[7];
  if (/witness|adjudicat|independent|risk assessment|authority|counsel/.test(x))
    return EVIDENCE[8];
  if (
    /\d|zero |every |all \d|count|registrations|participants|roster|headcount|throughput|percentage|%/.test(
      x,
    )
  )
    return EVIDENCE[2];
  if (/report|deliver|cadence|pack|tracked/.test(x)) return EVIDENCE[9];
  if (/attend|check-in|arriv/.test(x)) return EVIDENCE[6];
  return EVIDENCE[1];
}

let teach = true;
function teachBox(i) {
  const m = TEACH[i];
  if (!m) return "";
  return `<details class="teach"><summary>PMP guide · ${m.t}</summary><div class="teach-body">
    <p>${m.w}</p>
    <p><b>Exam note.</b> ${m.e}</p>
    <p><b>Watch for.</b> ${m.x}</p></div></details>`;
}

let execState = { goals: {}, decisions: {} };

const PRELIM_EVALUATOR_CANDIDATES = COACH_ROSTER.filter(
  (r) => r[1] === "Senior Technical Reviewer Candidate",
).map((r) => r[0]);
PRELIM_EVALUATOR_CANDIDATES.forEach((n) => {
  if (!JUDGE_POOL.includes(n)) JUDGE_POOL.push(n);
  if (!JUDGE_DEFAULTS[n])
    JUDGE_DEFAULTS[n] = {
      status: "Senior Technical Reviewer Candidate",
      notes:
        "Senior Technical Reviewer candidate — January 2027 coach consideration list; include in judge shadow programme.",
    };
});

const LOCK = new Date("2026-12-15T00:00:00"),
  EVENT = new Date("2027-01-23T00:00:00");

/* ---------- state + storage ---------- */
let plans = {}; // id -> {outcome, tasks:[]}
let db = null,
  downloads = null,
  useLocal = true;
let current = WS[0].id,
  gapsOnly = false;

const el = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const blank = () => ({
  outcome: "",
  tasks: [],
  handled: [],
  krs: [],
  khandled: [],
  mobilize: {
    leadAligned: false,
    briefReady: false,
    firstActions: false,
    dependencies: false,
    firstCheckpoint: false,
    leadAccepted: false,
    notes: "",
  },
});
const fromPlan = (n) => DOC_ACTIONS.filter((x) => x.ws === n).map((x) => x.t);
const pending = (id) => {
  const w = WS.find((x) => x.id === id),
    p = planOf(id),
    h = p.handled || [];
  const seq = SUGGEST[w.n] || fromPlan(w.n);
  return seq.filter((s) => !h.includes(s));
};
const pendingKR = (id) => {
  const w = WS.find((x) => x.id === id),
    p = planOf(id),
    h = p.khandled || [];
  return ((DOD[w.n] || {}).c || (REC[w.n] || [])[1] || []).filter(
    (s) => !h.includes(s),
  );
};
const planOf = (id) => plans[id] || (plans[id] = blank());

function loadLocal() {
  try {
    const r = localStorage.getItem(LS);
    if (r) plans = JSON.parse(r) || {};
  } catch (e) {}
}
let saveTimer = null,
  saving = false;
function save(id) {
  planOf(id).updatedAt = new Date().toISOString();
  try {
    window.AtlasSave.write(operationsStorageKey(), JSON.stringify(plans));
    if (window.AtlasTeam?.active)
      window.AtlasTeam.changed(operationsSnapshot());
  } catch (e) {}
  if (!db) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (saving) return;
    saving = true;
    try {
      await db.doc("plan/" + id).set(planOf(id));
      setStatus("Saved");
    } catch (e) {
      setStatus(
        e && e.code === "invalid_argument"
          ? "Read-only — kept on this device"
          : "Kept on this device",
      );
    } finally {
      saving = false;
    }
  }, 550);
}
function setStatus(t) {
  el("status").textContent = t;
}

/* ---------- four moves ---------- */
function moveState(p) {
  const t = p.tasks,
    k = p.krs || [];
  return [
    !!p.outcome.trim(),
    k.length > 0,
    t.length > 0,
    t.length > 0 &&
      t.every((x) => x.dep !== undefined && x.dep !== null && x.dep !== ""),
    t.length > 0 && t.every((x) => x.owner.trim() && x.due),
  ];
}
const score = (p) => moveState(p).filter(Boolean).length;

/* ---------- render: register + rollup ---------- */
function rebuildWS() {
  WS = SEED.concat(
    custom.map((c, i) => ({
      id: c.id,
      n: SEED.length + i + 1,
      name: c.name,
      leads: c.leads || "To Assign",
      dod: c.dod || "",
      decision: c.decision || "",
      gap: !c.leads || /to assign/i.test(c.leads || ""),
      own: true,
    })),
  );
}
function saveCustom() {
  try {
    window.AtlasSave.write(
      operationsStorageKey() + "-ws",
      JSON.stringify(custom),
    );
    if (window.AtlasTeam?.active)
      window.AtlasTeam.changed(operationsSnapshot());
  } catch (e) {}
  if (db)
    db.doc("meta/custom")
      .set({ list: custom })
      .catch(() => {});
}
function addWorkstream(name) {
  const v = (name || "").trim();
  if (!v) return;
  custom.push({
    id: "own" + Date.now().toString(36),
    name: v,
    leads: "To Assign",
  });
  rebuildWS();
  saveCustom();
  current = custom[custom.length - 1].id;
  gapsOnly = false;
  el("filterBtn").textContent = "Owner gaps only";
  renderAll();
  const o = el("outcome");
  if (o) o.focus();
}

// Keep the prize review reachable in the legacy register without inventing five-step task completion.
let prizeRegisterOpen = new URLSearchParams(location.search).get("workstream") === "prizes";
function renderRegister() {
  const list = el("regList");
  const rows = WS.filter((w) => !gapsOnly || w.gap);
  list.innerHTML =
    rows
      .map((w) => {
        const st = moveState(planOf(w.id));
        return `<button class="ws" data-id="${w.id}" aria-current="${!prizeRegisterOpen && w.id === current}">
      <span class="n">${w.n}</span>
      <span class="nm">${w.gap ? '<span class="gapdot"></span>' : ""}${esc(w.name)}
        <small>${esc(w.leads)}</small></span>
      <span class="pips">${st.map((s) => `<i class="${s ? "on" : ""}"></i>`).join("")}</span>
    </button>`;
      })
      .join("") ||
    `<p class="empty" style="padding:14px">No workstreams match.</p>`;
  list.insertAdjacentHTML("afterbegin", `<button type="button" class="ws" id="prizeRegisterLink" aria-current="${prizeRegisterOpen}"><span class="n">★</span><span class="nm">Prizes &amp; recognition<small>Kandia · 14 awards · pictures &amp; reviews</small></span></button>`);
  el("prizeRegisterLink").onclick = () => { prizeRegisterOpen = true; renderAll(); };
  list.querySelectorAll(".ws[data-id]").forEach(
    (b) =>
      (b.onclick = () => {
        prizeRegisterOpen = false;
        current = b.dataset.id;
        renderAll();
      }),
  );
}

function renderRollup() {
  let done = 0,
    part = 0,
    none = 0;
  WS.forEach((w) => {
    const s = score(planOf(w.id));
    if (s === MOVES) done++;
    else if (s > 0) part++;
    else none++;
  });
  el("kDone").textContent = done;
  el("kPart").textContent = part;
  el("kNone").textContent = none;
  el("kGap").textContent = WS.filter((w) => w.gap).length;
  const total = WS.length;
  el("rollup").innerHTML =
    `<i style="flex:${done || 0.0001};background:var(--go)"></i>` +
    `<i style="flex:${part || 0.0001};background:var(--sea)"></i>` +
    `<i style="flex:${none || 0.0001};background:var(--rule)"></i>`;
  void total;
}

function days(to) {
  return Math.ceil((to - new Date()) / 864e5);
}
function renderClocks() {
  const a = days(LOCK),
    b = days(EVENT);
  el("dLock").textContent = a > 0 ? a : "—";
  el("dEvent").textContent = b > 0 ? b : "—";
}

function sequenceMap(p) {
  return p.tasks
    .map((t, i) => {
      const dep = p.tasks.find((x) => x.id === t.dep);
      const unlocks = p.tasks.filter((x) => x.dep === t.id);
      const after = dep
        ? `Step ${p.tasks.indexOf(dep) + 1} · ${esc(dep.title)}`
        : "No predecessor set — this can start first or in parallel.";
      const next = unlocks.length
        ? unlocks
            .map((x) => `Step ${p.tasks.indexOf(x) + 1} · ${esc(x.title)}`)
            .join("<br>")
        : "No downstream task linked yet.";
      return `<div class="seq-card ${t.done ? "done" : ""}"><div class="seq-num">STEP ${String(i + 1).padStart(2, "0")}</div><div class="seq-main"><b>${esc(t.title || "Untitled task")}</b><div class="seq-links"><span><strong>Starts after:</strong><br>${after}</span><span><strong>Then unlocks:</strong><br>${next}</span></div><div class="seq-meta">Owner: ${esc(t.owner || "Unassigned")} · Required by: ${esc(t.due || "No date set")}${t.done ? " · Done" : ""}</div></div></div>`;
    })
    .join("");
}

function simpleTable(headers, rows) {
  return `<div class="table-scroll"><table class="tasks ro"><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function volunteerStaffingBlock() {
  return `<section class="move"><div class="m-head"><h3>Volunteer Staffing Baseline — Recommended / TBC</h3></div><div class="m-body" style="margin-left:0">
  <div class="review-lock"><b>Working unique roster: 180 volunteers — TBC.</b> Professional security, EMS/medical providers, cleaners, drivers, venue staff, production contractors, coaches and judges/evaluators sit outside this volunteer number.</div>
  <h4 class="sub4">Functional roster</h4>${simpleTable(["Volunteer function", "Recommended baseline"], VOLUNTEER_FUNCTIONS)}
  <h4 class="sub4">Shift coverage structure</h4>${simpleTable(["Coverage window", "Time", "Concurrent coverage requirement", "Primary load"], VOLUNTEER_SHIFTS)}
  <p class="hint" style="margin-left:0"><b>Scheduling check:</b> the coverage bands are concurrent requirements, not separate unique-headcount targets. The 180-person roster remains the planning baseline, but the workforce owner must validate whether shift duration, breaks and handover overlap can meet these windows safely. If general volunteers are limited to one 8-hour shift each, the unique roster may need to increase.</p>
</div></section>`;
}
function coachShiftBlock() {
  return `<section class="move"><div class="m-head"><h3>Coach Capacity &amp; Shift Structure — Recommended / TBC</h3></div><div class="m-body" style="margin-left:0">
  <div class="review-lock"><b>Working unique coach roster: 100 — TBC.</b> Senior Technical Reviewers are part of Judging and do not count toward coach capacity.</div>
  ${simpleTable(["Coverage window", "Time", "Active coach requirement", "Capacity logic"], COACH_SHIFTS)}
  <p class="hint" style="margin-left:0">The active counts are coverage requirements and are not additive unique headcounts. Finalize the 100-person roster against specialty mix, zones, breaks, online support and handover rules. Track <b>peak active</b> and <b>overnight active</b> separately from total confirmed coaches.</p>
</div></section>`;
}
function ambassadorRoadBlock() {
  const rows = AMBASSADOR_STAGES.map(([k, l]) => [
    l,
    `<input type="number" min="0" step="1" data-amb="${k}" value="${esc((ambassadorState || {})[k] ?? "")}" placeholder="0">`,
  ]);
  return `<section class="move"><div class="m-head"><h3>Road to Hackathon — Ambassador Funnel</h3></div><div class="m-body" style="margin-left:0">
  <div class="review-lock"><b>Working target: 60 ambassadors — Recommended / TBC.</b> Ambassadors are a pre-event mobilization network. The goal is for them to convert into Hackathon participants; once they do, they belong inside the 2,200 participant baseline and must not be added again as a separate event-day population.</div>
  <div class="table-scroll"><table class="tasks"><thead><tr><th>Funnel stage</th><th style="width:32%">Current count</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table></div>
  <p class="hint" style="margin-left:0">Review this funnel weekly before the Hackathon. The critical conversion signals are activated ambassadors → attributed registrations → qualified participants → confirmed participants → checked-in participants.</p>
</div></section>`;
}

function participantOutreachEvidenceBlock() {
  return `
  <h4 class="sub4">University evidence behind the allocation</h4>${simpleTable(["Institution", "Student population", "Tech-related programme proxy", "Historical regs / check-in / conversion", "Evidence basis"], OUTREACH_UNI_EVIDENCE)}
  <div class="outreach-note"><b>University access chain:</b> Marketing/Comms → Campus Elite/equivalent → Guild/Student Leadership → Faculty → Programme/Class Reps → Ambassadors. Institution quotas remain TBC until distribution and activation access is confirmed.</div>
  <h4 class="sub4">CCCJ county allocation</h4>${simpleTable(["County", "Anchor institutions", "Planning student universe", "8K", "10K"], OUTREACH_CCCJ_COUNTY)}
  <div class="outreach-note"><b>CCCJ working contacts:</b> Dr Donna Powell Wilson, Executive Director; Jason McIntosh; Amielle Anderson. Working Intellibus owner: <b>Travis Lewis</b>. Current 10-institution enrolment and distribution reach remain validation items.</div>
  <h4 class="sub4">High-school evidence by region</h4>${simpleTable(["Region", "G10–13 planning universe", "2026 CTC evidence", "March 2026 Hackathon evidence", "Tech-readiness signal", "8K / 10K"], OUTREACH_HS_DETAIL)}
  <div class="outreach-note"><b>Pipeline rule:</b> only January 2026 Q1 Crack the Code activations preceded the March Hackathon and can be treated as direct CTC → Hackathon pipeline evidence. Campion and Seaforth activity occurred after March and supports activation-capacity evidence only.</div>
  <h4 class="sub4">Professional ecosystem routes</h4>${simpleTable(["Network / route", "Verified scale", "Access / contact", "Evidence status", "Planning use"], OUTREACH_PRO_NETWORKS)}
  <div class="outreach-note"><b>Professional-network constraint:</b> memberships overlap. Do not sum network sizes as unique people. The 1,000 / 1,250 professional allocation remains a hypothesis until the reachable, deduplicated audience is quantified.</div>
  <h4 class="sub4">HEART/NSTA evidence &amp; allocation test</h4>${simpleTable(["Data point", "Number", "Class", "What it proves / does not prove"], OUTREACH_HEART_EVIDENCE)}
  ${simpleTable(["Confirmed reachable relevant HEART learners", "1,000 requires", "1,250 requires", "Interpretation"], OUTREACH_HEART_RULE)}
  <div class="outreach-note"><b>HEART decision rule:</b> final registration allocation = confirmed reachable unique cohort × evidence-supported conversion rate. Keep the current 1,000 / 1,250 as provisional until reach and overlap are validated.</div>
  <h4 class="sub4">Open validation register before baseline lock</h4>${simpleTable(["Area", "Required evidence", "Decision effect"], OUTREACH_VALIDATION)}
`;
}

function participantOutreachBlock(compact = false) {
  const totalMin = OUTREACH_BUCKETS.reduce((a, b) => a + b.min, 0),
    totalStretch = OUTREACH_BUCKETS.reduce((a, b) => a + b.stretch, 0);
  const unMin = 8000 - totalMin,
    unStretch = 10000 - totalStretch;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const metrics = `<div class="outreach-metrics"><div class="outreach-metric"><b>3,000</b><span>physical attendance requirement in outreach model</span></div><div class="outreach-metric"><b>8,000</b><span>minimum gross registrations</span></div><div class="outreach-metric"><b>10,000</b><span>stretch registrations</span></div><div class="outreach-metric"><b>38.9%</b><span>conservative historical attendance floor</span></div><div class="outreach-metric"><b>30.0%</b><span>attendance conversion needed at 10K stretch</span></div></div>`;
  const bucketCards = `<div class="outreach-grid">${OUTREACH_BUCKETS.map((x) => `<article class="outreach-card"><h4>${esc(x.name)}</h4><div class="alloc">${x.min.toLocaleString()} / ${x.stretch.toLocaleString()}</div><small>8K / 10K allocation</small><small>${esc(x.basis)}</small><span class="status">${esc(x.status)}</span></article>`).join("")}</div>`;
  if (compact)
    return `<section class="move"><div class="m-head"><h3>Participant Outreach — Acquisition Control</h3></div><div class="m-body" style="margin-left:0"><div class="outreach-hero"><span class="outreach-kicker">Evidence-backed acquisition model</span><h3>Registration is being planned backwards from physical attendance.</h3><p>Use the 8,000 minimum / 10,000 stretch model as the source-of-truth for campaign allocation and source attribution. These are acquisition allocations, not forecasts.</p>${metrics}</div>${bucketCards}<div class="outreach-note outreach-alert"><b>Current quantified model:</b> ${totalMin.toLocaleString()} / ${totalStretch.toLocaleString()} allocated, leaving <b>${unMin.toLocaleString()} / ${unStretch.toLocaleString()}</b> still to be created through network growth and validated distribution access. Do not close this gap by double-counting channels.</div></div></section>`;
  return `<section class="move"><div class="m-head"><h3>Participant Outreach — Evidence &amp; Acquisition Plan</h3></div><div class="m-body" style="margin-left:0">
    <div class="outreach-hero"><span class="outreach-kicker">Participant acquisition control</span><h3>3,000 physical attendees → 8,000 minimum registrations → 10,000 stretch.</h3><p>Historical Intellibus performance supports the planning range: Hackathon #2 recorded 1,444 registrations and 700+ in-person attendance (≥48.5%); March 2026 recorded ~1,800 registrations and 700+ attendance (≥38.9%).</p>${metrics}</div>
    <div class="outreach-note outreach-alert"><b>Baseline reconciliation required:</b> this outreach plan targets <b>3,000 people physically attending</b>, while the competition/Guinness operating baseline elsewhere in this site currently uses <b>2,200 physical hackers</b>. Keep both numbers visible until the total-event population model is reconciled; do not silently overwrite either.</div>
    <h4 class="sub4">Acquisition allocation by population</h4>${bucketCards}
    <div class="outreach-note"><b>Current-state position:</b> ${totalMin.toLocaleString()} / ${totalStretch.toLocaleString()} of the 8K / 10K registration requirement is allocated across identifiable populations. Remaining requirement: <b>${unMin.toLocaleString()} / ${unStretch.toLocaleString()}</b>. Professional, HEART and CCCJ allocations remain subject to validation.</div>
    <h4 class="sub4">University activation capacity</h4>${simpleTable(["Campus", "Core activation team", "Campus reps / ambassadors", "Peak on-ground team"], OUTREACH_UNI_DEPLOY)}
    <h4 class="sub4">University sign-up mechanisms</h4><div class="outreach-mechs">${OUTREACH_MECHANISMS.map((x) => `<div class="outreach-mech"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join("")}</div>
    <h4 class="sub4">High-school regional allocation</h4>${simpleTable(
      [
        "Region",
        "Upper-school planning universe",
        "8K allocation",
        "10K allocation",
      ],
      OUTREACH_HS.map((r) => [r[0], r[1], String(r[2]), String(r[3])]),
    )}
    ${participantOutreachEvidenceBlock()}
    <h4 class="sub4">CCCJ validation &amp; execution pathway · proposed dates (TBC)</h4><div class="outreach-timeline">${OUTREACH_CCCJ_DATES.map(
      (r) => {
        const d = new Date(
          r[0].replace(/(\d{1,2}) (\w+) (\d{4})/, "$2 $1, $3"),
        );
        const past = !Number.isNaN(d.getTime()) && d < now;
        return `<div class="outreach-date ${past ? "past" : "future"}"><b>${esc(r[0])}${past ? " · status check" : ""}</b><span>${esc(r[1])}</span><span>${esc(r[2])}</span><span>${esc(r[3])}</span></div>`;
      },
    ).join("")}</div>
    <div class="outreach-note"><b>Tracking hierarchy:</b> University → Faculty → Programme → Mechanism → Campaign → Referrer → Status. Use unique source codes; count incentives only on unique, completed, verified registrations. Control target vs actual by campus, mechanism, faculty/programme and ambassador.</div>
  </div></section>`;
}

/* ---------- render: panel ---------- */

function strategicOutcomeFor(name) {
  return (
    STRATEGIC_OUTCOMES.find((o) => o.ws.includes(name)) || {
      id: "O8",
      label: "Integrated delivery",
      desc: "Supports the integrated event plan.",
      ws: [],
    }
  );
}
function outcomeTagForWorkstream(w) {
  const o = strategicOutcomeFor(w.name);
  return `<span class="outcome-tag">${esc(o.id)} · ${esc(o.label)}</span>`;
}

function renderPanel() {
  if (prizeRegisterOpen) {
    el("panel").innerHTML = window.AtlasPrizes.render("ws35");
    return;
  }
  const w = WS.find((x) => x.id === current),
    p = planOf(current),
    st = moveState(p);
  if (!p.handled) p.handled = [];
  if (!p.krs) p.krs = [];
  if (!p.khandled) p.khandled = [];
  const sug = pending(current),
    done = p.handled;
  const ksug = pendingKR(current),
    rec = [w.dod, (REC[w.n] || ["", []])[1]];
  const late = (d) => d && new Date(d) > LOCK;
  const mkTask = (title, dep = "") => ({
    id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    owner: "",
    due: "",
    dep,
    done: false,
  });
  const appendSuggested = (s) => {
    const dep = p.tasks.length ? p.tasks[p.tasks.length - 1].id : "";
    p.tasks.push(mkTask(s, dep));
  };
  const opts = (t) =>
    [`<option value="">—</option>`]
      .concat(
        p.tasks
          .filter((o) => o.id !== t.id)
          .map(
            (o) =>
              `<option value="${o.id}"${t.dep === o.id ? " selected" : ""}>${esc(`Step ${p.tasks.indexOf(o) + 1} · ` + (o.title || "untitled").slice(0, 72))}</option>`,
          ),
      )
      .join("");

  el("panel").innerHTML = `
  <div class="p-top">
    <div class="idx">Workstream ${w.n} of ${WS.length}</div>
    <h2>${esc(w.name)}</h2>
    <div class="meta">
      <span class="tag lead">${esc(w.leads)}</span>
      ${w.gap ? '<span class="tag gap">Owner required</span>' : ""}
      ${w.own ? '<span class="tag own-ws">Added by you</span>' : ""}
      <span class="tag">${score(p)} of ${MOVES} moves complete</span>
    </div>
  </div>

  ${w.gap ? '<p class="notice">No permanent accountable owner is named yet. Name one before decomposing — everything below needs somewhere to land.</p>' : ""}
  ${w.n === 9 ? coachProfilesBlock() : ""}
  ${w.n === 9 ? coachRosterBlock() : ""}
  ${w.n === 9 ? coachShiftBlock() : ""}
  ${w.n === 12 ? participantOutreachBlock(false) : ""}
  ${w.n === 13 ? ambassadorRoadBlock() : ""}
  ${w.n === 26 ? participantOutreachBlock(true) : ""}
  ${w.n === 24 ? volunteerStaffingBlock() + coachShiftBlock() : ""}

  <section class="move mob-sec-panel">
    <div class="m-head"><span class="m-num ${mobScore(w.id) === 6 ? "done" : ""}">M</span><h3>Mobilize → hand over</h3></div>
    <p class="hint">Get it moving. Keep the lead aligned. Hand it over cleanly.</p>
    <div class="m-body">
      <div class="lead-align"><b>Lead check:</b> ${esc(w.leads.split("/")[0].trim())} aligns the setup before major commitments are made.</div>
      <div class="mob-checks">
        <label class="mob-check"><input type="checkbox" data-mob="leadAligned" ${mobOf(w.id).leadAligned ? "checked" : ""}>Lead aligned on outcome and first priorities</label>
        <label class="mob-check"><input type="checkbox" data-mob="briefReady" ${mobOf(w.id).briefReady ? "checked" : ""}>Starter brief ready</label>
        <label class="mob-check"><input type="checkbox" data-mob="firstActions" ${mobOf(w.id).firstActions ? "checked" : ""}>First actions started</label>
        <label class="mob-check"><input type="checkbox" data-mob="dependencies" ${mobOf(w.id).dependencies ? "checked" : ""}>Dependencies and blockers surfaced</label>
        <label class="mob-check"><input type="checkbox" data-mob="firstCheckpoint" ${mobOf(w.id).firstCheckpoint ? "checked" : ""}>First checkpoint scheduled</label>
        <label class="mob-check"><input type="checkbox" data-mob="leadAccepted" ${mobOf(w.id).leadAccepted ? "checked" : ""}>Lead accepts ownership</label>
      </div>
      <div class="handover-box"><strong>Handover gate · ${mobStage(w.id)[0]}</strong><p>${mobScore(w.id) < 5 ? "Keep mobilizing." : mobScore(w.id) === 5 ? "Ready for lead acceptance." : "Handover complete. Core team shifts to PMO support."}</p></div>
      <label class="own-lab" for="mobNotes" style="margin-top:12px">Handover notes</label><textarea id="mobNotes" placeholder="What is started? What must the lead know?">${esc(mobOf(w.id).notes || "")}</textarea>
    </div>
  </section>

  <section class="move">
    <div class="m-head"><span class="m-num ${st[0] ? "done" : ""}">1</span><h3>Name the outcome</h3></div>
    <p class="hint">What is true when this workstream is done?</p>
    ${teach ? teachBox(0) : ""}
    <div class="m-body">
      ${
        (REF[w.n] || []).length
          ? `<div class="facts"><b>From the planning document</b>
      <ul>${REF[w.n].map((f) => `<li>${esc(f)}</li>`).join("")}</ul></div>`
          : ""
      }

      ${
        rec[0] && p.outcome.trim() !== rec[0]
          ? `<div class="suggest">
        <div class="s-head"><h4>Definition of Done — from the plan</h4></div>
        <ul class="s-list"><li><span class="s-txt"><span class="src plan">From the plan</span>${esc(rec[0])}</span>
          <span class="s-btns"><button class="s-yes" id="useOutcome" type="button">Use this</button></span>
        </li></ul></div>`
          : ""
      }
      ${
        DOD[w.n] && p.outcome.trim() !== DOD[w.n].s
          ? `<div class="suggest">
        <div class="s-head"><h4>Testable Definition of Done — draft</h4><span>${DOD[w.n].c.length} conditions in Key results</span></div>
        <ul class="s-list"><li><span class="s-txt"><span class="src">Drafted</span>${esc(DOD[w.n].s)}</span>
          <span class="s-btns"><button class="s-yes" id="useDod" type="button">Use this</button></span>
        </li></ul>
        <p class="s-cleared" style="margin:9px 0 0">Square brackets are numbers the plan has not fixed yet. Everything else comes from the plan's own figures.</p></div>`
          : ""
      }
      <label class="vh" for="outcome">Outcome</label>
      <textarea id="outcome" placeholder="Write it in your own words, or accept the recommendation above and edit it.">${esc(p.outcome)}</textarea>
      ${w.decision ? `<div class="ref" style="margin-top:11px"><b>Decision still open:</b> ${esc(w.decision)}</div>` : ""}
    </div>
  </section>

  <section class="move">
    <div class="m-head"><span class="m-num ${st[1] ? "done" : ""}">2</span><h3>Key results</h3></div>
    <p class="hint">How will you know it worked? Use measurable results.</p>
    ${teach ? teachBox(1) : ""}
    <div class="m-body">
      ${
        ksug.length
          ? `<div class="suggest">
        <div class="s-head"><h4>Definition of Done conditions</h4><span>${ksug.length} to review · drafted, not in the plan document</span></div>
        <ul class="s-list">${ksug
          .map(
            (s, i) => `<li>
          <span class="s-txt">${esc(s)}</span>
          <span class="s-btns">
            <button class="s-yes" data-kacc="${i}" type="button">Accept</button>
            <button class="s-no" data-krej="${i}" type="button">Dismiss</button>
          </span></li>`,
          )
          .join("")}</ul>
        <div class="s-foot"><button class="ghost" id="kAccAll" type="button">Accept all ${ksug.length}</button>
        <button class="ghost" id="kRejAll" type="button">Dismiss all</button></div>
      </div>`
          : ""
      }
      ${
        p.krs.length
          ? `<table class="tasks">
        <thead><tr><th style="width:40%">Measure</th><th style="width:22%">Target</th>
        <th style="width:33%">Evidence</th>
        <th class="tight"><span class="vh">Remove</span></th></tr></thead>
        <tbody>${p.krs
          .map(
            (k) => `<tr data-kid="${k.id}">
          <td><textarea rows="2" data-kf="title" placeholder="Describe the measure">${esc(k.title)}</textarea></td>
          <td><input type="text" data-kf="target" value="${esc(k.target || "")}" placeholder="number or date"></td>
          <td><select data-kf="evidence">
            <option value="">choose evidence…</option>
            ${EVIDENCE.map((e) => `<option value="${esc(e)}"${(k.evidence || "") === e ? " selected" : ""}>${esc(e)}</option>`).join("")}
            <option value="__other"${k.evidence && EVIDENCE.indexOf(k.evidence) < 0 ? " selected" : ""}>Something else…</option>
          </select>
          ${k.evidence && EVIDENCE.indexOf(k.evidence) < 0 ? `<input type="text" data-kf="evidence" value="${esc(k.evidence)}" placeholder="Describe the evidence" style="margin-top:4px">` : ""}</td>
          <td class="tight"><button class="kill" data-kkill="${k.id}" aria-label="Remove measure">&times;</button></td>
        </tr>`,
          )
          .join("")}</tbody></table>`
          : `<p class="empty">No measures set yet. Accept the recommendations above or write your own.</p>`
      }
      <div class="own"><span class="own-lab">Measuring something we have not listed? Add it here.</span>
      <div class="row-add">
        <input type="text" id="newKR" placeholder="Describe the measure">
        <button class="act" id="addKR" type="button">Add measure</button>
      </div></div>
    </div>
  </section>

  <section class="move">
    <div class="m-head"><span class="m-num ${st[2] ? "done" : ""}">3</span><h3>Decompose</h3></div>
    <p class="hint">Break the outcome into small, owner-sized actions in the order they should happen. The recommendation list now moves from setup and inputs through build, review, approval, handoff and close.</p>
    ${teach ? teachBox(2) : ""}
    <div class="m-body">
      ${w.own && !SUGGEST[w.n] ? `<p class="s-cleared">This workstream was added by you, so there are no pre-written recommendations. Break it down yourself below — or ask Claude in the chat to draft a breakdown for it.</p>` : ""}
      ${
        sug.length
          ? `<div class="suggest">
        <div class="s-head">
          <h4>Recommended execution sequence — granular tasks</h4>
          <span>${sug.length} remaining to review${done.length ? ` · ${done.length} already reviewed` : ""}</span>
        </div>
        <ul class="s-list">${sug
          .map(
            (s, i) => `<li>
          <span class="s-txt"><span class="step-tag">STEP ${String(i + 1).padStart(2, "0")}</span>${esc(s)}</span>
          <span class="s-btns">
            <button class="s-yes" data-acc="${i}" type="button">Accept</button>
            <button class="s-no" data-rej="${i}" type="button">Dismiss</button>
          </span></li>`,
          )
          .join("")}</ul>
        <div class="s-foot">
          <button class="ghost" id="accAll" type="button">Accept all ${sug.length}</button>
          <button class="ghost" id="rejAll" type="button">Dismiss all</button>
        </div>
      </div>`
          : SUGGEST[w.n]
            ? `<p class="s-cleared">All ${SUGGEST[w.n].length} recommendations reviewed.
          <button class="linky" id="resetSug" type="button">Show them again</button></p>`
            : ""
      }
      ${
        p.tasks.length
          ? `<table class="tasks">
        <thead><tr>
          <th style="width:42%">Task</th><th style="width:20%">Starts after</th>
          <th style="width:17%">Owner</th><th style="width:15%">Required by</th>
          <th class="tight">Done</th><th class="tight"><span class="vh">Remove</span></th>
        </tr></thead>
        <tbody>${p.tasks
          .map(
            (t) => `<tr class="${t.done ? "done" : ""}" data-tid="${t.id}">
          <td>${outcomeTagForWorkstream(w)}<br><textarea rows="2" class="t-title" data-f="title" placeholder="What has to happen">${esc(t.title)}</textarea></td>
          <td><select data-f="dep">${opts(t)}</select>${t.dep ? `<span class="dep-preview">${esc((p.tasks.find((x) => x.id === t.dep) || {}).title || "Predecessor not found")}</span>` : `<span class="dep-preview">No predecessor set</span>`}</td>
          <td><input type="text" data-f="owner" value="${esc(t.owner)}" placeholder="Name"></td>
          <td><input type="date" data-f="due" value="${esc(t.due)}" class="${late(t.due) ? "late" : ""}"></td>
          <td class="tight"><input type="checkbox" class="chk" data-f="done" ${t.done ? "checked" : ""} aria-label="Mark done"></td>
          <td class="tight"><button class="kill" data-kill="${t.id}" title="Remove task" aria-label="Remove task">&times;</button></td>
        </tr>`,
          )
          .join("")}</tbody></table>`
          : `<p class="empty">Nothing broken out yet. Start with the open decision above — it is usually the first real task.</p>`
      }
      <div class="own"><span class="own-lab">Something the recommendations missed? Add it here.</span>
      <div class="row-add">
        <input type="text" id="newTask" placeholder="Describe the task">
        <button class="act" id="addBtn" type="button">Add task</button>
      </div></div>
    </div>
  </section>

  <section class="move">
    <div class="m-head"><span class="m-num ${st[3] ? "done" : ""}">4</span><h3>Sequence</h3></div>
    <p class="hint">Set what each task depends on, then use the sequence map to see the full predecessor and downstream handoff without truncated descriptions.</p>
    ${teach ? teachBox(3) : ""}
    <div class="m-body">${p.tasks.length ? `<div class="seq-map">${sequenceMap(p)}</div>` : `<p class="empty">Accept or add tasks in Decompose first. This view will then show exactly what each task starts after and what it unlocks next.</p>`}</div>
  </section>

  <section class="move">
    <div class="m-head"><span class="m-num ${st[4] ? "done" : ""}">5</span><h3>Assign and date</h3></div>
    <p class="hint">Every task gets one name and one required-by date, working backwards from the event. Dates after 15 December show in <span class="late">this colour</span> — they fall outside your plan lock.</p>
    ${teach ? teachBox(4) : ""}
    <div class="m-body"><div class="s-foot" style="margin-top:0">
      <button class="ghost" id="fillRec" type="button">Fill recommended owner, dates and order</button>
    </div>
    <p class="s-cleared" style="margin-top:9px">Fills empty fields only: the lead named on this workstream, a staged date across October to early December, and each task starting after the one above it. All editable.</p></div>
  </section>`;

  const out = el("outcome");
  out.addEventListener("input", () => {
    p.outcome = out.value;
    save(current);
    renderRegister();
    renderRollup();
    const n = el("panel").querySelector(".m-num");
    n.classList.toggle("done", !!p.outcome.trim());
  });

  el("panel")
    .querySelectorAll("tr[data-tid]")
    .forEach((tr) => {
      const t = p.tasks.find((x) => x.id === tr.dataset.tid);
      tr.querySelectorAll("[data-f]").forEach((inp) => {
        const f = inp.dataset.f,
          ev =
            inp.type === "checkbox" || inp.tagName === "SELECT"
              ? "change"
              : "input";
        inp.addEventListener(ev, () => {
          t[f] = inp.type === "checkbox" ? inp.checked : inp.value;
          save(current);
          if (f === "done" || f === "title") {
            renderPanel();
          } else {
            renderRegister();
            renderRollup();
            refreshPips();
          }
        });
      });
    });
  el("panel")
    .querySelectorAll("[data-kill]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          p.tasks = p.tasks.filter((x) => x.id !== b.dataset.kill);
          p.tasks.forEach((x) => {
            if (x.dep === b.dataset.kill) x.dep = "";
          });
          save(current);
          renderAll();
        }),
    );

  el("panel")
    .querySelectorAll("[data-acc]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const s = sug[+b.dataset.acc];
          appendSuggested(s);
          p.handled.push(s);
          save(current);
          renderAll();
        }),
    );
  el("panel")
    .querySelectorAll("[data-rej]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          p.handled.push(sug[+b.dataset.rej]);
          save(current);
          renderAll();
        }),
    );
  if (el("accAll"))
    el("accAll").onclick = () => {
      sug.forEach((s) => {
        appendSuggested(s);
        p.handled.push(s);
      });
      save(current);
      renderAll();
    };
  if (el("rejAll"))
    el("rejAll").onclick = () => {
      sug.forEach((s) => p.handled.push(s));
      save(current);
      renderAll();
    };
  if (el("resetSug"))
    el("resetSug").onclick = () => {
      const titles = p.tasks.map((t) => t.title);
      p.handled = p.handled.filter((s) => titles.includes(s));
      save(current);
      renderAll();
    };

  if (el("useOutcome"))
    el("useOutcome").onclick = () => {
      p.outcome = rec[0];
      save(current);
      renderAll();
    };
  if (el("useDod"))
    el("useDod").onclick = () => {
      p.outcome = DOD[w.n].s;
      save(current);
      renderAll();
    };

  el("panel")
    .querySelectorAll("[data-kacc]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const s = ksug[+b.dataset.kacc];
          p.krs.push({
            id:
              "k" +
              Date.now().toString(36) +
              Math.random().toString(36).slice(2, 6),
            title: s,
            target: "",
            evidence: guessEvidence(s),
          });
          p.khandled.push(s);
          save(current);
          renderAll();
        }),
    );
  el("panel")
    .querySelectorAll("[data-krej]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          p.khandled.push(ksug[+b.dataset.krej]);
          save(current);
          renderAll();
        }),
    );
  if (el("kAccAll"))
    el("kAccAll").onclick = () => {
      ksug.forEach((s) => {
        p.krs.push({
          id: "k" + Math.random().toString(36).slice(2, 9),
          title: s,
          target: "",
          evidence: guessEvidence(s),
        });
        p.khandled.push(s);
      });
      save(current);
      renderAll();
    };
  if (el("kRejAll"))
    el("kRejAll").onclick = () => {
      ksug.forEach((s) => p.khandled.push(s));
      save(current);
      renderAll();
    };
  el("panel")
    .querySelectorAll("tr[data-kid]")
    .forEach((tr) => {
      const k = p.krs.find((x) => x.id === tr.dataset.kid);
      tr.querySelectorAll("[data-kf]").forEach((inp) => {
        const ev = inp.tagName === "SELECT" ? "change" : "input";
        inp.addEventListener(ev, () => {
          if (inp.tagName === "SELECT" && inp.value === "__other") {
            k.evidence = " ";
            save(current);
            renderPanel();
            return;
          }
          k[inp.dataset.kf] = inp.value;
          save(current);
          if (inp.tagName === "SELECT") renderPanel();
        });
      });
    });
  el("panel")
    .querySelectorAll("[data-kkill]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          p.krs = p.krs.filter((x) => x.id !== b.dataset.kkill);
          save(current);
          renderAll();
        }),
    );
  const addK = () => {
    const v = el("newKR").value.trim();
    if (!v) return;
    p.krs.push({
      id: "k" + Math.random().toString(36).slice(2, 9),
      title: v,
      target: "",
      evidence: guessEvidence(v),
    });
    el("newKR").value = "";
    save(current);
    renderAll();
    el("newKR").focus();
  };
  el("addKR").onclick = addK;
  el("newKR").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addK();
    }
  });

  el("panel")
    .querySelectorAll("[data-amb]")
    .forEach(
      (inp) =>
        (inp.oninput = () => {
          ambassadorState[inp.dataset.amb] = inp.value;
          persist("ambassadors", ambassadorState);
          if (!el("directionView").hidden) renderDirection();
        }),
    );
  el("panel")
    .querySelectorAll("[data-mob]")
    .forEach(
      (c) =>
        (c.onchange = () => {
          const m = mobOf(current);
          m[c.dataset.mob] = c.checked;
          save(current);
          renderAll();
        }),
    );
  if (el("mobNotes"))
    el("mobNotes").oninput = (e) => {
      mobOf(current).notes = e.target.value;
      save(current);
    };
  bindReviewControls(el("panel"), () => {
    renderPanel();
  });

  if (el("fillRec"))
    el("fillRec").onclick = () => {
      const lead = (w.leads.split("/")[0] || "").trim();
      const named =
        lead && !/to assign/i.test(lead)
          ? lead.replace(/\s*\(interim\)/i, "")
          : "";
      const stages = ["2026-10-16", "2026-11-13", "2026-12-04"];
      const n = p.tasks.length;
      p.tasks.forEach((t, i) => {
        if (!t.owner.trim() && named) t.owner = named;
        if (!t.due)
          t.due = stages[Math.min(2, Math.floor(i / Math.max(1, n / 3)))];
        if (!t.dep && i > 0) t.dep = p.tasks[i - 1].id;
      });
      save(current);
      renderAll();
    };

  const add = () => {
    const v = el("newTask").value.trim();
    if (!v) return;
    p.tasks.push({
      id:
        "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      title: v,
      owner: "",
      due: "",
      dep: "",
      done: false,
    });
    el("newTask").value = "";
    save(current);
    renderAll();
    el("newTask").focus();
  };
  el("addBtn").onclick = add;
  el("newTask").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  });
}
function refreshPips() {
  const st = moveState(planOf(current));
  el("panel")
    .querySelectorAll(".m-num")
    .forEach((n, i) => n.classList.toggle("done", st[i]));
}

function mobOf(id) {
  const p = planOf(id);
  if (!p.mobilize)
    p.mobilize = {
      leadAligned: false,
      briefReady: false,
      firstActions: false,
      dependencies: false,
      firstCheckpoint: false,
      leadAccepted: false,
      notes: "",
    };
  return p.mobilize;
}
function mobScore(id) {
  const m = mobOf(id);
  return [
    m.leadAligned,
    m.briefReady,
    m.firstActions,
    m.dependencies,
    m.firstCheckpoint,
    m.leadAccepted,
  ].filter(Boolean).length;
}
function mobStage(id) {
  const n = mobScore(id);
  if (n === 6) return ["Owned by lead", "owned"];
  if (n >= 5) return ["Ready to hand over", "ready"];
  if (n >= 2) return ["Lead aligned", "align"];
  return ["Mobilizing", "setup"];
}
function renderMobilize() {
  const ranked = WS.slice().sort(
    (a, b) => mobScore(b.id) - mobScore(a.id) || a.n - b.n,
  );
  const owned = ranked.filter((w) => mobScore(w.id) === 6).length,
    ready = ranked.filter((w) => mobScore(w.id) === 5).length,
    aligned = ranked.filter((w) => mobScore(w.id) >= 2).length;
  const pct =
    Math.round(
      (ranked.reduce((z, w) => z + mobScore(w.id), 0) / (ranked.length * 6)) *
        100,
    ) || 0;
  el("mobilizeView").innerHTML =
    `<div class="ex-top"><p class="st-date">Mobilization board</p><h2>Stand it up. Align the lead. Hand it over.</h2><p>Core support starts the work. The lead stays aligned and then accepts ownership.</p></div>
  <div class="mob-grid"><div class="mob-card"><b>${pct}%</b><span>overall mobilization readiness</span></div><div class="mob-card"><b>${aligned}/${ranked.length}</b><span>lead-aligned workstreams</span></div><div class="mob-card"><b>${ready}</b><span>ready for handover</span></div><div class="mob-card"><b>${owned}</b><span>accepted by workstream lead</span></div></div>
  <div class="lead-align"><b>Rule:</b> Core support mobilizes. The lead aligns and owns execution after handover.</div>
  <div class="mob-board"><div class="mob-row head"><span>#</span><span>Workstream</span><span>Lead</span><span>Readiness</span><span>Stage</span><span>Open</span></div>${ranked
    .map((w, i) => {
      const n = mobScore(w.id),
        st = mobStage(w.id);
      return `<button class="mob-row" data-mobid="${w.id}" type="button" style="width:100%;text-align:left;border-left:0;border-right:0;border-top:0;background:transparent;color:inherit;cursor:pointer"><span class="mob-rank">${i + 1}</span><span class="mob-name">${esc(w.name)}<small>${n}/6 mobilization gates</small></span><span>${esc(w.leads.split("/")[0].trim())}</span><span><div class="meter"><i style="width:${(n / 6) * 100}%"></i></div></span><span><span class="stage ${st[1]}">${st[0]}</span></span><span>${6 - n} gates</span></button>`;
    })
    .join("")}</div>
  <section class="mob-sec"><h3>What counts as a clean handover?</h3><p class="st-lede">The lead should receive a workstream that already has enough structure to execute: the intended outcome, initial actions, dependencies, first checkpoint and any commitments already made. Acceptance is explicit—not assumed.</p></section>`;
  el("mobilizeView")
    .querySelectorAll("[data-mobid]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          current = b.dataset.mobid;
          showView("notebook");
          renderAll();
          setTimeout(
            () =>
              document
                .querySelector(".mob-sec-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "start" }),
            50,
          );
        }),
    );
}

/* ---------- v11 people command ---------- */

// Active Team is the primary coach-image source. These verified Active Team / Academy Team images override fallback Drive assets.

// v35 coach-photo review: Active Team / Team Images takes precedence; Kyle uses verified fallback.

const COACH_PROFILE_MAP = Object.fromEntries(
  COACH_PROFILE_SOURCE.map((r) => [
    r[0],
    {
      name: r[0],
      title: r[1],
      organization: r[2],
      link: r[3],
      source: "Judges & Coaches Mar '26 · Coaches tab",
    },
  ]),
);

let peopleMode = "directory",
  peopleRole = "All",
  peopleQuery = "";
let peoplePage = 0;
const canonName = (n) => PERSON_ALIAS[n] || n;
function initials(n) {
  return (
    String(n || "")
      .replace(/[^A-Za-zÀ-ÿ' -]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join("")
      .toUpperCase() || "?"
  );
}
function judgeProfileOf(n) {
  const c = canonName(n);
  return JUDGE_PROFILES.find((p) => p.name === c) || null;
}
function judgeHistoryOf(n) {
  const c = canonName(n),
    out = [];
  Object.entries(JUDGE_HISTORY).forEach(([e, ns]) => {
    if (ns.some((x) => canonName(x) === c)) out.push(e);
  });
  return out;
}
function mergedJudgeState(n) {
  const c = canonName(n),
    base = JUDGE_DEFAULTS[c] || JUDGE_DEFAULTS[n] || {},
    live = judgeState[c] || judgeState[n] || {};
  return { ...base, ...live };
}
function judgeMasterNames() {
  return [
    ...new Set([
      ...JUDGE_POOL.map(canonName),
      ...PRELIM_EVALUATOR_CANDIDATES.map(canonName),
    ]),
  ];
}
function ownerPeople() {
  const map = {};
  const add = (name, responsibility) => {
    name = String(name || "")
      .trim()
      .replace(/\s*\(interim\)\s*/gi, "")
      .replace(/\s*-\s*Interim$/i, "");
    if (
      !name ||
      /to assign|functional owners?|judging lead|leadership|owner required|communications owner|workforce owner|medical owner|production owner|legal-regulatory owner|registration owner|speaker support/i.test(
        name,
      )
    )
      return;
    (map[name] || (map[name] = [])).push(responsibility);
  };
  SEED.forEach((r) =>
    String(r[1] || "")
      .split("/")
      .forEach((n) => add(n, r[0])),
  );
  STAKEHOLDER_GROUPS.forEach((g) =>
    String(g.owners || "")
      .split("/")
      .forEach((n) => add(n, `Stakeholder · ${g.name}`)),
  );
  Object.keys(map).forEach((n) => (map[n] = [...new Set(map[n])]));
  return map;
}
function personCompleteness(p) {
  const photo = !!String(p.photo || "").trim();
  const profile = !!String(p.bio || "").trim();
  const title = !!String(p.title || "").trim();
  const org = !!String(p.organization || "").trim();
  const email = !!String(p.email || "").trim();
  const phone = !!String(p.phone || "").trim();
  const link = !!String(p.link || "").trim();
  const publication = !!String(p.publication || "").trim();
  return (
    (photo ? 8 : 0) +
    (profile ? 5 : 0) +
    (title ? 3 : 0) +
    (org ? 2 : 0) +
    (email ? 2 : 0) +
    (phone ? 2 : 0) +
    (link ? 1 : 0) +
    (publication ? 1 : 0)
  );
}
function buildPeople() {
  const M = new Map();
  const get = (n) => {
    n = canonName(n);
    if (!M.has(n))
      M.set(n, {
        name: n,
        roles: [],
        roleStatuses: {},
        responsibilities: [],
        title: "",
        organization: "",
        category: "",
        status: "",
        email: "",
        phone: "",
        link: "",
        bio: "",
        fit: "",
        publication: "",
        photo: "",
        source: "",
        notes: "",
      });
    return M.get(n);
  };
  judgeMasterNames().forEach((n) => {
    const p = get(n),
      jp = judgeProfileOf(n),
      js = mergedJudgeState(n),
      hist = judgeHistoryOf(n);
    p.roles.push(
      PRELIM_EVALUATOR_CANDIDATES.map(canonName).includes(n)
        ? "Senior Technical Reviewer Candidate"
        : "Judge",
    );
    p.status = js.status || p.status || "To Confirm";
    p.roleStatuses[p.roles.at(-1)] = js.status || "To Confirm";
    p.email = js.email || p.email;
    p.phone = js.phone || p.phone;
    p.link = js.link || (jp && jp.link) || p.link;
    p.notes = js.notes || p.notes;
    p.title = (jp && jp.title) || p.title;
    p.bio = (jp && jp.bio) || p.bio;
    p.publication = (jp && jp.publication) || p.publication;
    p.photo = (jp && jp.photo) || p.photo;
    p.source = (jp && jp.source_tags) || hist.join("; ");
  });
  SPEAKER_PROFILES.forEach((x) => {
    const p = get(x.name);
    p.roles.push("Speaker");
    p.roleStatuses.Speaker = x.status || "To Confirm";
    p.title = p.title || x.title;
    p.status = x.status || p.status;
    p.bio = p.bio || x.bio;
    p.fit = x.fit;
    p.publication = x.publication;
    p.source = p.source || x.prior;
    p.photo = p.photo || x.photo || "";
    p.link = p.link || x.link || "";
  });
  COACH_ROSTER.filter(
    (r) => r[1] !== "Senior Technical Reviewer Candidate",
  ).forEach(([n, st]) => {
    const p = get(n),
      cp = COACH_PROFILE_MAP[n] || {};
    p.roles.push("Coach");
    p.roleStatuses.Coach = st || "To Confirm";
    if (!p.status || p.status === "Tentative" || p.status === "To Confirm")
      p.status = st;
    p.notes = p.notes || "January 2027 coach consideration: " + st;
    p.photo = p.photo || COACH_PHOTOS[n] || "";
    p.title = p.title || cp.title || "";
    p.organization = p.organization || cp.organization || "";
    p.link = p.link || cp.link || "";
    p.source =
      p.source ||
      cp.source ||
      (COACH_PHOTOS[n]
        ? "Intellibus Google Drive — Active Team / Academy Team image source"
        : "");
    p.publication =
      p.publication ||
      (p.photo && p.title
        ? "Profile data substantially ready; confirmation and final bio/contact review still required."
        : "Profile incomplete — collect missing role, organization, headshot and/or contact information.");
  });
  NETWORK_CONTACTS.forEach((c) => {
    const p = get(c.name);
    p.roles.push("Network Contact");
    p.roleStatuses["Network Contact"] = "Network prospect";
    p.title = p.title || c.title;
    p.organization = p.organization || c.organization;
    p.category = p.category || c.category;
    p.email = p.email || c.email;
    p.phone = p.phone || c.phone;
    p.status = p.status || "Network prospect";
    p.source = p.source || "Speaker & Network Tracker";
    p.notes = p.notes || c.why || c.next || "";
  });
  Object.entries(ownerPeople()).forEach(([n, rs]) => {
    const p = get(n);
    p.roles.push("Internal Owner");
    p.roleStatuses["Internal Owner"] = "Internal assignment";
    p.responsibilities = [...new Set([...p.responsibilities, ...rs])];
    if (!p.status) p.status = "Internal";
  });
  // Merge verified contact details at read time so saved planning edits and current roles survive.
  const identity = (name) => canonName(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  (window.ATLAS_PEOPLE_ENRICHMENT || []).forEach((record) => {
    const existing = [...M.values()].find((person) => identity(person.name) === identity(record.name));
    const p = existing || get(record.name);
    if (!existing && record.role) {
      p.roles.push(record.role);
      p.roleStatuses[record.role] = "To Confirm";
      p.status = "To Confirm";
      p.source = record.source || "Verified contact source";
    }
    // Do not overwrite a saved email, current title or role with historical roster data.
    p.email = p.email || record.email || "";
    p.title = p.title || record.title || "";
    p.organization = p.organization || record.organization || "";
    p.linkedin = record.linkedin || (/^https?:\/\/(?:www\.)?linkedin\.com\/in\//i.test(p.link) ? p.link : "");
    if (!p.link && p.linkedin) p.link = p.linkedin;
  });
  M.forEach((p) => {
    p.roles = [...new Set(p.roles)];
    p.responsibilities = [...new Set(p.responsibilities)];
  });
  return [...M.values()].sort(
    (a, b) =>
      personCompleteness(b) - personCompleteness(a) ||
      a.name.localeCompare(b.name),
  );
}
function personStage(p) {
  if (p.roles.includes("Speaker")) {
    if (p.status === "Confirmed") return "Assets & logistics";
    if (p.status === "Approved for Outreach") return "Outreach";
    if (p.status === "For Review" || p.status === "Hold") return "Verify";
  }
  if (p.roles.includes("Senior Technical Reviewer Candidate")) return "Confirm";
  if (p.roles.includes("Judge")) {
    if (p.status === "Confirmed") return "Brief & schedule";
    if (p.status === "Invited") return "Follow-up";
    return "Verify";
  }
  if (p.roles.includes("Coach")) {
    if (p.status === "Invite") return "Outreach";
    if (p.status === "Online Coach") return "Confirm";
    if (p.status === "TBD") return "Verify";
    if (p.status === "No") return "Closed";
  }
  if (p.roles.some((r) => r.startsWith("Transport"))) return "Plan & contract";
  if (p.roles.includes("Internal Owner")) return "Internal alignment";
  return "Verify";
}
// Render a compact roster card; missing fields stay explicit instead of being inferred.
function personCard(p) {
  const photo = p.photo
    ? `<img class="person-photo" src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy" width="64" height="64">`
    : `<div class="person-avatar" aria-label="No headshot">${esc(initials(p.name))}</div>`;
  return `<article class="person-card" data-person-card><div class="person-top">${photo}<div><h3 class="person-name">${esc(p.name)}</h3><p class="person-title">${esc(p.title || p.organization || "Role details pending")}</p></div></div><div class="role-chips">${p.roles.map((r) => `<span class="role-chip">${esc(r)} · ${esc(p.roleStatuses[r] || "To Confirm")}</span>`).join("")}</div><div class="person-contacts">${p.email ? `<a href="mailto:${esc(p.email)}" title="${esc(p.email)}">${esc(p.email)}</a>` : "<span>Email not yet supplied</span>"}${p.phone ? `<a href="tel:${esc(p.phone.replace(/[^+0-9]/g, ""))}">${esc(p.phone)}</a>` : "<span>Phone not yet supplied</span>"}${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn profile ↗</a>` : ""}</div><div class="person-bottom"><span>${p.photo ? "Source profile" : "Headshot needed"}</span><button type="button" data-profile="${esc(p.name)}" aria-label="View profile for ${esc(p.name)}">Profile <span aria-hidden="true">↗</span></button></div></article>`;
}

// Open full source details in a native, keyboard-accessible dialog without leaving the directory.
function openPersonProfile(name) {
  const p = buildPeople().find((p) => p.name === name);
  if (!p) return;
  const dialog = el("personDialog");
  const paragraphs = [
    [
      "Status by role",
      Object.entries(p.roleStatuses)
        .map(([role, status]) => `${role}: ${status}`)
        .join(" · "),
    ],
    ["Profile", p.bio],
    ["Programme fit", p.fit],
    ["Organization", [p.organization, p.category].filter(Boolean).join(" · ")],
    ["Responsibilities", p.responsibilities.join(" · ")],
    ["Source / history", p.source],
    ["Publication readiness", p.publication],
    ["Notes", p.notes],
  ];
  dialog.innerHTML = `<form method="dialog"><button class="profile-close" aria-label="Close profile">×</button></form><div class="profile-heading">${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" width="96" height="96">` : `<span class="person-avatar">${esc(initials(p.name))}</span>`}<div><p class="people-kicker">${esc(p.roles.join(" · "))}</p><h2 id="profileTitle">${esc(p.name)}</h2><p>${esc(p.title || p.organization || "Working roster")}</p></div></div><p class="profile-status">${esc(p.status || "Working")} · ${esc(personStage(p))}</p><div class="profile-contact">${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ""}${p.phone ? `<a href="tel:${esc(p.phone.replace(/[^+0-9]/g, ""))}">${esc(p.phone)}</a>` : ""}${p.linkedin ? `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn profile ↗</a>` : ""}${p.link && p.link !== p.linkedin ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">Source profile ↗</a>` : ""}</div>${paragraphs
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<section><h3>${label}</h3><p>${esc(value)}</p></section>`,
    )
    .join("")}`;
  dialog.showModal();
  document.body.classList.add("profile-open");
  dialog.onclose = () => document.body.classList.remove("profile-open");
}

function judgeProfilesBlock() {
  const ps = JUDGE_PROFILES.slice().sort((a, b) => {
    const score = (x) => {
      const st = mergedJudgeState(x.name) || {};
      return (
        (x.photo ? 8 : 0) +
        (x.bio ? 5 : 0) +
        (x.title ? 3 : 0) +
        (st.email ? 2 : 0) +
        (st.phone ? 2 : 0) +
        (x.link ? 1 : 0) +
        (x.publication ? 1 : 0)
      );
    };
    return score(b) - score(a) || a.name.localeCompare(b.name);
  });
  return `<div class="source-note"><b>Visual profile source.</b> ${ps.length} international-judge profiles and embedded headshots/placeholders were consolidated from <i>International Judges - Profiles Bios and Headshots.docx</i>. Historical listing is not a 2027 confirmation.</div><div class="judge-profile-grid">${ps
    .map((j) => {
      const s = mergedJudgeState(j.name),
        hist = judgeHistoryOf(j.name);
      return `<article class="judge-profile-card"><div class="person-top">${j.photo ? `<img class="person-photo" src="${j.photo}" alt="${esc(j.name)} headshot">` : `<div class="person-avatar">${esc(initials(j.name))}</div>`}<div><div class="person-name">${esc(j.name)}</div><div class="person-title">${esc(j.title)}</div><div class="role-chips"><span class="role-chip judge">International Judge</span><span class="role-chip">${esc(s.status || "To Confirm")}</span></div></div></div><p>${esc(j.bio)}</p><details><summary>Full profile, contact &amp; source notes</summary><p><b>Historical judging:</b> ${esc(hist.join("; ") || j.source_tags || "Working roster")}</p>${j.contact ? `<p><b>Contact from source:</b> ${esc(j.contact)}</p>` : ""}${s.email ? `<p><b>Email:</b> ${esc(s.email)}</p>` : ""}${s.phone ? `<p><b>Phone:</b> ${esc(s.phone)}</p>` : ""}<p><b>Proposed role:</b> ${esc(j.role)}</p><p><b>Research notes:</b> ${esc(j.notes.join(" "))}</p>${j.link ? `<p><a href="${esc(j.link)}" target="_blank" rel="noopener">Open source profile</a></p>` : ""}<p><b>Publication readiness:</b> ${esc(j.publication)}</p></details></article>`;
    })
    .join("")}</div>`;
}
function commNames(filterFn) {
  return buildPeople().filter(filterFn);
}
function commMap() {
  const stages = [
      "Verify",
      "Outreach",
      "Follow-up",
      "Confirm",
      "Assets & logistics",
      "Brief & schedule",
      "Live / close",
    ],
    people = buildPeople();
  const stageFor = (p) => personStage(p);
  const maps = {
    Verify: (x) => x === "Verify" || x === "Resolve / verify",
    Outreach: (x) => x === "Outreach",
    "Follow-up": (x) => x === "Follow-up",
    Confirm: (x) => x === "Confirm",
    "Assets & logistics": (x) => x === "Assets & logistics",
    "Brief & schedule": (x) => x === "Brief & schedule",
    "Live / close": (x) => x === "Live / close",
  };
  const lanes = [
    [
      "Judges + senior technical reviewers",
      people.filter((p) =>
        p.roles.some((r) =>
          /Judge|Evaluator|Senior Technical Reviewer/.test(r),
        ),
      ),
    ],
    ["Speakers", people.filter((p) => p.roles.includes("Speaker"))],
    ["Coaches", people.filter((p) => p.roles.includes("Coach"))],
    [
      "Ecosystem / network contacts",
      people.filter(
        (p) =>
          p.roles.includes("Network Contact") && !p.roles.includes("Speaker"),
      ),
    ],
  ];
  const laneHtml = lanes
    .map(
      ([label, ps]) =>
        `<section class="comm-lane-flow"><div class="comm-lane-title"><h3>${esc(label)}</h3><span>${ps.length} people in this pipeline</span></div><div class="comm-stage-flow">${stages
          .map((st, i) => {
            const list = ps.filter((p) => maps[st](stageFor(p)));
            return `<details class="comm-stage-card" ${list.length && i < 2 ? "open" : ""}><summary><strong>${i + 1}. ${esc(st)}</strong><span class="stage-count">${list.length} ${list.length === 1 ? "person" : "people"}</span></summary>${list.length ? `<div class="comm-stage-people">${list.map((p) => `<div class="comm-person"><b>${esc(p.name)}</b>${p.organization ? ` · ${esc(p.organization)}` : ""}</div>`).join("")}</div>` : `<div class="comm-empty">No one currently mapped here.</div>`}</details>`;
          })
          .join("")}</div></section>`,
    )
    .join("");
  return `<div class="people-hero"><span class="people-kicker">Communication architecture</span><h2>See the pipeline, then open the people.</h2><p>The stage logic is preserved, but the table has been replaced by a visual flow. Each stage shows an actual count and opens to every person in that stage—every count opens to the full underlying list.</p></div><div class="comm-flow-wrap">${laneHtml}</div>`;
}
function transportView() {
  const rows = [
    [
      "Parish bus programme",
      "National parish model; central pickup points and route windows to be confirmed.",
      "Working / TBC",
    ],
    [
      "Institution / school / university buses",
      "Supplementary buses are part of the working model; institutions and capacities are not yet locked.",
      "TBC",
    ],
    [
      "Sponsored buses",
      "Sponsor-a-Bus process, pricing/recognition and route assignment still need to be finalized.",
      "Build required",
    ],
    [
      "Participant booking",
      "Bus choice should be tied to participant identity / final confirmation.",
      "Integration required",
    ],
    [
      "Vehicle manifests",
      "One controlled manifest per vehicle, with emergency contacts and pre-departure completion.",
      "Build required",
    ],
    [
      "Arrival waves",
      "Departures must be timed so arrivals do not overwhelm check-in capacity.",
      "Planning",
    ],
    [
      "Return movement",
      "Return windows and overnight-participant rules must be published for both event days.",
      "TBC",
    ],
    [
      "VIP / specialist transport",
      "Separate vehicle requirement to be confirmed and booked.",
      "TBC",
    ],
  ];
  const flow = [
    [
      "1",
      "Demand",
      "Forecast riders by parish, institution and special group.",
    ],
    [
      "2",
      "Pickup",
      "Confirm safe central pickup points and local route owners.",
    ],
    ["3", "Operator", "Contract buses; capture vehicle + driver details."],
    ["4", "Booking", "Tie bus choice to participant identity / confirmation."],
    ["5", "Manifest", "Freeze controlled passenger + emergency contact lists."],
    ["6", "Dispatch", "Send reminders; manage departure and arrival waves."],
    ["7", "Return", "Publish return rules, windows and closeout confirmation."],
  ];
  return `<div class="people-hero"><span class="people-kicker">Movement command</span><h2>Transport, from demand to return.</h2><p>Everything currently supported by the workbook is shown here. Route names, pickup points, exact departure times and operator contracts are still missing and remain explicit TBCs rather than invented detail.</p></div><div class="transport-hero"><div class="transport-card"><h3 style="margin-top:0">Command ownership</h3><div class="people-grid"><article class="person-card"><div class="person-top"><div class="person-avatar">TR</div><div><div class="person-name">Travis</div><div class="person-title">Transport lead</div><div class="role-chips"><span class="role-chip">Accountable</span></div></div></div><div class="person-status"><b>Working</b><span>Routes · demand · participant movement</span></div></article><article class="person-card"><div class="person-top"><div class="person-avatar">NK</div><div><div class="person-name">Nakia</div><div class="person-title">Transport support</div><div class="role-chips"><span class="role-chip">Supporting</span></div></div></div><div class="person-status"><b>Working</b><span>Venue · arrival · care interface</span></div></article></div></div><div class="transport-card"><h3 style="margin-top:0">Operating baseline</h3><p class="profile-copy">National parish bus programme, supplemented by institution and sponsored buses, with controlled manifests, timed arrivals, return movement, and separate VIP/specialist transport.</p><div class="source-note" style="margin:10px 0 0"><b>Publication gate:</b> routes, pickup points, departure/return windows and participant instructions must be final before the Bus &amp; Transport Schedule can publish.</div></div></div><h3 style="margin-top:24px">Transport sequence</h3><div class="transport-flow">${flow.map((x) => `<div class="tf-step"><b>${x[0]}. ${x[1]}</b><span>${x[2]}</span></div>`).join("")}</div><h3 style="margin-top:24px">Consolidated transport readiness</h3><div class="transport-card"><div class="transport-matrix">${rows.map((r) => `<div class="tm-row"><b>${r[0]}</b><span>${r[1]}</span><span class="tm-state">${r[2]}</span></div>`).join("")}</div></div>`;
}

function schoolContactForInstitution(name) {
  const n = String(name || "").toLowerCase();
  const aliases = [
    [/university of the west indies|uwi /i, /University of the West Indies/i],
    [/university of technology|utech/i, /University of Technology/i],
    [
      /university of the commonwealth caribbean|ucc/i,
      /University of the Commonwealth Caribbean/i,
    ],
    [/caribbean maritime university|cmu/i, /Caribbean Maritime University/i],
    [/northern caribbean university|ncu/i, /Northern Caribbean University/i],
  ];
  for (const [match, org] of aliases) {
    if (match.test(n)) {
      const c = NETWORK_CONTACTS.find((x) => org.test(x.organization));
      if (c) return c;
    }
  }
  return null;
}
function schoolNetworkView() {
  const rows = TEAM_TRANSPORT_DRAFT.map((r, i) => ({
    id: i + 1,
    type: r[0],
    parish: r[1],
    institution: r[2],
    travel: r[3],
    meet: r[4],
    depart: r[5],
    arrival: r[6],
    returnDepart: r[7],
    back: r[8],
    contact: schoolContactForInstitution(r[2]),
  }));
  const parishes = [...new Set(rows.map((r) => r.parish))].sort((a, b) =>
    a.localeCompare(b),
  );
  const hs = rows.filter((r) => r.type === "High school").length,
    uni = rows.filter((r) => r.type === "University").length,
    known = rows.filter((r) => r.contact).length;
  const flow = [
    [
      "01",
      "Institution ownership",
      "Name the school/university relationship lead, principal/dean/student-services contact and internal Intellibus owner.",
    ],
    [
      "02",
      "Outreach & ambassador",
      "Confirm whether the institution is an active recruitment node, identify ambassador(s), and agree the student outreach route.",
    ],
    [
      "03",
      "Registration & GQ",
      "Set institution target; track registrations, eligibility/GQ progression and confirmed attendees.",
    ],
    [
      "04",
      "Transport demand",
      "Capture riders, validate pickup hub and bus need, then match demand to operator/capacity.",
    ],
    [
      "05",
      "Manifest & event brief",
      "Freeze passenger list, emergency contacts, departure instructions, check-in link and return/overnight rules.",
    ],
    [
      "06",
      "Event arrival",
      "Confirm dispatch, arrival wave, school lead contact, check-in completion and exceptions.",
    ],
    [
      "07",
      "Talent follow-up",
      "Return participation/results to the institution and route high-potential participants into Academy/jobs follow-up.",
    ],
  ];
  const parishCards = parishes
    .map((p) => {
      const rs = rows.filter((r) => r.parish === p);
      return `<article class="school-parish-card"><h4>${esc(p)} <span>${rs.length} node${rs.length === 1 ? "" : "s"}</span></h4>${rs.map((r) => `<div class="school-node"><span class="school-type">${esc(r.type)}</span>${esc(r.institution)}<small>${esc(r.parish)} · transport planning linked in Transport Command</small>${r.contact ? `<span class="school-contact">Contact: ${esc(r.contact.name)} · ${esc(r.contact.organization)}</span>` : ""}</div>`).join("")}</article>`;
    })
    .join("");
  return `<div class="school-hero"><span class="people-kicker">Institution network command</span><h2>School network on Jamaica.</h2><p>The transport-linked institutions with matched coordinates are shown geographically so the network can be read as a national footprint first, then worked as outreach, registration and transport records underneath.</p></div>
  <div class="school-kpis"><div class="school-kpi"><b>${rows.length}</b><span>transport-linked institution nodes</span></div><div class="school-kpi"><b>${parishes.length}</b><span>parishes represented</span></div><div class="school-kpi"><b>${hs}</b><span>high-school nodes</span></div><div class="school-kpi"><b>${known}</b><span>institution nodes with an existing network contact</span></div></div>
  <div class="school-map-shell"><div id="schoolNetworkMap" class="school-map"></div><aside class="school-map-side"><h4>Network map</h4><p>High schools and universities are plotted from the current school/transport list. The map is intentionally smaller than Transport Command: its job is to show reach and gaps, not route operations.</p><div class="school-map-legend"><span><i style="background:${TRANSPORT_CATEGORY_COLORS.highschool}"></i>High schools</span><span><i style="background:${TRANSPORT_CATEGORY_COLORS.college}"></i>Colleges</span><span><i style="background:${TRANSPORT_CATEGORY_COLORS.university}"></i>Universities</span><span><i style="background:#111"></i>Montego Bay Convention Centre</span></div><p id="schoolMapStatus">Offline map enhancement not loaded; institution matrix remains authoritative.</p></aside></div>
  <div class="school-note"><b>Source-of-truth rule.</b> School Network owns the institution relationship, outreach, participant target and readiness status. Transport Command owns pickup hubs, route timing, buses, manifests and arrival waves. This view only shows the handoff status so route data is not maintained twice.</div>
  <section class="ex-sec"><h3>Institution engagement sequence</h3><div class="school-flow">${flow.map((x) => `<div class="school-flow-step"><b>${esc(x[0])} · ${esc(x[1])}</b><span>${esc(x[2])}</span></div>`).join("")}</div></section>
  <section class="ex-sec"><h3>National network by parish</h3><div class="school-parish-grid">${parishCards}</div></section>
  <section class="ex-sec"><h3>Institution-to-transport operating matrix</h3><div class="table-scroll"><table class="stake-table school-table"><thead><tr><th>Institution</th><th>Type</th><th>Parish</th><th>Known network contact</th><th>Ambassador / outreach</th><th>Participant target</th><th>Registration / GQ</th><th>Bus demand</th><th>Manifest</th><th>Next communication touchpoint</th></tr></thead><tbody>${rows.map((r) => `<tr><td><b>${esc(r.institution)}</b><br><small>${esc(r.parish)} · route details maintained in Transport Command</small></td><td>${esc(r.type)}</td><td>${esc(r.parish)}</td><td>${r.contact ? `<b>${esc(r.contact.name)}</b><br><small>${esc(r.contact.title)}</small>${r.contact.email ? `<br><small>${esc(r.contact.email)}</small>` : ""}${r.contact.phone ? `<br><small>${esc(r.contact.phone)}</small>` : ""}` : `<span class="school-gap">TBC</span>`}</td><td><span class="school-gap">TBC</span></td><td><span class="school-gap">TBC</span></td><td><span class="school-gap">TBC</span></td><td><span class="school-gap">TBC</span></td><td><span class="school-gap">TBC</span></td><td>Name/confirm institution contact → confirm participation → set target → capture registrations/riders.</td></tr>`).join("")}</tbody></table></div></section>`;
}
let schoolLeafletMap = null;
async function initSchoolNetworkMap() {
  const elMap = [...document.querySelectorAll("[id=schoolNetworkMap]")].find(
    (e) => e.getClientRects().length,
  );
  if (!elMap) return;
  const status = elMap.parentElement.querySelector("[id=schoolMapStatus]");
  if (schoolLeafletMap) {
    try {
      schoolLeafletMap.remove();
    } catch (e) {}
    schoolLeafletMap = null;
  }
  if (!window.L) {
    if (status)
      status.textContent =
        "Map unavailable; institution list remains available below.";
    return;
  }
  schoolLeafletMap = L.map(elMap, {
    scrollWheelZoom: false,
    zoomControl: true,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
  }).setView([18.15, -77.3], 8);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(schoolLeafletMap);
  const raw = transportNetworkPoints().filter((x) => x.category !== "town"),
    bounds = [];
  let shown = 0;
  for (let i = 0; i < raw.length; i++) {
    let p = raw[i];
    if (p.lat == null) p = await geocodeTransportPoint(p);
    if (p.lat == null || p.lng == null) continue;
    shown++;
    bounds.push([p.lat, p.lng]);
    const color =
      TRANSPORT_CATEGORY_COLORS[p.category] ||
      TRANSPORT_CATEGORY_COLORS.highschool;
    L.circleMarker([p.lat, p.lng], {
      radius: 7,
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.82,
    })
      .addTo(schoolLeafletMap)
      .bindPopup(
        `<b>${esc(p.label)}</b><br>${esc(p.parish)} · ${esc(TRANSPORT_CATEGORY_META[p.category].short)}${schoolContactForInstitution(p.label) ? `<br><small>Network contact: ${esc(schoolContactForInstitution(p.label).name)}</small>` : ""}`,
      );
  }
  L.circleMarker([TRANSPORT_VENUE.lat, TRANSPORT_VENUE.lng], {
    radius: 8,
    color: "#111",
    weight: 3,
    fillColor: "#fff",
    fillOpacity: 1,
  })
    .addTo(schoolLeafletMap)
    .bindPopup(`<b>${esc(TRANSPORT_VENUE.name)}</b>`);
  bounds.push([TRANSPORT_VENUE.lat, TRANSPORT_VENUE.lng]);
  if (bounds.length)
    schoolLeafletMap.fitBounds(bounds, { padding: [20, 20], animate: false });
  if (status)
    status.textContent = `${shown} of ${raw.length} institution nodes plotted. Unmatched campus locations remain in the directory pending confirmation.`;
  setTimeout(() => schoolLeafletMap && schoolLeafletMap.invalidateSize(), 80);
}

function stakeholderCandidates(item, groupName) {
  const t = (item + " " + groupName).toLowerCase(),
    P = buildPeople();
  let out = [];
  const add = (arr) =>
    arr.forEach((p) => {
      if (p && !out.some((x) => x.name === p.name)) out.push(p);
    });
  if (/speaker|keynote|panel|host|mc|performer/.test(t))
    add(P.filter((p) => p.roles.includes("Speaker")));
  if (
    /judge|adjudicator|witness|competition official|results verification/.test(
      t,
    )
  )
    add(
      P.filter((p) =>
        p.roles.some((r) =>
          /Judge|Evaluator|Senior Technical Reviewer/.test(r),
        ),
      ),
    );
  if (/coach|mentor/.test(t)) add(P.filter((p) => p.roles.includes("Coach")));
  if (
    /government|minister|public official|dignitar|regulator|authority|police|fire|customs|immigration|municipal|tourism authorit/.test(
      t,
    )
  )
    add(
      P.filter(
        (p) =>
          /Government|Policy/i.test(p.category) ||
          /Ministry|Office of the Prime Minister|Authority|Commissioner/i.test(
            p.organization,
          ),
      ),
    );
  if (
    /sponsor|corporate|business leader|enterprise|donor|contributor|bank|finance|investor/.test(
      t,
    )
  )
    add(
      P.filter((p) =>
        /Business|Enterprise|Ecosystem|Investment/i.test(p.category),
      ),
    );
  if (
    /technology|telecom|internet|mobile|ai |digital|wi-fi|network provider/.test(
      t,
    )
  )
    add(P.filter((p) => /Technology|AI|Business/i.test(p.category)));
  if (
    /university|school|education|student|talent|participant ecosystem/.test(t)
  )
    add(P.filter((p) => /Education|Talent/i.test(p.category)));
  if (
    /merchant|small business|retailer|entrepreneur|chamber|manufacturer|exporter|vendor/.test(
      t,
    )
  )
    add(
      P.filter((p) =>
        /Ecosystem|Investment|Business|Enterprise/i.test(p.category),
      ),
    );
  if (
    /media|press|journalist|radio|television|influencer|creator|podcast|communications/.test(
      t,
    )
  )
    add(
      P.filter(
        (p) =>
          /Media/i.test(
            (p.category || "") +
              " " +
              (p.organization || "") +
              " " +
              (p.notes || ""),
          ) || p.roles.includes("Speaker"),
      ),
    );
  if (
    /vip|special guest|ambassador|diplomatic|community leader|institutional leader/.test(
      t,
    )
  )
    add(
      P.filter(
        (p) =>
          /Government|Policy|Ecosystem|Investment|Education|Talent/i.test(
            p.category,
          ) || p.roles.includes("Speaker"),
      ),
    );
  if (!out.length) add(P.filter((p) => p.roles.includes("Network Contact")));
  return out.slice(0, 8);
}
function stakeholderUniverseView() {
  const total = STAKEHOLDER_GROUPS.reduce((n, g) => n + g.items.length, 0),
    named = NETWORK_CONTACTS.length;
  const contactCard = (p) =>
    `<div class="stake-contact"><b>${esc(p.name)}</b><span>${esc([p.title, p.organization].filter(Boolean).join(" · ") || p.category || "Network contact")}</span>${p.email ? `<span class="contact-line">${esc(p.email)}</span>` : ""}${p.phone ? `<span class="contact-line">${esc(p.phone)}</span>` : ""}</div>`;
  return `<div class="people-hero"><span class="people-kicker">Stakeholder universe</span><h2>Who must move for the event to move.</h2><p>Each engagement group is now a full-width working row. Open any stakeholder type to see the strongest existing contacts already in the network tracker; these are recommendations/prospects, not confirmations.</p><div class="people-metrics"><div class="people-metric"><b>${STAKEHOLDER_GROUPS.length}</b><span>engagement groups</span></div><div class="people-metric"><b>${total}</b><span>stakeholder types across the universe</span></div><div class="people-metric"><b>${named}</b><span>named network contacts loaded</span></div><div class="people-metric"><b>10</b><span>standard communication touchpoints</span></div><div class="people-metric"><b>${WS.filter((w) => w.gap).length}</b><span>workstreams still carrying an owner gap</span></div></div></div>
  <div class="engage-steps">${ENGAGEMENT_STEPS.map((x) => `<div class="engage-step"><b>${esc(x[0])}</b><strong>${esc(x[1])}</strong><span>${esc(x[2])}</span></div>`).join("")}</div>
  <h3 style="margin:24px 0 10px">Engagement groups</h3><div class="stake-grid">${STAKEHOLDER_GROUPS.map(
    (g) => {
      const ownerNames = String(g.owners || "")
        .split("/")
        .map((x) => x.trim())
        .filter(Boolean);
      return `<article class="stake-card"><div class="stake-head"><div><h3>${esc(g.name)}</h3><div class="stake-count">${g.items.length} stakeholder types</div><div class="stake-work">${g.workstreams.map((w) => `<span>${esc(w)}</span>`).join("")}</div></div><div><p><b>Next communication move:</b> ${esc(g.next)}</p></div><div><p class="stake-owner"><b>Internal owner path:</b> ${ownerNames.map(esc).join(" · ")}</p></div></div><div class="stake-items">${g.items
        .map((item) => {
          const ps = stakeholderCandidates(item, g.name);
          return `<details class="stake-item"><summary><span>${esc(item)}</span><span>${ps.length ? ps.length + " recommended contacts" : "TBC"}</span></summary><div class="stake-item-body"><p class="stake-rec-note">Recommended / existing network contacts for review. Opening this row does not mark anyone confirmed.</p>${ps.length ? `<div class="stake-contact-list">${ps.map(contactCard).join("")}</div>` : `<span class="school-gap">TBC</span>`}</div></details>`;
        })
        .join("")}</div></article>`;
    },
  ).join("")}</div>`;
}

function transportWorkingDraft() {
  if (!TEAM_TRANSPORT_DRAFT.length) return "";
  return `<section class="transport-draft"><h3 style="margin:0 0 7px">School &amp; university bus schedule · team working draft</h3><p class="warn"><b>Needs reconciliation before approval.</b> This team-entered schedule assumes an 8:00 a.m.–3:00 p.m. event and a 3:15 p.m. return departure. That timing does not by itself reconcile to the current 24-hour Hackathon / Sunday judging-and-awards operating model, so the rows are preserved here as route and travel-time inputs—not as the approved event transport baseline.</p><div class="table-scroll"><table class="stake-table"><thead><tr><th>Type</th><th>Parish</th><th>Pickup / return location</th><th>Travel estimate</th><th>Meet</th><th>Depart</th><th>Venue arrival</th><th>Return departure</th><th>Back at location</th></tr></thead><tbody>${TEAM_TRANSPORT_DRAFT.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="hint" style="margin:10px 0 0">Team draft note retained: estimates include traffic and the Rose Hall approach; meet 15 minutes before departure; operator validation is still required.</p></section>`;
}

function dashboardOverdueTasks(id) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (planOf(id).tasks || []).filter((t) => {
    if (t.done || !t.due) return false;
    const d = new Date(t.due + (/T/.test(t.due) ? "" : "T00:00:00"));
    return !Number.isNaN(d.getTime()) && d < today;
  });
}
function dashboardNext(id) {
  const p = planOf(id),
    open = (p.tasks || []).filter((t) => !t.done);
  const dated = open
    .filter(
      (t) =>
        t.due &&
        !Number.isNaN(
          new Date(t.due + (/T/.test(t.due) ? "" : "T00:00:00")).getTime(),
        ),
    )
    .sort((a, b) => new Date(a.due) - new Date(b.due));
  const t = dated[0] || open[0];
  if (t)
    return { text: t.title || "Untitled task", due: t.due || "No date set" };
  const w = WS.find((x) => x.id === id);
  return {
    text: (w && w.decision) || "No next action recorded",
    due: "No date set",
  };
}
function dashboardHealth(w) {
  const p = planOf(w.id),
    ps = score(p),
    ms = mobScore(w.id),
    overdue = dashboardOverdueTasks(w.id).length;
  if (w.gap || overdue > 0)
    return {
      key: "critical",
      label: "Critical",
      rank: 0,
      reason: w.gap
        ? "Owner required"
        : `${overdue} overdue action${overdue === 1 ? "" : "s"}`,
    };
  if (ps === 0 && ms === 0)
    return {
      key: "notstarted",
      label: "Not started",
      rank: 3,
      reason: "No planning or mobilization progress",
    };
  if (ms < 2 || ps < 2)
    return {
      key: "attention",
      label: "Attention",
      rank: 1,
      reason: "Early setup incomplete",
    };
  if (ps === MOVES && ms === 6)
    return {
      key: "ready",
      label: "Ready",
      rank: 4,
      reason: "Planning and mobilization gates complete",
    };
  return {
    key: "active",
    label: "Active",
    rank: 2,
    reason: "Work progressing",
  };
}
function dashboardUpdated(id) {
  const u = planOf(id).updatedAt;
  if (!u) return "No update recorded";
  const d = new Date(u);
  if (Number.isNaN(d.getTime())) return "No update recorded";
  return `Updated ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function dashboardPopulationCards() {
  const ambTracked = Object.values(ambassadorState || {}).some(
    (v) => String(v ?? "").trim() !== "",
  );
  const ambActivated = ambTracked
    ? Number((ambassadorState || {}).activated || 0)
    : 0;
  const judgeConfirmed =
    typeof confirmedJudges === "function" ? confirmedJudges().length : 0;
  const speakerConfirmed = Array.isArray(SPEAKER_PROFILES)
    ? SPEAKER_PROFILES.filter((p) => p.status === "Confirmed").length
    : 0;
  const rows = [
    {
      label: "Participants",
      target: 2200,
      scope: "Physical hackers",
      current: 0,
    },
    { label: "Volunteers", target: 180, scope: "Unique roster", current: 0 },
    {
      label: "Ambassadors",
      target: 60,
      scope: "Activated",
      current: ambActivated,
    },
    {
      label: "Coaches",
      target: 100,
      scope: "Confirmed against coach target",
      current: 0,
    },
    {
      label: "Official Judges",
      target: 30,
      scope: "Confirmed",
      current: judgeConfirmed,
    },
    {
      label: "Senior Technical Reviewers",
      target: 30,
      scope: "Confirmed",
      current: 0,
    },
    {
      label: "Speakers",
      target: 12,
      scope: "Confirmed · planning baseline 12–15",
      current: speakerConfirmed,
    },
    { label: "Merchants", target: 100, scope: "Confirmed", current: 0 },
    {
      label: "Corporate partners",
      target: null,
      scope: "Target pending",
      current: 0,
    },
    {
      label: "Special guests / VIPs",
      target: null,
      scope: "Target pending",
      current: 0,
    },
  ];
  return `<div class="population-table-wrap"><table class="population-table"><thead><tr><th>Population</th><th>Target</th><th>Recorded</th><th>Gap</th></tr></thead><tbody>${rows
    .map((r) => {
      const hasTarget = Number.isFinite(r.target),
        cur = Number.isFinite(r.current) ? r.current : 0,
        gap = hasTarget ? Math.max(0, r.target - cur) : null;
      return `<tr>
    <td><span class="pop-name">${esc(r.label)}</span><span class="pop-sub">${esc(r.scope)}</span></td>
    <td>${hasTarget ? `<span class="num">${r.target.toLocaleString()}</span>` : `<span class="pending">TBD</span>`}</td>
    <td><span class="num">${cur.toLocaleString()}</span></td>
    <td>${hasTarget ? `<span class="gap-num">${gap.toLocaleString()}</span>` : `<span class="pending">—</span>`}</td>
  </tr>`;
    })
    .join("")}</tbody></table></div>
  <p class="population-note"><b>Control rule:</b> Recorded = confirmed / activated count currently captured in this site. Gap = Target − Recorded. Update the recorded number here as commitments close.</p>`;
}
let directionScrollY = 0;
function renderDirection() {
  const dl = days(LOCK),
    de = days(EVENT),
    total = WS.length;
  const openDecisions = QBANK.filter((q) => !(qState[q.id] || {}).done).length;
  const ownerGaps = WS.filter((w) => w.gap).length;
  const blockedReviews = Object.values(reviewState || {}).filter(
    (x) => x && x.status === "Blocked",
  ).length;
  const overdue = WS.reduce(
    (n, w) => n + dashboardOverdueTasks(w.id).length,
    0,
  );
  const readiness = Math.round(
    (WS.reduce(
      (n, w) => n + (score(planOf(w.id)) / MOVES + mobScore(w.id) / 6) / 2,
      0,
    ) /
      Math.max(1, total)) *
      100,
  );
  const cards = WS.map((w) => ({
    w,
    h: dashboardHealth(w),
    p: planOf(w.id),
    next: dashboardNext(w.id),
  })).sort((a, b) => a.h.rank - b.h.rank || a.w.n - b.w.n);
  const critical = cards.filter((x) => x.h.key === "critical").length;
  const attention = cards.filter((x) => x.h.key === "attention").length;
  const topAttention = cards
    .filter((x) => x.h.key === "critical" || x.h.key === "attention")
    .slice(0, 6);
  const card = (x) => {
    const ps = score(x.p),
      ms = mobScore(x.w.id),
      ot = dashboardOverdueTasks(x.w.id).length;
    return `<button class="ws-health-card ${x.h.key}" data-dash-ws="${x.w.id}" type="button">
    <div class="wh-top"><div><h4>${esc(x.w.name)}</h4><div class="wh-owner">${esc(x.w.leads)}</div></div><span class="wh-state">${esc(x.h.label)}</span></div>
    <div class="wh-bars"><div class="wh-bar"><small><span>Plan</span><span>${ps}/${MOVES}</span></small><div class="wh-meter"><i style="width:${(ps / MOVES) * 100}%"></i></div></div><div class="wh-bar mob"><small><span>Mobilize</span><span>${ms}/6</span></small><div class="wh-meter"><i style="width:${(ms / 6) * 100}%"></i></div></div></div>
    <div class="wh-next"><b>Next</b><span>${esc(x.next.text)}</span></div>
    <div class="wh-foot"><span>${x.next.due && x.next.due !== "No date set" ? `Due ${esc(x.next.due)}` : esc(x.h.reason)}</span><span>${ot ? `${ot} overdue · ` : ""}${esc(dashboardUpdated(x.w.id))}</span></div>
  </button>`;
  };
  el("directionView").innerHTML =
    `<div class="dash-head"><div><p class="st-date">Operating dashboard · Intellibus Atlas Agentic AI Hackathon 2027</p><h2>Operations overview</h2><p>Readiness, ownership and the next actions—all in one view.</p></div><div class="dash-utils"><button type="button" data-dash-util="baseline">Planning baseline</button><button type="button" data-dash-util="refs">Source files</button></div></div>
  <div class="dash-metrics">
    <div class="dash-metric"><b>${de > 0 ? de : "—"}</b><span>days to event</span></div>
    <div class="dash-metric ${readiness >= 75 ? "good" : readiness < 40 ? "alert" : "warn"}"><b>${readiness}%</b><span>planning + mobilization readiness</span></div>
    <div class="dash-metric ${critical ? "alert" : "good"}"><b>${critical}</b><span>critical workstreams</span></div>
    <div class="dash-metric ${openDecisions ? "warn" : "good"}"><b>${openDecisions}</b><span>open decisions</span></div>
    <div class="dash-metric ${ownerGaps ? "alert" : "good"}"><b>${ownerGaps}</b><span>owner gaps</span></div>
    <div class="dash-metric ${overdue || blockedReviews ? "alert" : "good"}"><b>${overdue + blockedReviews}</b><span>overdue or explicitly blocked items</span></div>
  </div>
  <p class="dash-rule"><b>Readiness index:</b> average of the five planning gates and six mobilization gates already tracked in the workbook. <b>Critical:</b> missing owner or overdue action. <b>Attention:</b> early setup incomplete. No subjective health score is being invented.</p>
  <section class="dash-section"><div class="dash-section-head"><div><h3>People &amp; ecosystem readiness</h3><p>Target · recorded · gap.</p></div></div>
    ${dashboardPopulationCards()}
  </section>
  <section class="dash-section"><div class="dash-section-head"><div><h3>Attention now</h3><p>${critical} critical · ${attention} attention required</p></div></div>
    <div class="attention-list">${topAttention.length ? topAttention.map((x) => `<div class="attention-row"><strong>${esc(x.w.name)}</strong><span>${esc(x.h.reason)} · ${esc(x.next.text)}</span><button type="button" data-dash-ws="${x.w.id}">Open workstream →</button></div>`).join("") : `<div class="source-note"><b>No critical or attention workstreams based on the current recorded data.</b></div>`}</div>
  </section>
  <section class="dash-section"><div class="dash-section-head"><div><h3>Workstream health</h3><p>One full-width row per workstream, ordered by attention required, then workstream number.</p></div><div class="dash-legend"><span><i style="background:var(--plum)"></i>Critical</span><span><i style="background:var(--amber)"></i>Attention</span><span><i style="background:var(--sea)"></i>Active</span><span><i style="background:var(--go)"></i>Ready</span><span><i style="background:var(--rule)"></i>Not started</span></div></div>
    <div class="ws-health-grid">${cards.map(card).join("")}</div>
  </section>`;
  el("directionView")
    .querySelectorAll("[data-dash-ws]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          directionScrollY = window.scrollY;
          current = b.dataset.dashWs;
          showView("notebook");
          renderAll();
        }),
    );
  el("directionView")
    .querySelectorAll("[data-pop-ws]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          if (!b.dataset.popWs) return;
          directionScrollY = window.scrollY;
          current = b.dataset.popWs;
          showView("notebook");
          renderAll();
        }),
    );
  el("directionView")
    .querySelectorAll("[data-dash-util]")
    .forEach((b) => (b.onclick = () => showView(b.dataset.dashUtil)));
}

let transportRouteRequest = 0;
let transportLeafletMap = null,
  transportMarkerLayer = null,
  transportPointMarkers = new Map(),
  transportRouteLayer = null,
  transportVenueMarker = null,
  transportActiveCategory = "town",
  transportLoadSeq = 0;

function parsePlanningHours(s) {
  const h = (String(s).match(/(\d+)h/) || [])[1],
    m = (String(s).match(/(\d+)m/) || [])[1];
  return (h ? Number(h) : 0) + (m ? Number(m) / 60 : 0);
}
function transportNetworkPoints() {
  const towns = PUBLIC_TRANSPORT_HUBS.map((h) => ({
    ...h,
    key: `town:${h.id}`,
    label: h.town,
    category: "town",
    kind: "Town centre",
    sourceType: "General public",
    query: `${h.town}, ${h.parish}, Jamaica`,
  }));
  const institutions = TEAM_TRANSPORT_DRAFT.map((r, i) => {
    const institution = r[2],
      sourceType = r[0];
    const category =
      sourceType === "University"
        ? "university"
        : /\bCollege\b/i.test(institution)
          ? "college"
          : "highschool";
    return {
      key: `school:${i}`,
      sourceIndex: i,
      label: institution,
      town: institution,
      parish: r[1],
      planning: r[3],
      max: parsePlanningHours(r[3]),
      category,
      kind: TRANSPORT_CATEGORY_META[category].short,
      sourceType,
      query: `${institution}, ${r[1]}, Jamaica`,
      meet: r[4],
      depart: r[5],
      arrival: r[6],
      returnDepart: r[7],
      back: r[8],
    };
  });
  return [...towns, ...institutions];
}
function transportRowsForCategory(cat = transportActiveCategory) {
  // Closest → furthest using the upper end of the supplied rough planning duration.
  return transportNetworkPoints()
    .filter((x) => x.category === cat)
    .sort((a, b) => a.max - b.max || a.label.localeCompare(b.label));
}
function publicPickupRows() {
  return transportRowsForCategory("town");
}
function transportDepartForEight(h) {
  const total = Math.max(0, Math.round(8 * 60 - Number(h.max || 0) * 60));
  const hh = Math.floor(total / 60) % 24,
    mm = total % 60,
    ampm = hh >= 12 ? "PM" : "AM",
    h12 = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}
function transportPublicTable(rows, cls = "public-pickup-table") {
  return `<table class="${cls}"><thead><tr><th>Parish</th><th>Pickup ${rows.some((h) => h.category !== "town") ? "location" : "town"}</th><th>One-way bus time</th><th>Competition wave</th></tr></thead><tbody>${rows.map((h) => `<tr><td>${esc(h.parish)}</td><td>${esc(h.label)}${h.category !== "town" ? `<small class="kind">${esc(TRANSPORT_CATEGORY_META[h.category].short)}</small>` : ""}</td><td>${esc(h.planning)}</td><td><b>TBC — Guinness ruling</b></td></tr>`).join("")}</tbody></table>`;
}
function transportSchoolScheduleTable() {
  const rows = transportNetworkPoints()
    .filter((x) => x.category !== "town")
    .sort((a, b) => a.max - b.max || a.label.localeCompare(b.label));
  return `<div class="transport-ref-wrap"><table class="transport-ref-table"><thead><tr><th>Type</th><th>Parish</th><th>Pickup / return location</th><th>Planning travel time</th><th>Legacy team draft meet</th><th>Legacy team draft depart</th><th>Legacy team draft venue arrival</th><th>Legacy return departure</th><th>Legacy back at location</th></tr></thead><tbody>${rows.map((h) => `<tr><td>${esc(h.sourceType)}</td><td>${esc(h.parish)}</td><td>${esc(h.label)}</td><td>${esc(h.planning)}</td><td>${esc(h.meet || "")}</td><td>${esc(h.depart || "")}</td><td>${esc(h.arrival || "")}</td><td>${esc(h.returnDepart || "")}</td><td>${esc(h.back || "")}</td></tr>`).join("")}</tbody></table></div>`;
}
function categoryCounts() {
  const pts = transportNetworkPoints();
  return Object.fromEntries(
    Object.keys(TRANSPORT_CATEGORY_META).map((k) => [
      k,
      pts.filter((x) => x.category === k).length,
    ]),
  );
}
function renderTransportCategoryButtons() {
  const c = categoryCounts();
  return `<div class="transport-category-bar" aria-label="Pickup network filters">${Object.entries(
    TRANSPORT_CATEGORY_META,
  )
    .map(
      ([k, m]) =>
        `<button type="button" class="transport-category-btn ${transportActiveCategory === k ? "on" : ""}" data-tcat="${k}">${esc(m.label)} <span>${c[k]}</span></button>`,
    )
    .join("")}</div>`;
}
function renderTransportMapLayout() {
  if (window.AtlasMap) return window.AtlasMap.layout();
  const rows = transportRowsForCategory();
  const opts = rows
    .map(
      (h, i) =>
        `<option value="${esc(h.key)}">${i + 1}. ${esc(h.label)} · ${esc(h.parish)}</option>`,
    )
    .join("");
  const meta = TRANSPORT_CATEGORY_META[transportActiveCategory];
  return `<div class="transport-map-page">
  <header class="transport-map-head">
   <span class="eyebrow">Transport planning · Montego Bay</span>
   <h2>Bus Schedule Pickups</h2>
   <p>To Montego Bay Convention Centre, Rose Hall. Closest to furthest by the upper end of the rough planning-time estimate.</p>
   <div class="transport-planning-note"><b>Preliminary planning only.</b> Pickup locations and bus-time ranges below are rough planning estimates from the supplied planner. They are not confirmed operator schedules or live-traffic predictions. Competition start waves remain a pending decision until Guinness confirms whether staggered 24-hour windows are permitted.</div>
  </header>
  ${renderTransportCategoryButtons()}
  <div class="transport-category-legend" aria-label="Map pin legend"><span class="town"><i></i>Town centres</span><span class="highschool"><i></i>High schools</span><span class="college"><i></i>Colleges</span><span class="university"><i></i>Universities</span><span class="venue"><i></i>Venue</span></div>
  <div class="transport-toolbar">
   <label for="transportPickupSelect">Pickup</label>
   <select id="transportPickupSelect"><option value="">Choose a pickup…</option>${opts}</select>
   <button type="button" id="transportShowAll">Show all hubs</button>
   <button type="button" id="transportShowVenue">Venue</button>
  </div>
  <div class="transport-map-grid">
   <section class="transport-pickup-pane">
    <p class="transport-map-copy">${esc(meta.note)}. Sorted closest to furthest using the upper end of the rough planning duration. Departure times are not locked while the competition-wave model is under Guinness review. The table remains the route source of truth and will be recalculated once the official start architecture is approved.</p>
    <p class="transport-pickup-label">${esc(meta.label)} | ${rows.length} pickup ${rows.length === 1 ? "location" : "locations"}</p>
    <div id="transportActiveTable">${transportPublicTable(rows)}</div>
    <div id="transportMapStatus" class="transport-map-status"></div>
   </section>
   <section class="transport-map-pane">
    <div class="transport-map-shell"><div id="transportLeafletMap" aria-label="Jamaica pickup map"></div><div id="transportMapFallback" class="transport-map-fallback" hidden>Interactive map unavailable. The pickup table remains available at left / above.</div></div>
    <div id="transportRoutePanel" class="transport-route-panel" hidden></div>
   </section>
  </div>
  <details class="transport-below"><summary>General-public travel-time planning table</summary>
   <p class="lede">Rough one-way planning ranges retained from the supplied planner. Sorted closest to furthest by the upper end of the range. “Depart by” is derived as 8:00 AM minus that upper-end duration; no extra loading/check-in buffer is included. Not a confirmed operator schedule.</p>
   <div class="transport-ref-wrap">${transportPublicTable(publicPickupRows(), "transport-ref-table")}</div>
  </details>
  <details class="transport-below"><summary>School &amp; university network travel-time table</summary>
   <p class="lede">Kept separate from the general-public network. Rows are sorted closest to furthest by the supplied planning duration. The original team-draft meet/depart/arrival fields are preserved only as legacy source inputs. They are not current operating times. Final departures and competition waves will be recalculated after the Guinness timing ruling.</p>
   ${transportSchoolScheduleTable()}
  </details>
  <details class="transport-command-after"><summary>Transport and school planning details</summary>
   ${transportView()}
   ${schoolNetworkView()}
  </details>
 </div>`;
}
function transportPointPopupHtml(h) {
  const gm =
    h.lat != null && h.lng != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(h.lat + "," + h.lng)}&destination=${encodeURIComponent(TRANSPORT_VENUE.lat + "," + TRANSPORT_VENUE.lng)}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.label + ", " + h.parish + ", Jamaica")}`;
  const pinNote =
    h.category === "town"
      ? "Pin represents the pickup town because the source does not yet specify a street-level public hub."
      : "Map position is matched to OpenStreetMap institution data; the source schedule remains authoritative for the planning time.";
  return `<div class="tp-pop-title">${esc(h.label)}</div><div class="tp-pop-meta">${esc(h.parish)} · ${esc(TRANSPORT_CATEGORY_META[h.category].short)} → ${esc(TRANSPORT_VENUE.name)}</div><div class="tp-pop-time"><b>Planning estimate:</b> ${esc(h.planning)}<br><b>Depart by for 8:00 AM:</b> ${esc(transportDepartForEight(h))}</div><div class="tp-pop-actions"><button type="button" data-route-point="${esc(h.key)}" ${h.lat == null ? "disabled" : ""}>View route here</button><a href="${gm}" target="_blank" rel="noopener">Open Google Maps</a></div><div class="tp-pop-note">${esc(pinNote)}</div>`;
}
function transportGeoCacheRead() {
  try {
    return JSON.parse(
      localStorage.getItem("atlas-transport-geocode-v1") || "{}",
    );
  } catch (e) {
    return {};
  }
}
function transportGeoCacheWrite(c) {
  try {
    window.AtlasSave.write("atlas-transport-geocode-v1", JSON.stringify(c));
  } catch (e) {}
}

async function geocodeTransportPoint(p) {
  if (p.lat != null && p.lng != null) return p;
  const pos = INSTITUTION_COORDINATES[p.label];
  return pos ? { ...p, ...pos } : p;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function markerIconForPoint(p, idx) {
  const label = p.category === "town" ? String(p.id) : String(idx + 1);
  const color =
    TRANSPORT_CATEGORY_COLORS[p.category] || TRANSPORT_CATEGORY_COLORS.town;
  return L.divIcon({
    className: "tp-pin-wrap",
    html: `<div class="tp-pin" style="background:${color}">${esc(label)}</div>`,
    iconSize: [31, 31],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  });
}
function bindTransportPopupActions() {
  document
    .querySelectorAll("[data-route-point]")
    .forEach(
      (b) => (b.onclick = () => showTransportRoadRoute(b.dataset.routePoint)),
    );
}
async function loadTransportCategoryMarkers(
  cat,
  { fit = true, requestId = transportLoadSeq } = {},
) {
  if (!transportLeafletMap || requestId !== transportLoadSeq) return;
  clearTransportRoadRoute();
  if (transportMarkerLayer) transportMarkerLayer.clearLayers();
  transportPointMarkers.clear();
  const raw = transportRowsForCategory(cat),
    resolved = [];
  const status = document.getElementById("transportMapStatus");
  if (status)
    status.textContent =
      cat === "town"
        ? "All town-centre locations are plotted from the supplied planner."
        : `Loading ${raw.length} named ${TRANSPORT_CATEGORY_META[cat].label.toLowerCase()} onto the map…`;
  for (let i = 0; i < raw.length; i++) {
    if (requestId !== transportLoadSeq) return;
    let p = raw[i];
    if (p.lat == null) {
      p = await geocodeTransportPoint(p);
      if (requestId !== transportLoadSeq) return;
    }
    if (requestId !== transportLoadSeq) return;
    if (p.lat != null && p.lng != null) {
      const m = L.marker([p.lat, p.lng], {
        icon: markerIconForPoint(p, i),
        title: `${p.label}, ${p.parish}`,
      })
        .addTo(transportMarkerLayer)
        .bindPopup(transportPointPopupHtml(p), {
          className: "tp-popup",
          maxWidth: 285,
        });
      transportPointMarkers.set(p.key, { marker: m, point: p });
      resolved.push(p);
    }
  }
  if (requestId !== transportLoadSeq) return;
  if (status)
    status.textContent =
      cat === "town"
        ? `${resolved.length} town-centre pickup pins shown — no school/college/university pins are active.`
        : `${resolved.length} of ${raw.length} ${TRANSPORT_CATEGORY_META[cat].label.toLowerCase()} shown — other pickup categories are hidden. The full source table remains visible regardless.`;
  if (fit && resolved.length) {
    const pts = resolved.map((p) => [p.lat, p.lng]);
    pts.push([TRANSPORT_VENUE.lat, TRANSPORT_VENUE.lng]);
    transportLeafletMap.fitBounds(pts, { padding: [28, 28], animate: false });
  }
  transportLeafletMap.off("popupopen", bindTransportPopupActions);
  transportLeafletMap.on("popupopen", bindTransportPopupActions);
}
async function setTransportCategory(cat) {
  if (!TRANSPORT_CATEGORY_META[cat]) return;
  const requestId = ++transportLoadSeq;
  transportActiveCategory = cat;
  if (transportMarkerLayer) transportMarkerLayer.clearLayers();
  transportPointMarkers.clear();
  clearTransportRoadRoute();
  document.querySelectorAll("[data-tcat]").forEach((b) => {
    b.classList.toggle("on", b.dataset.tcat === cat);
    b.setAttribute("aria-pressed", String(b.dataset.tcat === cat));
  });
  const rows = transportRowsForCategory(cat),
    meta = TRANSPORT_CATEGORY_META[cat];
  const pane = document.querySelector(".transport-pickup-pane");
  if (pane) {
    const copy = pane.querySelector(".transport-map-copy"),
      lab = pane.querySelector(".transport-pickup-label"),
      tbl = document.getElementById("transportActiveTable");
    if (copy)
      copy.textContent = `${meta.note}. Sorted closest to furthest using the upper end of the rough planning duration. Departure times are not locked while the competition-wave model is under Guinness review. The table remains the route source of truth and will be recalculated once the official start architecture is approved.`;
    if (lab)
      lab.textContent = `${meta.label} | ${rows.length} pickup ${rows.length === 1 ? "location" : "locations"}`;
    if (tbl) tbl.innerHTML = transportPublicTable(rows);
  }
  const sel = document.getElementById("transportPickupSelect");
  if (sel) {
    sel.innerHTML =
      '<option value="">Choose a pickup…</option>' +
      rows
        .map(
          (h, i) =>
            `<option value="${esc(h.key)}">${i + 1}. ${esc(h.label)} · ${esc(h.parish)}</option>`,
        )
        .join("");
    sel.value = "";
  }
  const status = document.getElementById("transportMapStatus");
  if (status)
    status.textContent =
      cat === "town"
        ? "Loading town-centre pickup pins…"
        : `Loading ${meta.label.toLowerCase()} pickup pins…`;
  await loadTransportCategoryMarkers(cat, { requestId });
}
function bindTransportControls() {
  document.querySelectorAll("[data-tcat]").forEach((b) => {
    b.setAttribute(
      "aria-pressed",
      String(b.dataset.tcat === transportActiveCategory),
    );
    b.onclick = () => setTransportCategory(b.dataset.tcat);
  });
  const select = document.getElementById("transportPickupSelect");
  if (select)
    select.onchange = () => {
      const key = select.value;
      if (!key) return;
      const entry = transportPointMarkers.get(key);
      if (entry && transportLeafletMap) {
        transportLeafletMap.setView([entry.point.lat, entry.point.lng], 11, {
          animate: false,
        });
        entry.marker.openPopup();
      } else {
        const status = document.getElementById("transportMapStatus");
        if (status)
          status.textContent =
            "This campus location is awaiting confirmation. Its schedule remains in the table.";
      }
    };
  const allBtn = document.getElementById("transportShowAll");
  if (allBtn)
    allBtn.onclick = () => {
      clearTransportRoadRoute();
      if (!transportLeafletMap) return;
      const pts = [...transportPointMarkers.values()].map((x) => [
        x.point.lat,
        x.point.lng,
      ]);
      if (pts.length) {
        pts.push([TRANSPORT_VENUE.lat, TRANSPORT_VENUE.lng]);
        transportLeafletMap.fitBounds(pts, {
          padding: [28, 28],
          animate: false,
        });
      }
    };
  const venueBtn = document.getElementById("transportShowVenue");
  if (venueBtn)
    venueBtn.onclick = () => {
      clearTransportRoadRoute();
      if (!transportLeafletMap || !transportVenueMarker) return;
      transportLeafletMap.setView(
        [TRANSPORT_VENUE.lat, TRANSPORT_VENUE.lng],
        12,
        { animate: false },
      );
      transportVenueMarker.openPopup();
    };
}
function initTransportMap() {
  if (window.AtlasMap) {
    window.AtlasMap.mount(transportNetworkPoints().map(p => p.lat != null ? p : {...p,...(INSTITUTION_COORDINATES[p.label] || {})}), TRANSPORT_VENUE, `<details><summary>General public travel estimates</summary>${transportPublicTable(publicPickupRows())}</details><details><summary>School & university schedule</summary>${transportSchoolScheduleTable()}</details>${transportView()}`);
    return;
  }
  const mapEl = document.getElementById("transportLeafletMap");
  if (!mapEl) return;
  const fallback = document.getElementById("transportMapFallback");
  bindTransportControls();
  if (transportLeafletMap) {
    try {
      transportLeafletMap.remove();
    } catch (e) {}
    transportLeafletMap = null;
    transportMarkerLayer = null;
    transportPointMarkers = new Map();
    transportRouteLayer = null;
    transportVenueMarker = null;
  }
  if (!window.L) {
    if (fallback) {
      fallback.hidden = false;
      fallback.textContent =
        "Interactive map unavailable. The pickup table and network filters remain available.";
    }
    setTransportCategory(transportActiveCategory);
    return;
  }
  try {
    transportLeafletMap = L.map(mapEl, {
      scrollWheelZoom: !continuousOperations,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomControl: true,
      preferCanvas: true,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView([18.15, -77.3], 8);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    }).addTo(transportLeafletMap);
    transportMarkerLayer = L.layerGroup().addTo(transportLeafletMap);
    const vicon = L.divIcon({
      className: "tp-venue-wrap",
      html: '<div class="tp-venue">V</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -14],
    });
    transportVenueMarker = L.marker(
      [TRANSPORT_VENUE.lat, TRANSPORT_VENUE.lng],
      { icon: vicon, title: TRANSPORT_VENUE.name },
    )
      .addTo(transportLeafletMap)
      .bindPopup(
        `<div class="tp-pop-title">${esc(TRANSPORT_VENUE.name)}</div><div class="tp-pop-meta">${esc(TRANSPORT_VENUE.detail)}</div>`,
        { className: "tp-popup" },
      );
    if (fallback) fallback.hidden = true;
    setTransportCategory(transportActiveCategory);
    setTimeout(
      () => transportLeafletMap && transportLeafletMap.invalidateSize(),
      80,
    );
  } catch (err) {
    transportLeafletMap = null;
    if (fallback) {
      fallback.hidden = false;
      fallback.textContent =
        "Interactive map unavailable. The pickup table and network filters remain available.";
    }
    setTransportCategory(transportActiveCategory);
  }
}
function clearTransportRoadRoute() {
  transportRouteRequest++;
  if (transportRouteLayer && transportLeafletMap) {
    transportLeafletMap.removeLayer(transportRouteLayer);
    transportRouteLayer = null;
  }
  const p = document.getElementById("transportRoutePanel");
  if (p) {
    p.hidden = true;
    p.innerHTML = "";
  }
}
function formatRouteDuration(sec) {
  const min = Math.round(sec / 60),
    h = Math.floor(min / 60),
    m = min % 60;
  return h ? `${h} hr${h === 1 ? "" : "s"} ${m ? m + " min" : ""}` : `${m} min`;
}
function formatRouteDistance(m) {
  return `${(m / 1000).toFixed(m >= 100000 ? 0 : 1)} km`;
}
function stepInstruction(step) {
  const man = step.maneuver || {},
    type = man.type || "continue",
    mod = (man.modifier || "").replace(/_/g, " "),
    road = step.name ? ` on ${step.name}` : "";
  if (type === "depart") return `Depart${road}`;
  if (type === "arrive") return `Arrive at ${TRANSPORT_VENUE.name}`;
  if (type === "roundabout" || type === "rotary")
    return `Enter the roundabout${road}${man.exit ? `, take exit ${man.exit}` : ""}`;
  if (type === "merge")
    return `Merge ${mod}${road}`.replace(/\s+/g, " ").trim();
  if (type === "fork") return `Keep ${mod}${road}`.replace(/\s+/g, " ").trim();
  if (type === "turn") return `Turn ${mod}${road}`.replace(/\s+/g, " ").trim();
  if (type === "continue")
    return `Continue ${mod}${road}`.replace(/\s+/g, " ").trim();
  return `${type.charAt(0).toUpperCase() + type.slice(1)} ${mod}${road}`
    .replace(/\s+/g, " ")
    .trim();
}
async function showTransportRoadRoute(key) {
  const entry = transportPointMarkers.get(key),
    h = entry && entry.point,
    panel = document.getElementById("transportRoutePanel");
  if (!h || !panel || !transportLeafletMap || h.lat == null || h.lng == null)
    return;
  const routeRequest = ++transportRouteRequest;
  const routeMap = transportLeafletMap;
  panel.hidden = false;
  panel.innerHTML = `<div class="route-summary"><strong>Routing ${esc(h.label)} → venue…</strong></div><div class="route-disclaimer">Using a road-routing service. No straight-line fallback will be drawn.</div>`;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${h.lng},${h.lat};${TRANSPORT_VENUE.lng},${TRANSPORT_VENUE.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url, {
      mode: "cors",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error("Routing service unavailable");
    const data = await res.json();
    if (
      routeRequest !== transportRouteRequest ||
      routeMap !== transportLeafletMap
    )
      return;
    if (!data.routes || !data.routes.length)
      throw new Error("No road route returned");
    const route = data.routes[0];
    if (transportRouteLayer)
      transportLeafletMap.removeLayer(transportRouteLayer);
    transportRouteLayer = L.geoJSON(route.geometry, {
      style: { color: "#6fc7df", weight: 5, opacity: 0.92 },
    }).addTo(transportLeafletMap);
    transportLeafletMap.fitBounds(transportRouteLayer.getBounds(), {
      padding: [28, 28],
      animate: false,
    });
    const steps = (route.legs || []).flatMap((l) => l.steps || []);
    panel.innerHTML = `<div class="route-summary"><strong>${esc(h.label)} → ${esc(TRANSPORT_VENUE.name)}</strong><span>${formatRouteDistance(route.distance)} · ${formatRouteDuration(route.duration)}</span></div><div class="route-disclaimer"><b><a href="https://project-osrm.org/" target="_blank" rel="noopener">OSRM</a> routing estimate:</b> follows a road network and is separate from the rough bus-planning range of ${esc(h.planning)}. It is not a live-traffic prediction.</div><ol class="route-directions">${steps.map((st) => `<li>${esc(stepInstruction(st))}<small>${formatRouteDistance(st.distance || 0)} · ${formatRouteDuration(st.duration || 0)}</small></li>`).join("")}</ol>`;
  } catch (err) {
    if (
      routeRequest !== transportRouteRequest ||
      routeMap !== transportLeafletMap
    )
      return;
    if (transportRouteLayer) {
      transportLeafletMap.removeLayer(transportRouteLayer);
      transportRouteLayer = null;
    }
    panel.innerHTML = `<div class="route-summary"><strong>${esc(h.label)} → venue</strong></div><div class="route-disclaimer">Road routing is unavailable right now, so no route line has been substituted. Use “Open Google Maps” from the pickup card or try again when the routing service is reachable.</div>`;
  }
}
function renderTransportPage() {
  el("transportPageView").innerHTML = renderTransportMapLayout();
  initTransportMap();
  // Build the secondary school map only after its collapsed planning panel becomes visible.
  const details = el("transportPageView").querySelector(
    ".transport-command-after",
  );
  if (details)
    details.addEventListener("toggle", () => {
      if (details.open) initSchoolNetworkMap();
    });
}

// Keep the full roster intact; filtering and pagination affect presentation only.
function renderPeople() {
  const P = buildPeople();
  const groups = [
    ["All", "People", P.length],
    [
      "Judges",
      "Judges / reviewers",
      P.filter((p) =>
        p.roles.some((r) =>
          /Judge|Evaluator|Senior Technical Reviewer/.test(r),
        ),
      ).length,
    ],
    [
      "Speakers",
      "Speakers",
      P.filter((p) => p.roles.includes("Speaker")).length,
    ],
    ["Coaches", "Coaches", P.filter((p) => p.roles.includes("Coach")).length],
    [
      "Network Contacts",
      "Network contacts",
      P.filter((p) => p.roles.includes("Network Contact")).length,
    ],
    [
      "Internal Owners",
      "Internal owners",
      P.filter((p) => p.roles.includes("Internal Owner")).length,
    ],
  ];
  const hero = `<div class="directory-heading"><div><p class="people-kicker">THE ATLAS COLLECTIVE</p><h2>People directory</h2></div><p>Names, roles and contact details in one place.</p></div><div class="people-metrics">${groups.map(([role, label, count]) => `<button class="people-metric ${peopleRole === role ? "on" : ""}" data-prole="${role}" aria-pressed="${peopleRole === role}"><b>${count}</b><span>${label}</span></button>`).join("")}</div>`;
  const tabs = `<nav class="people-tabs" aria-label="People views">${[
    ["directory", "Directory"],
    ["stakeholders", "Stakeholders"],
    ["map", "Communication"],
    ["schools", "School network"],
  ]
    .map(
      ([mode, label]) =>
        `<button data-pmode="${mode}" class="${peopleMode === mode ? "on" : ""}" aria-pressed="${peopleMode === mode}">${label}</button>`,
    )
    .join("")}</nav>`;
  if (peopleMode !== "directory") {
    const views = {
      stakeholders: stakeholderUniverseView,
      map: commMap,
      schools: schoolNetworkView,
    };
    el("peopleView").innerHTML = hero + tabs + views[peopleMode]();
    bindPeople();
    if (peopleMode === "schools") initSchoolNetworkMap();
    return;
  }
  el("peopleView").innerHTML =
    hero +
    `<div class="directory-tools">${tabs}<label class="people-search-wrap"><span aria-hidden="true">⌕</span><input id="peopleSearch" type="search" aria-label="Search people" placeholder="Search everyone: name, role, company or contact…" value="${esc(peopleQuery)}"></label></div><div class="directory-caption"><span id="peopleResultCount" role="status"></span><span>Prospects and source records · roster counts are not confirmed attendance</span></div><div class="directory-columns" aria-hidden="true"><span>Name &amp; organization</span><span>Role &amp; status</span><span>Contact details</span><span>Profile</span></div><div class="people-grid" id="peopleGrid"></div><div id="peoplePagination" class="people-pagination"></div><dialog id="personDialog" aria-labelledby="profileTitle"></dialog>`;
  bindPeople();
  applyPeopleFilter();
}

// Search against the original profile fields and show a bounded page to avoid a long scroll.
function applyPeopleFilter() {
  const q = peopleQuery.trim().toLowerCase();
  const filtered = buildPeople().filter((p) => {
    const roles = p.roles.join("|");
    const roleOk =
      peopleRole === "All" ||
      (peopleRole === "Judges" &&
        /Judge|Evaluator|Senior Technical Reviewer/.test(roles)) ||
      (peopleRole === "Speakers" && roles.includes("Speaker")) ||
      (peopleRole === "Coaches" && roles.includes("Coach")) ||
      (peopleRole === "Internal Owners" && roles.includes("Internal Owner")) ||
      (peopleRole === "Network Contacts" && roles.includes("Network Contact"));
    return (
      roleOk &&
      (!q ||
        [
          p.name,
          p.title,
          p.organization,
          p.category,
          roles,
          p.status,
          p.email,
          p.phone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q))
    );
  });
  const size = continuousOperations
      ? Math.max(1, filtered.length)
      : matchMedia("(max-width:600px)").matches
        ? 4
        : 8,
    pages = Math.max(1, Math.ceil(filtered.length / size));
  peoplePage = Math.min(peoplePage, pages - 1);
  el("peopleGrid").innerHTML = filtered.length
    ? filtered
        .slice(peoplePage * size, (peoplePage + 1) * size)
        .map(personCard)
        .join("")
    : '<p class="directory-empty">No matches. Try another name or choose People to search every role.</p>';
  el("peopleResultCount").textContent =
    `${filtered.length} ${peopleRole === "All" ? "people" : peopleRole.toLowerCase()} · ${filtered.length ? peoplePage * size + 1 : 0}–${Math.min((peoplePage + 1) * size, filtered.length)} shown`;
  el("peoplePagination").innerHTML =
    `<button data-people-page="-1" ${peoplePage === 0 ? "disabled" : ""} aria-label="Previous people">← Previous</button><span>Page ${peoplePage + 1} of ${pages}</span><button data-people-page="1" ${peoplePage === pages - 1 ? "disabled" : ""}>Next →</button>`;
}

// Delegate profile and pager clicks so live search does not discard input focus.
function bindPeople() {
  document.querySelectorAll("[data-pmode]").forEach(
    (b) =>
      (b.onclick = () => {
        peopleMode = b.dataset.pmode;
        renderPeople();
      }),
  );
  document.querySelectorAll("[data-prole]").forEach(
    (b) =>
      (b.onclick = () => {
        peopleRole = b.dataset.prole;
        peopleMode = "directory";
        peoplePage = 0;
        renderPeople();
      }),
  );
  const search = el("peopleSearch");
  if (search)
    search.oninput = (e) => {
      peopleQuery = e.target.value;
      // A name search always covers the entire roster, even after choosing a role tab.
      if (peopleQuery.trim()) {
        peopleRole = "All";
        document.querySelectorAll("[data-prole]").forEach((b) => {
          const on = b.dataset.prole === "All";
          b.classList.toggle("on", on);
          b.setAttribute("aria-pressed", String(on));
        });
      }
      peoplePage = 0;
      applyPeopleFilter();
    };
  const grid = el("peopleGrid");
  if (grid)
    grid.onclick = (e) => {
      const button = e.target.closest("[data-profile]");
      if (button) openPersonProfile(button.dataset.profile);
    };
  const pager = el("peoplePagination");
  if (pager)
    pager.onclick = (e) => {
      const b = e.target.closest("[data-people-page]");
      if (b && !b.disabled) {
        peoplePage += Number(b.dataset.peoplePage);
        applyPeopleFilter();
        el("peopleView")
          .querySelector(".directory-tools")
          .scrollIntoView({ block: "start" });
      }
    };
}

function renderOutcomes() {
  const totalTasks = WS.reduce(
    (n, w) => n + (planOf(w.id).tasks || []).length,
    0,
  );
  const sequenced = WS.filter((w) => {
    const t = planOf(w.id).tasks || [];
    return (
      t.length > 0 &&
      t.every((x) => x.dep !== undefined && x.dep !== null && x.dep !== "")
    );
  }).length;
  const ownerGaps = WS.filter((w) => w.gap).length;
  const withActivities = WS.filter(
    (w) => (planOf(w.id).tasks || []).length > 0,
  ).length;
  const outcomeCards = STRATEGIC_OUTCOMES.map((o, i) => {
    const mapped = o.ws
      .map((n) => WS.find((w) => w.name === n))
      .filter(Boolean);
    return `<article class="outcome-card"><div class="outcome-card-top"><div><h4>${esc(o.label)}</h4><p>${esc(o.desc)}</p></div><span class="outcome-card-num">${i + 1}</span></div><div class="outcome-ws">${mapped.map((w) => `<button type="button" data-out-ws="${esc(w.id)}">${esc(w.name)}</button>`).join("")}</div></article>`;
  }).join("");
  const rows = WS.map((w) => {
    const p = planOf(w.id),
      o = strategicOutcomeFor(w.name),
      tasks = p.tasks || [],
      seq =
        tasks.length &&
        tasks.every(
          (t) => t.dep !== undefined && t.dep !== null && t.dep !== "",
        );
    const stated =
      (p.outcome || "").trim() ||
      (DOD[w.n] || {}).s ||
      (REC[w.n] || [])[0] ||
      w.dod ||
      "Outcome not yet written";
    const state =
      score(p) === MOVES
        ? ["ready", "Fully structured"]
        : score(p) > 0
          ? ["start", "In progress"]
          : ["gap", "Not started"];
    return `<tr><td>${outcomeTagForWorkstream(w)}</td><td><button class="ws-link" type="button" data-out-ws="${esc(w.id)}">${esc(w.name)}</button></td><td>${esc(stated)}</td><td>${tasks.length ? tasks.length + " identified" : "Not yet decomposed"}</td><td>${tasks.length ? (seq ? "Sequence mapped" : "Dependencies incomplete") : "Not yet mapped"}</td><td>${esc(w.leads)}</td><td><span class="state-pill ${state[0]}">${state[1]}</span></td></tr>`;
  }).join("");
  const master = [
    ["1. Define outcomes", "What must be true when the event succeeds."],
    ["2. Lock event design", "Format, scale, rules and experience choices."],
    [
      "3. Fix operating assumptions",
      "Populations, venue, timing and capacity.",
    ],
    ["4. Assign owners", "One accountable lead per workstream."],
    [
      "5. Identify key activities",
      "Decompose work until one person can own each line.",
    ],
    [
      "6. Map dependencies",
      "Set predecessor, downstream handoff and critical path.",
    ],
    ["7. Mobilize", "People, partners, participants, vendors and systems."],
    [
      "8. Build + test",
      "Complete assets, integrations, rehearsals and dry runs.",
    ],
    ["9. Readiness gates", "Go/No-Go at 30, 14, 7 days and 24 hours."],
    ["10. Execute + evidence", "Run, capture outcomes and close."],
  ];
  const chains = [
    {
      t: "Competition / Sunday close",
      s: [
        "Scale model",
        "Venue + team model",
        "24-hour timing",
        "Submission flow",
        "Judging capacity",
        "Final programme",
      ],
      n: "The event clock cannot be finalized independently of judging capacity and the Sunday finish.",
    },
    {
      t: "Guinness compliance",
      s: [
        "Official requirements",
        "Qualified participant definition",
        "Registration evidence",
        "Competition rules",
        "Verification design",
        "Event-day evidence",
      ],
      n: "Guinness requirements must be translated upstream into registration, rules, staffing and evidence—not added at the end.",
    },
    {
      t: "Atlas Jobs",
      s: [
        "Atlas capability",
        "Jobs experience",
        "Candidate profile flow",
        "Employer / job flow",
        "Website integration",
        "Event-day conversion",
      ],
      n: "Atlas Jobs is treated as a core outcome pathway, not a side feature of the fair.",
    },
  ];
  el("outcomesView").innerHTML =
    `<div class="outcome-hero"><span class="outcome-kicker">Outcome-to-execution control map</span><h2>Everything must ladder up.</h2><p>This view zero-bases the plan. A workstream, activity or task stays only if it supports a defined event outcome, enables another necessary activity, or protects delivery. Every task inherits the outcome tag of its workstream, and every workstream is expected to show activities, sequence, owner and readiness.</p><div class="outcome-metrics"><div class="outcome-metric"><b>${STRATEGIC_OUTCOMES.length}</b><span>top-level outcomes controlling the plan</span></div><div class="outcome-metric"><b>${withActivities}/${WS.length}</b><span>workstreams with key activities identified</span></div><div class="outcome-metric"><b>${sequenced}/${WS.length}</b><span>workstreams with task sequence mapped</span></div><div class="outcome-metric"><b>${ownerGaps}</b><span>workstreams still carrying an ownership gap</span></div></div></div>
  <section class="outcome-sec"><div class="outcome-sec-head"><div><h3>1. Outcomes</h3><p>The operating plan is organized around results, not around legacy sections. A workstream may contribute to more than one result operationally, but it has one primary tag here so accountability stays legible.</p></div></div><div class="outcome-grid">${outcomeCards}</div></section>
  <section class="outcome-sec"><div class="outcome-sec-head"><div><h3>2. Master sequence</h3><p>The common sequence every workstream follows from definition through evidence and close.</p></div></div><div class="seq-master">${master.map((x, i) => `<div class="seq-node"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>${i < master.length - 1 ? '<span class="seq-arr">→</span>' : ""}`).join("")}</div></section>
  <section class="outcome-sec"><div class="outcome-sec-head"><div><h3>3. Critical-path chains</h3><p>These are the three cross-workstream chains that should stay visible during weekly leadership review.</p></div></div><div class="chain-grid">${chains.map((c) => `<article class="chain-card"><h4>${esc(c.t)}</h4><div class="chain-line">${c.s.map((x, i) => `<span class="chain-step">${esc(x)}</span>${i < c.s.length - 1 ? '<span class="chain-arrow">→</span>' : ""}`).join("")}</div><div class="chain-note">${esc(c.n)}</div></article>`).join("")}</div></section>
  <section class="outcome-sec"><div class="outcome-sec-head"><div><h3>4. Cross-workstream control table</h3><p>This is the global check: outcome tag, workstream, intended result, key activities, sequence, owner and readiness. Open any workstream to edit the detail.</p></div></div><div class="outcome-rule"><b>Zero-base rule:</b> information does not earn a section merely because it exists. It must support a decision, execution, readiness, risk control or a measurable event outcome.</div><div class="control-table-wrap" style="margin-top:10px"><table class="control-table"><thead><tr><th>Outcome</th><th>Workstream</th><th>Intended result</th><th>Key activities</th><th>Sequence</th><th>Owner</th><th>Readiness</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  el("outcomesView")
    .querySelectorAll("[data-out-ws]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          current = b.dataset.outWs;
          showView("notebook");
          renderAll();
        }),
    );
}

// Switch operational sections while preserving their existing local storage models.
function showView(v) {
  document.body.classList.toggle('transport-fullscreen',v === 'transport');
  if (v !== 'transport') window.AtlasMap?.dispose();
  // The continuous view uses real sections and native nested scrolling; existing tabs remain available elsewhere.
  if (continuousOperations) {
    if (!document.body.classList.contains("operations-continuous")) {
      document.body.classList.add("operations-continuous");
      const host = document.createElement("div");
      host.className = "operations-chapters";
      el("views").after(host);
      flowSections.forEach(([key, id, label], i) => {
        const section = el(id),
          chapter = document.createElement("section");
        chapter.className = "depth-chapter";
        chapter.id = "flow-" + key;
        chapter.innerHTML = `<header class="depth-heading"><span>${String(i + 1).padStart(2, "0")} / OPERATIONS</span><h2>${label}</h2></header>`;
        section.hidden = false;
        section.classList.add("glass-scroll");
        section.tabIndex = 0;
        section.setAttribute("role", "region");
        section.setAttribute("aria-label", label);
        chapter.append(section);
        host.append(chapter);
      });
      renderPeople();
      renderDirection();
      renderOutcomes();
      renderWeb();
      renderTransportPage();
      renderOpen();
      // In the scroll journey, details start expanded so reading does not require disclosure clicks.
      host.querySelectorAll("details").forEach((detail) => {
        detail.open = true;
      });
    }
    document.getElementById("flow-" + v)?.scrollIntoView({ block: "start" });
    return;
  }

  if (
    ![
      "direction",
      "outcomes",
      "transport",
      "exec",
      "story",
      "baseline",
      "web",
      "mobilize",
      "notebook",
      "open",
      "people",
      "refs",
    ].includes(v)
  )
    v = "direction";
  history.replaceState(null, "", "#" + v);
  document.body.dataset.section = v;
  el("views")
    .querySelectorAll(".vbtn")
    .forEach((x) => x.classList.toggle("is-on", x.dataset.view === v));
  el("directionView").hidden = v !== "direction";
  el("outcomesView").hidden = v !== "outcomes";
  el("transportPageView").hidden = v !== "transport";
  el("execView").hidden = v !== "exec";
  el("storyView").hidden = v !== "story";
  el("baselineView").hidden = v !== "baseline";
  el("webView").hidden = v !== "web";
  el("openView").hidden = v !== "open";
  el("mobilizeView").hidden = v !== "mobilize";
  el("refsView").hidden = v !== "refs";
  el("peopleView").hidden = v !== "people";
  el("notebookView").hidden = v !== "notebook";
  if (v === "direction") renderDirection();
  if (v === "outcomes") renderOutcomes();
  if (v === "transport") renderTransportPage();
  if (v === "story") renderStory();
  if (v === "exec") renderExec();
  if (v === "web") renderWeb();
  if (v === "baseline") renderBaseline();
  if (v === "open") renderOpen();
  if (v === "mobilize") renderMobilize();
  if (v === "refs") renderRefs();
  if (v === "people") renderPeople();
  try {
    window.AtlasSave.write(LS + "-view", v);
  } catch (e) {}
  if (v === "direction" && directionScrollY > 0)
    setTimeout(() => window.scrollTo({ top: directionScrollY }), 0);
  else window.scrollTo({ top: 0 });
}

function renderRefs() {
  const sources = [
    [
      "1",
      "Intellibus Atlas Agentic AI Hackathon 2027 — Preliminary Planning & Readiness Working Document",
      "2027",
      "Current planning source of truth: dates, venue, 24-hour format, scale, tracks, Atlas, talent/jobs, trade fair, Guinness and operating baselines.",
      "Primary / current",
      "https://docs.google.com/document/d/19KWZYbYlMIbqLskTHjZdzh4KxKA7zq4-rFE9Hrhnrs0/edit",
    ],
    [
      "2",
      "Agenda _ Mar'26",
      "Mar 2026",
      "Most complete historical programme: public agenda, Day 1/2 run-of-show, speakers, checkpoints, judging, finalists, stream transitions and awards sequence.",
      "Primary historical",
      "https://docs.google.com/document/d/1hZvrE2PDU88uPY0gbjSjZBOLGK_P6S2mZUcIIJpb1DU/edit",
    ],
    [
      "3",
      "Hackathon Screens + Run of the day",
      "Oct 2025",
      "Production control schedule by time, session, lead, AV/logistics and individual screen/projector content. Strongest source for live show-control design.",
      "Primary historical",
      "https://docs.google.com/spreadsheets/d/19SWnkU6nQ_uB2-MkC3PShFzxj-t3vh-QXlmDa0eotZM/edit",
    ],
    [
      "4",
      "Intellibus Awards Show - J Keyes.docx",
      "2025",
      "Dedicated awards programme with award sequence, presenters, MC cues, winner call-ups, partner acknowledgement, scholarships/jobs and Top 3 close.",
      "Primary historical",
      "https://docs.google.com/document/d/1llWdTcMGLcdPqqIjs8Wxd4A2ogxBYrO5/edit",
    ],
    [
      "5",
      "WIP Agenda: Pre-Day",
      "Mar 2025",
      "Pre-day / media launch format: press segment, speaker order, photos, rules, emergency briefing, coaches, judges, walkthrough, mock evaluation and rehearsal.",
      "Primary historical",
      "https://docs.google.com/document/d/1Zq3bUHOm9OF5uIB9xYOMEtJ25CzPBwzbyWj5kTjtTPo/edit",
    ],
    [
      "6",
      "AI Hackathon Agenda Day1 & Day 2.pdf",
      "Mar 2025",
      "Clean public-facing two-day agenda: registration, opening, challenge release, kickoff, checkpoints, submission, judging, finalist presentations, awards and networking.",
      "Historical",
      "https://drive.google.com/file/d/1-aXdETogZxVr-fhc71BKEF7XTDz0NVyv/view",
    ],
    [
      "7",
      "National Hackathon Flow _Working.v1",
      "2026",
      "Participant and operating flows, technical infrastructure, judging/evaluation and supporting function design used to test whether programme timing is operationally plausible.",
      "Supporting",
      "https://docs.google.com/document/d/1uMuMHFvQvM2YhPIkTJd5VniAE1F4Pd7LsmZed7YYsVU/edit",
    ],
    [
      "8",
      "Intellibus Hackathon — Visual & Media Game Plan",
      "2026",
      "Media campaign and event-day content plan including agenda graphics, live updates, judging, final presentations, winner assets and post-event coverage.",
      "Supporting",
      "https://docs.google.com/document/d/1dssBKaBgnLyHEBaowyNdgsfX2J3tPljYvvWJZCKMK7I/edit",
    ],
    [
      "9",
      "Intellibus AI Hackathon — Outcomes & Talent Impact — Working Master",
      "2026",
      "Presentation/deck source for historical outcomes, talent impact and event narrative.",
      "Presentation",
      "https://docs.google.com/presentation/d/12dbrihICq10iEug4ItQ_YpZtand9aFC71d2V5_97eKA/edit",
    ],
    [
      "10",
      "National_AI_Hackathon_Presentation_Accents",
      "2026",
      "Google Slides presentation reference for Hackathon narrative and presentation treatment.",
      "Presentation",
      "https://docs.google.com/presentation/d/1tD4hecuIa8lv-EFW_6AJ64Jus2c2gb_ywNv8GeKGmqM/edit",
    ],
    [
      "11",
      "Intellibus AI Hackathon - Judges Onboarding.pptx",
      "2025/26",
      "Judge onboarding presentation reference for briefing, scoring readiness and judging operations.",
      "Presentation",
      "https://docs.google.com/presentation/d/1iYLXojloZdDnzx156GvMnZZIPW5rG7LN/edit",
    ],
    [
      "12",
      "Intellibus Hackathon — Vision — v1.2.pdf",
      "2026",
      "Vision reference used for event positioning, scale and strategic context.",
      "Supporting",
      "https://drive.google.com/file/d/1KA9-rdt7gAz4taWc9FVFOW2S2amsQU_N/view",
    ],
    [
      "13",
      "March '26 Hackathon Whiteboard",
      "Mar 2026",
      "Working planning context supporting the March 2026 programme and operational choices.",
      "Supporting",
      "https://docs.google.com/document/d/1yp3V0Rx5O1kovVGaRqeDzsHTw5nDN0XgvrlKqyOEk4s/edit",
    ],
    [
      "14",
      "Hackathon Notes",
      "2025–26",
      "Cross-event notes surfaced repeatedly against programme, schedule, awards and run-of-show searches; use as supporting context, not the controlling source.",
      "Supporting",
      "https://docs.google.com/document/d/100youKwdLs9fSGVJNZmcVE5x4xrD6h38u5FnE4vPA00/edit",
    ],
    [
      "15",
      "Speakers Readiness - Profiles, Bios & Headshots.pdf",
      "Sep 23, 2026",
      "Primary current speaker identity/readiness source: researched names and titles, invitation status, short bios, proposed roles, identity notes, profile/photo-source notes and publication readiness. Use this file to control speaker identity/title and publication readiness; it marks Scott Renner confirmed.",
      "Primary / current — speakers",
      "",
    ],
    [
      "16",
      "AI Hackathon Speaker Pack 20260818.pdf",
      "Aug 2026 working pack",
      "Primary speaker-programme and outreach source: 21 prospects, strategic vectors, proposed roles, prior-participation framing, why-fit context and draft invitations. Its event-location banner is provisional and does not override the current master planning document.",
      "Primary / current — speaker strategy",
      "",
    ],
    [
      "17",
      "Team workbook snapshot — Judges review",
      "Sep 2026 team update",
      "Attached team copy of the Judges website section. Comparison found no unique persisted judge-review decisions or contact/status edits beyond the pre-existing historical/default roster. Its legacy 85-judge capacity position was not imported because the current workbook has since locked 30 Official Judges + 30 Senior Technical Reviewers.",
      "Team update / audit reference",
      "",
    ],
    [
      "18",
      "Team workbook snapshot — Prize review",
      "Sep 2026 team update",
      "Attached team copy of the Prizes section. Row-level review statuses and comments were imported into the current workbook. The snapshot records 18 Approved rows, 31 Reviewed — Changes Required rows and 2 Not Reviewed rows across the prize framework, mechanics, tracks, judge build-out and area review gate.",
      "Team update / merged",
      "",
    ],
    [
      "19",
      "International Judges - Profiles Bios and Headshots.docx",
      "Sep 24, 2026",
      "International-judge working profiles with sourced/placeholder headshots, titles, historical roster tags, contacts where available, biographies, proposed judging roles, identity notes, source links and publication-readiness notes. Embedded headshots are used in the consolidated People and Judges views.",
      "Primary / current — judge profiles",
      "",
    ],
    [
      "20",
      "Atlas Stakeholder Engagement Master List.pdf",
      "Sep 24, 2026",
      "Master stakeholder universe organized into 16 engagement groups covering core event, competition/Guinness, volunteers, government/regulatory, technology, vendors, merchants/local business, venue, safety/medical, communications/media, participants, hospitality, finance/legal/insurance, community, VIPs and post-event stakeholders.",
      "Primary / current — stakeholder engagement",
      "",
    ],
    [
      "21",
      "Team workbook — School & University Bus Schedule",
      "Sep 2026 team update",
      "Full team-entered transport schedule with 23 school/university pickup locations, travel estimates, meet times, departure times, venue arrival, return departure and back-at-location timing. Preserved as a working transport input; its 8:00 a.m.–3:00 p.m. event assumption must be reconciled with the current Hackathon programme before approval.",
      "Team update / transport — validation required",
      "",
    ],
  ];
  const roleClass = (r) =>
    r.startsWith("Primary / current")
      ? "primary"
      : r === "Primary historical"
        ? "hist"
        : "";
  el("refsView").innerHTML = `
    <div class="ex-top">
      <p class="st-date">Reference register · programme / ceremony / production</p>
      <h2>References &amp; source files</h2>
      <p>Source trail used to develop the 2027 Hackathon programme, production model, awards-show recommendations, speaker and judge profiles, people database, communication map and granular workstream decomposition.</p>
    </div>
    <div class="source-note"><b>Source-control rule:</b> the 2027 Preliminary Planning &amp; Readiness Working Document remains the current planning source of truth for event logistics and operating baselines. For speakers, the Sep. 23 readiness profile file controls identity/title/publication-readiness and the Speaker Pack controls programme strategy/outreach framing. The Stakeholder Engagement Master List controls the stakeholder-universe taxonomy; the workbook assigns working ownership and recommended communication sequencing. Team workbook snapshots are treated as review-state inputs: their substantive comments/statuses are merged, but they do not override later planning decisions such as the locked 30 Official Judges + 30 Senior Technical Reviewers model. Historical agendas and decks are precedents only. Where source files conflict on location, timing or operating assumptions, the current 2027 master plan governs.</div>
    <section class="ex-sec">
      <h3>Programme source register</h3>
      <p class="st-lede">Use these files to trace why a programme choice exists and to distinguish current decisions from historical precedent.</p>
      <div class="table-scroll"><table class="source-table"><thead><tr><th>#</th><th>Source file</th><th>Period</th><th>What it contributes</th><th>Role</th><th>Open</th></tr></thead><tbody>
      ${sources.map((r) => `<tr><td>${r[0]}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td><span class="source-role ${roleClass(r[4])}">${esc(r[4])}</span></td><td>${r[5] ? `<a href="${r[5]}" target="_blank" rel="noopener">Open source</a>` : `<span class="muted">Uploaded PDF</span>`}</td></tr>`).join("")}
      </tbody></table></div>
    </section>
    <section class="ex-sec">
      <h3>What the historical record tells us</h3>
      <p class="st-lede">The previous events increasingly separated the attendee agenda from production control. For 2027, maintain five connected artefacts: (1) Public Programme, (2) Master Run of Show, (3) Media / Pre-Day Programme, (4) Awards Show Running Order, and (5) Awards Show MC Script. One file should not try to serve all five purposes.</p>
    </section>`;
}

function saveExec() {
  try {
    window.AtlasSave.write(
      operationsStorageKey() + "-exec",
      JSON.stringify(execState),
    );
    if (window.AtlasTeam?.active)
      window.AtlasTeam.changed(operationsSnapshot());
  } catch (e) {}
  if (db)
    db.doc("meta/exec")
      .set(execState)
      .catch(() => {});
}
function renderExec() {
  let done = 0;
  WS.forEach((w) => {
    if (score(planOf(w.id)) === MOVES) done++;
  });
  const gaps = WS.filter((w) => w.gap).length,
    total = WS.length;
  const dl = days(LOCK),
    de = days(EVENT);
  const open = QBANK.filter((q) => !(qState[q.id] || {}).done).length;
  const cls = { "On track": "g", "At risk": "a", "Off track": "r" };
  el("execView").innerHTML = `
  <div class="ex-top">
    <p class="st-date">Leadership brief · Intellibus Atlas Agentic AI Hackathon 2027</p>
    <h2>A 3,000-person event and a world-record attempt, 23–24 January in Montego Bay.</h2>
    <p>${open ? `<b style="color:var(--ink)">${open} of ${QBANK.length} decisions</b> in the MASTER Confirmations / Decisions Required bank are still open, ${dl > 0 ? dl + " days" : ""} before the 15 December plan lock.` : "Every decision in the bank has been recorded."}</p>
    <div class="ex-strip">
      <div><b>${dl > 0 ? dl : "—"}</b><span>days to plan lock</span></div>
      <div><b>${de > 0 ? de : "—"}</b><span>days to event</span></div>
      <div class="${open ? "warn" : ""}"><b>${open}</b><span>open decisions, Q01–Q33</span></div>
      <div class="${gaps ? "warn" : ""}"><b>${gaps}</b><span>workstreams without an owner</span></div>
      <div><b>${done}/${total}</b><span>workstreams fully planned</span></div>
      <div><b>${WS.filter((w) => (planOf(w.id).krs || []).length).length}/${total}</b><span>with key results set</span></div>
    </div>
  </div>

  <section class="ex-sec">
    <h3>MASTER Confirmations / Decisions Required</h3>
    <p class="st-lede">The plan's decision bank. Record the decision or response against each; ticked items move to the Decision Log.</p>
    ${QBANK.map((q) => {
      const st = qState[q.id] || {};
      const r = st.r !== undefined ? st.r : q.r;
      return `
    <div class="dec q ${st.done ? "is-done" : ""}" data-qid="${q.id}">
      <input type="checkbox" class="chk" data-qf="done" ${st.done ? "checked" : ""} aria-label="Mark ${q.id} decided">
      <div><h4><span class="qid">${q.id}</span> ${esc(q.q)}</h4><p>${esc(q.area)}</p>
        <input type="text" class="qresp" data-qf="r" value="${esc(r)}" placeholder="Decision / Response"></div>
    </div>`;
    }).join("")}
  </section>

  <section class="ex-sec">
    <h3>Three Primary Goals</h3>
    <p class="st-lede">Set the status before each review — it is your assessment, not calculated. Tick each required confirmation as it closes.</p>
    ${GOALS.map((g) => {
      const v = execState.goals[g.id] || "";
      const n = g.c.filter((c, i) => goalState[g.id + "c" + i]).length;
      return `
    <div class="gl"><div><h4><span class="gnum">Goal ${g.id.slice(1)}</span> ${esc(g.t)}</h4>
        <p>${n} of ${g.c.length} required confirmations complete</p></div>
      <select data-goal="${g.id}" class="${cls[v] || ""}" aria-label="Status of goal ${g.id.slice(1)}">
        <option value="">Not assessed</option>
        ${["On track", "At risk", "Off track"].map((o) => `<option${v === o ? " selected" : ""}>${o}</option>`).join("")}
      </select></div>
    ${goalBox(g, false)}`;
    }).join("")}
  </section>

  <section class="ex-sec">
    <h3>Top risks</h3>
    ${EXEC_RISKS.map((r) => `<div class="rk"><b>${esc(r[0])}</b><div><p>${esc(r[1])}</p><small>Response: ${esc(r[2])}</small></div></div>`).join("")}
  </section>

  <section class="ex-sec">
    <h3>Milestones</h3>
    <div class="road">
      <div class="stop ${new Date() > new Date("2026-10-01") ? "past" : ""}"><time>1 October 2026</time><h4>Website live, registration opens</h4></div>
      <div class="stop key"><time>15 December 2026</time><h4>Plan lock and baseline</h4></div>
      <div class="stop"><time>January 2027</time><h4>Dry-runs and full dress rehearsal</h4></div>
      <div class="stop key"><time>23–24 January 2027</time><h4>The Hackathon and record attempt</h4></div>
    </div>
    <p class="ex-note">Detail behind every figure sits in the Baseline and the Execution notebook.</p>
  </section>`;

  el("execView")
    .querySelectorAll(".dec[data-qid]")
    .forEach((row) => {
      const id = row.dataset.qid;
      row.querySelectorAll("[data-qf]").forEach((inp) =>
        inp.addEventListener(
          inp.type === "checkbox" ? "change" : "input",
          () => {
            const st = qState[id] || (qState[id] = {});
            if (inp.type === "checkbox") {
              st.done = inp.checked;
              if (inp.checked) st.on = new Date().toISOString().slice(0, 10);
              persist("qbank", qState);
              renderExec();
            } else {
              st.r = inp.value;
              persist("qbank", qState);
            }
          },
        ),
      );
    });
  bindGoalBoxes(el("execView"), renderExec);
  el("execView")
    .querySelectorAll("[data-goal]")
    .forEach((sel) =>
      sel.addEventListener("change", () => {
        execState.goals[sel.dataset.goal] = sel.value;
        saveExec();
        renderExec();
      }),
    );
}

function renderStory() {
  let done = 0,
    part = 0;
  WS.forEach((w) => {
    const k = score(planOf(w.id));
    if (k === MOVES) done++;
    else if (k > 0) part++;
  });
  const gaps = WS.filter((w) => w.gap).length,
    total = WS.length;
  const dl = days(LOCK),
    de = days(EVENT);
  const today = new Date(),
    past = (d) => new Date(d) < today;
  // record bar: scale 1,900 to 2,300
  const lo = 0,
    hi = 2300,
    pc = (v) => (((v - lo) / (hi - lo)) * 100).toFixed(2) + "%";
  el("storyView").innerHTML = `
  <div class="st-hero">
    <p class="st-date">23 to 24 January 2027 · Montego Bay Convention Centre</p>
    <h2>2,200 people build for twenty-four hours in one room.</h2>
    <p class="st-theme">Build Local. Think Global.</p>
  </div>

  <section class="st-sec">
    <h3>Why we are doing this</h3>
    <p class="st-lede">The Hackathon is designed as a live innovation factory: Jamaican talent, real business problems and agentic AI in one high-intensity environment. Its purpose is to <b>shorten three distances</b>.</p>
    <div class="dist">
      <div class="dist-row"><span>Problem</span><i></i><span>Prototype</span></div>
      <div class="dist-row"><span>Talent</span><i></i><span>Employment</span></div>
      <div class="dist-row"><span>Experiment</span><i></i><span>Commercial value</span></div>
    </div>
  </section>

  <section class="st-sec">
    <h3>The three primary goals</h3>
    <p class="st-lede">Everything we plan serves one of these. If a piece of work does not, it should be questioned.</p>
    <div class="goals">
      <div class="goal"><b>1</b><div><h4>Launch the Hackathon Website</h4>
        <p>${esc(GOALS[0].t.replace(/^Launch the Hackathon Website with /, "With "))}</p></div></div>
      <div class="goal"><b>2</b><div><h4>${esc(GOALS[1].t)}</h4></div></div>
      <div class="goal"><b>3</b><div><h4>${esc(GOALS[2].t)}</h4></div></div>
    </div>
  </section>

  <section class="st-sec">
    <h3>The scale we are planning for</h3>
    <p class="st-lede">These are the working numbers. Every workstream plans against them.</p>
    <div class="nums">
      <div class="num"><b>2,200</b><span>hackers physically present</span></div>
      <div class="num"><b>3,000</b><span>people across the whole event</span></div>
      <div class="num"><b>8,000</b><span>registrations needed to get there</span></div>
      <div class="num"><b>~550</b><span>teams building</span></div>
      <div class="num"><b>500+</b><span>solutions, each with an Atlas Experience</span></div>
      <div class="num"><b>100</b><span>merchants bringing real problems</span></div>
      <div class="num"><b>${judgeTarget}</b><span>official judge target</span></div>
      <div class="num"><b>100</b><span>recommended / TBC coach roster; peak active ~60, overnight active ~40</span></div>
    </div>
  </section>

  <section class="st-sec">
    <h3>We are attempting a world record — with very little room</h3>
    <p class="st-lede">The title is most participants in an agentic AI hackathon. The published record stands at 2,089. Our planning population is 2,200.</p>
    <div class="rec" role="img" aria-label="Record margin: published record 2,089, planning baseline 2,200, a margin of 111 participants">
      <div class="rec-bar">
        <div class="rec-fill" style="width:${pc(2089)}"></div>
        <div class="rec-margin" style="left:${pc(2089)};width:calc(${pc(2200)} - ${pc(2089)})"></div>
        <div class="rec-mark" style="left:${pc(2100)}"></div>
      </div>
      <div class="rec-scale">
        <span style="left:${pc(2089)};transform:translateX(calc(-100% - 6px));text-align:right"><b>2,089</b>record</span>
        <span style="left:${pc(2200)};transform:translateX(6px);text-align:left"><b>2,200</b>our baseline</span>
      </div>
    </div>
    <p class="rec-note">Drawn to scale from zero, the margin is that pink sliver: <b>111 people — about 5%</b>. Every no-show, every late bus, every participant who cannot be evidenced comes out of that sliver. That is why the record touches registration, transport, check-in, venue, staffing and evidence capture at once, and why it needs a permanent owner.</p>
  </section>

  <section class="st-sec">
    <h3>Where the plan stands right now</h3>
    <p class="st-lede">This updates live from the execution notebook. It is meant to be uncomfortable until it is not.</p>
    <div class="now">
      <div><b>${total}</b><span>workstreams in the plan</span></div>
      <div class="${gaps ? "warn" : "good"}"><b>${gaps}</b><span>still without a permanent owner</span></div>
      <div class="${done ? "good" : ""}"><b>${done}</b><span>fully broken out</span></div>
      <div><b>${part}</b><span>in progress</span></div>
    </div>
  </section>

  <section class="st-sec">
    <h3>The road from here</h3>
    <p class="st-lede">${dl > 0 ? `<b>${dl} days</b> to the plan lock and <b>${de} days</b> to the event.` : `The plan is locked. <b>${de > 0 ? de + " days" : "Days"}</b> to the event.`}</p>
    <div class="road">
      <div class="stop ${past("2026-10-01") ? "past" : ""}"><time>1 October 2026</time><h4>Website live</h4>
        <p>Registration opens and the participant funnel starts. Everything downstream depends on this date.</p></div>
      <div class="stop"><time>October to November</time><h4>Every workstream broken out</h4>
        <p>Owners named, outcomes written, work decomposed, sequenced, assigned and dated.</p></div>
      <div class="stop key ${past("2026-12-15") ? "past" : ""}"><time>15 December 2026</time><h4>Plan lock</h4>
        <p>The plan becomes the baseline. After this, changes go through change control, not quiet edits.</p></div>
      <div class="stop"><time>Late December to January</time><h4>Rehearse and prove</h4>
        <p>Dry-runs, load tests and a full dress rehearsal. Six weeks to fix what wobbles.</p></div>
      <div class="stop key"><time>23 to 24 January 2027</time><h4>The Hackathon</h4>
        <p>Twenty-four hours. 2,200 builders. One record attempt.</p></div>
    </div>
  </section>

  <section class="st-sec">
    <h3>How each workstream gets planned</h3>
    <p class="st-lede">The same five moves, for every workstream, whoever owns it.</p>
    <div class="steps5">
      <div class="s5"><b>1</b><div><h4>Name the outcome</h4><p>One sentence: what is true when this is finished.</p></div></div>
      <div class="s5"><b>2</b><div><h4>Set the key results</h4><p>How we will know it worked, and what evidence proves it.</p></div></div>
      <div class="s5"><b>3</b><div><h4>Decompose</h4><p>Break it down until one person could own each piece.</p></div></div>
      <div class="s5"><b>4</b><div><h4>Sequence</h4><p>What has to happen before each piece can start.</p></div></div>
      <div class="s5"><b>5</b><div><h4>Assign and date</h4><p>One name and one date on every piece, before 15 December.</p></div></div>
    </div>
  </section>

  <section class="st-sec">
    <div class="cta">
      <h3>Your part</h3>
      <p>After your one-on-one, open the execution notebook and find your workstream. The recommendations are a starting point, not an answer — accept what fits, reject what does not, and add what we missed. Every line should end with a name and a date.</p>
      <button type="button" id="goNotebook">Open the execution notebook</button>
    </div>
  </section>`;
  const g = el("goNotebook");
  if (g) g.onclick = () => showView("notebook");
}

/* ================= website, open items, decision bank ================= */

let webState = {},
  judgeState = {},
  actState = {},
  qState = {},
  reviewState = {},
  ambassadorState = {},
  curArea = null;
// Resolve the shared prize review link once; later sidebar navigation remains unchanged.
let requestedPrizeSection = new URLSearchParams(location.search).get("section") === "prizes";

function persist(key, obj) {
  try {
    window.AtlasSave.write(
      operationsStorageKey() + "-" + key,
      JSON.stringify(obj),
    );
    if (window.AtlasTeam?.active)
      window.AtlasTeam.changed(operationsSnapshot());
  } catch (e) {}
  if (db)
    db.doc("meta/" + key)
      .set(obj)
      .catch(() => {});
}
function restore(key) {
  try {
    const r = localStorage.getItem(LS + "-" + key);
    return r ? JSON.parse(r) || {} : {};
  } catch (e) {
    return {};
  }
}
function reviewOf(key) {
  return reviewState[key] || { status: "Not Reviewed", note: "" };
}
function reviewStatus(key) {
  return reviewOf(key).status || "Not Reviewed";
}
function reviewClass(st) {
  return st === "Blocked"
    ? "blocked"
    : st === "Approved" || st === "Ready to Publish"
      ? "approved"
      : st === "In Review"
        ? "inreview"
        : "";
}
function reviewControls(key) {
  const r = reviewOf(key),
    warn = r.status === "Blocked" && !String(r.note || "").trim();
  return `<div class="review-tools ${reviewClass(r.status)}">
    <select data-rkey="${esc(key)}" aria-label="Review status">${REVIEW.map((x) => `<option${x === r.status ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>
    <input type="text" data-rnote="${esc(key)}" value="${esc(r.note || "")}" placeholder="Review comment / blocker note">
  </div>${warn ? '<div class="review-note-warn">Blocked items should include the reason and what is needed to unblock them.</div>' : ""}`;
}
function reviewSummary(keys) {
  const c = {};
  REVIEW.forEach((x) => (c[x] = 0));
  keys.forEach((k) => (c[reviewStatus(k)] = (c[reviewStatus(k)] || 0) + 1));
  const cleared =
    (c["Approved"] || 0) +
    (c["Ready to Publish"] || 0) +
    (c["Not Proceeding"] || 0);
  return `<div class="review-summary"><span><b>${cleared}</b> cleared</span><span><b>${c["In Review"] || 0}</b> in review</span><span><b>${c["Reviewed — Changes Required"] || 0}</b> changes required</span><span><b>${c["Blocked"] || 0}</b> blocked</span><span><b>${c["Not Reviewed"] || 0}</b> not reviewed</span></div>`;
}
function bindReviewControls(root, after) {
  root.querySelectorAll("[data-rkey]").forEach(
    (sel) =>
      (sel.onchange = () => {
        const k = sel.dataset.rkey,
          cur = reviewOf(k);
        reviewState[k] = { ...cur, status: sel.value };
        persist("review", reviewState);
        if (after) after();
      }),
  );
  root.querySelectorAll("[data-rnote]").forEach(
    (inp) =>
      (inp.oninput = () => {
        const k = inp.dataset.rnote,
          cur = reviewOf(k);
        reviewState[k] = { ...cur, note: inp.value };
        persist("review", reviewState);
      }),
  );
}
function applyJudgeDefaults() {
  JUDGE_POOL.forEach((n) => {
    const base = JUDGE_DEFAULTS[n] || {
      status: "Tentative",
      notes: "Historical judge / 2027 outreach prospect",
    };
    const cur = judgeState[n] || {};
    judgeState[n] = { ...base, ...cur, status: base.status };
    ["email", "phone", "link", "notes"].forEach((k) => {
      if (base[k] && !cur[k]) judgeState[n][k] = base[k];
    });
  });
}

function parseOwners(str) {
  const parts = String(str || "")
    .split(/\s*(?:\/|\+|,)\s*/)
    .map((s) =>
      s
        .replace(/\s*-\s*interim/i, "")
        .replace(/\s*\(interim\)/i, "")
        .trim(),
    );
  const acc = parts[0] && !PLACE.test(parts[0]) ? parts[0] : "Unassigned";
  const sup = [
    ...new Set(parts.slice(1).filter((p) => p && !PLACE.test(p) && p !== acc)),
  ];
  return { acc, sup };
}
const areaStatus = (a) => (webState[a.id] || {}).status || "Draft";
const confirmedJudges = () =>
  JUDGE_POOL.filter((n) => (judgeState[n] || {}).status === "Confirmed");
function judgeDetailScore(n) {
  const j = judgeState[n] || JUDGE_DEFAULTS[n] || {};
  const email = !!String(j.email || "").trim(),
    phone = !!String(j.phone || "").trim(),
    link = !!String(j.link || "").trim();
  return {
    total: (email ? 1 : 0) + (phone ? 1 : 0) + (link ? 1 : 0),
    direct: (email ? 1 : 0) + (phone ? 1 : 0),
    email,
    phone,
    link,
  };
}
function judgeDetailLabel(n) {
  const d = judgeDetailScore(n);
  return d.total === 3 ? "3/3 · Full" : d.total + "/3";
}
function judgeStatusRank(n) {
  const st = (judgeState[n] || {}).status || "To Confirm";
  return (
    {
      Confirmed: 0,
      Invited: 1,
      "Senior Technical Reviewer Candidate": 2,
      Tentative: 3,
      "To Confirm": 4,
      Declined: 5,
      "Not Applicable": 6,
    }[st] ?? 9
  );
}
function sortedJudgeNames(names = JUDGE_POOL) {
  return [...names].sort((a, b) => {
    const A = judgeDetailScore(a),
      B = judgeDetailScore(b);
    return (
      B.total - A.total ||
      B.direct - A.direct ||
      judgeStatusRank(a) - judgeStatusRank(b) ||
      a.localeCompare(b)
    );
  });
}
function judgeDetailCounts(names = JUDGE_POOL) {
  const c = [0, 0, 0, 0];
  names.forEach((n) => c[judgeDetailScore(n).total]++);
  return c;
}
function coachPriority(r) {
  return (
    {
      Invite: 0,
      "Online Coach": 1,
      TBD: 2,
      "Senior Technical Reviewer Candidate": 3,
      No: 4,
    }[r[1]] ?? 9
  );
}
function sortedCoachRoster() {
  return [...COACH_ROSTER].sort(
    (a, b) => coachPriority(a) - coachPriority(b) || a[0].localeCompare(b[0]),
  );
}

let goalState = {},
  judgeTarget = 30;
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function judgeCap() {
  return [
    ["Physical Hacker Baseline", "2,200", "Operating population"],
    ["Estimated Teams / Pods", "~550", "2,200 / planning average team size 4"],
    [
      "Judging Function",
      "60 total",
      "30 Official Judges + 30 Senior Technical Reviewers",
    ],
    [
      "Layer 1",
      "~550 eligible submissions",
      "30 Senior Technical Reviewers; approximately 18–19 submissions each",
    ],
    [
      "Layer 1 Review Time",
      "~110 minutes per Senior Technical Reviewer",
      "At about 6 minutes per standardized screening review",
    ],
    [
      "Advancement",
      "Working Top 150 + cutoff quality-control review",
      "Shortlist is certified before Layer 2",
    ],
    [
      "Layer 2",
      "Up to about 150–180 submissions",
      "30 Official Judges; approximately 5–6 each at the upper range",
    ],
    [
      "Finals",
      "Top 10 live",
      "Official Judges determine final placements and certify winners",
    ],
  ];
}
function goalBox(g, withTitle) {
  return `<div class="goalbox">
    ${withTitle ? `<h4><span class="gnum">Goal ${g.id.slice(1)}</span>${esc(g.t)}</h4>` : ""}
    ${g.c
      .map((c, i) => {
        const k = g.id + "c" + i;
        return `<label class="act-row ${goalState[k] ? "is-done" : ""}">
      <input type="checkbox" class="chk" data-goalc="${k}" ${goalState[k] ? "checked" : ""}><span>${esc(c)}</span><em></em></label>`;
      })
      .join("")}
  </div>`;
}
function bindGoalBoxes(root, after) {
  root.querySelectorAll("[data-goalc]").forEach(
    (c) =>
      (c.onchange = () => {
        goalState[c.dataset.goalc] = c.checked;
        persist("goals", goalState);
        after();
      }),
  );
}

/* ---------- website view (organised by Goal 1) ---------- */
const areaByName = (n) => AREAS.find((a) => a.name === n);
const G1NAMES = new Set(GOAL1.flatMap((g) => g[1]));
function webItems() {
  const goal = GOAL1.map((g, i) => ({
    key: "g" + i,
    label: cap1(g[0]),
    areas: g[1].map(areaByName).filter(Boolean),
  }));
  const extra = AREAS.filter((a) => !a.tech && !G1NAMES.has(a.name)).map(
    (a) => ({ key: "a" + a.id, label: a.name, areas: [a] }),
  );
  const tech = AREAS.filter((a) => a.tech).map((a) => ({
    key: "a" + a.id,
    label: a.name,
    areas: [a],
  }));
  return { goal, extra, tech, all: goal.concat(extra, tech) };
}
function itemStatus(it) {
  const i = Math.min(...it.areas.map((a) => PUB.indexOf(areaStatus(a))));
  return PUB[i < 0 ? 0 : i];
}
function renderWeb() {
  const W = webItems();
  if (requestedPrizeSection) {
    curArea = W.all.find(item => item.areas.some(area => area.name === "Prizes"))?.key || curArea;
    requestedPrizeSection = false;
  }
  if (!curArea || !W.all.find((x) => x.key === curArea))
    curArea = W.goal[0].key;
  const q = AREAS.filter((a) => areaStatus(a) === "Ready to Publish").length;
  const pubG = W.goal.filter((it) => itemStatus(it) === "Published").length;
  const row = (it) => {
    const st = itemStatus(it),
      revs = it.areas.map((a) => reviewStatus("area:" + a.id));
    const lead = [...new Set(it.areas.map((a) => a.lead))].join(" · ");
    const rev = revs.every((x) => x === "Ready to Publish")
      ? "Ready to Publish"
      : revs.every((x) => x === "Approved" || x === "Ready to Publish")
        ? "Approved"
        : revs.includes("Blocked")
          ? "Blocked"
          : revs.includes("In Review")
            ? "In Review"
            : revs.includes("Reviewed — Changes Required")
              ? "Changes Required"
              : "Not Reviewed";
    return `<button class="ws" data-wkey="${it.key}" aria-current="${it.key === curArea}">
      <span class="n"></span>
      <span class="nm">${it.areas.some((a) => /to assign/i.test(a.lead)) ? '<span class="gapdot"></span>' : ""}${esc(it.label)}<small>${esc(lead)} · Review: ${esc(rev)}</small>${it.areas.some(a => a.name === "Prizes") ? `<small class="prize-review-summary">Detailed reviews: ${Object.keys(window.ATLAS_KANDIA_REVIEW.current).filter(k => reviewStatus(k) === "Approved").length} approved · ${Object.keys(window.ATLAS_KANDIA_REVIEW.current).filter(k => reviewStatus(k) === "Reviewed — Changes Required").length} changes required</small>` : ""}</span>
      <span class="chip c${PUB.indexOf(st)}">${esc(st)}</span></button>`;
  };
  el("webView").innerHTML = `
  ${goalBox(GOALS[0], true)}
  <p class="bl-intro" style="margin-top:14px"><b>${pubG}</b> of ${W.goal.length} Goal 1 requirements published · <b>${q}</b> content area${q === 1 ? "" : "s"} in Jamari's publishing queue. Owners set an area to <b>Ready to Publish</b> to hand it to Jamari.</p>
  ${reviewSummary(AREAS.map((a) => "area:" + a.id))}
  <div class="cols">
    <nav class="register" aria-label="Website content">
      <div class="reg-head"><h2>Goal 1 — required on the website</h2><span class="rc">${W.goal.length}</span></div>
      <div class="reg-list tall">${W.goal.map(row).join("")}
        <div class="grp">Also in the Content Readiness index — not named in Goal 1</div>${W.extra.map(row).join("")}
        <div class="grp">Technical — Jamari</div>${W.tech.map(row).join("")}</div>
    </nav>
    <main class="panel" id="webPanel"></main>
  </div>`;
  el("webView")
    .querySelectorAll("[data-wkey]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          curArea = b.dataset.wkey;
          renderWeb();
        }),
    );
  bindGoalBoxes(el("webView"), renderWeb);
  renderArea();
}

function detailTable(head, rows, cls = "") {
  return `<div class="table-scroll"><table class="${cls}"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(String(c))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function reviewableTable(head, rows, prefix, cls = "") {
  const keys = rows.map((row, i) => prefix + ":" + (prefix === "prize" ? Number(row[0]) - 1 : i));
  return (
    reviewSummary(keys) +
    `<div class="table-scroll"><table class="${cls}"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}<th>Review Status</th><th>Review Comment / Blocker</th></tr></thead><tbody>${rows
      .map((r, i) => {
        const k = keys[i],
          rv = reviewOf(k);
        return `<tr>${r.map((c, j) => `<td>${esc(String(c))}${prefix === "prize" && j === 1 && window.ATLAS_PRIZES?.images[r[0]] ? `<img class="prize-original-image" src="${window.ATLAS_PRIZES.images[r[0]]}" alt="${esc(r[1])} prize illustration" loading="lazy">` : ""}</td>`).join("")}<td class="review-cell"><select data-rkey="${esc(k)}">${REVIEW.map((x) => `<option${x === rv.status ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></td><td class="review-comment"><input type="text" data-rnote="${esc(k)}" value="${esc(rv.note || "")}" placeholder="Why blocked / changes required / approval note"></td></tr>`;
      })
      .join("")}</tbody></table></div>`
  );
}
function coachProfileCompleteness(n) {
  const cp = COACH_PROFILE_MAP[n] || {},
    photo = COACH_PHOTOS[n] || "";
  return (
    (photo ? 8 : 0) +
    (cp.title ? 3 : 0) +
    (cp.organization ? 2 : 0) +
    (cp.link ? 1 : 0)
  );
}
function coachProfilesBlock() {
  const rows = COACH_ROSTER.filter(
    (r) => r[1] !== "Senior Technical Reviewer Candidate" && r[1] !== "No",
  )
    .slice()
    .sort(
      (a, b) =>
        coachProfileCompleteness(b[0]) - coachProfileCompleteness(a[0]) ||
        coachPriority(a) - coachPriority(b) ||
        a[0].localeCompare(b[0]),
    );
  const withPhoto = rows.filter((r) => COACH_PHOTOS[r[0]]).length,
    withRole = rows.filter(
      (r) => COACH_PROFILE_MAP[r[0]] && COACH_PROFILE_MAP[r[0]].title,
    ).length,
    withLink = rows.filter(
      (r) => COACH_PROFILE_MAP[r[0]] && COACH_PROFILE_MAP[r[0]].link,
    ).length;
  return `<section class="move"><div class="m-head"><h3>Coach Profiles — Photos, Roles & Readiness</h3></div><div class="m-body" style="margin-left:0"><div class="source-note"><b>Profile consolidation.</b> ${rows.length} current coach prospects are shown below, ordered from most complete to least complete. Role/organization data is sourced from <i>Judges & Coaches Mar '26</i>; verified headshots use Intellibus Google Drive Active Team / Team Images / Academy Team as the first-choice source, with other named Drive assets used only as fallback. Erinski Easy still uses the existing verified image until a second verified portrait is located. Historical role data is context only and does not confirm January 2027 participation.</div><div class="statline"><span><b>${rows.length}</b> current coach prospects</span><span><b>${withPhoto}</b> verified headshots</span><span><b>${withRole}</b> role profiles</span><span><b>${withLink}</b> source/profile links</span><span><b>${rows.length - withRole}</b> role-data gaps</span></div><div class="judge-profile-grid">${rows
    .map(([n, st]) => {
      const cp = COACH_PROFILE_MAP[n] || {},
        photo = COACH_PHOTOS[n] || "",
        missing = [];
      if (!photo) missing.push("headshot");
      if (!cp.title) missing.push("role/title");
      if (!cp.organization) missing.push("organization");
      if (!cp.link) missing.push("profile link");
      return `<article class="judge-profile-card"><div class="person-top">${photo ? `<img class="person-photo" src="${photo}" alt="${esc(n)} headshot">` : `<div class="person-avatar">${esc(initials(n))}</div>`}<div><div class="person-name">${esc(n)}</div><div class="person-title">${esc(cp.title || "Role details to collect")}${cp.organization ? ` · ${esc(cp.organization)}` : ""}</div><div class="role-chips"><span class="role-chip coach">Coach</span><span class="role-chip">${esc(st)}</span>${missing.length ? `<span class="role-chip">${missing.length} gap${missing.length === 1 ? "" : "s"}</span>` : `<span class="role-chip">Profile substantially complete</span>`}</div></div></div><p>${cp.title ? `${esc(cp.title)}${cp.organization ? ` at ${esc(cp.organization)}` : ""}.` : "No role/title data is currently captured in the coach profile sources."}</p><details><summary>Profile data &amp; readiness</summary><p><b>January 2027 position:</b> ${esc(st)} — invitation/online-coach status is not a confirmation.</p>${cp.organization ? `<p><b>Organization:</b> ${esc(cp.organization)}</p>` : ""}<p><b>Profile gaps:</b> ${missing.length ? esc(missing.join(", ")) : "No core visual/profile fields missing; final bio, contact and participation confirmation still required."}</p>${cp.link ? `<p><a href="${esc(cp.link)}" target="_blank" rel="noopener">Open source/profile link</a></p>` : ""}<p><b>Source:</b> ${esc(cp.source || "Intellibus Google Drive roster / image sources")}</p></details></article>`;
    })
    .join("")}</div></div></section>`;
}

function coachRosterBlock() {
  const counts = COACH_ROSTER.reduce(
    (m, r) => ((m[r[1]] = (m[r[1]] || 0) + 1), m),
    {},
  );
  return `<section class="move"><div class="m-head"><h3>January 2027 Coach Considerations — Judging Roles Excluded</h3></div><div class="m-body" style="margin-left:0">
    <div class="review-lock"><b>Latest roster position.</b> “Invite” means invite as coach — it is not a confirmation. Any person marked Senior Technical Reviewer Candidate belongs to Judges & Judging and is excluded from coach capacity.</div>
    <div class="statline"><span><b>${counts["Invite"] || 0}</b> Invite</span><span><b>${counts["Online Coach"] || 0}</b> Online Coach</span><span><b>${counts["TBD"] || 0}</b> TBD</span><span><b>${counts["Senior Technical Reviewer Candidate"] || 0}</b> Senior Technical Reviewer candidates — excluded from coaching</span><span><b>${counts["No"] || 0}</b> No</span><span><b>${(counts["Invite"] || 0) + (counts["Online Coach"] || 0)}</b> current invite/online coach prospects</span></div>
    <p class="hint" style="margin-left:0">Contact details are not yet captured in this coach source, so this list is ordered by actionability: Invite → Online Coach → TBD → Senior Technical Reviewer Candidate → No.</p>
    ${reviewableTable(
      ["Name", "January 2027 Position"],
      sortedCoachRoster().filter(
        (r) => r[1] !== "Senior Technical Reviewer Candidate",
      ),
      "coach",
    )}
  </div></section>`;
}

function speakerStatusRank(s) {
  return (
    { Confirmed: 0, "Approved for Outreach": 1, "For Review": 2, Hold: 3 }[s] ??
    9
  );
}
function speakerProfileCompleteness(p) {
  return (
    (p.photo ? 4 : 0) +
    (p.title ? 1 : 0) +
    (p.bio ? 1 : 0) +
    (p.role ? 1 : 0) +
    (p.fit ? 1 : 0) +
    (p.publication ? 1 : 0)
  );
}
function speakerProfilesBlock() {
  const list = [...SPEAKER_PROFILES].sort(
    (a, b) =>
      speakerStatusRank(a.status) - speakerStatusRank(b.status) ||
      speakerProfileCompleteness(b) - speakerProfileCompleteness(a) ||
      a.name.localeCompare(b.name),
  );
  const counts = {};
  list.forEach((p) => (counts[p.status] = (counts[p.status] || 0) + 1));
  const card = (p) => {
    const key = "speaker-profile:" + p.name;
    const cls =
      p.status === "Confirmed"
        ? "status-confirmed"
        : p.status === "Hold"
          ? "status-hold"
          : "";
    return `<article class="speaker-profile-card ${cls}">
    <div class="person-top">
      ${p.photo ? `<img class="person-photo" src="${p.photo}" alt="${esc(p.name)} headshot">` : `<div class="person-avatar">${esc(initials(p.name))}</div>`}
      <div><div class="person-name">${esc(p.name)}</div><div class="person-title">${esc(p.title)}</div><div class="role-chips"><span class="role-chip speaker">Speaker</span><span class="role-chip">${esc(p.status)}</span></div></div>
    </div>
    <p>${esc(p.bio)}</p>
    <details><summary>Full profile, programme role &amp; source notes</summary>
      <p><b>Proposed programme role:</b> ${esc(p.role)}</p>
      <p><b>Strategic vector:</b> ${esc(p.vector)}${p.sector ? ` · ${esc(p.sector)}` : ""}</p>
      <p><b>Why this fits the 2027 programme:</b> ${esc(p.fit)}</p>
      <p><b>Programming angles:</b></p><ul>${(p.angles || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <p><b>Prior participation / source note:</b> ${esc(p.prior)}</p>
      ${p.photoNote ? `<p><b>Headshot note:</b> ${esc(p.photoNote)}</p>` : ""}
      <p><b>Publication readiness:</b> ${esc(p.publication)}</p>
      ${reviewControls(key)}
    </details>
  </article>`;
  };
  return `<div class="speaker-source-lock"><b>Source control.</b> Speaker identities, current titles, headshots, invitation status and publication-readiness notes are anchored to the Sep. 23 <i>Speakers Readiness - Profiles, Bios &amp; Headshots</i> source. Programme framing is supplemented by the <i>AI Hackathon Speaker Pack 20260818</i>. Headshots are shown only where the source profile is sufficiently identified; the unresolved Mukesh Jain identity remains intentionally without a portrait.</div>
    <div class="speaker-summary"><span><b>${list.length}</b> active profiles</span><span><b>${counts["Confirmed"] || 0}</b> confirmed</span><span><b>${counts["Approved for Outreach"] || 0}</b> approved for outreach</span><span><b>${counts["For Review"] || 0}</b> for review</span><span><b>${counts["Hold"] || 0}</b> hold</span></div>
    <div class="speaker-profile-grid">${list.map(card).join("")}</div>`;
}

function enterpriseCardsBlock() {
  const rows = NETWORK_CONTACTS.filter(
    (c) => c.category === "Business & Enterprise",
  );
  return `<section class="move"><div class="m-head"><h3>Enterprise View — Relationship Cards</h3></div><div class="m-body" style="margin-left:0"><div class="source-note"><b>Enterprise relationship view.</b> One card per named enterprise contact so this page is a working relationship surface, not a discussion table. These are prospects / network contacts, not confirmed sponsors or participants.</div><div class="enterprise-card-grid">${rows
    .map(
      (c) =>
        `<article class="enterprise-card"><h4>${esc(c.name)}</h4><div class="ent-org">${esc(c.title)} · ${esc(c.organization)}</div><div class="ent-tags"><span>${esc(c.vector)}</span>${String(
          c.tags || "",
        )
          .split(";")
          .filter(Boolean)
          .slice(0, 3)
          .map((t) => `<span>${esc(t.trim())}</span>`)
          .join(
            "",
          )}</div><p><b>Why it matters:</b> ${esc(c.why)}</p><p><b>Next move:</b> ${esc(c.next)}</p><div class="ent-contact">${c.email ? `Email: ${esc(c.email)}<br>` : ""}${c.phone ? `Phone: ${esc(c.phone)}` : "Contact details to complete"}</div></article>`,
    )
    .join("")}</div></div></section>`;
}

function areaBlock(a) {
  const st = areaStatus(a),
    isJ = a.name === "Judges",
    isP = a.name === "Prizes",
    isS = a.name === "Speakers",
    isC = a.name === "Coaches",
    isE = a.name === "Merchant & Enterprise",
    conf = confirmedJudges(),
    gateBlocked = isJ && conf.length === 0;
  const sec = (h, body) =>
    `<section class="move"><div class="m-head"><h3>${h}</h3></div><div class="m-body" style="margin-left:0">${body}</div></section>`;
  const tbl = (head, rows) =>
    `<table class="tasks ro"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  let judges = "",
    prizes = "",
    speakers = "",
    coaches = "",
    enterprise = "";
  if (isP) {
    prizes =
      sec(
        "Locked Prize & Recognition Framework",
        `<div class="review-lock"><b>FOR REVIEW — ARCHITECTURE LOCKED.</b> Owner: Candia. Changes from this point should only follow a judge-operability issue, Competition Rules conflict, measurement limitation, sponsor term or deliberate leadership decision.</div>
      <div class="source-note"><b>Team review merged.</b> The attached prize-workbook snapshot contains 18 Approved rows, 31 Reviewed — Changes Required rows and 2 Not Reviewed rows across the prize framework, mechanics, tracks, judge build-out and area review gate. Comments were preserved verbatim. The review was completed on the earlier workbook, so judge-build rows remain flagged for re-check against the now-locked 30 Official Judges + 30 Senior Technical Reviewers model.</div>
      ${reviewableTable(["#", "Prize / Recognition", "What It Means", "Prize / Recognition", "Measurement / Success Criteria", "Mechanics — How the Winner Is Determined"], PRIZE_DISPLAY, "prize", "prize-table")}`,
      ) +
      sec(
        "Competition Prize Mechanics",
        reviewableTable(
          ["Rule", "Locked / Proposed Mechanics"],
          PRIZE_RULES,
          "prize-rule",
        ),
      ) +
      sec(
        "Recommended Tracks — Working Assumption: 5",
        reviewableTable(["Track", "Scope"], PRIZE_TRACKS, "track"),
      ) +
      sec(
        "Mapped to Judge Build-Out",
        `<p class="hint" style="margin-left:0">Kandia’s 2 October source refers to an older 85-judge target and specialist awards now removed. Reconcile these references before approval; the current 30 Official Judges + 30 Senior Technical Reviewers model is retained. These are the judging dependencies that must be closed before the engine is execution-ready.</p>${reviewableTable(["Judge Build-Out Item", "Prize Framework Already Defines", "Still to Build / Confirm", "Owner", "Status"], PRIZE_JUDGE_MAP, "judge-build")}`,
      );
  }
  if (isS) {
    speakers = sec(
      "Speaker Profiles — Internal Working Set",
      speakerProfilesBlock(),
    );
  }
  if (isC) {
    coaches = coachProfilesBlock() + coachRosterBlock();
  }
  if (isE) {
    enterprise = enterpriseCardsBlock();
  }
  if (isJ) {
    const events = Object.keys(JUDGE_HISTORY);
    judges =
      sec(
        "Judge Profiles — Photos, Bios & Outreach Context",
        judgeProfilesBlock(),
      ) +
      sec(
        "History",
        `<p class="hint" style="margin-left:0">Historical Judges — Outreach Reference. Historical judges can support outreach but must not be presented as confirmed for 2027.</p>
      <div class="hist">${events
        .map((e) => {
          const names = sortedJudgeNames(JUDGE_HISTORY[e]),
            dc = judgeDetailCounts(names);
          return `<div><b>${e}</b><span>${names.length} judges · ${dc[3]} full contact records</span><ul>${names.map((n) => `<li>${esc(n)} <small>· ${esc(judgeDetailLabel(n))}</small></li>`).join("")}</ul></div>`;
        })
        .join("")}</div>`,
      ) +
      sec(
        "2027 plan",
        `
      <div class="jt"><label>Locked judging function</label>
        <span><b>60 total — 30 Official Judges + 30 Senior Technical Reviewers.</b> Senior Technical Reviewers are part of Judging from Day 1 and are not counted as coaches.</span></div>
      <div class="statline"><span><b>30</b> Official Judges target</span><span><b>30</b> Senior Technical Reviewers target</span><span><b>${PRELIM_EVALUATOR_CANDIDATES.length}</b> currently identified Senior Technical Reviewer candidates in the January source list</span></div>
      <p class="hint" style="margin-left:0">The current candidate list supports a separate Senior Technical Reviewer panel. Its final size and appointments need confirmation; candidates are not a completed roster.</p>
      <h4 class="sub4">Judging Capacity Model</h4>${tbl(["Item", "Working Planning Position", "Basis"], judgeCap())}
      
      <h4 class="sub4">Working Operating Model</h4>${tbl(
        ["Working Operating Model", "Position"],
        JUDGE_MODEL.map((r) => (r[0] === "Neighborhood Concept" ? r : r)),
      )}
      <h4 class="sub4">Confirmations / Actions Required</h4>
      ${DOC_ACTIONS.filter((x) => x.sec === "Judges")
        .map(
          (
            x,
          ) => `<div class="act-row ${(actState[x.id] || {}).done ? "is-done" : ""}">
        <input type="checkbox" class="chk" data-act="${x.id}" ${(actState[x.id] || {}).done ? "checked" : ""}>
        <div><span>${esc(x.t.replace("85-judge", "judge"))}</span><small>${esc(x.o)}</small>${reviewControls("action:" + x.id)}</div><em>${esc(x.o)}</em></div>`,
        )
        .join("")}`,
      ) +
      sec(
        "Working Judge Pool",
        (() => {
          const dc = judgeDetailCounts();
          return `<p class="hint" style="margin-left:0">Historical judges and potential 2027 outreach pool. Inclusion does not indicate confirmation for 2027. <b>${conf.length}</b> of ${judgeTarget} confirmed. Records are sorted from most complete to least complete using Email + Phone + Bio/Profile Link.</p>
      <div class="statline"><span><b>${dc[3]}</b> Full 3/3</span><span><b>${dc[2]}</b> 2/3 details</span><span><b>${dc[1]}</b> 1/3 detail</span><span><b>${dc[0]}</b> 0/3 details</span></div>
      ${reviewSummary(sortedJudgeNames().map((n) => "judge:" + n))}
      <div class="table-scroll"><table class="tasks"><thead><tr><th style="width:16%">Name</th><th style="width:7%">Contact</th><th style="width:16%">Email</th><th style="width:13%">Phone</th><th style="width:11%">2027 Status</th><th style="width:14%">Bio / Profile Link</th><th>Notes</th><th>Review Status</th><th>Review Comment / Blocker</th></tr></thead>
      <tbody>${sortedJudgeNames()
        .map((n) => {
          const j = judgeState[n] || {},
            k = "judge:" + n,
            rv = reviewOf(k);
          return `<tr data-jn="${esc(n)}">
        <td>${esc(n)}</td>
        <td><span class="chip ${judgeDetailScore(n).total === 3 ? "c3" : judgeDetailScore(n).total === 0 ? "c1" : "c2"}">${esc(judgeDetailLabel(n))}</span></td>
        <td><input type="email" data-jf="email" value="${esc(j.email || "")}" placeholder="TBD"></td>
        <td><input type="tel" data-jf="phone" value="${esc(j.phone || "")}" placeholder="TBD"></td>
        <td><select data-jf="status">${JSTAT.map((s) => `<option${(j.status || "To Confirm") === s ? " selected" : ""}>${s}</option>`).join("")}</select></td>
        <td><input type="text" data-jf="link" value="${esc(j.link || "")}" placeholder="TBD"></td>
        <td><input type="text" data-jf="notes" value="${esc(j.notes || "")}" placeholder="Historical judge / 2027 outreach prospect"></td>
        <td class="review-cell"><select data-rkey="${esc(k)}">${REVIEW.map((x) => `<option${x === rv.status ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></td>
        <td class="review-comment"><input type="text" data-rnote="${esc(k)}" value="${esc(rv.note || "")}" placeholder="Review note / blocker"></td></tr>`;
        })
        .join("")}</tbody></table></div>`;
        })(),
      );
  }
  return `<div class="ablock">
    <div class="ab-head"><h3>${esc(a.name)}</h3>
      <div class="meta"><span class="tag lead">Accountable: ${esc(a.lead)}</span>
      ${a.sup ? `<span class="tag">Supporting: ${esc(a.sup)}</span>` : ""}
      ${a.status ? `<span class="tag">Plan status: ${esc(a.status)}</span>` : ""}
      ${/to assign/i.test(a.lead) ? '<span class="tag gap">Owner required</span>' : ""}</div></div>
    ${judges}
    ${prizes}
    ${speakers}
    ${coaches}
    ${enterprise}
    ${sec(
      "Website content",
      `
      ${a.pos ? `<div class="facts"><b>Current Planning Position</b><p>${esc(a.pos)}</p></div>` : ""}
      ${a.ready ? `<div class="facts"><b>Confirmation / Ready When</b><p>${esc(a.ready)}</p></div>` : ""}
      ${a.notes ? `<div class="facts"><b>Details / Source Notes</b><p>${esc(a.notes)}</p></div>` : ""}`,
    )}
    ${sec(
      "Review Gate",
      `
      ${reviewControls("area:" + a.id)}
      <p class="pubnote" style="margin-top:7px">Use <b>Approved</b> when the review is complete, <b>Ready to Publish</b> when it has cleared review and can move to Jamari, and <b>Blocked</b> with a note explaining the blocker and what is needed to clear it.</p>`,
    )}
    ${sec(
      "Publishing",
      `
      <div class="pubrow">
        <label>Publishing status</label>
        <select data-pub="${a.id}" class="c${PUB.indexOf(st)}">${PUB.map((p) => `<option${st === p ? " selected" : ""}${gateBlocked && (p === "Ready to Publish" || p === "Published") ? " disabled" : ""}>${p}</option>`).join("")}</select>
        <span class="pubnote">${st === "Ready to Publish" ? `In Jamari's publishing queue${(webState[a.id] || {}).on ? " since " + esc(webState[a.id].on) : ""}.` : st === "Published" ? "Live on the website." : "Stays with " + esc(a.lead) + " until set to Ready to Publish."}</span>
      </div>
      ${isJ ? `<p class="gate">${gateBlocked ? "Ready to Publish is locked until at least one judge is Confirmed. " : ""}Only confirmed judges go to Jamari: ${conf.length ? conf.map(esc).join(", ") : "none yet"}.</p>` : ""}`,
    )}
  </div>`;
}
function renderArea() {
  const W = webItems();
  const it = W.all.find((x) => x.key === curArea);
  const inG1 = it.key.startsWith("g");
  el("webPanel").innerHTML = `
  <div class="p-top">
    <div class="idx">${inG1 ? "Goal 1 requirement" : it.areas[0].tech ? "Technical" : "Content Readiness index"}</div>
    <h2>${esc(it.label)}</h2>
    ${it.areas.length > 1 ? `<p class="hint" style="margin:8px 0 0">Covered by ${it.areas.length} content areas in the plan: ${it.areas.map((a) => esc(a.name)).join(" and ")}.</p>` : ""}
  </div>
  ${it.areas.map(areaBlock).join("")}`;
  const P = el("webPanel");
  P.querySelectorAll("[data-pub]").forEach(
    (sel) =>
      (sel.onchange = () => {
        const v = sel.value,
          id = sel.dataset.pub;
        webState[id] = {
          status: v,
          on:
            v === "Ready to Publish"
              ? new Date().toISOString().slice(0, 10)
              : (webState[id] || {}).on,
        };
        persist("web", webState);
        renderWeb();
      }),
  );
  const jt = el("jtSel");
  if (jt) jt.onchange = () => {};
  P.querySelectorAll("[data-act]").forEach(
    (c) =>
      (c.onchange = () => {
        actState[c.dataset.act] = { done: c.checked };
        persist("actions", actState);
        renderArea();
      }),
  );
  P.querySelectorAll("tr[data-jn]").forEach((tr) => {
    const n = tr.dataset.jn;
    tr.querySelectorAll("[data-jf]").forEach((inp) =>
      inp.addEventListener(
        inp.tagName === "SELECT" ? "change" : "input",
        () => {
          const j = judgeState[n] || (judgeState[n] = {});
          j[inp.dataset.jf] = inp.value;
          persist("judges", judgeState);
          if (inp.tagName === "SELECT") renderArea();
        },
      ),
    );
  });
  bindReviewControls(P, () => {
    renderWeb();
  });
}

/* ---------- open items ---------- */
let oiPerson = "",
  oiSupport = true;
function collectItems() {
  const items = [];
  const push = (owners, it) => {
    const o = parseOwners(owners);
    items.push({ ...it, who: o.acc, role: "Accountable" });
    o.sup.forEach((s) => items.push({ ...it, who: s, role: "Supporting" }));
  };
  DOC_ACTIONS.forEach((x) => {
    if (!(actState[x.id] || {}).done)
      push(x.o, {
        kind: "act",
        id: x.id,
        t: x.t,
        src: x.sec,
        rv: reviewStatus("action:" + x.id),
      });
  });
  WS.forEach((w) => {
    if (w.own || !w.decision) return;
    const k = "reg-" + w.id;
    if (!(actState[k] || {}).done)
      push(w.leads, {
        kind: "act",
        id: k,
        t: w.decision,
        src: "Workstream register · " + w.name,
      });
  });
  WS.forEach((w) => {
    (planOf(w.id).tasks || []).forEach((t) => {
      if (!t.done && t.owner && t.owner.trim())
        push(t.owner, {
          kind: "task",
          wsid: w.id,
          id: t.id,
          t: t.title,
          src: "Notebook · " + w.name,
          due: t.due,
        });
    });
  });
  AREAS.forEach((a) => {
    const st = areaStatus(a);
    if (st === "Published") return;
    if (st === "Ready to Publish")
      items.push({
        kind: "web",
        id: a.id,
        t: "Publish: " + a.name,
        src: "Website · publishing queue",
        who: "Jamari",
        role: "Accountable",
        st,
      });
    else
      push(a.lead + (a.sup ? " / " + a.sup : ""), {
        kind: "web",
        id: a.id,
        t: a.name + " — " + (a.ready || a.pos),
        src: "Website · " + st,
        st,
        rv: reviewStatus("area:" + a.id),
      });
  });
  return items;
}
function renderOpen() {
  const all = collectItems();
  const people = [...new Set(all.map((i) => i.who))].sort((a, b) => {
    const r = (x) => (x === "Unassigned" ? 2 : x === "Planning Team" ? 1 : 0);
    return r(a) - r(b) || a.localeCompare(b);
  });
  const openQ = QBANK.filter((q) => !(qState[q.id] || {}).done);
  let list = all.filter(
    (i) =>
      (!oiPerson || i.who === oiPerson) &&
      (oiSupport || i.role === "Accountable"),
  );
  const groups = people.filter((p) => !oiPerson || p === oiPerson);
  el("openView").innerHTML = `
  <p class="bl-intro">Every open item across the plan, by person — the plan's own action tables, the website content areas, and whatever the team has added in the execution notebook. Use it to run one-on-ones: pick a name.</p>
  <div class="oi-bar">
    <select id="oiWho"><option value="">Everyone (${people.length})</option>
      ${people.map((p) => `<option${p === oiPerson ? " selected" : ""} value="${esc(p)}">${esc(p)} — ${all.filter((i) => i.who === p && i.role === "Accountable").length} accountable</option>`).join("")}</select>
    <label class="oi-tog"><input type="checkbox" id="oiSup" ${oiSupport ? "checked" : ""}> Include supporting</label>
  </div>
  ${groups
    .map((p) => {
      const mine = list.filter((i) => i.who === p);
      if (!mine.length) return "";
      return `<section class="oi-grp"><h3>${esc(p)}<span>${mine.filter((i) => i.role === "Accountable").length} accountable · ${mine.filter((i) => i.role === "Supporting").length} supporting</span></h3>
    ${mine
      .map(
        (i) => `<div class="oi ${i.role === "Supporting" ? "sup" : ""}">
      ${
        i.kind === "act"
          ? `<input type="checkbox" class="chk" data-oact="${i.id}" aria-label="Mark done">`
          : i.kind === "task"
            ? `<input type="checkbox" class="chk" data-otask="${i.wsid}|${i.id}" aria-label="Mark done">`
            : `<span class="chip c${PUB.indexOf(i.st)}">${esc(i.st)}</span>`
      }
      <div><p>${esc(i.t)}</p><small>${esc(i.src)}${i.due ? " · by " + esc(i.due) : ""}${i.role === "Supporting" ? " · supporting" : ""}${i.rv ? " · Review: " + esc(i.rv) : ""}</small></div></div>`,
      )
      .join("")}</section>`;
    })
    .join("")}
  ${
    !oiPerson || oiPerson === "Unassigned"
      ? `<section class="oi-grp"><h3>Decision bank<span>${openQ.length} of ${QBANK.length} open · no owner assigned in the plan</span></h3>
    ${openQ.map((q) => `<div class="oi"><b class="qid">${q.id}</b><div><p>${esc(q.q)}</p><small>${esc(q.area)}${q.r ? " · working response: " + esc(q.r) : ""}</small></div></div>`).join("")}</section>`
      : ""
  }`;
  el("oiWho").onchange = (e) => {
    oiPerson = e.target.value;
    renderOpen();
  };
  el("oiSup").onchange = (e) => {
    oiSupport = e.target.checked;
    renderOpen();
  };
  el("openView")
    .querySelectorAll("[data-oact]")
    .forEach(
      (c) =>
        (c.onchange = () => {
          actState[c.dataset.oact] = { done: true };
          persist("actions", actState);
          renderOpen();
        }),
    );
  el("openView")
    .querySelectorAll("[data-otask]")
    .forEach(
      (c) =>
        (c.onchange = () => {
          const [w, t] = c.dataset.otask.split("|");
          const tk = planOf(w).tasks.find((x) => x.id === t);
          if (tk) {
            tk.done = true;
            save(w);
          }
          renderOpen();
        }),
    );
}

function renderAll() {
  renderRegister();
  renderRollup();
  renderPanel();
  if (el("directionView") && !el("directionView").hidden) renderDirection();
  if (el("transportPageView") && !el("transportPageView").hidden)
    renderTransportPage();
  if (el("storyView") && !el("storyView").hidden) renderStory();
  if (el("execView") && !el("execView").hidden) renderExec();
  if (el("openView") && !el("openView").hidden) renderOpen();
  if (el("peopleView") && !el("peopleView").hidden) renderPeople();
}

/* ---------- export ---------- */
function buildExport() {
  const nm = (id) => {
    const w = WS.find((x) => x.id === id);
    return w ? w.name : id;
  };
  let out = `Intellibus Atlas Agentic AI Hackathon 2027 — plan export\nPlan lock 15 Dec 2026 · Event 23–24 Jan 2027\nGenerated ${new Date().toISOString().slice(0, 10)}\n`;
  WS.forEach((w) => {
    const p = planOf(w.id);
    if (!p.outcome.trim() && !p.tasks.length && !(p.krs || []).length) return;
    out += `\n\n${w.n}. ${w.name}\nLeads: ${w.leads}${w.gap ? "  [owner required]" : ""}\nOutcome: ${p.outcome.trim() || "(not written)"}\n`;
    if ((p.krs || []).length) {
      out += `\nKey results:\n`;
      p.krs.forEach((k) => {
        out += `  - ${k.title}${k.target ? "  target: " + k.target : ""}${k.evidence && k.evidence.trim() ? "  evidence: " + k.evidence.trim() : ""}\n`;
      });
    }
    if (p.tasks.length) {
      out += `\nTask | Starts after | Owner | Required by | Done\n`;
      p.tasks.forEach((t) => {
        const dep = t.dep
          ? (p.tasks.find((x) => x.id === t.dep) || {}).title || "—"
          : "—";
        out += `${t.title || "(untitled)"} | ${dep} | ${t.owner || "—"} | ${t.due || "—"} | ${t.done ? "yes" : "no"}\n`;
      });
    }
    void nm;
  });
  return out;
}
async function doExport() {
  const text = buildExport();
  if (downloads) {
    try {
      await downloads.save({
        filename: "atlas-workstream-breakdown.txt",
        data: text,
      });
      setStatus("Export offered");
      return;
    } catch (e) {
      setStatus("Export declined");
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Plan copied to clipboard");
  } catch (e) {
    setStatus("Could not export here");
  }
}

/* ---------- boot ---------- */
loadLocal();
// Apply the complete backup before the text-export fallback initializes missing records.
const backupState = window.AtlasBackupUpdate.apply(plans, {...TEAM_REVIEW_MERGE, ...restore("review")}, operationsStorageKey());
plans = backupState.plans;
// Seed the original progress register from the exported plan without replacing browser edits.
let importedDestini = false;
for (const source of window.ATLAS_DESTINI_PLAN || []) {
  const id = "ws" + String(source.n).padStart(2, "0");
  const existing = plans[id];
  if (existing && (existing.destiniImported || existing.updatedAt || existing.outcome?.trim() || existing.tasks?.length || existing.krs?.length || existing.handled?.length || existing.khandled?.length || Object.values(existing.mobilize || {}).some(Boolean))) continue;
  const taskIds = source.tasks.map((_, i) => `destini-${id}-t${i}`);
  const clean = value => value === "—" ? "" : (value || "");
  const p = blank();
  p.outcome = source.outcome === "(not written)" ? "" : source.outcome;
  p.tasks = source.tasks.map((t, i) => ({
    id: taskIds[i], title: t.title, owner: clean(t.owner), due: clean(t.date),
    // Only a uniquely named predecessor is recoverable; an export dash remains unset.
    dep: source.tasks.filter(x => x.title === t.after).length === 1 ? taskIds[source.tasks.findIndex(x => x.title === t.after)] : "",
    done: t.done === "yes"
  }));
  p.krs = source.results.map((k, i) => ({...k, id: `destini-${id}-k${i}`}));
  p.handled = p.tasks.map(t => t.title);
  p.khandled = p.krs.map(k => k.title);
  p.destiniImported = "2026-10-02";
  plans[id] = p;
  importedDestini = true;
}
if (importedDestini) window.AtlasSave.write(operationsStorageKey(), JSON.stringify(plans));
plans = window.AtlasInternetRegisterUpdate.apply(plans, operationsStorageKey());
try {
  const c = localStorage.getItem(LS + "-ws");
  if (c) custom = JSON.parse(c) || [];
} catch (e) {}
rebuildWS();
try {
  const x = localStorage.getItem(LS + "-exec");
  if (x) {
    const v = JSON.parse(x);
    if (v && v.goals) execState = v;
  }
} catch (e) {}
webState = restore("web");
ambassadorState = restore("ambassadors");
judgeState = restore("judges");
applyJudgeDefaults();
persist("judges", judgeState);
actState = restore("actions");
qState = restore("qbank");
reviewState = { ...TEAM_REVIEW_MERGE, ...restore("review") };
// Merge the source's explicit review edits without resetting coach reviews or newer local decisions.
if (!localStorage.getItem(LS + '-kandia-20261002')) {
  for (const [key, value] of Object.entries(window.ATLAS_KANDIA_REVIEW.current)) {
    reviewState[key] = window.AtlasBackupUpdate.merge(reviewState[key], window.ATLAS_KANDIA_REVIEW.previous[key], value);
  }
  persist("review", reviewState);
  localStorage.setItem(LS + '-kandia-20261002', '1');
}
persist("review", reviewState);
goalState = restore("goals");
judgeTarget = 30;
renderClocks();
renderAll();
setStatus("Kept on this device");
setInterval(renderClocks, 36e5);

el("filterBtn").onclick = () => {
  gapsOnly = !gapsOnly;
  el("filterBtn").textContent = gapsOnly ? "Show all" : "Owner gaps only";
  if (gapsOnly && !WS.find((w) => w.id === current && w.gap)) {
    const f = WS.find((w) => w.gap);
    if (f) current = f.id;
  }
  renderAll();
};
el("addWS").onclick = () => {
  addWorkstream(el("newWS").value);
  el("newWS").value = "";
};
el("newWS").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addWorkstream(el("newWS").value);
    el("newWS").value = "";
  }
});
try {
  if (localStorage.getItem(LS + "-teach") === "0") teach = false;
} catch (e) {}
el("teachBtn").textContent = teach
  ? "PMP guide: available"
  : "PMP guide: hidden";
el("teachBtn").onclick = () => {
  teach = !teach;
  try {
    window.AtlasSave.write(LS + "-teach", teach ? "1" : "0");
  } catch (e) {}
  el("teachBtn").textContent = teach
    ? "PMP guide: available"
    : "PMP guide: hidden";
  renderPanel();
};
el("concepts").innerHTML = CONCEPTS.map(
  (c) => `<div><b>${esc(c[0])}</b>${esc(c[1])}</div>`,
).join("");
el("concBtn").onclick = () => {
  const c = el("concepts");
  c.hidden = !c.hidden;
  el("concBtn").textContent = c.hidden ? "PMP concepts" : "Hide concepts";
};
function renderBaseline() {
  el("baselineView").innerHTML =
    `<p class="bl-intro">One master baseline for scale, people and operating assumptions. Every workstream plans against these numbers. Confirmed positions are shown directly; recommendations are marked TBC; unknown targets remain TBD. Where another section conflicts, reconcile it back to this baseline.</p>
<div class="bl"><table><thead><tr><th>Position</th><th>Working baseline</th><th>Basis or note</th></tr></thead>
<tbody>${BASELINE.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>
${volunteerStaffingBlock()}${coachShiftBlock()}`;
}
renderBaseline();
el("views")
  .querySelectorAll(".vbtn")
  .forEach((b) => (b.onclick = () => showView(b.dataset.view)));
let firstView = "people";
try {
  firstView = location.hash.slice(1) || "people";
} catch (e) {}
if (
  !["direction", "notebook", "people", "web", "transport", "open"].includes(
    firstView,
  )
)
  firstView = "direction";
showView(firstView);
window.addEventListener("hashchange", () =>
  showView(location.hash.slice(1) || "people"),
);
el("exportBtn").onclick = doExport;

if (window.claude && typeof window.claude.use === "function") {
  claude
    .use("db")
    .then(async (d) => {
      if (!d) return;
      db = d;
      try {
        const snap = await db.collection("plan").get();
        snap.docs.forEach((s) => {
          const v = s.data() || {};
          plans[s.id] = {
            outcome: typeof v.outcome === "string" ? v.outcome : "",
            tasks: Array.isArray(v.tasks) ? v.tasks : [],
            handled: Array.isArray(v.handled) ? v.handled : [],
            krs: Array.isArray(v.krs) ? v.krs : [],
            khandled: Array.isArray(v.khandled) ? v.khandled : [],
          };
        });
        const cm = await db.doc("meta/custom").get();
        if (cm.exists && Array.isArray((cm.data() || {}).list))
          custom = cm.data().list;
        rebuildWS();
        for (const [k, setter] of [
          ["goals", (v) => (goalState = v)],
          [
            "jt",
            (v) => {
              judgeTarget = 30;
            },
          ],
          ["web", (v) => (webState = v)],
          [
            "judges",
            (v) => {
              judgeState = v;
              applyJudgeDefaults();
              persist("judges", judgeState);
            },
          ],
          ["actions", (v) => (actState = v)],
          ["qbank", (v) => (qState = v)],
        ]) {
          const d = await db.doc("meta/" + k).get();
          if (d.exists) setter(d.data() || {});
        }
        const ex = await db.doc("meta/exec").get();
        if (ex.exists) {
          const v = ex.data() || {};
          execState = { goals: v.goals || {}, decisions: v.decisions || {} };
        }
        useLocal = false;
        setStatus("Synced");
        renderAll();
      } catch (e) {
        setStatus("Kept on this device");
      }
    })
    .catch(() => {});
  claude
    .use("downloads")
    .then((d) => {
      if (d) downloads = d;
    })
    .catch(() => {});
}
void useLocal;

// Preserve the legacy record model while giving it authenticated, versioned team persistence.
function operationsStorageKey() {
  return LS + (window.AtlasTeam?.active ? window.AtlasTeam.draftSuffix : "");
}
function operationsSnapshot() {
  return {
    plans,
    custom,
    execState,
    webState,
    judgeState,
    actState,
    qState,
    reviewState,
    ambassadorState,
    goalState,
  };
}
window.AtlasTeam.init({
  endpoint: "/api/team-operations",
  snapshot: operationsSnapshot,
  replace(value) {
    plans = value.plans || {};
    custom = value.custom || [];
    execState = value.execState || { goals: {}, decisions: {} };
    webState = value.webState || {};
    judgeState = value.judgeState || {};
    actState = value.actState || {};
    qState = value.qState || {};
    reviewState = value.reviewState || {};
    ambassadorState = value.ambassadorState || {};
    goalState = value.goalState || {};
    rebuildWS();
    renderAll();
    setStatus("Shared operations · verified accounts can edit and save");
  },
});

// Persist the complete operations state when explicitly saving, using the same keys as autosave.
document.addEventListener('atlas-save-now', () => {
  try {
    window.AtlasSave.write(operationsStorageKey(),JSON.stringify(plans));
    saveCustom(); saveExec();
    const records={web:webState,judges:judgeState,actions:actState,qbank:qState,review:reviewState,ambassadors:ambassadorState,goals:goalState};
    Object.entries(records).forEach(([key,value]) => window.AtlasSave.write(operationsStorageKey()+"-"+key,JSON.stringify(value)));
    // Existing persist calls define the canonical keys; the full snapshot is also kept for backup.
    window.AtlasSave.write(operationsStorageKey()+'-snapshot',JSON.stringify(operationsSnapshot()));
    if(window.AtlasTeam?.active)window.AtlasTeam.changed(operationsSnapshot());
  } catch(e) { /* AtlasSave already shows a persistent error instead of false success. */ }
});
window.AtlasSave.snapshot = () => ({type:'operations',data:operationsSnapshot()});
