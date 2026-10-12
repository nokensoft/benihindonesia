// Peta digerakkan scroll: dari seluruh Indonesia memperbesar ke delapan wilayah di Papua.
//
// Markup (lihat src/components/ScrollMap.astro):
//   [data-scroll-map]  data-bbox-start / data-bbox-end = "x0 y0 x1 y1" (satuan peta)
//     [data-map-svg]       <svg> yang viewBox-nya diubah mengikuti scroll
//     [data-map-regencies] batas kabupaten Papua, muncul saat sudah dekat
//     [data-map-target]    wilayah sasaran, data-from / data-to = rentang kemunculan (0..1)
//     [data-map-label]     label, muncul di akhir
//     [data-map-dot]       penanda ber-radius tetap di layar, data-r = radius px
//                          (data-beacon: memudar saat zoom; lainnya mengikuti induknya)
//     [data-map-step]      keterangan bertahap (0, 1, 2)
//
// Tanpa JavaScript atau dengan "reduce motion", peta langsung tampil di keadaan akhir.

export function initScrollMap() {
    var root = document.querySelector('[data-scroll-map]');
    if (!root) return;

    var svg = root.querySelector('[data-map-svg]');
    var regencies = root.querySelector('[data-map-regencies]');
    var targets = Array.prototype.slice.call(root.querySelectorAll('[data-map-target]'));
    var labels = Array.prototype.slice.call(root.querySelectorAll('[data-map-label]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-map-dot]'));
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-map-step]'));
    var progressBar = root.querySelector('[data-map-progress]');
    var stage = root.querySelector('[data-map-stage]');

    var bboxStart = root.getAttribute('data-bbox-start').split(' ').map(Number);
    var bboxEnd = root.getAttribute('data-bbox-end').split(' ').map(Number);
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function fit(b, aspect) {
        var w = b[2] - b[0];
        var h = b[3] - b[1];
        if (w / h < aspect) w = h * aspect;
        else h = w / aspect;
        return { cx: (b[0] + b[2]) / 2, cy: (b[1] + b[3]) / 2, w: w, h: h };
    }

    function clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    function smooth(v, from, to) {
        var t = clamp((v - from) / (to - from), 0, 1);
        return t * t * (3 - 2 * t);
    }

    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // p = kemajuan scroll di dalam section (0..1)
    function progress() {
        var rect = root.getBoundingClientRect();
        var travel = rect.height - stage.getBoundingClientRect().height;
        if (travel <= 0) return 1;
        return clamp(-rect.top / travel, 0, 1);
    }

    function render(p) {
        var box = svg.getBoundingClientRect();
        if (!box.width || !box.height) return;
        var aspect = box.width / box.height;

        // Bagian awal ditahan sebentar (peta Indonesia utuh), akhir ditahan (delapan wilayah)
        var e = ease(clamp((p - 0.12) / 0.7, 0, 1));
        var a = fit(bboxStart, aspect);
        var b = fit(bboxEnd, aspect);
        // Lebar diinterpolasi secara geometrik agar terasa seperti zoom yang rata
        var w = a.w * Math.pow(b.w / a.w, e);
        var h = w / aspect;
        var cx = a.cx + (b.cx - a.cx) * e;
        var cy = a.cy + (b.cy - a.cy) * e;
        svg.setAttribute('viewBox', [cx - w / 2, cy - h / 2, w, h].map(function (n) { return n.toFixed(1); }).join(' '));

        // Satuan peta per piksel layar, agar label dan penanda tetap terbaca
        var s = w / box.width;
        svg.style.setProperty('--s', s.toFixed(4));
        dots.forEach(function (dot) {
            dot.setAttribute('r', (Number(dot.getAttribute('data-r')) * s).toFixed(2));
        });

        if (regencies) regencies.style.opacity = smooth(e, 0.55, 0.95).toFixed(3);
        targets.forEach(function (el) {
            var from = Number(el.getAttribute('data-from'));
            var to = Number(el.getAttribute('data-to'));
            el.style.opacity = smooth(e, from, to).toFixed(3);
        });
        var labelOpacity = smooth(e, 0.82, 1).toFixed(3);
        labels.forEach(function (el) {
            el.style.opacity = labelOpacity;
        });
        // Penanda "jangkar" di Papua (data-beacon) memudar setelah wilayahnya terlihat
        dots.forEach(function (dot) {
            if (dot.hasAttribute('data-beacon')) dot.style.opacity = (1 - smooth(e, 0.5, 0.8)).toFixed(3);
        });

        var step = e < 0.1 ? 0 : e < 0.88 ? 1 : 2;
        steps.forEach(function (el, i) {
            el.setAttribute('data-active', String(i === step));
        });
        if (progressBar) progressBar.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            ticking = false;
            render(reduceMotion ? 1 : progress());
        });
    }

    if (reduceMotion) {
        root.setAttribute('data-static', 'true');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if ('ResizeObserver' in window) new ResizeObserver(onScroll).observe(svg);
    root.setAttribute('data-ready', 'true');
    render(reduceMotion ? 1 : progress());
}
