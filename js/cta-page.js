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
    status.textContent = 'Please complete the required details before continuing.';
    status.className = 'form-status error';
    return;
  }

  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const interest = String(formData.get('interest') || '').trim();
  const query = String(formData.get('query') || '').trim();

  const message = [
    'New Website Enquiry — Shri Kanha Upvan Valley',
    '',
    'Name: ' + name,
    'Email: ' + email,
    'Contact Number: ' + phone,
    'Preferred Location: ' + (location || 'Not provided'),
    'Interested In: ' + interest,
    'Specific Query: ' + (query || 'Not provided'),
    '',
    'Submitted via the website enquiry form.'
  ].join('\n');

  const whatsappUrl = 'https://wa.me/917977915800?text=' + encodeURIComponent(message);

  status.textContent = 'Opening WhatsApp with your enquiry details. Please tap Send in WhatsApp to submit your enquiry.';
  status.className = 'form-status success';

  // Open synchronously from the form submit interaction so mobile browsers are
  // more likely to hand the link to WhatsApp; fall back to the current tab if blocked.
  const whatsappWindow = window.open(whatsappUrl, '_blank');
  if (whatsappWindow) {
    whatsappWindow.opener = null;
  } else {
    window.location.href = whatsappUrl;
  }
});
