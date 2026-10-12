// Efek antarmuka ringan: muncul saat di-scroll (blur reveal / slide-up) dan flip card.

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    function show(el) {
        el.classList.add('is-revealed');
    }

    // Tanpa IntersectionObserver atau dengan "reduce motion": tampilkan langsung
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        items.forEach(show);
        return;
    }

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                show(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach(function (el) {
        observer.observe(el);
    });
}

export function initFlipCards() {
    document.querySelectorAll('.flip-card').forEach(function (card) {
        card.addEventListener('click', function () {
            var pressed = card.getAttribute('aria-pressed') === 'true';
            card.setAttribute('aria-pressed', String(!pressed));
        });
    });
}
