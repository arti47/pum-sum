// Transient view state — the beat on the table, the last oracle answer, the
// last SUM roll, the journal's paging — lives in module scope so a re-render
// never re-rolls it (§5.1). That makes switching game or plot sheet a seam
// (D-19): state described by one module while another changes underneath it.
// This module owns the clearer, and store.subscribe fires it on any context
// change, so a beat rolled in one game can never appear on another's sheet.

const clearers = new Set();

export function registerClearer(fn) { clearers.add(fn); }

export function clearTransient() {
  for (const fn of clearers) fn();
}
