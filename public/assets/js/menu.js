// menu.js — โหลด navbar + sidebar จาก partials แล้วผูก events
(() => {
  async function loadPartials() {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

    if (navPlaceholder) {
      try {
        const res = await fetch('partials/navbar.html');
        if (res.ok) navPlaceholder.outerHTML = await res.text();
      } catch(_) {}
    }

    if (sidebarPlaceholder) {
      try {
        const res = await fetch('partials/sidebar.html');
        if (res.ok) sidebarPlaceholder.outerHTML = await res.text();
      } catch(_) {}
    }
  }

  function initMenu() {
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
        const parent = btn.closest('.menu-dropdown');
        parent?.classList.toggle('open');
      });
    });

    // MutationObserver สำหรับ sync ชื่อ
    if (topUserEl) {
      const obs = new MutationObserver(syncUserName);
      obs.observe(topUserEl, { characterData: true, childList: true, subtree: true });
    }

    syncUserName();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await loadPartials();
    initMenu();
  });
})();
