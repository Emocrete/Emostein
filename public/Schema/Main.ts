export function fSchemaMain({ fCanonicalUrl, fSiteUrl }) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "قياس مسافة الصيدليات",
        "provider": {
            "@type": "Organization",
            "name": "Emocrete",
            "url": fSiteUrl,
        },
        "areaServed": "EG",
        "serviceType": "Pharmacy distance measurement",
        "inLanguage": "ar",
        "url": fCanonicalUrl,
    };
}