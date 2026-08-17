// Pure lookups over the data libraries. No state, no DOM.

import { YES_NO, GRANULAR, GRANULAR_BANDS, DESCRIPTIVE, STORY, DESCRIPTION, FOCUS, QUANTIFIERS }
  from "../data-pum-oracles.js";
import { PLOT_SHEETS, ABCD, MODIFIED_PROPOSALS, NODE_CATEGORIES, PROPOSAL_KINDS, PROPOSAL_NOTES }
  from "../data-pum-plot.js";
import { SUM_TABLES } from "../data-sum.js";
import { GUM_TABLES, GUM_SECTIONS } from "../data-gum.js";

// --- range lookup (one helper for every [min,max,text] table) ---------------
export function rangeLookup(rows, roll) {
  for (const row of rows) {
    if (roll >= row[0] && roll <= row[1]) return row[2];
  }
  return null;
}

// --- the one lookup per kind of thing (§10.16) ------------------------------
export function sumTable(id) {
  return SUM_TABLES.find((t) => t.id === id) || null;
}

export function gumTable(id) {
  return GUM_TABLES.find((t) => t.id === id) || null;
}

export function gumSection(id) {
  return GUM_SECTIONS.find((s) => s.id === id) || null;
}

// GUM tables are plain 1..N lists, so the row index is the roll.
export function gumRow(table, roll) {
  return table && roll >= 1 && roll <= table.rows.length ? table.rows[roll - 1] : null;
}

export function plotSheet(id) {
  return PLOT_SHEETS.find((s) => s.id === id) || null;
}

export function nodeCategory(id) {
  return NODE_CATEGORIES.find((c) => c.id === id) || null;
}

export function oracle(id) {
  return DESCRIPTIVE.find((o) => o.id === id)
    || STORY.find((o) => o.id === id)
    || QUANTIFIERS.find((o) => o.id === id)
    || null;
}

export function oracleFamily(id) {
  if (DESCRIPTIVE.some((o) => o.id === id)) return "descriptive";
  if (STORY.some((o) => o.id === id)) return "story";
  if (QUANTIFIERS.some((o) => o.id === id)) return "quantifier";
  return null;
}

export function enrichmentFor(family) {
  if (family === "descriptive") return DESCRIPTION;
  if (family === "story") return FOCUS;
  return null;  // quantifiers are never enriched (PUM p.9)
}

// --- yes/no -----------------------------------------------------------------
export function yesNoRegisters() {
  return Object.entries(YES_NO).map(([id, t]) => ({ id, ...t }));
}

export function yesNoAnswer(registerId, roll) {
  const reg = YES_NO[registerId];
  if (!reg) return null;
  return reg.rows[roll - 1] || null;
}

// --- granular yes/no --------------------------------------------------------
export function granularBands() { return GRANULAR_BANDS.slice(); }

export function granularLookup(registerId, bandId, roll) {
  const table = GRANULAR[registerId];
  if (!table) return null;
  const col = GRANULAR_BANDS.indexOf(bandId);
  if (col < 0) return null;
  for (const [answer, ranges] of table.rows) {
    const [min, max] = ranges[col];
    if (roll >= min && roll <= max) return answer;
  }
  return null;
}

// Every band column must tile 1-100 exactly once — asserted by the harness.
export function granularColumn(registerId, bandId) {
  const table = GRANULAR[registerId];
  const col = GRANULAR_BANDS.indexOf(bandId);
  if (!table || col < 0) return [];
  return table.rows.map(([answer, ranges]) => [ranges[col][0], ranges[col][1], answer]);
}

// --- d100 enrichment tables are stored as 50 paired rows --------------------
export function pairedLookup(table, roll) {
  const idx = Math.ceil(roll / 2) - 1;
  return table.rows[idx] || null;
}

// --- plot beats -------------------------------------------------------------
export function proposalAt(roll) {
  return MODIFIED_PROPOSALS[roll - 1] || null;
}

// The book explains each KIND of modification, not each row (PUM p.6). Show the
// explanation that belongs to the face that came up.
export function proposalNote(roll) {
  const kind = PROPOSAL_KINDS[roll - 1];
  return kind ? PROPOSAL_NOTES[kind] || null : null;
}

export function promptAt(sheet, roll, customPrompts = null) {
  const column = customPrompts && customPrompts.length === 10 ? customPrompts : sheet.prompts;
  return column[roll - 1] || null;
}

export function abcd(letter) {
  return ABCD[letter] || null;
}

// --- plot track -------------------------------------------------------------
export function trackSections(sheet, customTrack = null) {
  if (customTrack && customTrack.length) return customTrack;
  return sheet.track;
}

export function trackTotal(sections) {
  return sections.reduce((n, s) => n + s.boxes, 0);
}

// Which section a zero-based box index falls in, and its offset inside it.
export function sectionOfBox(sections, index) {
  let seen = 0;
  for (let i = 0; i < sections.length; i++) {
    if (index < seen + sections[i].boxes) {
      return { section: sections[i], sectionIndex: i, offset: index - seen };
    }
    seen += sections[i].boxes;
  }
  return null;
}
