export const environment = {
  production: true,
  apiUrl: 'http://localhost:3001/api', // Change this to your production API URL

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
