// Game prep — PUM p.3's four steps, plus the starting point the book names as
// the thing to decide before play (template §6.3.7).

import { el, add, uid, fmtRange } from "./core.js";
import { explain, actionBar, toast, modal } from "./ui.js";
import * as store from "./store.js";
import { plotSheet, trackTotal } from "./rules.js";
import { go, render } from "./router.js";
import { PLOT_SHEETS, NODE_CATEGORIES } from "../data-pum-plot.js";
import { registerClearer } from "./viewstate.js";
import { gumSuggest, gumTablesForNode } from "./forge.js";
import { Settings } from "./settings.js";
import { GUM_PLOT_SEED } from "../data-gum.js";

let step = 0;
let draft = null;
let onDone = null;

const STEPS = [
  { n: 1, name: "Universe", legend: "Pick a universe and gather inspiration" },
  { n: 2, name: "Scope", legend: "Draft a plot scope and mission" },
  { n: 3, name: "Protagonists", legend: "Create your main protagonists" },
  { n: 4, name: "Sheet", legend: "Pick a plot sheet" },
  { n: 5, name: "Nodes", legend: "Write your plot nodes" },
];

export function startWizard(after = null) {
  step = 0;
  onDone = after;
  draft = {
    title: "", universe: "", tone: "", inspiration: "",
    scopeName: "", mission: "", startingPoint: "",
    protagonists: [],
    sheetId: "standard",
    nodes: {},
  };
  for (const c of NODE_CATEGORIES) draft.nodes[c.id] = [];
  go("more", "home");
}

export function inWizard() { return draft !== null; }

function cancelWizard() { draft = null; step = 0; render(); }

// Switching game mid-prep discards the draft rather than carrying it across.
registerClearer(() => { draft = null; step = 0; onDone = null; });

export function renderWizard(host) {
  const s = STEPS[step];
  add(host, el("h1", { text: "Prepare a game" }));
  add(host, el("p", { class: "lede", text: `Step ${s.n} of ${STEPS.length} — ${s.legend}` }));
  add(host, explain([
    "PUM asks for a little preparation so your mind is in the right creative context before you start.",
    "Nothing here is locked. Everything can be edited later, and plot nodes are meant to grow as you play.",
  ]));

  const nav = el("div", { class: "section-nav" });
  STEPS.forEach((st, i) => {
    const reachable = i <= step || legalUpTo(i);
    add(nav, el("button", {
      "aria-current": i === step ? "true" : "false",
      disabled: reachable ? null : true,
      title: reachable ? null : "Finish the earlier steps first",
      onclick: () => { if (reachable) { step = i; render(); } },
    }, `${st.n} ${st.name}`));
  });
  add(host, nav);

  if (step === 0) stepUniverse(host);
  if (step === 1) stepScope(host);
  if (step === 2) stepProtagonists(host);
  if (step === 3) stepSheet(host);
  if (step === 4) stepNodes(host);

  const legal = legalNow();
  actionBar({
    label: step === STEPS.length - 1 ? "Start playing" : "Next",
    context: legal.ok ? `step ${s.n}/${STEPS.length}` : legal.why,
    disabled: !legal.ok,
    secondary: step > 0
      ? { label: "Back", onClick: () => { step -= 1; render(); } }
      : { label: "Cancel", onClick: () => cancelWizard() },
    onClick: () => {
      if (step < STEPS.length - 1) { step += 1; render(); return; }
      finish();
    },
  });
}

// Legality per step (template §9.2 Phase 1).
function legalNow() {
  if (step === 0 && !draft.title.trim()) return { ok: false, why: "Name the game to continue" };
  if (step === 1 && !draft.scopeName.trim()) return { ok: false, why: "Name the plot scope to continue" };
  if (step === 2 && !draft.protagonists.length) return { ok: false, why: "Add at least one protagonist" };
  return { ok: true, why: "" };
}

function legalUpTo(i) {
  if (i >= 1 && !draft.title.trim()) return false;
  if (i >= 2 && !draft.scopeName.trim()) return false;
  if (i >= 3 && !draft.protagonists.length) return false;
  return true;
}

function field(label, key, { multiline = false, placeholder = "", hint = "" } = {}) {
  const input = multiline ? el("textarea", { placeholder }) : el("input", { type: "text", placeholder });
  input.value = draft[key] || "";
  input.addEventListener("input", () => {
    draft[key] = input.value;
    // Re-evaluate the pinned action's legality without a full re-render.
    const legal = legalNow();
    const btn = document.querySelector("#action-bar .btn.primary");
    const ctx = document.querySelector("#action-bar .ab-ctx");
    if (btn) btn.disabled = !legal.ok;
    if (ctx) ctx.textContent = legal.ok ? `step ${STEPS[step].n}/${STEPS.length}` : legal.why;
  });
  return el("label", { class: "field" },
    el("span", { class: "lbl", text: label }),
    input,
    hint ? el("div", { class: "hint", text: hint }) : null
  );
}

function stepUniverse(host) {
  const card = el("div", { class: "card" });
  add(card, el("p", { class: "muted", text: "Narrow things down. Which RPG or universe do you want to roleplay in? If it brings no setting, define the world, tone and theme yourself. Mystery or horror? Social or action?" }));
  add(card, field("Name this game", "title", { placeholder: "The Neverwinter road" }));
  add(card, field("Universe or RPG", "universe", { placeholder: "D&D 5e · Blade Runner · my own" }));
  add(card, field("World, tone and theme", "tone", { placeholder: "Grim frontier fantasy, low magic" }));
  add(card, field("Inspiration", "inspiration", {
    multiline: true,
    placeholder: "Artbooks, video games, lore, films, tarot…",
    hint: "The book suggests drawing on anything to hand. Premade adventures work too — read only the minimum to get started.",
  }));
  add(host, card);
}

function stepScope(host) {
  const card = el("div", { class: "card" });
  add(card, el("p", { class: "muted", text: "A plot scope is one defined mission, task or goal. What kind of story do you want to unfold — defeating a powerful enemy, uncovering a mystery, solving an inner problem?" }));
  add(card, field("Plot scope name", "scopeName", { placeholder: "Find out who burned the caravan" }));
  add(card, field("Mission and initial goals", "mission", {
    multiline: true,
    placeholder: "A pitch for the situation you start in, and what the PCs are trying to do.",
    hint: "Draft a pitch for the starting situation: a civil war, a natural disaster, a background problem that seeds an interesting start.",
  }));
  add(card, field("Starting point", "startingPoint", {
    multiline: true,
    placeholder: "Where does this open, and what is introduced there?",
    hint: "Optional now, and the home screen will keep asking until it's written. Consider starting in medias res.",
  }));
  if (Settings.gum()) {
    add(card, el("button", {
      class: "btn wide",
      onclick: () => gumSuggest({
        title: "A plot seed",
        tableIds: GUM_PLOT_SEED,
        onPick: (text) => {
          draft.mission = draft.mission ? draft.mission + "\n" + text : text;
          render();
        },
      }),
    }, "Seed this from GUM"));
    add(card, el("p", { class: "cite", text: "GUM rolls a hook, a motivation, a mission, a lead, a caveat and the opposition. Keep what you like." }));
  }
  add(host, card);
}

function stepProtagonists(host) {
  const card = el("div", { class: "card" });
  add(card, el("p", { class: "muted", text: "Your PCs are your eyes and ears in the universe. You are in full control of their thoughts, voice and actions — PUM never rolls for them." }));
  for (const p of draft.protagonists) {
    add(card, el("div", { class: "entry" },
      el("div", { class: "entry-head" },
        el("span", { class: "entry-title", text: p.name }),
        el("button", {
          class: "btn small ghost", style: "margin-left:auto",
          onclick: () => {
            draft.protagonists = draft.protagonists.filter((x) => x.id !== p.id);
            render();
          },
        }, "Remove")
      ),
      p.notes ? el("div", { class: "entry-detail", text: p.notes }) : null
    ));
  }
  const name = el("input", { type: "text", placeholder: "Name" });
  const notes = el("input", { type: "text", placeholder: "A line about them (optional)" });
  const addOne = () => {
    const v = name.value.trim();
    if (!v) return;
    draft.protagonists.push({ id: uid("pc"), name: v, notes: notes.value.trim() });
    name.value = ""; notes.value = "";
    render();
  };
  name.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addOne(); } });
  add(card, el("label", { class: "field" }, el("span", { class: "lbl", text: "Name" }), name));
  add(card, el("label", { class: "field" }, el("span", { class: "lbl", text: "Notes" }), notes));
  add(card, el("button", { class: "btn wide", onclick: addOne }, "Add protagonist"));
  add(host, card);
}

function stepSheet(host) {
  add(host, el("p", { class: "muted", text: "The sheet sets your pacing: how long the track is, how it is sectioned, and how often you invoke beats. More boxes means more randomness before this thread resolves." }));
  for (const sheet of PLOT_SHEETS) {
    const chosen = draft.sheetId === sheet.id;
    const card = el("div", { class: "card", style: chosen ? "border-color:var(--accent)" : null });
    add(card, el("div", { class: "card-head" },
      el("h3", { text: sheet.name }),
      el("span", { class: "pill" + (chosen ? " on" : ""), text: sheet.track.length ? `${trackTotal(sheet.track)} boxes` : "no track" }),
      el("span", { class: "cite", text: `p.${sheet.page}` })
    ));
    add(card, el("p", { class: "muted", text: sheet.tagline }));
    add(card, trackPreview(sheet));
    add(card, el("p", { class: "muted", text: sheet.detail }));
    add(card, el("p", { class: "cite", text: sheet.nodeSlots
      ? `${sheet.nodeSlots} node slots per list${sheet.expandedNodes ? " · characters and locations too" : ""}`
      : "no plot nodes" }));
    add(card, el("button", {
      class: `btn wide ${chosen ? "primary" : ""}`.trim(),
      onclick: () => { draft.sheetId = sheet.id; render(); },
    }, chosen ? "Chosen" : "Choose this sheet"));
    add(host, card);
  }
}

function trackPreview(sheet) {
  if (!sheet.track.length) return el("p", { class: "cite", text: "— no plot track —" });
  const track = el("div", { class: "track" });
  for (const sec of sheet.track) {
    const secEl = el("div", { class: "track-sec" },
      el("div", { class: "track-sec-name", text: `${sec.name} (${sec.boxes})` })
    );
    const boxes = el("div", { class: "track-boxes" });
    for (let i = 0; i < sec.boxes; i++) add(boxes, el("div", { class: "track-box", style: "height:18px;min-width:16px" }));
    add(secEl, boxes);
    add(track, secEl);
  }
  return track;
}

function stepNodes(host) {
  const sheet = plotSheet(draft.sheetId);
  add(host, el("p", { class: "muted", text: "Plot nodes are your game's own content — the things a random prompt reaches into. Write a few now; you can add more at any time, and empty slots are an invitation to invent." }));

  if (!sheet.nodeSlots) {
    add(host, el("div", { class: "card" },
      el("h3", { text: `${sheet.name} uses no plot nodes` }),
      el("p", { class: "muted", text: "This sheet plays lightweight: its prompt column reaches only the random events. Nothing to write here — go and play." })
    ));
    return;
  }

  for (const cat of NODE_CATEGORIES) {
    if (cat.expanded && !sheet.expandedNodes) continue;
    const card = el("div", { class: "card" });
    add(card, el("div", { class: "card-head" },
      el("h3", { text: cat.name }),
      el("span", { class: "cite", text: `${(draft.nodes[cat.id] || []).filter(Boolean).length}/${sheet.nodeSlots}` })
    ));
    add(card, el("p", { class: "muted", text: cat.definition }));
    add(card, el("p", { class: "cite", text: "e.g. " + cat.examples }));
    const list = draft.nodes[cat.id] || (draft.nodes[cat.id] = []);
    for (let i = 0; i < sheet.nodeSlots; i++) {
      const input = el("input", { type: "text", placeholder: "Add new, choose, or reroll" });
      input.value = list[i] || "";
      input.addEventListener("input", () => { list[i] = input.value; });
      const gumTables = gumTablesForNode(cat.id);
      add(card, el("div", { class: "node-row" },
        el("span", { class: "node-idx", text: fmtRange(i * 2 + 1, i * 2 + 2) }),
        input,
        (Settings.gum() && gumTables.length) ? el("button", {
          class: "btn small",
          "aria-label": `Roll ${cat.name} slot ${i + 1} from GUM`,
          onclick: () => gumSuggest({
            title: cat.name, tableIds: gumTables,
            onPick: (v) => { list[i] = v; render(); },
          }),
        }, "GUM") : null
      ));
    }
    add(host, card);
  }
}

function finish() {
  // Take a local copy first: creating the game changes the active context, which
  // fires the clearer registered below and nulls `draft` mid-flight.
  const d = draft;
  draft = null;
  step = 0;

  const game = store.createGame(d);
  const scope = game.scopes[0];
  store.addJournal({
    kind: "prep",
    title: "Game prepared",
    detail: [d.universe, d.tone, plotSheet(d.sheetId).name].filter(Boolean).join(" · "),
    scopeId: scope.id,
  });
  if (d.startingPoint) {
    store.addJournal({ kind: "prep", title: "Starting point", detail: d.startingPoint, scopeId: scope.id });
  }
  toast("Ready. Open a scene when you are.");
  if (onDone) { const f = onDone; onDone = null; f(); }
  else go("play", "track");
}

// Adding a further plot sheet to an existing game — a short version of steps 2, 4, 5.
export function addScopeDialog() {
  const name = el("input", { type: "text", placeholder: "The next thread" });
  const mission = el("textarea", { placeholder: "What is this scope about?" });
  const select = el("select");
  for (const s of PLOT_SHEETS) {
    add(select, el("option", { value: s.id },
      `${s.name} — ${s.track.length ? trackTotal(s.track) + " boxes" : "no track"}`));
  }
  modal({
    title: "New plot sheet",
    body: el("div", null,
      el("p", { class: "muted", text: "A longer game is several plot sheets, each covering one scope. The finished ones stay in the library as a record." }),
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Scope name" }), name),
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Mission" }), mission),
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Plot sheet" }), select)
    ),
    actions: [
      {
        label: "Add it", primary: true,
        onClick: () => {
          const v = name.value.trim();
          if (!v) { toast("Give the scope a name."); return true; }
          store.addScope({ name: v, mission: mission.value, sheetId: select.value });
          store.addJournal({ kind: "prep", title: "New plot sheet", detail: `${v} · ${plotSheet(select.value).name}` });
          go("play", "track");
        },
      },
      { label: "Cancel" },
    ],
  });
}
