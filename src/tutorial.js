// The first-session walkthrough. A screen, not a modal sequence, so a player can
// come back to it mid-session (§6.6 layer 3).

import { el, add } from "./core.js";
import { explain, toast } from "./ui.js";
import { Settings } from "./settings.js";
import { go } from "./router.js";
import { startWizard } from "./wizard.js";

const STEPS = [
  {
    title: "1 · Prepare a game",
    why: "PUM asks for a little prep so your head is in the right creative context. Four steps: a universe, a plot scope, your protagonists, and a plot sheet.",
    do: "Tap Prepare a game on the Home screen. Name the world you want to play in, then say in one line what this thread is about — that is your plot scope.",
    to: { label: "Prepare a game", go: () => startWizard() },
  },
  {
    title: "2 · Choose a plot sheet, and understand what you chose",
    why: "The sheet is a pacing decision, not a theme. Its track length says how many beats stand between you and this thread resolving — more boxes means more of the universe pushing back.",
    do: "Standard (11 boxes) is the book's recommendation for a first game. Scenes and Dungeon give you one beat per scene or per room. Sandbox has no track at all.",
  },
  {
    title: "3 · Write a few plot nodes",
    why: "Plot nodes are your game's own content. When a random prompt says 'handle a potential problem', it rolls on the list you wrote — so a blank list makes the prompts generic.",
    do: "Three or four entries per list is plenty to start. Empty slots are not a failure: they are an invitation to invent something on the spot, and whatever you invent becomes a permanent entry.",
    to: { label: "Plot nodes", go: () => go("play", "nodes") },
  },
  {
    title: "4 · Decide the starting point",
    why: "The book asks you to decide where the game opens and what is introduced there. It suggests in medias res — a battle, a shock — so your characters must act immediately.",
    do: "Write it on the plot sheet. The Home screen keeps asking until you do, because a game that never opens never starts.",
  },
  {
    title: "5 · Open a scene",
    why: "SUM's scene opener exists for the moment you know a scene should happen but not how it begins. It is a d20 that tells you what to describe first.",
    do: "Scene tab → Roll a scene opener. If you already know how it opens, use 'Open it myself' — you never have to roll.",
    to: { label: "Scene arc", go: () => go("scene", "arc") },
  },
  {
    title: "6 · Roleplay, and ask when you don't know",
    why: "Most of your time is state one: playing your characters. The oracles are for the moments you genuinely don't know, or would rather not decide.",
    do: "Oracles tab → Yes or No. Pick the register that matches who is answering: the universe (Deterministic), a character's own view (Subjective), or someone talking to you (Conversation). Keep it to one or two questions per matter.",
    to: { label: "Oracles", go: () => go("oracles", "yesno") },
  },
  {
    title: "7 · Bias: two different rules, and the app keeps them apart",
    why: "PUM's bias hands the choice to you: roll twice, pick the answer that fits. SUM's Rule of Bias is mechanical: roll twice, keep the lowest if you expect good and the highest if you expect trouble.",
    do: "On a PUM Yes/No the app shows both answers and waits for your tap. On a SUM table it keeps the die for you and shows both, marking the one it kept.",
  },
  {
    title: "8 · Call a plot beat",
    why: "This is the machine. A modified proposal twists an idea you already have; a random prompt tells you what happens when you don't have one.",
    do: "Play tab → the pinned button rolls a random prompt; the smaller one rolls a proposal. Then play the answer out for a while before deciding anything.",
    to: { label: "Plot sheet", go: () => go("play", "track") },
  },
  {
    title: "9 · Confirm the beat — or don't",
    why: "Calling a beat authorises you to cross a box; it does not oblige you. Cross one only once the outcome turned out to matter to the bigger picture.",
    do: "Confirm — cross a box, or Not this time. Both are journalled. The track in the header is the honest answer to 'how close is this to over?'",
  },
  {
    title: "10 · Close the scene",
    why: "SUM's closure asks how the world responds — fortunately or unfortunately — and hands you the hook into what comes next.",
    do: "Scene tab → Roll a scene closure. You get a summary of what changed, and a one-step undo if you closed it by mistake.",
    to: { label: "Scene arc", go: () => go("scene", "arc") },
  },
  {
    title: "11 · Read it back",
    why: "Every roll landed in the journal with its dice, so you can re-derive any result later — and the Dice view counts every face, so you can check the app instead of arguing with it.",
    do: "Journal tab. Add your own entries too; that is where the story you are telling actually lives.",
    to: { label: "Journal", go: () => go("journal", "entries") },
  },
  {
    title: "Optional · The disruption die",
    why: "PUM's variant for players who want the machine to interrupt them. A d10 rides along with every oracle answer: on a 1 a random prompt breaks in, on a 2 a proposal alters the scene.",
    do: "Settings → Optional rules. It is off by default because the book presents it as a variant you opt into, not as the default way to play.",
    to: { label: "Settings", go: () => go("more", "settings") },
  },
];

export function renderTutorial(host) {
  add(host, el("h1", { text: "Your first session" }));
  add(host, explain([
    "Eleven steps, in play order, each saying what to tap and why the game asks for it.",
    "It is a screen, not a wizard — come back to any step mid-session.",
  ]));

  if (!Settings.seenTutorial()) {
    add(host, el("button", {
      class: "btn wide",
      onclick: () => { Settings.setSeenTutorial(true); toast("Marked as read."); },
    }, "Mark as read"));
  }

  for (const s of STEPS) {
    const d = el("details", { class: "acc" }, el("summary", null, s.title));
    const body = el("div", { class: "acc-body" });
    add(body, el("p", null, el("strong", { text: "Why: " }), s.why));
    add(body, el("p", null, el("strong", { text: "Do: " }), s.do));
    if (s.to) {
      add(body, el("button", { class: "btn small", onclick: s.to.go }, `${s.to.label} →`));
    }
    add(d, body);
    add(host, d);
  }

  add(host, el("div", { class: "card" },
    el("h3", { text: "One thing PUM will not do for you" }),
    el("p", { class: "muted", text: "It never resolves a task. It will not tell you whether you picked the lock, hit the guard, or convinced the magistrate. Bring your own RPG's rules for that, or simply decide. PUM tells you what the world offers; you are still the one playing." })
  ));
}
