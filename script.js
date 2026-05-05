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

// --- BACK TO TOP ---
document.querySelectorAll('.back-to-top').forEach(btn => {
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});

// --- MARQUEE: pause on reduced motion preference ---
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const track = document.querySelector('.marquee-track');
    if (track) track.style.animationPlayState = 'paused';
}



document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const submitBtn = document.getElementById("contact-submit");

    const fields = {
        name: document.getElementById("contact-name"),
        email: document.getElementById("contact-email"),
        message: document.getElementById("contact-message")
    };

    /* ================= VALIDATION ================= */
    function isValidEmail(value) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
    }

    function setFieldError(field) {
        field.classList.add("field-error");
        field.setAttribute("aria-invalid", "true");
    }

    function clearFieldError(field) {
        field.classList.remove("field-error");
        field.removeAttribute("aria-invalid");
    }

    function clearAllErrors() {
        Object.values(fields).forEach(clearFieldError);
    }

    function validateField(field, soft = false) {
        const value = field.value.trim();

        if (!value) {
            if (!soft) setFieldError(field);
            return false;
        }

        if (field.type === "email" && !isValidEmail(value)) {
            setFieldError(field);
            return false;
        }

        clearFieldError(field);
        return true;
    }

    /* ================= REAL-TIME ================= */
    Object.values(fields).forEach(field => {
        field.addEventListener("input", () => validateField(field, true));
        field.addEventListener("blur", () => validateField(field));
    });

    /* ================= BUTTON STATES ================= */
    function setButtonState(state) {
        submitBtn.classList.remove("is-sending", "is-success", "is-error", "is-invalid");

        switch (state) {
            case "sending":
                submitBtn.disabled = true;
                submitBtn.textContent = "Sending...";
                submitBtn.classList.add("is-sending");
                break;

            case "success":
                submitBtn.disabled = true;
                submitBtn.textContent = "Sent!";
                submitBtn.classList.add("is-success");
                break;

            case "error":
                submitBtn.disabled = false;
                submitBtn.textContent = "Try Again";
                submitBtn.classList.add("is-error");
                break;

            case "invalid":
                submitBtn.disabled = false;
                submitBtn.textContent = "Fill Required Fields";
                submitBtn.classList.add("is-invalid");

                // 🔥 THIS is what you're missing
                setTimeout(() => {
                    if (submitBtn.classList.contains("is-invalid")) {
                        setButtonState("idle");
                    }
                }, 2500); // ⬅️ slow readable timing (2.5s)

                break;

            case "email-invalid":
                submitBtn.disabled = false;
                submitBtn.textContent = "Enter Valid Email";
                submitBtn.classList.add("is-invalid");

                setTimeout(() => {
                    if (submitBtn.classList.contains("is-invalid")) {
                        setButtonState("idle");
                    }
                }, 2500);
                break;

            default: // idle
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Message";
                break;
        }
    }

    /* ================= SUBMIT ================= */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        clearAllErrors();

        const name = fields.name.value.trim();
        const email = fields.email.value.trim();
        const message = fields.message.value.trim();

        let hasError = false;

        let hasEmptyError = false;
        let hasEmailError = false;

        if (!name) {
            setFieldError(fields.name);
            hasEmptyError = true;
        }

        if (!email) {
            setFieldError(fields.email);
            hasEmptyError = true;
        } else if (!isValidEmail(email)) {
            setFieldError(fields.email);
            hasEmailError = true;
        }

        if (!message) {
            setFieldError(fields.message);
            hasEmptyError = true;
        }

        /* 🔥 Decide message priority */
        if (hasEmailError) {
            setButtonState("email-invalid");
            return;
        }

        if (hasEmptyError) {
            setButtonState("invalid");
            return;
        }

        setButtonState("sending");

        try {
            await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" }
            });

            form.reset();
            setButtonState("success");

            setTimeout(() => setButtonState("idle"), 1800);

        } catch (err) {
            console.error(err);
            setButtonState("error");

            setTimeout(() => setButtonState("idle"), 2200);
        }
    });
});