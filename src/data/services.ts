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
    short: "HD and airbrush bridal looks for Sikh and Hindu Punjabi brides — from the morning Anand Karaj or pheras right through the doli, with hair, chunni and kaleere setting.",
    image: "bride-pink-kaleere",
    href: "/bridal-makeup/",
    includes: ["Skin prep + primer", "HD or airbrush base", "Eyes, lashes, contour, lips", "Bridal hairstyle", "Dupatta / chunni setting", "Touch-up kit for the day"],
  },
  {
    slug: "groom-makeup",
    title: "Groom Makeup & Grooming",
    short: "Natural, camera-ready grooming for Sardar and Hindu Punjabi grooms: skin, beard, dastaar- and sehra-friendly hair, and a finish nobody can tell is makeup.",
    image: "groom-sikh-red-turban",
    href: "/groom-makeup/",
    includes: ["Skin prep + light HD base", "Under-eye + blemish correction", "Beard shaping + hair styling", "Sehra / turban-friendly finish", "Pre-wedding + reception options"],
  },
  {
    slug: "engagement-reception",
    title: "Roka, Shagun & Reception",
    short: "Soft glam for the roka, chunni chadana and shagun; bold evening glamour for the reception — each look designed for the outfit and the venue lighting.",
    image: "couple-sikh-reception",
    href: "/services/#engagement",
    includes: ["Look design around your outfit", "Flash-tested finish for photos", "Hair + draping", "Family makeup add-ons"],
  },
  {
    slug: "pre-wedding",
    title: "Pre-wedding Shoot",
    short: "Fresh, outdoor-proof makeup and hair for the pre-wedding shoot — fields, havelis, Chandigarh gardens — for the bride and a matching groom finish.",
    image: "couple-sikh-golden",
    href: "/services/#pre-wedding",
    includes: ["Natural coverage", "Outdoor-shoot friendly", "Quick change looks", "Hair styling"],
  },
  {
    slug: "mehndi-sangeet",
    title: "Mehndi, Jaggo & Maiyan",
    short: "Dewy, festive looks for the mehndi and the jaggo — sweat-proof for a night of giddha and boliyan — and vatna-safe skin prep for the maiyan.",
    image: "giddha-sangeet",
    href: "/services/#mehndi-sangeet",
    includes: ["Long-wear festive makeup", "Floral + open hairstyles", "Family + bridesmaids", "On-site touch-ups"],
  },
  {
    slug: "hair-styling",
    title: "Bridal Hair Styling",
    short: "Our founder started as a hair artist — Punjabi paranda braids, joodas, floral buns and soft waves built to hold a heavy chunni and kaleere all day.",
    image: "hair-bun-roses",
    href: "/services/#hair",
    includes: ["Bridal buns + braids", "Floral + paranda styling", "Extensions on request", "Dupatta + maang tikka setting"],
  },
  {
    slug: "draping",
    title: "Saree & Lehenga Draping",
    short: "Chunni and dupatta setting that stays modest through matha tek and the laavan or pheras, lehenga and saree draping, kaleere and chooda ready.",
    image: "bride-red-suit-kaleere",
    href: "/services/#draping",
    includes: ["Saree draping (all styles)", "Lehenga dupatta setting", "Double-dupatta styling", "Safety pinning for dancing"],
  },
  {
    slug: "party-family",
    title: "Party & Family Makeup",
    short: "Mummy ji, bhua, maasi, bhabhis and sisters — at-home or at-venue makeup, hair and draping so the whole Punjabi family is ready together.",
    image: "bride-with-bridesmaids",
    href: "/services/#family",
    includes: ["At-home service", "Group bookings", "Age-appropriate looks", "Hair + draping"],
  },
  {
    slug: "destination",
    title: "Destination Weddings",
    short: "Punjabi families marrying outside Punjab — Delhi, Himachal, Jaipur or abroad — can take the same team with them for the whole wedding.",
    image: "couple-sikh-field",
    href: "/services/#destination",
    includes: ["Full team travels", "Multi-day packages", "Trial before travel", "Transparent travel costs"],
  },
];
