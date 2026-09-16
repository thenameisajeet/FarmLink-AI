/* ===========================================================
   FarmLink AI — Shared utilities (theme, toast, mobile menu, storage)
   Loaded on every portal (farmer / vendor / consumer)
   =========================================================== */

/* ---------- Theme (dark/light) ---------- */
const FL_THEME_KEY = 'farmlink-theme';

function flApplyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(FL_THEME_KEY, theme);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.innerHTML = theme === 'light' ? FL_ICONS.moon : FL_ICONS.sun;
}

function flToggleTheme(){
  const current = localStorage.getItem(FL_THEME_KEY) || 'dark';
  flApplyTheme(current === 'dark' ? 'light' : 'dark');
}

function flInitTheme(){
  const saved = localStorage.getItem(FL_THEME_KEY) || 'dark';
  flApplyTheme(saved);
}

const FL_ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
};

/* ---------- Toasts ---------- */
function flToast(message, type){
  let stack = document.querySelector('.toast-stack');
  if (!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .25s, transform .25s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 250);
  }, 2800);
}

/* ---------- Mobile menu ---------- */
function flToggleMobileMenu(){
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}
function flCloseMobileMenu(){
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.mobile-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

/* ---------- Storage helpers (JSON-safe) ---------- */
const flStore = {
  get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* ---------- Modal helpers ---------- */
function flOpenModal(id){
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function flCloseModal(id){
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

/* ---------- Init common bindings on DOM ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  flInitTheme();

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) themeBtn.addEventListener('click', flToggleTheme);

  const hamburger = document.getElementById('hamburgerBtn');
  if (hamburger) hamburger.addEventListener('click', flToggleMobileMenu);

  const overlay = document.querySelector('.mobile-overlay');
  if (overlay) overlay.addEventListener('click', flCloseMobileMenu);

  // Close any modal by clicking its overlay background
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) ov.classList.remove('open');
    });
  });

  if (window.lucide) lucide.createIcons();
});
