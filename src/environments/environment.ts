export const environment = {
  production: true,
  apiUrl: 'https://api.samts.app/api',

  // ─── CDN de assets estáticos (Cloudinary) ───────────────────────────────────
  // cloud_name de tu cuenta. Sube las imágenes a Cloudinary conservando su
  // public_id (ej. boutique/product-8-v2.png) para que `cdnUrl()` arme la URL.
  // Si se deja vacío, la app sigue sirviendo los archivos locales de public/.
  cloudinaryCloudName: '',

  // ─── Analytics & Tracking ───────────────────────────────────────────────────
  // Fill these in when you have the real IDs from each platform.
  // Leave empty strings for platforms not yet configured.

  // Google Analytics 4
  gaId: '', // e.g. 'G-XXXXXXXXXX'

  // Meta Pixel (Facebook / Instagram Ads)
  metaPixelId: '', // e.g. '123456789012345'

  // Google Ads
  googleAdsId: '', // e.g. 'AW-XXXXXXXXX'
  googleAdsConversionLabel: '', // e.g. 'abc123DEF456'

  // Lead Magnet PDF URL (served from Angular public folder)
  leadMagnetPdfUrl: '/assets/pdf/de-instagram-a-ventas.pdf',

  // WhatsApp number for diagnostic flow CTA
  whatsappNumber: '3148180949', // Replace with real number
};
