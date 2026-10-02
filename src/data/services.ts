export interface Service {
  slug: string;
  title: string;
  short: string;
  image: string; // key in public/images (without -sm/.webp)
  href: string;
  includes: string[];
}

export const services: Service[] = [
  {
    slug: "bridal-makeup",
    title: "Bridal Makeup",
    short: "HD and airbrush bridal looks that last from the morning Anand Karaj or pheras right through the doli — with hair and dupatta setting.",
    image: "bridal-closeup",
    href: "/bridal-makeup/",
    includes: ["Skin prep + primer", "HD or airbrush base", "Eyes, lashes, contour, lips", "Bridal hairstyle", "Dupatta / chunni setting", "Touch-up kit for the day"],
  },
  {
    slug: "groom-makeup",
    title: "Groom Makeup & Grooming",
    short: "Natural, camera-ready grooming for the groom: skin, beard, hair (dastaar-friendly) and a finish nobody can tell is makeup.",
    image: "groom-sherwani-dark",
    href: "/groom-makeup/",
    includes: ["Skin prep + light HD base", "Under-eye + blemish correction", "Beard shaping + hair styling", "Sehra / turban-friendly finish", "Pre-wedding + reception options"],
  },
  {
    slug: "engagement-reception",
    title: "Engagement & Reception",
    short: "Soft-glam for the ring ceremony, bold evening glamour for the reception — each look designed for the outfit and the venue lighting.",
    image: "couple-reception",
    href: "/services/#engagement",
    includes: ["Look design around your outfit", "Flash-tested finish for photos", "Hair + draping", "Family makeup add-ons"],
  },
  {
    slug: "pre-wedding",
    title: "Pre-wedding, Roka & Sagan",
    short: "Fresh, natural makeup for the pre-wedding shoot, the roka and the sagan — the first family moments deserve a polished look too.",
    image: "couple-engagement",
    href: "/services/#pre-wedding",
    includes: ["Natural coverage", "Outdoor-shoot friendly", "Quick change looks", "Hair styling"],
  },
  {
    slug: "mehndi-sangeet",
    title: "Mehndi, Sangeet & Haldi",
    short: "Dewy, festive looks for the fun events — sweat-proof for a night of giddha and bhangra, and haldi-safe skin prep.",
    image: "giddha-sangeet",
    href: "/services/#mehndi-sangeet",
    includes: ["Long-wear festive makeup", "Floral + open hairstyles", "Family + bridesmaids", "On-site touch-ups"],
  },
  {
    slug: "hair-styling",
    title: "Bridal Hair Styling",
    short: "Our founder started as a hair artist — braids, buns, floral paranda, soft waves and jooda styles built to hold a heavy dupatta all day.",
    image: "hair-floral-braid",
    href: "/services/#hair",
    includes: ["Bridal buns + braids", "Floral + paranda styling", "Extensions on request", "Dupatta + maang tikka setting"],
  },
  {
    slug: "draping",
    title: "Saree & Lehenga Draping",
    short: "Pleats that stay, dupattas that sit right, kaleere and chooda ready — professional draping so you move freely all day.",
    image: "bride-red-kaleere",
    href: "/services/#draping",
    includes: ["Saree draping (all styles)", "Lehenga dupatta setting", "Double-dupatta styling", "Safety pinning for dancing"],
  },
  {
    slug: "party-family",
    title: "Party & Family Makeup",
    short: "Mothers, sisters, bhabhis and bridesmaids — at-home or at-venue makeup and hair so the whole family is ready together.",
    image: "bride-with-bridesmaids",
    href: "/services/#family",
    includes: ["At-home service", "Group bookings", "Age-appropriate looks", "Hair + draping"],
  },
  {
    slug: "destination",
    title: "Destination Weddings",
    short: "Our full team travels with you — Chandigarh, Delhi, Jaipur, Goa or abroad — so your trusted artists are there on the day.",
    image: "couple-outdoor-wide",
    href: "/services/#destination",
    includes: ["Full team travels", "Multi-day packages", "Trial before travel", "Transparent travel costs"],
  },
];
