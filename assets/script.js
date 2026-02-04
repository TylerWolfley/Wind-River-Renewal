// Wind River Renewal — site-wide script.js
// - Preserves UTMs on .js-keep-utm links
// - Fills hidden UTM fields in forms
// - Tracks click-to-call + lead submits (GA4)
// - Mobile nav toggle (single source of truth): .nav-toggle + #site-nav

(() => {
  "use strict";

  // -------------------- Query params / UTM --------------------
  const params = new URLSearchParams(window.location.search);
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  function hasAnyUTM() {
    return UTM_KEYS.some((k) => params.has(k));
  }

  function getUTMs() {
    const utm = {};
    for (const k of UTM_KEYS) utm[k] = params.get(k) || "";
    return utm;
  }

  function applyUTMToUrl(href) {
    const url = new URL(href, window.location.origin);
    for (const [k, v] of params.entries()) {
      if (k.toLowerCase().startsWith("utm_")) url.searchParams.set(k, v);
    }
    return url.toString();
  }

  function preserveUTMLinks() {
    if (!hasAnyUTM()) return;

    document.querySelectorAll("a.js-keep-utm[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const lower = href.toLowerCase();
      if (
        href.startsWith("#") ||
        lower.startsWith("mailto:") ||
        lower.startsWith("tel:") ||
        lower.startsWith("sms:")
      ) return;

      try {
        a.setAttribute("href", applyUTMToUrl(href));
      } catch (_) {}
    });
  }

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

  // -------------------- GA helpers --------------------
  function safeGtag(eventName, payload) {
    if (typeof window.gtag !== "function") return;
    try {
      window.gtag("event", eventName, payload);
    } catch (_) {}
  }

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

  function trackForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.addEventListener("submit", () => {
        // Prevent repeat submits
        const btns = form.querySelectorAll("button[type='submit'], input[type='submit']");
        btns.forEach((btn) => {
          if (btn.disabled) return;
          btn.disabled = true;
          btn.setAttribute("aria-disabled", "true");
          if (btn.tagName === "BUTTON") {
            btn.textContent = btn.getAttribute("data-sending-text") || "Sending…";
          }
        });

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

  // -------------------- Mobile nav toggle --------------------
  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav"); // matches your HTML

    if (!toggle || !nav) return;

    // Ensure consistent a11y defaults
    if (!toggle.hasAttribute("aria-expanded")) toggle.setAttribute("aria-expanded", "false");
    if (!toggle.hasAttribute("aria-label")) toggle.setAttribute("aria-label", "Open menu");

    function closeMenu() {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }

    function openMenu() {
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }

    function isOpen() {
      return document.body.classList.contains("nav-open");
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      isOpen() ? closeMenu() : openMenu();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!isOpen()) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close after tapping any link in the nav
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });
  }

  // -------------------- Init --------------------
  function init() {
    preserveUTMLinks();
    fillUTMInputs();
    trackTelClicks();
    trackForms();
    initMobileNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
