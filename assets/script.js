// Preserve UTMs, fill forms, and track events (WRR site-wide)
(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);

  // ---- UTM helpers ---------------------------------------------------------
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  function getUTMs() {
    const utm = {};
    for (const k of UTM_KEYS) utm[k] = params.get(k) || "";
    return utm;
  }

  function hasAnyUTM() {
    return UTM_KEYS.some((k) => params.has(k));
  }

  function applyUTMToUrl(href) {
    const url = new URL(href, window.location.origin);
    for (const [k, v] of params.entries()) {
      if (k.toLowerCase().startsWith("utm_")) url.searchParams.set(k, v);
    }
    return url.toString();
  }

  // Preserve UTMs on links marked with .js-keep-utm
  function preserveUTMLinks() {
    if (!hasAnyUTM()) return;
    document.querySelectorAll("a.js-keep-utm[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        a.setAttribute("href", applyUTMToUrl(href));
      } catch (_) {}
    });
  }

  // Fill hidden UTM inputs (supports either name="utm_*" or id="utm_*")
  function fillUTMInputs() {
    const utm = getUTMs();
    document.querySelectorAll("form").forEach((form) => {
      for (const key of UTM_KEYS) {
        const el =
          form.querySelector(`[name="${key}"]`) ||
          form.querySelector(`#${CSS.escape(key)}`);
        if (el) el.value = utm[key];
      }
    });
  }

  // ---- GA helpers ----------------------------------------------------------
  function safeGtag(eventName, payload) {
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", eventName, payload);
    } catch (_) {}
  }

  // Use GA4 recommended phone conversion event name
  function trackTelClicks() {
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target.closest('a[href^="tel:"]');
        if (!a) return;

        const label =
          a.getAttribute("data-track-label") ||
          a.id ||
          (a.textContent || "").trim() ||
          a.getAttribute("href");

        safeGtag("click_to_call", {
          event_category: "engagement",
          event_label: label,
        });
      },
      { passive: true }
    );
  }

  // Prevent double-submit + track leads
  function trackForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", () => {
        // Disable all submit buttons (some forms have multiple)
        const btns = form.querySelectorAll("button[type='submit'], input[type='submit']");
        btns.forEach((btn) => {
          // prevent repeated submits
          if (btn.disabled) return;
          btn.disabled = true;

          // keep the layout stable
          if (btn.tagName === "BUTTON") btn.textContent = btn.getAttribute("data-sending-text") || "Sending…";
          btn.setAttribute("aria-disabled", "true");
        });

        // GA4 lead event
        const label =
          form.getAttribute("data-track-label") ||
          form.id ||
          form.getAttribute("name") ||
          "form_submit";

        safeGtag("generate_lead", {
          event_category: "lead",
          event_label: label,
        });
      });
    });
  }

  // ---- Init ---------------------------------------------------------------
  function init() {
    preserveUTMLinks();
    fillUTMInputs();
    trackTelClicks();
    trackForms();
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// Mobile nav toggle (hamburger)
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function closeMenu() {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function openMenu() {
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = document.body.classList.contains('nav-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    closeMenu();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Close after clicking a nav link
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });
})();
