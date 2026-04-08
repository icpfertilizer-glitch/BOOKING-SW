// auth-guard.js — Shared authentication guard and user display logic
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { $, $$, safeFirstLetter } from "./utils.js";

const DEFAULT_ROLE = 'viewer';

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return { name: 'ผู้ใช้', role: DEFAULT_ROLE };
  const data = snap.data() || {};
  const role = (typeof data.role === 'string' ? data.role : DEFAULT_ROLE).toLowerCase();
  const name = (typeof data.name === 'string' && data.name) ? data.name : 'ผู้ใช้';
  return { name, role };
}

export function applyUserDisplay(name) {
  const display = (typeof name === 'string' && name) ? name : 'ผู้ใช้';
  const nameEl = $('#userDisplayName');
  if (nameEl) nameEl.textContent = display;
  const menuNameEl = $('#menuUserName');
  if (menuNameEl) menuNameEl.textContent = display;
  const avatar = document.querySelector('.avatar-circle');
  if (avatar) avatar.textContent = safeFirstLetter(display);
}

export function applyRoleToUI(role) {
  document.documentElement.setAttribute('data-role', role);
  $$('[data-required-role]').forEach(el => {
    const allowed = (el.getAttribute('data-required-role') || '').split(',').map(s => s.trim().toLowerCase());
    el.style.display = allowed.includes(role) ? '' : 'none';
  });
}

/**
 * Initialize auth guard.
 * @param {function} onAuthenticated - callback(user, name, role) called when user is authenticated
 */
export function initAuthGuard(onAuthenticated) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    // รอให้ menu.js โหลด partials เสร็จก่อน (ถ้ามี)
    if (window.__menuReady) {
      await window.__menuReady;
    }

    const { name, role } = await getUserData(user.uid);
    window.currentUser = { user, role, name };
    applyUserDisplay(name);
    applyRoleToUI(role);

    const btnLogout = $('#btnLogout');
    if (btnLogout && !btnLogout._bound) {
      btnLogout._bound = true;
      btnLogout.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
      });
    }

    if (onAuthenticated) onAuthenticated(user, name, role);
  });
}
