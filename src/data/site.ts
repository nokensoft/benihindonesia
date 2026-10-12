// Single source of truth for site-wide content used by layouts and pages.

export const site = {
    name: 'Benih Indonesia',
    tagline: 'Better Education. Brighter Future',
    slogan: 'Teach with Compassion. Learn with Determination',
    // Cakupan wilayah operasi
    scope: 'Indonesia, dimulai di Kabupaten Jayapura, Papua.',
    url: 'https://benihindonesia.org',
    email: 'info@benihindonesia.org',
    whatsapp: '6281248133667',
    whatsappDisplay: '+62 812-4813-3667',
    address: {
        street: 'Jl. Kemiri, Hinekombe',
        district: 'Distrik Sentani',
        locality: 'Sentani',
        regency: 'Kabupaten Jayapura',
        region: 'Papua',
        postalCode: '99532',
        country: 'Indonesia',
        countryCode: 'ID',
    },
    geo: {
        latitude: -2.5626944,
        longitude: 140.5025833,
    },
    mapUrl: 'https://maps.app.goo.gl/sesbmXRhExYsGAh17',
    ogImage: '/img/brand/og-image.jpg',
};

export const fullAddress = `${site.address.street}, ${site.address.locality}, ${site.address.regency}, ${site.address.region} ${site.address.postalCode}, ${site.address.country}`;

// Navigasi berbahasa Indonesia; versi Inggris dihasilkan oleh Google Translate.
export const nav = [
    { href: '/', label: 'Beranda' },
    { href: '/about/', label: 'Tentang' },
    { href: '/programmes/', label: 'Program' },
    { href: '/impact/', label: 'Dampak' },
    { href: '/stories/', label: 'Cerita' },
    { href: '/resources/', label: 'Bahan Ajar' },
    { href: '/contact/', label: 'Kontak' },
];

export const cta = { href: '/get-involved/', label: 'Bergabung Bersama Kami' };

// Media sosial resmi organisasi (footer). Isi `href` dengan URL akun; yang masih kosong
// tampil sebagai ikon nonaktif bertanda "segera hadir" (tidak menjadi tautan).
export const social: { id: 'linkedin' | 'instagram' | 'facebook' | 'whatsapp' | 'youtube'; label: string; href: string }[] = [
    { id: 'linkedin', label: 'LinkedIn', href: '' },
    { id: 'instagram', label: 'Instagram', href: '' },
    { id: 'facebook', label: 'Facebook', href: '' },
    { id: 'whatsapp', label: 'Saluran WhatsApp', href: '' },
    { id: 'youtube', label: 'YouTube', href: '' },
];

// Tautan legal di bagian bawah footer
export const legal = [
    { href: '/sitemap/', label: 'Peta Situs' },
    { href: '/disclaimer/', label: 'Disclaimer' },
];

export const orgId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;
