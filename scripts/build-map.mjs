// Menghasilkan src/data/map.ts (path SVG) dari GeoJSON batas administrasi.
//
//   node scripts/build-map.mjs
//
// Sumber : https://github.com/mashadinoor/Indonesia-Geojson-2026 (MIT; data BIG)
// Hasil  : peta Indonesia (38 provinsi) + kabupaten/kota di enam provinsi Papua.
// Berkas hasil di-commit, jadi skrip ini hanya dijalankan bila data perlu diperbarui.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BASE = 'https://raw.githubusercontent.com/mashadinoor/Indonesia-Geojson-2026/main';
const OUT = fileURLToPath(new URL('../src/data/map.ts', import.meta.url));

// Proyeksi sederhana (plate carree). Indonesia berada di sekitar ekuator,
// sehingga distorsinya kecil. 1 satuan SVG = 0,01 derajat.
const SCALE = 100;
const LON0 = 94;
const LAT0 = 6.5;
const project = ([lon, lat]) => [Math.round((lon - LON0) * SCALE), Math.round((LAT0 - lat) * SCALE)];

const PROVINCES = [
    'Aceh', 'Bali', 'Banten', 'Bengkulu', 'DKI_Jakarta', 'Daerah_Istimewa_Yogyakarta', 'Gorontalo', 'Jambi',
    'Jawa_Barat', 'Jawa_Tengah', 'Jawa_Timur', 'Kalimantan_Barat', 'Kalimantan_Selatan', 'Kalimantan_Tengah',
    'Kalimantan_Timur', 'Kalimantan_Utara', 'Kepulauan_Bangka_Belitung', 'Kepulauan_Riau', 'Lampung', 'Maluku',
    'Maluku_Utara', 'Nusa_Tenggara_Barat', 'Nusa_Tenggara_Timur', 'Papua', 'Papua_Barat', 'Papua_Barat_Daya',
    'Papua_Pegunungan', 'Papua_Selatan', 'Papua_Tengah', 'Riau', 'Sulawesi_Barat', 'Sulawesi_Selatan',
    'Sulawesi_Tengah', 'Sulawesi_Tenggara', 'Sulawesi_Utara', 'Sumatera_Barat', 'Sumatera_Selatan', 'Sumatera_Utara',
];

const PAPUA_PROVINCES = ['Papua', 'Papua_Barat', 'Papua_Barat_Daya', 'Papua_Pegunungan', 'Papua_Selatan', 'Papua_Tengah'];

// Delapan wilayah sasaran. role: start (2026, biru), city (2026, coklat muda), next (2028, kuning)
const TARGETS = {
    'Papua/Kabupaten_Jayapura': { name: 'Kabupaten Jayapura', role: 'start' },
    'Papua/Kota_Jayapura': { name: 'Kota Jayapura', role: 'city' },
    'Papua/Kabupaten_Biak_Numfor': { name: 'Kabupaten Biak Numfor', role: 'next' },
    'Papua/Kabupaten_Sarmi': { name: 'Kabupaten Sarmi', role: 'next' },
    'Papua/Kabupaten_Kepulauan_Yapen': { name: 'Kabupaten Kepulauan Yapen', role: 'next' },
    'Papua_Tengah/Kabupaten_Nabire': { name: 'Kabupaten Nabire', role: 'next' },
    'Papua_Selatan/Kabupaten_Merauke': { name: 'Kabupaten Merauke', role: 'next' },
    'Papua_Barat/Kabupaten_Fak_Fak': { name: 'Kabupaten Fakfak', role: 'next' },
};

async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
}

function polygonsOf(geojson) {
    const out = [];
    for (const f of geojson.features ?? []) {
        const g = f.geometry;
        if (!g) continue;
        if (g.type === 'Polygon') out.push(g.coordinates);
        else if (g.type === 'MultiPolygon') out.push(...g.coordinates);
    }
    return out; // array of polygons; polygon = array of rings
}

function ringArea(ring) {
    let a = 0;
    for (let i = 0; i < ring.length; i++) {
        const [x1, y1] = ring[i];
        const [x2, y2] = ring[(i + 1) % ring.length];
        a += x1 * y2 - x2 * y1;
    }
    return a / 2;
}

function ringPath(ring) {
    const pts = [];
    let last = '';
    for (const c of ring) {
        const [x, y] = project(c);
        const key = `${x} ${y}`;
        if (key !== last) pts.push(key);
        last = key;
    }
    // Buang titik penutup yang sama dengan titik awal
    if (pts.length > 1 && pts[0] === pts[pts.length - 1]) pts.pop();
    return pts.length >= 3 ? `M${pts.join(' ')}Z` : '';
}

function pathOf(polygons) {
    return polygons.map((poly) => poly.map(ringPath).join('')).join('');
}

function geometryInfo(polygons) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let best = null;
    for (const poly of polygons) {
        const outer = poly[0].map(project);
        for (const [x, y] of outer) {
            minX = Math.min(minX, x); minY = Math.min(minY, y);
            maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
        const area = Math.abs(ringArea(outer));
        if (!best || area > best.area) best = { area, outer };
    }
    // Titik label: pusat bounding box poligon terbesar
    let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
    for (const [x, y] of best.outer) {
        bx0 = Math.min(bx0, x); by0 = Math.min(by0, y);
        bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
    }
    return {
        bbox: [minX, minY, maxX, maxY],
        center: [Math.round((bx0 + bx1) / 2), Math.round((by0 + by1) / 2)],
    };
}

// Daftar berkas kabupaten/kota untuk enam provinsi Papua
const tree = await getJson('https://api.github.com/repos/mashadinoor/Indonesia-Geojson-2026/git/trees/main?recursive=1');
const regencyFiles = tree.tree
    .map((t) => t.path)
    .filter((p) => p.endsWith('.json') && PAPUA_PROVINCES.some((prov) => p.startsWith(`Kabupaten/${prov}/`)));

console.log(`Mengunduh ${PROVINCES.length} provinsi dan ${regencyFiles.length} kabupaten/kota ...`);

const provinceGeo = await Promise.all(PROVINCES.map((p) => getJson(`${BASE}/Provinsi/${p}.json`)));
const regencyGeo = await Promise.all(regencyFiles.map((p) => getJson(`${BASE}/${encodeURI(p)}`)));

// Peta dasar: seluruh provinsi (satu path, satu warna)
const indonesiaPath = provinceGeo.map((g) => pathOf(polygonsOf(g))).join('');
// Siluet enam provinsi Papua (latar banner di beranda)
const papuaPath = provinceGeo
    .filter((_, i) => PAPUA_PROVINCES.includes(PROVINCES[i]))
    .map((g) => pathOf(polygonsOf(g)))
    .join('');

// Batas Indonesia (untuk viewBox awal)
let ix0 = Infinity, iy0 = Infinity, ix1 = -Infinity, iy1 = -Infinity;
for (const g of provinceGeo) {
    for (const poly of polygonsOf(g)) {
        for (const [x, y] of poly[0].map(project)) {
            ix0 = Math.min(ix0, x); iy0 = Math.min(iy0, y);
            ix1 = Math.max(ix1, x); iy1 = Math.max(iy1, y);
        }
    }
}

const regencies = [];
const targets = [];
regencyFiles.forEach((file, i) => {
    const polygons = polygonsOf(regencyGeo[i]);
    if (!polygons.length) return;
    const key = file.replace(/^Kabupaten\//, '').replace(/\.json$/, '');
    const d = pathOf(polygons);
    const target = TARGETS[key];
    if (target) {
        targets.push({ id: key.split('/')[1].toLowerCase().replace(/_/g, '-'), ...target, d, ...geometryInfo(polygons) });
    } else {
        regencies.push(d);
    }
});

const missing = Object.keys(TARGETS).filter((k) => !regencyFiles.includes(`Kabupaten/${k}.json`));
if (missing.length) throw new Error(`Wilayah sasaran tidak ditemukan: ${missing.join(', ')}`);

// Batas gabungan delapan wilayah sasaran
const tb = targets.reduce(
    (b, t) => [Math.min(b[0], t.bbox[0]), Math.min(b[1], t.bbox[1]), Math.max(b[2], t.bbox[2]), Math.max(b[3], t.bbox[3])],
    [Infinity, Infinity, -Infinity, -Infinity],
);

const header = `// DIHASILKAN OTOMATIS oleh scripts/build-map.mjs. Jangan diedit manual.
// Sumber data: github.com/mashadinoor/Indonesia-Geojson-2026 (MIT; data BIG).
// Koordinat: 1 satuan = 0,01 derajat; x = (bujur - ${LON0}) * ${SCALE}, y = (${LAT0} - lintang) * ${SCALE}.
`;

const body = `
export type MapRole = 'start' | 'city' | 'next';

export interface MapTarget {
    id: string;
    name: string;
    role: MapRole;
    d: string;
    bbox: [number, number, number, number];
    center: [number, number];
}

export const mapBounds = {
    indonesia: [${ix0}, ${iy0}, ${ix1}, ${iy1}] as [number, number, number, number],
    targets: [${tb.join(', ')}] as [number, number, number, number],
};

/** Seluruh provinsi Indonesia dalam satu path. */
export const indonesiaPath = ${JSON.stringify(indonesiaPath)};

/** Siluet enam provinsi Papua (tanpa batas kabupaten). */
export const papuaPath = ${JSON.stringify(papuaPath)};

/** Kabupaten/kota lain di enam provinsi Papua (batas tipis saat diperbesar). */
export const papuaRegencyPath = ${JSON.stringify(regencies.join(''))};

/** Delapan wilayah sasaran Benih Indonesia. */
export const mapTargets: MapTarget[] = ${JSON.stringify(targets, null, 4)};
`;

await writeFile(OUT, header + body);
const kb = ((header.length + body.length) / 1024).toFixed(0);
console.log(`Selesai: ${OUT} (${kb} KB)`);
for (const t of targets) console.log(`  ${t.role.padEnd(5)} ${t.name.padEnd(28)} bbox=${t.bbox.join(',')} center=${t.center.join(',')}`);
console.log('Indonesia', [ix0, iy0, ix1, iy1].join(','), 'Targets', tb.join(','));
console.log(`Ukuran path (KB): indonesia=${(indonesiaPath.length / 1024).toFixed(0)} papua=${(papuaPath.length / 1024).toFixed(0)} kabupaten=${(regencies.join('').length / 1024).toFixed(0)} sasaran=${(targets.reduce((n, t) => n + t.d.length, 0) / 1024).toFixed(0)}`);
