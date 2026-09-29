/* Team mode is explicit: connecting loads the shared plan, never uploads an old browser draft automatically. */
(() => {
  "use strict";
  let bridge,
    actor = null,
    revision = null,
    active = false,
    saving = false,
    pending = null,
    blocked = false,
    config = null,
    clerkReady;
  const bar = document.createElement("aside");
  bar.id = "team-bar";
  bar.setAttribute("aria-label", "Team connection");
  const setMessage = (text) => {
    bar.querySelector("[data-team-status]").textContent = text;
  };
  function draw() {
    bar.innerHTML =
      '<span data-team-status role="status"></span><button data-team-connect>Connect team</button><button data-team-reload hidden>Reload shared plan</button><button data-team-leave hidden>Leave team mode</button>';
    setMessage(
      active ? `Shared plan · ${actor.email}` : "Personal browser draft",
    );
    bar.querySelector("[data-team-connect]").hidden = active;
    bar.querySelector("[data-team-reload]").hidden = !active;
    bar.querySelector("[data-team-leave]").hidden = !active;
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
    if (!r.ok) throw new Error(result.error || "Team request failed");
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
        "Company sign-in setup pending · personal drafts still save here.",
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
      actor = shared.actor;
      revision = shared.revision;
      active = true;
      blocked = false;
      pending = null;
      bridge.replace(shared.body);
      draw();
    } catch (e) {
      setMessage(e.message || "Sign-in unavailable. Your draft is unchanged.");
    }
  }
  async function flush() {
    if (!active || saving || blocked || !pending) return;
    saving = true;
    const snapshot = pending;
    pending = null;
    setMessage("Saving shared plan…");
    try {
      const result = await request("PUT", { plan: snapshot, revision });
      revision = result.revision;
      setMessage("Shared plan saved");
    } catch (e) {
      blocked = true;
      pending = pending || snapshot;
      setMessage(e.message);
    } finally {
      saving = false;
      if (pending && !blocked) flush();
    }
  }
  // Called after local persistence so network errors cannot erase the working draft.
  function changed(plan) {
    if (!active) return;
    pending = JSON.parse(JSON.stringify(plan));
    flush();
  }
  function init(api) {
    bridge = api;
    document.body.append(bar);
    draw();
    bar.addEventListener("click", async (e) => {
      if (e.target.matches("[data-team-connect]")) connect();
      if (
        e.target.matches("[data-team-reload]") &&
        !saving &&
        confirm(
          "Replace the open shared draft with the latest server version? Export first to preserve unsaved edits.",
        )
      )
        connect();
      if (e.target.matches("[data-team-leave]")) {
        if (saving) {
          setMessage("Wait for the current save before leaving team mode.");
          return;
        }
        if (
          (pending || blocked) &&
          !confirm("Leave team mode with unsaved edits? Export them first.")
        )
          return;
        active = false;
        pending = null;
        blocked = false;
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
              window.Clerk.addListener(({ session }) => {
                if (session && !active) connect();
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
      if (saving || pending) {
        e.preventDefault();
        e.returnValue = "";
      }
    });
  }
  window.AtlasTeam = {
    init,
    changed,
    get active() {
      return active;
    },
    canManage() {
      return Boolean(actor?.manager);
    },
    canOwn(w) {
      return (
        !active ||
        actor?.manager ||
        w.ownerEmail?.toLowerCase() === actor?.email
      );
    },
  };
})();
