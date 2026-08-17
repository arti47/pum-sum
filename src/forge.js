// The Forge tab — GUM. Prep-time generation: the blanks PUM's plot sheets and
// SUM's scenes expect you to have already filled in.
//
// GUM's own method is combination: "the key strength of GUM is its ability to
// combine multiple tables for a single subject, or roll multiple times within one
// table" (GUM p.3). So the unit of this screen is a *set* of rolls read together,
// not a single answer.

import { el, add, announce } from "./core.js";
import { explain, actionBar, resultCard, toast, modal, closeModal, promptModal, emptyState }
  from "./ui.js";
import * as store from "./store.js";
import { rollGum, rollGumSet, journalRoll, diceText } from "./roller.js";
import { gumTable, gumSection } from "./rules.js";
import { nodeSlots, categoryName } from "./derived.js";
import { sectionNav, render, go } from "./router.js";
import { Settings } from "./settings.js";
import { openRule } from "./screens.js";
import { registerClearer } from "./viewstate.js";
import { GUM_TABLES, GUM_PLOT_SEED, GUM_GRAND, GUM_FOR_NODES } from "../data-gum.js";
import { NODE_CATEGORIES } from "../data-pum-plot.js";

// The last result, held so a re-render never re-rolls it (§5.1).
let last = null;

function resetForge() { last = null; }
registerClearer(resetForge);

export function renderForge(host, section) {
  if (!Settings.gum()) {
    add(host, el("h1", { text: "Forge" }));
    add(host, emptyState(
      "GUM is switched off",
      "The Game Unfolding Machine's tables are hidden. Turn them back on if you own the book.",
      { label: "Open Settings", onClick: () => go("more", "settings") }
    ));
    return;
  }

  add(host, sectionNav("forge", section));

  if (section === "seed") return renderSeed(host);
  if (section === "grand") return renderGrand(host);
  return renderSectionTables(host, section);
}

// --- the plot seed: the book's own combination, in its own order -----------
function renderSeed(host) {
  add(host, el("h1", { text: "Plot seed" }));
  add(host, explain([
    "GUM's own six-table combination, in the book's order: a hook, a motivation, a mission, the first lead, a caveat, and the opposition.",
    "Roll the set, read the six lines as one situation, then keep whichever parts you like — this is a seed, not a verdict.",
  ], "gum-what", openRule));

  if (last) add(host, renderLast());

  const card = el("div", { class: "card" });
  add(card, el("h2", { text: "The six questions" }));
  for (const id of GUM_PLOT_SEED) {
    const t = gumTable(id);
    if (!t) continue;
    add(card, el("div", { class: "node-row" },
      el("span", { class: "node-txt" }, el("strong", { text: t.name }), el("br"),
        el("span", { class: "muted", text: t.blurb })),
      el("button", {
        class: "btn small",
        onclick: () => fireOne(id),
      }, `d${t.die}`)
    ));
  }
  add(host, card);

  add(host, worldTruthsCard());

  actionBar({
    label: "Roll a whole plot seed",
    context: "six tables, read together",
    secondary: { label: "World truths", onClick: () => fireSet(["location-archetype", "background-problem"], "World truths") },
    onClick: () => fireSet(GUM_PLOT_SEED, "Plot seed"),
  });
}

function worldTruthsCard() {
  const card = el("div", { class: "card" });
  add(card, el("h2", { text: "World truths" }));
  add(card, el("p", { class: "muted", text: "Two tables that set the ground everything else stands on: where this happens, and what is already wrong there." }));
  const row = el("div", { class: "btn-row" });
  for (const id of ["location-archetype", "background-problem"]) {
    const t = gumTable(id);
    add(row, el("button", { class: "btn", onclick: () => fireOne(id) }, t.name));
  }
  add(card, row);
  return card;
}

// --- the grand oracle: three words -----------------------------------------
function renderGrand(host) {
  add(host, el("h1", { text: "Grand oracle" }));
  add(host, explain([
    "Three d100 tables — an action, an adjective and a subject — for the moment no specific oracle fits.",
    "Read the three words together and let them mean something. That interpretation is the answer; the words are only the prompt.",
  ], "gum-what", openRule));

  if (last) add(host, renderLast());

  const card = el("div", { class: "card" });
  add(card, el("p", { class: "muted", text: "Roll all three, or just the one you are missing." }));
  const row = el("div", { class: "btn-row" });
  for (const id of GUM_GRAND) {
    const t = gumTable(id);
    add(row, el("button", { class: "btn", onclick: () => fireOne(id) }, t.name));
  }
  add(card, row);
  add(host, card);

  actionBar({
    label: "Roll all three",
    context: "action · adjective · subject",
    onClick: () => fireSet(GUM_GRAND, "Grand oracle"),
  });
}

// --- a section of generators ------------------------------------------------
function renderSectionTables(host, sectionId) {
  const sec = gumSection(sectionId);
  const tables = GUM_TABLES.filter((t) => t.section === sectionId);
  add(host, el("h1", { text: sec ? sec.name : "Forge" }));
  add(host, explain([
    sec ? sec.blurb : "",
    "GUM's strength is combination: roll several tables for one subject, or the same table twice, and read the results together.",
    "Nothing here is binding. Interpret freely to fit your world, tone and theme.",
  ], "gum-what", openRule));

  if (last) add(host, renderLast());

  // Grouped by the book's own subject headings, so a whole subject rolls at once.
  const groups = [];
  for (const t of tables) {
    const g = groups.find((x) => x.name === t.group);
    if (g) g.tables.push(t);
    else groups.push({ name: t.group, tables: [t] });
  }

  for (const g of groups) {
    const card = el("div", { class: "card" });
    add(card, el("div", { class: "card-head" },
      el("h3", { text: g.name }),
      el("span", { class: "cite", text: `GUM p.${g.tables[0].page}` })
    ));
    for (const t of g.tables) {
      add(card, el("div", { class: "node-row" },
        el("span", { class: "node-txt" },
          el("strong", { text: t.name }), el("br"),
          el("span", { class: "muted", text: t.blurb })),
        el("button", { class: "btn small", onclick: () => fireOne(t.id) }, `d${t.die}`)
      ));
    }
    if (g.tables.length > 1) {
      add(card, el("button", {
        class: "btn wide",
        onclick: () => fireSet(g.tables.map((t) => t.id), g.name),
      }, `Roll all of ${g.name}`));
    }
    add(card, tableDetails(g.tables));
    add(host, card);
  }
}

function tableDetails(tables) {
  const d = el("details", { class: "explain" },
    el("summary", null, `The whole ${tables.length === 1 ? "table" : "set"}`));
  const body = el("div", { class: "body table-scroll" });
  for (const t of tables) {
    add(body, el("h3", { text: `${t.name} — d${t.die}` }));
    const table = el("table", { class: "rows" });
    t.rows.forEach((r, i) => {
      add(table, el("tr", null,
        el("td", { class: "r", text: String(i + 1) }),
        el("td", { text: r })
      ));
    });
    add(body, table);
  }
  add(d, body);
  return d;
}

// --- rolling -----------------------------------------------------------------
function fireOne(tableId) {
  const r = rollGum({ tableId });
  last = { result: r, label: r.table.name };
  journalRoll(r, {
    kind: "gum", title: `${r.table.name} — ${r.answer}`, detail: diceText(r.dice),
  });
  announce(`${r.table.name}: ${r.answer}`);
  render();
}

function fireSet(ids, label) {
  const r = rollGumSet(ids);
  last = { result: r, label };
  journalRoll(r, {
    kind: "gum", title: label,
    detail: r.parts.map((p) => `${p.table.name}: ${p.answer}`).join(" · "),
  });
  announce(`${label}: ${r.parts.length} results`);
  render();
}

function renderLast() {
  const { result, label } = last;
  const parts = result.kind === "gum-set" ? result.parts : [result];

  const extra = el("div");
  if (parts.length > 1) {
    for (const p of parts) {
      add(extra, el("div", { class: "entry" },
        el("div", { class: "entry-head" },
          el("span", { class: "entry-kind", text: p.table.name }),
          el("span", { class: "entry-ts", text: `d${p.table.die} ${p.roll}` })
        ),
        el("div", { text: p.answer }),
        el("button", {
          class: "btn small ghost",
          onclick: () => { fireOne(p.tableId); },
        }, "Re-roll this one")
      ));
    }
  }

  return resultCard({
    kind: `GUM · ${label}`,
    answer: parts.length === 1 ? parts[0].answer : `${parts.length} results — read them together`,
    second: parts.length === 1 ? parts[0].table.blurb : null,
    dice: result.dice,
    extra: parts.length > 1 ? extra : null,
    actions: [
      {
        label: "Re-roll", primary: true,
        onClick: () => {
          if (result.kind === "gum-set") fireSet(parts.map((p) => p.tableId), label);
          else fireOne(result.tableId);
        },
      },
      { label: "Keep it →", onClick: () => keepDialog(parts, label) },
      { label: "Dismiss", onClick: () => { last = null; render(); } },
    ],
  });
}

// A generated result is only useful once it is written somewhere the game reads.
function keepDialog(parts, label) {
  const text = parts.map((p) => p.answer).join(" · ");
  const scope = store.currentScope();
  const body = el("div");
  add(body, el("p", { class: "muted", text: "A rolled idea does nothing until it is written down. Put it where the game will reach for it." }));
  add(body, el("div", { class: "card" }, el("p", { text })));

  const actions = [];
  if (scope) {
    for (const cat of NODE_CATEGORIES) {
      const slots = nodeSlots(scope, cat.id);
      if (!slots) continue;
      add(body, el("button", {
        class: "btn wide",
        onclick: () => {
          const at = store.writeNodeToFirstEmpty(cat.id, text, slots);
          closeModal();
          if (at < 0) toast(`${categoryName(scope, cat.id)} is full — clear a slot first.`);
          else { toast(`Written into ${cat.name}.`); go("play", "nodes"); }
        },
      }, `Write into ${categoryName(scope, cat.id)}`));
    }
  }
  add(body, el("button", {
    class: "btn wide",
    onclick: () => {
      closeModal();
      promptModal({
        title: "Name them", label: "Name",
        hint: text,
        onSubmit: (v) => {
          if (!v) return;
          store.addCast("character", v, text);
          toast("Added to the cast.");
          go("play", "cast");
        },
      });
    },
  }, "Add to the cast as a character"));
  add(body, el("button", {
    class: "btn wide",
    onclick: () => {
      closeModal();
      promptModal({
        title: "Name the place", label: "Name",
        hint: text,
        onSubmit: (v) => {
          if (!v) return;
          store.addCast("location", v, text);
          toast("Added to the cast.");
          go("play", "cast");
        },
      });
    },
  }, "Add to the cast as a location"));
  add(body, el("button", {
    class: "btn wide",
    onclick: () => {
      store.addJournal({ kind: "note", title: `Kept from GUM — ${label}`, detail: text });
      closeModal();
      toast("Kept in the journal.");
    },
  }, "Just keep it in the journal"));

  modal({ title: "Keep this", body, actions: [{ label: "Cancel" }] });
}

// --- used by the blank-filling points elsewhere in the app -----------------
// One dialog, reused wherever the app asks the player to write something (§10.11).
export function gumSuggest({ title, tableIds, onPick }) {
  if (!Settings.gum()) return false;
  const body = el("div");
  add(body, el("p", { class: "muted", text: "GUM's tables for this kind of blank. Roll one, or roll several and read them together." }));
  const out = el("div", { class: "card" });
  add(out, el("p", { class: "muted", text: "Nothing rolled yet." }));

  const pick = (text) => { closeModal(); onPick(text); };

  function show(parts, label) {
    out.replaceChildren();
    add(out, el("div", { class: "card-head" }, el("h3", { text: label })));
    for (const p of parts) {
      add(out, el("div", { class: "entry" },
        el("div", { class: "entry-head" },
          el("span", { class: "entry-kind", text: p.table.name }),
          el("span", { class: "entry-ts", text: `d${p.table.die} ${p.roll}` })
        ),
        el("div", { text: p.answer }),
        el("button", { class: "btn small", onclick: () => pick(p.answer) }, "Use this")
      ));
    }
    if (parts.length > 1) {
      add(out, el("button", {
        class: "btn primary wide",
        onclick: () => pick(parts.map((p) => p.answer).join(" · ")),
      }, "Use all of them together"));
    }
  }

  const row = el("div", { class: "btn-grid" });
  for (const id of tableIds) {
    const t = gumTable(id);
    if (!t) continue;
    add(row, el("button", {
      class: "btn small",
      onclick: () => {
        const r = rollGum({ tableId: id });
        journalRoll(r, { kind: "gum", title: `${t.name} — ${r.answer}`, detail: diceText(r.dice) });
        show([r], t.name);
      },
    }, t.name));
  }
  add(body, row);
  add(body, el("button", {
    class: "btn wide",
    onclick: () => {
      const r = rollGumSet(tableIds);
      journalRoll(r, {
        kind: "gum", title: `${title} — GUM set`,
        detail: r.parts.map((p) => `${p.table.name}: ${p.answer}`).join(" · "),
      });
      show(r.parts, "All of them");
    },
  }, "Roll them all"));
  add(body, out);

  modal({ title: `GUM · ${title}`, body, actions: [{ label: "Close" }] });
  return true;
}

// The tables GUM offers for a given plot-node category.
export function gumTablesForNode(categoryId) {
  return (GUM_FOR_NODES[categoryId] || []).filter((id) => gumTable(id));
}
