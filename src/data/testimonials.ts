// ============================================================================
// REAL client reviews only. The live site renders ONLY entries in this list.
//
// Add one entry per real bride/groom/family review, with their permission to
// use their name + photo. Photos go in public/images/clients/<file>.webp
// (ideally 600×600 or larger; the component crops to a square).
//
// The design supports 50+ entries (grid + filter by event). To see the design
// filled before real reviews arrive, open /preview/testimonials/ — that page
// uses clearly-labelled SAMPLE cards, is noindex, and is never linked.
// ============================================================================
export type ReviewEvent = "Wedding" | "Engagement" | "Reception" | "Sangeet" | "Mehndi" | "Groom" | "Family" | "Pre-wedding" | "Destination";

export interface Testimonial {
  name: string;          // "Harleen & Jaskaran" or "Simran K."
  city: string;          // "Jalandhar"
  event: ReviewEvent;
  date: string;          // "2026-11"  (year-month)
  quote: string;
  photo?: string;        // file in public/images/clients/, e.g. "harleen-jaskaran.webp"
  rating?: 1 | 2 | 3 | 4 | 5;
  source?: "Google" | "Instagram" | "WhatsApp" | "In person";
}

export const testimonials: Testimonial[] = [
  // Example of a real entry (delete this comment once the first review is in):
  // {
  //   name: "Harleen & Jaskaran",
  //   city: "Jalandhar",
  //   event: "Wedding",
  //   date: "2026-11",
  //   quote: "My makeup lasted from the 6 am Anand Karaj to the doli at 5 pm and still looked fresh in every photo.",
  //   photo: "harleen-jaskaran.webp",
  //   rating: 5,
  //   source: "Google",
  // },
];
