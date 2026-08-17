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

## Cycle 3 — after adding GUM v2.2

**F-16 · A duplicate row — in the book, not the parser.** The harness's uniqueness check went
red on `evil-deeds`. Page 21 prints *Vandalism and destruction* at both 17 and 22.
*Fix:* recorded as `GUM_ERRATA` G1, surfaced in the rules library beside PUM's errata, and the
guard relaxed to "unique except for recorded errata" with an assertion pinning the duplicate to
exactly those two rows.
*Why it mattered:* the tempting fix is to dedupe. That would silently change a probability the
paper player does not get to change. A guard going red is not always a defect in the code —
here it was the code being right and the assertion being too strong.

**F-17 · Two Forge screens claimed a primary action they did not have.** The measured table put
`forge/world`'s first primary at 641px and `forge/character`'s at 770px on a 780px viewport. The
cause was the per-group "Roll all of X" buttons being styled primary — one per card, so none of
them is *the* screen's action.
*Fix:* demoted to ordinary full-width buttons. Those screens now honestly report no single
primary action, like the other browse surfaces.

**F-18 · The new toggle pushed Settings' primary action off the screen.** Adding the GUM row to
Optional rules moved Export JSON to 789px.
*Fix:* Your data moved to the top of Settings — it is the card that protects everything else,
and it now sits at 320px.
*Why it mattered:* the same defect as F-9, re-created by adding one row above it. Any screen
whose primary action is reached by scrolling is one edit away from being unreachable.

### Cycle 3 result

Unit harness 1,312 green · dead-data scan clean · browser smoke 362 green across 23 routes and
three fixtures · interaction audit 440 controls with no error, no unclickable control and no
no-op · layout probe clean at 320/360/390 under the stress fixture. **A full cycle with no new
finding.**

---

## Cycle 4 — sequence of play, completeness, and every button

Prompted by a report that the buttons did not follow the sequence of play. Eight findings.
Two are features the books have and the app did not; three are flow; three are hygiene.

**F-19 · The Forge sat inside the play loop.** Tab order was Play · Forge · Oracles · Scene.
GUM is prep-time by the book's own division of labour — "use GUM when setting a game up, and
SUM while playing it" — so the prep tool was sitting between the plot sheet and the oracles.
*Fix:* Play · Scene · Oracles · Forge · Journal · More. The three loop tabs are now adjacent
and in the order the loop runs.

**F-20 · The Play tab crossed a box above the control that calls the beat.** The track card
led, the beat controls followed. The procedure runs the other way: call a beat, play it, then
cross a box only if it mattered (§6.3.3).
*Fix:* the beat controls lead as **1 · Call a plot beat**, the track follows as **2 · Cross a
box**, the trigger reference is **3 ·** and folded — matching the Scene tab's existing 1/2/3.
The track's live position was never lost, because the persistent header carries it.

**F-21 · The loop of PUM p.5 crossed tabs with no onward route at any step.** The app had
every piece of the flowchart and no connective tissue: after confirming a beat nothing named
the scene, after closing a scene nothing named the next beat, and the oracles never led back.
Measured with the new flow probe: **every step of the loop needed the tab bar.**
*Fix:* a state-driven **What now** card on the plot sheet (open a scene / back to the scene /
ask an oracle / write it down, or "start another plot sheet" once resolved); a **While the
scene runs** card on the Scene screen (call a beat / ask an oracle / who is here); and the
scene-closed summary now offers the next scene and the plot sheet instead of a bare "Done".
The probe now reports every step offered in place.

**F-22 · The two player-named plot-node lists were missing.** PUM p.27's extension sheet
prints "My list: ____" twice, with the same ten slots and die rule as the printed categories.
*Fix:* two `custom` node categories that exist only once named, with rename and remove,
reachable by the Customized sheet's prompt column, offered GUM's grand oracle for filling, and
named by the player everywhere the app refers to them.
*Why it mattered:* D-22 again — a Permission the book grants and the app silenced. This one is
the difference between "the four categories PUM ships" and "the categories *this* game needs".

**F-23 · The Game notes area was missing.** Printed on both plot-node sheets.
*Fix:* `scope.notes`, folded under "This scope" on the plot sheet with the mission and the
starting point — which also moved that prep context out of the way of the beat controls.

**F-24 · A Yes/No answer did not offer the beat it triggers.** PUM p.28 turns two answers
straight into beats. The app had the trigger table on the Play tab as reference and never
applied it at the moment it fires.
*Fix:* after any Yes/No answer, both triggers are offered with the rule cited; choosing one
rolls the beat, journals it with the trigger that produced it, and opens it on the plot sheet.
Offered, never fired — the app cannot know which question was asked.
*Why it mattered:* §15 — a narrative game's app is judged on its prompts. This is the single
place the books' own procedure was legible to the app and it was not acting on it.

**F-25 · Journal filters covered eight of the thirteen kinds the app writes.** GUM rolls, prep
entries, node writes and timed beats could not be found again in a 500-entry log.
*Fix:* one filter per kind actually written, plus a **session break** marker — which the spec
claimed under ruling A6 and did not have. Nothing is reset or rolled at one; neither book
defines a session procedure, and the marker says so.

**F-26 · The Download button was silent when the browser blocked it.** Found by the new modal
audit: a page-initiated download in an embedded viewer neither downloads nor throws.
*Fix:* it now always reports, so the control is never one that appears to do nothing.

### Tooling added this cycle

**`tests/audit-modals.mjs`.** The interaction audit clicks top-level controls and discards
whatever dialog opens — so **284 in-dialog buttons had never been audited at all**. The new
pass opens each modal and clicks each of its buttons in isolation. Its first run produced 21
findings, 19 of which were its own false negatives: a dialog that closes itself and opens
another leaves the modal *count* at 1, so the swap read as "changed nothing". Fingerprinting
the dialog rather than counting dialogs left the two real ones (F-26).

**`tests/probe-flow.mjs`.** Walks the book's loop and reports, per step, whether the screen the
player was already on offered the next step — the measurement behind F-21.

### Cycle 4 result

Unit harness 1,323 · dead-data clean · browser smoke 362 · interaction audit 453 controls ·
modal audit 284 in-dialog buttons · flow probe: every loop step offered in place · layout clean
at 320/360/390 under stress. **A full cycle with no new finding.**

---

## Verified clean — do not re-litigate

- **Data values.** Every table's row count, range coverage and uniqueness is asserted in the
  unit harness (1,312 assertions). GUM's 43 tables each carry exactly `die` rows, every roll
  resolves, rows are unique but for the one recorded erratum, and no row carries an embedded
  list number — the signature a column-merge parse artifact would leave. The granular columns tile 1–100 in all 21 register/band
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

---

## Cycle 5 — every tab, every button, every plot sheet

The stopping rule says a cycle counts only when it produces **no** finding. This cycle was
aimed at the question the previous four never asked: *the audits run one fixture — what about
the other nine plot sheets, and the wizard?*

### Pass 1 — coverage of the audits themselves

**F-14a · Two whole regions of the app had never been clicked.**
*Target:* `tests/interaction.mjs` and `tests/audit-modals.mjs` both boot the `mid-session`
fixture — a Standard sheet, mid-play — and the prep wizard only renders while a draft exists,
so it never appeared on any audited route.
*Fix:* new `tests/audit-deep.mjs`: a sheet matrix (all ten sheets × the three Play routes ×
every control, with the dialogs of the structurally distinct sheets swept button by button),
a wizard pass (every control on every step, re-entered in isolation), and a **write-back
invariant** asserting no click may put more into a plot-node list than the Nodes screen can
read back.
*Why it mattered:* every finding below except F-20 lives in the region those two audits could
not see.

### Pass 2 — the sheet matrix

**F-15 · Plot-node lists you could fill and never read again.**
*Rule:* the expanded categories — Notable characters, Interesting locations, and the two
player-named lists — are printed on the plot-node **extension** sheet (PUM pp.26-27), not on
the all-in-one sheets.
*Target:* `derived.nodeSlots` guarded them with
`if (cat.expanded && !sheet.expandedNodes) return sheet.nodeSlots > 0 ? sheet.nodeSlots : 0;`
— a branch that returns the same value as the line below it, so the guard did nothing. Both
the Nodes screen and the wizard *hid* those lists on such a sheet, so a Standard sheet's own
prompt column (face 5 reaches Notable characters, face 6 Interesting locations) rolled on a
list with five invisible slots. "Add new" on the beat card wrote into it; so did the Forge's
"Keep it →" and the cast's "Add to plot nodes". None of it could ever be seen or edited again.
*Fix:* the guard returns 0. `roller.invokeNode` reports **why** a list is unavailable, and the
beat card answers each reason properly — for a list the sheet does not print, the prompt
stands on its own and offers *Bring one in*, *Recall* from the cast, and *Roll from GUM*.
*Why it mattered:* this is worse than a missing feature. A missing feature is visible; a
write with no read looks like it worked.

**F-19 · A rules value hardcoded in `src/`.** `cast.addToNodes` computed the list length as
`Math.max((scope.nodes[catId] || []).length, 5)` — the sheet's slot count restated in a screen
module (§10.2), and wrong on a ten-slot sheet. Reads `derived.nodeSlots` now, and says so
plainly when the sheet prints no such list.

### Pass 3 — the wizard

**F-16 · The same black hole, one step earlier.** `wizard.stepNodes` skipped the expanded
categories on a sheet that does not print them but not the two *unnamed* player-named lists,
which `nodeSlots` correctly reports as having no slots until named (PUM p.27). Prep offered
ten slots in each of two lists called "My list"; everything typed there vanished on finish.
*Fix:* an unnamed list gets no slots in prep either, and naming one is now part of prep —
`draft.customNames` carried through `store.createGame` into the new scope.

**F-23 · "Add protagonist" did nothing with an empty name.** Disabled until there is one.

### Pass 4 — the permission sweep, re-run

**F-17 · The twelfth Permission was a sentence.**
*Rule:* a full track resolves a scope, but the scope is the player's to end — and Sandbox and
Improvised have no track at all, so on those sheets saying so is the *only* way a scope can
finish. The app said this in prose on the track card and offered no control (D-22).
*Fix:* `scope.closedAt`, `store.setScopeClosed`, `derived.isEnded`, End/Reopen on the track
card (mandatory on a trackless sheet), a rules-library entry, and normalization.

**F-18 · Half of a permission had a control.** PUM p.9 allows a specific plot node invocation
"rolled or chosen"; only *chosen* — the Invoke button on a written row — existed. Each node
card now also rolls its own list as a beat.

### Pass 5 — the audits' own detector

**F-20 · A dialog opened by a dialog action was closed again by that action.**
*Target:* `ui.modal`'s action wrapper ran `closeModal()` unconditionally after the handler.
When the handler had itself opened a follow-up dialog, `closeModal()` closed *that*. So a
**voluntary** track advance onto a marked box fired the timed beat, journalled it, and then
closed the modal announcing it before it could be read; the same for a scope resolving.
*Fix:* the wrapper closes its own dialog or nothing. Guarded in `audit-modals.mjs`, watched
failing before the fix.
*Why it mattered:* nothing mechanical could see it. The dialog *does* open, so every
"changed something" check passes. It was found by reading the wrapper's contract and then
proving it in a browser rather than trusting the reading (the F-7 lesson, applied).

**F-21 · The node die switched one entry late.**
*Rule:* PUM p.25 — "roll 1d10 in lists with less than half the entries filled; otherwise roll
1d20". Exactly half is already *otherwise*.
*Target:* `derived.nodeDie` used `fill > 5`, which implements "more than half". The app
therefore disagreed with the rule text quoted in its own ruling A7, and with its own
on-screen note ("1d10 while a list is less than half full"). At 5/10 filled — a common state
— it rolled a d10 and could not reach the second half of the list at all.
*Fix:* `fill >= slots / 2`. Ruling A7, the rules-library entry, `docs/rules/plot-beats.md` and
the on-screen note all reworded to agree.

**F-22 · The audits' change detector had a blind spot.** All three compared
`innerHTML.length`. Choosing a different plot sheet in the wizard swaps "Chosen" (6) for
"Choose this sheet" (17) on one card and back on another — a net length change of exactly
zero, reported as "changed nothing". They hash the markup now. Controls marked
`aria-current` / `aria-pressed` are excluded instead, because for those doing nothing *is*
the correct behaviour.

### Verified clean this cycle

- Every table in all three books is reachable from a screen — now asserted, not assumed:
  43 GUM tables, 24 SUM tables, 15 PUM oracles.
- Every journal kind the app writes has a filter that finds it — source-scanned.
- 3,339 write-back checks across ten sheets and the wizard: nothing written where nothing
  can read it.
- 1,480 controls and 1,857 in-dialog buttons clicked in isolation across the sheet matrix:
  no JS errors, no unclickable controls, no no-ops.
- The book's loop still walks without the tab bar; layout still clean at 320/360/390.
