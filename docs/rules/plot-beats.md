# Plot beats and the plot track (PUM pp.4–7, 9, 14–23, 28)

## The three play states
Roleplaying · asking the oracles · invoking a plot beat. The app gives each a surface and
takes no turn from the player.

## Two kinds of beat, both 1d10
- **Modified proposal** — you have an idea; the table twists it. Ten rows, symmetric:
  1–5 push against the PCs, 6–10 favour them. The book explains the *kinds* of
  modification (location / emotion / added element / someone arriving / intensity), and the
  app shows the explanation belonging to the face that came up.
- **Random prompt** — you don't have an idea. 1d10 on the sheet's own column, which either
  names an ABCD random event or invokes a plot node.

→ `MODIFIED_PROPOSALS`, `PROPOSAL_KINDS`, `PROPOSAL_NOTES`, `PLOT_SHEETS[].prompts`;
`roller.rollProposal` / `roller.rollPrompt`; the beat card on Play → Plot track.

## ABCD random events
A Complication (sets back the PCs' intentions) · B Catalyst (explore and immerse) ·
C Challenge (defies them; think of a reward) · D Situation (the world and factions acting).
Each is its own 1d10 — the prompt roll and the event roll are two dice.

## Prompts that invoke plot nodes
Roll a second die on that node list. A written entry comes into play. An **empty** slot means:
add something new, choose an entry that fits, or reroll. If still stuck, reroll until an
entry comes up ("leave it to destiny").
→ `roller.invokeNode`; three buttons plus the forced reroll on the beat card.

## Two lists of your own (p.27)
The plot-node **extension** sheet prints, below Notable characters and Interesting locations,
two blank lists with a rule for a name. They behave exactly like the printed categories —
ten slots, the same die rule, the same add/choose/reroll — and hold whatever this game keeps
reaching for that the four base categories do not cover.
→ `NODE_CATEGORIES[].custom`; a list exists only once named (`derived.nodeSlots` returns 0
before that), and `store.setCustomListName` names, renames or removes it. Point a face of the
Random Prompt column at it on a Customized sheet.

Sheets 26 and 27 also carry a **Game notes** area → `scope.notes`, on the plot sheet under
"This scope".

## Which die a node list uses
Roll 1d10 in lists with less than half the entries filled; otherwise 1d20 — and exactly half
is already "otherwise", so a ten-slot list switches at its fifth entry. A five-slot list
can never pass half of ten, so it always rolls 1d10.
→ `derived.nodeDie`; shown as a pill above each list.

## The plot track
Left-to-right boxes; a confirmed beat crosses the next empty one. Calling a beat
*authorises* a crossing — it does not oblige one. You may decline after a flat beat, and you
may advance without a beat when an event was exceptionally impactful.
→ `store.confirmBeat`; Confirm / Not this time on the beat card; "Advance without a beat" on
the track card.

**Track full ⇒ the scope has resolved.** This is the game's Threshold and it lives in the
persistent header.

## Timed plot beats
Mark a future box with an event you know is coming. On arrival it fires, once, and counts as
a random prompt.
→ `track.marks` / `track.fired`; the mark badge on a box; fired exactly once (harness).

## Answers that trigger beats (p.28)
Two of the cheat sheet's triggers are answers, not situations: *you ask if something happens
and PUM says YES* → a random prompt; *you ask if things occur as expected and PUM says NO* →
a modified proposal. The app cannot know which question was asked, so after any Yes/No answer
it **offers** both and fires neither until you choose.
→ `oracles.fireBeatFromOracle`; the beat is journalled with the trigger that produced it.

## Re-roll a repeated beat
You may re-roll whenever a beat repeats the last one. Flagged, never forced.

## The disruption die (variant, off by default)
A d10 alongside any oracle roll except quantifiers, Description and Focus. On a **1** a random
prompt interrupts; on a **2** a modified proposal alters the scene. In a volatile situation
the proposal range widens to 2–5, but **1 is always the only face for a prompt**.
→ `DISRUPTION`; `roller.maybeDisrupt`; the disruption strip on the oracle result card.

## The eleven plot sheets
Each is a pacing decision. Track lengths are measured from the printed sheets:
Standard 11 (3/5/3) · Journey 20 (3/7/4/3/3) · Story-focus 20, nodes only ·
Scenes 10 (one per scene) · Dungeon 7 (one per room) · Exploration 11 (1/3/3/3/1) ·
Story-parts 5 · Improvised 0, no nodes · Sandbox 0, nodes supported · Customized 0+.
