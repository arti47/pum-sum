// The journal: every roll, every boundary, and whatever you wrote about them.
// This is the roll log (§1) and the session record (§14.1.3) in one surface.

import { el, add, fmtTime, fmtDay } from "./core.js";
import { explain, promptModal, confirmModal, toast, emptyState, actionBar } from "./ui.js";
import * as store from "./store.js";
import { sectionNav, render, go } from "./router.js";
import { registerClearer } from "./viewstate.js";

const PAGE = 40;
let shown = PAGE;
let filter = "all";

const FILTERS = [
  ["all", "All"], ["beat", "Beats"], ["oracle", "Oracles"], ["yesno", "Yes/No"],
  ["sum", "SUM"], ["scene", "Scenes"], ["note", "Notes"], ["track", "Track"],
];

export function renderJournal(host, section) {
  add(host, sectionNav("journal", section));
  const game = store.activeGame();
  if (!game) {
    add(host, emptyState("No game yet", "The journal fills itself as you play.",
      { label: "Prepare a game", onClick: () => go("more", "home") }));
    return;
  }
  if (section === "dice") return renderDice(host, game);
  return renderEntries(host, game);
}

function renderEntries(host, game) {
  add(host, el("h1", { text: "Journal" }));
  add(host, explain([
    "Every roll the app makes lands here with its dice, so you can re-derive any result later.",
    "Write your own entries too — this is where the story you are telling actually lives.",
  ]));

  const row = el("div", { class: "section-nav" });
  for (const [id, label] of FILTERS) {
    add(row, el("button", {
      "aria-current": filter === id ? "true" : "false",
      onclick: () => { filter = id; shown = PAGE; render(); },
    }, label));
  }
  add(host, row);

  const all = game.journal.filter((e) => filter === "all"
    || e.kind === filter
    || (filter === "oracle" && ["oracle", "granular"].includes(e.kind)));

  if (!all.length) {
    add(host, emptyState(
      filter === "all" ? "Nothing written yet" : "Nothing of that kind yet",
      filter === "all"
        ? "Roll a beat or ask an oracle and it will appear here."
        : "Change the filter, or play some more.",
      filter === "all" ? { label: "Go to the plot sheet", onClick: () => go("play", "track") } : null
    ));
  }

  // Lists that grow without bound page (§6.5).
  const page = all.slice(0, shown);
  let lastDay = "";
  for (const e of page) {
    const day = fmtDay(e.ts);
    if (day !== lastDay) {
      lastDay = day;
      add(host, el("h3", { text: day, style: "color:var(--ink-3);font-size:.78rem;text-transform:uppercase;letter-spacing:.05em" }));
    }
    add(host, entryEl(e));
  }
  if (all.length > shown) {
    add(host, el("button", {
      class: "btn wide",
      onclick: () => { shown += PAGE; render(); },
    }, `Show ${Math.min(PAGE, all.length - shown)} more of ${all.length}`));
  }

  actionBar({
    label: "Write an entry",
    context: `${all.length} entr${all.length === 1 ? "y" : "ies"}`,
    onClick: () => promptModal({
      title: "Write in the journal",
      label: "What happened?",
      multiline: true,
      onSubmit: (v) => { if (v) { store.addJournal({ kind: "note", title: "", detail: v }); render(); } },
    }),
  });
}

function entryEl(e) {
  const wrap = el("div", { class: "entry" });
  add(wrap, el("div", { class: "entry-head" },
    el("span", { class: "entry-kind", text: e.kind }),
    el("span", { class: "entry-ts", text: fmtTime(e.ts) })
  ));
  if (e.title) add(wrap, el("div", { class: "entry-title", text: e.title }));
  if (e.detail) add(wrap, el("div", { class: "entry-detail", text: e.detail }));
  if (e.dice && e.dice.length) {
    add(wrap, el("div", { class: "entry-dice",
      text: e.dice.map((d) => `${d.label} ${d.value}${d.kept === false ? "✗" : ""}`).join(" · ") }));
  }
  if (e.linkedTo) add(wrap, el("div", { class: "cite", text: "↳ follows an earlier roll" }));
  if (e.note) add(wrap, el("div", { class: "entry-note", text: e.note }));
  const tools = el("div", { class: "btn-row", style: "margin-top:.35rem" });
  add(tools, el("button", {
    class: "btn small ghost",
    onclick: () => promptModal({
      title: "Note", label: "Your note", value: e.note, multiline: true,
      onSubmit: (v) => { store.updateJournal(e.id, { note: v }); render(); },
    }),
  }, e.note ? "Edit note" : "Add note"));
  add(tools, el("button", {
    class: "btn small ghost",
    onclick: () => confirmModal({
      title: "Delete this entry?",
      message: "The roll and anything you wrote about it are removed from the record.",
      confirmLabel: "Delete", danger: true,
      onConfirm: () => { store.removeJournal(e.id); render(); },
    }),
  }, "Delete"));
  add(wrap, tools);
  return wrap;
}

// The fairness record (§5.1): counts per face across the campaign.
function renderDice(host, game) {
  add(host, el("h1", { text: "Dice" }));
  add(host, explain([
    "Every die the app has rolled in this game, counted by face. Digital dice are only trusted if you can check them.",
    "The app uses the browser's cryptographic random source, never Math.random.",
  ], "dice"));

  const buckets = new Map();
  let total = 0;
  for (const e of game.journal) {
    for (const d of e.dice || []) {
      const m = /d(\d+)/.exec(d.label);
      if (!m) continue;
      const size = Number(m[1]);
      if (!buckets.has(size)) buckets.set(size, new Array(size).fill(0));
      const arr = buckets.get(size);
      if (d.value >= 1 && d.value <= size) { arr[d.value - 1] += 1; total += 1; }
    }
  }

  if (!total) {
    add(host, emptyState("No dice yet", "Roll something and the distribution builds itself.",
      { label: "Go to the oracles", onClick: () => go("oracles", "yesno") }));
    return;
  }

  for (const [size, counts] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    const n = counts.reduce((a, b) => a + b, 0);
    const card = el("div", { class: "card" });
    add(card, el("div", { class: "card-head" },
      el("h3", { text: `d${size}` }),
      el("span", { class: "cite", text: `${n} roll${n === 1 ? "" : "s"} · expected ${(n / size).toFixed(1)} per face` })
    ));
    const max = Math.max(...counts, 1);
    const bars = el("div", { class: "dist" });
    const labels = el("div", { class: "dist-labels" });
    // d100 is grouped into tens so the chart stays legible on a phone.
    const groups = size > 20 ? 10 : size;
    const per = size / groups;
    for (let g = 0; g < groups; g++) {
      let sum = 0;
      for (let i = 0; i < per; i++) sum += counts[g * per + i] || 0;
      const h = Math.round((sum / (size > 20 ? max * per || 1 : max)) * 100);
      add(bars, el("i", { style: `height:${Math.max(2, Math.min(100, h))}%`, title: `${sum}` }));
      add(labels, el("span", { text: size > 20 ? String((g + 1) * per) : String(g + 1) }));
    }
    add(card, bars);
    add(card, labels);
    add(host, card);
  }

  add(host, el("p", { class: "muted", text: `${total} dice rolled in this game.` }));
  add(host, el("button", {
    class: "btn danger wide",
    onclick: () => confirmModal({
      title: "Clear the journal?",
      message: `All ${game.journal.length} entries in this game are deleted — every roll, note and scene record. Export first if you want to keep them. This can be undone once from Settings.`,
      confirmLabel: "Clear the journal", danger: true,
      onConfirm: () => { store.clearJournal(); shown = PAGE; toast("Journal cleared."); render(); },
    }),
  }, "Clear the journal"));
}

function resetJournalView() { shown = PAGE; filter = "all"; }
registerClearer(resetJournalView);
