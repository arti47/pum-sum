# Game Unfolding Machine (GUM v2.2)

## What GUM is
A **Gamemaster supplement**, not a system: it helps set games up and build worlds by
generating elements from scratch or on the fly. It is designed to work alongside PUM and SUM
but complements any system.

The division of labour the book states outright: **use GUM when setting a game up, and SUM
while playing it.** GUM creates a character as a concept; SUM decides how they behave when you
meet them. PUM uses plot nodes — and GUM is what fills them.

## The method: combination
"The key strength of GUM is its ability to combine multiple tables for a single subject, or
roll multiple times within one table." The tables are abstract by design and tied to no
setting, so the result is whatever your interpretation makes of it.
→ Every Forge screen rolls a **set** as its main action; single tables are available beside it.

## The four sections

**Game seeding (pp.4–7)** — where a game comes from.
- *World truths*: Location archetype (d20) · Background problem (d20)
- *Plot seed*: Plot hook · Motivation · The mission · Initial lead · Caveat · The opposition
  (six d20s, rolled together in the book's order)

**World generator (pp.8–13)** — 18 d20 tables in six subjects:
Faction (focus, resources, society, beliefs, politics) · Location (feature, purpose, worth,
content) · Object (function, state, form) · Nemesis (past deeds, impression, intentions) ·
Creature (type, behavior, ability)

**Character builder (pp.14–21)** — 14 tables:
eight d20s (edge, flaw, weapon, possessions, past, activity, impression, intentions) plus six
d100s (two archetype lists of 100, good and evil purposes, good and evil deeds)

**Grand oracle (pp.22–24)** — Action · Adjective · Subject, three d100s, for when nothing
more specific fits.

## No bias rule of its own
Unlike SUM, GUM's tables carry no low-favours-the-protagonists ordering and no keep-low /
keep-high rule. They are plain 1..N lists. The app rolls them straight and never applies a
bias to them.

## Where GUM appears in this app
- The **Forge** tab: all 43 tables, grouped by the book's own subjects, rollable singly or as
  a set, with the whole table readable beneath each group.
- **Every empty plot-node slot** offers a "Roll from GUM" pointed at the tables that suit that
  category (`GUM_FOR_NODES`), and what you keep is written into the slot.
- **The cast**: generate a character or a location, then name them.
- **The wizard's scope step**: seed the mission from a whole plot seed.
- Whatever is rolled is journalled; "Keep it →" writes it into a node, the cast, or the journal.

## Erratum
**G1 (p.21):** "Evil intentions or deeds" prints *Vandalism and destruction* twice, at 17 and
at 22. Kept as printed so the app's odds match the book's; surfaced in the rules library.

## Three words beside a blank GUM can serve
Most text fields can ask GUM for three words. The tables are chosen by what the
field is *for* — `GUM_FOR_FIELDS`, 29 fields, falling back to the grand oracle for anything
unmapped, because that is what the grand oracle is for. A field with more than three tables
rotates through them on a re-roll; a field with fewer rolls repeatedly within the ones it has,
which the book names as its own method. "All N tables" rolls the whole mapped set at once.

**Shape decides whether a field is offered at all.** Every GUM row is a descriptive phrase
about fiction — "Humid: wilderness, jungle, raining", "Naturally draws others in". That is the
right shape for a piece of story and the wrong shape for a proper name ("Vera") or a
real-world answer ("D&D 5e"). Eight fields therefore offer nothing and say why in
`INSPIRE_ABSENT`, surfaced as *Rules → Where the app does not roll*. A table pointed at the
wrong question reads as noise, which is worse than an honest empty hand — the same call ruling
A8 makes about the absent safety tools.

Where a name and a description sit in one dialog, the roll feeds the **description**: GUM
builds a character as a concept, and a concept does not belong in a Name box.

Words **append**; they never replace what you already wrote. Nothing rolls until the block is
opened, and only a word you keep reaches the journal — so the Dice view counts the dice you
used, and says so.
→ `forge.inspireTables` / `inspireFor`; `ui.registerInspire` / `inspireBlock`; a collapsed
"Stuck? Roll three words" line in every text dialog and beside every inline field.
