const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const form = document.getElementById('enquiryForm');
const status = document.getElementById('formStatus');

function updateHeader(){ header.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', updateHeader, {passive:true});
updateHeader();

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
}));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    status.textContent = 'Please complete the required details before submitting.';
    status.className = 'form-status error';
    return;
  }
  status.textContent = 'Thank you. Your enquiry has been captured for follow-up.';
  status.className = 'form-status success';
  form.reset();
});
