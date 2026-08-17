// Tab routing + section nav (two-level navigation, §6.3.1) + live-state badges.

import { el, add, clear, $ } from "./core.js";
import { clearActionBar } from "./ui.js";
import * as store from "./store.js";
import { crossed, trackLength, hasTrack, isResolved, currentSection } from "./derived.js";
import { plotSheet } from "./rules.js";

export const TABS = [
  { id: "play",    icon: "▤", label: "Play",    sections: ["track", "nodes", "cast"] },
  { id: "oracles", icon: "◇", label: "Oracles", sections: ["yesno", "descriptive", "story", "granular", "quantifiers"] },
  { id: "scene",   icon: "◗", label: "Scene",   sections: ["arc", "explore", "battle", "discovery", "people"] },
  { id: "journal", icon: "✎", label: "Journal", sections: ["entries", "dice"] },
  { id: "more",    icon: "≡", label: "More",    sections: ["home", "library", "tutorial", "settings"] },
];

const SECTION_LABELS = {
  track: "Plot track", nodes: "Plot nodes", cast: "Cast",
  yesno: "Yes or No", descriptive: "Descriptive", story: "Story",
  granular: "Granular", quantifiers: "Quantifiers",
  arc: "Scene arc", explore: "Exploration", battle: "Battle",
  discovery: "Discovery", people: "Characters",
  entries: "Entries", dice: "Dice",
  home: "Home", library: "Rules", tutorial: "Tutorial", settings: "Settings",
};

let current = { tab: "play", section: "track" };
const renderers = new Map();

export function registerScreen(tab, fn) { renderers.set(tab, fn); }

export function go(tab, section = null) {
  const t = TABS.find((x) => x.id === tab) || TABS[0];
  current.tab = t.id;
  current.section = section && t.sections.includes(section) ? section : t.sections[0];
  render();
  const screen = $("#screen");
  if (screen) { screen.scrollTop = 0; window.scrollTo(0, 0); }
}

function goSection(section) { go(current.tab, section); }

// Live state that changes what to do next travels as a badge (§6.3.8).
function liveState() {
  const scope = store.currentScope();
  const game = store.activeGame();
  return {
    sceneOpen: !!(scope && scope.openScene),
    beatOpen: !!(scope && scope.lastBeat && scope.lastBeat.open),
    resolved: !!(scope && isResolved(scope)),
    needsStart: !!(scope && !scope.startingPoint),
    noGame: !game,
  };
}

export function renderTabs() {
  const bar = $("#tab-bar");
  clear(bar);
  const live = liveState();
  for (const t of TABS) {
    const btn = el("button", {
      onclick: () => go(t.id),
      "aria-current": current.tab === t.id ? "page" : null,
      "aria-label": t.label,
    },
      el("span", { class: "ti", "aria-hidden": "true", text: t.icon }),
      el("span", { text: t.label })
    );
    const badge = (t.id === "scene" && live.sceneOpen)
      || (t.id === "play" && (live.beatOpen || live.resolved));
    if (badge) add(btn, el("span", { class: "badge", "aria-hidden": "true" }));
    add(bar, btn);
  }
}

export function sectionNav(tabId, activeSection, badges = {}) {
  const t = TABS.find((x) => x.id === tabId);
  if (!t || t.sections.length < 2) return null;
  const nav = el("nav", { class: "section-nav", "aria-label": t.label + " sections" });
  for (const s of t.sections) {
    const btn = el("button", {
      onclick: () => goSection(s),
      "aria-current": s === activeSection ? "true" : "false",
    }, SECTION_LABELS[s] || s);
    if (badges[s]) add(btn, el("span", { class: "dot", "aria-hidden": "true" }));
    add(nav, btn);
  }
  return nav;
}

// The persistent plot header: the game's Threshold, on every in-play screen (§6.2).
function renderPlotHeader() {
  const host = $("#plot-header");
  clear(host);
  const scope = store.currentScope();
  const game = store.activeGame();
  if (!game || !scope || current.tab === "more") { host.hidden = true; return; }
  host.hidden = false;

  const sheet = plotSheet(scope.sheetId);
  const sec = currentSection(scope);
  const resolved = isResolved(scope);

  const row = el("div", { class: "ph-row" },
    el("span", { class: "ph-name", text: scope.name }),
    el("span", { class: "ph-sec" },
      resolved
        ? el("span", { class: "ph-resolved", text: "Resolved" })
        : (sec ? sec.name : (sheet ? sheet.name : "")),
      hasTrack(scope) ? " " : null,
      hasTrack(scope)
        ? el("span", { class: "ph-count", text: `${crossed(scope)}/${trackLength(scope)}` })
        : el("span", { class: "ph-count", text: "no track" })
    )
  );
  add(host, row);

  if (hasTrack(scope)) {
    const mini = el("div", { class: "ph-mini", "aria-hidden": "true" });
    const total = trackLength(scope);
    const done = crossed(scope);
    for (let i = 0; i < total; i++) {
      const cls = ["", i < done ? "on" : "", scope.track.marks[String(i)] ? "mark" : ""]
        .filter(Boolean).join(" ");
      add(mini, el("i", { class: cls }));
    }
    add(host, mini);
    host.setAttribute("aria-label",
      `Plot track: ${done} of ${total} boxes crossed${sec ? ", currently " + sec.name : ""}`);
  } else {
    host.setAttribute("aria-label", `${sheet ? sheet.name : "Plot sheet"}: no plot track`);
  }
}

export function render() {
  const screen = $("#screen");
  clear(screen);
  clearActionBar();
  const fn = renderers.get(current.tab);
  renderTabs();
  renderPlotHeader();
  if (fn) fn(screen, current.section);
  const sub = $("#brand-sub");
  const game = store.activeGame();
  if (sub) sub.textContent = game ? game.title : "PUM v9 · SUM v8";
}
