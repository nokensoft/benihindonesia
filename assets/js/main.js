(function () {
    // Mobile navigation toggle
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.getElementById('mobile-menu');
    var header = document.querySelector('[data-site-header]');

    function setMenu(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
        toggle.querySelector('[data-icon-open]').classList.toggle('hidden', open);
        toggle.querySelector('[data-icon-close]').classList.toggle('hidden', !open);
        menu.classList.toggle('hidden', !open);
    }

    function isOpen() {
        return toggle.getAttribute('aria-expanded') === 'true';
    }

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            setMenu(!isOpen());
        });

        // Close on Escape and return focus to the toggle
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) {
                setMenu(false);
                toggle.focus();
            }
        });

        // Close when tapping outside the header
        document.addEventListener('click', function (e) {
            if (isOpen() && header && !header.contains(e.target)) {
                setMenu(false);
            }
        });

        // Close once the desktop navigation takes over
        window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
            if (mq.matches) setMenu(false);
        });
    }

    // Highlight the in-page section currently in view (About page)
    var sectionNav = document.querySelector('[data-section-nav]');
    if (sectionNav) {
        var links = Array.prototype.slice.call(sectionNav.querySelectorAll('a[href^="#"]'));
        var sections = links.map(function (link) {
            return document.getElementById(link.getAttribute('href').slice(1));
        });
        var current = -1;
        var ticking = false;

        function updateActive() {
            ticking = false;
            // A section is active once its top passes just below the sticky nav
            var line = sectionNav.getBoundingClientRect().bottom + 24;
            var index = 0;
            sections.forEach(function (section, i) {
                if (section && section.getBoundingClientRect().top <= line) index = i;
            });
            // At the very bottom, the last section may never reach the line
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                index = sections.length - 1;
            }
            if (index === current) return;
            current = index;
            links.forEach(function (link, i) {
                if (i === index) {
                    link.setAttribute('aria-current', 'true');
                    // Keep the active chip visible in the horizontal strip
                    var strip = link.closest('ul');
                    var offset = link.getBoundingClientRect().left - strip.getBoundingClientRect().left;
                    strip.scrollTo({ left: strip.scrollLeft + offset - 16, behavior: 'smooth' });
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(updateActive);
            }
        }, { passive: true });
        window.addEventListener('resize', updateActive);
        updateActive();
    }

    // Forms have no backend yet: keep them from reloading the page and tell
    // the visitor how to reach us instead. Remove data-static-form and set the
    // form's action once an endpoint exists.
    document.querySelectorAll('form[data-static-form]').forEach(function (form) {
        var status = form.querySelector('[data-form-status]');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!status) return;
            status.innerHTML = 'Terima kasih! Formulir online belum aktif. Untuk sementara, silakan kirim pesan Anda ke ' +
                '<a href="mailto:info@benihindonesia.org" class="font-semibold underline break-all">info@benihindonesia.org</a>.';
            status.classList.remove('hidden');
            status.focus();
        });
    });
})();
