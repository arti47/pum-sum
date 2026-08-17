// The books' procedural framing, extracted as first-class content (template §3.20).
// Paraphrased from PUM pp.2-10 and p.28, and SUM p.3.

// --- The three play states (PUM p.4) ---------------------------------------
export const PLAY_STATES = [
  {
    id: "roleplay", n: 1, name: "Roleplaying & storytelling",
    text: "For as long as you like, play your characters, explore the universe, expand the world, enjoy the telling. You are both the author and the actors. Engage in dialogue, interact with the world, feel it.",
  },
  {
    id: "oracles", n: 2, name: "Asking the oracles",
    text: "In a group game you would ask the gamemaster. Here you ask the oracles. Pick the best-fitting one and ask away — then find the balance between asking too many questions and deciding every answer yourself.",
  },
  {
    id: "beat", n: 3, name: "Invoking a plot beat",
    text: "When something happens that should move the story, call a beat: a modified proposal if you have an idea what happens next, a random prompt if you don't. Play its answer for a while, then decide whether to confirm it.",
  },
];

// --- The playing flowchart (PUM p.5) ---------------------------------------
export const FLOWCHART = [
  { q: "Is the current event relevant for the plot?", no: "Ask the oracles any questions within the story, and continue storytelling.", yes: "Go on to the next question." },
  { q: "Is it a good time to advance the plot track?", no: "Continue storytelling and check again later.", yes: "Go on to the next question." },
  { q: "Do you have a clear idea of what is unfolding?", no: "Roll a random prompt to gather inspiration, then play on.", yes: "Roll a modified proposal, mix it in, and play on." },
  { q: "Was it in the end relevant for the story and plot?", no: "Play on. The track does not move.", yes: "Advance the plot track." },
];

// --- Beat trigger cheat sheet (PUM p.28) -----------------------------------
export const BEAT_TRIGGERS = {
  proposal: {
    name: "Use a modified proposal when...",
    items: [
      "You have some idea about what happens next",
      "You ask if things occur as expected, and PUM says NO",
      "The PCs visit or return to a known location",
      "The PCs failed a roll, or something went south",
      "The PCs work on something risky, complicated, or long",
      "The PCs engage in conversation with someone new",
      "Optional: your disruption d10 rolls a 2",
    ],
  },
  prompt: {
    name: "Use a random prompt when...",
    items: [
      "You don't know what happens next, or are uncertain",
      "You ask if something happens, and PUM says YES",
      "The PCs explore, travel through, or arrive at a new location",
      "The PCs face the unknown, or uncertainty is high",
      "The PCs decide to wait, or let significant time pass",
      "You would like to inject additional content into the scene",
      "Optional: your disruption d10 rolls a 1",
    ],
  },
  rule: "Play a plot beat when something relevant to the plot happens, when you run out of ideas, or when you wish to advance the plot track. A beat may, but need not, be confirmed. Confirming marks a box.",
};

// --- The advice chapter (PUM p.10) ----------------------------------------
export const ADVICE = [
  {
    id: "how-often", q: "How often should I ask an oracle?",
    a: "Limit yourself to one or two questions per matter. Asking too many slows your pace, breaks immersion, and produces conflicting results. Oracles are open and vague on purpose.",
  },
  {
    id: "when", q: "When are oracles the right tool?",
    a: "Two moments: when you genuinely don't know something, and when you would simply rather not decide. Avoid rolling if you already have a strong bias toward an answer, or if some outcome would get you stuck. Oracles guide; they do not dictate.",
  },
  {
    id: "stuck-start", q: "What do I do when I'm stuck at the start?",
    a: "Invoke a plot beat of the Random Prompt kind. If the prompt alone isn't enough, ask an oracle for detail — but keep it to one or two questions. Remember to take breaks too.",
  },
  {
    id: "stuck-interpreting", q: "I'm stuck interpreting an oracle answer.",
    a: "Re-roll for a more fitting answer. If you'd rather not, downplay it or go with whatever came to mind first, whether or not it matches. Tables, artwork, tarot cards and music all help here.",
  },
  {
    id: "beat-per-scene", q: "Should I play a plot beat every scene?",
    a: "When learning the system, matching one beat to one scene is the easiest way in. As you master it, detaching beats from scenes is powerful: a scene might invoke several prompts as you detail it, and other scenes proceed without any.",
  },
  {
    id: "prewritten", q: "How do I play pre-written adventures?",
    a: "Either read a little at a time and play carefully back and forth — use the Improvised sheet so PUM interferes least — or treat the adventure as a seed: read a chapter's synopsis, write what matters into your plot nodes, and play your own story with the Story-focus sheet.",
  },
  {
    id: "friends", q: "Can I play with friends?",
    a: "Yes, even without a GM. Two players make an easy session: one asks the oracle, the other interprets, then swap. Delegate disputes to PUM as referee and stay open to different ideas.",
  },
];

// --- Advanced mechanics (PUM p.9) -----------------------------------------
export const ADVANCED = [
  {
    id: "breakthrough", name: "A well-deserved breakthrough",
    text: "When your characters earn a discovery, succeed at an important roll, or reach a milestone but you're unsure what they learned, voluntarily invoke \"Find answers to a pending question\" — rolled or chosen. The Discovery, Reason and Explain oracles do the same job.",
  },
  {
    id: "went-wrong", name: "Things didn't go as planned",
    text: "When characters fail or make a mistake and you're unsure of the consequence, roll an interrupting plot beat and fold it into the scene. The Problem (risk) oracle helps here too.",
  },
  {
    id: "specific-node", name: "Specific plot node invocations",
    text: "You may reference a plot node deliberately instead of rolling a random prompt, and count it as a beat for track purposes: world elements while travelling, potential problems when it's time for a confrontation, useful findings when the PCs have earned one, pending questions when the story justifies an answer.",
  },
  {
    id: "reroll-repeat", name: "Re-roll repeated plot beats",
    text: "You may re-roll a beat whenever the result is the same as last time. The idea is to promote variety.",
  },
  {
    id: "voluntary", name: "Voluntary plot track advances",
    text: "Sometimes the story's own events justify advancing the track. Combining such moments with a beat's randomness is recommended, but advancing without one is acceptable from time to time.",
  },
  {
    id: "timed", name: "Timed plot beats",
    text: "For events you know are coming — a zombie horde, a siege, a power awakening — mark a track box. When you reach it, the event unfolds. It counts as a random prompt for rule purposes, and since you don't know the circumstances in advance, it may still surprise you.",
  },
  {
    id: "custom", name: "Using the custom plot sheet",
    text: "Plot Focus: fill the Random Prompt column with your own list — more character entries for a social game, more challenges for an action one. Plot Track: pre-define its length and sections, or build it up as you go from what actually happens.",
  },
];

// --- What each machine is for ---------------------------------------------
export const MACHINES = [
  {
    id: "pum", name: "PUM — Plot Unfolding Machine", version: "v9.0",
    text: "The core system. It manages the plot and the game's progress through modified proposals, random prompts and plot-oriented beats. It brings no setting and no task resolution: pick up any RPG from your shelf for that, or narrate it yourself.",
  },
  {
    id: "sum", name: "SUM — Scene Unfolding Machine", version: "v8.0 Rev2",
    text: "A supplement, not a standalone game. Once PUM has told you a beat happens, SUM tells you what the scene offers, how the battle unfolds, who the enemy is, and how the people in it behave, speak and remember.",
  },
  {
    id: "gum", name: "GUM — Game Unfolding Machine", version: "v2.2",
    text: "The third machine: game creation, world-building and prep. It lays the groundwork the other two play on — plot seeds, factions, locations, objects, a nemesis, creatures and characters. Use GUM when setting a game up, and SUM while playing it: GUM creates a character as a concept, SUM decides how they behave when you meet them.",
  },
];

// The app must not pretend to resolve tasks.
export const NO_TASK_RESOLUTION =
  "PUM resolves nothing. It never says whether an action succeeded — it says what the world offers. Bring your own RPG's rules for task resolution, or narrate the outcome yourself.";
