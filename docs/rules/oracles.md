# Oracles (PUM pp.8, 12–13, 24)

Distilled reference. The audit reads each sentence and asks: *where does this happen in code?*

## What oracles are for
Two moments only: when you genuinely don't know, and when you'd rather not decide.
Avoid rolling if you already have a strong bias, or if some outcome would get you stuck.
→ `explain()` on the Oracles screen; rules-library entry `oracle-restraint` (guidance only).

## Yes or No — 1d10
Three registers: **Deterministic** (objective, asking the universe), **Subjective** (a
character's own view, may answer "don't know"), **Conversation** (an NPC replying in
dialogue).
→ `YES_NO` in `data-pum-oracles.js`; `roller.rollYesNo`; Oracles → Yes or No.

**Bias.** "If you have a bias, roll twice and pick the result that best fits your judgment."
This is the player's choice, not the machine's.
→ `rollYesNo({bias:true})` returns both options with `needsChoice:true`; the UI shows two
chips and commits nothing until one is tapped. Test: `bias returns both, commits neither`.

## Other questions — 1d10 + 1d100
Descriptive oracles (Someone/Place/Object/Hazard/Mood/Notice) are enriched with a
**Description** word; story oracles (Discovery/Problem/Intent/Activity/Reason/Explain) with a
**Focus** word.
→ `roller.rollOracle` picks the enrichment table from the oracle's family. Quantifiers are
never enriched.

## Quantifiers — 1d10
How many / how good / how hard, answered relative to a baseline the player sets first.
Four of ten faces are "as expected".
→ `QUANTIFIERS`; asserted in the harness.

## Granular Yes or No — 1d100 (variant)
Declare a likelihood — no way, hardly, unlikely, neutral, likely, surely, certain — and roll
d100 against that column. Each column tiles 1–100 exactly.
→ `GRANULAR`; `rules.granularLookup`; harness asserts every column tiles with no gap.

## Interpreting
Answers are not to be taken to heart. Re-roll, ignore, or read them against the grain.
→ Re-roll on every result card, journalled and linked to the roll it replaced.
