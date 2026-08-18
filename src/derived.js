// Derived values over stored state, plus normalization/migration.
// Pure functions: they read state and return numbers, never mutate.

import { STATE_VERSION, uid } from "./core.js";
import { plotSheet, trackSections, trackTotal, sectionOfBox } from "./rules.js";
import { NODE_CATEGORIES, PLOT_SHEETS } from "../data-pum-plot.js";

export const NODE_IDS = NODE_CATEGORIES.map((c) => c.id);

// --- the plot track ---------------------------------------------------------
export function sectionsOf(scope) {
  const sheet = plotSheet(scope.sheetId);
  if (!sheet) return [];
  return trackSections(sheet, scope.track && scope.track.custom);
}

export function trackLength(scope) {
  return trackTotal(sectionsOf(scope));
}

export function crossed(scope) {
  return Math.min(scope.track ? scope.track.crossed || 0 : 0, trackLength(scope));
}

export function hasTrack(scope) {
  return trackLength(scope) > 0;
}

// Threshold: the track is full, so this scope has resolved. The point of the game.
export function isResolved(scope) {
  const total = trackLength(scope);
  return total > 0 && crossed(scope) >= total;
}

// Permission (PUM p.7, and the trackless sheets' whole premise): you may end a
// plot scope when you say it ends, track or no track. A scope is over when the
// Threshold is met OR when the player has declared it over.
export function isEnded(scope) {
  return !!(scope && scope.closedAt) || isResolved(scope);
}

// Where play currently stands: the section holding the next empty box.
export function currentSection(scope) {
  const sections = sectionsOf(scope);
  if (!sections.length) return null;
  const idx = Math.min(crossed(scope), trackTotal(sections) - 1);
  const hit = sectionOfBox(sections, idx);
  return hit ? hit.section : null;
}

function trackLabel(scope) {
  const total = trackLength(scope);
  if (total === 0) return "No track";
  return `${crossed(scope)}/${total}`;
}

// --- plot nodes -------------------------------------------------------------
export function nodeSlots(scope, categoryId) {
  const sheet = plotSheet(scope.sheetId);
  if (!sheet) return 0;
  const cat = NODE_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return 0;
  // The expanded categories are printed on the plot-node extension sheet, not on
  // the all-in-one sheets (PUM p.14 vs pp.26-27). A sheet that does not print a
  // list has no list: giving it slots would let the player fill a list that the
  // Nodes screen then hides, and writing where nothing can be read is worse than
  // an honest empty hand.
  if (cat.expanded && !sheet.expandedNodes) return 0;
  // A player-named list (PUM p.27) only exists once it has been named.
  if (cat.custom && !customListName(scope, categoryId)) return 0;
  return sheet.nodeSlots;
}

// Why a category has no slots, so a surface can say the true thing rather than
// one message for three different situations.
export function nodeUnavailableReason(scope, categoryId) {
  const sheet = plotSheet(scope.sheetId);
  const cat = NODE_CATEGORIES.find((c) => c.id === categoryId);
  if (!sheet || !cat) return "unknown";
  if (sheet.nodeSlots === 0) return "no-nodes";
  if (cat.expanded && !sheet.expandedNodes) return "not-on-this-sheet";
  if (cat.custom && !customListName(scope, categoryId)) return "unnamed-list";
  return null;
}

// Which sheets pair with the plot-node extension sheet, as a sentence. Read from
// the sheet table rather than restated in a surface (§10.2) — three screens
// listed these by hand and one of them would have gone stale the moment a
// sheet's own entry changed.
export function expandedSheetSentence() {
  const names = PLOT_SHEETS.filter((s) => s.expandedNodes).map((s) => s.name);
  if (!names.length) return "";
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

// The two blank lists on the extension sheet carry whatever name you write on them.
export function customListName(scope, categoryId) {
  return (scope.customNames && scope.customNames[categoryId]) || "";
}

export function categoryName(scope, categoryId) {
  const cat = NODE_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return categoryId;
  return cat.custom ? (customListName(scope, categoryId) || cat.name) : cat.name;
}

export function nodeList(scope, categoryId) {
  const list = (scope.nodes && scope.nodes[categoryId]) || [];
  const slots = nodeSlots(scope, categoryId);
  const out = list.slice(0, slots);
  while (out.length < slots) out.push("");
  return out;
}

export function nodeFill(scope, categoryId) {
  return nodeList(scope, categoryId).filter((s) => s && s.trim()).length;
}

// Ruling A7 / PUM p.25: roll 1d10 in lists with LESS THAN half the entries
// filled; otherwise 1d20. "Otherwise" includes exactly half, so a ten-slot list
// switches at the fifth entry, not the sixth.
//
// A d10 reaches five slots and a d20 reaches ten (slot = ceil(roll/2)), so a
// five-slot list can only ever be rolled with a d10 — a d20 would point past its
// end. That is why the die follows the list's capacity as well as its fill.
export function nodeDie(scope, categoryId) {
  const slots = nodeSlots(scope, categoryId);
  if (slots <= 5) return 10;
  return nodeFill(scope, categoryId) >= slots / 2 ? 20 : 10;
}

// A node die result maps to a slot: ranges are 1-2, 3-4, ... so slot = ceil(roll/2).
export function slotForRoll(roll) {
  return Math.ceil(roll / 2) - 1;
}

export function slotRange(index) {
  return [index * 2 + 1, index * 2 + 2];
}

// --- scope helpers ----------------------------------------------------------
export function scopeSummary(scope) {
  const sheet = plotSheet(scope.sheetId);
  const bits = [sheet ? sheet.name : "Unknown sheet"];
  if (hasTrack(scope)) bits.push(trackLabel(scope));
  if (isResolved(scope)) bits.push("resolved");
  else if (isEnded(scope)) bits.push("ended");
  return bits.join(" · ");
}

export function activeScope(game) {
  if (!game || !game.scopes || !game.scopes.length) return null;
  return game.scopes.find((s) => s.id === game.activeScopeId) || game.scopes[0];
}

// --- normalization / migration (§7: never crash on old data) ---------------
function blankNodes() {
  const n = {};
  for (const id of NODE_IDS) n[id] = [];
  return n;
}

export function normalizeScope(raw = {}) {
  const scope = {
    id: raw.id || uid("scope"),
    name: raw.name || "Untitled scope",
    mission: raw.mission || "",
    sheetId: plotSheet(raw.sheetId) ? raw.sheetId : "standard",
    startingPoint: raw.startingPoint || "",
    createdAt: raw.createdAt || Date.now(),
    track: {
      crossed: Math.max(0, Number(raw.track && raw.track.crossed) || 0),
      marks: (raw.track && raw.track.marks && typeof raw.track.marks === "object")
        ? { ...raw.track.marks } : {},
      fired: (raw.track && raw.track.fired && typeof raw.track.fired === "object")
        ? { ...raw.track.fired } : {},
      custom: Array.isArray(raw.track && raw.track.custom) ? raw.track.custom : null,
    },
    customPrompts: Array.isArray(raw.customPrompts) && raw.customPrompts.length === 10
      ? raw.customPrompts : null,
    customNames: {
      custom1: (raw.customNames && typeof raw.customNames.custom1 === "string") ? raw.customNames.custom1 : "",
      custom2: (raw.customNames && typeof raw.customNames.custom2 === "string") ? raw.customNames.custom2 : "",
    },
    notes: typeof raw.notes === "string" ? raw.notes : "",
    closedAt: Number(raw.closedAt) > 0 ? Number(raw.closedAt) : null,
    nodes: blankNodes(),
    openScene: raw.openScene && raw.openScene.id ? {
      id: raw.openScene.id,
      openedAt: raw.openScene.openedAt || Date.now(),
      opener: raw.openScene.opener || "",
      interventions: Array.isArray(raw.openScene.interventions) ? raw.openScene.interventions : [],
    } : null,
    lastBeat: raw.lastBeat || null,
  };
  for (const id of NODE_IDS) {
    const src = raw.nodes && Array.isArray(raw.nodes[id]) ? raw.nodes[id] : [];
    scope.nodes[id] = src.map((s) => (typeof s === "string" ? s : ""));
  }
  // A crossed count can never exceed the track it belongs to.
  const total = trackLength(scope);
  if (total > 0 && scope.track.crossed > total) scope.track.crossed = total;
  if (total === 0) scope.track.crossed = 0;
  return scope;
}

export function normalizeGame(raw = {}) {
  const game = {
    id: raw.id || uid("game"),
    title: raw.title || "Untitled game",
    universe: raw.universe || "",
    tone: raw.tone || "",
    inspiration: raw.inspiration || "",
    createdAt: raw.createdAt || Date.now(),
    archivedAt: raw.archivedAt || null,
    activeScopeId: raw.activeScopeId || null,
    scopes: Array.isArray(raw.scopes) ? raw.scopes.map(normalizeScope) : [],
    protagonists: Array.isArray(raw.protagonists)
      ? raw.protagonists.map((p) => ({
          id: p.id || uid("pc"), name: p.name || "Unnamed", notes: p.notes || "",
        }))
      : [],
    cast: Array.isArray(raw.cast)
      ? raw.cast.map((c) => ({
          id: c.id || uid("cast"),
          kind: c.kind === "location" ? "location" : "character",
          name: c.name || "Unnamed",
          notes: c.notes || "",
          traits: Array.isArray(c.traits)
            ? c.traits.map((t) => ({
                table: t.table || "", label: t.label || "", text: t.text || "",
                roll: Number(t.roll) || 0,
              }))
            : [],
        }))
      : [],
    journal: Array.isArray(raw.journal)
      ? raw.journal.map((e) => ({
          id: e.id || uid("j"),
          ts: e.ts || Date.now(),
          kind: e.kind || "note",
          title: e.title || "",
          detail: e.detail || "",
          dice: Array.isArray(e.dice) ? e.dice : [],
          note: e.note || "",
          scopeId: e.scopeId || null,
          sceneId: e.sceneId || null,
          linkedTo: e.linkedTo || null,
        }))
      : [],
  };
  if (!game.scopes.length) game.scopes = [normalizeScope({ name: game.title })];
  if (!game.scopes.some((s) => s.id === game.activeScopeId)) {
    game.activeScopeId = game.scopes[0].id;
  }
  return game;
}

export function normalize(raw = {}) {
  const state = {
    version: STATE_VERSION,
    theme: ["light", "dark", "system"].includes(raw.theme) ? raw.theme : "system",
    textScale: Number(raw.textScale) >= 0.85 && Number(raw.textScale) <= 1.4
      ? Number(raw.textScale) : 1,
    settings: {
      disruptionDie: !!(raw.settings && raw.settings.disruptionDie),
      disruptionVolatile: !!(raw.settings && raw.settings.disruptionVolatile),
      autoEnrich: raw.settings && typeof raw.settings.autoEnrich === "boolean"
        ? raw.settings.autoEnrich : true,
      gum: raw.settings && typeof raw.settings.gum === "boolean"
        ? raw.settings.gum : true,
      explainOpen: raw.settings && typeof raw.settings.explainOpen === "boolean"
        ? raw.settings.explainOpen : true,
      seenTutorial: !!(raw.settings && raw.settings.seenTutorial),
    },
    activeGameId: raw.activeGameId || null,
    games: Array.isArray(raw.games) ? raw.games.map(normalizeGame) : [],
  };
  if (state.games.length && !state.games.some((g) => g.id === state.activeGameId)) {
    state.activeGameId = state.games[0].id;
  }
  if (!state.games.length) state.activeGameId = null;
  return state;
}
