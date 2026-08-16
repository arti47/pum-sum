# Unfolding Machines — project spec (canonical)

A solo-storytelling play aid for the **Plot Unfolding Machine (PUM) v9.0** and the
**Scene Unfolding Machine (SUM) v8.0 Rev2** by JeansenVaars. Built to the
*RPG Player-Character App — Autonomous Build Instructions (v3)* template. This file is the
project's living spec: **every code change updates it in the same change.**

---

## 1. What this is

| | |
|---|---|
| **System** | PUM v9.0 (30pp) + SUM v8.0 Rev2 (12pp) — core rules only, no setting content |
| **Audience** | The solo player, who is simultaneously author, protagonist and referee |
| **Platforms** | Phone, browser, desktop — one installable PWA, no build step |
| **Core job** | Game-setup wizard + live plot sheet + oracle console + scene engine + journal |
| **Backend** | `localStorage` only. No Firebase (§1.1) |
| **Theme** | Printed play-sheet: warm paper, ink type, one machine-orange accent. Light + dark, follows system |

### 1.0 The adaptation ruling (read this first)

The template assumes a **character-stat RPG**. PUM/SUM is not one. It has no attributes, no
derived stats, no skills, no hit points, no death procedure, no rest, no inventory, no
initiative, no bestiary, no advancement and no character sheet. Per the template's
CONDITIONAL rule — *if the game lacks a subsystem, omit it entirely; never invent mechanics* —
every one of those slots is omitted, and the template's structural roles are re-homed onto
the subsystems this game actually has:

| Template role | PUM/SUM's actual subsystem |
|---|---|
| Character creation wizard (§3.7) | **Game prep**: universe → plot scope → protagonists → plot sheet → plot nodes (PUM p.3) |
| The character sheet / tracker (§9.2 Phase 2) | **The plot sheet**: plot track + plot nodes + beat controls |
| Derived stats / vitals (§3.5) | *(none)* — the header carries plot-track position instead |
| The Threshold that is the point of the game (§3.0) | **Plot-track completion** — how close this scope is to resolving |
| Generic progress tracker (§3.13) | **The plot track** — one component, eleven sheet shapes |
| Meta-currency (§3.3) | *(none)* — PUM has no spendable economy |
| Scene/session lifecycle (§3.12) | **SUM's scene arc**: opener → intervention → closure |
| Bestiary / NPC compendium (§3.18) | **The cast**: notable-character plot nodes carried with their SUM-rolled traits |
| Dice engine (§3.1) | **The oracle + plot-beat engine** — the whole game |
| Solo mode (§3.20, CONDITIONAL) | *Not* a mode. Solo is the default and only mode |
| GM screen | *(omitted)* — there is no GM to screen anything from |
| Multiplayer party sync | *(omitted per §1.1)* — PUM's group mode is one device passed around |

**What this game is dense in** — see the shape census (§3.0) — is **Lookup** and
**Permission**. Per the template's §15 field guide, that puts it in the *narrative* family:
*"the app's job shifts from arithmetic to prompting… a narrative game's app is judged on its
prompts the way a crunchy game's app is judged on its maths."* Every design decision below
follows from that sentence.

### 1.1 Product decisions (Stage B)

| Question | Answer |
|---|---|
| Usage mode | **Single-device, local-first only.** No Firebase, no sync phase, no campaign join codes |
| User's seat | Solo player (no GM screen) |
| Dice input | **App rolls**, cryptographic RNG, every die face shown, both dice shown on a bias roll |
| Expansions | None supplied. SUM is not an expansion — it is a committed co-equal half of the app |
| Table device | Phone-first |
| Theme default | Follow system, with an in-app override |
| One campaign or many | **Many.** A library of games; each game holds many plot sheets (plot scopes) |

---

## 2. Source and precedence

Sources: the two supplied PDFs. Both are digitally-typeset (not scans), so page images were
available throughout and sit at the top of the precedence order.

**Extraction method (recorded because it decides how much to trust the data):**

1. `pdftotext -bbox` → word-level bounding boxes → a reconstruction script clustering words
   into rows by `yMax` and ordering by `xMin`. This is the authoritative pass: it pairs each
   two-column table's left and right halves **row by row**, which plain text extraction does
   not.
2. Plain extraction was checked against it. **It disagrees systematically** — plain
   extraction emits a table's *right* column before its *left*, so every "low result" list in
   SUM would have been transcribed as its opposite. That defect would have inverted the Rule
   of Bias across all twenty-four SUM tables. It was caught by the bbox pass.
3. Vector geometry (plot-track boxes) is not text at all. Pages were rendered at 300 dpi and
   the divider columns counted by pixel analysis (`tests/tools/` — retained), separating
   full-height section rules from half-height box dividers. Every track length in
   `data-pum-plot.js` is a measured count, not an estimate.

**No blocked tables.** Every table in both books is fully recovered and cited.

### 2.1 Rulings (ambiguities, with ids)

| id | Point | Ruling |
|---|---|---|
| **A1** | PUM p.12's Yes/No columns are headed *Deterministic · Subjective · Conversation*, but plain text extraction returns them in a different order | Column identity confirmed against the granular tables on p.24, which repeat the same answer lists under explicit headings. Deterministic = *Strong no…Strong yes*; Subjective = *No, definitely not…*; Conversation = *No, absolutely not…* |
| **A2** | PUM p.11's worked example reads *"Random prompt → 6 → Meet or recall a notable character"*, but on every plot sheet 6 is *Lead to an interesting location* and 5 is *Meet or recall a notable character* | **The plot sheet wins** (it is the play surface; the example is prose). Recorded as an erratum in `PUM_ERRATA`, surfaced in the rules library, never silently corrected |
| **A3** | PUM p.9 refers to *"(5) Trigger a game or world element"*; the sheets put world elements at 7 | Same ruling as A2; same erratum entry. Both are consistent with an earlier layout |
| **A4** | PUM's bias rule for Yes/No is *"roll twice and pick the result that best fits your judgment"*; SUM's is *"roll twice and keep the lowest / highest"* | **These are different mechanics and are implemented differently.** PUM bias = both results offered, player chooses. SUM bias = the engine keeps low or high per the declared expectation. Conflating them would hand the player's authorship to the machine |
| **A5** | SUM's Intervention check and PUM's plot beats can both interrupt a scene | Both are offered; neither fires automatically. The disruption die (PUM p.9) is the only automatic interrupter and is off by default, matching the book's "optional rule" framing |
| **A6** | Neither book names a scene/session boundary procedure beyond SUM's closure | The lifecycle engine owns **scene** boundaries only. There is no session-end bundle to fire, so none is invented; the journal marks sessions for the player's own reference |
| **A7** | Plot-node lists: *"Roll 1d10 in lists with less than half the entries filled; otherwise roll 1d20"* (PUM p.25) applies to the 10-slot expanded sheet; the in-sheet lists have 5 slots | Die size is derived from the list's own capacity and fill: 5-slot lists always roll 1d10; 10-slot lists roll 1d10 until more than five slots are filled, then 1d20. One function, `derived.nodeDie()` |
| **A8** | Neither book contains safety tools (§3.22) | Recorded as absent. Nothing invented; Settings says so plainly rather than shipping a house-aid X-card as if it were the book's |

---

## 3. System Profile (completed)

### 3.0 Rule-shape census

The honest statement of what this app must be good at.

| Shape | Count | Where they are |
|---|---|---|
| **Lookup** | **43** | Every oracle and every prompt table. 24 SUM tables, 19 PUM tables |
| **Permission** | **11** | Re-roll a result you dislike · ignore or reinterpret any answer · choose *not* to advance the track · advance it voluntarily without a beat · invoke a plot node deliberately instead of rolling · "add new, choose, or reroll" on any node slot · invent a plot node mid-play · re-roll a repeated beat · customise the Random Prompt column · pre-draw or grow a custom track · end a scope when you say it ends |
| **Modifier** | 2 | SUM Rule of Bias (keep low/high) · PUM bias (roll twice, pick) — different mechanics, ruling A4 |
| **Escalation** | 1 | The plot track: each confirmed beat advances one box toward resolution |
| **Threshold** | 1 | Track full ⇒ the scope resolves. This is the game's stakes and it lives in the persistent header |
| **Cascade** | 1 | Disruption die: an oracle roll can fire a plot beat, which can itself be rolled again. Capped at one disruption per oracle roll |
| **Gate** | 1 | A plot beat may only be *confirmed* (mark a box) after its outcome has been played and judged relevant |
| **Compulsion** | 1 | Empty node slot + "still stuck" ⇒ re-roll until an entry comes up (PUM p.6) |
| **Conversion** | 1 | An invented node written into an empty slot becomes a permanent entry in that list |

**Consequence for the build:** eleven Permission rules is the largest count after Lookup.
Every one of them is a control in this app, never a sentence — that is the single biggest
correctness risk here (template D-22), and the ability sweep (§11.2.3) is re-aimed at
permissions rather than at abilities, which this game does not have.

### 3.1 Core resolution mechanic

**There is none, and that is load-bearing.** PUM resolves nothing — it is explicitly
system-agnostic and expects you to bring a rulebook for task resolution ("*pick up any
tabletop RPG from your shelf*"). What the app provides instead:

- **Oracle rolls**: 1d10 for Yes/No; 1d10 + 1d100 enrichment for descriptive and story
  oracles; 1d100 against a likelihood band for the granular Yes/No variant.
- **Plot beats**: 1d10 on either the Modified Proposal or the Random Prompt column.
- **SUM tables**: 1d20 or 1d100 with the Rule of Bias.

No crit, no fumble, no push economy, no success counting. The app therefore never says
whether an action succeeded — it says what the world offers. Surfaces must not imply
otherwise.

### 3.2–3.6, 3.8–3.11, 3.14–3.19 — omitted

No opposed tests, meta-currencies, attributes, derived stats, skills, group entity,
conditions, health/damage/death, rest, powers, advancement, inventory, combat structure,
bestiary or pregens exist in either book. Nothing is invented to fill them (§1.0).

### 3.7 Creation options → **game prep** (PUM p.3)

Four rule-legal steps, in order:

1. **Pick a universe and gather inspiration** — which RPG or fiction, and the world, tone
   and theme.
2. **Draft a plot scope and mission** — what story you want to unfold, plus a pitch for the
   starting situation and initial goals.
3. **Create your protagonists** — PCs; the player controls their thoughts, voice, actions.
4. **Pick a plot sheet and write plot nodes** — the sheet sets pacing; the nodes are the
   game-specific content the Random Prompt column reaches into.

The book names a fifth thing the app must not forget (template §6.3.7): the scope's
*starting point* — "decide on the game's starting point and what is introduced there",
optionally *in medias res*. The home screen names it as the next step until it is written.

**Plot node categories** — four base, two expanded:

| Category | What goes in it (PUM p.28) |
|---|---|
| Game or world elements | World events and features, world truths, system-specific events |
| Potential problems | Encounters, people good or bad, traps, dangers, discoveries |
| Useful findings | Items, artifacts, a MacGuffin, clues, hard-to-find people, tools |
| Pending questions | Open threads, unresolved leads, mysteries |
| Notable characters *(expanded)* | People in scope who can appear, be mentioned or recalled |
| Interesting locations *(expanded)* | Places in scope that can be discovered or referenced |

### 3.12 Scene lifecycle → **SUM's scene arc**

The app owns three boundary events, all player-fired, none automatic:

- **Open a scene** — SUM Scene opener (1d20).
- **Mid-scene** — SUM Intervention check (1d100), fired when "PCs are taking too long,
  tension is high, danger is near, or silence lingers".
- **Close a scene** — SUM Scene closure (1d20), *fortunately / unfortunately*.

Each boundary writes a journal entry, is summarised on commit, and is undoable in one step.
There is **no session or adventure boundary** in either book (ruling A6).

### 3.13 Progress tasks → **the plot track**

One component, eleven configurations. A track is an ordered list of **sections**, each
holding a measured number of **boxes**. A confirmed plot beat crosses the next empty box.

| Sheet | Track | Boxes | Notes |
|---|---|---|---|
| Standard | Exposition 3 · Confrontation 5 · Resolution 3 | 11 | All-in-one quick game; 4 node categories × 5 slots |
| Journey | Exposition 3 · Rising 7 · Climax 4 · Falling 3 · Resolution 3 | 20 | Five-act; pairs with a Plot Nodes sheet |
| Story-focus | same five acts as Journey | 20 | Random Prompt column is **all plot nodes**, no ABCD |
| Scenes | Intro · Scene 1–8 · Wrap-up, 1 box each | 10 | One beat per scene |
| Dungeon | Entrance · Room 1–5 · Way out, 1 box each | 7 | One beat per room |
| Exploration | Arrival 1 · 1st/2nd/3rd Area 3 each · Conclusion 1 | 11 | Triple beats per area |
| Story-parts | Intro · Part 1–3 · Wrap-up, 1 box each | 5 | Sparse beats over large chunks |
| Improvised | *(none)* | 0 | No track, no nodes; ABCD only |
| Sandbox | *(none)* | 0 | No track; nodes supported |
| Customized | *(player-defined)* | 0+ | Sections and boxes added in play or pre-drawn |

### 3.20 Solo rules

The entire system is the solo procedure. Its **procedural framing** (template §3.20) is
extracted as first-class content, not just its tables: the three play states (roleplay ·
ask the oracles · invoke a plot beat), the playing flowchart (PUM p.5), the six triggers for
each beat type (p.28 cheat sheet), and the advice chapter (p.10) — all surfaced in-app,
because guidance extracted and never shown is the §0 defect wearing a different coat.

### 3.21 GM tables

All of PUM's oracles and all of SUM's tables are, in a solo game, exactly this. There is no
separate GM reference panel; the Oracles and Scene tabs are it.

### 3.22 Safety tools

**Absent from both books** (ruling A8). Settings states this rather than inventing one.

---

## 4. Architecture

Per template §5, unchanged: no build step, native ES modules, `localStorage`, themed UI
primitives, null-safe DOM helpers, `crypto.getRandomValues` for every die, phone-first with
zero horizontal overflow at 320/360/390px, WCAG 2.2 AA target sizes, reduced motion honoured,
text-size control paying back the zoom lock.

### 4.1 File map

| File | Purpose |
|---|---|
| `index.html` | Shell: app header, persistent plot header, section nav mount, screen mount, tab bar |
| `styles.css` | Printed-play-sheet theme (light + dark) + every component style |
| `data-pum-oracles.js` | Yes/No ×3 · granular ×3 · descriptive ×6 · story ×6 · Description d100 · Focus d100 · quantifiers ×3 |
| `data-pum-plot.js` | Modified proposals · random-prompt columns · ABCD ×4 · 11 plot sheets · node categories · `PUM_ERRATA` |
| `data-sum.js` | All 24 SUM tables, grouped by the book's own sections |
| `data-guidance.js` | The books' procedural framing: play states, flowchart, beat triggers, advice |
| `data-rules-library.js` | One entry per automated rule, in the app's own words, page-cited |
| `src/*.js` | Modules, §4.2 |
| `manifest.json`, `service-worker.js`, `icon.svg` | PWA |
| `tests/` | Harnesses, probes, seed fixtures, and `tests/tools/` — the retained extraction scripts |
| `docs/AUDIT.md` | Numbered findings per pass + the verified-clean list |
| `docs/rules/*.md` | Distilled per-subsystem reference the audit reads against the engine |

### 4.2 Module map

| Module | Responsibility |
|---|---|
| `core.js` | Constants, DOM helpers (`el`, null-safe `add`), crypto dice. No imports |
| `ui.js` | `modal/toast/confirmModal/promptModal`, `explain()`, `actionBar()`, `defRow()` |
| `rules.js` | Pure lookups over the data files: range lookup, granular band lookup, sheet lookup |
| `derived.js` | Track position/percentage, `nodeDie()`, node fill, normalization + migration |
| `settings.js` | Toggles: disruption die, expanded nodes, text size, theme, auto-enrich |
| `store.js` | Campaign library, plot sheets, nodes, cast, journal, export/import, undo stack |
| `roller.js` | Oracle engine, plot-beat engine, bias handling, disruption cascade, journal writes |
| `sheet.js` | The plot sheet screen: track, beats, nodes; the persistent plot header |
| `oracles.js` | The oracle console |
| `scene.js` | SUM: scene arc lifecycle + exploration/battle/discovery tables |
| `cast.js` | Characters & locations roster + SUM character emulation |
| `journal.js` | The journal: entries, narration, filters, paging, dice distribution |
| `wizard.js` | The four-step game prep |
| `screens.js` | Home, rules library, settings |
| `tutorial.js` | First-session walkthrough |
| `router.js` | Tab routing, section nav, live-state badges, the persistent plot header |
| `viewstate.js` | The clearer registry for transient view state (the open beat, the last answer, paging). `main.js` fires it whenever the active game or scope changes |
| `main.js` | Boot |

### 4.3 Data model (`localStorage`)

```
umState
  version, theme, textScale, settings{ disruptionDie, expandedNodes, autoEnrich }
  activeGameId
  games[ {
    id, title, universe, tone, createdAt, archivedAt|null,
    scopes[ {                              // one per plot sheet in play
      id, name, mission, sheetId, startingPoint,
      track: { crossed:int, marks:{ index -> label } },   // timed beats (PUM p.9)
      nodes: { world[], problems[], findings[], questions[], characters[], locations[] },
      openScene: { id, openedAt, opener, interventions[] } | null
    } ],
    protagonists[ { id, name, notes } ],
    cast[ { id, kind:'character'|'location', name, notes, traits[] } ],
    journal[ { id, ts, kind, title, dice[], detail, note, scopeId, sceneId } ]
  } ]
```

Every field addition ships a normalization path in `derived.normalize()` and a fixture test.

---

## 5. Ledgers

### 5.1 Data Extraction Ledger

All ticked boxes are extracted, cited and unit-checked for row count and range coverage.

- [x] **T1** Yes/No ×3 (PUM p.12) → `oracles.js`
- [x] **T2** Granular Yes/No ×3 × 7 bands (PUM p.24) → `oracles.js`
- [x] **T3** Descriptive oracles ×6 (PUM p.12) → `oracles.js`
- [x] **T4** Description d100, 50 rows (PUM p.12) → `oracles.js`
- [x] **T5** Story oracles ×6 (PUM p.13) → `oracles.js`
- [x] **T6** Focus d100, 50 rows (PUM p.13) → `oracles.js`
- [x] **T7** Quantifiers ×3 (PUM p.13) → `oracles.js`
- [x] **T8** Modified proposals, 10 rows (PUM p.14) → `roller.js`
- [x] **T9** Random prompt columns ×3 variants (PUM pp.14/16/21) → `roller.js`
- [x] **T10** ABCD tables ×4 (PUM p.14) → `roller.js`
- [x] **T11** 11 plot sheets: track sections + measured box counts → `sheet.js`
- [x] **T12** Plot node categories + definitions (PUM p.28) → `sheet.js`
- [x] **T13** SUM Controller ×3 (p.4) → `scene.js`
- [x] **T14** SUM Exploration ×3 (p.5) → `scene.js`
- [x] **T15** SUM Battle ×3 (p.6) → `scene.js`
- [x] **T16** SUM Discovery ×3 (p.7) → `scene.js`
- [x] **T17** SUM First contact ×3 (p.8) → `cast.js`
- [x] **T18** SUM Shallow interaction ×3 (p.9) → `cast.js`
- [x] **T19** SUM Trust conversation ×3 (p.10) → `cast.js`
- [x] **T20** SUM Deep relationship ×3 (p.11) → `cast.js`
- [x] **T21** Beat triggers cheat sheet (PUM p.28) → `sheet.js`, `tutorial.js`
- [x] **T22** Play states + flowchart (PUM pp.4–5) → `screens.js`, `tutorial.js`
- [x] **T23** Advice chapter (PUM p.10) → `screens.js`
- [x] **T24** Rules-library entries, one per automated rule → `screens.js`

### 5.2 Rules Traceability Ledger

| Rule | Shape | Data | Engine | Surface | Test |
|---|---|---|---|---|---|
| Oracle answer = 1d10 row | Lookup | `YES_NO` | `roller.rollYesNo` | Oracles → result card | `every d10 row is reachable` |
| Granular Yes/No = d100 vs likelihood band | Lookup | `GRANULAR` | `rules.granularLookup` | Oracles → granular | `bands tile 1–100 with no gap` |
| Descriptive/story oracle enriched by d100 word | Lookup | `DESCRIPTION`,`FOCUS` | `roller.rollOracle` | Result card, second line | `enrichment table covers 1–100` |
| PUM bias: roll twice, **player picks** | Modifier | — | `roller.rollYesNo({bias:true})` | Two answer chips, player taps one | `bias returns both, commits neither` |
| SUM bias: roll twice, keep low/high | Modifier | — | `roller.rollSum({bias})` | Result shows both dice, kept one marked | `keep-low returns min; keep-high returns max` |
| Plot beat = 1d10 on proposal or prompt column | Lookup | `PLOT_SHEETS[].prompts` | `roller.rollProposal`/`rollPrompt` | Play → beat card | `each sheet's column has 10 rows` |
| Each proposal face is a *kind* of modification the book explains | Lookup | `PROPOSAL_KINDS`, `PROPOSAL_NOTES` | `rules.proposalNote` | Beat card, second line | `proposal 2/5/6/7 match the p.11 examples` |
| Node-invoking prompt rolls a node | Lookup | node lists | `roller.invokeNode` | Beat card → node line | `an empty slot offers add/choose/reroll` |
| Node die is d10 or d20 by list fill | Lookup | — | `derived.nodeDie` | Node list header shows the die | `d20 only past half of a 10-slot list` |
| Empty node slot ⇒ add, choose, or reroll | Permission | — | `roller.invokeNode` | Three buttons on the beat card | `all three paths are offered` |
| Still stuck ⇒ reroll until an entry comes up | Compulsion | — | `roller.invokeNode({force:true})` | "Leave it to destiny" button | `force never returns an empty slot` |
| A beat may be confirmed or not | Gate | — | `store.confirmBeat` | Confirm / Not this time on the beat card | `an unconfirmed beat leaves the track` |
| Confirming crosses the next empty box | Escalation | `PLOT_SHEETS[].track` | `store.confirmBeat` | Plot track + header | `crossing stops at the last box` |
| Track full ⇒ scope resolved | Threshold | — | `derived.isResolved` | Persistent header | `predicate flips on the final box` |
| Voluntary track advance without a beat | Permission | — | `store.confirmBeat({voluntary:true})` | Track → Advance without a beat | `voluntary advance is journalled as such` |
| Deliberate node invocation without a roll | Permission | — | `roller.invokeNode({chosen})` | Node row → Invoke | `chosen node bypasses the die` |
| Re-roll a repeated beat | Permission | — | `roller.rollBeat` flags a repeat | "Same as last time — reroll?" | `a repeat is flagged, not forced` |
| Re-roll / ignore any oracle answer | Permission | — | `roller.reroll` | Reroll on every result card | `reroll writes a linked journal entry` |
| Timed plot beat on a marked box | Lookup | `track.marks` | `store.confirmBeat` | Track box badge + modal on arrival | `arriving at a marked box fires once` |
| Disruption die: 1 ⇒ random prompt, 2 ⇒ proposal | Cascade | `DISRUPTION` | `roller.rollOracle` | Result card → disruption strip | `range widens to 2–5; 1 stays sole prompt` |
| Scene opener / intervention / closure | Lookup | `SUM_CONTROLLER` | `scene.open/intervene/close` | Scene tab, in play order | `closing a scene requires an open one` |
| Custom Random Prompt column | Permission | `scope.customPrompts` | `store.setCustomPrompts` | Track → Customize → Edit the prompt column | `custom column persists and rolls` |
| Custom track grown in play | Permission | `track.custom` | `store.addTrackSection/addTrackBox/removeTrackSection` | Track → Customize | `boxes persist and cross in order; removing a section clamps` |
| Every roll is journalled with its dice | Lookup | — | `store.addJournal` | Journal tab | `a roll writes exactly one entry` |
| Books contain no safety tools | *guidance only* | — | — | Settings → About the books | — |
| Task resolution is your own RPG's job | *guidance only* | — | — | `explain()` on Oracles + rules library | — |

---

## 6. Roadmap

- [x] **Phase 0 — Foundations**: files scaffolded; complete verified data library; theme; PWA
      shell; router with two-level nav; local storage.
- [x] **Phase 1 — Game prep wizard**: the four steps + starting point, legality per step,
      plot-sheet picker with track previews.
- [x] **Phase 2 — The plot sheet**: track, nodes, cast, persistent plot header,
      JSON export/import, normalization.
- [x] **Phase 3 — Oracle + beat engine**: every oracle, both bias mechanics, plot beats,
      node invocation, disruption die, journal.
- [x] **🏁 First Session Playable**: prep a game → open a scene → roll beats and oracles →
      advance the track → close the scene → read it back in the journal.
- [x] **Phase 4 — In-play systems**: scene lifecycle with summary + undo, SUM scene and
      character emulation, cast roster, timed beats, custom sheets.
- [x] **Phase 5 — Multiplayer**: *dropped at Stage B (§1.1).*
- [x] **Phase 6 — Teaching surfaces**: `explain()` everywhere, rules library, tutorial,
      guidance chapters.
- [x] **Hardening**: harnesses, accessibility, layout/stress probes, audit to a clean cycle.

---

## 7. Process rules

Template §10 in force, unchanged. In particular: this file is canonical and updates in the
same change; all rules values live in `data-*.js` and are never hardcoded in `src/`; every
shipped-file change bumps `CACHE_VERSION`; a permission the books grant is a control, never a
sentence; every flag has a setter, a reader and a clearer.

## 8. Changelog

| Date | Change | Verification | Cache |
|---|---|---|---|
| 2026-08-16 | Instantiated from template v3. Stage A extraction complete (bbox reconstruction + 300 dpi vector measurement); Stage B decisions recorded; full build of Phases 0–4 and 6. | `npm test` 930 assertions green; parse gate clean | v1 |
| 2026-08-16 | Audit cycle 1: nine findings, all fixed. F-1 proposal notes extracted and never shown (the §0 defect) → `PROPOSAL_KINDS` + `rules.proposalNote`, surfaced on the beat card. F-2 three custom-sheet Permissions with an engine and no control → the Customize dialog. F-3 `updateGame` unreachable → Edit on the Home game card. F-4 SUM section names hardcoded in `src/` → read `SUM_SECTIONS`. F-5 transient view state leaked across scopes → new `src/viewstate.js` clearer registry. F-6 dead exports and unused imports removed. F-7 the dead-data scan's own `\b$\b` bug, which I acted on before verifying. F-8 tap targets raised to 40px. F-9 two primary actions below the fold → Home pinned, Settings reordered by frequency. F-10 `viewstate.js` missing from the service-worker app shell (offline boot failure) → listed, cache bumped to v2, and a harness check added. | `npm test` · `npm run deadcode` · `npm run smoke` (304 checks) · `npm run audit` · layout probe at 320/360/390 under the stress fixture; three data guards and one layout guard each watched failing before restore | v2 |
| 2026-08-16 | Audit cycle 2, run against the cycle-1 fixes: four findings, three of them regressions the fixes introduced. F-11 the wizard hijacked every More route → it renders on Home only. F-12 illegal wizard steps were enabled and inert → disabled with a reason. F-13 `store.createGame` fired the clearers and nulled the draft mid-`finish()` → local copy taken first. F-14 track boxes 36px at 320px → min-width raised. Re-ran the full cycle afterwards with no new finding. | unit 945 · dead-data clean · smoke 304 · interaction audit 338 controls · layout probe clean at 320/360/390 under stress | v3 |
