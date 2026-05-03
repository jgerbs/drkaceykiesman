/* ==========================================
   KACEY ND — JS
   ========================================== */

// Mark JS as ready so CSS can key off it if needed
document.documentElement.classList.add('js-ready');

// Auto-update footer year
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- INITIAL VISIBILITY: reveal elements already in viewport on load ---
document.querySelectorAll('[data-animate]').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('is-visible');
    }
});

// --- HEADER: add .scrolled class for frosted glass effect ---
const header = document.getElementById('site-header');

window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// --- SCROLL REVEAL ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('[data-animate]:not(.is-visible)').forEach(el => {
    revealObserver.observe(el);
});

// --- SMOOTH SCROLL: offset for sticky header height ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const offset = header ? header.offsetHeight : 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
});

// --- MARQUEE: pause on reduced motion preference ---
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const track = document.querySelector('.marquee-track');
    if (track) track.style.animationPlayState = 'paused';
}
