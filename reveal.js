/* ==============================================
   Staggered scroll-reveal — universal
   Link reveal.css + reveal.js on any page,
   mark containers with data-reveal-group and
   children with data-reveal. Done.
   ============================================== */

(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var STAGGER_MS = 120;
    var ITEM_MS    = 75;
    var groups = [];

    // Collect groups and hide elements immediately (before first paint)
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
        var children = Array.from(group.querySelectorAll(':scope > [data-reveal]'));
        children.forEach(function (child) { child.classList.add('reveal'); });

        var items = Array.from(group.querySelectorAll('.price-item'));
        items.forEach(function (item) { item.classList.add('reveal'); });

        var listIndex = children.findIndex(function (c) {
            return c.classList.contains('price-list');
        });
        var itemBase = listIndex >= 0 ? listIndex * STAGGER_MS : 0;

        groups.push({ group: group, children: children, items: items, itemBase: itemBase });
    });

    function revealGroup(g) {
        g.children.forEach(function (child, i) {
            child.style.transitionDelay = (i * STAGGER_MS) + 'ms';
            child.classList.add('is-visible');
        });
        g.items.forEach(function (item, i) {
            item.style.transitionDelay = (g.itemBase + i * ITEM_MS) + 'ms';
            item.classList.add('is-visible');
        });
    }

    function setupObservers() {
        groups.forEach(function (g) {
            new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    obs.unobserve(entry.target);
                    // Double rAF: first frame commits the opacity-0 paint,
                    // second frame starts the transition. Single rAF can still
                    // fire before the first paint, causing both states to land
                    // in the same frame with no animation.
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

    // Reset hidden state on leave so back-forward cache restores can re-animate
    window.addEventListener('pagehide', function () {
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.remove('is-visible');
            el.style.transitionDelay = '';
        });
    });

    // pageshow fires on fresh navigation and on back-forward cache restore.
    window.addEventListener('pageshow', function () {
        setupObservers();
    });

}());
