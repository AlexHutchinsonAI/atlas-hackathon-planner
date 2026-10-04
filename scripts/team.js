/* Team mode is explicit: connecting loads the shared plan, never uploads an old browser draft automatically. */
(() => {
  "use strict";
  let bridge,
    actor = null,
    revision = null,
    active = false,
    config = null,
    clerkReady, queue, personalSnapshot, connectedActorId = null;
  const bar = document.createElement("aside");
  bar.id = "team-bar";
  bar.setAttribute("aria-label", "Team connection");
  const setMessage = (text) => {
    bar.querySelector("[data-team-status]").textContent = text;
    if (active) window.AtlasSave?.message(text, /Conflict|unavailable|Offline|expired|denied/.test(text));
  };
  function draw() {
    bar.innerHTML =
      '<span data-team-status role="status"></span><button data-team-connect>Connect team</button><button data-team-reload hidden>Reload shared plan</button><button data-team-leave hidden>Sign out</button><button data-team-import hidden>Import my browser plan once</button><button data-team-recover hidden>Resume unsaved edits</button>';
    setMessage(
      active ? `Shared plan · ${actor.email}` : "Personal browser draft",
    );
    bar.querySelector("[data-team-connect]").hidden = active;
    bar.querySelector("[data-team-reload]").hidden = !active;
    bar.querySelector("[data-team-leave]").hidden = !active;
    bar.querySelector("[data-team-import]").hidden = !(active && actor.manager && revision === 0);
    bar.querySelector("[data-team-recover]").hidden = !(active && savedDraft());
  }
  async function request(method, body) {
    const token = await window.Clerk.session?.getToken();
    const r = await fetch(bridge.endpoint || "/api/team-plan", {
      method,
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await r.json();
    if (!r.ok) throw Object.assign(new Error(result.error || "Team request failed"), {status:r.status});
    return result;
  }
  async function loadClerk() {
    if (clerkReady) return clerkReady;
    clerkReady = (async () => {
      const domain = atob(config.publishableKey.split("_")[2]).replace(
        /\$$/,
        "",
      );
      const script = (src, key) =>
        new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = src;
          s.crossOrigin = "anonymous";
          if (key) s.dataset.clerkPublishableKey = key;
          s.onload = resolve;
          s.onerror = reject;
          document.head.append(s);
        });
      await script(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
      await script(
        `https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`,
        config.publishableKey,
      );
      await window.Clerk.load({
        ui: { ClerkUI: window.__internal_ClerkUICtor },
      });
    })();
    return clerkReady;
  }
  async function connect() {
    if (!config?.enabled) {
      setMessage(
        "Email sign-in setup pending · personal drafts still save here.",
      );
      return;
    }
    try {
      await loadClerk();
      if (!window.Clerk.session) {
        await window.Clerk.openSignIn({
          afterSignInUrl: location.href,
          afterSignUpUrl: location.href,
        });
        return;
      }
      const shared = await request("GET");
      if (active && queue?.saving) return;
      actor = shared.actor;
      if (connectedActorId && connectedActorId !== actor.id) queue?.stop();
      connectedActorId = actor.id;
      revision = shared.revision;
      active = true;
      queue?.stop();
      queue = new window.AtlasCloudQueue({
        request: body => request("PUT", body),
        persist: draft => {
          try { if (draft) localStorage.setItem(draftKey(), JSON.stringify(draft)); else localStorage.removeItem(draftKey()); }
          catch { setMessage("Device save unavailable · keep this tab open until cloud save succeeds"); }
        },
        status: text => {revision = queue.revision;setMessage(text);},
        online: () => navigator.onLine !== false,
      });
      queue.start(revision);
      bridge.replace(shared.body);
      draw();
      setMessage(`Signed in as ${actor.email} · ${actor.readOnly ? 'view only' : 'cloud autosave enabled'}`);
    } catch (e) {
      setMessage(e.message || "Sign-in unavailable. Your draft is unchanged.");
    }
  }
  function draftKey(){return 'atlas-cloud-pending-' + encodeURIComponent(actor.id) + '-' + encodeURIComponent(bridge.endpoint || '/api/team-plan');}
  function savedDraft(){try {return JSON.parse(localStorage.getItem(draftKey()) || 'null');}catch{return null;}}
  function changed(plan) {
    if (!active || actor.readOnly) return;
    queue.change(plan);
  }
  function init(api) {
    bridge = api;
    personalSnapshot = JSON.parse(JSON.stringify(api.snapshot()));
    document.body.append(bar);
    draw();
    // Keep account controls off the cinematic sphere and visible in the working views.
    const placeBar = () => {
      const workspace = document.getElementById("workspace");
      bar.hidden = Boolean(
        document.body.classList.contains("sphere-dashboard") &&
          workspace &&
          workspace.getBoundingClientRect().top > innerHeight / 2,
      );
    };
    addEventListener("scroll", placeBar, { passive: true });
    new MutationObserver(placeBar).observe(
      document.getElementById("app") ||
        document.querySelector(".wrap") ||
        document.body,
      { childList: true },
    );
    requestAnimationFrame(placeBar);
    bar.addEventListener("click", async (e) => {
      if (e.target.matches("[data-team-connect]")) connect();
      if (
        e.target.matches("[data-team-reload]") &&
        !queue?.saving &&
        confirm(
          "Replace the open shared draft with the latest server version? Export first to preserve unsaved edits.",
        )
      )
        connect();
      if(e.target.matches('[data-team-import]') && active && actor.manager && revision === 0 && !queue.saving) {
        if(confirm('Import the browser plan captured before sign-in into this empty shared baseline? This affects everyone who can access this planner.')) {
          bridge.replace(JSON.parse(JSON.stringify(personalSnapshot)));changed(personalSnapshot);queue.flush();
        }
      }
      if(e.target.matches('[data-team-recover]') && active && !queue.saving && !actor.readOnly) {
        const draft=savedDraft();
        if(draft && confirm('Resume this account’s unsaved edits? The original cloud revision will be checked before saving; a conflict will stop the save.')) {
          queue.start(draft.revision);bridge.replace(draft.plan);queue.change(draft.plan);queue.flush();
        }
      }
      if (e.target.matches("[data-team-leave]")) {
        if (queue?.saving) {
          setMessage("Wait for the current save before leaving team mode.");
          return;
        }
        if (
          (queue?.pending || queue?.blocked) &&
          !confirm("Leave team mode with unsaved edits? Export them first.")
        )
          return;
        queue?.stop();
        active = false;
        await window.Clerk?.signOut();
        location.reload();
      }
    });
    fetch("/api/team-config")
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        config = c;
        if (!c?.enabled) {
          bar.querySelector("[data-team-connect]").textContent =
            "Team setup pending";
        } else {
          loadClerk()
            .then(() => {
              window.Clerk.addListener(({ session, user }) => {
                if (session && !active) connect();
                if (active && (!session || (user?.id && user.id !== connectedActorId))) {queue?.stop();active=false;actor=null;location.reload();}
              });
            })
            .catch(() =>
              setMessage(
                "Team sign-in could not load. Personal drafts remain available.",
              ),
            );
        }
      })
      .catch(() => {
        bar.querySelector("[data-team-connect]").textContent =
          "Team setup pending";
      });
    addEventListener("beforeunload", (e) => {
      if (queue?.saving || queue?.pending) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }
  addEventListener('online',()=>{if(active)queue?.flush();});
  addEventListener('offline',()=>{if(active)setMessage('Offline · edits stay on this device until connection returns');});
  document.addEventListener('atlas-save-now',()=>{queueMicrotask(()=>{if(active)queue?.flush();});});
  window.AtlasTeam = {
    init,
    changed,
    get active() {
      return active;
    },
    get draftSuffix() { return "-shared-" + encodeURIComponent(actor?.id || "signed-out"); },
    get readOnly() {return active && Boolean(actor?.readOnly);},
    canManage() {
      return Boolean(actor?.manager);
    },
    canOwn(w) {
      return (
        !active ||
        (!actor?.readOnly && actor?.manager) ||
        (!actor?.readOnly && w.ownerEmail?.toLowerCase() === actor?.email)
      );
    },
  };
})();
