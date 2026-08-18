// Plot Unfolding Machine v9.0 — plot beats, plot sheets, plot nodes.
// Track box counts are measured from the printed sheets at 300 dpi, not estimated.

// --- Modified proposals, 1d10 (p.14, identical on every sheet) --------------
export const MODIFIED_PROPOSALS = [
  "Increase the intensity and tension",
  "Bring someone quite inconvenient",
  "Add some trouble, or bad news",
  "Make the location less favorable",
  "Cause frustration, stress, or worry",
  "Cause confusion, doubts, disarray",
  "Make the location more favorable",
  "Add some reward, or good news",
  "Bring someone quite convenient",
  "Decrease the intensity and tension",
];

// Which kind of modification each d10 face is, so the book's own explanation of
// that kind can be shown beside the result (p.6, read against the p.14 column).
export const PROPOSAL_KINDS = [
  "intensity", "someone", "add", "location", "emotion",
  "emotion", "location", "add", "someone", "intensity",
];

// How the book explains each kind of modification (p.6).
export const PROPOSAL_NOTES = {
  location: "Change how beneficial or challenging the setting is — from a single room to a whole galaxy.",
  emotion: "No fixed definition. It can hit the PCs, the NPCs, the scene, or you as the player — something they feel, or something they unknowingly cause.",
  add: "An unexpected element arrives and shifts the situation in a specific direction.",
  someone: "Someone, new or not, enters the scene with a clear bias. Use the Someone or Intent oracles for detail.",
  intensity: "Adjust the beat's weight or drama to make the scene land harder or softer.",
};

// --- ABCD random events, 1d10 each (p.14) ---------------------------------
export const ABCD = {
  A: {
    letter: "A", name: "Complication", page: 14,
    blurb: "Something sets back the PCs' current intentions. Is it too late, or can they still avoid it?",
    rows: [
      "A surprise, trap, or an ambush!",
      "Face plot unrelated opposition",
      "Betrayal, or a change of mind",
      "Location becomes a problem",
      "Trouble with gear or supplies",
      "Accident, or a disaster strikes",
      "Someone needs help, badly",
      "Misinformation, or deception",
      "Delayed, blocked, or a detour",
      "A character's flaw is triggered",
    ],
  },
  B: {
    letter: "B", name: "Catalyst", page: 14,
    blurb: "Pause to explore and immerse the world — openers to side quests and parallel problems.",
    rows: [
      "Discover a path, or location",
      "Regret a recent decision",
      "Uncover someone's secret",
      "Chance for a trade, or loot",
      "Address characters' needs",
      "Temptation with a curiosity",
      "Feel impact of remote event",
      "Reveal a faction's intentions",
      "Reaction of the environment",
      "Trigger a character story arc",
    ],
  },
  C: {
    letter: "C", name: "Challenge", page: 14,
    blurb: "Let the kind of challenge inspire the whole situation that matches the task. Think of a reward.",
    rows: [
      "Require first aid or medicine",
      "Resist or endure an affliction",
      "Strength or power could help",
      "Use for craft, magic, or tech",
      "Spot a useful object or item",
      "Need for strong persuasion",
      "Something fails or breaks",
      "Some danger better to avoid",
      "A locked door, object, or path",
      "Recall knowledge or logic test",
    ],
  },
  D: {
    letter: "D", name: "Situation", page: 14,
    blurb: "Situations that present themselves — driven by the world, other factions, and non-protagonists.",
    rows: [
      "Worst-case scenario unfolds",
      "Face an emergency or alarm",
      "Being watched or followed",
      "Risk harming a relationship",
      "Unexpected twist or reveal",
      "Sudden change in the place",
      "Someone may be deceptive",
      "A Faction makes its move",
      "Discover something of value",
      "Best-case scenario occurs",
    ],
  },
};

// --- Random prompt columns -------------------------------------------------
// A prompt is either an ABCD event {event:"A"} or a plot-node invocation {node:"world"}.
const P = {
  A: { label: "Endure a difficult complication", event: "A" },
  B: { label: "Play a triggering plot catalyst", event: "B" },
  C: { label: "Deal with a difficult challenge", event: "C" },
  D: { label: "Put characters in a situation", event: "D" },
  character: { label: "Meet or recall a notable character", node: "characters" },
  location: { label: "Lead to an interesting location", node: "locations" },
  world: { label: "Reflect a world or game element", node: "world" },
  problem: { label: "Handle a plot potential problem", node: "problems" },
  finding: { label: "Locate or trace a useful finding", node: "findings" },
  question: { label: "Find answers to a pending question", node: "questions" },
};

// Standard column, used by most sheets (p.14).
const PROMPTS_STANDARD = [
  P.A, P.B, P.C, P.D, P.character, P.location, P.world, P.problem, P.finding, P.question,
];

// Story-focus: nodes only, no random events (p.16).
const PROMPTS_STORY_FOCUS = [
  P.character, P.character, P.location, P.location, P.world, P.world,
  P.problem, P.problem, P.finding, P.question,
];

// Improvised: random events only, no nodes (p.21).
const PROMPTS_IMPROVISED = [P.A, P.A, P.B, P.B, P.B, P.C, P.C, P.D, P.D, P.D];

// What each node-invoking prompt means in play (p.6).
export const PROMPT_NOTES = {
  world: "A world event, setting feature, or system rule you have been looking forward to using.",
  problems: "Face a story challenge, meet an opponent, or confront a key conflict — read it against the plot state you are in.",
  findings: "The PCs stumble on something they need. If it cannot be found here, leave a clue or a mention of it.",
  questions: "Play a scene that answers the question, wholly or in part.",
  characters: "New or familiar — met, mentioned, or referenced. It need not mean they are physically present.",
  locations: "Discovered or learned about, within the reach of the story. A mention counts.",
  custom1: "Your own list. Read the entry the way the four printed categories are read — as something the story now reaches for.",
  custom2: "Your own list. Read the entry the way the four printed categories are read — as something the story now reaches for.",
};

// --- Plot node categories (p.28) ------------------------------------------
export const NODE_CATEGORIES = [
  {
    id: "world", name: "Game or world elements", expanded: false,
    definition: "World events and features, world truths, rule-system specific events, premade adventure elements.",
    examples: "stormy weather · power shortages · demon portals opening · virtual reality",
  },
  {
    id: "problems", name: "Potential problems", expanded: false,
    definition: "Plot related encounters, people to encounter (good or bad), traps, dangers, discoveries, wonders.",
    examples: "The FBI shows up · Kathrine's sister · filthy pirates · talkative spirit · nightmares",
  },
  {
    id: "findings", name: "Useful findings", expanded: false,
    definition: "Items, artifacts, a MacGuffin, clues, locations, hard to find people, weapons, tools.",
    examples: "place to rest · radio device · medicine · Eva's laptop · my lost memories · an ally",
  },
  {
    id: "questions", name: "Pending questions", expanded: false,
    definition: "Questions for the plot, pending issues, open threads, unresolved leads, mysteries.",
    examples: "does the King have a lover? · do goblins attack? · where is Jim? · am I going crazy?",
  },
  {
    id: "characters", name: "Notable characters", expanded: true,
    definition: "Characters involved in the current plot scope who can get mentioned, show up, or be recalled.",
    examples: "Gard the tavern keeper · Lisa the Mad Daughter · the Captain",
  },
  {
    id: "custom1", name: "My list", expanded: true, custom: true,
    definition: "A plot node list of your own naming. The extension sheet prints two blank ones — whatever this game needs that the four base categories do not cover.",
    examples: "factions · rumours · omens · debts owed · ship systems",
  },
  {
    id: "custom2", name: "My list", expanded: true, custom: true,
    definition: "The second blank list from the extension sheet.",
    examples: "clues · contacts · weather turns · dwindling supplies",
  },
  {
    id: "locations", name: "Interesting locations", expanded: true,
    definition: "Places relevant to the current plot scope, which can get mentioned, referenced, or discovered.",
    examples: "the Triboar Trail · the flooded library · Shoaria's landing zone",
  },
];

// --- Plot sheets (pp.14-23) ------------------------------------------------
// track: sections in play order; `boxes` is the measured count of cross-off boxes.
// printedLists: how many plot node lists the sheet's own page prints, counted from
// the page. Zero means the sheet is meant to be printed alongside a Plot Nodes
// sheet (p.25-27), which is ten slots — so zero implies nodeSlots 10, unless the
// sheet wants no nodes at all. The harness holds the model to these counts.
export const PLOT_SHEETS = [
  {
    id: "standard", name: "Standard", page: 14,
    tagline: "Play a quick game with an all-in-one plot sheet.",
    detail: "A short track for quick stories, with a concise plot node list. The plot beats shape the events and their bias.",
    prompts: PROMPTS_STANDARD, nodeSlots: 5, expandedNodes: false,
    printedLists: 4,
    track: [
      { name: "Exposition", boxes: 3 },
      { name: "Confrontation", boxes: 5 },
      { name: "Resolution", boxes: 3 },
    ],
  },
  {
    id: "journey", name: "Journey", page: 15,
    tagline: "For longer play-throughs.",
    detail: "A longer track structured around a five-act story arc. The plot beats are balanced.",
    prompts: PROMPTS_STANDARD, nodeSlots: 10, expandedNodes: true,
    printedLists: 0,
    track: [
      { name: "Exposition", boxes: 3 },
      { name: "Rising", boxes: 7 },
      { name: "Climax", boxes: 4 },
      { name: "Falling", boxes: 3 },
      { name: "Resolution", boxes: 3 },
    ],
  },
  {
    id: "story-focus", name: "Story-focus", page: 16,
    tagline: "Make your plot nodes very active — they invoke at every random prompt.",
    detail: "Uses plot nodes exclusively instead of random events. Ideal for structured games with well-defined elements and a pre-planned direction.",
    prompts: PROMPTS_STORY_FOCUS, nodeSlots: 5, expandedNodes: true,
    printedLists: 6,
    track: [
      { name: "Exposition", boxes: 3 },
      { name: "Rising", boxes: 7 },
      { name: "Climax", boxes: 4 },
      { name: "Falling", boxes: 3 },
      { name: "Resolution", boxes: 3 },
    ],
  },
  {
    id: "scenes", name: "Scenes", page: 17,
    tagline: "Play a plot beat at every scene.",
    detail: "Links each plot beat to a scene. Play cinematically by invoking a beat each time you make a narrative jump.",
    prompts: PROMPTS_STANDARD, nodeSlots: 5, expandedNodes: false,
    printedLists: 4,
    track: [
      { name: "Intro", boxes: 1 },
      { name: "Scene 1", boxes: 1 }, { name: "Scene 2", boxes: 1 },
      { name: "Scene 3", boxes: 1 }, { name: "Scene 4", boxes: 1 },
      { name: "Scene 5", boxes: 1 }, { name: "Scene 6", boxes: 1 },
      { name: "Scene 7", boxes: 1 }, { name: "Scene 8", boxes: 1 },
      { name: "Wrap-up", boxes: 1 },
    ],
  },
  {
    id: "dungeon", name: "Dungeon", page: 18,
    tagline: "A plot beat at every room you open.",
    detail: "Built for dungeon and facility engagements. Leans towards action and problems.",
    prompts: PROMPTS_STANDARD, nodeSlots: 5, expandedNodes: false,
    printedLists: 4,
    track: [
      { name: "Entrance", boxes: 1 },
      { name: "Room 1", boxes: 1 }, { name: "Room 2", boxes: 1 },
      { name: "Room 3", boxes: 1 }, { name: "Room 4", boxes: 1 },
      { name: "Room 5", boxes: 1 },
      { name: "Way out", boxes: 1 },
    ],
  },
  {
    id: "exploration", name: "Exploration", page: 19,
    tagline: "Each area plays a few prompts. Print along a Plot Nodes sheet.",
    detail: "For seeds that involve discovering or traversing an unknown location, playing triple beats per area.",
    // p.19 prints no node lists of its own — like Journey and Sandbox it pairs
    // with a Plot Nodes sheet, which is ten slots and carries the extension
    // lists its own prompt column reaches for at 5 and 6.
    prompts: PROMPTS_STANDARD, nodeSlots: 10, expandedNodes: true,
    printedLists: 0,
    track: [
      { name: "Arrival", boxes: 1 },
      { name: "1st Area", boxes: 3 },
      { name: "2nd Area", boxes: 3 },
      { name: "3rd Area", boxes: 3 },
      { name: "Conclusion", boxes: 1 },
    ],
  },
  {
    id: "story-parts", name: "Story-parts", page: 20,
    tagline: "Sparse beats across larger chunks of storytelling.",
    detail: "Space out and stay in control of your narrative with single beats that upbeat each part.",
    prompts: PROMPTS_STANDARD, nodeSlots: 5, expandedNodes: false,
    printedLists: 4,
    track: [
      { name: "Intro", boxes: 1 },
      { name: "Part 1", boxes: 1 }, { name: "Part 2", boxes: 1 }, { name: "Part 3", boxes: 1 },
      { name: "Wrap-up", boxes: 1 },
    ],
  },
  {
    id: "improvised", name: "Improvised", page: 21,
    tagline: "No plot nodes, no plot track. For playing to find out.",
    detail: "Designed for on-the-fly play with minimal prep. Relies entirely on random events.",
    prompts: PROMPTS_IMPROVISED, nodeSlots: 0, expandedNodes: false,
    printedLists: 0,
    track: [],
  },
  {
    id: "sandbox", name: "Sandbox", page: 22,
    tagline: "Roam the world without a track — still compatible with plot nodes.",
    detail: "Play open-endedly whenever you wish to do different things and engage the story freely.",
    prompts: PROMPTS_STANDARD, nodeSlots: 10, expandedNodes: true,
    printedLists: 0,
    track: [],
  },
  {
    id: "customized", name: "Customized", page: 23,
    tagline: "Build the track — and the prompt column — yourself.",
    detail: "Fill the track as you play to find out, or pre-design it to match an expected structure. Useful for pre-written adventures.",
    prompts: PROMPTS_STANDARD, nodeSlots: 10, expandedNodes: true,
    printedLists: 0,
    customizable: true,
    track: [],
  },
];

// --- What each track section is for ---------------------------------------
// The app's own words, not the books': PUM prints these names on the sheets and
// leaves dramatic structure to the reader. Keyed by the section names the ten
// printed sheets actually use, so a player learns the shape of the track from
// the track instead of from a chapter.
export const TRACK_SECTION_NOTES = {
  Exposition: "Setting up. Introduce the world, the people and the problem — nothing has gone badly wrong yet.",
  Confrontation: "The middle. The problem pushes back and the PCs commit to dealing with it.",
  Rising: "Pressure builds. Complications accumulate faster than they are resolved.",
  Climax: "The hardest part of the story. What was building arrives.",
  Falling: "The dust settles. Consequences land and loose threads show themselves.",
  Resolution: "Bringing it to an end. Answers, costs, and what the PCs are left holding.",
  Intro: "The opening. Establish where and who before anything is asked of them.",
  "Wrap-up": "The last beat. Close it out.",
  Entrance: "The way in, and the first sign of what is inside.",
  "Way out": "Getting clear — rarely the way you came.",
  Arrival: "First contact with the place. What it looks like before you know it.",
  Conclusion: "What the exploration was for.",
};

// --- Disruption die, optional variant (p.9) --------------------------------
export const DISRUPTION = {
  page: 9,
  promptFace: 1,          // always, and only, a 1
  proposalFaceMin: 2,
  proposalFaceMaxDefault: 2,
  proposalFaceMaxVolatile: 5,
  blurb: "Roll a distinctly coloured d10 alongside any oracle roll (not quantifiers, Focus or Description). On a 1, a random prompt interrupts. On a 2, a modified proposal alters the scene. Read your answer first, then resolve the disruption.",
};

// --- Errata: the book's examples disagree with its own sheets (rulings A2, A3)
export const PUM_ERRATA = [
  {
    id: "A2", page: 11,
    text: "The worked example reads \"Random prompt → 6 → Meet or recall a notable character\". On every printed plot sheet, 6 is \"Lead to an interesting location\" and 5 is \"Meet or recall a notable character\".",
    ruling: "The plot sheet is the play surface and wins. The app rolls the sheet's ordering.",
  },
  {
    id: "A3", page: 9,
    text: "The advanced-mechanics chapter refers to \"(5) Trigger a game or world element\". On the sheets, world elements sit at 7.",
    ruling: "Same as A2. Both readings are consistent with an earlier layout of the column.",
  },
];
