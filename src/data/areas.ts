export interface Area {
  slug: string;
  name: string;
  distanceKm: number; // approx road distance from Jalandhar
  travel: string;
  intro: string[];
  venues: string; // what weddings are like there / venue belts (generic)
  tip: string;
  faqs: { q: string; a: string }[];
}

export const areas: Area[] = [
  {
    slug: "jalandhar",
    name: "Jalandhar",
    distanceKm: 0,
    travel: "Home base — no travel charges within the city",
    intro: [
      "Jalandhar is home. We know the marriage palaces on the Phagwara highway and Nakodar Road, the farmhouses off the Kapurthala road, and the family homes in Model Town and Urban Estate where most of our brides get ready.",
      "Being local means we can do your trial at our studio or at your home, arrive early on the wedding morning without worrying about traffic, and stay for touch-ups right up to the doli.",
    ],
    venues: "Marriage palaces along NH-44 and the Jalandhar–Phagwara belt, farmhouse venues, hotel banquets and gurdwara-side Anand Karaj mornings.",
    tip: "Winter weddings in Jalandhar start early and the fog can delay everyone — we build a buffer into the morning timeline so the bride is never rushed.",
    faqs: [
      { q: "Do you come to my home in Jalandhar for the wedding makeup?", a: "Yes. Most Jalandhar brides get ready at home. We bring the full kit, lights and a team so hair, makeup and draping happen together." },
      { q: "Is there a travel charge inside Jalandhar?", a: "No. Jalandhar city, Jalandhar Cantt and the surrounding villages are covered with no travel charge." },
    ],
  },
  {
    slug: "phagwara",
    name: "Phagwara",
    distanceKm: 22,
    travel: "About 30 minutes from Jalandhar",
    intro: [
      "Phagwara sits right on the Jalandhar–Ludhiana highway, so for us it is practically local. Many of our NRI families from the UK and Canada have their roots here and plan their weddings around the Doaba wedding season.",
      "We regularly do morning Anand Karaj looks in Phagwara and move with the family to receptions in Jalandhar or Ludhiana the same day.",
    ],
    venues: "Highway-side marriage palaces, resorts near the Phagwara–Nawanshahr road and village homes with big family baraats.",
    tip: "NRI weddings often compress many events into a week — book all your dates in one go so the same artists are with you throughout.",
    faqs: [
      { q: "Do you charge extra for Phagwara?", a: "A small travel charge applies outside Jalandhar city; Phagwara is in our nearest zone. Ask on WhatsApp for the exact figure." },
    ],
  },
  {
    slug: "kapurthala",
    name: "Kapurthala",
    distanceKm: 20,
    travel: "About 30 minutes from Jalandhar",
    intro: [
      "The city of palaces deserves a palace-worthy bride. Kapurthala weddings tend to be elegant and traditional — rich reds, heavy jewellery, classic buns — and we love dressing brides for them.",
      "We are a short drive away, which means an early-morning start is never a problem and the team can stay for the full day.",
    ],
    venues: "Heritage-style venues, marriage palaces on the Jalandhar–Kapurthala road and family havelis in the old city.",
    tip: "Heritage venues often have warm, dim lighting — we choose a slightly warmer base so photos look natural, not grey.",
    faqs: [
      { q: "Can you do a trial in Kapurthala?", a: "We prefer trials at our Jalandhar studio where the lighting is controlled, but home trials in Kapurthala are possible for bridal bookings." },
    ],
  },
  {
    slug: "hoshiarpur",
    name: "Hoshiarpur",
    distanceKm: 45,
    travel: "About an hour from Jalandhar",
    intro: [
      "Hoshiarpur weddings are warm, big and very Punjabi. We travel there often during the peak November–February season and know the resorts along the Jalandhar–Hoshiarpur road well.",
      "For an early Anand Karaj we either arrive before dawn or stay overnight near the venue so the bride's morning runs calmly.",
    ],
    venues: "Resorts and palaces on the Hoshiarpur road, hilly-side farmhouses near the Kandi belt and gurdwara mornings.",
    tip: "If the venue is on the Kandi side, tell us — a few extra minutes of travel time changes the start time we plan for.",
    faqs: [
      { q: "Do you stay overnight for early-morning weddings in Hoshiarpur?", a: "Yes, for very early Anand Karaj timings we arrange to stay nearby the night before. Accommodation is arranged with the family." },
    ],
  },
  {
    slug: "nawanshahr",
    name: "Nawanshahr (SBS Nagar)",
    distanceKm: 55,
    travel: "Around an hour from Jalandhar",
    intro: [
      "Nawanshahr and the Banga belt host some of the biggest NRI weddings in Doaba. Families fly in from Canada, the UK and Australia, and the bride often has guests from three continents looking at her all day.",
      "We bring the full team — makeup, hair, draping — so a multi-event week runs smoothly even when the schedule changes.",
    ],
    venues: "Large marriage palaces on the Chandigarh road, resorts around Banga and village homes with tented functions.",
    tip: "Tented functions get cold in winter — we prep skin accordingly so the base does not go dry or patchy by evening.",
    faqs: [
      { q: "Can you cover all five events of a destination-style NRI wedding?", a: "Yes. Multi-event packages are our speciality and keep the same artists with you from mehndi to reception." },
    ],
  },
  {
    slug: "ludhiana",
    name: "Ludhiana",
    distanceKm: 60,
    travel: "About 1 hour 15 minutes from Jalandhar",
    intro: [
      "Ludhiana is Punjab's biggest city and its brides are fashion-forward — think modern lehengas, soft-glam reception looks and lots of camera time. We regularly travel the highway for Ludhiana bookings.",
      "Whether the wedding is at a grand palace on Ferozepur Road or a hotel banquet in the city, we plan the timeline with your photographer so the look is finished exactly when the cameras start.",
    ],
    venues: "Marriage palaces on Ferozepur Road and Pakhowal Road, five-star hotel banquets and farmhouse venues on the outskirts.",
    tip: "Ludhiana receptions are glamorous and the lighting is strong — we flash-test the base so it photographs flawlessly, not shiny.",
    faqs: [
      { q: "Do you travel to Ludhiana for a single event?", a: "Yes. Single-event bookings in Ludhiana are welcome; travel is quoted transparently in the package." },
      { q: "Can we do the trial in Ludhiana?", a: "Trials happen at our Jalandhar studio, which is just over an hour away — many Ludhiana brides combine it with shopping in Jalandhar." },
    ],
  },
  {
    slug: "amritsar",
    name: "Amritsar",
    distanceKm: 80,
    travel: "About 1 hour 30 minutes from Jalandhar",
    intro: [
      "Amritsar brides are the picture of tradition — deep reds, gold, heavy kaleere and a morning Anand Karaj that often starts with a visit to Sri Harmandir Sahib. We love these weddings and travel the GT Road for them all season.",
      "Our dastaar-friendly groom grooming and chooda-ready draping are especially popular with Amritsar families.",
    ],
    venues: "Palaces on the GT Road and Ajnala Road, heritage hotels near the walled city and gurdwara mornings.",
    tip: "If the morning includes a gurdwara visit before the ceremony, we design a look that stays modest under a dupatta and still shines for the pheras.",
    faqs: [
      { q: "Do you do traditional Punjabi bridal looks?", a: "Yes — it is one of our specialities: red or maroon tones, strong eyes, modest-yet-glowing skin and a dupatta set to stay through matha tek, the laavan or the pheras." },
    ],
  },
  {
    slug: "moga",
    name: "Moga",
    distanceKm: 75,
    travel: "About 1 hour 30 minutes from Jalandhar",
    intro: [
      "Moga and the Malwa belt host grand, large-family weddings with multi-day functions. We travel from Jalandhar with a full team so the bride, the groom and the family are all handled on site.",
      "Many Moga families book us for the full week — mehndi, sangeet, wedding and reception — with one trial to lock the bridal look.",
    ],
    venues: "Marriage palaces on the Moga–Ludhiana road, farmhouse venues and family homes with tented functions.",
    tip: "Multi-day bookings get the same artists throughout and a better rate than booking day by day.",
    faqs: [
      { q: "Do you offer a package for the whole wedding week in Moga?", a: "Yes. Ask for the multi-event package — it bundles travel for all days and keeps the team consistent." },
    ],
  },
  {
    slug: "pathankot",
    name: "Pathankot",
    distanceKm: 110,
    travel: "About 2 hours 15 minutes from Jalandhar",
    intro: [
      "Pathankot sits at the gateway to the hills, and its weddings often spill into Dalhousie, Dharamshala and Kangra. We travel from Jalandhar for the day or stay for destination-style weekends.",
      "Cooler weather and hill-side venues call for a different skin prep — we adjust the base so it stays fresh in dry mountain air.",
    ],
    venues: "City palaces and resorts on the Jalandhar–Pathankot highway, plus hill-station venues in nearby Himachal.",
    tip: "For hill weddings, pack a touch-up kit — altitude and dry air change how skin behaves across a long day. We leave one with every bride.",
    faqs: [
      { q: "Do you travel to Dalhousie or Dharamshala?", a: "Yes. Treat these as destination bookings — travel and stay are quoted upfront and the full team comes along." },
    ],
  },
  {
    slug: "chandigarh",
    name: "Chandigarh",
    distanceKm: 145,
    travel: "About 2 hours 30 minutes from Jalandhar",
    intro: [
      "Chandigarh and the Tricity are a second home for our team. Weddings here lean modern and editorial — pastel lehengas, soft-glam, destination-style venues in Zirakpur and on the Chandigarh–Shimla road.",
      "We travel from Jalandhar for single events or stay for the whole wedding week. Trials can be arranged in Chandigarh for multi-event bookings.",
    ],
    venues: "Resorts and palaces on the Zirakpur–Panchkula belt, five-star hotels in the city and farmhouses towards Kharar and New Chandigarh.",
    tip: "Chandigarh receptions are photo-heavy; ask your photographer about their lighting and we will tune the finish to match.",
    faqs: [
      { q: "Can you do my trial in Chandigarh?", a: "For multi-event bookings, yes — we schedule a Chandigarh trial day. Single-event brides are welcome at our Jalandhar studio." },
      { q: "How early do you arrive for a Chandigarh wedding?", a: "We arrive the night before for morning ceremonies, or 4–5 hours before the start time for evening events." },
    ],
  },
  {
    slug: "mohali",
    name: "Mohali & Panchkula",
    distanceKm: 150,
    travel: "About 2 hours 30 minutes from Jalandhar",
    intro: [
      "Mohali, Kharar and Panchkula host a huge number of weddings every season, from palace venues on the Kharar road to hotel receptions near the airport. We cover the Tricity as a single zone.",
      "Our packages for the Tricity include travel for the whole team and, for morning events, an overnight stay nearby so the bride's morning is calm.",
    ],
    venues: "Marriage palaces on the Kharar–Landran road, Zirakpur resorts, Panchkula hotel banquets and farmhouses in New Chandigarh.",
    tip: "Tricity venues are spread out — tell us the exact venue so we plan the travel time from where we are staying.",
    faqs: [
      { q: "Is Mohali priced the same as Chandigarh?", a: "Yes. Chandigarh, Mohali, Kharar, Zirakpur and Panchkula are one travel zone." },
    ],
  },
  {
    slug: "patiala",
    name: "Patiala",
    distanceKm: 175,
    travel: "About 3 hours from Jalandhar",
    intro: [
      "Patiala weddings carry the royal Malwa aesthetic — regal reds, big jewellery, Patiala-style juttis and grand venues. We treat Patiala as a destination booking with the full team travelling and staying for the events.",
      "The classic Patiala bride wants a strong, timeless look that photographs beautifully in heritage venues; that is exactly what our HD and airbrush work is built for.",
    ],
    venues: "Heritage venues near the old city, resorts on the Patiala–Rajpura road and palace-style banquet venues.",
    tip: "Heritage venues photograph warm; we keep the base true-to-skin so you look like you, only glowing.",
    faqs: [
      { q: "Do you cover Patiala?", a: "Yes, as a destination booking: travel and stay quoted upfront, full team on site for all events." },
    ],
  },
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug);
