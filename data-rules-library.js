// One entry per automated rule, in the app's own words, with the page cited.
// Every automated surface links here by id (template §6.6 layer 2).

export const RULES_LIBRARY = [
  {
    group: "Playing the game",
    entries: [
      {
        id: "three-states", title: "The three play states", page: "PUM p.4",
        body: "At any moment you are doing one of three things: roleplaying freely, asking an oracle, or invoking a plot beat. The app gives each its own surface — the journal, the Oracles tab, and the beat controls on your plot sheet — and none of them takes a turn from you.",
      },
      {
        id: "no-resolution", title: "PUM resolves nothing", page: "PUM p.2",
        body: "PUM is system-agnostic and expects you to bring a rulebook for task resolution. The app never reports success or failure — it reports what the world offers. If you want a hit-or-miss answer, roll it in your own game and use a Yes/No oracle for the fiction around it.",
        automated: false,
      },
      {
        id: "oracle-restraint", title: "One or two questions per matter", page: "PUM p.10",
        body: "Asking too many oracle questions slows the pace, breaks immersion and produces conflicting answers. The app never limits you — this is advice, not a rule — but the journal shows how many questions a scene has cost you.",
        automated: false,
      },
    ],
  },
  {
    group: "Oracles",
    entries: [
      {
        id: "yes-no", title: "Yes or No — 1d10", page: "PUM p.12",
        body: "Three registers of the same question. Deterministic is the universe answering objectively. Subjective is a character's own point of view, and may answer \"don't know\". Conversation is a non-protagonist replying to you in dialogue.",
      },
      {
        id: "pum-bias", title: "PUM bias — roll twice, you pick", page: "PUM p.12",
        body: "If you have a bias, roll once more and choose the answer that fits best. This is your call, not the machine's: the app shows you both answers and commits neither until you tap one. Note this is a different rule from SUM's Rule of Bias.",
      },
      {
        id: "enrichment", title: "Enrichment — 1d10 plus 1d100", page: "PUM pp.12-13",
        body: "Descriptive oracles (who, where, what for, hazard, mood, notice) are enriched with a Description word; story oracles (find, risk, wants, doing, why, how) with a Focus word. Roll both and read them together — the pair is the answer, not the first line alone.",
      },
      {
        id: "granular", title: "Granular Yes or No — 1d100 at a likelihood", page: "PUM p.24",
        body: "The finer-grained variant. Declare how likely the answer is — no way, hardly, unlikely, neutral, likely, surely, certain — and roll d100 against that column. The bands tile the whole range, so every roll lands on exactly one answer.",
      },
      {
        id: "quantifiers", title: "Quantifiers — set a baseline first", page: "PUM p.13",
        body: "How many, how good, how hard. Every system measures differently, so the table answers relative to a baseline you set before rolling. Four faces out of ten are \"as expected\" — most of the time the world is unremarkable.",
      },
      {
        id: "reroll", title: "Re-roll, ignore, or reinterpret", page: "PUM p.8",
        body: "Oracle answers are not to be taken to heart. If you dislike one, re-roll it, ignore it, or read it however sparks your imagination — even against what it says. The app puts a Re-roll on every result card and journals both rolls so the record stays honest.",
      },
    ],
  },
  {
    group: "Plot beats",
    entries: [
      {
        id: "beat-kinds", title: "Two kinds of beat", page: "PUM p.4",
        body: "A modified proposal when you have an idea of what happens next and want it twisted. A random prompt when you don't. Both are 1d10 on your plot sheet's own column; the sheet decides what the column contains.",
      },
      {
        id: "beat-triggers", title: "When to call a beat", page: "PUM p.28",
        body: "Six triggers each. Proposals: you have an idea; PUM said NO to \"does it go as expected\"; the PCs return somewhere known; a roll went south; long or risky work; a new conversation. Prompts: you don't know; PUM said YES to \"does anything happen\"; a new location; the unknown; time passing; you want more in the scene.",
      },
      {
        id: "abcd", title: "The ABCD random events", page: "PUM p.6",
        body: "Four sub-tables the prompt column can reach: A Complication sets back the PCs' intentions; B Catalyst pauses to explore the world; C Challenge defies them and deserves a reward; D Situation is the world, factions and non-protagonists acting on their own.",
      },
      {
        id: "node-invoke", title: "Prompts that invoke plot nodes", page: "PUM p.6",
        body: "A node-invoking prompt rolls a second die on that node list. An already-written entry comes into play. An empty slot means: add something new and unexpected, choose an entry that fits perfectly, or re-roll — the app offers all three.",
      },
      {
        id: "node-die", title: "Which die a node list uses", page: "PUM p.25",
        body: "Roll 1d10 in lists with less than half the entries filled; otherwise roll 1d20. Five-slot lists always use 1d10. Ten-slot lists switch to 1d20 once more than five slots are filled. The app shows which die it is about to roll above each list.",
      },
      {
        id: "still-stuck", title: "Still stuck? Leave it to destiny", page: "PUM p.6",
        body: "If you are unsure, still stuck, or simply prefer to leave it to chance on an empty slot, re-roll until an entry comes up. The app's \"Leave it to destiny\" button does exactly that and can never hand you an empty slot back.",
      },
      {
        id: "reroll-repeat", title: "Re-roll a repeated beat", page: "PUM p.9",
        body: "You may re-roll whenever a beat repeats the last one, to promote variety. The app flags the repeat and offers the re-roll; it never forces it, because a repeat can be exactly right.",
      },
      {
        id: "disruption", title: "The disruption die", page: "PUM p.9",
        body: "An optional variant. Roll a distinctly coloured d10 with any oracle roll except quantifiers, Description and Focus. On a 1, a random prompt interrupts. On a 2, a modified proposal alters the scene. Read your answer first, then resolve the disruption. In a volatile situation you may widen the proposal range up to 5 — but 1 is always the only face for a random prompt.",
      },
    ],
  },
  {
    group: "The plot track",
    entries: [
      {
        id: "track", title: "What the track is for", page: "PUM p.7",
        body: "Left-to-right boxes that show where you stand in the story. It is a compass against endless wandering, not a clock: at some point the PCs should find answers, make discoveries and reach their goals.",
      },
      {
        id: "confirm", title: "Confirming a beat", page: "PUM p.7",
        body: "Calling a beat authorises you to cross a box — it does not oblige you. Play the beat's answer out first, then cross the next empty box only if the outcome proved relevant and significant. The app keeps a beat open until you decide.",
      },
      {
        id: "voluntary", title: "Advancing without a beat", page: "PUM p.9",
        body: "If an event is exceptionally impactful you may advance the track at will, and equally you may decline to advance after a beat that fell flat. Both are yours to choose; the journal records which happened.",
      },
      {
        id: "timed", title: "Timed plot beats", page: "PUM p.9",
        body: "Mark a future box with an event you know is coming — a horde, a siege, an awakening. When play reaches that box, the event unfolds and counts as a random prompt. You still don't know the circumstances, so it can still surprise you.",
      },
      {
        id: "sheets", title: "Choosing a plot sheet", page: "PUM p.7",
        body: "Each sheet is a pacing decision: how long the track is, how it is sectioned, and how often you invoke beats. More boxes means more randomness and more of the universe pushing back. Sandbox and Improvised have no track at all; Customized lets you draw one as you play.",
      },
      {
        id: "custom-column", title: "A plot focus of your own", page: "PUM p.9",
        body: "On the Customized sheet you may fill the Random Prompt column with your own list of ten: more character entries for a social game, more challenges for an action one. The app rolls whatever you put there.",
      },
    ],
  },
  {
    group: "Plot nodes",
    entries: [
      {
        id: "nodes", title: "What plot nodes are", page: "PUM p.3",
        body: "The game-specific content your prompts reach into — world elements, potential problems, useful findings and pending questions, plus notable characters and interesting locations on expanded sheets. Defined at the start and kept alive as you play.",
      },
      {
        id: "invent-node", title: "Inventing a node mid-play", page: "PUM p.6",
        body: "When an empty slot comes up, consider introducing something new or unexpected at this point and write it into the next empty field. From then on it is a permanent entry that later rolls can hit.",
      },
      {
        id: "deliberate-node", title: "Invoking a node deliberately", page: "PUM p.9",
        body: "You may reference a node because it makes sense, without rolling for it, and still count it as a beat for track purposes. The app's Invoke button on any node row does this and journals it as a chosen invocation, not a rolled one.",
      },
    ],
  },
  {
    group: "Scenes (SUM)",
    entries: [
      {
        id: "sum-bias", title: "SUM's Rule of Bias", page: "SUM p.3",
        body: "Every SUM table is ordered so that lower rolls favour the protagonists and higher rolls bring conflict, resistance or trouble. Neutral? Roll once. Expecting something favourable? Roll twice and keep the lowest. Expecting trouble? Keep the highest. Unlike PUM's bias, this one is mechanical — the app keeps the die for you and shows you both.",
      },
      {
        id: "scene-arc", title: "The scene arc", page: "SUM p.4",
        body: "Open with a Scene opener when you don't know where to start. Fire an Intervention check mid-scene when the PCs are taking too long, tension is high, danger is near, or silence lingers. Close with a Scene closure to see how the world responds. All three are yours to fire; none happens automatically.",
      },
      {
        id: "sum-scope", title: "What SUM is and isn't", page: "SUM p.3",
        body: "SUM is a supplement, not a standalone game. PUM says a beat happens; SUM tells you what the scene contains, how the fight is shaped, what is discovered, and how the people behave. It assumes you already know how to run a solo game.",
        automated: false,
      },
      {
        id: "sum-characters", title: "Character emulation in four depths", page: "SUM pp.8-11",
        body: "First contact — how they react, how they look, what they were talking about. Shallow interaction — personality, a recent anecdote, their profession. Trust conversation — their opinion, their honesty, what they bring to the plot. Deep relationship — their parallel goals, their backstory, what bonds them to someone. Roll only the depth the scene has actually reached.",
      },
    ],
  },
  {
    group: "Game seeding (GUM)",
    entries: [
      {
        id: "gum-what", title: "What GUM is for", page: "GUM p.3",
        body: "The third machine, and a prep tool rather than a play tool. PUM manages the plot and SUM brings the scene to life; GUM lays the groundwork both of them assume you already have — where this happens, what is wrong there, who wants what, and who stands in the way.",
      },
      {
        id: "gum-combine", title: "Combination is the method", page: "GUM p.3",
        body: "GUM's strength is combining tables: roll several for one subject, or the same table twice, and read the results together. Its tables are abstract on purpose — the interpretation is yours, and that is what makes each use different.",
      },
      {
        id: "gum-nodes", title: "GUM fills a plot sheet", page: "GUM p.3",
        body: "PUM's plot nodes are exactly what GUM generates. Every empty node slot in this app offers a Roll from GUM button pointed at the tables that suit that category, and whatever you keep is written into the slot as a permanent entry.",
      },
      {
        id: "gum-seed", title: "The plot seed", page: "GUM pp.6-7",
        body: "Six tables in the book's own order — a hook, a motivation, a mission, the initial lead, a caveat, and the opposition. Rolled as a set they describe one situation. Keep the parts that spark something and re-roll or ignore the rest.",
      },
      {
        id: "gum-grand", title: "The grand oracle", page: "GUM pp.22-24",
        body: "An action, an adjective and a subject, each d100, for the moment when no specific oracle fits. Three words and your reading of them. It answers nothing on its own — that is the point.",
      },
    ],
  },
  {
    group: "About this app",
    entries: [
      {
        id: "dice", title: "How the dice are rolled", page: "app",
        body: "Every die uses the browser's cryptographic random source, never Math.random. Each roll shows its individual faces, and on a bias roll both dice with the kept one marked. Rolls are stored once and rendered from the stored value, so nothing is ever silently re-rolled.",
      },
      {
        id: "safety", title: "Safety tools", page: "not in either book",
        body: "Neither PUM nor SUM ships safety tools — no lines and veils, no X-card, no debrief. The app does not invent one and present it as the books'. If your table wants them, bring them from elsewhere; solo play still benefits from knowing what you would rather not write about tonight.",
        automated: false,
      },
      {
        id: "errata", title: "Where the books disagree with themselves", page: "PUM pp.9, 11",
        body: "Two worked examples cite prompt numbers that do not match the printed plot sheets. The sheets are the play surface and win. The app rolls the sheet's ordering and records the discrepancy rather than quietly correcting it.",
      },
    ],
  },
];
