// menu.js — โหลด navbar + sidebar จาก partials แล้วผูก events
// window.__menuReady เป็น Promise ที่หน้าอื่นสามารถ await ได้
window.__menuReady = (async () => {
  // รอ DOM พร้อม
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r));
  }

  // โหลด partials
  const navPlaceholder = document.getElementById('navbar-placeholder');
  const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

  if (navPlaceholder) {
    try {
      const res = await fetch('partials/navbar.html');
      if (res.ok) navPlaceholder.outerHTML = await res.text();
      else console.warn('[menu.js] navbar partial failed:', res.status);
    } catch(e) { console.warn('[menu.js] navbar fetch error:', e); }
  }

  if (sidebarPlaceholder) {
    try {
      const res = await fetch('partials/sidebar.html');
      if (res.ok) sidebarPlaceholder.outerHTML = await res.text();
      else console.warn('[menu.js] sidebar partial failed:', res.status);
    } catch(e) { console.warn('[menu.js] sidebar fetch error:', e); }
  }

  // ผูก events หลังโหลดเสร็จ
  const menuBtn   = document.getElementById('menuFab');
  const menuClose = document.getElementById('menuClose');
  const menuOv    = document.getElementById('menuOverlay');
  const topUserEl = document.getElementById('userDisplayName');
  const sideUserEl = document.getElementById('menuUserName');
  const avatarEl = document.querySelector('.avatar-circle');

  function syncUserName() {
    if (!sideUserEl) return;
    const name = (topUserEl?.textContent || '').trim();
    const display = name || 'ผู้ใช้';
    sideUserEl.textContent = display;
    if (avatarEl) avatarEl.textContent = display.charAt(0).toUpperCase();
  }

  function openMenu() {
    if (!menuOv) return;
    menuOv.classList.add('show');
    document.documentElement.style.overflow = 'hidden';
    syncUserName();
  }

  function closeMenu() {
    if (!menuOv) return;
    menuOv.classList.remove('show');
    document.documentElement.style.overflow = '';
  }

  menuBtn?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  menuOv?.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-drawer')) closeMenu();
  });

  // dropdown ภายในเมนู
  document.querySelectorAll('.menu-dropdown > .menu-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.menu-dropdown')?.classList.toggle('open');
    });
  });

  if (topUserEl) {
    const obs = new MutationObserver(syncUserName);
    obs.observe(topUserEl, { characterData: true, childList: true, subtree: true });
  }

  syncUserName();

  // ===== Page transition: intercept menu links =====
  document.querySelectorAll('a.menu-link[href], .navbar a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // ข้ามลิงก์ที่เป็น # หรือ javascript: หรือ dropdown button
    if (!href || href === '#' || href.startsWith('javascript:') || link.closest('.menu-dropdown > .menu-link')) return;

    link.addEventListener('click', (e) => {
      // ถ้าเป็นหน้าเดียวกันไม่ต้อง animate
      const current = location.pathname.split('/').pop().replace(/\.html$/, '');
      const target = href.replace(/\.html$/, '');
      if (current === target) return;

      e.preventDefault();
      closeMenu();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 300);
    });
  });
})();
