// Plot Unfolding Machine v9.0 — oracle tables.
// Extracted from the supplied PDF via bbox reconstruction; page numbers cited per table.
// Effect text is paraphrased/condensed from the book. Numbers and structure are the book's.

// --- Yes or No, 1d10 (p.12) -------------------------------------------------
// Column identity confirmed against the granular tables on p.24 (ruling A1).
export const YES_NO = {
  deterministic: {
    name: "Deterministic",
    blurb: "Asking the universe, when you need a concrete answer.",
    page: 12,
    rows: [
      "Strong no", "No", "No", "No", "Weak no",
      "Weak yes", "Yes", "Yes", "Yes", "Strong yes",
    ],
  },
  subjective: {
    name: "Subjective",
    blurb: "Asking from a character's point of view, where they may not know.",
    page: 12,
    rows: [
      "No, definitely not", "No, apparently not", "No, not yet", "No, but...",
      "Don't know, can't tell", "It depends (on skill)", "Yes, but...",
      "Yes, sometimes", "Yes, apparently", "Yes, absolutely",
    ],
  },
  conversation: {
    name: "Conversation",
    blurb: "Asking during dialogue with a non-protagonist character.",
    page: 12,
    rows: [
      "No, absolutely not", "No, it's strange", "No, it's dangerous", "No, I think not",
      "I don't know", "It's complicated", "Yes, I think so", "Yes, be careful",
      "Yes, pretty sure", "Yes, of course",
    ],
  },
};

// --- Granular Yes or No, 1d100 at a declared expectation (p.24) -------------
// Each row: [answer, {band: [min, max]}]. Bands tile 1-100 within each column.
export const GRANULAR_BANDS = [
  "no way", "hardly", "unlikely", "neutral", "likely", "surely", "certain",
];

export const GRANULAR = {
  deterministic: {
    name: "Deterministic",
    page: 24,
    rows: [
      ["Strong no",  [[1, 18],  [1, 15],  [1, 12],  [1, 8],   [1, 7],   [1, 4],   [1, 2]]],
      ["No",         [[19, 76], [16, 70], [13, 52], [9, 40],  [8, 23],  [5, 10],  [3, 5]]],
      ["Weak no",    [[77, 88], [71, 80], [53, 65], [41, 50], [24, 35], [11, 20], [6, 12]]],
      ["Weak yes",   [[89, 95], [81, 90], [66, 77], [51, 60], [36, 48], [21, 30], [13, 24]]],
      ["Yes",        [[96, 98], [91, 96], [78, 93], [61, 92], [49, 88], [31, 85], [25, 82]]],
      ["Strong yes", [[99, 100], [97, 100], [94, 100], [93, 100], [89, 100], [86, 100], [83, 100]]],
    ],
  },
  subjective: {
    name: "Subjective",
    page: 24,
    rows: [
      ["No, definitely not",     [[1, 26],  [1, 24],  [1, 20],  [1, 15],  [1, 10],  [1, 6],   [1, 2]]],
      ["No, apparently not",     [[27, 49], [25, 44], [21, 36], [16, 27], [11, 18], [7, 12],  [3, 5]]],
      ["No, not yet",            [[50, 63], [45, 56], [37, 49], [28, 37], [19, 25], [13, 18], [6, 9]]],
      ["No, but...",             [[64, 75], [57, 66], [50, 59], [38, 45], [26, 31], [19, 24], [10, 15]]],
      ["Don't know, can't tell", [[76, 80], [67, 71], [60, 64], [46, 50], [32, 36], [25, 29], [16, 20]]],
      ["It depends (on skill)",  [[81, 85], [72, 76], [65, 69], [51, 55], [37, 41], [30, 34], [21, 25]]],
      ["Yes, but...",            [[86, 91], [77, 82], [70, 75], [56, 63], [42, 51], [35, 44], [26, 37]]],
      ["Yes, sometimes",         [[92, 95], [83, 88], [76, 82], [64, 73], [52, 64], [45, 56], [38, 51]]],
      ["Yes, apparently",        [[96, 98], [89, 94], [83, 90], [74, 85], [65, 80], [57, 76], [52, 74]]],
      ["Yes, absolutely",        [[99, 100], [95, 100], [91, 100], [86, 100], [81, 100], [77, 100], [75, 100]]],
    ],
  },
  conversation: {
    name: "Conversation",
    page: 24,
    rows: [
      ["No, and...",         [[1, 10],  [1, 9],   [1, 8],   [1, 6],   [1, 4],   [1, 3],   [1, 2]]],
      ["No, definitely not", [[11, 20], [10, 18], [9, 16],  [7, 12],  [5, 8],   [4, 6],   [3, 4]]],
      ["No, it's dangerous", [[21, 30], [19, 27], [17, 24], [13, 18], [9, 12],  [7, 9],   [5, 6]]],
      ["No, it's too late",  [[31, 40], [28, 36], [25, 32], [19, 24], [13, 16], [10, 12], [7, 8]]],
      ["No, I think not",    [[41, 50], [37, 45], [33, 40], [25, 30], [17, 20], [13, 15], [9, 10]]],
      ["No, unless...",      [[51, 60], [46, 54], [41, 48], [31, 36], [21, 24], [16, 18], [11, 12]]],
      ["No, but...",         [[61, 70], [55, 63], [49, 56], [37, 42], [25, 28], [19, 21], [13, 14]]],
      ["I don't know",       [[71, 78], [64, 71], [57, 64], [43, 50], [29, 36], [22, 29], [15, 22]]],
      ["It's complicated",   [[79, 86], [72, 79], [65, 72], [51, 58], [37, 44], [30, 37], [23, 30]]],
      ["Yes, but...",        [[87, 88], [80, 82], [73, 76], [59, 64], [45, 52], [38, 46], [31, 40]]],
      ["Yes, for a price",   [[89, 90], [83, 85], [77, 80], [65, 70], [53, 60], [47, 55], [41, 50]]],
      ["Yes, pretty sure",   [[91, 92], [86, 88], [81, 84], [71, 76], [61, 68], [56, 64], [51, 60]]],
      ["Yes, hurry up",      [[93, 94], [89, 91], [85, 88], [77, 82], [69, 76], [65, 73], [61, 70]]],
      ["Yes, be careful",    [[95, 96], [92, 94], [89, 92], [83, 88], [77, 84], [74, 82], [71, 80]]],
      ["Yes, of course",     [[97, 98], [95, 97], [93, 96], [89, 94], [85, 92], [83, 91], [81, 90]]],
      ["Yes, and...",        [[99, 100], [98, 100], [97, 100], [95, 100], [93, 100], [92, 100], [91, 100]]],
    ],
  },
};

// --- Descriptive oracles, 1d10 (p.12) --------------------------------------
// "About elements your characters can perceive around them." Enriched with Description.
export const DESCRIPTIVE = [
  {
    id: "someone", name: "Someone", question: "who", page: 12,
    blurb: "Identify a character — new or known — by a defining feature.",
    rows: [
      "Nobody special but convenient",
      "A political or reasonable person",
      "They aren't exactly a person...",
      "A very famous figure or leader",
      "Someone currently in trouble",
      "Someone who knows the area",
      "Someone holy or well revered",
      "Belongs to a family or faction",
      "Someone you relate to, or know",
      "Someone you'd prefer to avoid",
    ],
  },
  {
    id: "place", name: "Place", question: "where", page: 12,
    blurb: "Generate a location quickly from a key detail.",
    rows: [
      "Is difficult to traverse or navigate",
      "Is very hard to find or get inside",
      "Has bad reputation or dangerous",
      "Is moving, changing, or shifting",
      "In a hazardous atmosphere or area",
      "Being protected by some faction",
      "Holds valuable resources or riches",
      "Has been abandoned or destroyed",
      "Is holy, sacred, or somehow cursed",
      "Magical, or advanced technology",
    ],
  },
  {
    id: "object", name: "Object", question: "what for", page: 12,
    blurb: "Come up with an item from its function, purpose, or value.",
    rows: [
      "Triggers transformation or mutation",
      "Can restore, heal, repair, or revive",
      "Is hindering, paralyzing, or disabling",
      "Capable of channeling or enhancing",
      "Protects from some kind of harm",
      "Designed to cause physical harm",
      "Meant to cause mental affliction",
      "Restore or boost energy or stamina",
      "Grants a special power or ability",
      "Communicate or transmit remotely",
    ],
  },
  {
    id: "hazard", name: "Hazard", question: "type", page: 12,
    blurb: "The nature of a danger when facing a threat.",
    rows: [
      "Agile, fast, nimble",
      "Armored, defensive",
      "Sneaky, hiding, rogue",
      "Tactical, smart, clever",
      "Magic, special, power",
      "Technical, gadgets",
      "Strong, brute, large",
      "Flying, swim, jumps",
      "Intimidating, scary",
      "Ranged, accurate",
    ],
  },
  {
    id: "mood", name: "Mood", question: "feel", page: 12,
    blurb: "Establish the atmosphere or emotional tone of a scene.",
    rows: [
      "Of anxiety, unease, or distress",
      "Of relief, calm, or tranquility",
      "Of irritation, anger, or annoyance",
      "Of curiosity, interest, or wisdom",
      "Of confusion, doubt, indecision",
      "Of excitement, energy, power",
      "Of loneliness, silence, emptiness",
      "Of determination, work, focus",
      "Of nervousness, fear, concern",
      "Of joy, satisfaction, pleasure",
    ],
  },
  {
    id: "notice", name: "Notice", question: "perceive", page: 12,
    blurb: "Spark curiosity by highlighting something worth investigating.",
    rows: [
      "Hear a voice, scream, whisper",
      "Sense an atmospheric change",
      "See a ghost, vision, or memory",
      "Light or some blinding sight",
      "Something in the air or smell",
      "Feel someone following you",
      "Recognize something familiar",
      "Recent traces or a footprint",
      "Possible trap or surprise ahead",
      "Something moving or changing",
    ],
  },
];

// --- Story oracles, 1d10 (p.13) --------------------------------------------
// "Plot-related answers, such as reasons why, or what is at risk." Enriched with Focus.
export const STORY = [
  {
    id: "discovery", name: "Discovery", question: "find", page: 13,
    blurb: "Your characters learn something, or deserve an explanation.",
    rows: [
      "Reveal secret or conspiracy",
      "Names or lead to someone",
      "Means to unlock something",
      "Tool, an item, or technology",
      "Pointers to a key location",
      "Contradict an assumption",
      "Weakness or a vulnerability",
      "Insight on plans or research",
      "Trace of presence or activity",
      "Main strengths or resources",
    ],
  },
  {
    id: "problem", name: "Problem", question: "risk", page: 13,
    blurb: "A circumstance at risk, or something bad with a consequence.",
    rows: [
      "Be harmed or afflicted",
      "Betray a value or friend",
      "Have to break a vow or lie",
      "Face a deadline, pressure",
      "Risk losing a beloved one",
      "Risk a dream or ambition",
      "Endanger lives or an area",
      "Lose wealth or resources",
      "Lose or break an object",
      "Risk honor or reputation",
    ],
  },
  {
    id: "intent", name: "Intent", question: "wants", page: 13,
    blurb: "What somebody wants from your characters.",
    rows: [
      "What you have or could get",
      "To support your cause",
      "Deal with an issue or enemy",
      "Find or travel to a location",
      "Oppose you or your cause",
      "Make a trade or sell to you",
      "Demand an explanation",
      "Reveal you some information",
      "Show or give you something",
      "Come along or follow you",
    ],
  },
  {
    id: "activity", name: "Activity", question: "doing", page: 13,
    blurb: "What an actor — person or faction — is currently engaged in.",
    rows: [
      "Protecting domain or land",
      "Making business as usual",
      "Searching for something",
      "Having a fight or attacking",
      "Looking for some answers",
      "Preparing for something",
      "Having a talk or arguing",
      "Managing their resources",
      "Interacting with someone",
      "Getting rid of something",
    ],
  },
  {
    id: "reason", name: "Reason", question: "why", page: 13,
    blurb: "Why an event or action took place.",
    rows: [
      "To seek power or domination",
      "To get revenge or have justice",
      "Honor a debt or an open issue",
      "For glory, status, reputation",
      "A matter of culture or history",
      "For protection or survival",
      "Mostly about wealth or riches",
      "To seek knowledge or intel",
      "For selfishness or self-interest",
      "To fulfill a demand or an order",
    ],
  },
  {
    id: "explain", name: "Explain", question: "how", page: 13,
    blurb: "How something actually happened.",
    rows: [
      "An accident, a side effect",
      "Just a mistake, unintended",
      "Was a moment of weakness",
      "Must be a misunderstanding",
      "Unrelated, just coincidence",
      "It has been underestimated",
      "Had to make a hard choice",
      "Shared vote, an agreement",
      "It was all part of the plan",
      "Deliberate malicious intent",
    ],
  },
];

// --- Enrichment: Description, 1d100 in pairs (p.12) -------------------------
// Row n covers (2n-1)-(2n). Order verified against the printed five-column layout.
export const DESCRIPTION = {
  name: "Description", question: "looks", page: 12,
  blurb: "Detail, appearance, impression — enriches a descriptive oracle.",
  rows: [
    "ancient / old", "beautiful / nice", "bright / shiny", "chaotic / mad",
    "cheery / happy", "circular / fat", "cold / distant", "colorful / light",
    "cozy / friendly", "dangerous", "dark / evil", "diverse / varied",
    "dry / rough", "dull / boring", "exciting / active", "foggy / blurry",
    "futuristic / far", "gloomy / grim", "historic / quaint", "normal / simple",
    "hot / angry", "humid / warm", "innovative / cool", "jagged / edgy",
    "lonely / separate", "majestic / grand", "modern / new", "mysterious / odd",
    "peaceful / calm", "poor / lacking", "rainy / wet", "rectangular",
    "rich / wealthy", "romantic / loving", "smooth / fun", "snowy / slow",
    "unique / special", "sad / depressing", "scary / taunting", "serene / quiet",
    "stable / calm", "stormy / mad", "sunny / smiling", "traditional / norm",
    "tiny / small", "ugly / horrid", "unexpected", "vast / big",
    "violent / furious", "windy / moving",
  ],
};

// --- Enrichment: Focus, 1d100 in pairs (p.13) ------------------------------
export const FOCUS = {
  name: "Focus", question: "what", page: 13,
  blurb: "Subject, thing, goal, discovery — enriches a story oracle.",
  rows: [
    "Ambition / Idea", "Arrival / Birth", "Artifact / Item", "Battle / Fight",
    "Books / Lore", "Chant / Rite", "Cipher / Code", "Culture / Past",
    "Debt / Trade", "Domain / Land", "Finding / Search", "Enemy / Danger",
    "Enigma / Doubt", "Faction / Family", "Faith / Divine", "Fear / Nightmare",
    "Forces / Strength", "Fortress / Tower", "Friend / Allies", "Global / Universe",
    "Hazard / Nature", "Illusions / Ghost", "Jewelry / Gem", "Karma / Deed",
    "Key / Doors", "Lies / Whisper", "Love / Passion", "Machine / Robot",
    "Magic / Weird", "Mission / Task", "Monster / Beast", "Mystery / Murder",
    "Noise / Sound", "Pain / Suffering", "Place / Mood", "Plan / Blackmail",
    "Politics / Laws", "Power / Control", "Promise / Vow", "Protocol / Rules",
    "Rebels / Traitor", "Riches / Wealth", "Secrets / Plots", "Tech / Future",
    "Transformation", "Traps / Ambush", "Treasure / Loot", "Tyranny / Evil",
    "Vision / Prophecy", "Weapons / Tools",
  ],
};

// --- Quantifiers, 1d10 (p.13) ----------------------------------------------
// "Set a baseline value before rolling."
export const QUANTIFIERS = [
  {
    id: "many", name: "How many / much", page: 13,
    rows: [
      "Just one, or none", "Way less than expected", "A bit less than expected",
      "As expected", "As expected", "As expected", "As expected",
      "A bit more than expected", "Way more than expected", "Countless, or infinite",
    ],
  },
  {
    id: "good", name: "How good / well", page: 13,
    rows: [
      "Damaged, or useless", "Way worse than expected", "A bit worse than expected",
      "As expected", "As expected", "As expected", "As expected",
      "A bit better than expected", "Way better than expected", "Magnificent, or perfect",
    ],
  },
  {
    id: "hard", name: "How hard / tough", page: 13,
    rows: [
      "Very easy, or not worth it", "Way easier than expected", "A bit easier than expected",
      "As expected", "As expected", "As expected", "As expected",
      "A bit harder than expected", "Way harder than expected", "Overwhelming, or impossible",
    ],
  },
];
