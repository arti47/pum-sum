# Scene Unfolding Machine (SUM v8.0 Rev2)

## What SUM is
A supplement, not a standalone game. PUM says a beat happens; SUM says what the scene
contains, how the fight is shaped, what is discovered, and how the people behave.

## The Rule of Bias — the spine of every table
Every table is ordered so **lower rolls favour the protagonists** and higher rolls bring
conflict, resistance or trouble. Neutral: roll once. Expecting something favourable: roll
twice, keep the **lowest**. Expecting trouble: keep the **highest**.

This is mechanical, unlike PUM's bias rule, which hands the choice to the player. The two are
implemented differently and must never be conflated.
→ `roller.rollSum({bias})`; the bias card on the Scene tab; harness asserts keep-low returns
the minimum and keep-high the maximum.

**The row order is the rule.** Never re-sort a SUM table.

## The scene arc (Controller, p.4)
- **Scene opener** (1d20) — when you don't know how to begin.
- **Intervention check** (1d100) — when the PCs are taking too long, tension is high, danger
  is near, or silence lingers.
- **Scene closure** (1d20) — fortunately / unfortunately; how the world responds.

All three are player-fired; none is automatic. Closing summarises what changed and offers a
one-step undo.
→ `store.openScene` / `addIntervention` / `closeScene`; Scene → Scene arc, in play order.

## Scene emulation
- **Exploration** (p.5): Location features · Core challenge · Challenge conditions
- **Battle** (p.6): Terrain features · Enemy tactics · Enemy composition
- **Discovery** (p.7): Type of clue · Revealing finding · Opposition activity (d100)

## Character emulation, in four depths
Roll only the depth the scene has actually reached.
- **First contact** (p.8): Meet reaction · Outside looks · Filler talks (d100)
- **Shallow interaction** (p.9): Personality type · Recent anecdote (d100) · Job or profession
- **Trust conversation** (p.10): Opinion or answer · Honesty check · Plot contribution (d100)
- **Deep relationship** (p.11): Parallel matters · Lingering backstories (d100) · Bonding relations

→ Rolled from a cast entry, the result is stored with that person and shown on their card.
