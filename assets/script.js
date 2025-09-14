// Preserve UTMs, fill forms, track events
(function () {
  const search = window.location.search;
  const params = new URLSearchParams(search);

  // --- Preserve UTMs on important links ---
  function keepUTM(el) {
    try {
      const url = new URL(el.getAttribute('href'), window.location.origin);
      // Only copy known utm_ params
      params.forEach((v, k) => {
        if (k.toLowerCase().startsWith("utm_")) {
          url.searchParams.set(k, v);
        }
      });
      el.setAttribute("href", url.toString());
    } catch (e) {}
  }
  document.querySelectorAll("a.js-keep-utm").forEach(keepUTM);

  // --- Fill hidden UTM inputs in forms (fixed selector bug) ---
  function fillFormUTM(form) {
    const ids = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    ids.forEach((id) => {
      const el = form.querySelector(`[name="${id}"]`);
      if (el) el.value = params.get(id) || "";
    });
  }
  document.querySelectorAll("form").forEach(fillFormUTM);

  // --- GA4: track click-to-call automatically for all tel: links ---
  function tagTelLinks() {
    document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
      el.addEventListener("click", () => {
        if (typeof gtag === "function") {
          gtag("event", "click_to_call", {
            event_category: "engagement",
            event_label: el.id || el.textContent.trim() || "tel_link",
          });
        }
      });
    });
  }
  tagTelLinks();

  // --- GA4: track form submits + disable submit buttons ---
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
      // disable button
      const btn = form.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending…";
      }
      // track GA4 lead event
      if (typeof gtag === "function") {
        gtag("event", "generate_lead", {
          event_category: "lead",
          event_label: form.id || "form_submit",
        });
      }
    });
  });
})();
