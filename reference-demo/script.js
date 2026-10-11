(() => {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');
  const form = document.getElementById('demoForm');
  const formStatus = document.getElementById('formStatus');
  const dialog = document.getElementById('lightbox');
  const dialogImage = document.getElementById('lightboxImage');
  const closeButton = document.getElementById('lightboxClose');

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 35);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      });
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      }
    });
  }

  if (form && formStatus) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = String(new FormData(form).get('name') || '').trim();
      const interest = String(new FormData(form).get('interest') || 'sample').trim();
      formStatus.textContent = 'Demo preview only' + (name ? ' for ' + name : '') + ': "' + interest + '". No data was sent or saved.';
    });
  }

  if (dialog && dialogImage) {
    document.querySelectorAll('.gallery-item[data-image]').forEach((item) => {
      item.addEventListener('click', () => {
        dialogImage.src = item.dataset.image;
        dialogImage.alt = item.querySelector('img')?.alt || 'Expanded sample gallery image';
        if (typeof dialog.showModal === 'function') dialog.showModal();
      });
    });
    const closeDialog = () => {
      if (dialog.open) dialog.close();
      dialogImage.removeAttribute('src');
    };
    if (closeButton) closeButton.addEventListener('click', closeDialog);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener('close', () => dialogImage.removeAttribute('src'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') dialogImage.removeAttribute('src');
    });
  }
})();