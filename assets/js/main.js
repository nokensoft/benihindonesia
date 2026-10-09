(function () {
    // Mobile navigation toggle
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.getElementById('mobile-menu');
    var header = document.querySelector('[data-site-header]');

    function setMenu(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
        window.matchMedia('(min-width: 1280px)').addEventListener('change', function (mq) {
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

    // Language switcher powered by Google Translate.
    // The page is written in Indonesian; English is produced on the fly. The
    // choice lives in Google's "googtrans" cookie so it persists across pages,
    // and the Google script is only loaded when a translation is requested.
    var DEFAULT_LANG = 'id';
    var switches = document.querySelectorAll('[data-lang-switch]');

    function currentLang() {
        var match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/;]*\/([^;]+)/);
        return match ? decodeURIComponent(match[1]) : DEFAULT_LANG;
    }

    function cookieDomains() {
        // Google may set the cookie on the host and on the parent domain
        var host = location.hostname;
        var domains = [''];
        if (host) {
            domains.push(host, '.' + host);
            var parts = host.split('.');
            if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
        }
        return domains;
    }

    function writeLangCookie(lang) {
        cookieDomains().forEach(function (domain) {
            var scope = '; path=/' + (domain ? '; domain=' + domain : '');
            document.cookie = lang === DEFAULT_LANG
                ? 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + scope
                : 'googtrans=/' + DEFAULT_LANG + '/' + lang + scope;
        });
    }

    function markLang(lang) {
        switches.forEach(function (group) {
            group.querySelectorAll('[data-lang]').forEach(function (btn) {
                btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang') === lang));
            });
        });
    }

    function loadGoogleTranslate() {
        if (window.__gtLoading) return;
        window.__gtLoading = true;

        var holder = document.createElement('div');
        holder.id = 'google_translate_element';
        holder.className = 'gt-holder';
        holder.setAttribute('aria-hidden', 'true');
        document.body.appendChild(holder);

        window.googleTranslateElementInit = function () {
            new google.translate.TranslateElement({
                pageLanguage: DEFAULT_LANG,
                includedLanguages: 'en,id',
                autoDisplay: false
            }, 'google_translate_element');
        };

        var script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }

    // While Google fetches the translation, show a small status pill so a
    // slow connection does not look like a broken button.
    function showTranslating() {
        var pill = document.createElement('div');
        pill.className = 'notranslate fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] rounded-full bg-stone-900/90 text-white text-sm px-4 py-2 shadow-lg';
        pill.setAttribute('translate', 'no');
        pill.setAttribute('role', 'status');
        pill.textContent = 'Translating to English…';
        document.body.appendChild(pill);

        var root = document.documentElement;
        var observer = new MutationObserver(function () {
            if (/\btranslated-(ltr|rtl)\b/.test(root.className)) finish();
        });
        function finish() {
            observer.disconnect();
            pill.remove();
        }
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        setTimeout(finish, 15000);
    }

    // Google applies the cookie reliably when the page loads, so switching
    // writes the cookie and reloads once (both directions).
    function setLang(lang) {
        if (lang === currentLang()) return;
        writeLangCookie(lang);
        markLang(lang);
        location.reload();
    }

    if (switches.length) {
        var initial = currentLang();
        markLang(initial);
        if (initial !== DEFAULT_LANG) {
            showTranslating();
            loadGoogleTranslate();
        }

        switches.forEach(function (group) {
            group.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-lang]');
                if (btn) setLang(btn.getAttribute('data-lang'));
            });
        });
    }

    // Registration form: compose the answers into a WhatsApp message and open
    // a chat with the number in data-wa-number (wa.me opens the app on phones
    // and WhatsApp Web on desktop).
    document.querySelectorAll('form[data-whatsapp-form]').forEach(function (form) {
        var status = form.querySelector('[data-form-status]');
        var number = form.getAttribute('data-wa-number');

        function field(name) {
            var el = form.elements[name];
            if (!el) return '';
            if (el.tagName === 'SELECT') return el.options[el.selectedIndex].text.trim();
            return el.value.trim();
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var lines = [
                'Halo Benih Indonesia, saya ingin mendaftar melalui website.',
                '',
                'Kategori: ' + field('category'),
                'Nama / Instansi: ' + field('name'),
                'Email: ' + field('email')
            ];
            if (field('phone')) lines.push('Telepon / WhatsApp: ' + field('phone'));
            if (field('notes')) lines.push('', 'Catatan:', field('notes'));

            var url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'));
            var win = window.open(url, '_blank');
            if (win) {
                win.opener = null;
            } else {
                // Pop-up blocked: open WhatsApp in the current tab instead
                window.location.href = url;
            }

            if (status) {
                status.innerHTML = 'WhatsApp sedang dibuka. Silakan tekan <strong>Kirim</strong> di WhatsApp untuk menyelesaikan pendaftaran. ' +
                    'Jika tidak terbuka, <a href="' + url + '" target="_blank" rel="noopener noreferrer" class="font-semibold underline">klik di sini</a>.';
                status.classList.remove('hidden');
                status.focus();
            }
        });
    });
})();
