// Single source of truth for site-wide content used by layouts and pages.

export const site = {
    name: 'Benih Indonesia',
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

// Navigation stays in English and is excluded from Google Translate.
export const nav = [
    { href: '/', label: 'Home' },
    { href: '/about/', label: 'About Us' },
    { href: '/programmes/', label: 'Programmes' },
    { href: '/impact/', label: 'Impact' },
    { href: '/stories/', label: 'Stories' },
    { href: '/resources/', label: 'Resources' },
    { href: '/contact/', label: 'Contact' },
];

export const cta = { href: '/get-involved/', label: 'Get Involved' };

export const orgId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;
