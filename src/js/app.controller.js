import { initializeCockpit } from './cockpit.controller.js';

const authPanel = document.querySelector('[data-gg-hook="auth-panel"]');
const cockpitShell = document.querySelector('[data-gg-hook="cockpit-shell"]');
const authForm = document.querySelector('[data-gg-action="auth-submit"]');

let initialized = false;

authForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(authForm);
  const email = String(formData.get('email') || '').trim();
  const pin = String(formData.get('pin') || '').trim();

  if (!email || !pin) {
    window.alert('Email dan PIN wajib diisi.');
    return;
  }

  authPanel.hidden = true;
  cockpitShell.hidden = false;

  if (!initialized) {
    await initializeCockpit();
    initialized = true;
  }
});
