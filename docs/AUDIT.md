# Audit log

Numbered findings, pass by pass, as **Rule / Target / Fix / Why it mattered**, plus a
verified-clean list so later passes do not re-litigate settled ground.

The stopping rule (template §11.4): the build is done when **one complete cycle of every pass
produces no finding**. A cycle producing only cosmetic findings is still a cycle that produced
findings.

---

## Cycle 1

### Pass 1 — Dead-data scan (mechanical)

**F-1 · The book's explanation of each modification kind was extracted and never shown.**
*Rule:* PUM p.6 explains what each *kind* of modified proposal means — a location change can
be a room or a galaxy; an emotion may hit the PCs, the NPCs, the scene, or the player; someone
arriving comes with a clear bias.
*Target:* `data-pum-plot.js` `PROPOSAL_NOTES` → nothing.
*Fix:* added `PROPOSAL_KINDS` mapping each d10 face to its kind, `rules.proposalNote(roll)`,
and the note now renders as the second line of every proposal beat card.
*Why it mattered:* the exact §0 defect — extracted faithfully, unit-checked, and never called.
The proposal card said "Bring someone quite inconvenient" and stopped, when the book has a
paragraph explaining how to read it.

**F-2 · Three Permissions had an engine and a test but no control.**
*Rule:* PUM p.9's custom sheet — "fill the Random Prompt column with a customized list" and
"pre-define the length and section of your track, or build it up as you go".
*Target:* `store.setCustomPrompts`, `store.addTrackBox`, `store.removeTrackSection` — all
reachable only from the harness.
*Fix:* a **Customize** dialog on the Customized sheet: add or remove sections, add a box to
any section, and a ten-row editor for the prompt column with a reset to the printed one.
*Why it mattered:* D-22. A permission the book grants that the app cannot perform has quietly
removed a rule, and this one is the whole point of the Customized sheet.

**F-3 · Game identity could be written once and never edited.**
*Target:* `store.updateGame` had no caller.
*Fix:* an **Edit** control on the Home game card for title, universe, tone and inspiration.

**F-4 · `SUM_SECTIONS` extracted; the character screen hardcoded its own section names.**
*Target:* `src/scene.js` carried a literal map of "First contact / Shallow interaction / …".
*Fix:* read `SUM_SECTIONS` instead.
*Why it mattered:* §10.2 — rules data belongs in `data-*.js` and is never restated in `src/`.
Two copies of one list is a disagreement with a delayed fuse.

**F-5 · Transient view state leaked across games and plot sheets.**
*Rule:* not a book rule — a seam (D-19). The open beat, the last oracle answer, the last SUM
roll and the journal's paging all live in module scope so a re-render cannot re-roll them
(§5.1). Nothing cleared them when the active game or scope changed.
*Target:* `sheet.js`, `oracles.js`, `scene.js`, `journal.js`.
*Fix:* new `src/viewstate.js` owning a clearer registry; each module registers its own; `main.js`
watches the `game/scope` key on every store change and fires them.
*Why it mattered:* a beat rolled on one plot sheet could be confirmed against another's track.
Every flag needs a setter, a reader **and a clearer** (§10.14) — these had no clearer.

**F-6 · Dead exports and unused imports.** `fmtRange`, `pairedRange`, `rerollLink`,
`isModalOpen`, `sectionCard`, `trackPercent`, `route`, `refresh`, `d20`, plus fourteen unused
named imports. Deleted, un-exported, or given the job they were written for (`fmtRange` now
renders the node-slot ranges; `defRow` now stacks the sentence-length values on Home).

**F-7 · The scan itself was wrong, and I acted on a false positive.**
*Target:* `tests/deadcode.mjs` used `\b${name}\b` to count uses. `\b` is not a word boundary
for `$`, so every `$` import read as unused — and I removed it from `router.js` and `main.js`
before checking, breaking both.
*Fix:* bound on the identifier charset with lookarounds instead; restored the imports.
*Why it mattered:* D-14 in reverse — a guard that lies in the other direction. Recorded because
the fix is the lesson: **verify a mechanical finding against the code before acting on it.**

### Pass 2 — Rules-file read-through

Read `docs/rules/*.md` sentence by sentence against the engine. No new findings: the two bias
mechanics are implemented separately (ruling A4), the node die follows list capacity and fill
(A7), the disruption die's 1-is-always-a-prompt rule holds when the range widens, and the
errata (A2, A3) are surfaced rather than silently corrected.

### Pass 3 — Permission sweep (re-aimed from the template's ability sweep)

This game has no abilities; it has eleven Permissions (§3.0), so the sweep asks of each one:
*where is its control?* All eleven now have one — see the traceability ledger in `CLAUDE.md`.
Three were missing at the start of this cycle and are F-2 and F-3 above.

### Pass 4 — Interaction audit

Every visible control on all nineteen routes, clicked in isolation with storage reset between
clicks. No JS errors, no unclickable controls, no no-ops.

### Pass 5 — Measured layout

**F-8 · Tap targets below the design target.** The measured table showed 32px track boxes and
36px section-nav pills and `.btn.small` controls. WCAG 2.2 SC 2.5.8 sets the floor at 24px
with spacing, so these passed the standard and missed the template's design-to-44 rule.
*Fix:* pills and small buttons to 40px, track boxes to 40px tall, `explain()` summaries to 44px.

**F-9 · Two primary actions below the fold.** Home's first primary action sat at 674px and
Settings' at 786px on a 780px viewport — off-screen on a smaller phone.
*Fix:* Home's primary action is now pinned in the action bar carrying the scope and track as
its context. Settings is reordered by frequency (§6.3.4) so **Your data** — the card a player
actually returns to — sits above Appearance; its first primary action is now at 582px.
*Why it mattered:* D-8. Four buried primary actions survived ten reading passes in the
reference build and fell out of one measured table. Same here: reading the screens found
nothing; the table found both.

### Pass 5b — Shipped-file sweep

**F-10 · A module was added without its service-worker app-shell entry.**
*Rule:* template §6.1 — adding a `src/` file updates the app-shell list and bumps
`CACHE_VERSION` in the same change.
*Target:* `src/viewstate.js` (added by the F-5 fix) was missing from `APP_SHELL`.
*Fix:* listed it, bumped the cache to `um-v2`, and added a harness check asserting the shell
lists every shipped file and no file that does not exist.
*Why it mattered:* the app would have booted fine online and failed completely offline — the
module 404s, the import chain breaks, nothing renders. A play aid that dies in a basement is
the specific failure the caching strategy exists to prevent, and only a mechanical check
finds it, because nothing looks wrong while you have a network.

### Pass 6 — Stress state

Re-probed against the `stress` fixture (3 plot sheets, 14 cast entries with rolled traits,
170 journal entries, two timed marks, a scene open with four interventions). No screen
exceeds 7.1 viewports; the journal pages at 40 entries; no horizontal overflow at 320, 360 or
390px.

### Pass 7 — Flow walk

Played a session end to end through the app. Terminal outcomes all offer an onward route: a
resolved scope offers a new plot sheet, a closed scene summarises and offers undo, an empty
journal links to the plot sheet, a nodeless sheet says so rather than showing an empty list.

---

## Cycle 2 — run after every cycle-1 fix

Two findings, both introduced by cycle-1 fixes. This is the reason for the stopping rule:
a clean pass proves nothing until the *whole cycle* is re-run against the fixed code.

**F-11 · The wizard hijacked every route on the More tab.**
*Target:* `renderMore` returned `renderWizard(host)` whenever a draft existed, ignoring the
requested section, so tapping Rules or Settings mid-preparation re-rendered the wizard and the
section nav read as broken.
*Fix:* the wizard renders on Home only; the other More sections render normally and carry a
"A game is half-prepared" card back to it. Found by the interaction audit, as four wizard
step-buttons that "changed nothing" on the *Rules* route.

**F-12 · The wizard's own step nav offered steps it would not go to.**
*Target:* `wizard.js` step buttons for not-yet-legal steps were rendered enabled and silently
did nothing when tapped.
*Fix:* they are `disabled` with a title naming the reason. §6.4 — a refusal explains the rule;
it does not fail silently.

**F-13 · Creating the game nulled the wizard's draft mid-`finish()`.**
*Rule:* not a book rule — the same seam again. `store.createGame` emits, `main.js` sees the
active game change and fires the clearers, the wizard's clearer nulls `draft`, and the next
line read `draft.universe` and threw.
*Fix:* `finish()` takes a local copy of the draft before creating anything.
*Why it mattered:* a **regression introduced by the F-5 fix**, and the reason the whole cycle
gets re-run rather than only the pass that found the original defect. The browser smoke walk
caught it on the first re-run: the wizard completed, threw, and never reached the plot sheet.

**F-14 · Track boxes measured 36px at 320px width.** Only visible at the narrowest supported
width, where eleven boxes flexed below the 40px target. `min-width` raised from 30px to 40px.

**F-15 · The action bar's context line wrapped.** Cosmetic, found by looking at a real render
rather than a number: "scene open · 1 check" broke to two lines on a 390px screen and grew the
bar. Truncated with an ellipsis, buttons no longer flexing.

### Cycle 2 result

After F-11 to F-14: unit harness 945 green, dead-data scan clean, browser smoke 304 green,
interaction audit 338 controls with no error, no unclickable control and no no-op, layout probe
clean at 320/360/390 under the stress fixture. **A full cycle with no new finding.**

---

## Verified clean — do not re-litigate

- **Data values.** Every table's row count, range coverage and uniqueness is asserted in the
  unit harness (945 assertions). The granular columns tile 1–100 in all 21 register/band
  combinations; all 24 SUM tables tile their die exactly; both d100 enrichment tables cover
  1–100 with 50 unique paired rows. Track box counts are measured from 300 dpi renders, not
  estimated, and pinned by `EXPECTED_TRACK`.
- **The two bias mechanics.** PUM's returns both answers and commits neither; SUM's keeps the
  minimum or maximum. Asserted over 300 rolls each.
- **The compulsion.** "Leave it to destiny" never returns an empty slot, and terminates
  against an all-empty list rather than hanging.
- **The threshold.** `isResolved` flips on exactly the final box, never before; crossing stops
  at the last box; a trackless sheet can never report a crossing.
- **Normalization.** An unknown sheet id falls back to Standard, non-string nodes are dropped,
  an over-long track is clamped, missing categories are back-filled, out-of-range settings
  return to their documented defaults.
- **Guards proven to bite.** Three data guards (SUM tiling, granular tiling, the node die) and
  one layout guard were each watched failing against deliberately broken code, then restored.

## Known and accepted

- `derived.NODE_IDS`, `router.TABS` and `rules.granularColumn` are exported for the harnesses
  and read by no shipped surface. Kept deliberately: they are test-support API, and the scan
  reports them as notes rather than findings so the distinction stays visible.
- The PWA update path is implemented (an "Update available — tap to reload" toast on
  `updatefound`) but is **not** covered by an automated test. It is the one PWA behaviour that
  cannot be verified by looking at the running app; verifying it needs a deploy-and-reload
  cycle the harness does not perform.
