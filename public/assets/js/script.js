// Mobile nav toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => {
const isOpen = !mobileMenu.classList.contains('hidden');
mobileMenu.classList.toggle('hidden');
menuToggle.setAttribute('aria-expanded', String(!isOpen));
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

// Sticky mobile CTA bar — appears after hero
const stickyBar = document.getElementById('sticky-mobile-cta');
const heroBottom = document.querySelector('main > section').offsetHeight;
window.addEventListener('scroll', () => {
if (window.scrollY > heroBottom) {
    stickyBar.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-full');
} else {
    stickyBar.classList.add('opacity-0', 'pointer-events-none', 'translate-y-full');
}
}, { passive: true });

// Lead form — submit via AJAX to process-lead.php
const leadForm     = document.getElementById('vmk-lead-form');
const feedbackBox  = document.getElementById('form-feedback');
const submitBtn    = document.getElementById('form-submit-btn');
const submitLabel  = document.getElementById('form-submit-label');

function showFeedback(message, isSuccess) {
feedbackBox.textContent = message;
feedbackBox.classList.remove('hidden', 'bg-green-50', 'text-green-700', 'bg-red-50', 'text-red-700');
feedbackBox.classList.add(isSuccess ? 'bg-green-50' : 'bg-red-50', isSuccess ? 'text-green-700' : 'text-red-700');
}

if (leadForm) {
leadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic client-side check before we even hit the server
    const name  = leadForm.querySelector('#name').value.trim();
    const phone = leadForm.querySelector('#phone').value.trim();
    if (!name || !phone) {
    showFeedback('Please fill in your name and phone number.', false);
    return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = 'Sending…';
    feedbackBox.classList.add('hidden');

    fetch('process-lead.php', {
        method: 'POST',
        body: new FormData(leadForm),
    })
    .then((res) => res.json())
    .then((data) => {
        showFeedback(data.message, data.success);
        if (data.success) {
        leadForm.reset();
        }
    })
    .catch(() => {
        showFeedback('Something went wrong. Please try again or WhatsApp us directly.', false);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitLabel.textContent = 'Get My Free Consultation';
    });
});
}

// Reveal-on-scroll (single subtle pass, not per-card)
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    entry.target.classList.add('in');
    io.unobserve(entry.target);
    }
});
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));