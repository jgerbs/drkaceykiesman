/* ==============================================
   Staggered scroll-reveal — universal
   Link reveal.css + reveal.js on any page,
   mark containers with data-reveal-group and
   children with data-reveal. Done.

   Optional: data-stagger="N" on a group to
   override the default 120ms stagger (ms).
   ============================================== */

(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var STAGGER_MS = 120;
    var groups = [];

    // Collect groups — reveal.css already hides [data-reveal] from first paint
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
        var children = Array.from(group.querySelectorAll(':scope > [data-reveal]'));
        var stagger = parseInt(group.getAttribute('data-stagger'), 10) || STAGGER_MS;
        groups.push({ group: group, children: children, stagger: stagger });
    });

    function revealGroup(g) {
        g.children.forEach(function (child, i) {
            child.style.transitionDelay = (i * g.stagger) + 'ms';
            child.classList.add('is-visible');
        });
    }

    function setupObservers() {
        groups.forEach(function (g) {
            new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    obs.unobserve(entry.target);
                    // Double rAF: first frame commits the opacity-0 paint,
                    // second frame starts the transition.
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            revealGroup(g);
                        });
                    });
                });
            }, {
                threshold: 0.06,
                rootMargin: '0px 0px -48px 0px'
            }).observe(g.group);
        });
    }

    // Reset on bfcache exit so back-forward navigation re-animates
    window.addEventListener('pagehide', function () {
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            el.classList.remove('is-visible');
            el.style.transitionDelay = '';
        });
    });

    window.addEventListener('pageshow', function () {
        setupObservers();
    });

}());
