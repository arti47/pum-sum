// Generates the committed seed fixtures (§11.1 D) so every harness and probe
// measures the same state. Re-run after any schema change; commit the output.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: (await import("node:crypto")).webcrypto, configurable: true,
  });
}
globalThis.localStorage = {
  _v: {},
  getItem(k) { return this._v[k] || null; },
  setItem(k, v) { this._v[k] = String(v); },
  removeItem(k) { delete this._v[k]; },
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const store = await import("../src/store.js");
const roller = await import("../src/roller.js");
const { SUM_TABLES } = await import("../data-sum.js");

function reset() { store.resetAll(); }

// --- mid-session: one game, a scene running, some track, a small journal ----
reset();
store.createGame({
  title: "The Neverwinter road",
  universe: "D&D 5e",
  tone: "Grim frontier fantasy, low magic",
  scopeName: "Find out who burned the caravan",
  mission: "The caravan burned on the Triboar Trail. Somebody paid for it.",
  startingPoint: "In medias res: the wagons are still smoking and the survivors are arguing.",
  sheetId: "standard",
  protagonists: [
    { id: "pc1", name: "Vera Ashfield", notes: "Half-elf scout, owes the caravan master a favour" },
    { id: "pc2", name: "Brother Kell", notes: "Field cleric, keeps a ledger of the dead" },
  ],
  nodes: {
    world: ["Bandit remnants of the King's army", "Winter closing the northern passes", "", "", ""],
    problems: ["The FBI of the Lords' Alliance shows up", "Wolves following the blood trail", "", "", ""],
    findings: ["A ledger page with a seal", "The caravan master's signet", "", "", ""],
    questions: ["Who paid the bandits?", "Where is Jorn's body?", "", "", ""],
  },
});
store.openScene("Describe the current location, what characters see");
store.addIntervention("Something breaks, fails, or is damaged around here");
store.confirmBeat({ label: "Handle a plot potential problem" });
store.confirmBeat({ label: "Face plot unrelated opposition" });
store.setMark(6, "The passes close for the winter");
store.addCast("character", "Gard the tavern keeper", "Knows everyone on the trail");
store.addCastTrait(store.activeGame().cast[0].id, {
  table: "personality-type", label: "Personality type",
  text: "Practical, down-to-earth, but can be pessimistic", roll: 16,
});
store.addCast("location", "The Triboar Trail", "Three days of open road, no cover");
for (let i = 0; i < 14; i++) {
  roller.journalRoll(roller.rollProposal(), { kind: "beat", title: "Modified proposal" });
}
store.addJournal({ kind: "note", title: "", detail: "Vera wants to backtrack to the ford before dark." });
writeFileSync(join(root, "tests/fixtures/mid-session.json"), JSON.stringify(store.getState(), null, 2));

// --- stress: what a table actually has by session three --------------------
reset();
store.createGame({
  title: "The long winter",
  universe: "Homebrew — a drowned city",
  tone: "Cold, political, slowly flooding. Everyone is negotiating with someone.",
  scopeName: "Keep the eastern district above water until the thaw",
  mission: "Three factions, one failing pump station, and a council that will not meet.",
  startingPoint: "The pump stalls at dawn and nobody who can fix it will answer the door.",
  sheetId: "journey",
  protagonists: [
    { id: "p1", name: "Idris Ferran", notes: "Water engineer, disbarred" },
    { id: "p2", name: "Sable", notes: "Runner for the guild, owes everybody" },
    { id: "p3", name: "Councillor Wen", notes: "Playing both sides and losing" },
    { id: "p4", name: "Old Marek", notes: "Knows how the pumps were really built" },
  ],
  nodes: {
    world: ["The tide table nobody trusts", "Pump station 4 running at half", "Guild curfew",
            "The old aqueduct under the market", "Salt rot in the timber",
            "A winter that will not break", "Ferry tolls tripled", "", "", ""],
    problems: ["Guild enforcers on the eastern span", "The council's auditor", "A sinkhole under Rowan Street",
               "Sable's creditor", "Rot in the pump housing", "A rival engineer", "", "", "", ""],
    findings: ["The original pump schematics", "A key to the aqueduct grate", "Marek's notebook",
               "A guild seal", "Dry powder for the charges", "", "", "", "", ""],
    questions: ["Who ordered the curfew?", "Is Wen taking guild money?", "What is under the market?",
                "Can the pump be saved at all?", "Where did Marek's apprentice go?", "", "", "", "", ""],
    characters: ["Councillor Wen", "Old Marek", "The auditor, Halle", "Sable's creditor, Bryn",
                 "Guild captain Oro", "", "", "", "", ""],
    locations: ["Pump station 4", "The eastern span", "The drowned market", "The council hall",
                "The aqueduct grate", "", "", "", "", ""],
  },
});
const game = store.activeGame();
// several scopes, one of them finished
store.addScope({ name: "Get Marek to talk", sheetId: "scenes", mission: "He will not open the door." });
for (let i = 0; i < 10; i++) store.confirmBeat({ label: "beat " + i });
store.addScope({ name: "The aqueduct run", sheetId: "dungeon", mission: "Under the market, in the dark." });
for (let i = 0; i < 3; i++) store.confirmBeat({ label: "room " + i });
store.setActiveScope(game.scopes[0].id);
for (let i = 0; i < 9; i++) store.confirmBeat({ label: "beat " + i });
store.setMark(14, "The thaw begins early");
store.setMark(17, "The council finally meets");
store.openScene("Explain what is going on, the activity in the area");
for (let i = 0; i < 4; i++) store.addIntervention("Something bad happens, misfortune, of concern");

// a full cast, each carrying rolled traits
const people = ["Councillor Wen", "Old Marek", "Halle the auditor", "Bryn", "Captain Oro",
                "The ferryman", "Sable's sister", "The dockside surgeon"];
for (const name of people) {
  const c = store.addCast("character", name, "Met on the eastern span.");
  for (const id of ["meet-reaction", "personality-type", "plot-contribution"]) {
    const r = roller.rollSum({ tableId: id, bias: "none" });
    const t = SUM_TABLES.find((x) => x.id === id);
    store.addCastTrait(c.id, { table: id, label: t.name, text: r.answer, roll: r.kept });
  }
}
for (const place of ["Pump station 4", "The drowned market", "The council hall", "The eastern span",
                     "The aqueduct grate", "Rowan Street"]) {
  store.addCast("location", place, "");
}

// a full journal — what a table has after three sessions
for (let i = 0; i < 160; i++) {
  const kind = i % 4;
  if (kind === 0) roller.journalRoll(roller.rollProposal(), { kind: "beat", title: "Modified proposal" });
  else if (kind === 1) roller.journalRoll(roller.rollYesNo({ register: "subjective" }), { kind: "yesno", title: "Yes/No" });
  else if (kind === 2) roller.journalRoll(roller.rollOracle({ oracleId: "reason" }), { kind: "oracle", title: "Reason (why)" });
  else roller.journalRoll(roller.rollSum({ tableId: "intervention", bias: "high" }), { kind: "sum", title: "Intervention check" });
  if (i % 17 === 0) {
    store.addJournal({
      kind: "note", title: "",
      detail: "A long note of the kind a solo player actually writes at the table, several lines of it, because the journal is where the story really lives and it is not going to be one tidy sentence.",
    });
  }
}
writeFileSync(join(root, "tests/fixtures/stress.json"), JSON.stringify(store.getState(), null, 2));

// --- fresh -----------------------------------------------------------------
reset();
writeFileSync(join(root, "tests/fixtures/fresh.json"), JSON.stringify(store.getState(), null, 2));

console.log("Fixtures written: fresh, mid-session, stress.");
