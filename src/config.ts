// ============================================================================
// ONE place to change the business identity. Everything on the site reads from
// here: name, phone, WhatsApp, Instagram, email, address, service areas.
// Working name until the final business name is chosen (see docs/NAME-OPTIONS.md).
// ============================================================================
export const SITE = {
  name: "RK Bridal Studio",
  shortName: "RK Bridal",
  tagline: "Bridal & Groom Makeup Artistry",
  // Public URL. Switch to the custom domain once it is bought and attached.
  url: "https://rk-bridal.zeabyte.workers.dev",
  city: "Jalandhar",
  state: "Punjab",
  country: "India",
  // Phone + WhatsApp. PLACEHOLDER until the real number is supplied —
  // WhatsApp links will not reach anyone until this is a real number.
  phoneDisplay: "+91 98XXX XXXXX",
  phoneE164: "+919800000000",
  whatsappNumber: "919800000000", // digits only, country code first
  email: "hello@rkbridalstudio.in", // PLACEHOLDER
  instagram: "https://www.instagram.com/", // PLACEHOLDER — add the real profile URL
  instagramHandle: "@rkbridalstudio",
  foundedYear: 2026,
  baseLine: "Based in Jalandhar · travelling across Punjab",
  hours: "Mon–Sun 8:00 am – 9:00 pm (wedding days: any hour)",
  // Google Analytics 4 measurement id — leave empty to disable.
  ga4: "",
} as const;

export const WHATSAPP_URL = (text = "Hi! I would like to enquire about bridal makeup.") =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
