import React, { useState, useEffect, useMemo, useRef } from "react";

/**
 * WPWS Website Onboarding, Branding Module (prototype)
 * -----------------------------------------------------
 * One module of a larger multi-module intake wizard.
 * Data model is intentionally flat + serializable so this ports
 * cleanly to a real repo later. See `intake` state + "Copy intake JSON".
 */

/* ------------------------------------------------------------------ *
 * DATA, sourced directly from the WPWS design-system mood boards
 * ------------------------------------------------------------------ */

const PALETTES = {
  // WARM · SOFT, Caregiver · Innocent
  wisteria: {
    name: "Wisteria", quadrant: "warmSoft", vibe: "Quiet Luxury",
    descriptors: ["romantic", "sunlit", "dried-floral"],
    blurb: "Cream, bronze, and a soft violet: a linen dress against a garden wall in late-afternoon sun. Established and warm at once.",
    photo: "Wisteria and dried florals, linen and stone, garden walls in late sun, cream backdrops.",
    roles: { base: "#FEFBF5", paper: "#FAF2E6", ink: "#372F17", lead: "#61562E", spice: "#71597F", wash: "#E0D3E6" },
  },
  sweetpea: {
    name: "Sweet Pea", quadrant: "warmSoft", vibe: "Cheerful & Approachable",
    descriptors: ["fresh", "gentle", "optimistic"],
    blurb: "Rose, lime, and powder blue with a raspberry spine. Playful enough for the child in the room, credible enough for the parent writing the check.",
    photo: "Soft daylight, families and children, linen and cotton, warm hands, garden greens.",
    roles: { base: "#FDFAF6", paper: "#A5CFDA", ink: "#3B3134", lead: "#A94850", spice: "#2E7C93", wash: "#DFFDBB" },
  },
  riad: {
    name: "Riad", quadrant: "warmSoft", vibe: "Grounded Confidence",
    descriptors: ["earthy", "considered", "sunlit"],
    blurb: "Clay, deep teal, and warm plaster: a sunlit courtyard with handmade tile. For hands-on work that feels solid and lived in.",
    photo: "Handmade ceramics, zellige tile, clay walls, warm shadow, courtyard light.",
    roles: { base: "#FEFCF9", paper: "#EAF5EF", ink: "#22302E", lead: "#14565B", spice: "#B56E4C", wash: "#EFD7C2" },
  },
  // WARM · BOLD, Hero · Everyman
  farmstand: {
    name: "Farmstand", quadrant: "warmBold", vibe: "Warm & Vibrant",
    descriptors: ["harvest", "hearty", "welcoming"],
    blurb: "Marigold, plum, and butter over warm ivory: a market table in September. Leads with abundance; people feel fed just looking.",
    photo: "Market tables, stone fruit and squash, generous plates, late-afternoon sun.",
    roles: { base: "#FDFAF2", paper: "#F2E4EC", ink: "#1B3A2C", lead: "#965C08", spice: "#853F65", wash: "#F4ECC0" },
  },
  vibrant: {
    name: "Vibrant", quadrant: "warmBold", vibe: "Bold Expert",
    descriptors: ["lively", "confident", "bright"],
    blurb: "Coral red, cobalt, and marigold: a strong opinion delivered with a smile. For the loudest voice in the niche.",
    photo: "Motion and laughter, saturated food color, bold crops, hard daylight.",
    roles: { base: "#FEF7EF", paper: "#FBE4DD", ink: "#212F58", lead: "#BD3B2E", spice: "#2C5BAB", wash: "#FBE4B8" },
  },
  pickleball: {
    name: "Pickleball", quadrant: "warmBold", vibe: "Energetic & Playful",
    descriptors: ["spirited", "social", "fresh"],
    blurb: "A teal court, a lime ball, a coral kit. Tuesday-night league with friends. Energy without the gym-bro intensity.",
    photo: "Courts and kits, paddles and balls, motion blur, hard sunlight, saturated greens.",
    roles: { base: "#FEFDF4", paper: "#E7F4EE", ink: "#173931", lead: "#3FA48D", spice: "#F95B36", wash: "#D3E7A2" },
  },
  // COOL · SOFT, Sage
  calm: {
    name: "Calm", quadrant: "coolSoft", vibe: "Professional & Trusted",
    descriptors: ["quiet", "coastal", "assured"],
    blurb: "Steel blue, sea mist, and a touch of sand: a deep breath by the water. For clients who arrive anxious and need good hands right away.",
    photo: "Water and horizon lines, mist, unhurried posture, sandy warmth in the light.",
    roles: { base: "#FAF7F0", paper: "#DCE8EC", ink: "#20394F", lead: "#3B688A", spice: "#C0763B", wash: "#F6E3CE" },
  },
  elderberry: {
    name: "Elderberry", quadrant: "coolSoft", vibe: "Botanical & Intentional",
    descriptors: ["herbal", "grounded", "quiet"],
    blurb: "Moss, berry, and soft blush: an herbalist's studio where every jar is labeled by hand. Natural and unhurried, real rigor underneath.",
    photo: "Apothecary jars, foraged herbs, ceramic and linen, overcast soft light, hand labels.",
    roles: { base: "#FCFCF7", paper: "#EBEDE4", ink: "#33352A", lead: "#66734E", spice: "#A34D5E", wash: "#F6E0E4" },
  },
  provence: {
    name: "Provence", quadrant: "coolSoft", vibe: "Soft & Thoughtful",
    descriptors: ["romantic", "graceful", "lavender-field"],
    blurb: "Lavender, limestone, and gray-green herbs: a slow morning in the south of France. Gentleness first, a plan second.",
    photo: "Lavender rows, limestone, gray-green foliage, cool morning light.",
    roles: { base: "#F9F8F9", paper: "#EEEEE9", ink: "#221F24", lead: "#675370", spice: "#616A4D", wash: "#E0D5E6" },
  },
  // COOL · BOLD, Creator
  watermelon: {
    name: "Watermelon", quadrant: "coolBold", vibe: "Modern & Fresh",
    descriptors: ["crisp", "juicy", "bright"],
    blurb: "Pine green and watermelon pink on cool white. Cut fruit on a clean counter. For the practice that lives on Instagram as much as the site.",
    photo: "Cut fruit, bright kitchens, clean counters, pink-and-green produce, cool daylight.",
    roles: { base: "#FAFCFA", paper: "#D4F2E8", ink: "#053641", lead: "#26776A", spice: "#CE3E59", wash: "#FADEE3" },
  },
  luxe: {
    name: "Luxe", quadrant: "coolBold", vibe: "Elevated & Premium",
    descriptors: ["refined", "moody", "rare"],
    blurb: "Mulberry, antique gold, and pale lilac. Velvet, low light, a considered pour of wine. Premium pricing that says so before a word is read.",
    photo: "Low key, deep shadow, gold accents, velvet and stone textures.",
    roles: { base: "#FAF8F4", paper: "#EFE9F3", ink: "#2C2238", lead: "#5D3A63", spice: "#C9A227", wash: "#E3D7EC" },
  },
  fjord: {
    name: "Fjord", quadrant: "coolBold", vibe: "Clean & Confident",
    descriptors: ["midnight water", "icy sky", "painted boathouses"],
    blurb: "Indigo, icy blue, and one hot stroke of persimmon. Cold air and clear thinking. Leads with expertise, straight to the point.",
    photo: "Cold water and mountains, nordic architecture, editorial portraits in cool light, one warm accent.",
    roles: { base: "#FCFBF6", paper: "#BCCEDA", ink: "#1E2A44", lead: "#354C97", spice: "#D9532B", wash: "#DCEBF3" },
  },
  // OFF MAP, neutral opt-out
  gallery: {
    name: "Gallery", quadrant: "neutral", vibe: "Simple & Refined",
    descriptors: ["quiet", "precise", "gallery-white"],
    blurb: "Warm white, stone, and graphite, a gallery with your work on the walls. The site disappears; your words and photos carry the brand.",
    photo: "White walls, museum light, linen and paper textures, strong typography. Your imagery supplies the color.",
    roles: { base: "#FBFAF8", paper: "#F1F0EC", ink: "#232019", lead: "#4A443C", spice: "#4E565C", wash: "#ECE8E0" },
  },
};

const PALETTE_IMGS = {
  wisteria: ["1619922141822-8972ce55b44b", "1654028829490-af9c5b060429", "1629563293404-f7ff059421e2"],
  sweetpea: ["1560707854-fb9a10eeaace", "1583710457367-47de0ea21fef", "1489760176169-fd3d32805239"],
  riad: ["1590605095243-072811dbe64c", "1609881583302-61548332039c", "1577576223085-3eb295cd414f"],
  farmstand: ["1511816868748-35a25b1148c0", "1695459003933-4a1b59009355", "1541095441899-5d96a6da10b8"],
  vibrant: ["1466637574441-749b8f19452f", "1556910103-1c02745aae4d", "1512621776951-a57141f2eefd"],
  pickleball: ["1693142518820-78d7a05f1546", "1515017804404-92b19fdfe6ac", "1686721135030-e2ab79e27b16"],
  calm: ["1506126613408-eca07ce68773", "1522075782449-e45a34f1ddfb", "1573646985533-85d8a384e020"],
  elderberry: ["1478744919174-118dbd24973e", "1550159793-871f0c58e882", "1483137140003-ae073b395549"],
  provence: ["1688832331997-0331b0ccffd0", "1761194466962-52d338187614", "1499002238440-d264edd596ec"],
  watermelon: ["1556909114-44e3e70034e2", "1556911073-a517e752729c", "1547592180-85f173990554"],
  luxe: ["1636215450237-45e236495794", "1715558643347-9a6ff81f6c5f", "1720022791259-db19373922c6"],
  fjord: ["1698307781486-7c63dadf5fb7", "1547683331-a03843cf94dd", "1504233529578-6d46baba6d34"],
  gallery: ["1535385793343-27dff1413c5a", "1583847268964-b28dc8f51f92", "1543487945-139a97f387d5"],
};

const QUADRANTS = {
  warmBold: { archetype: "Hero · Everyman", feel: "energizing, grounded, direct", palettes: ["farmstand", "vibrant", "pickleball"] },
  coolBold: { archetype: "Creator", feel: "crisp, confident, editorial", palettes: ["watermelon", "luxe", "fjord"] },
  warmSoft: { archetype: "Caregiver · Innocent", feel: "nurturing, cozy, tender", palettes: ["wisteria", "sweetpea", "riad"] },
  coolSoft: { archetype: "Sage", feel: "calm, credible, considered", palettes: ["calm", "elderberry", "provence"] },
};

const PAIRINGS = {
  warmSoft: { serif: "Fraunces", sans: "Bricolage Grotesque", body: "Karla", script: "Great Vibes", suits: "Warm caregivers, boutique practices, editorial voices." },
  warmBold: { serif: "DM Serif Display", sans: "Syne", body: "Plus Jakarta Sans", script: "Parisienne", suits: "Expert voices, high-conviction offers, results-led brands." },
  coolSoft: { serif: "Lora", sans: "Sora", body: "Work Sans", script: "Sacramento", suits: "Sages, therapists, herbalists, long-form storytellers." },
  coolBold: { serif: "Instrument Serif", sans: "Space Grotesk", body: "Archivo", script: "Alex Brush", suits: "Creators, editorial brands, clarity-first experts." },
};

/* Gallery = neutral structure (base/paper/ink) + an optional color trio
   (lead/spice/wash) borrowed from one palette in the client's quadrant. */
function resolveGalleryRoles(accentId) {
  const g = PALETTES.gallery.roles;
  if (!accentId || !PALETTES[accentId]) return g;
  const s = PALETTES[accentId].roles;
  return { base: g.base, paper: g.paper, ink: g.ink, lead: s.lead, spice: s.spice, wash: s.wash };
}
function resolveRoles(intake) {
  if (!intake.palette) return null;
  if (intake.palette === "gallery") return resolveGalleryRoles(intake.galleryAccent);
  return PALETTES[intake.palette].roles;
}
function paletteLabel(intake) {
  if (!intake.palette) return null;
  if (intake.palette === "gallery")
    return intake.galleryAccent ? "Minimal + " + PALETTES[intake.galleryAccent].name + " accent" : "Minimal (fully neutral)";
  const p = PALETTES[intake.palette];
  return p.name + " (" + p.vibe + ")";
}

const U = (id) => "https://images.unsplash.com/photo-" + id + "?q=80&w=400&auto=format&fit=crop";

/* Every option carries hidden weights on the two axes the system runs on:
   temp (+warm / -cool) and energy (+bold / -soft). We sum them to place a quadrant. */
const QUIZ = [
  {
    id: "persona", kind: "image",
    q: "Which of these is your brand's energy?",
    help: "Not who you are on paper. The vibe you want people to feel.",
    note: "Photos are stand-ins. The final set gets curated to match each type.",
    options: [
      { label: "The Motivator", sub: "gets you fired up, believes you can do it", img: U("1466637574441-749b8f19452f"), alt: "Energetic, in motion", w: { energy: 2, temp: 1 } },
      { label: "The Nurturer", sub: "makes you feel safe and looked after", img: U("1560707854-fb9a10eeaace"), alt: "Warm and caring", w: { energy: -2, temp: 2 } },
      { label: "The Tastemaker", sub: "sharp, modern, a step ahead", img: U("1636215450237-45e236495794"), alt: "Editorial and composed", w: { energy: 2, temp: -2 } },
      { label: "The Calm Expert", sub: "steady, wise, never rushed", img: U("1506126613408-eca07ce68773"), alt: "Serene and still", w: { energy: -2, temp: -1 } },
    ],
  },
  {
    id: "compliment", kind: "choice",
    q: "The reaction you'd most want from a client:",
    help: "They all feel good. Pick the one you'd want most.",
    options: [
      { label: "\u201CYou lit a fire under me.\u201D", w: { energy: 2, temp: 1 } },
      { label: "\u201CI finally feel safe and supported.\u201D", w: { energy: -2, temp: 2 } },
      { label: "\u201CYou\u2019re miles ahead of everyone else.\u201D", w: { energy: 1, temp: -2 } },
      { label: "\u201CYou made it all make sense.\u201D", w: { energy: -1, temp: -1 } },
    ],
  },
  {
    id: "weekend", kind: "choice",
    q: "Your ideal weekend:",
    help: "Off the clock. Where do you go?",
    options: [
      { label: "A lively night out with friends", sub: "music, energy, people", w: { energy: 2, temp: 1 } },
      { label: "A slow weekend at home", sub: "blankets, books, nowhere to be", w: { energy: -2, temp: 1 } },
      { label: "A design-packed trip to a new city", sub: "galleries, architecture, good coffee", w: { energy: 1, temp: -2 } },
      { label: "A silent retreat by the water", sub: "quiet, space, fresh air", w: { energy: -2, temp: -2 } },
    ],
  },
  {
    id: "voice", kind: "quote",
    q: "Which sounds most like your brand talking?",
    help: "Say them out loud. Pick the one in your voice.",
    options: [
      { label: "\u201CLet\u2019s go \u2014 you\u2019ve got this.\u201D", sub: "direct, motivating", w: { energy: 2, temp: 1 } },
      { label: "\u201CCome in \u2014 you\u2019re safe here.\u201D", sub: "warm, nurturing", w: { energy: -2, temp: 2 } },
      { label: "\u201CHere\u2019s exactly how it works.\u201D", sub: "clear, expert", w: { energy: 1, temp: -2 } },
      { label: "\u201CTake a breath. We\u2019ll figure it out.\u201D", sub: "calm, reassuring", w: { energy: -2, temp: -1 } },
    ],
  },
  {
    id: "party", kind: "choice",
    q: "At a dinner party, your brand is…",
    help: "Which one, honestly?",
    options: [
      { label: "Telling the best story, whole table laughing", w: { energy: 2, temp: 1 } },
      { label: "Making sure everyone feels welcome", w: { energy: -1, temp: 2 } },
      { label: "Deep in the sharp, interesting debate", w: { energy: 1, temp: -2 } },
      { label: "The calm one everyone ends up confiding in", w: { energy: -2, temp: -1 } },
    ],
  },
];

function scoreQuiz(answers) {
  let temp = 0, energy = 0;
  QUIZ.forEach((q) => {
    const i = answers[q.id];
    if (i == null) return;
    const w = q.options[i].w || {};
    temp += w.temp || 0;
    energy += w.energy || 0;
  });
  return { temp, energy, temperature: temp >= 0 ? "warm" : "cool", energyLvl: energy >= 0 ? "bold" : "soft" };
}

const IMAGERY_OPTIONS = [
  { id: "food", label: "Food & ingredients", hint: "plates, produce, cooking" },
  { id: "people", label: "People & clients", hint: "faces, sessions, connection" },
  { id: "hands", label: "Hands & process", hint: "prep, craft, the work itself" },
  { id: "spaces", label: "Spaces & textures", hint: "linen, ceramic, light, stone" },
  { id: "nature", label: "Nature & botanicals", hint: "herbs, gardens, water" },
];

const TEMPLATES = [
  { id: "classic", name: "Classic", tagline: "Clean and timeless",
    blurb: "Simple and balanced. Lets your content lead. The dependable foundation." },
  { id: "expert", name: "Expert", tagline: "Editorial and authoritative",
    blurb: "Structured and elevated, with proof and credentials up front. Reads sage and credible." },
  { id: "bestie", name: "Bestie", tagline: "Warm and approachable",
    blurb: "Friendly and photo-forward, like being welcomed in by a friend. Easy to trust." },
];

const BRAND_ROLES = [
  { key: "base",  name: "Base",  token: "--base",  plain: "Your main background. The color most of the site sits on. Usually a near-white." },
  { key: "paper", name: "Paper", token: "--paper", plain: "Your secondary background. For section bands and strips that break up the page." },
  { key: "ink",   name: "Ink",   token: "--ink",   plain: "Your main text color, and the default button color. Usually your darkest tone." },
  { key: "lead",  name: "Lead",  token: "--lead",  plain: "Your primary brand color, a colored headline word, your links, your buttons." },
  { key: "spice", name: "Spice", token: "--spice", plain: "Your accent. The secondary pop that keeps the brand from feeling flat." },
  { key: "wash",  name: "Wash",  token: "--wash",  plain: "A soft highlight tint that sits behind key phrases and small tags." },
];

const BRAND_FONTS = [
  { key: "display", name: "Display / heading font", plain: "The characteristic face for headlines, used with restraint." },
  { key: "body",    name: "Body font",             plain: "The workhorse for paragraphs and buttons. Must read well at small sizes." },
];

const isHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((v || "").trim());

const MODULES = ["Core info", "Branding", "Brand strategy", "Voice & client", "Pages", "Handoff"];
const MODULE_ENTRY = { "Core info": "coreinfo", "Branding": "gate", "Brand strategy": "strat_foundation", "Voice & client": "voice_tone", "Pages": "pages_home", "Handoff": "handoff_legal" };
const SUBSTEP_STEP = {
  "Core info": ["coreinfo"],
  "Branding": ["gate", "type", "imagery", "template", "review"],
  "Brand strategy": ["strat_foundation", "strat_character", "strat_beliefs", "strat_proof", "strat_review"],
  "Voice & client": ["voice_tone", "voice_client", "voice_review"],
  "Pages": ["pages_home", "pages_services", "pages_about", "pages_proof", "pages_addons", "pages_review"],
  "Handoff": ["handoff_legal", "handoff_notes", "handoff_done"],
};
const BRAND_STEPS = ["Colors", "Type", "Imagery", "Layout", "Review"];
const VOICE_STEPS = ["Voice", "Ideal client", "Review"];
const PAGES_STEPS = ["Home", "Services", "About", "Proof & contact", "Add-ons", "Review"];
const STRAT_STEPS = ["The basics", "Personality", "What you believe", "Proof", "Review"];
const HANDOFF_STEPS = ["One last thing", "Anything else", "Submit"];

const STRAT_ARCHETYPE = { warmBold: "Hero & Everyman", coolBold: "Creator", warmSoft: "Caregiver & Innocent", coolSoft: "Sage" };

const CTA_OPTIONS = ["Book a call", "Buy / enroll", "Apply", "Join the waitlist", "Contact me"];
const SERVICE_ACTIONS = ["Book a call", "Buy / enroll", "Apply", "Join the waitlist", "Learn more"];
const ACTION_LINK_LABEL = {
  "Book a call": { label: "Scheduling link", hint: "Where this button should send them to book." },
  "Buy / enroll": { label: "Checkout link", hint: "The page where they pay or enroll." },
  "Apply": { label: "Application link", hint: "Your form or application page." },
  "Join the waitlist": { label: "Waitlist sign-up link", hint: "Usually a form from your email platform." },
  "Learn more": { label: "Where should this go?", hint: "A page, a PDF, or a booking link." },
};
const ADDON_PAGES = [
  { id: "sales", name: "Sales page", price: "Pricing TBD", note: "A full page to sell one offer. Opens its own question set later." },
  { id: "blog", name: "Blog", price: "Pricing TBD" },
  { id: "unique", name: "Something unique", price: "Pricing TBD", note: "A custom one-off page. Tell us what you have in mind." },
];

const TONE_WORDS = [
  { word: "Warm", sample: "I'm so glad you're here. Whenever you're ready, I'd love to help." },
  { word: "Direct", sample: "Here's what's not working, and how we fix it." },
  { word: "Playful", sample: "Ready to stop guessing and start actually enjoying this?" },
  { word: "Calm", sample: "There's no rush. We'll start exactly where you are." },
  { word: "Bold", sample: "You weren't built to settle for this. Let's go." },
  { word: "Nurturing", sample: "You've been carrying a lot. Let's take some of it off your plate." },
  { word: "Expert", sample: "Fifteen years of clinical practice, distilled into a plan that works." },
  { word: "Down-to-earth", sample: "No fancy stuff. Just a plan that fits your actual life." },
  { word: "Encouraging", sample: "You're closer than you think. Let's take the next step together." },
  { word: "Straight-talking", sample: "This takes real work. If you're in, I'll show you exactly how." },
  { word: "Witty", sample: "Most diets are like bad exes. Charming in January, gone by February." },
  { word: "Reassuring", sample: "You haven't failed. The plans you were handed just weren't built for you." },
  { word: "Polished", sample: "A considered approach to nutrition. Precise, thoughtful, entirely yours." },
  { word: "Real & casual", sample: "Okay, real talk: this doesn't have to be so complicated." },
];
const TONE_SUGGEST = {
  warmBold: ["Bold", "Encouraging", "Direct", "Down-to-earth"],
  coolBold: ["Bold", "Polished", "Expert", "Straight-talking"],
  warmSoft: ["Warm", "Nurturing", "Reassuring", "Down-to-earth"],
  coolSoft: ["Calm", "Expert", "Reassuring", "Polished"],
};

const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?" +
  [
    "Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400",
    "Playfair+Display:ital,wght@0,400;0,500;0,600;1,400",
    "Figtree:wght@300;400;500;600;700",
    "Karla:wght@400;500;600;700",
    "Bricolage+Grotesque:wght@400;600;700",
    "DM+Serif+Display:ital@0;1",
    "Plus+Jakarta+Sans:wght@400;500;600;700",
    "Syne:wght@600;700;800",
    "Lora:ital,wght@0,400;0,600;1,400",
    "Work+Sans:wght@400;500;600",
    "Sora:wght@400;600;700",
    "Instrument+Serif:ital@0;1",
    "Archivo:wght@400;500;600",
    "Space+Grotesk:wght@400;500;700",
    "Great+Vibes", "Parisienne", "Sacramento", "Alex+Brush",
  ].map((f) => "family=" + f).join("&") + "&display=swap";

/* ------------------------------------------------------------------ *
 * PERSISTENCE (Supabase)
 * Access goes through two security-definer functions, so the public key
 * cannot read or enumerate the intakes table directly.
 * ------------------------------------------------------------------ */

const SB_URL = "https://rguqefwhlzehpzgljbdo.supabase.co";
const SB_KEY = "sb_publishable_pd-UWgAKLQ91cU0FK7hxaQ_8b-bmYA5";

async function sbCall(fn, body) {
  const res = await fetch(SB_URL + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: "Bearer " + SB_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Save failed (" + res.status + ")");
  return res.json();
}

const loadIntake = (email) => sbCall("wpws_load_intake", { p_email: email });
const saveIntake = (email, firstName, step, data, submit) =>
  sbCall("wpws_save_intake", { p_email: email, p_first_name: firstName, p_step: step, p_data: data, p_submit: !!submit });

/* ------------------------------------------------------------------ *
 * SMALL PIECES
 * ------------------------------------------------------------------ */

function Swatch({ hex, label }) {
  return (
    <div title={label + " · " + hex} style={{ textAlign: "center" }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }} />
      <div style={{ fontSize: 9, letterSpacing: ".04em", textTransform: "uppercase", marginTop: 4, opacity: 0.55 }}>{label}</div>
    </div>
  );
}

/** A live mini mood-board rendered in the palette's own colors. */
function PaletteCard({ id, data, selected, onSelect, pairing }) {
  const p = data || PALETTES[id];
  const r = p.roles;
  const imgs = PALETTE_IMGS[id] || [];
  const displayFont = pairing ? PAIRINGS[pairing].serif : "Fraunces";
  const bodyFont = pairing ? PAIRINGS[pairing].body : "Karla";
  return (
    <button
      onClick={() => onSelect(id)}
      className="palette-card"
      style={{
        background: "#FFFFFF", color: r.ink, borderColor: selected ? "#232019" : "rgba(0,0,0,.10)",
        boxShadow: selected ? "0 0 0 2px #232019, 0 12px 30px rgba(0,0,0,.10)" : "0 4px 14px rgba(0,0,0,.05)",
      }}
    >
      {imgs.length > 0 && (
        <div className="pc-imgs">
          {imgs.map((im, i) => (
            <img key={i} src={U(im)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: "'" + displayFont + "', Georgia, serif", fontSize: 22, lineHeight: 1 }}>{p.name}</span>
        <span style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.6 }}>{p.vibe}</span>
      </div>

      <div style={{ fontFamily: "'" + displayFont + "', Georgia, serif", fontSize: 19, lineHeight: 1.2, marginTop: 12 }}>
        Care that fits your <span style={{ color: r.lead }}>real life</span>.
      </div>
      <p style={{ fontFamily: "'" + bodyFont + "', system-ui, sans-serif", fontSize: 12.5, lineHeight: 1.5, margin: "8px 0 0" }}>
        Every plan is built around{" "}
        <span style={{ background: r.wash, padding: "1px 4px", borderRadius: 3 }}>your actual week</span>{" "}, not the other way around.
      </p>

      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10.5, background: r.ink, color: r.base, padding: "3px 9px", borderRadius: 999 }}>Book a call</span>
        <span style={{ fontSize: 10.5, border: "1px solid " + r.lead, color: r.lead, padding: "3px 9px", borderRadius: 999 }}>Now booking</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "space-between" }}>
        <Swatch hex={r.base} label="Base" /><Swatch hex={r.paper} label="Paper" /><Swatch hex={r.ink} label="Ink" />
        <Swatch hex={r.lead} label="Lead" /><Swatch hex={r.spice} label="Spice" /><Swatch hex={r.wash} label="Wash" />
      </div>

      <div style={{ fontFamily: "'" + bodyFont + "', system-ui, sans-serif", fontSize: 11, lineHeight: 1.45, marginTop: 12, opacity: 0.72, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 8 }}>
        <strong style={{ fontWeight: 600 }}>Photos:</strong> {p.photo}
      </div>
    </button>
  );
}

function VibeChoice({ selected, onSelect, img, alt, title, feels, swatches }) {
  return (
    <button className={"vibe-choice" + (selected ? " sel" : "")} onClick={onSelect}>
      {img && (
        <img className="vibe-img" src={img} alt={alt || ""} loading="lazy"
          onError={(e) => { e.currentTarget.style.display = "none"; }} />
      )}
      <div className="vibe-body">
        <span className="vibe-title">{title}</span>
        <span className="vibe-feels">{feels}</span>
        <span className="vibe-swatches">{swatches.map((c, i) => <i key={i} style={{ background: c }} />)}</span>
      </div>
    </button>
  );
}

function TemplatePreview({ id, roles, displayFont }) {
  const base = roles ? roles.base : "#FBFAF8";
  const ink = roles ? roles.ink : "#232019";
  const lead = roles ? roles.lead : "#4A443C";
  const paper = roles ? roles.paper : "#EDEAE3";
  const df = "'" + (displayFont || "Fraunces") + "', Georgia, serif";
  const topbar = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ width: 24, height: 7, borderRadius: 2, background: ink, opacity: 0.75 }} />
      <div style={{ display: "flex", gap: 5 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 11, height: 4, borderRadius: 2, background: ink, opacity: 0.3 }} />)}
      </div>
    </div>
  );
  let hero = null;
  if (id === "expert") {
    hero = (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, textAlign: "center" }}>
        <div style={{ fontFamily: df, fontSize: 14, color: ink }}>Your practice, clearly</div>
        <div style={{ width: "68%", height: 4, borderRadius: 2, background: ink, opacity: 0.22 }} />
        <div style={{ width: "52%", height: 4, borderRadius: 2, background: ink, opacity: 0.22 }} />
        <div style={{ marginTop: 5, background: lead, color: base, fontSize: 8.5, padding: "5px 12px", borderRadius: 999 }}>Book a call</div>
      </div>
    );
  } else if (id === "classic") {
    hero = (
      <div style={{ flex: 1, display: "flex", gap: 11 }}>
        <div style={{ flex: 1.3, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          <div style={{ fontFamily: df, fontSize: 15, lineHeight: 1.1, color: ink }}>The expert in<br />your corner</div>
          <div style={{ width: "82%", height: 3.5, borderRadius: 2, background: ink, opacity: 0.2 }} />
          <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
            <span style={{ fontSize: 6.5, letterSpacing: ".1em", textTransform: "uppercase", color: ink, opacity: 0.5 }}>As seen in</span>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 15, height: 5, borderRadius: 2, background: ink, opacity: 0.25 }} />)}
          </div>
          <div style={{ marginTop: 3, alignSelf: "flex-start", background: ink, color: base, fontSize: 8.5, padding: "5px 11px", borderRadius: 4 }}>Work with me</div>
        </div>
        <div style={{ flex: 1, background: paper, borderRadius: 6, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.05)" }} />
      </div>
    );
  } else {
    hero = (
      <div style={{ flex: 1, display: "flex", gap: 11, alignItems: "center" }}>
        <div style={{ width: 58, height: 58, borderRadius: 999, background: paper, flex: "none", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontFamily: df, fontSize: 13.5, color: ink }}>Hi, so glad you're here</div>
          <div style={{ width: "86%", height: 3.5, borderRadius: 2, background: ink, opacity: 0.2 }} />
          <div style={{ width: "64%", height: 3.5, borderRadius: 2, background: ink, opacity: 0.2 }} />
          <div style={{ marginTop: 4, alignSelf: "flex-start", background: lead, color: base, fontSize: 8.5, padding: "6px 14px", borderRadius: 999 }}>Let's chat</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ background: base, borderRadius: 8, padding: 12, height: 158, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)", display: "flex", flexDirection: "column" }}>
      {topbar}{hero}
    </div>
  );
}

function CardFlow({ cards, onExit, onComplete, completeLabel }) {
  const [i, setI] = React.useState(0);
  const idx = Math.min(i, cards.length - 1);
  const card = cards[idx];
  const last = idx === cards.length - 1;
  return (
    <div>
      <div className="cp-row">
        <div className="cp-dots">
          {cards.map((c, n) => (
            <button key={n} className={"cp-dot" + (n === idx ? " cur" : n < idx ? " done" : "")}
              onClick={() => setI(n)} title={c.nav || "Question " + (n + 1)} />
          ))}
        </div>
        <span className="cp-count">{idx + 1} of {cards.length}</span>
      </div>
      <div className="qcard fade-in" key={idx}>
        <h3 className="q-title">{card.q}</h3>
        {card.why && <p className="q-why">{card.why}</p>}
        {card.body}
      </div>
      <div className="nav-row">
        {idx === 0 && !onExit ? <span /> : <button className="btn-ghost" onClick={() => (idx === 0 ? onExit() : setI(idx - 1))}>Back</button>}
        <button className="btn-solid" disabled={card.canNext === false} onClick={() => (last ? onComplete() : setI(idx + 1))}>
          {last ? (completeLabel || "Next →") : "Next →"}
        </button>
      </div>
    </div>
  );
}

function StatementList({ items, onItem, onAdd, onRemove, placeholder }) {
  return (
    <div>
      {items.map((v, i) => (
        <div className="stmt-row" key={i}>
          <span className="stmt-num">{i + 1}</span>
          <input className="field" placeholder={placeholder} value={v} onChange={(e) => onItem(i, e.target.value)} />
          {items.length > 1 && <button className="feature-x" onClick={() => onRemove(i)} title="Remove">×</button>}
        </div>
      ))}
      <button className="btn-ghost" style={{ marginTop: 2 }} onClick={onAdd}>+ Add another</button>
    </div>
  );
}

function StyleRow({ label, hint, options, value, onChange }) {
  return (
    <div className="style-row">
      <div className="style-label">{label}{hint && <span className="opt"> {hint}</span>}</div>
      <div className="tone-wrap">
        {options.map((o) => (
          <button key={o} className={"tone-chip sm" + (value === o ? " sel" : "")} onClick={() => onChange(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function SignIn({ onStart }) {
  const [firstName, setFirstName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [found, setFound] = React.useState(null);

  const ok = firstName.trim() && /\S+@\S+\.\S+/.test(email.trim());

  const go = async () => {
    if (!ok || busy) return;
    setBusy(true); setErr("");
    try {
      const rows = await loadIntake(email.trim());
      const prior = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (prior && prior.submitted_at) {
        onStart({ email: email.trim(), firstName: firstName.trim() }, prior.data, "dashboard", prior.submitted_at);
      } else if (prior) {
        setFound(prior);
      } else {
        onStart({ email: email.trim(), firstName: firstName.trim() }, null, "coreinfo", null);
      }
    } catch (e) {
      setErr("We couldn't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  };

  if (found) {
    const when = new Date(found.updated_at);
    return (
      <div className="signin-wrap fade-in">
        <div className="signin-card">
          <div className="signin-eyebrow">Welcome back</div>
          <h2 className="signin-title">Good to see you again, {found.first_name || firstName.trim()}.</h2>
          <p className="signin-sub">
            We saved your place on {when.toLocaleDateString(undefined, { month: "long", day: "numeric" })}. Pick up where you left off, and nothing you wrote is lost.
          </p>
          <div className="signin-actions">
            <button className="btn-solid" onClick={() => onStart({ email: email.trim(), firstName: found.first_name || firstName.trim() }, found.data, found.step || "coreinfo", null)}>
              Continue where I left off →
            </button>
          </div>
          <button className="signin-alt" onClick={() => onStart({ email: email.trim(), firstName: firstName.trim() }, found.data, "coreinfo", null)}>
            Start from the beginning instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signin-wrap fade-in">
      <div className="signin-card">
        <div className="signin-eyebrow">Whitney Bateson Digital Strategy</div>
        <h2 className="signin-title">Let's build your website.</h2>
        <p className="signin-sub">
          This is where you tell us about your work so we can build something that sounds like you. It takes a while, and that's on purpose. Your answers save as you go, so you can stop any time and come back to exactly where you were.
        </p>
        <label className="field-label" style={{ marginTop: 30 }}>First name</label>
        <input className="field" value={firstName} autoFocus placeholder="What should we call you?"
          onChange={(e) => setFirstName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
        <label className="field-label">Email</label>
        <p className="why">Use the same address each time and we'll bring your answers back for you.</p>
        <input className="field" type="email" value={email} placeholder="you@yourbusiness.com"
          onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
        {err && <div className="signin-err">{err}</div>}
        <div className="signin-actions">
          <button className="btn-solid" disabled={!ok || busy} onClick={go}>{busy ? "One moment…" : "Begin →"}</button>
        </div>
      </div>
    </div>
  );
}

function StepShell({ eyebrow, title, sub, children, footer }) {
  return (
    <div className="fade-in">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="step-title">{title}</h2>
      {sub && <p className="step-sub">{sub}</p>}
      <div style={{ marginTop: 22 }}>{children}</div>
      {footer}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * MAIN
 * ------------------------------------------------------------------ */

export default function BrandingModule() {
  const [session, setSession] = useState(null);   // { email, firstName }
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [step, setStep] = useState("coreinfo"); // coreinfo | gate | existing | quiz | result | palette | type | imagery | review
const DEFAULT_INTAKE = {
  core: {
    name: "", email: "", brand: "", niche: "",
    yearsBusiness: "", yearsOnline: "", credentials: "",
    mode: null, // "online" | "inperson" | "both"
    regions: "", locationName: "", address: "",
    priorSite: null, priorSiteLive: null, priorSiteUrl: "",
  },
  hasBrand: null,
  existing: {
    roles: { base: "", paper: "", ink: "", lead: "", spice: "", wash: "" },
    fonts: { display: "", body: "", script: "" },
    notes: "",
  },
  energy: null,      // "bold" | "soft" (set from the quiz result, adjustable)
  temperature: null, // "warm" | "cool"
  quizAnswers: {},   // questionId -> chosen option index
  quadrant: null,
  palette: null,
  galleryAccent: null, // when palette==="gallery": id of the quadrant palette donating the accent, or null = neutral
  typePairing: null,
  typeSilhouette: "serif", // serif | sans
  imagery: [],
  imageryNotes: "",
  photos: { has: null, link: "", notes: "" },
  template: null, // "classic" | "expert" | "bestie"
  voice: {
    toneWords: [], soundLike: "", phrasesUse: "", avoid: "",
    emojis: "",
    style: { exclaim: "", flair: "", rhythm: "", casing: "", swearing: "" },
    samples: { writing: "", spoken: "" },
    clientWords: "", clientTried: "", clientWants: "", clientObjections: "",
  },
  pages: {
    home: { coreMessage: "", convince: "", cta: "", freebie: { has: null, what: "", platform: "", connect: "" } },
    services: [],
    about: { story: "", why: "", education: "", positions: "", funStory: "", personal: "" },
    addons: [],
    uniqueNote: "",
    testimonials: { has: null, items: [] },
    booking: { tool: "", link: "", payment: "" },
    contact: { phone: "", publicEmail: "", hours: "", socials: "", preferred: "" },
  },
  handoff: { legalAck: false, notes: "" },
  submittedAt: null,
  strategy: {
    coreIdea: "", whoServe: "", currentGoal: "", result: "", coreQuestion: "",
    different: ["", "", ""], culturalContext: "",
    archetypes: "", ultimateGoal: "", feel: "", descriptors: "",
    pov: ["", "", "", ""], principles: ["", "", ""], manifesto: "",
    credibility: ["", "", "", ""], features: [],
    ideaEnemies: "", notToDo: "", weAreNot: "",
  },
};

/* Deep-merge saved data over the defaults. Any field added to the intake
 * after someone started still gets its default, and nothing they wrote is
 * dropped because a nested object was replaced wholesale. */
function mergeIntake(defaults, saved) {
  if (!saved || typeof saved !== "object") return defaults;
  const out = Array.isArray(defaults) ? [...defaults] : { ...defaults };
  Object.keys(saved).forEach((k) => {
    const sv = saved[k], dv = defaults ? defaults[k] : undefined;
    if (sv === null || sv === undefined) return;               // never let a null wipe a default
    if (Array.isArray(sv)) out[k] = sv;                        // arrays replace wholesale
    else if (typeof sv === "object" && dv && typeof dv === "object" && !Array.isArray(dv)) {
      out[k] = mergeIntake(dv, sv);                            // recurse into nested objects
    } else out[k] = sv;
  });
  return out;
}

/* Has anyone actually typed anything? Used to refuse saving a blank intake
 * over a real one. */
function hasContent(o) {
  if (o === null || o === undefined) return false;
  if (typeof o === "string") return o.trim().length > 0;
  if (typeof o === "number" || typeof o === "boolean") return true;
  if (Array.isArray(o)) return o.some(hasContent);
  if (typeof o === "object") return Object.values(o).some(hasContent);
  return false;
}

  const [intake, setIntake] = useState(DEFAULT_INTAKE);
  const [showAll, setShowAll] = useState(false);
  const [qi, setQi] = useState(0); // current quiz question index
  const [copied, setCopied] = useState(false);

  // Autosave: debounced, silent, and never blocks typing.
  // Two guards stop a blank state from ever overwriting real answers:
  //   1. hydrated  - nothing saves until the server load has been applied
  //   2. hadContent - once there were answers, a blank payload is refused
  const saveTimer = React.useRef(null);
  const hydrated = React.useRef(false);
  const hadContent = React.useRef(false);
  React.useEffect(() => {
    if (!session || !hydrated.current) return;
    const filled = hasContent(intake);
    if (filled) hadContent.current = true;
    if (!filled && hadContent.current) return; // refuse to blank out real answers
    clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      saveIntake(session.email, session.firstName, step, intake, false)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 900);
    return () => clearTimeout(saveTimer.current);
  }, [intake, step, session]);
  const topRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => { if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, [step]);

  const set = (patch) => setIntake((s) => ({ ...s, ...patch }));
  const setRole = (k, v) => set({ existing: { ...intake.existing, roles: { ...intake.existing.roles, [k]: v } } });
  const setFont = (k, v) => set({ existing: { ...intake.existing, fonts: { ...intake.existing.fonts, [k]: v } } });
  const setCore = (patch) => set({ core: { ...intake.core, ...patch } });
  const setPhotos = (patch) => set({ photos: { ...intake.photos, ...patch } });
  const setVoice = (patch) => set({ voice: { ...intake.voice, ...patch } });
  const setStyle = (patch) => setVoice({ style: { ...intake.voice.style, ...patch } });
  const setSamples = (patch) => setVoice({ samples: { ...intake.voice.samples, ...patch } });
  const addFeature = () => setStrat({ features: [...intake.strategy.features, { name: "", url: "" }] });
  const setFeature = (i, k, val) => setStrat({ features: intake.strategy.features.map((f, idx) => (idx === i ? { ...f, [k]: val } : f)) });
  const removeFeature = (i) => setStrat({ features: intake.strategy.features.filter((_, idx) => idx !== i) });
  const setPages = (patch) => set({ pages: { ...intake.pages, ...patch } });
  const setHome = (patch) => setPages({ home: { ...intake.pages.home, ...patch } });
  const setFreebie = (patch) => setHome({ freebie: { ...intake.pages.home.freebie, ...patch } });
  const setAbout = (patch) => setPages({ about: { ...intake.pages.about, ...patch } });
  const addService = () => setPages({ services: [...intake.pages.services, { name: "", format: "", whoFor: "", outcome: "", includes: "", process: "", notFor: "", price: "", action: "Book a call", actionLink: "" }] });
  const setService = (i, k, val) => setPages({ services: intake.pages.services.map((s, idx) => (idx === i ? { ...s, [k]: val } : s)) });
  const removeService = (i) => setPages({ services: intake.pages.services.filter((_, idx) => idx !== i) });
  const toggleAddon = (id) => setPages({ addons: intake.pages.addons.includes(id) ? intake.pages.addons.filter((x) => x !== id) : [...intake.pages.addons, id] });
  const setStrat = (patch) => set({ strategy: { ...intake.strategy, ...patch } });
  const setTesti = (patch) => setPages({ testimonials: { ...intake.pages.testimonials, ...patch } });
  const addTesti = () => setTesti({ items: [...intake.pages.testimonials.items, { quote: "", name: "", title: "", capacity: "", photo: "", link: "" }] });
  const setTestiItem = (i, k, v) => setTesti({ items: intake.pages.testimonials.items.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)) });
  const removeTesti = (i) => setTesti({ items: intake.pages.testimonials.items.filter((_, idx) => idx !== i) });
  const setBooking = (patch) => setPages({ booking: { ...intake.pages.booking, ...patch } });
  const setContact = (patch) => setPages({ contact: { ...intake.pages.contact, ...patch } });
  const setHandoff = (patch) => set({ handoff: { ...intake.handoff, ...patch } });

  const setStratItem = (key, i, val) => setStrat({ [key]: intake.strategy[key].map((x, idx) => (idx === i ? val : x)) });
  const addStratItem = (key) => setStrat({ [key]: [...intake.strategy[key], ""] });
  const removeStratItem = (key, i) => setStrat({ [key]: intake.strategy[key].filter((_, idx) => idx !== i) });
  const currentModule = step === "coreinfo" ? "Core info" : step.startsWith("voice") ? "Voice & client" : step.startsWith("pages") ? "Pages" : step.startsWith("strat") ? "Brand strategy" : step.startsWith("handoff") ? "Handoff" : "Branding";

  const quadrant = useMemo(() => {
    if (!intake.energy || !intake.temperature) return null;
    return intake.temperature + (intake.energy === "bold" ? "Bold" : "Soft");
  }, [intake.energy, intake.temperature]);

  const brandStepIndex =
    ["gate", "existing", "quiz", "result", "palette"].includes(step) ? 0 :
    step === "type" ? 1 : step === "imagery" ? 2 : step === "template" ? 3 : 4;
  const voiceStepIndex = step === "voice_tone" ? 0 : step === "voice_client" ? 1 : 2;
  const pagesStepIndex = step === "pages_home" ? 0 : step === "pages_services" ? 1 : step === "pages_about" ? 2 : step === "pages_proof" ? 3 : step === "pages_addons" ? 4 : 5;
  const handoffStepIndex = step === "handoff_legal" ? 0 : step === "handoff_notes" ? 1 : 2;
  const stratStepIndex = step === "strat_foundation" ? 0 : step === "strat_character" ? 1 : step === "strat_beliefs" ? 2 : step === "strat_proof" ? 3 : 4;
  const subSteps = currentModule === "Branding" ? BRAND_STEPS : currentModule === "Voice & client" ? VOICE_STEPS : currentModule === "Pages" ? PAGES_STEPS : currentModule === "Brand strategy" ? STRAT_STEPS : currentModule === "Handoff" ? HANDOFF_STEPS : ["Your basics"];
  const subIndex = currentModule === "Branding" ? brandStepIndex : currentModule === "Voice & client" ? voiceStepIndex : currentModule === "Pages" ? pagesStepIndex : currentModule === "Brand strategy" ? stratStepIndex : currentModule === "Handoff" ? handoffStepIndex : 0;
  const sideNote = currentModule === "Branding"
    ? "No logos or full identity design here. That's a separate à la carte add-on. This module sets color, type, and image direction."
    : currentModule === "Voice & client"
    ? "How you sound and exactly who you're talking to. This shapes the words on every page."
    : currentModule === "Pages"
    ? "The pages we'll build and what lives on each. We reuse your earlier answers so nothing's asked twice."
    : currentModule === "Brand strategy"
    ? "The foundation everything else is built on. What you do, who you help, and what you stand for. Take your time here."
    : currentModule === "Handoff"
    ? "Almost there. One thing you'll need to sort out yourself, then you're done."
    : "Contact details and a bit of background, so everything after this is tailored to you.";

  const p = intake.palette ? PALETTES[intake.palette] : null;
  const activePairing = intake.typePairing || (quadrant && QUADRANTS[quadrant] ? quadrant : null);

  const copyJSON = () => {
    const out = { module: "branding", ...intake, quadrant, paletteLabel: paletteLabel(intake), resolvedRoles: resolveRoles(intake) };
    navigator.clipboard?.writeText(JSON.stringify(out, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  /* -------------------------- STEP VIEWS -------------------------- */

  const c = intake.core;
  const canStartBranding = c.name.trim() && c.email.trim();
  const CoreInfo = (
    <StepShell
      eyebrow="Chapter one"
      title="First, let's get to know you."
      sub="A handful of questions to start. Nothing here is a test. There are no wrong answers, and we'll shape whatever you write into something polished later."
    >
      <CardFlow
        onComplete={() => setStep("gate")}
        completeLabel="Next: your look and feel →"
        cards={[
          { nav: "Hello",
            q: "Let's start with the basics.",
            why: "Your email is where drafts, questions, and launch updates will land, so use the inbox you actually check, even if it's different from the one you purchased with.",
            canNext: !!(c.name.trim() && c.email.trim()),
            body: (
              <>
                <label className="field-label" style={{ marginTop: 0 }}>What's your name?</label>
                <input className="field" autoFocus placeholder="First and last" value={c.name} onChange={(e) => setCore({ name: e.target.value })} />
                <label className="field-label">Where's the best place to reach you?</label>
                <input className="field" type="email" placeholder="you@yourbusiness.com" value={c.email} onChange={(e) => setCore({ email: e.target.value })} />
                <label className="field-label">Do you have a business name you go by? <span className="opt">optional</span></label>
                <input className="field" placeholder="What you go by" value={c.brand} onChange={(e) => setCore({ brand: e.target.value })} />
              </>
            ) },
          { nav: "What you do",
            q: "If someone asked what you do at a dinner party, what would you say?",
            why: "Say it the way you'd actually say it out loud. The plain version is almost always clearer than the polished one, and clarity is what turns a visitor into a client.",
            body: <textarea className="field" rows={2} placeholder="e.g. I help women with gut issues figure out what's actually going on" value={c.niche} onChange={(e) => setCore({ niche: e.target.value })} /> },
          { nav: "Experience",
            q: "How long have you been doing this work?",
            why: "Experience is one of the fastest ways to earn trust online. We'll find the right moment to mention it rather than burying it at the bottom of your about page.",
            body: (
              <div className="field-2col">
                <div>
                  <label className="field-label" style={{ marginTop: 0 }}>In practice</label>
                  <input className="field" placeholder="e.g. 8 years" value={c.yearsBusiness} onChange={(e) => setCore({ yearsBusiness: e.target.value })} />
                </div>
                <div>
                  <label className="field-label" style={{ marginTop: 0 }}>Online</label>
                  <input className="field" placeholder="e.g. 2 years" value={c.yearsOnline} onChange={(e) => setCore({ yearsOnline: e.target.value })} />
                </div>
              </div>
            ) },
          { nav: "How you work",
            q: "Do you work with people online, in person, or both?",
            why: "This shapes a surprising amount. In-person practices need an address, a map, and directions; online practices need to be clear about where they can legally work, since that's the first thing a prospective client checks.",
            body: (
              <>
                <div className="tone-wrap">
                  <button className={"tone-chip" + (c.mode === "online" ? " sel" : "")} onClick={() => setCore({ mode: "online" })}>Online only</button>
                  <button className={"tone-chip" + (c.mode === "inperson" ? " sel" : "")} onClick={() => setCore({ mode: "inperson" })}>In person</button>
                  <button className={"tone-chip" + (c.mode === "both" ? " sel" : "")} onClick={() => setCore({ mode: "both" })}>Both</button>
                </div>
                {(c.mode === "inperson" || c.mode === "both") && (
                  <div className="fade-in">
                    <label className="field-label">Where do you see people?</label>
                    <input className="field" placeholder="Practice or clinic name" value={c.locationName} onChange={(e) => setCore({ locationName: e.target.value })} />
                    <label className="field-label">Address to publish</label>
                    <textarea className="field" rows={2} placeholder="Street, city, state, zip. Say so if you'd rather show only the city." value={c.address} onChange={(e) => setCore({ address: e.target.value })} />
                  </div>
                )}
                {(c.mode === "online" || c.mode === "both") && (
                  <div className="fade-in">
                    <label className="field-label">Where are you licensed or able to work?</label>
                    <input className="field" placeholder="e.g. licensed in NY and NJ, or coaching clients anywhere" value={c.regions} onChange={(e) => setCore({ regions: e.target.value })} />
                  </div>
                )}
              </>
            ) },
          { nav: "Credentials",
            q: "What qualifications should make someone trust you immediately?",
            why: "Letters, licences, training, specialist certifications. Most practitioners undersell this. We'd rather have too much and choose than miss something that sets you apart.",
            body: <input className="field" placeholder="e.g. RD, MS, CDN" value={c.credentials} onChange={(e) => setCore({ credentials: e.target.value })} /> },
          { nav: "Your site",
            q: "Have you had a website before?",
            why: "Either answer is a good answer. If you have one, there's usually gold buried in it worth carrying over. If you don't, we get a clean slate, which is often faster.",
            body: (
              <>
                <div className="seg-row" style={{ maxWidth: 220 }}>
                  <button className={"seg" + (c.priorSite === true ? " sel" : "")} onClick={() => setCore({ priorSite: true })}>Yes</button>
                  <button className={"seg" + (c.priorSite === false ? " sel" : "")} onClick={() => setCore({ priorSite: false, priorSiteLive: null, priorSiteUrl: "" })}>No</button>
                </div>
                {c.priorSite === true && (
                  <div className="fade-in">
                    <label className="field-label">Is it still up?</label>
                    <div className="seg-row" style={{ maxWidth: 220 }}>
                      <button className={"seg" + (c.priorSiteLive === true ? " sel" : "")} onClick={() => setCore({ priorSiteLive: true })}>Yes</button>
                      <button className={"seg" + (c.priorSiteLive === false ? " sel" : "")} onClick={() => setCore({ priorSiteLive: false })}>No</button>
                    </div>
                    <label className="field-label">Mind sharing the link?</label>
                    <p className="why" style={{ margin: "0 0 10px" }}>We'll read it before we start. Often your best writing is already sitting there in an old blog post or bio.</p>
                    <input className="field" placeholder="https://…" value={c.priorSiteUrl} onChange={(e) => setCore({ priorSiteUrl: e.target.value })} />
                  </div>
                )}
              </>
            ) },
        ]}
      />
    </StepShell>
  );

  const Gate = (
    <StepShell
      eyebrow="Next, the foundation"
      title="Let's start with your look."
      sub="Colors and fonts are the base everything else sits on. First: do you already have a brand you want us to build with?"
    >
      <div className="choice-grid">
        <button className="big-choice" onClick={() => { set({ hasBrand: true }); setStep("existing"); }}>
          <span className="big-choice-title">Yes, I have brand colors & fonts</span>
          <span className="big-choice-sub">You'll share them and we'll skip the picker.</span>
        </button>
        <button className="big-choice" onClick={() => { set({ hasBrand: false, quizAnswers: {}, energy: null, temperature: null }); setQi(0); setStep("quiz"); }}>
          <span className="big-choice-title">Not really. Help me choose</span>
          <span className="big-choice-sub">A few quick, visual questions land you on the right palette. No design-speak.</span>
        </button>
      </div>
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("coreinfo")}>Back</button>
      </div>
      <AlaCarteNote />
    </StepShell>
  );

  const filledColors = BRAND_ROLES.filter((r) => (intake.existing.roles[r.key] || "").trim()).length;
  const reqFonts = BRAND_FONTS.filter((f) => !f.optional);
  const filledFonts = reqFonts.filter((f) => (intake.existing.fonts[f.key] || "").trim()).length;

  const Existing = (
    <StepShell
      eyebrow="Your existing brand"
      title="Let's map it onto our system."
      sub="We build every site on six color roles and two fonts. Drop in what you already have. Leave anything blank, so we both see exactly what's missing."
    >
      <div className="gap-bar">
        <span><strong>{filledColors}</strong> of 6 colors</span>
        <span className="gap-div" />
        <span><strong>{filledFonts}</strong> of {reqFonts.length} fonts</span>
        <span className="gap-hint">Blanks are fine. They're the gaps we'll fill or flag.</span>
      </div>

      <div className="role-list">
        {BRAND_ROLES.map((r) => {
          const val = intake.existing.roles[r.key] || "";
          return (
            <div className={"role-row" + (val.trim() ? "" : " empty")} key={r.key}>
              <div className="role-swatch" style={isHex(val) ? { background: val.trim() } : undefined}>
                {!isHex(val) && <span>?</span>}
              </div>
              <div className="role-meta">
                <div className="role-name">{r.name} <span className="role-token">{r.token}</span></div>
                <div className="role-plain">{r.plain}</div>
              </div>
              <input className="role-input" placeholder="#hex or name" value={val}
                onChange={(e) => setRole(r.key, e.target.value)} />
            </div>
          );
        })}
      </div>

      <div className="sub-head">Fonts</div>
      <div className="role-list">
        {BRAND_FONTS.map((f) => {
          const val = intake.existing.fonts[f.key] || "";
          return (
            <div className={"role-row" + (val.trim() || f.optional ? "" : " empty")} key={f.key}>
              <div className="role-meta">
                <div className="role-name">{f.name} {f.optional && <span className="role-token">optional</span>}</div>
                <div className="role-plain">{f.plain}</div>
              </div>
              <input className="role-input wide" placeholder={f.optional ? "e.g. Great Vibes, or skip" : "font name"} value={val}
                onChange={(e) => setFont(f.key, e.target.value)} />
            </div>
          );
        })}
      </div>

      <label className="field-label" style={{ marginTop: 20 }}>Brand guide or notes <span className="opt">a link, or how you use these</span></label>
      <textarea className="field" rows={3} placeholder="Link to a brand guide, or notes on how it's meant to be used…" value={intake.existing.notes}
        onChange={(e) => set({ existing: { ...intake.existing, notes: e.target.value } })} />

      {(filledColors < 6 || filledFonts < reqFonts.length) && (
        <div className="info-note">
          Missing a few? We'll fill any empty role from the WPWS palette closest to your colors, and flag anything worth adding before launch.
        </div>
      )}

      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("gate")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("template")}>Continue</button>
      </div>
      <AlaCarteNote />
    </StepShell>
  );

  const answerQ = (optIndex) => {
    const q = QUIZ[qi];
    const next = { ...intake.quizAnswers, [q.id]: optIndex };
    set({ quizAnswers: next });
    if (qi < QUIZ.length - 1) {
      setQi(qi + 1);
    } else {
      const s = scoreQuiz(next);
      set({ energy: s.energyLvl, temperature: s.temperature });
      setStep("result");
    }
  };

  const Quiz = (() => {
    const q = QUIZ[qi];
    const chosen = intake.quizAnswers[q.id];
    return (
      <StepShell eyebrow={"Question " + (qi + 1) + " of " + QUIZ.length} title={q.q} sub={q.help}>
        <div className="quiz-progress">
          {QUIZ.map((_, i) => <span key={i} className={"qp" + (i <= qi ? " on" : "")} />)}
        </div>
        <div className="quiz-grid">
          {q.options.map((o, i) => (
            <button key={i} className={"quiz-opt " + q.kind + (chosen === i ? " sel" : "")} onClick={() => answerQ(i)}>
              {o.img && (
                <img className="quiz-img" src={o.img} alt={o.alt || ""} loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }} />
              )}
              {o.sw && (
                <span className="quiz-sw">{o.sw.map((c, j) => <i key={j} style={{ background: c }} />)}</span>
              )}
              <span className="quiz-opt-body">
                <span className="quiz-label">{o.label}</span>
                {o.sub && <span className="quiz-sub">{o.sub}</span>}
              </span>
            </button>
          ))}
        </div>
        {q.note && <div className="quiz-note">{q.note}</div>}
        <div className="nav-row">
          <button className="btn-ghost" onClick={() => { if (qi === 0) setStep("gate"); else setQi(qi - 1); }}>Back</button>
          <span className="quiz-skip">Tap an option to continue</span>
        </div>
      </StepShell>
    );
  })();

  const Result = (() => {
    const qd = quadrant && QUADRANTS[quadrant] ? QUADRANTS[quadrant] : null;
    return (
      <StepShell
        eyebrow="Your result"
        title={qd ? "You read as a " + qd.archetype + "." : "Here's where you landed."}
        sub={qd
          ? "That points to a " + (intake.temperature === "warm" ? "warm" : "cool") + ", " + (intake.energy === "bold" ? "bold" : "soft") + " direction. " + qd.feel + ". If a dial feels off, flip it."
          : ""}
      >
        <div className="dials">
          <div className="dial">
            <span className="dial-label">Temperature</span>
            <div className="seg-row">
              <button className={"seg" + (intake.temperature === "warm" ? " sel" : "")} onClick={() => set({ temperature: "warm" })}>Warm</button>
              <button className={"seg" + (intake.temperature === "cool" ? " sel" : "")} onClick={() => set({ temperature: "cool" })}>Cool</button>
            </div>
          </div>
          <div className="dial">
            <span className="dial-label">Energy</span>
            <div className="seg-row">
              <button className={"seg" + (intake.energy === "bold" ? " sel" : "")} onClick={() => set({ energy: "bold" })}>Bold</button>
              <button className={"seg" + (intake.energy === "soft" ? " sel" : "")} onClick={() => set({ energy: "soft" })}>Soft</button>
            </div>
          </div>
        </div>
        <div className="nav-row">
          <button className="btn-ghost" onClick={() => { setQi(QUIZ.length - 1); setStep("quiz"); }}>Back</button>
          <button className="btn-solid" disabled={!quadrant}
            onClick={() => { set({ quadrant }); setStep("palette"); setShowAll(false); }}>See my palettes →</button>
        </div>
      </StepShell>
    );
  })();

  const Palette = (() => {
    const q = quadrant && QUADRANTS[quadrant] ? QUADRANTS[quadrant] : null;
    const shown = q ? q.palettes : [];
    const allIds = Object.keys(PALETTES).filter((k) => k !== "gallery");
    const galleryData = {
      ...PALETTES.gallery,
      name: "Minimal, plus your own accent",
      vibe: intake.galleryAccent ? "Accent borrowed from " + PALETTES[intake.galleryAccent].name : "Neutral base. Choose an accent color after selecting.",
      roles: resolveGalleryRoles(intake.galleryAccent),
    };
    return (
      <StepShell
        eyebrow={q ? q.archetype + ". " + q.feel : "Your quadrant"}
        title="Here are the palettes that fit your vibe."
        sub="Each is a real mini mood-board. Same layout, its own colors. Pick a full palette, or choose Minimal and then pick a single accent color of your own."
      >
        <div className="palette-grid">
          {shown.map((id) => (
            <PaletteCard key={id} id={id} selected={intake.palette === id} pairing={activePairing}
              onSelect={(x) => set({ palette: x })} />
          ))}
          <div className="minimal-wrap">
            <PaletteCard key="gallery" id="gallery" data={galleryData} selected={intake.palette === "gallery"}
              pairing={activePairing} onSelect={(x) => set({ palette: x })} />
            <div className="minimal-cue">{intake.palette === "gallery" ? "Pick your accent below" : "Select this to choose your own accent color"}</div>
          </div>
        </div>

        {intake.palette === "gallery" && q && (
          <div className="accent-panel fade-in">
            <div className="accent-title">
              Add one accent color
              <span>Keep it fully neutral, or borrow a color from a palette in your quadrant. The gallery structure stays. Only the accent changes.</span>
            </div>
            <div className="accent-row">
              <button className={"accent-chip" + (!intake.galleryAccent ? " sel" : "")} onClick={() => set({ galleryAccent: null })}>
                <span className="accent-dots">
                  <i style={{ background: PALETTES.gallery.roles.lead }} /><i style={{ background: PALETTES.gallery.roles.spice }} />
                </span>
                Fully neutral
              </button>
              {q.palettes.map((pid) => (
                <button key={pid} className={"accent-chip" + (intake.galleryAccent === pid ? " sel" : "")} onClick={() => set({ galleryAccent: pid })}>
                  <span className="accent-dots">
                    <i style={{ background: PALETTES[pid].roles.lead }} /><i style={{ background: PALETTES[pid].roles.spice }} />
                  </span>
                  {PALETTES[pid].name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="quiet-link" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Hide the rest" : "None of these feel like you? See every palette →"}
        </button>

        {showAll && (
          <div style={{ marginTop: 16 }}>
            <div className="palette-grid">
              {allIds.filter((id) => !shown.includes(id)).map((id) => (
                <PaletteCard key={id} id={id} selected={intake.palette === id} pairing={activePairing}
                  onSelect={(x) => set({ palette: x })} />
              ))}
            </div>
          </div>
        )}

        <div className="nav-row">
          <button className="btn-ghost" onClick={() => setStep("result")}>Back</button>
          <button className="btn-solid" disabled={!intake.palette} onClick={() => setStep("type")}>Choose type →</button>
        </div>
        <AlaCarteNote />
      </StepShell>
    );
  })();

  const Type = (() => {
    const suggested = quadrant && PAIRINGS[quadrant] ? quadrant : "warmSoft";
    const chosenKey = intake.typePairing || suggested;
    const others = Object.keys(PAIRINGS).filter((k) => k !== chosenKey);
    const specimen = (key, isSuggested) => {
      const pr = PAIRINGS[key];
      const face = intake.typeSilhouette === "sans" ? pr.sans : pr.serif;
      const selected = (intake.typePairing || suggested) === key;
      return (
        <button key={key} className={"type-card" + (selected ? " sel" : "")} onClick={() => set({ typePairing: key })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="type-tag">{isSuggested ? "Suggested for your palette" : "Alternative"}</span>
            <span className="type-names">{face} + {pr.body}</span>
          </div>
          <div style={{ fontFamily: "'" + face + "', Georgia, serif", fontSize: 30, lineHeight: 1.05, marginTop: 10 }}>
            Straight to the point.
          </div>
          <div style={{ fontFamily: "'" + pr.body + "', system-ui, sans-serif", fontSize: 13, lineHeight: 1.55, marginTop: 8, opacity: 0.85 }}>
            The body face carries every paragraph. {pr.suits.toLowerCase()}
          </div>
        </button>
      );
    };
    return (
      <StepShell
        eyebrow="Step 2, type"
        title="We think this pairing fits."
        sub="Color and type are separate dials, so any pairing works with any palette. Keep our pick, or browse the others."
      >
        <div className="silhouette-toggle">
          <span style={{ fontSize: 12.5, opacity: 0.6, marginRight: 4 }}>Headline style:</span>
          <button className={intake.typeSilhouette === "serif" ? "seg sel" : "seg"} onClick={() => set({ typeSilhouette: "serif" })}>Serif</button>
          <button className={intake.typeSilhouette === "sans" ? "seg sel" : "seg"} onClick={() => set({ typeSilhouette: "sans" })}>Sans</button>
        </div>
        {specimen(suggested, true)}
        <div className="quiet-link" style={{ cursor: "default", opacity: 0.5, marginTop: 18 }}>Other pairings</div>
        <div className="type-others">{others.map((k) => specimen(k, false))}</div>
        <div className="nav-row">
          <button className="btn-ghost" onClick={() => setStep("palette")}>Back</button>
          <button className="btn-solid" onClick={() => { if (!intake.typePairing) set({ typePairing: suggested }); setStep("imagery"); }}>
            Continue →
          </button>
        </div>
      </StepShell>
    );
  })();

  const Imagery = (
    <StepShell
      eyebrow="Step 3, imagery"
      title="Photos."
      sub="Your own photos always beat stock. Let's see what you have, then set the direction for anything we source."
    >
      <div className="sub-head" style={{ marginTop: 0 }}>Your photos</div>
      <p className="why">Headshots, photos of you working, your space, your products, anything recent you'd like on the site.</p>
      <div className="tone-wrap">
        <button className={"tone-chip" + (intake.photos.has === "yes" ? " sel" : "")} onClick={() => setPhotos({ has: "yes" })}>I have photos</button>
        <button className={"tone-chip" + (intake.photos.has === "some" ? " sel" : "")} onClick={() => setPhotos({ has: "some" })}>A few, but they're dated</button>
        <button className={"tone-chip" + (intake.photos.has === "no" ? " sel" : "")} onClick={() => setPhotos({ has: "no" })}>None yet</button>
      </div>
      {(intake.photos.has === "yes" || intake.photos.has === "some") && (
        <div style={{ marginTop: 16 }}>
          <label className="field-label">Where can we get them?</label>
          <p className="why">A Google Drive or Dropbox link is easiest. You can also email them over. Whatever's simplest.</p>
          <input className="field" placeholder="Paste a shared folder link" value={intake.photos.link} onChange={(e) => setPhotos({ link: e.target.value })} />
          <label className="field-label">Anything we should know about them?</label>
          <textarea className="field" rows={2} placeholder="e.g. use the ones in the green sweater, please don't use the older headshots" value={intake.photos.notes} onChange={(e) => setPhotos({ notes: e.target.value })} />
        </div>
      )}
      {intake.photos.has === "no" && (
        <div className="info-note" style={{ marginTop: 12 }}>No problem. We'll build with stock and leave obvious spots for your photos later. A good headshot is the single best upgrade you can make down the line.</div>
      )}

      <div className="sub-head">Stock photos</div>
      <p className="why">{p ? "Your palette suggests: " + p.photo : "What should the photos lean on? Choose as many as apply."}</p>
      <div className="imagery-grid">
        {IMAGERY_OPTIONS.map((o) => {
          const on = intake.imagery.includes(o.id);
          return (
            <button key={o.id} className={"chip-choice" + (on ? " sel" : "")}
              onClick={() => set({ imagery: on ? intake.imagery.filter((x) => x !== o.id) : [...intake.imagery, o.id] })}>
              <span className="chip-title">{o.label}</span>
              <span className="chip-hint">{o.hint}</span>
            </button>
          );
        })}
      </div>
      <label className="field-label" style={{ marginTop: 18 }}>Anything to feature or avoid? <span className="opt">optional</span></label>
      <textarea className="field" rows={2} placeholder="e.g. lots of veggies, no stock-photo smiles, real food not styled plates…"
        value={intake.imageryNotes} onChange={(e) => set({ imageryNotes: e.target.value })} />
      <div className="info-note">
        When your imagery includes people, we pull diverse, inclusive stock that fits your audience wherever we can.
      </div>
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("type")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("template")}>Choose a layout →</button>
      </div>
    </StepShell>
  );

  const templateFace = activePairing && PAIRINGS[activePairing]
    ? (intake.typeSilhouette === "sans" ? PAIRINGS[activePairing].sans : PAIRINGS[activePairing].serif)
    : "Fraunces";
  const Template = (
    <StepShell
      eyebrow="Step 4, layout"
      title="Pick a direction, not a final design."
      sub="Three starting vibes for your site. Shown in your colors. Your build flexes around your services and what you share, so treat this as the feel, not a locked layout."
    >
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <button key={t.id} className={"template-card" + (intake.template === t.id ? " sel" : "")} onClick={() => set({ template: t.id })}>
            <TemplatePreview id={t.id} roles={resolveRoles(intake)} displayFont={templateFace} />
            <div className="template-cap">Homepage. Top section</div>
            <div className="template-name">{t.name}</div>
            <div className="template-tag">{t.tagline}</div>
            <div className="template-blurb">{t.blurb}</div>
          </button>
        ))}
      </div>
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep(intake.hasBrand ? "existing" : "imagery")}>Back</button>
        <button className="btn-solid" disabled={!intake.template} onClick={() => setStep("review")}>Review →</button>
      </div>
    </StepShell>
  );

  const Review = (() => {
    if (intake.hasBrand) {
      const er = intake.existing.roles;
      const gapsC = BRAND_ROLES.filter((r) => !(er[r.key] || "").trim()).map((r) => r.name);
      const gapsF = BRAND_FONTS.filter((f) => !f.optional && !(intake.existing.fonts[f.key] || "").trim()).map((f) => f.name);
      const fontLine = [intake.existing.fonts.display, intake.existing.fonts.body].filter(Boolean).join(" + ") || "Not yet";
      return (
        <StepShell eyebrow="Review" title="We'll build with your existing brand."
          sub="Here's your brand mapped onto our six roles. Dashed slots are gaps. We'll fill or flag them.">
          <div className="brand-board" style={{ background: "#FBFAF8", color: "#232019" }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", flexWrap: "wrap" }}>
              {BRAND_ROLES.map((r) => {
                const v = (er[r.key] || "").trim();
                return (
                  <div key={r.key} style={{ textAlign: "center" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 7,
                      background: isHex(v) ? v : "transparent",
                      border: isHex(v) ? "1px solid rgba(0,0,0,.12)" : "1.5px dashed rgba(0,0,0,.28)",
                    }} title={v || "not provided"} />
                    <div style={{ fontSize: 9.5, letterSpacing: ".04em", textTransform: "uppercase", marginTop: 4, opacity: 0.6 }}>{r.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="review-card" style={{ marginTop: 16 }}>
            <ReviewRow label="Fonts" value={fontLine} onEdit={() => setStep("existing")} />
            <ReviewRow label="Template" value={intake.template ? TEMPLATES.find((t) => t.id === intake.template).name : "Not yet"} onEdit={() => setStep("template")} />
            <ReviewRow label="Notes" value={intake.existing.notes || "Not yet"} onEdit={() => setStep("existing")} />
          </div>
          {(gapsC.length > 0 || gapsF.length > 0) && (
            <div className="info-note" style={{ marginTop: 14 }}>
              <strong style={{ fontWeight: 600 }}>Gaps to resolve:</strong>{" "}
              {[...gapsC, ...gapsF].join(", ")}. We'll match these from your closest WPWS palette, or confirm with you.
            </div>
          )}
          <FinishBlock copyJSON={copyJSON} copied={copied} onBack={() => setStep("template")} onNext={() => setStep("strat_foundation")} sub="Next module: Brand strategy." />
        </StepShell>
      );
    }
    const pr = activePairing ? PAIRINGS[activePairing] : null;
    const face = pr ? (intake.typeSilhouette === "sans" ? pr.sans : pr.serif) : null;
    const roles = resolveRoles(intake);
    const isGallery = intake.palette === "gallery";
    const boardName = isGallery ? "Minimal" : (p ? p.name : "");
    const boardVibe = isGallery
      ? (intake.galleryAccent ? PALETTES[intake.galleryAccent].name + " accent" : "Fully neutral")
      : (p ? p.vibe : "");
    return (
      <StepShell eyebrow="Review" title="Here's your brand foundation."
        sub="This is what carries into every page we build. Edit anything that's off.">
        {roles && (
          <div className="brand-board" style={{ background: roles.base, color: roles.ink }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: "'" + (face || "Fraunces") + "', Georgia, serif", fontSize: 26 }}>{boardName}</span>
              <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", opacity: 0.6 }}>{boardVibe}{QUADRANTS[quadrant] ? " · " + QUADRANTS[quadrant].archetype : ""}</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "space-between" }}>
              {Object.entries(roles).map(([k, v]) => <Swatch key={k} hex={v} label={k} />)}
            </div>
            {pr && (
              <div style={{ marginTop: 18, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 14 }}>
                <span style={{ fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", opacity: 0.55 }}>Type</span>
                <div style={{ fontFamily: "'" + face + "', Georgia, serif", fontSize: 24, marginTop: 4 }}>{face}</div>
                <div style={{ fontFamily: "'" + pr.body + "', system-ui, sans-serif", fontSize: 13, opacity: 0.8 }}>with {pr.body} for body</div>
              </div>
            )}
          </div>
        )}
        <div className="review-card" style={{ marginTop: 16 }}>
          <ReviewRow label="Palette" value={paletteLabel(intake) || "Not yet"} onEdit={() => setStep("palette")} />
          <ReviewRow label="Type" value={pr ? (face + " + " + pr.body) : "Not yet"} onEdit={() => setStep("type")} />
          <ReviewRow label="Imagery" value={intake.imagery.length ? intake.imagery.map((i) => IMAGERY_OPTIONS.find((o) => o.id === i).label).join(", ") : "Not yet"} onEdit={() => setStep("imagery")} />
          <ReviewRow label="Your photos" value={intake.photos.has === "yes" ? "Has photos" + (intake.photos.link ? " · link provided" : "") : intake.photos.has === "some" ? "A few, dated" : intake.photos.has === "no" ? "None yet. Stock for now" : "Not yet"} onEdit={() => setStep("imagery")} />
          {intake.imageryNotes && <ReviewRow label="Notes" value={intake.imageryNotes} onEdit={() => setStep("imagery")} />}
          <ReviewRow label="Template" value={intake.template ? TEMPLATES.find((t) => t.id === intake.template).name : "Not yet"} onEdit={() => setStep("template")} />
        </div>
        <FinishBlock copyJSON={copyJSON} copied={copied} onBack={() => setStep("template")} onNext={() => setStep("strat_foundation")} sub="Next module: Brand strategy." />
      </StepShell>
    );
  })();

  const vc = intake.voice;
  const st = intake.strategy;
  const stratArch = quadrant && STRAT_ARCHETYPE[quadrant] ? STRAT_ARCHETYPE[quadrant] : null;
  const stratDiff = st.different.filter((x) => x.trim());
  const stratPov = st.pov.filter((x) => x.trim());
  const toneSuggested = quadrant && TONE_SUGGEST[quadrant] ? TONE_SUGGEST[quadrant] : [];

  const VoiceTone = (
    <StepShell
      eyebrow="Step 1, your voice"
      title="How should your brand sound?"
      sub="We'll write in your voice, not ours, so we need to hear it first."
    >
      <CardFlow
        onExit={() => setStep("strat_review")}
        onComplete={() => setStep("voice_client")}
        cards={[
          { nav: "The feel",
            q: "Which of these sound like something you'd say?",
            why: "Don't overthink the labels underneath. Read the lines and pick the ones that feel like you. Three or fewer, so your website has a clear voice: one that tries to be everything ends up sounding like no one.",
            canNext: vc.toneWords.length > 0,
            body: (
              <>
                {toneSuggested.length > 0 && (
                  <div className="recap">
                    <div className="recap-title">Based on your brand so far</div>
                    <div className="recap-row"><span>These often fit: {toneSuggested.join(", ")}</span></div>
                  </div>
                )}
                <div className="tone-grid">
                  {TONE_WORDS.map((t) => {
                    const on = vc.toneWords.includes(t.word);
                    const atMax = vc.toneWords.length >= 3 && !on;
                    return (
                      <button key={t.word} className={"tone-card" + (on ? " sel" : "") + (atMax ? " dim" : "")} disabled={atMax}
                        onClick={() => setVoice({ toneWords: on ? vc.toneWords.filter((x) => x !== t.word) : [...vc.toneWords, t.word] })}>
                        <span className="tone-sample">"{t.sample}"</span>
                        <span className="tone-word">{on ? "✓ " : ""}{t.word}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) },
          { nav: "At your best",
            q: "Who do you sound like when you're at your best?",
            why: "A few ways in: How do you talk to a client who's had a rough week? Are you the friend who tells it straight, or softens it? If a stranger read your texts, what would they say you're like? Is there a writer or podcaster whose way of talking you'd love yours to feel like?",
            body: <textarea className="field" rows={4} placeholder="Answer any of those, a few sentences is plenty" value={vc.soundLike} onChange={(e) => setVoice({ soundLike: e.target.value })} /> },
          { nav: "Your words",
            q: "What words and phrases are yours?",
            why: "Your go-to's are a fingerprint. The sign-offs, the way you open, what you call the people you help. Knowing what makes you cringe is just as useful, because it stops us writing something you'd never say.",
            body: (
              <>
                <label className="field-label" style={{ marginTop: 0 }}>Phrases you use a lot</label>
                <textarea className="field" rows={2} placeholder="e.g. 'okay, real talk…', 'let's dig in', 'friend', 'here's the thing'" value={vc.phrasesUse} onChange={(e) => setVoice({ phrasesUse: e.target.value })} />
                <label className="field-label">Words, phrases, or tones to avoid</label>
                <textarea className="field" rows={2} placeholder="e.g. 'hustle', 'boss babe', anything clinical or salesy" value={vc.avoid} onChange={(e) => setVoice({ avoid: e.target.value })} />
              </>
            ) },
          { nav: "How you write",
            q: "How do you write when it's really you?",
            why: "These small mechanics are what make copy read as written by a person rather than assembled. Tap whatever fits. There's no right answer, and leaving the emoji box empty simply tells us you don't use them.",
            body: (
              <>
                <label className="field-label" style={{ marginTop: 0 }}>Your go-to emojis <span className="opt">leave blank if you don't use them</span></label>
                <input className="field" placeholder="🙌 ✨ 💛 🤍 😅" value={vc.emojis} onChange={(e) => setVoice({ emojis: e.target.value })} />
                <div style={{ marginTop: 24 }}>
                  <StyleRow label="Exclamation points" options={["Rarely", "Some", "Lots!!"]} value={vc.style.exclaim} onChange={(v) => setStyle({ exclaim: v })} />
                  <StyleRow label="Long dashes and trailing dots" hint="the pause-mid-sentence punctuation" options={["Not my thing", "Yep, that's me"]} value={vc.style.flair} onChange={(v) => setStyle({ flair: v })} />
                  <StyleRow label="Sentences" options={["Short & punchy", "Flowing & warm", "A mix"]} value={vc.style.rhythm} onChange={(v) => setStyle({ rhythm: v })} />
                  <StyleRow label="Capitalization" options={["Standard", "lowercase, on purpose"]} value={vc.style.casing} onChange={(v) => setStyle({ casing: v })} />
                  <StyleRow label="Swearing" options={["Never", "Mild, now and then", "Part of my brand"]} value={vc.style.swearing} onChange={(v) => setStyle({ swearing: v })} />
                </div>
              </>
            ) },
          { nav: "In the wild",
            q: "Where can we read or hear you being yourself?",
            why: "This is the single most useful thing you can give us. Nothing describes a voice as well as a sample of it. Skip anything you don't have; plenty of people don't have these yet, and that's completely fine.",
            body: (
              <>
                <label className="field-label" style={{ marginTop: 0 }}>Writing you're proud of <span className="opt">blog posts, newsletters, long captions</span></label>
                <textarea className="field" rows={3} placeholder="Paste links, or the text itself. Pick pieces that sound most like you; if AI helped polish it, just say so." value={vc.samples.writing} onChange={(e) => setSamples({ writing: e.target.value })} />
                <label className="field-label">Anywhere we can hear you <span className="opt">podcasts, talks, videos</span></label>
                <textarea className="field" rows={2} placeholder="Podcast episodes you've guested on, talks, IG lives, YouTube, anywhere you're talking naturally" value={vc.samples.spoken} onChange={(e) => setSamples({ spoken: e.target.value })} />
              </>
            ) },
        ]}
      />
    </StepShell>
  );

  const VoiceClient = (
    <StepShell
      eyebrow="Step 2, ideal client"
      title="Who are we speaking to?"
      sub="You won't write any copy here. Just pour out what you know, and we'll shape it into the words on your pages."
    >
      <CardFlow
        onExit={() => setStep("voice_tone")}
        onComplete={() => setStep("voice_review")}
        cards={[
          { nav: "Their words",
            q: "In their own words, how do they describe the problem?",
            why: "Quote them as closely as you can. This is the most valuable answer in the whole intake. The best headlines are almost always a client's own phrasing played back to them, and no amount of clever writing beats hearing your own words on a page.",
            body: (
              <>
                {(st.whoServe || intake.core.priorSiteUrl) && (
                  <div className="recap">
                    <div className="recap-title">What we have so far</div>
                    {st.whoServe && <div className="recap-row"><span>You help: {st.whoServe.slice(0, 100)}{st.whoServe.length > 100 ? "…" : ""}</span></div>}
                    {intake.core.priorSiteUrl && <div className="recap-row"><span>We'll also read {intake.core.priorSiteUrl}</span></div>}
                  </div>
                )}
                <textarea className="field" rows={4} placeholder="e.g. 'I have no energy by 3pm', 'nothing fits and I hate photos of myself'" value={vc.clientWords} onChange={(e) => setVoice({ clientWords: e.target.value })} />
              </>
            ) },
          { nav: "What failed",
            q: "What have they already tried, and why did it let them down?",
            why: "Most people arrive having failed at something first. Naming that lets your site say \"we know what you've been through\" instead of pitching from scratch.",
            body: <textarea className="field" rows={3} placeholder="Fad diets, other coaches, endless googling, and what was missing each time" value={vc.clientTried} onChange={(e) => setVoice({ clientTried: e.target.value })} /> },
          { nav: "What they want",
            q: "What do they really want?",
            why: "There's usually a surface goal and a deeper one underneath. \"Lose 15 lbs\" on the surface; to feel like themselves again underneath. The surface gets the click, but the deeper one gets the booking.",
            body: <textarea className="field" rows={3} placeholder="The stated goal, and the real one behind it" value={vc.clientWants} onChange={(e) => setVoice({ clientWants: e.target.value })} /> },
          { nav: "Hesitation",
            q: "What holds them back, and what's the truth that answers it?",
            why: "Every hesitation you answer on the page is one that doesn't quietly lose you the client. If you know the objection, we can meet it before they've finished thinking it.",
            body: <textarea className="field" rows={3} placeholder="e.g. 'it's expensive / I've failed before', and why this time is genuinely different" value={vc.clientObjections} onChange={(e) => setVoice({ clientObjections: e.target.value })} /> },
        ]}
      />
    </StepShell>
  );


  const namedFeatures = intake.strategy.features.filter((f) => f.name.trim());
  const styleBits = Object.values(vc.style).filter(Boolean);
  const VoiceReview = (
    <StepShell eyebrow="Review" title="Your voice & client, captured."
      sub="Skim it over. Edit anything that's not quite right.">
      <div className="review-card">
        <ReviewRow label="Tone" value={vc.toneWords.length ? vc.toneWords.join(", ") : "Not yet"} onEdit={() => setStep("voice_tone")} />
        {vc.soundLike && <ReviewRow label="Sound like" value={vc.soundLike} onEdit={() => setStep("voice_tone")} />}
        {vc.phrasesUse && <ReviewRow label="Words you use" value={vc.phrasesUse} onEdit={() => setStep("voice_tone")} />}
        {vc.avoid && <ReviewRow label="Avoid" value={vc.avoid} onEdit={() => setStep("voice_tone")} />}
        {vc.emojis && <ReviewRow label="Emojis" value={vc.emojis} onEdit={() => setStep("voice_tone")} />}
        {styleBits.length > 0 && <ReviewRow label="Writing style" value={styleBits.join(" · ")} onEdit={() => setStep("voice_tone")} />}
        {(vc.samples.writing || vc.samples.spoken) && <ReviewRow label="Voice samples" value={[vc.samples.writing ? "writing ✓" : "", vc.samples.spoken ? "audio/video ✓" : ""].filter(Boolean).join(" · ")} onEdit={() => setStep("voice_tone")} />}
        <ReviewRow label="Their words" value={vc.clientWords || "Not yet"} onEdit={() => setStep("voice_client")} />
        <ReviewRow label="What they tried" value={vc.clientTried || "Not yet"} onEdit={() => setStep("voice_client")} />
        <ReviewRow label="What they want" value={vc.clientWants || "Not yet"} onEdit={() => setStep("voice_client")} />
        <ReviewRow label="Hesitation" value={vc.clientObjections || "Not yet"} onEdit={() => setStep("voice_client")} />
      </div>
      <FinishBlock copyJSON={copyJSON} copied={copied}
        onBack={() => setStep("voice_client")}
        onNext={() => setStep("pages_home")}
        title="Voice & client locked in."
        sub="Next module: Pages." />
    </StepShell>
  );

  const pg = intake.pages;

  const PagesHome = (
    <StepShell eyebrow="Step 1, home page" title="The thinking behind your home page."
      sub="You won't write headlines or copy. That's our job. These are the few strategic calls only you can make, and we build the page from them.">
      <div className="recap">
        <div className="recap-title">Already captured. We write your homepage from these</div>
        <div className="recap-row"><span>Who you help</span><span>{st.whoServe ? "✓ captured" : "Add in Brand strategy"}</span></div>
        <div className="recap-row"><span>What makes you different</span><span>{stratDiff.length ? "✓ captured" : "Add in Brand strategy"}</span></div>
        <div className="recap-row"><span>Credentials</span><span>{intake.core.credentials || "Add in Core info"}</span></div>
        <div className="recap-row"><span>As seen in</span><span>{namedFeatures.length ? namedFeatures.length + " added" : "None yet"}</span></div>
      </div>
      <label className="field-label">If a visitor remembers only ONE thing from your homepage, what should it be?</label>
      <textarea className="field" rows={3} placeholder="The single idea, in plain words. We turn it into the headline. e.g. 'you can eat well without giving up the foods you love'" value={pg.home.coreMessage} onChange={(e) => setHome({ coreMessage: e.target.value })} />
      <label className="field-label">What does a visitor need to believe to book with you?</label>
      <textarea className="field" rows={2} placeholder="The shift your homepage has to create. E.g. 'nutrition doesn't have to be all-or-nothing to work'" value={pg.home.convince} onChange={(e) => setHome({ convince: e.target.value })} />
      <label className="field-label">Who's a perfect fit, and who isn't? <span className="opt">so we speak to the right person</span></label>
      <textarea className="field" rows={2} placeholder="The person this is for, and the person it's not. Being clear on both sharpens everything" value={pg.home.fit} onChange={(e) => setHome({ fit: e.target.value })} />
      <label className="field-label">Main call to action <span className="opt">the one action that matters most</span></label>
      <div className="tone-wrap">
        {CTA_OPTIONS.map((o) => (
          <button key={o} className={"tone-chip" + (pg.home.cta === o ? " sel" : "")} onClick={() => setHome({ cta: o })}>{o}</button>
        ))}
      </div>

      <div className="sub-head">Lead magnet</div>
      <p className="why">If you already have a freebie, we can feature it on your homepage. We write the opt-in copy. You just connect it.</p>
      <div className="tone-wrap">
        <button className={"tone-chip" + (pg.home.freebie.has === true ? " sel" : "")} onClick={() => setFreebie({ has: true })}>Yes. Feature it</button>
        <button className={"tone-chip" + (pg.home.freebie.has === false ? " sel" : "")} onClick={() => setFreebie({ has: false })}>Not yet</button>
      </div>
      {pg.home.freebie.has === true && (
        <div style={{ marginTop: 16 }}>
          <label className="field-label">What is it? <span className="opt">title + what they get</span></label>
          <input className="field" placeholder="e.g. 5-Day Sugar Reset. PDF guide + a short email series" value={pg.home.freebie.what} onChange={(e) => setFreebie({ what: e.target.value })} />
          <label className="field-label">Where does it live? <span className="opt">your email platform</span></label>
          <input className="field" placeholder="e.g. Kit (ConvertKit), Mailchimp, Flodesk" value={pg.home.freebie.platform} onChange={(e) => setFreebie({ platform: e.target.value })} />
          <label className="field-label">Embed code or sign-up link <span className="opt">paste whichever you have</span></label>
          <textarea className="field" rows={3} placeholder="Paste the form's embed code, or a link to the sign-up page. Not sure which? Leave your platform above and we'll pull it from you." value={pg.home.freebie.connect} onChange={(e) => setFreebie({ connect: e.target.value })} />
        </div>
      )}
      {pg.home.freebie.has === false && (
        <div className="info-note" style={{ marginTop: 12 }}>No problem. We'll leave room for one down the line. Building a freebie or a full funnel is part of our high-tier package, not this build.</div>
      )}

      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("voice_review")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("pages_services")}>Next →</button>
      </div>
    </StepShell>
  );

  const PagesServices = (
    <StepShell eyebrow="Step 2, services" title="What do you offer?"
      sub="Tell us properly about each one. The more we know, the less generic the page. Up to three; more than that and the page gets crowded and nobody picks anything.">
      {pg.services.length === 0 && <p className="why">Add your first service to get started.</p>}
      {pg.services.map((s, i) => (
        <div className="service-card" key={i}>
          <div className="service-head">
            <span className="service-num">Service {i + 1}</span>
            <button className="feature-x" onClick={() => removeService(i)} title="Remove">×</button>
          </div>
          <label className="field-label" style={{ marginTop: 0 }}>What's it called?</label>
          <input className="field" placeholder="e.g. 12-Week Gut Reset" value={s.name} onChange={(e) => setService(i, "name", e.target.value)} />

          <label className="field-label">How does it work? <span className="opt">format and length</span></label>
          <input className="field" placeholder="e.g. 1:1, virtual, 12 weekly 50-min sessions" value={s.format} onChange={(e) => setService(i, "format", e.target.value)} />

          <label className="field-label">Who is this one for?</label>
          <p className="why">Be specific. The person you picture when you describe it.</p>
          <textarea className="field" rows={2} placeholder="e.g. Someone who's been bloated for years and told everything looks normal" value={s.whoFor} onChange={(e) => setService(i, "whoFor", e.target.value)} />

          <label className="field-label">Where are they by the end?</label>
          <p className="why">What's actually different for them when you finish working together.</p>
          <textarea className="field" rows={2} placeholder="e.g. They know their triggers, eat without fear, and have a plan for flare-ups" value={s.outcome} onChange={(e) => setService(i, "outcome", e.target.value)} />

          <label className="field-label">What's included?</label>
          <p className="why">Everything they get. Sessions, messaging between visits, lab work, meal plans, resources, follow-up.</p>
          <textarea className="field" rows={3} placeholder="List it all out. Even the small things you take for granted" value={s.includes} onChange={(e) => setService(i, "includes", e.target.value)} />

          <label className="field-label">What happens, step by step?</label>
          <p className="why">Walk us through it from the moment they book. People buy far more readily when they can picture the process.</p>
          <textarea className="field" rows={3} placeholder="e.g. Intake form → 90-min first visit → labs → plan built together → check-ins every 2 weeks" value={s.process} onChange={(e) => setService(i, "process", e.target.value)} />

          <label className="field-label">Who is it <em>not</em> for? <span className="opt">optional, but useful</span></label>
          <textarea className="field" rows={2} placeholder="e.g. Anyone looking for a quick fix, or who wants a meal plan without the appointments" value={s.notFor} onChange={(e) => setService(i, "notFor", e.target.value)} />

          <div className="field-2col">
            <div>
              <label className="field-label">Price</label>
              <input className="field" placeholder="e.g. $1,800, or starts at $500" value={s.price} onChange={(e) => setService(i, "price", e.target.value)} />
            </div>
            <div>
              <label className="field-label">Next step</label>
              <select className="field" value={s.action} onChange={(e) => setService(i, "action", e.target.value)}>
                {SERVICE_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <label className="field-label">{(ACTION_LINK_LABEL[s.action] || ACTION_LINK_LABEL["Learn more"]).label}</label>
          <p className="why">{(ACTION_LINK_LABEL[s.action] || ACTION_LINK_LABEL["Learn more"]).hint} If you don't have one yet, leave it blank and we'll flag it.</p>
          <input className="field" placeholder="https://…" value={s.actionLink} onChange={(e) => setService(i, "actionLink", e.target.value)} />
        </div>
      ))}
      {pg.services.length < 3
        ? <button className="btn-ghost" style={{ marginTop: 4 }} onClick={addService}>+ Add a service</button>
        : <div className="info-note">That's three. The sweet spot. If you offer more, we'll usually fold the extras into these or point people to a call.</div>}
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("pages_home")}>Back</button>
        <button className="btn-solid" disabled={pg.services.filter((s) => s.name.trim()).length === 0} onClick={() => setStep("pages_about")}>Next →</button>
      </div>
    </StepShell>
  );

  const PagesAbout = (
    <StepShell eyebrow="Step 3, about page" title="Your story."
      sub="Often the most-read page on a site. Give us the raw material and we'll shape it. Write like you're talking to one person.">
      <label className="field-label">How did you get here? <span className="opt">your path into this work</span></label>
      <textarea className="field" rows={3} placeholder="The short version of your journey" value={pg.about.story} onChange={(e) => setAbout({ story: e.target.value })} />
      <label className="field-label">Why do you do this work?</label>
      <textarea className="field" rows={2} placeholder="What drives you / your mission" value={pg.about.why} onChange={(e) => setAbout({ why: e.target.value })} />

      <div className="sub-head">Background</div>
      <label className="field-label">Education &amp; training <span className="opt">degrees, certifications, where you trained</span></label>
      <textarea className="field" rows={2} placeholder="e.g. BS in Nutrition, [University]; certified through [program]" value={pg.about.education} onChange={(e) => setAbout({ education: e.target.value })} />
      <label className="field-label">Roles you've held <span className="opt">your path since. Titles, places, experience</span></label>
      <textarea className="field" rows={2} placeholder="Where you've worked and what you did. The short career arc" value={pg.about.positions} onChange={(e) => setAbout({ positions: e.target.value })} />
      <div className="info-note">Your credentials from Core info show up here too. No need to repeat them.</div>

      <div className="sub-head">Make it human</div>
      <label className="field-label">A fun or unexpected story you'd love to share</label>
      <textarea className="field" rows={2} placeholder="A defining moment, a plot twist, the thing people are surprised to learn about you" value={pg.about.funStory} onChange={(e) => setAbout({ funStory: e.target.value })} />
      <label className="field-label">Personal details <span className="opt">the stuff that makes you a person, not a résumé</span></label>
      <textarea className="field" rows={2} placeholder="Where you live, family, pets, hobbies, a guilty pleasure, a weird talent" value={pg.about.personal} onChange={(e) => setAbout({ personal: e.target.value })} />

      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("pages_services")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("pages_addons")}>Next →</button>
      </div>
    </StepShell>
  );

  const pgT = pg.testimonials, pgB = pg.booking, pgC = pg.contact;
  const PagesProof = (
    <StepShell eyebrow="Step 4 of pages" title="Proof, and how people reach you."
      sub="Two things every site needs: evidence that you're good at this, and a frictionless way to take the next step.">
      <CardFlow
        onExit={() => setStep("pages_about")}
        onComplete={() => setStep("pages_addons")}
        cards={[
          { nav: "Testimonials",
            q: "Do you have testimonials or reviews we can use?",
            why: "Nothing you say about yourself works as hard as one sentence from a client. Even two or three short quotes lift a page enormously, and they don't need to be polished.",
            body: (
              <>
                <div className="tone-wrap">
                  <button className={"tone-chip" + (pgT.has === "yes" ? " sel" : "")} onClick={() => setTesti({ has: "yes" })}>Yes, I have some</button>
                  <button className={"tone-chip" + (pgT.has === "gather" ? " sel" : "")} onClick={() => setTesti({ has: "gather" })}>I can gather a few</button>
                  <button className={"tone-chip" + (pgT.has === "no" ? " sel" : "")} onClick={() => setTesti({ has: "no" })}>Not yet</button>
                </div>
                {(pgT.has === "yes" || pgT.has === "gather") && (
                  <div className="fade-in" style={{ marginTop: 20 }}>
                    {pgT.items.map((t, i) => (
                      <div className="service-card" key={i}>
                        <div className="service-head">
                          <span className="service-num">Testimonial {i + 1}</span>
                          <button className="feature-x" onClick={() => removeTesti(i)} title="Remove">×</button>
                        </div>
                        <label className="field-label" style={{ marginTop: 0 }}>What did they say?</label>
                        <textarea className="field" rows={3} placeholder="Paste their words as they wrote them. We'll trim if needed." value={t.quote} onChange={(e) => setTestiItem(i, "quote", e.target.value)} />
                        <div className="field-2col">
                          <div>
                            <label className="field-label">Their name</label>
                            <input className="field" placeholder="e.g. Jen M." value={t.name} onChange={(e) => setTestiItem(i, "name", e.target.value)} />
                          </div>
                          <div>
                            <label className="field-label">Title or role <span className="opt">optional</span></label>
                            <input className="field" placeholder="e.g. Teacher, mom of two" value={t.title} onChange={(e) => setTestiItem(i, "title", e.target.value)} />
                          </div>
                        </div>
                        <label className="field-label">How did they work with you?</label>
                        <input className="field" placeholder="e.g. 12-week gut reset, 2024" value={t.capacity} onChange={(e) => setTestiItem(i, "capacity", e.target.value)} />
                        <label className="field-label">Photo <span className="opt">optional, link or 'have it'</span></label>
                        <input className="field" placeholder="Link to a headshot, or note that you'll send it" value={t.photo} onChange={(e) => setTestiItem(i, "photo", e.target.value)} />
                        <label className="field-label">Their website or LinkedIn <span className="opt">optional</span></label>
                        <input className="field" placeholder="https://…" value={t.link} onChange={(e) => setTestiItem(i, "link", e.target.value)} />
                      </div>
                    ))}
                    <button className="btn-ghost" style={{ paddingLeft: 0 }} onClick={addTesti}>+ Add a testimonial</button>
                  </div>
                )}
                {pgT.has === "no" && (
                  <div className="info-note">That's completely normal early on. We'll design the pages so testimonials can drop in later without a redesign, and we can send you a short script for requesting them.</div>
                )}
              </>
            ) },
          { nav: "Booking",
            q: "How do people book or buy from you?",
            why: "Your call-to-action buttons need somewhere to go. If you already use a scheduler or checkout, we'll wire the buttons straight to it so nobody loses momentum between deciding and booking.",
            body: (
              <>
                <label className="field-label" style={{ marginTop: 0 }}>What do you use for scheduling?</label>
                <input className="field" placeholder="e.g. Practice Better, Acuity, Calendly, SimplePractice, or none yet" value={pgB.tool} onChange={(e) => setBooking({ tool: e.target.value })} />
                <label className="field-label">Your booking link</label>
                <textarea className="field" rows={2} placeholder="Paste the link people use to book. More than one? List them with a note on what each is for." value={pgB.link} onChange={(e) => setBooking({ link: e.target.value })} />
                <label className="field-label">Checkout or payment link <span className="opt">if you sell anything directly</span></label>
                <input className="field" placeholder="e.g. a Stripe, ThriveCart, or Kajabi link" value={pgB.payment} onChange={(e) => setBooking({ payment: e.target.value })} />
              </>
            ) },
          { nav: "Contact",
            q: "How should people get in touch?",
            why: "Your contact page is often the last stop before someone commits. We'll only publish what you want public, so tell us what's safe to show.",
            body: (
              <>
                <label className="field-label" style={{ marginTop: 0 }}>Email to show publicly</label>
                <input className="field" placeholder="hello@yourpractice.com" value={pgC.publicEmail} onChange={(e) => setContact({ publicEmail: e.target.value })} />
                <label className="field-label">Phone <span className="opt">leave blank if you'd rather not list one</span></label>
                <input className="field" placeholder="Optional" value={pgC.phone} onChange={(e) => setContact({ phone: e.target.value })} />
                <label className="field-label">Hours or response time</label>
                <input className="field" placeholder="e.g. Mon to Thurs, replies within 2 business days" value={pgC.hours} onChange={(e) => setContact({ hours: e.target.value })} />
                <label className="field-label">Best way to reach you</label>
                <input className="field" placeholder="e.g. the contact form, or book a discovery call" value={pgC.preferred} onChange={(e) => setContact({ preferred: e.target.value })} />
                <label className="field-label">Social profiles to link</label>
                <textarea className="field" rows={2} placeholder="Instagram, LinkedIn, Facebook, YouTube, TikTok. Only the ones you actually keep up with." value={pgC.socials} onChange={(e) => setContact({ socials: e.target.value })} />
                {(intake.core.mode === "inperson" || intake.core.mode === "both") && intake.core.address && (
                  <div className="recap" style={{ marginTop: 20 }}>
                    <div className="recap-title">Your address, from earlier</div>
                    <div className="recap-row"><span>{intake.core.address}</span></div>
                  </div>
                )}
              </>
            ) },
        ]}
      />
    </StepShell>
  );

  const PagesAddons = (
    <StepShell eyebrow="Step 4, pages & add-ons" title="Which pages do you need?"
      sub="Your build includes the essentials. Add extra pages if you want them. Each adds to the scope.">
      <div className="recap">
        <div className="recap-title">Included</div>
        <div className="recap-row"><span>Home · Services · About · Contact</span><span>✓</span></div>
      </div>
      <div className="sub-head">Optional add-ons</div>
      {ADDON_PAGES.map((a) => {
        const on = pg.addons.includes(a.id);
        return (
          <button key={a.id} className={"addon-row" + (on ? " sel" : "")} onClick={() => toggleAddon(a.id)}>
            <span className="addon-check">{on ? "✓" : "+"}</span>
            <span className="addon-body">
              <span className="addon-name">{a.name} <span className="addon-price">{a.price}</span></span>
              {a.note && <span className="addon-note">{a.note}</span>}
            </span>
          </button>
        );
      })}
      {pg.addons.length > 0 && (
        <div className="info-note">
          You've added {pg.addons.map((id) => ADDON_PAGES.find((a) => a.id === id).name.toLowerCase()).join(", ")}. We'll be in touch about the details once we've read through everything else.
        </div>
      )}
      {pg.addons.includes("unique") && (
        <div style={{ marginTop: 12 }}>
          <label className="field-label">Your custom page. What do you have in mind?</label>
          <textarea className="field" rows={2} placeholder="What this page is for. E.g. a press / media kit, a portfolio, a resource hub" value={pg.uniqueNote} onChange={(e) => setPages({ uniqueNote: e.target.value })} />
        </div>
      )}
      <p className="why" style={{ marginTop: 14 }}>Prices are placeholders. Drop in your real add-on pricing.</p>
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("pages_proof")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("pages_review")}>Review →</button>
      </div>
    </StepShell>
  );

  const namedServices = pg.services.filter((s) => s.name.trim());
  const PagesReview = (
    <StepShell eyebrow="Review" title="Your pages, mapped out."
      sub="Skim and edit anything that's off.">
      <div className="review-card">
        <ReviewRow label="Core message" value={pg.home.coreMessage || "Not yet"} onEdit={() => setStep("pages_home")} />
        <ReviewRow label="Must believe" value={pg.home.convince || "Not yet"} onEdit={() => setStep("pages_home")} />
        <ReviewRow label="Main CTA" value={pg.home.cta || "Not yet"} onEdit={() => setStep("pages_home")} />
        <ReviewRow label="Freebie" value={pg.home.freebie.has === true ? (pg.home.freebie.what || "Featuring existing") : pg.home.freebie.has === false ? "None" : "Not yet"} onEdit={() => setStep("pages_home")} />
        <ReviewRow label="Services" value={namedServices.length ? namedServices.map((s) => s.name).join(", ") : "Not yet"} onEdit={() => setStep("pages_services")} />
        <ReviewRow label="About" value={pg.about.story ? "✓ captured" : "Not yet"} onEdit={() => setStep("pages_about")} />
        <ReviewRow label="Testimonials" value={pgT.has === "yes" ? "Provided" : pgT.has === "gather" ? "Will gather" : pgT.has === "no" ? "None yet" : "Not yet"} onEdit={() => setStep("pages_proof")} />
        <ReviewRow label="Booking" value={pgB.link || pgB.tool || "Not yet"} onEdit={() => setStep("pages_proof")} />
        <ReviewRow label="Contact" value={pgC.publicEmail || "Not yet"} onEdit={() => setStep("pages_proof")} />
        <ReviewRow label="Add-on pages" value={pg.addons.length ? pg.addons.map((id) => ADDON_PAGES.find((a) => a.id === id).name).join(", ") : "None"} onEdit={() => setStep("pages_addons")} />
        {pg.addons.includes("unique") && pg.uniqueNote && <ReviewRow label="Custom page" value={pg.uniqueNote} onEdit={() => setStep("pages_addons")} />}
      </div>
      <FinishBlock copyJSON={copyJSON} copied={copied}
        onBack={() => setStep("pages_addons")}
        onNext={() => setStep("handoff_legal")}
        title="Pages locked in."
        sub="Last step: a few things about what happens next." />
    </StepShell>
  );


  const StratFoundation = (
    <StepShell eyebrow="Brand strategy. The basics" title="Let's start with the simple stuff."
      sub="One question at a time. Plain answers beat polished ones. Say it how you'd say it to a friend, and we'll handle the wording.">
      <CardFlow
        onExit={() => setStep("review")}
        onComplete={() => setStep("strat_character")}
        cards={[
          { nav: "What you do",
            q: "In one sentence, what do you do?",
            why: "Imagine someone asks at a dinner party and you've got ten seconds. No jargon. The plain version is almost always the one that lands.",
            body: <textarea className="field" rows={2} autoFocus placeholder="e.g. I help women with autoimmune conditions figure out what to actually eat" value={st.coreIdea} onChange={(e) => setStrat({ coreIdea: e.target.value })} /> },
          { nav: "Who you help",
            q: "Who do you help?",
            why: "The short version. Who your work is really for. Being specific here is what lets your website speak to one person instead of everyone.",
            body: (
              <textarea className="field" rows={3} placeholder="e.g. Busy moms in their 30s and 40s who've been dismissed by other providers" value={st.whoServe} onChange={(e) => setStrat({ whoServe: e.target.value })} />
            ) },
          { nav: "Your goal",
            q: "What are you working toward?",
            why: "Where you'd like the business to be in a year, and further out if you know. We build for where you are now, but it helps to know where you're heading. This tells us what your website needs to set up, a full 1:1 practice and a group program need different homepages.",
            body: <textarea className="field" rows={2} placeholder="e.g. A full 1:1 practice this year; eventually a group program so I'm not trading hours for dollars" value={st.currentGoal} onChange={(e) => setStrat({ currentGoal: e.target.value })} /> },
          { nav: "The change",
            q: "What's different for someone after they work with you?",
            why: "The actual change, in their body, their day, their head. People don't buy the sessions; they buy who they get to be afterward.",
            body: <textarea className="field" rows={2} placeholder="e.g. They stop being scared of food and finally have energy at 3pm" value={st.result} onChange={(e) => setStrat({ result: e.target.value })} /> },
          { nav: "Your question",
            q: "What question do you answer over and over?",
            why: "The thing clients ask constantly, or the worry you hear at every first appointment. Your whole website is really one long answer to it, so naming it usually unlocks the headline.",
            body: <textarea className="field" rows={2} placeholder="e.g. 'Why do I feel awful when all my labs come back normal?'" value={st.coreQuestion} onChange={(e) => setStrat({ coreQuestion: e.target.value })} /> },
          { nav: "Different",
            q: "What makes you different?",
            why: "Different, not better. Everyone claims to be better, and it only invites people to compare you on price, but something only you do is yours to keep. Think about how you work, what you refuse to do, who you turn away, or what you've lived through yourself.",
            body: <StatementList items={st.different} placeholder="Something true of you that isn't true of most others in your field"
              onItem={(i, v) => setStratItem("different", i, v)} onAdd={() => addStratItem("different")} onRemove={(i) => removeStratItem("different", i)} /> },
          { nav: "Right now",
            q: "What's going on right now that makes your work matter?",
            why: "What's shifting for the people you help, or in your field. Everyone's exhausted by conflicting advice online, insurance keeps cutting appointment times, a topic that used to be taboo is finally being discussed. This is what makes a website feel current rather than timeless-but-vague.",
            body: <textarea className="field" rows={2} placeholder="What's changing in the world that brings people to your door" value={st.culturalContext} onChange={(e) => setStrat({ culturalContext: e.target.value })} /> },
        ]}
      />
    </StepShell>
  );

  const StratCharacter = (
    <StepShell eyebrow="Brand strategy. Personality" title="If your practice were a person…"
      sub="Websites that feel like a real person get remembered. This is where we pin down who that person is.">
      <CardFlow
        onExit={() => setStep("strat_foundation")}
        onComplete={() => setStep("strat_beliefs")}
        cards={[
          { nav: "The character",
            q: "What kind of person is your brand?",
            why: "Two words usually do it. \"the steady guide,\" \"the straight-talking expert,\" \"the encouraging friend,\" \"the calm professional.\" This is the single most useful thing you can give a designer, because it decides everything from how much white space to how warm the words are.",
            body: (
              <>
                {stratArch && (
                  <div className="recap">
                    <div className="recap-title">Based on the colors you picked</div>
                    <div className="recap-row"><span>Your brand leans <strong style={{ fontWeight: 600 }}>{stratArch}</strong>, agree, adjust, or ignore.</span></div>
                  </div>
                )}
                <input className="field" autoFocus placeholder="e.g. the calm expert / the encouraging friend" value={st.archetypes} onChange={(e) => setStrat({ archetypes: e.target.value })} />
              </>
            ) },
          { nav: "The bigger goal",
            q: "What are you ultimately trying to do for people?",
            why: "Bigger than any one service. Help people trust their own body again, or make good care feel less intimidating. This is what stops a website reading like a list of appointments.",
            body: <textarea className="field" rows={2} placeholder="The bigger thing behind the day-to-day work" value={st.ultimateGoal} onChange={(e) => setStrat({ ultimateGoal: e.target.value })} /> },
          { nav: "The feeling",
            q: "How should someone feel when they land on your site?",
            why: "A few words is plenty. Relieved, understood, hopeful, safe, taken seriously. You have about ten seconds before someone decides whether you're for them, and it's almost entirely a feeling, not a fact.",
            body: <textarea className="field" rows={2} placeholder="The feeling you want in the first ten seconds" value={st.feel} onChange={(e) => setStrat({ feel: e.target.value })} /> },
          { nav: "But not…",
            q: "Fill in the blanks: \"___ but not ___\"",
            why: "This one sounds odd but it's the most useful question here. Saying what you're not stops us overshooting. \"friendly\" alone can come out cheesy, but \"friendly but not chummy\" tells us exactly where the line sits. One per line.",
            body: <textarea className="field" rows={5} placeholder={"warm but not soft\nexpert but not stuffy\nhonest but not harsh\nfun but not unprofessional"} value={st.descriptors} onChange={(e) => setStrat({ descriptors: e.target.value })} /> },
        ]}
      />
    </StepShell>
  );

  const StratBeliefs = (
    <StepShell eyebrow="Brand strategy. What you believe" title="What you stand for."
      sub="This is what makes the right people think 'finally, someone gets it', and lets the wrong-fit ones quietly move along.">
      <CardFlow
        onExit={() => setStep("strat_character")}
        onComplete={() => setStep("strat_proof")}
        cards={[
          { nav: "Beliefs",
            q: "What do you believe about your work?",
            why: "Things you'd happily say out loud, in a talk, or on a sign in your office. Some people will nod hard; others won't like it, and that's the point. A website that tries not to offend anyone rarely convinces anyone. These end up woven through your pages and your posts.",
            body: <StatementList items={st.pov} placeholder="e.g. Rest is part of the treatment plan, not a reward for finishing it"
              onItem={(i, v) => setStratItem("pov", i, v)} onAdd={() => addStratItem("pov")} onRemove={(i) => removeStratItem("pov", i)} /> },
          { nav: "Your rules",
            q: "What are your rules for how you work?",
            why: "These are for you and anyone who works with you, not marketing. They're the standards you hold when nobody's watching, and they're what lets an assistant or associate make a call without asking you first.",
            body: <StatementList items={st.principles} placeholder="e.g. Nobody leaves an appointment without knowing their next step"
              onItem={(i, v) => setStratItem("principles", i, v)} onAdd={() => addStratItem("principles")} onRemove={(i) => removeStratItem("principles", i)} /> },
          { nav: "The why",
            q: "What are you fighting for?",
            why: "A short, from-the-gut paragraph about why this work matters to you and what you'd change if you could. Messy is completely fine. Nobody sees this but us, and we'll shape it. Think of it as the speech you'd give with one minute and a microphone.",
            body: <textarea className="field" rows={6} placeholder="What you believe, what you're up against, and what you want to be true for your clients" value={st.manifesto} onChange={(e) => setStrat({ manifesto: e.target.value })} /> },
        ]}
      />
    </StepShell>
  );

  const StratProof = (
    <StepShell eyebrow="Brand strategy. Proof" title="Why should someone trust you?"
      sub="People decide with their gut, then look for facts to back it up. This is the facts part, and what you're deliberately not.">
      <CardFlow
        onExit={() => setStep("strat_beliefs")}
        onComplete={() => setStep("strat_review")}
        completeLabel="Review →"
        cards={[
          { nav: "Trust",
            q: "Why should someone trust you?",
            why: "The hard evidence: training, years in practice, results you've gotten, who you've worked with, something you've built or lived through that nobody can copy. Don't be modest here. Nobody else is going to say it for you, and we'd rather have too much and choose.",
            body: <StatementList items={st.credibility} placeholder="e.g. 12 years in hospital nutrition before going private"
              onItem={(i, v) => setStratItem("credibility", i, v)} onAdd={() => addStratItem("credibility")} onRemove={(i) => removeStratItem("credibility", i)} /> },
          { nav: "Featured in",
            q: "Where have you been featured?",
            why: "Press, podcasts you've guested on, publications, summits. Even one logo strip does a lot of quiet work: it borrows someone else's credibility for the two seconds a visitor needs to decide you're legitimate.",
            body: (
              <>
                {intake.strategy.features.map((f, i) => (
                  <div className="feature-row" key={i}>
                    <input className="field" placeholder="Outlet or show name" value={f.name} onChange={(e) => setFeature(i, "name", e.target.value)} />
                    <input className="field" placeholder="Link (optional)" value={f.url} onChange={(e) => setFeature(i, "url", e.target.value)} />
                    <button className="feature-x" onClick={() => removeFeature(i)} title="Remove">×</button>
                  </div>
                ))}
                <button className="btn-ghost" style={{ marginTop: 4, paddingLeft: 0 }} onClick={addFeature}>+ Add a feature</button>
              </>
            ) },
          { nav: "Disagree",
            q: "What do you disagree with in your field?",
            why: "Naming what you're against makes what you're for much clearer, and it's often the fastest way for the right client to recognise themselves. One per line.",
            body: <textarea className="field" rows={5} placeholder={"Shame as a motivator\nOne-size-fits-all meal plans\n'Just eat less and move more'"} value={st.ideaEnemies} onChange={(e) => setStrat({ ideaEnemies: e.target.value })} /> },
          { nav: "Never",
            q: "What will you never do?",
            why: "Your lines in the sand. These often become the most reassuring sentences on a website, because they answer a fear the client hasn't said out loud.",
            body: <textarea className="field" rows={5} placeholder={"Never promise a number on the scale\nNever sell supplements I don't believe in\nNever rush someone off a call"} value={st.notToDo} onChange={(e) => setStrat({ notToDo: e.target.value })} /> },
          { nav: "We are not",
            q: "Fill in the blank: \"We are not ___\"",
            why: "Useful when people mistake you for something you're not, a quick fix, a weight-loss clinic, a replacement for their doctor. Saying it plainly saves you the wrong enquiries.",
            body: <textarea className="field" rows={5} placeholder={"Not a quick fix\nNot a weight-loss clinic\nNot a replacement for your doctor"} value={st.weAreNot} onChange={(e) => setStrat({ weAreNot: e.target.value })} /> },
        ]}
      />
    </StepShell>
  );

  const StratReview = (
    <StepShell eyebrow="Review" title="Your foundation, on one page."
      sub="Everything we write and design comes back to this. Edit anything that isn't right.">
      <div className="review-card">
        <ReviewRow label="What you do" value={st.coreIdea || "Not yet"} onEdit={() => setStep("strat_foundation")} />
        <ReviewRow label="Who you help" value={st.whoServe || "Not yet"} onEdit={() => setStep("strat_foundation")} />
        <ReviewRow label="The question you answer" value={st.coreQuestion || "Not yet"} onEdit={() => setStep("strat_foundation")} />
        <ReviewRow label="What makes you different" value={stratDiff.length ? stratDiff.join(" · ") : "Not yet"} onEdit={() => setStep("strat_foundation")} />
        <ReviewRow label="Personality" value={st.archetypes || "Not yet"} onEdit={() => setStep("strat_character")} />
        <ReviewRow label="What you believe" value={stratPov.length ? stratPov.length + " statements" : "Not yet"} onEdit={() => setStep("strat_beliefs")} />
        <ReviewRow label="What you're fighting for" value={st.manifesto ? "✓ captured" : "Not yet"} onEdit={() => setStep("strat_beliefs")} />
        <ReviewRow label="Featured in" value={namedFeatures.length ? namedFeatures.map((f) => f.name).join(", ") : "Not yet"} onEdit={() => setStep("strat_proof")} />
      </div>
      <FinishBlock copyJSON={copyJSON} copied={copied}
        onBack={() => setStep("strat_proof")}
        onNext={() => setStep("voice_tone")}
        title="Foundation locked in."
        sub="Next module: Voice & ideal client." />
    </StepShell>
  );

  const ho = intake.handoff;

  const HandoffLegal = (
    <StepShell eyebrow="Handoff" title="One thing you'll need to sort out."
      sub="Not a task for today, but something to know about before your site goes live.">
      <div className="qcard">
        <h3 className="q-title">Your site will need a privacy policy and a disclaimer.</h3>
        <p className="q-why">These are legal documents, so we don't write them. They have to reflect how <em>your</em> practice actually operates, and getting them wrong carries real risk. Here's the short version of why they matter.</p>
        <div className="legal-list">
          <div className="legal-item">
            <div className="legal-name">Privacy policy</div>
            <div className="legal-body">Required almost everywhere once your site collects anything at all, and your contact form and analytics both count. It explains what you collect, why, and what you do with it.</div>
          </div>
          <div className="legal-item">
            <div className="legal-name">Disclaimer</div>
            <div className="legal-body">Especially important for health and nutrition work. It makes clear that your content is educational and isn't a substitute for individual medical advice, which protects you when someone reads a blog post and acts on it.</div>
          </div>
          <div className="legal-item">
            <div className="legal-name">Terms of service</div>
            <div className="legal-body">Worth having if you sell anything directly from the site. It covers payment, cancellations, and refunds.</div>
          </div>
        </div>
        <p className="q-why" style={{ marginTop: 22 }}>Most practitioners use a policy generator built for health professionals, or have a lawyer draft them. Either is fine. We'll build the pages and link them properly in your footer once you send us the text.</p>
        <label className="ack">
          <input type="checkbox" checked={ho.legalAck} onChange={(e) => setHandoff({ legalAck: e.target.checked })} />
          <span>Got it. I'll get these sorted and send them over.</span>
        </label>
      </div>
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("pages_review")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("handoff_notes")}>Next →</button>
      </div>
    </StepShell>
  );

  const HandoffNotes = (
    <StepShell eyebrow="Handoff" title="Anything else we should know?"
      sub="Last question, and it's an open one.">
      <div className="qcard">
        <h3 className="q-title">Anything else you'd like to tell us?</h3>
        <p className="q-why">Something you're worried about, a page you've been dreading, a site you love or can't stand, a question you've been meaning to ask. This box has no wrong answers, and plenty of people leave it blank.</p>
        <textarea className="field" rows={6} placeholder="Anything at all" value={ho.notes} onChange={(e) => setHandoff({ notes: e.target.value })} />
      </div>
      <div className="nav-row">
        <button className="btn-ghost" onClick={() => setStep("handoff_legal")}>Back</button>
        <button className="btn-solid" onClick={() => setStep("handoff_done")}>Finish →</button>
      </div>
    </StepShell>
  );

  const HandoffDone = (
    <StepShell eyebrow="All done" title={"That's everything, " + (intake.core.name.split(" ")[0] || "and thank you") + "."}
      sub="Have a last look if you'd like, then send it over.">
      <div className="qcard">
        <h3 className="q-title">Ready to submit?</h3>
        <p className="q-why">Once you submit, we'll read every word before we touch a single pixel. You'll still be able to see everything you've written, and you can add to it any time.</p>
        <div className="review-card" style={{ marginTop: 18 }}>
          <ReviewRow label="Your name" value={intake.core.name || "Not yet"} onEdit={() => setStep("coreinfo")} />
          <ReviewRow label="We'll email" value={intake.core.email || "Not yet"} onEdit={() => setStep("coreinfo")} />
          <ReviewRow label="Palette" value={paletteLabel(intake) || "Not yet"} onEdit={() => setStep("palette")} />
          <ReviewRow label="Services" value={namedServices.length ? namedServices.length + " added" : "Not yet"} onEdit={() => setStep("pages_services")} />
        </div>
      </div>
      <div className="finish">
        <div>
          <div className="finish-title">Your intake is complete.</div>
          <div className="finish-sub">You can still change anything before you submit.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={() => setStep("handoff_notes")}>← Back</button>
          <button className="btn-ghost" onClick={copyJSON}>{copied ? "Copied ✓" : "Copy intake JSON"}</button>
          <button className="btn-solid" onClick={async () => {
            const stamp = new Date().toISOString();
            set({ submittedAt: stamp });
            setSaveState("saving");
            try { await saveIntake(session.email, session.firstName, "dashboard", { ...intake, submittedAt: stamp }, true); setSaveState("saved"); }
            catch (e) { setSaveState("error"); }
            setStep("dashboard");
          }}>Submit intake</button>
        </div>
      </div>
    </StepShell>
  );

  const submitted = intake.submittedAt ? new Date(intake.submittedAt) : null;
  const fmtDate = (d) => d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

  const Dashboard = (
    <div className="signin-wrap fade-in">
      <div className="signin-card">
        <div className="signin-eyebrow">Intake received</div>
        <h2 className="signin-title">Thank you, {intake.core.name.split(" ")[0] || (session ? session.firstName : "") || "and welcome"}.</h2>
        <p className="signin-sub">
          {submitted ? "Submitted " + fmtDate(submitted) + "." : "Your intake is in."} We have everything we need to get started. If we have any questions as we go, we'll reach out.
        </p>
        <div className="signin-actions">
          <button className="btn-ghost" style={{ paddingLeft: 0 }} onClick={() => setStep("coreinfo")}>Look back over my answers</button>
        </div>
      </div>
    </div>
  );

  const VIEWS = { coreinfo: CoreInfo, gate: Gate, existing: Existing, quiz: Quiz, result: Result, palette: Palette, type: Type, imagery: Imagery, template: Template, review: Review, strat_foundation: StratFoundation, strat_character: StratCharacter, strat_beliefs: StratBeliefs, strat_proof: StratProof, strat_review: StratReview, voice_tone: VoiceTone, voice_client: VoiceClient, voice_review: VoiceReview, pages_home: PagesHome, pages_services: PagesServices, pages_about: PagesAbout, pages_proof: PagesProof, pages_addons: PagesAddons, pages_review: PagesReview, handoff_legal: HandoffLegal, handoff_notes: HandoffNotes, handoff_done: HandoffDone, dashboard: Dashboard };

  /* ------------------------------ CHROME ------------------------------ */

  return (
    <div className="wpws-root" ref={topRef}>
      <style>{CSS}</style>

      <header className="topbar">
        <div className="brandmark">Whitney Bateson Digital Strategy
          <span className={"save-dot " + saveState}>
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : saveState === "saved" ? "Saved" : ""}
          </span>
        </div>
        <div className="module-rail">
          {MODULES.map((m, i) => {
            const entry = MODULE_ENTRY[m];
            return (
              <button key={m} disabled={!entry}
                className={"module-pill" + (m === currentModule ? " active" : i < MODULES.indexOf(currentModule) ? " done" : "")}
                onClick={() => entry && setStep(entry)}>{m}</button>
            );
          })}
        </div>
      </header>

      {!session ? null : step === "dashboard" ? VIEWS.dashboard : (
      <div className="stage">
        <aside className="side">
          <div className="side-chapter">Chapter {MODULES.indexOf(currentModule) + 1} of {MODULES.length}</div>
          <div className="side-title">{currentModule}</div>
          <ol className="timeline">
            {subSteps.map((s, i) => {
              const target = (SUBSTEP_STEP[currentModule] || [])[i];
              const state = i === subIndex ? "cur" : i < subIndex ? "done" : "";
              return (
                <li key={s} className={"tl-item " + state + (target ? " clickable" : "")}
                  onClick={() => target && setStep(target)}>
                  <span className="tl-marker">{i < subIndex ? "✓" : i + 1}</span>
                  <span className="tl-label">{s}</span>
                </li>
              );
            })}
          </ol>
          <p className="side-note">{sideNote}</p>
        </aside>

        <main className="panel">{VIEWS[step]}</main>
      </div>
      )}
    </div>
  );
}

/* -------------------------- shared blocks -------------------------- */

function AlaCarteNote() {
  return (
    <p className="alacarte">
      We build with our system's colors and fonts. We don't design logos or full brand identities.
      Want those? Ask about the <a href="#" onClick={(e) => e.preventDefault()}>Brand add-on</a>.
    </p>
  );
}

function ReviewRow({ label, value, onEdit }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <span className="review-value">{value}</span>
      <button className="review-edit" onClick={onEdit}>Edit</button>
    </div>
  );
}

function FinishBlock({ copyJSON, copied, onBack, onNext, title, sub }) {
  return (
    <div className="finish">
      <div>
        <div className="finish-title">{title || "Branding locked in."}</div>
        <div className="finish-sub">{sub || "Next module: Voice & ideal client."}</div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {onBack && <button className="btn-ghost" onClick={onBack}>← Back</button>}
        <button className="btn-ghost" onClick={copyJSON}>{copied ? "Copied ✓" : "Copy intake JSON"}</button>
        <button className="btn-solid" onClick={onNext || (() => {})}>Continue →</button>
      </div>
    </div>
  );
}

/* ------------------------------- CSS ------------------------------- */

const CSS = `
.wpws-root{
  --blue:#CEE5EB;--pink:#FFCDCD;--lime:#E3F696;--coral:#FF7F50;
  --ink:#12333D;--muted:#4C6873;--surface:#FFFFFF;
  --navy:#12333D;--navy-deep:#0B2028;--marigold:#FF7F50;--sky:#CEE5EB;
  --bg:#CEE5EB;--paper:#E4EFF3;--line:rgba(18,51,61,.15);
  --font-display:'Boston Angel','Playfair Display',Georgia,serif;
  --font-ui:'Proxima Nova','Figtree',system-ui,-apple-system,sans-serif;
  font-family:var(--font-ui);color:var(--ink);background:var(--bg);
  min-height:100%;box-sizing:border-box;}
.wpws-root *{box-sizing:border-box;}
.wpws-root a{color:var(--navy);}

.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding:20px 40px;background:var(--surface);border-bottom:1px solid rgba(18,51,61,.10);}
.brandmark{font-family:var(--font-display);font-size:16px;letter-spacing:.01em;color:var(--navy);font-weight:400;}
.brandmark span{opacity:.6;font-family:var(--font-ui);font-size:12px;color:var(--muted);letter-spacing:.02em;}
.module-rail{display:flex;gap:22px;flex-wrap:wrap;align-items:center;}
.module-pill{font-size:12.5px;letter-spacing:.02em;padding:0 0 4px;border-radius:0;font-weight:500;
  border:none;border-bottom:2px solid transparent;color:var(--ink);opacity:.78;white-space:nowrap;background:none;
  font-family:inherit;cursor:pointer;transition:.2s;}
button.module-pill:not(:disabled):hover{opacity:1;border-bottom-color:rgba(18,51,61,.3);}
button.module-pill:disabled{cursor:default;opacity:.42;}
.module-pill.active{opacity:1;color:var(--ink);border-bottom-color:var(--coral);font-weight:700;}
.module-pill.done{opacity:.78;}
.module-pill.done::before{content:"";}

.stage{display:flex;gap:0;max-width:1080px;margin:0 auto;}
.side{width:252px;flex:none;padding:44px 28px 44px 40px;}
.side-chapter{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);
  opacity:.65;font-weight:500;margin-bottom:8px;}
.side-title{font-family:var(--font-display);font-size:26px;line-height:1.15;margin-bottom:26px;
  color:var(--ink);font-weight:400;}

.timeline{list-style:none;margin:0;padding:0;position:relative;}
.timeline::before{content:"";position:absolute;left:12px;top:14px;bottom:14px;width:1px;
  background:rgba(18,51,61,.16);}
.tl-item{position:relative;display:flex;align-items:center;gap:14px;padding:9px 0;transition:.2s;}
.tl-marker{position:relative;z-index:1;width:25px;height:25px;flex:none;border-radius:999px;
  display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:600;
  background:var(--bg);border:1px solid rgba(18,51,61,.22);color:var(--muted);transition:.2s;}
.tl-label{font-size:13.5px;color:var(--muted);opacity:.7;transition:.2s;}
.tl-item.done .tl-marker{background:var(--ink);border-color:var(--ink);color:#fff;font-size:11px;}
.tl-item.done .tl-label{opacity:.85;}
.tl-item.cur .tl-marker{background:var(--coral);border-color:var(--coral);color:#fff;
  box-shadow:0 0 0 4px rgba(255,127,80,.18);}
.tl-item.cur .tl-label{color:var(--ink);opacity:1;font-weight:600;}
.tl-item.clickable{cursor:pointer;}
.tl-item.clickable:hover .tl-label{opacity:1;color:var(--ink);}
.tl-item.clickable:hover .tl-marker{border-color:var(--ink);}

.side-note{font-size:12px;line-height:1.65;color:var(--muted);opacity:.75;margin-top:32px;
  border-top:1px solid var(--line);padding-top:18px;}

.panel{flex:1;padding:44px 44px 64px;min-width:0;max-width:640px;}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);opacity:.65;font-weight:500;}
.step-title{font-family:var(--font-display);font-weight:400;font-size:34px;line-height:1.15;margin:14px 0 0;color:var(--navy);}
.step-title em{font-style:italic;color:var(--navy);}
.step-sub{font-size:15.5px;line-height:1.65;color:var(--muted);max-width:560px;margin:14px 0 0;}

.choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.vibe-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.vibe-choice{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;
  cursor:pointer;padding:0;transition:.15s;font-family:inherit;color:var(--ink);display:flex;flex-direction:column;}
.vibe-choice:hover{border-color:var(--ink);transform:translateY(-1px);}
.vibe-choice.sel{border-color:var(--coral);box-shadow:inset 0 0 0 1px var(--coral);}
.vibe-img{width:100%;height:120px;object-fit:cover;display:block;}
.vibe-body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px;}
.vibe-title{font-family:var(--font-display);font-size:20px;}
.vibe-feels{font-size:13.5px;line-height:1.5;color:var(--muted);}
.vibe-swatches{display:flex;margin-top:4px;}
.vibe-swatches i{width:36px;height:22px;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06);}
.vibe-swatches i:first-child{border-radius:6px 0 0 6px;}
.vibe-swatches i:last-child{border-radius:0 6px 6px 0;}

.quiz-progress{display:flex;gap:6px;margin-bottom:22px;}
.quiz-progress .qp{height:4px;flex:1;border-radius:999px;background:var(--line);transition:.2s;}
.quiz-progress .qp.on{background:var(--ink);}
.quiz-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.quiz-opt{text-align:left;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;
  cursor:pointer;padding:0;transition:.15s;font-family:inherit;color:var(--ink);display:flex;flex-direction:column;}
.quiz-opt:hover{border-color:var(--ink);transform:translateY(-1px);}
.quiz-opt.sel{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink);}
.quiz-img{width:100%;height:118px;object-fit:cover;display:block;}
.quiz-sw{display:flex;height:38px;}
.quiz-sw i{flex:1;display:block;}
.quiz-opt-body{padding:14px 16px;display:flex;flex-direction:column;gap:3px;}
.quiz-label{font-size:15px;font-weight:600;line-height:1.3;}
.quiz-sub{font-size:12.5px;color:var(--muted);}
.quiz-opt.quote .quiz-opt-body{padding:20px 20px;}
.quiz-opt.quote .quiz-label{font-family:var(--font-display);font-weight:500;font-style:italic;font-size:21px;line-height:1.25;}
.quiz-skip{font-size:12.5px;color:var(--muted);opacity:.7;align-self:center;}
.quiz-note{font-size:11.5px;color:var(--muted);opacity:.65;font-style:italic;margin-top:12px;}
.quiz-opt.choice .quiz-opt-body{padding:18px 18px;min-height:64px;justify-content:center;}

.dials{display:flex;gap:16px;flex-wrap:wrap;}
.dial{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:16px 18px;flex:1;min-width:200px;}
.dial-label{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);opacity:.7;display:block;margin-bottom:10px;}
.seg-row{display:flex;gap:8px;}
.seg-row .seg{flex:1;text-align:center;}
.big-choice{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:20px;
  cursor:pointer;display:flex;flex-direction:column;gap:6px;transition:.15s;}
.big-choice:hover{border-color:var(--ink);transform:translateY(-1px);}
.big-choice.sel{border-color:var(--coral);box-shadow:inset 0 0 0 1px var(--coral);}
.big-choice-title{font-family:var(--font-display);font-size:19px;}
.big-choice-sub{font-size:13px;line-height:1.5;color:var(--muted);}

.palette-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;}
.palette-card{text-align:left;border:1px solid;border-radius:16px;padding:18px;cursor:pointer;
  transition:.18s;font-family:inherit;}
.palette-card:hover{transform:translateY(-2px);}
.pc-imgs{display:flex;gap:4px;margin-bottom:14px;}
.pc-imgs img{flex:1;width:0;height:58px;object-fit:cover;border-radius:6px;display:block;background:var(--paper);}
.field-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.template-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;}
.template-card{text-align:left;background:var(--surface);border:1px solid rgba(0,0,0,.10);border-radius:16px;padding:14px;
  cursor:pointer;transition:.15s;font-family:inherit;color:var(--ink);}
.template-card:hover{transform:translateY(-2px);border-color:var(--navy);}
.template-card.sel{border-color:var(--coral);box-shadow:inset 0 0 0 1px var(--coral);}
.template-cap{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);opacity:.55;margin:10px 0 8px;}
.template-name{font-family:var(--font-display);font-size:19px;}
.template-tag{font-size:12.5px;color:var(--muted);margin-top:1px;}
.template-blurb{font-size:12.5px;line-height:1.5;color:var(--muted);margin-top:8px;}

.tone-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.tone-chip{font-size:13.5px;padding:8px 15px;border:1px solid var(--line);background:var(--surface);border-radius:999px;
  cursor:pointer;font-family:inherit;color:var(--ink);transition:.15s;}
.tone-chip:hover{border-color:var(--ink);}
.tone-chip.sel{background:var(--ink);color:#fff;border-color:var(--ink);font-weight:500;}
.tone-chip.dim{opacity:.4;cursor:not-allowed;}
.tone-chip.sm{font-size:12.5px;padding:6px 12px;}
.style-row{margin-bottom:14px;}
.style-label{font-size:13.5px;color:var(--ink);margin-bottom:7px;}
.stmt-row{display:flex;gap:10px;align-items:center;margin-bottom:10px;}
.stmt-num{width:22px;flex:none;text-align:center;font-size:12px;color:var(--muted);opacity:.6;font-variant-numeric:tabular-nums;}
.stmt-row .field{flex:1;}
.minimal-wrap{display:flex;flex-direction:column;}
.minimal-cue{margin-top:9px;font-size:12px;line-height:1.4;text-align:center;color:var(--ink);
  background:rgba(255,127,80,.14);border:1px dashed rgba(255,127,80,.55);border-radius:999px;padding:7px 12px;}
.tone-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;}
.tone-card{display:flex;flex-direction:column;gap:8px;text-align:left;background:var(--surface);border:1px solid var(--line);
  border-radius:12px;padding:13px 15px;cursor:pointer;font-family:inherit;color:var(--ink);transition:.15s;}
.tone-card:hover{border-color:var(--ink);}
.tone-card.sel{border-color:var(--coral);box-shadow:inset 0 0 0 1px var(--coral);background:#fff;}
.tone-card.dim{opacity:.42;cursor:not-allowed;}
.tone-sample{font-family:var(--font-display);font-size:14px;line-height:1.45;font-style:italic;}
.tone-word{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);}
.tone-card.sel .tone-word{color:var(--ink);font-weight:600;}
.feature-hint{font-size:13.5px;line-height:1.65;color:var(--muted);margin:0 0 12px;max-width:530px;opacity:.92;}
.feature-row{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:center;margin-bottom:10px;}
.feature-x{background:none;border:1px solid var(--line);border-radius:8px;width:36px;height:36px;flex:none;
  cursor:pointer;color:var(--muted);font-size:18px;line-height:1;}
.feature-x:hover{border-color:var(--ink);color:var(--ink);}

.recap{background:rgba(227,246,150,.34);border:1px solid rgba(18,51,61,.10);border-radius:12px;padding:16px 18px;margin:6px 0 20px;}
.recap-title{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500;margin-bottom:10px;opacity:.75;}
.recap-row{display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:3px 0;}
.recap-row span:last-child{color:var(--muted);}
.service-card{border:1px solid rgba(18,51,61,.10);border-radius:16px;padding:22px 24px 26px;margin-bottom:20px;background:var(--surface);}
.service-head{display:flex;justify-content:space-between;align-items:center;}
.service-num{font-family:var(--font-display);font-size:16px;letter-spacing:0;text-transform:none;color:var(--navy);font-weight:400;}
select.field{appearance:auto;}
.addon-row{display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);
  border-radius:12px;padding:14px;cursor:pointer;margin-bottom:10px;font-family:inherit;color:var(--ink);transition:.15s;}
.addon-row:hover{border-color:var(--ink);}
.addon-row.sel{border-color:var(--coral);box-shadow:inset 0 0 0 1px var(--coral);background:#fff;}
.addon-check{width:22px;height:22px;border-radius:6px;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:13px;flex:none;}
.addon-row.sel .addon-check{background:var(--coral);color:#fff;border-color:var(--coral);}
.addon-body{display:flex;flex-direction:column;gap:2px;}
.addon-name{font-size:14px;font-weight:600;}
.addon-price{font-weight:400;color:var(--muted);font-size:12.5px;}
.addon-note{font-size:12px;color:var(--muted);}

.quiet-link{background:none;border:none;color:var(--muted);font-size:13px;text-decoration:underline;
  text-underline-offset:3px;cursor:pointer;margin-top:16px;padding:4px 0;opacity:.75;font-family:inherit;}
.quiet-link:hover{opacity:1;}
.gallery-row{display:flex;gap:14px;align-items:flex-start;}
.accent-panel{margin-top:18px;background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:16px 18px;}
.accent-title{font-size:14px;font-weight:600;display:flex;flex-direction:column;gap:4px;margin-bottom:12px;}
.accent-title span{font-weight:400;font-size:12.5px;line-height:1.5;color:var(--muted);opacity:.85;max-width:520px;}
.accent-row{display:flex;flex-wrap:wrap;gap:10px;}
.accent-chip{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid var(--line);
  border-radius:999px;padding:7px 15px 7px 8px;font-size:13.5px;cursor:pointer;font-family:inherit;color:var(--ink);transition:.15s;}
.accent-chip:hover{border-color:var(--ink);}
.accent-chip.sel{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink);}
.accent-dots{display:inline-flex;}
.accent-dots i{width:16px;height:16px;border-radius:999px;display:inline-block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.14);}
.accent-dots i:last-child{margin-left:-5px;}

.silhouette-toggle{display:flex;align-items:center;gap:6px;margin-bottom:18px;}
.seg{font-size:13px;padding:5px 14px;border:1px solid var(--line);background:var(--surface);border-radius:999px;cursor:pointer;font-family:inherit;color:var(--ink);}
.seg.sel{background:var(--ink);color:#fff;border-color:var(--ink);}
.type-card{display:block;width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);
  border-radius:14px;padding:18px 20px;cursor:pointer;transition:.15s;font-family:inherit;color:var(--ink);}
.type-card:hover{border-color:var(--ink);}
.type-card.sel{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink);}
.type-tag{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);opacity:.7;}
.type-names{font-size:12.5px;opacity:.6;}
.type-others{display:grid;gap:12px;}

.imagery-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;}
.chip-choice{text-align:left;background:#fff;border:1px solid var(--line);border-radius:12px;
  padding:14px;cursor:pointer;display:flex;flex-direction:column;gap:3px;transition:.15s;font-family:inherit;color:var(--ink);}
.chip-choice:hover{border-color:var(--ink);}
.chip-choice.sel{border-color:var(--ink);box-shadow:0 0 0 2px var(--ink);background:var(--paper);}
.chip-title{font-weight:600;font-size:14px;}
.chip-hint{font-size:12px;color:var(--muted);}
.info-note{font-size:13px;line-height:1.65;color:var(--muted);background:rgba(255,205,205,.34);
  border-radius:10px;padding:14px 16px;margin-top:20px;}

.gap-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--paper);
  border:1px solid var(--line);border-radius:12px;padding:11px 16px;font-size:13.5px;margin-bottom:18px;}
.gap-bar strong{font-weight:700;}
.gap-div{width:1px;height:16px;background:var(--line);}
.gap-hint{font-size:12.5px;color:var(--muted);opacity:.8;margin-left:auto;}
.role-list{border:1px solid var(--line);border-radius:14px;overflow:hidden;}
.role-row{display:flex;align-items:center;gap:14px;padding:13px 16px;border-bottom:1px solid var(--line);}
.role-row:last-child{border-bottom:none;}
.role-row.empty{background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,.018) 8px,rgba(0,0,0,.018) 16px);}
.role-swatch{width:34px;height:34px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;
  background:#fff;border:1.5px dashed rgba(0,0,0,.24);color:var(--muted);font-size:14px;}
.role-swatch[style]{border:1px solid rgba(0,0,0,.12);}
.role-meta{flex:1;min-width:0;}
.role-name{font-size:14px;font-weight:600;display:flex;align-items:baseline;gap:8px;}
.role-token{font-size:11px;font-weight:400;opacity:.5;font-family:ui-monospace,SFMono-Regular,monospace;}
.role-plain{font-size:12.5px;line-height:1.45;color:var(--muted);margin-top:2px;}
.role-input{width:132px;flex:none;border:1px solid var(--line);border-radius:9px;padding:9px 11px;
  font-size:13.5px;font-family:inherit;color:var(--ink);background:#fff;}
.role-input.wide{width:180px;}
.role-input:focus{outline:2px solid var(--ink);outline-offset:1px;border-color:var(--ink);}
.sub-head{font-family:var(--font-display);font-size:20px;font-weight:400;letter-spacing:0;text-transform:none;
  color:var(--navy);margin:44px 0 2px;padding-bottom:0;border-bottom:none;}
.sub-head .opt{font-family:var(--font-ui);font-weight:400;font-size:12.5px;color:var(--muted);font-style:italic;}

.why{font-size:13.5px;line-height:1.6;color:var(--muted);margin:0 0 11px;max-width:530px;opacity:.88;}

.field-label{display:block;font-size:15.5px;font-weight:600;margin:34px 0 5px;color:var(--navy);line-height:1.45;}
.field-label .opt{font-weight:400;opacity:.65;font-size:13px;color:var(--muted);font-style:italic;}
.field{width:100%;border:1px solid rgba(18,51,61,.20);border-radius:9px;padding:13px 15px;font-size:15px;
  font-family:inherit;color:var(--ink);background:var(--surface);transition:.18s;}
.field:hover{border-color:rgba(18,51,61,.38);}
.field:focus{outline:none;border-color:var(--coral);box-shadow:0 0 0 3px rgba(255,127,80,.25);}
.field::placeholder{color:var(--muted);opacity:.55;}
textarea.field{resize:vertical;line-height:1.65;min-height:76px;}
select.field{background:#fff;}

.nav-row{display:flex;justify-content:space-between;align-items:center;margin-top:52px;gap:12px;
  border-top:1px solid var(--line);padding-top:28px;}
.btn-solid{background:var(--coral);color:#fff;border:none;border-radius:999px;padding:13px 30px;
  font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:.2s;letter-spacing:.01em;}
.btn-solid:hover:not(:disabled){background:#F26A38;}
.btn-solid:disabled{opacity:.26;cursor:not-allowed;}
.btn-ghost{background:none;color:var(--muted);border:none;border-radius:999px;
  padding:13px 4px;font-size:14px;font-weight:400;cursor:pointer;font-family:inherit;transition:.2s;}
.btn-ghost:hover{color:var(--navy);}

.alacarte{font-size:12px;line-height:1.5;color:var(--muted);opacity:.7;margin-top:22px;
  border-top:1px dashed var(--line);padding-top:14px;max-width:560px;}
.alacarte a{text-decoration:underline;text-underline-offset:2px;}

.brand-board{border-radius:16px;padding:22px;box-shadow:0 8px 26px rgba(0,0,0,.08);}
.review-card{border:1px solid rgba(18,51,61,.10);border-radius:16px;overflow:hidden;background:var(--surface);}
.review-row{display:grid;grid-template-columns:120px 1fr auto;gap:12px;align-items:center;
  padding:13px 16px;border-bottom:1px solid var(--line);}
.review-row:last-child{border-bottom:none;}
.review-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:500;opacity:.75;}
.review-value{font-size:14px;}
.review-edit{background:none;border:none;color:var(--muted);text-decoration:underline;
  text-underline-offset:2px;cursor:pointer;font-size:13px;font-family:inherit;}

.finish{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;
  margin-top:52px;border-top:1px solid var(--line);padding-top:28px;}
.finish-title{font-family:var(--font-display);font-size:22px;font-weight:400;color:var(--navy);}
.finish-sub{font-size:13.5px;color:var(--muted);margin-top:4px;}


.cp-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:32px 0 18px;}
.cp-dots{display:flex;gap:7px;align-items:center;}
.cp-dot{width:7px;height:7px;border-radius:999px;border:none;padding:0;cursor:pointer;
  background:rgba(18,51,61,.22);transition:.2s;}
.cp-dot:hover{background:rgba(18,51,61,.45);}
.cp-dot.done{background:rgba(18,51,61,.45);}
.cp-dot.cur{background:var(--coral);width:22px;}
.cp-count{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);opacity:.6;}
.qcard{background:var(--surface);border:1px solid rgba(18,51,61,.10);border-radius:20px;padding:38px 40px 40px;
  box-shadow:0 4px 24px rgba(18,51,61,.07);}
.q-title{font-family:var(--font-display);font-weight:400;font-size:25px;line-height:1.25;
  margin:0;color:var(--navy);}
.q-why{font-size:14px;line-height:1.65;color:var(--muted);margin:14px 0 22px;max-width:520px;}
.qcard .field{font-size:15.5px;}
.qcard .recap{margin:0 0 18px;}
@media(max-width:640px){.qcard{padding:26px 22px 28px;}.q-title{font-size:21px;}}

.ack{display:flex;align-items:flex-start;gap:11px;margin-top:24px;font-size:14px;line-height:1.5;cursor:pointer;}
.ack input{margin-top:2px;width:17px;height:17px;accent-color:var(--coral);flex:none;}
.legal-list{margin-top:20px;display:flex;flex-direction:column;gap:16px;}
.legal-item{border-left:2px solid var(--coral);padding-left:14px;}
.legal-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:3px;}
.legal-body{font-size:13.5px;line-height:1.6;color:var(--muted);}


.signin-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 24px;}
.signin-card{background:var(--surface);border:1px solid rgba(18,51,61,.10);border-radius:22px;
  padding:48px 52px 44px;max-width:560px;width:100%;box-shadow:0 8px 40px rgba(18,51,61,.09);}
.signin-eyebrow{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);
  opacity:.7;font-weight:600;}
.signin-title{font-family:var(--font-display);font-weight:400;font-size:34px;line-height:1.15;
  margin:14px 0 0;color:var(--ink);}
.signin-sub{font-size:15.5px;line-height:1.7;color:var(--muted);margin:16px 0 0;}
.signin-actions{margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;}
.signin-alt{display:block;margin-top:16px;background:none;border:none;padding:0;cursor:pointer;
  font-family:inherit;font-size:13.5px;color:var(--muted);text-decoration:underline;text-underline-offset:3px;}
.signin-alt:hover{color:var(--ink);}
.signin-err{margin-top:18px;font-size:13.5px;line-height:1.6;color:var(--ink);
  background:rgba(255,205,205,.45);border-radius:10px;padding:12px 14px;}
.save-dot{font-family:var(--font-ui);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
  margin-left:14px;opacity:0;transition:opacity .3s;color:var(--muted);}
.save-dot.saving,.save-dot.saved,.save-dot.error{opacity:.75;}
.save-dot.error{color:#C0392B;opacity:1;}
@media (max-width:640px){.signin-card{padding:34px 26px 30px;}.signin-title{font-size:27px;}}
.fade-in{animation:fadeIn .3s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}

@media (max-width:760px){
  .stage{flex-direction:column;}
  .side{width:auto;padding:22px 20px 18px;border-bottom:1px solid var(--line);}
  .side-title{font-size:21px;margin-bottom:16px;}
  .timeline{display:flex;gap:6px;overflow-x:auto;}
  .timeline::before{left:14px;right:14px;top:12px;bottom:auto;height:1px;width:auto;}
  .tl-item{flex-direction:column;gap:6px;padding:0;flex:none;}
  .tl-label{font-size:11px;white-space:nowrap;}
  .side-note{display:none;}
  .panel{padding:24px 20px 40px;}
  .choice-grid{grid-template-columns:1fr;}
  .vibe-grid{grid-template-columns:1fr;}
  .quiz-grid{grid-template-columns:1fr;}
  .step-title{font-size:25px;}
}
@media (max-width:760px){
  .role-row{flex-wrap:wrap;}
  .role-input,.role-input.wide{width:100%;}
  .gap-hint{margin-left:0;width:100%;}
  .field-2col{grid-template-columns:1fr;}
  .feature-row{grid-template-columns:1fr auto;}
}
@media (prefers-reduced-motion:reduce){.fade-in{animation:none;}.big-choice:hover,.palette-card:hover{transform:none;}}
`;
