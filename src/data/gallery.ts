// Portfolio gallery. `image` = key in public/images (name.webp + name-sm.webp).
// ⚠️ LAUNCH PHOTOS ARE STOCK PLACEHOLDERS (see docs/IMAGE-CREDITS.md).
// Replace with the studio's own work: drop files with the same names, or add
// new entries here. Captions describe the LOOK, never a named client.
export type GalleryCat = "bride" | "groom" | "couples" | "hair" | "mehndi" | "sangeet";

export interface GalleryItem { image: string; alt: string; cat: GalleryCat; tall?: boolean }

export const gallery: GalleryItem[] = [
  { image: "bride-red-kaleere", alt: "Punjabi bride in red lehenga with kaleere and chooda, classic bridal makeup", cat: "bride", tall: true },
  { image: "bridal-closeup", alt: "Close-up of bridal makeup with maang tikka and soft smokey eyes", cat: "bride" },
  { image: "bride-maroon-gold", alt: "Bride in maroon lehenga with gold jewellery, HD bridal makeup", cat: "bride", tall: true },
  { image: "bride-red-seated", alt: "Seated bride in red bridal lehenga, full-glam look", cat: "bride" },
  { image: "bride-red-smile", alt: "Smiling bride in red with traditional jewellery", cat: "bride" },
  { image: "bride-red-dupatta", alt: "Bride under a red net dupatta, soft romantic makeup", cat: "bride" },
  { image: "bride-white-night", alt: "Bride in ivory and pink at an evening reception", cat: "bride", tall: true },
  { image: "bride-orange", alt: "Bride in orange dupatta outdoors in natural light", cat: "bride", tall: true },
  { image: "bride-red-dark", alt: "Bride in deep red lehenga against a dark backdrop", cat: "bride" },
  { image: "makeup-soft-glam", alt: "Soft glam makeup with glowing skin and nude lips", cat: "bride", tall: true },
  { image: "groom-sherwani-dark", alt: "Groom in cream sherwani and red turban, natural grooming", cat: "groom", tall: true },
  { image: "groom-sehra", alt: "Groom in sehra and cream sherwani", cat: "groom", tall: true },
  { image: "groom-flowers", alt: "Groom with floral sehra at the wedding", cat: "groom", tall: true },
  { image: "groom-pink-turban", alt: "Groom in pink turban with a clean matte finish", cat: "groom", tall: true },
  { image: "groom-event", alt: "Groom at a reception in a maroon turban", cat: "groom", tall: true },
  { image: "couple-sikh-wide", alt: "Sikh couple after the Anand Karaj", cat: "couples" },
  { image: "couple-sikh-pink", alt: "Couple in pink — groom in dastaar, bride in pink salwar suit", cat: "couples", tall: true },
  { image: "couple-sikh-portrait", alt: "Sikh couple portrait at a wedding venue", cat: "couples", tall: true },
  { image: "couple-punjabi-steps", alt: "Punjabi couple on heritage steps, pre-wedding look", cat: "couples", tall: true },
  { image: "couple-pink-turban", alt: "Couple in pink and ivory, wedding day", cat: "couples", tall: true },
  { image: "couple-reception", alt: "Couple at the reception in pastel outfits", cat: "couples", tall: true },
  { image: "couple-outdoor-wide", alt: "Couple outdoors in natural light", cat: "couples" },
  { image: "couple-engagement", alt: "Engagement couple in bright colours", cat: "couples", tall: true },
  { image: "anand-karaj", alt: "Anand Karaj ceremony in a gurdwara", cat: "couples", tall: true },
  { image: "hair-floral-braid", alt: "Bridal floral braid hairstyle", cat: "hair", tall: true },
  { image: "hair-punjabi-braid", alt: "Punjabi bridal braid with flowers and heavy jewellery", cat: "hair" },
  { image: "mehndi-hands", alt: "Bridal mehndi on both hands", cat: "mehndi" },
  { image: "mehndi-hand", alt: "Mehndi design on the back of the hand", cat: "mehndi", tall: true },
  { image: "haldi-hands", alt: "Haldi ceremony hands", cat: "mehndi" },
  { image: "giddha-sangeet", alt: "Giddha at a Punjabi sangeet", cat: "sangeet" },
  { image: "sangeet-dance", alt: "Family dancing at the sangeet", cat: "sangeet" },
  { image: "dandiya", alt: "Dandiya sticks at a sangeet night", cat: "sangeet" },
  { image: "bride-with-bridesmaids", alt: "Bride with her bridesmaids in pastel lehengas", cat: "sangeet", tall: true },
  { image: "jewellery-flatlay", alt: "Bridal jewellery set", cat: "bride", tall: true },
];
