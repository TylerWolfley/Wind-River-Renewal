// Shared interactions. Lead events only follow confirmed Formspree acceptance.
(() => {
  'use strict';
  if (window.wrrInitialized) return;
  window.wrrInitialized = true;
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const params = new URLSearchParams(location.search);
  const track = (name, payload) => { if (typeof window.gtag === 'function') window.gtag('event', name, payload); };
  document.querySelectorAll('a.js-keep-utm[href]').forEach(a => {
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    utmKeys.forEach(key => { if (params.has(key)) url.searchParams.set(key, params.get(key)); });
    a.href = url.href;
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="tel:"]');
    if (a) track('click_to_call', { event_label: a.textContent.trim() });
  });
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    const setOpen = open => {
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', e => { if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('focusin', e => { if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });
    matchMedia('(min-width: 961px)').addEventListener('change', () => setOpen(false));
  }
  document.querySelectorAll('.quote-form').forEach(form => {
    utmKeys.forEach(key => { form.elements[key].value = params.get(key) || ''; });
    const contact = form.elements.contact, photos = form.elements.photos;
    const status = form.querySelector('.form-status'), button = form.querySelector('[type="submit"]');
    let pending = false, sent = false;
    function validateContact() {
      const value = contact.value.trim();
      const valid = value.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : /^[+()\d\s.\-]+$/.test(value) && value.replace(/\D/g, '').length >= 10 && value.replace(/\D/g, '').length <= 15;
      contact.setCustomValidity(value && !valid ? 'Enter a phone number with area code, or a valid email address.' : '');
    }
    contact.addEventListener('input', validateContact);
    function validatePhotos() {
      if (!photos) return;
      const files = [...photos.files];
      let error = '';
      if (files.length > 5) error = 'Please select no more than 5 photos.';
      else if (files.some(f => !f.type.startsWith('image/'))) error = 'Please choose image files only.';
      else if (files.reduce((sum, f) => sum + f.size, 0) > 10 * 1024 * 1024) error = 'Photos must total 10 MB or less. Choose smaller images or text them instead.';
      photos.setCustomValidity(error);
      form.querySelector('.file-feedback').textContent = error || files.map(f => f.name).join(', ');
    }
    if (photos) photos.addEventListener('change', validatePhotos);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (pending || sent) return;
      validateContact(); validatePhotos();
      for (const el of form.querySelectorAll('[required]')) { if (!el.value.trim()) el.value = ''; }
      if (!form.reportValidity()) return;
      pending = true; button.disabled = true; button.textContent = 'Sending…';
      status.textContent = 'Sending your request…'; status.classList.remove('error');
      const data = new FormData(form), value = contact.value.trim();
      data.set(value.includes('@') ? 'email' : 'phone', value);
      data.set('page_url', location.href);
      data.set('message', ['Name: ' + data.get('name'), 'Contact: ' + value, 'Location: ' + data.get('city_town'), 'Job: ' + data.get('job_details'), 'Service: ' + (data.get('service_type') || 'Not specified'), 'Access: ' + (data.get('access_notes') || 'Not specified'), 'Timing: ' + (data.get('timing') || 'Not specified'), 'Photo documentation: ' + (data.get('photo_documentation') || 'Not requested')].join('\n'));
      if (!photos || !photos.files.length) data.delete('photos');
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('not-confirmed');
        sent = true;
        status.textContent = 'Your request was sent. We will review it and contact you. Your job is not booked yet.';
        button.textContent = 'Request sent'; status.focus();
        track('generate_lead', { method: 'formspree', event_label: form.dataset.trackLabel });
      } catch (error) {
        status.classList.add('error');
        status.textContent = error.name === 'AbortError' ? 'We could not confirm delivery before the connection timed out. Your details are still here. Call or text 307-349-4694 to check before retrying.' : 'We could not confirm your request was sent. Your details are still here. Please retry, or call/text 307-349-4694. You can also email windriverrenewal@gmail.com.';
        button.disabled = false; button.textContent = 'Retry quote request'; status.focus();
      } finally { clearTimeout(timeout); pending = false; }
    });
  });
})();
