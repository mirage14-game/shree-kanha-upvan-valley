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

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    status.textContent = 'Please complete the required details before submitting.';
    status.className = 'form-status error';
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = 'Sending enquiry…';
  status.textContent = 'Sending your enquiry securely. Please wait.';
  status.className = 'form-status';

  try {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch('/api/enquiry.mjs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (result.emailSent && result.whatsappSent) {
      status.textContent = 'Thank you! Your enquiry has been sent to the company by email and WhatsApp.';
      status.className = 'form-status success';
      form.reset();
    } else if (result.emailSent && !result.whatsappConfigured) {
      status.textContent = 'Your enquiry email was sent. WhatsApp notifications still need to be configured by the website administrator.';
      status.className = 'form-status success';
      form.reset();
    } else if (result.emailSent && result.whatsappSent === false) {
      status.textContent = 'Your enquiry email was sent, but the WhatsApp notification failed. Please contact the company directly to ensure they receive your request.';
      status.className = 'form-status error';
      form.reset();
    } else {
      throw new Error(result.error || 'Your enquiry could not be sent. Please try again.');
    }
  } catch (error) {
    status.textContent = error.message || 'We could not send your enquiry. Please try again or contact the company directly.';
    status.className = 'form-status error';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});
