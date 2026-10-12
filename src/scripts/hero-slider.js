// Slider banner beranda: crossfade, autoplay, tombol sebelumnya/berikutnya,
// titik navigasi, tombol jeda, geser (swipe), dan keyboard.
// Autoplay mati bila pengguna memilih "reduce motion".

export function initHeroSlider() {
    var root = document.querySelector('[data-hero-slider]');
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-slide-dot]'));
    var prev = root.querySelector('[data-slide-prev]');
    var next = root.querySelector('[data-slide-next]');
    var toggle = root.querySelector('[data-slide-toggle]');
    var live = root.querySelector('[data-slide-live]');
    if (slides.length < 2) return;

    var INTERVAL = 7000;
    var index = 0;
    var timer = null;
    var userPaused = false; // dijeda lewat tombol
    var hoverPaused = false; // dijeda karena kursor / fokus
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) userPaused = true;

    function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (slide, n) {
            var active = n === index;
            slide.setAttribute('data-active', String(active));
            slide.setAttribute('aria-hidden', String(!active));
            if (active) slide.removeAttribute('inert');
            else slide.setAttribute('inert', '');
        });
        dots.forEach(function (dot, n) {
            if (n === index) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
        });
    }

    function stop() {
        if (timer) window.clearInterval(timer);
        timer = null;
    }

    function start() {
        stop();
        if (userPaused || hoverPaused || document.hidden) return;
        timer = window.setInterval(function () {
            show(index + 1);
        }, INTERVAL);
    }

    function syncToggle() {
        if (toggle) {
            toggle.setAttribute('aria-pressed', String(userPaused));
            toggle.setAttribute('aria-label', userPaused ? 'Putar otomatis slide' : 'Jeda slide otomatis');
        }
        // Pembaca layar diberi tahu pergantian slide hanya saat autoplay dijeda
        if (live) live.setAttribute('aria-live', userPaused ? 'polite' : 'off');
    }

    function go(i) {
        show(i);
        start(); // mulai ulang hitungan setelah interaksi
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (dot, n) {
        dot.addEventListener('click', function () { go(n); });
    });
    if (toggle) {
        toggle.addEventListener('click', function () {
            userPaused = !userPaused;
            syncToggle();
            start();
        });
    }

    root.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
    root.addEventListener('mouseleave', function () { hoverPaused = false; start(); });
    root.addEventListener('focusin', function () { hoverPaused = true; stop(); });
    root.addEventListener('focusout', function (e) {
        if (!root.contains(e.relatedTarget)) { hoverPaused = false; start(); }
    });
    document.addEventListener('visibilitychange', start);

    // Keyboard: panah kiri/kanan saat fokus berada di dalam banner
    root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { go(index - 1); }
        else if (e.key === 'ArrowRight') { go(index + 1); }
    });

    // Geser di layar sentuh
    var startX = null;
    var startY = null;
    root.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        startX = startY = null;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    show(0);
    syncToggle();
    start();
}
