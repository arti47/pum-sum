// The Play tab: the plot track, the beat controls, and the plot nodes.
// This is the app's character sheet — the surface a player looks at most.

import { el, add, announce, fmtRange } from "./core.js";
import {
  explain, actionBar, modal, closeModal, toast, confirmModal, promptModal,
  resultCard, emptyState,
} from "./ui.js";
import * as store from "./store.js";
import {
  sectionsOf, crossed, trackLength, hasTrack, isResolved, currentSection,
  nodeList, nodeDie, nodeFill, nodeSlots, slotRange,
} from "./derived.js";
import { plotSheet, nodeCategory, sectionOfBox, proposalNote, abcd } from "./rules.js";
import { rollProposal, rollPrompt, invokeNode, journalRoll, diceText } from "./roller.js";
import { sectionNav, go, render } from "./router.js";
import { openRule } from "./screens.js";
import { NODE_CATEGORIES, PROMPT_NOTES } from "../data-pum-plot.js";
import { BEAT_TRIGGERS } from "../data-guidance.js";
import { renderCast } from "./cast.js";
import { registerClearer } from "./viewstate.js";

// The beat currently on the table, if any. Held in module state so a re-render
// never re-rolls it (§5.1: roll once, store it, render from the stored value).
let openBeat = null;

function clearOpenBeat() { openBeat = null; }
registerClearer(clearOpenBeat);

// The disruption cascade hands a beat over from the Oracles tab (PUM p.9).
export function setOpenBeat(beat) { openBeat = beat; }

export function renderPlay(host, section) {
  const game = store.activeGame();
  if (!game) {
    add(host, emptyState(
      "No game yet",
      "PUM starts with a little preparation: a universe, a plot scope, your protagonists, and a plot sheet.",
      { label: "Prepare a game", onClick: () => go("more", "home") }
    ));
    return;
  }
  const scope = store.currentScope();
  add(host, sectionNav("play", section, {
    track: !!openBeat || isResolved(scope),
  }));

  if (section === "nodes") return renderNodes(host, scope);
  if (section === "cast") return renderCast(host);
  return renderTrack(host, scope);
}

// ---------------------------------------------------------------------------
// Plot track + beat controls
// ---------------------------------------------------------------------------
function renderTrack(host, scope) {
  const sheet = plotSheet(scope.sheetId);
  add(host, el("h1", { text: scope.name }));
  add(host, el("p", { class: "lede", text: sheet ? `${sheet.name} · ${sheet.tagline}` : "" }));
  add(host, explain([
    "This is your plot sheet. Call a beat when a moment might matter: a modified proposal if you know roughly what happens next, a random prompt if you don't.",
    "Play the answer out first. Only cross a box once the outcome turned out to be relevant — the app never crosses one for you.",
  ], "confirm", openRule));

  if (scope.mission) {
    add(host, el("div", { class: "card" },
      el("div", { class: "card-head" }, el("h3", { text: "Mission" })),
      el("p", { text: scope.mission })
    ));
  }

  // The next step is named until the scope has a starting point (§6.3.7).
  if (!scope.startingPoint) {
    add(host, el("div", { class: "card" },
      el("h3", { text: "Next step: decide the starting point" }),
      el("p", { class: "muted", text: "PUM asks you to decide where the game opens and what is introduced there. Consider starting in medias res — a battle, a shocking event — so the characters must act immediately." }),
      el("button", {
        class: "btn primary wide",
        onclick: () => promptModal({
          title: "Starting point",
          label: "Where does this open, and what is introduced?",
          multiline: true,
          value: scope.startingPoint,
          onSubmit: (v) => {
            store.updateScope({ startingPoint: v });
            store.addJournal({ kind: "prep", title: "Starting point set", detail: v });
            render();
          },
        }),
      }, "Write the starting point")
    ));
  }

  add(host, trackCard(scope));
  add(host, openBeat ? beatCard(scope) : beatChooser(scope));
  add(host, triggersCard());

  // The primary action stays above the fold, pinned, carrying its context (§6.3.2).
  if (!openBeat) {
    actionBar({
      label: "Random prompt",
      context: hasTrack(scope)
        ? `${crossed(scope)}/${trackLength(scope)} · ${currentSection(scope) ? currentSection(scope).name : ""}`
        : (sheet ? sheet.name : ""),
      secondary: { label: "Proposal", onClick: () => doProposal(scope) },
      onClick: () => doPrompt(scope),
    });
  }
}

function trackCard(scope) {
  const card = el("div", { class: "card" });
  const sections = sectionsOf(scope);
  const sheet = plotSheet(scope.sheetId);
  const done = crossed(scope);
  const total = trackLength(scope);

  add(card, el("div", { class: "card-head" },
    el("h2", { text: "Plot track" }),
    el("span", { class: "cite", text: total ? `${done}/${total}` : "no track" })
  ));

  if (!total) {
    add(card, el("p", { class: "muted", text: sheet && sheet.customizable
      ? "This sheet starts with no track. Add sections as the story finds its shape, or pre-draw them now."
      : "This sheet has no plot track — play beats freely and let the story end when you say it ends." }));
    if (sheet && sheet.customizable) {
      add(card, el("button", { class: "btn wide", onclick: () => addSectionDialog() }, "Add a track section"));
    }
    return card;
  }

  const track = el("div", { class: "track" });
  let index = 0;
  for (const sec of sections) {
    const isCurrent = done < total && sectionOfBox(sections, done).section === sec;
    const secEl = el("div", { class: `track-sec ${isCurrent ? "current" : ""}`.trim() },
      el("div", { class: "track-sec-name", text: sec.name })
    );
    const boxes = el("div", { class: "track-boxes" });
    for (let i = 0; i < sec.boxes; i++) {
      const at = index++;
      const isDone = at < done;
      const isNext = at === done;
      const mark = scope.track.marks[String(at)];
      add(boxes, el("button", {
        class: ["track-box", isDone ? "crossed" : "", isNext ? "next" : "", mark ? "marked" : ""]
          .filter(Boolean).join(" "),
        "aria-label": `Box ${at + 1}${isDone ? ", crossed" : ""}${mark ? ", timed beat: " + mark : ""}`,
        onclick: () => boxDialog(at, isDone, mark),
      }, isDone ? "✕" : String(at + 1)));
    }
    add(secEl, boxes);
    add(track, secEl);
  }
  add(card, track);

  if (isResolved(scope)) {
    add(card, el("p", { class: "muted" },
      el("strong", { text: "This scope has resolved. " }),
      "The track is full — bring the thread to its end, then start a new plot sheet for what comes next."
    ));
    add(card, el("button", { class: "btn wide", onclick: () => go("more", "home") }, "Start another plot sheet"));
  }

  // Permission: advance without a beat (PUM p.9). A control, not a sentence.
  const row = el("div", { class: "btn-row" });
  add(row, el("button", {
    class: "btn small", disabled: done >= total || undefined,
    onclick: () => voluntaryAdvance(),
  }, "Advance without a beat"));
  add(row, el("button", {
    class: "btn small", disabled: done === 0 || undefined,
    onclick: () => { store.uncrossBox(); toast("Stepped the track back."); render(); },
  }, "Step back"));
  if (sheet && sheet.customizable) {
    add(row, el("button", { class: "btn small", onclick: () => customizeDialog(scope) }, "Customize"));
  }
  add(card, row);
  return card;
}

// The Customized sheet's own permissions (PUM p.9): grow the track as you play,
// and fill the Random Prompt column with a list of your own.
function customizeDialog(scope) {
  const sections = sectionsOf(scope);
  const body = el("div");
  add(body, el("p", { class: "muted", text: "Pre-design the track to match an expected structure, or build it up as you go from what actually happens." }));

  if (sections.length) {
    const list = el("div", { class: "card" });
    add(list, el("h3", { text: "Sections" }));
    sections.forEach((sec, i) => {
      add(list, el("div", { class: "node-row" },
        el("span", { class: "node-txt", text: `${sec.name} — ${sec.boxes} box${sec.boxes === 1 ? "" : "es"}` }),
        el("button", {
          class: "btn small", "aria-label": `Add a box to ${sec.name}`,
          onclick: () => { store.addTrackBox(i); closeModal(); customizeDialog(store.currentScope()); render(); },
        }, "+ box"),
        el("button", {
          class: "btn small ghost", "aria-label": `Remove ${sec.name}`,
          onclick: () => {
            closeModal();
            confirmModal({
              title: `Remove "${sec.name}"?`,
              message: `Its ${sec.boxes} box${sec.boxes === 1 ? "" : "es"} go with it, and the track steps back if you had crossed past them.`,
              confirmLabel: "Remove", danger: true,
              onConfirm: () => { store.removeTrackSection(i); render(); },
            });
          },
        }, "Remove")
      ));
    });
    add(body, list);
  }

  modal({
    title: "Customize this sheet",
    body,
    actions: [
      { label: "Add a section", primary: true, onClick: () => { closeModal(); addSectionDialog(); return true; } },
      { label: "Edit the prompt column", onClick: () => { closeModal(); promptColumnDialog(scope); return true; } },
      { label: "Done" },
    ],
  });
}

function promptColumnDialog(scope) {
  const sheet = plotSheet(scope.sheetId);
  const current = scope.customPrompts || sheet.prompts;
  const rows = [];
  const body = el("div");
  add(body, el("p", { class: "muted", text: "Ten entries, one per d10 face. A social game wants more characters; an action game wants more challenges. Pick what each face reaches." }));

  const OPTIONS = [
    ["A", "Complication (A)"], ["B", "Catalyst (B)"], ["C", "Challenge (C)"], ["D", "Situation (D)"],
  ];
  for (let i = 0; i < 10; i++) {
    const sel = el("select", { "aria-label": `Face ${i + 1}` });
    for (const [letter, label] of OPTIONS) {
      add(sel, el("option", { value: "event:" + letter }, label));
    }
    for (const cat of NODE_CATEGORIES) {
      add(sel, el("option", { value: "node:" + cat.id }, cat.name));
    }
    const cur = current[i];
    sel.value = cur ? (cur.event ? "event:" + cur.event : "node:" + cur.node) : "event:A";
    rows.push(sel);
    add(body, el("div", { class: "node-row" },
      el("span", { class: "node-idx", text: String(i + 1) }),
      sel
    ));
  }

  modal({
    title: "Your prompt column",
    body,
    actions: [
      {
        label: "Save the column", primary: true,
        onClick: () => {
          const column = rows.map((sel) => {
            const [kind, id] = sel.value.split(":");
            if (kind === "event") {
              const t = abcdLabel(id);
              return { label: t, event: id };
            }
            const cat = nodeCategory(id);
            return { label: cat ? cat.name : id, node: id };
          });
          store.setCustomPrompts(column);
          toast("Column saved — that is what the app will roll.");
          render();
        },
      },
      {
        label: "Reset to the standard column",
        onClick: () => { store.setCustomPrompts(null); toast("Back to the printed column."); render(); },
      },
      { label: "Cancel" },
    ],
  });
}

function abcdLabel(letter) {
  const t = abcd(letter);
  return t ? `${t.name} (${letter})` : letter;
}

function boxDialog(index, isDone, mark) {
  const scope = store.currentScope();
  modal({
    title: `Box ${index + 1}`,
    body: el("div", null,
      el("p", { class: "muted", text: isDone ? "This box is crossed." : "This box is still empty." }),
      mark ? el("p", null, el("strong", { text: "Timed beat: " }), mark) : null,
      el("p", { class: "muted", text: "Mark a box with an event you know is coming. When play reaches it, the event unfolds and counts as a random prompt." })
    ),
    actions: [
      {
        label: mark ? "Edit the timed beat" : "Mark a timed beat", primary: true,
        onClick: () => {
          closeModal();
          promptModal({
            title: "Timed plot beat",
            label: "What is waiting at this box?",
            value: mark || "",
            hint: "A zombie horde, a siege, a power awakening. You still won't know the circumstances.",
            onSubmit: (v) => { store.setMark(index, v); render(); },
          });
          return true;
        },
      },
      mark ? {
        label: "Clear the mark",
        onClick: () => { store.setMark(index, ""); render(); },
      } : null,
      { label: "Close" },
    ].filter(Boolean),
  });
}

function addSectionDialog() {
  const name = el("input", { type: "text", placeholder: "Part 1" });
  const boxes = el("input", { type: "number", value: "3", min: "1", max: "20" });
  modal({
    title: "Add a track section",
    body: el("div", null,
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Section name" }), name),
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Boxes" }), boxes),
      el("p", { class: "muted", text: "More boxes means more beats — and more of the universe pushing back before this thread resolves." })
    ),
    actions: [
      {
        label: "Add", primary: true,
        onClick: () => {
          store.addTrackSection(name.value.trim(), parseInt(boxes.value, 10) || 1);
          render();
        },
      },
      { label: "Cancel" },
    ],
  });
}

function voluntaryAdvance() {
  confirmModal({
    title: "Advance without a beat",
    message: "PUM allows this when an event is exceptionally impactful. It is recommended that such moments be combined with a beat's randomness — but from time to time this is fine.",
    confirmLabel: "Cross the next box",
    onConfirm: () => {
      const out = store.confirmBeat({ voluntary: true });
      reportAdvance(out, "Advanced without a beat");
    },
  });
}

function reportAdvance(out, title) {
  if (!out) return;
  store.addJournal({
    kind: "track", title,
    detail: `Track ${out.crossed}/${out.total}${out.resolved ? " — the scope resolved" : ""}`,
  });
  announce(`Track ${out.crossed} of ${out.total}`);
  if (out.mark) {
    // A timed beat fires on arrival, once (PUM p.9).
    modal({
      title: "A timed plot beat fires",
      body: el("div", null,
        el("p", null, el("strong", { text: out.mark })),
        el("p", { class: "muted", text: "You marked this box for an event you knew was coming. It counts as a random prompt. You still don't know the circumstances, so it may yet surprise you." })
      ),
      actions: [{ label: "Play it", primary: true, onClick: () => render() }],
    });
    store.addJournal({ kind: "timed", title: "Timed plot beat", detail: out.mark });
  } else if (out.resolved) {
    modal({
      title: "The scope has resolved",
      body: el("p", { text: "The track is full. Bring this thread to its end — then start a new plot sheet for whatever comes next." }),
      actions: [
        { label: "Start another plot sheet", primary: true, onClick: () => go("more", "home") },
        { label: "Stay here" },
      ],
    });
  } else {
    toast(`Track ${out.crossed}/${out.total}`);
  }
  render();
}

// --- beats -----------------------------------------------------------------
function beatChooser(scope) {
  const card = el("div", { class: "card" });
  add(card, el("div", { class: "card-head" }, el("h2", { text: "Call a plot beat" })));
  add(card, el("p", { class: "muted", text: "A proposal twists an idea you already have. A prompt tells you what happens when you don't." }));
  add(card, el("div", { class: "btn-row" },
    el("button", { class: "btn primary", onclick: () => doProposal(scope) }, "Modified proposal"),
    el("button", { class: "btn primary", onclick: () => doPrompt(scope) }, "Random prompt")
  ));
  if (scope.lastBeat) {
    add(card, el("p", { class: "cite", text: `Last beat: ${scope.lastBeat.text}` }));
  }
  return card;
}

function doProposal(scope) {
  const r = rollProposal();
  openBeat = { ...r, journalId: null };
  const entry = journalRoll(r, {
    kind: "beat", title: `Modified proposal — ${r.text}`, detail: diceText(r.dice),
  });
  openBeat.journalId = entry.id;
  store.setLastBeat({ key: r.key, text: r.text, open: true });
  announce(`Modified proposal: ${r.text}`);
  render();
}

function doPrompt(scope, opts = {}) {
  const r = rollPrompt(scope, opts);
  openBeat = { ...r, journalId: null };
  const detailBits = [r.text];
  if (r.event) detailBits.push(`${r.event.name} ${r.event.roll}: ${r.event.text}`);
  if (r.node && r.node.text) detailBits.push(`Node: ${r.node.text}`);
  if (r.node && r.node.empty) detailBits.push("Node slot empty — add, choose, or reroll");
  const entry = journalRoll(r, {
    kind: "beat", title: `Random prompt — ${r.text}`, detail: detailBits.join(" · "),
  });
  openBeat.journalId = entry.id;
  store.setLastBeat({ key: r.key, text: r.text, open: true });
  announce(`Random prompt: ${r.text}`);
  render();
}

function beatCard(scope) {
  const b = openBeat;
  const isProposal = b.beatType === "proposal";
  const extra = el("div");

  if (b.event) {
    add(extra, el("div", { class: "strip" },
      el("div", { class: "strip-k", text: `${b.event.letter} · ${b.event.name} — rolled ${b.event.roll}` }),
      el("div", { text: b.event.text }),
      el("div", { class: "muted", text: b.event.blurb })
    ));
  }

  if (b.node) add(extra, nodeBlock(scope, b));

  if (b.repeat) {
    // Permission: re-roll a repeat. Flagged, never forced (PUM p.9).
    add(extra, el("div", { class: "strip" },
      el("div", { class: "strip-k", text: "Same as last time" }),
      el("div", { text: "You may re-roll a repeated beat to promote variety — or keep it, if a repeat is exactly right." }),
      el("button", {
        class: "btn small", onclick: () => isProposal ? doProposal(scope) : doPrompt(scope),
      }, "Re-roll the beat")
    ));
  }

  const actions = [];
  if (hasTrack(scope) && !isResolved(scope)) {
    actions.push({
      label: "Confirm — cross a box", primary: true,
      onClick: () => {
        const out = store.confirmBeat({ label: b.text });
        openBeat = null;
        store.setLastBeat({ key: b.key, text: b.text, open: false });
        reportAdvance(out, `Beat confirmed — ${b.text}`);
      },
    });
  }
  actions.push({
    label: hasTrack(scope) ? "Not this time" : "Played it",
    onClick: () => {
      openBeat = null;
      store.setLastBeat({ key: b.key, text: b.text, open: false });
      store.addJournal({
        kind: "beat", title: "Beat played, track unchanged", detail: b.text, linkedTo: b.journalId,
      });
      toast(hasTrack(scope) ? "The track stays where it is." : "Noted in the journal.");
      render();
    },
  });
  actions.push({
    label: "Re-roll",
    onClick: () => isProposal ? doProposal(scope) : doPrompt(scope),
  });
  actions.push({
    label: "Add a note",
    onClick: () => promptModal({
      title: "Note this beat",
      label: "What happened?",
      multiline: true,
      onSubmit: (v) => { if (v) store.updateJournal(b.journalId, { note: v }); toast("Noted."); },
    }),
  });

  return resultCard({
    kind: isProposal ? "Modified proposal" : "Random prompt",
    answer: b.text,
    second: isProposal
      ? proposalNote(b.roll)
      : (b.prompt && b.prompt.node ? PROMPT_NOTES[b.prompt.node] : null),
    dice: b.dice,
    extra,
    actions,
  });
}

// The node line on a beat card: the three Permissions, as three buttons.
function nodeBlock(scope, beat) {
  const n = beat.node;
  const cat = nodeCategory(n.categoryId);
  const wrap = el("div", { class: "strip" });
  add(wrap, el("div", { class: "strip-k", text: `${cat ? cat.name : n.categoryId}${n.die ? ` — 1d${n.die}` : ""}` }));

  if (n.unavailable) {
    add(wrap, el("div", { text: "This sheet carries no plot nodes. Read the prompt as a free invitation, or switch to a sheet that does." }));
    return wrap;
  }

  if (!n.empty) {
    add(wrap, el("div", null, el("strong", { text: n.text })));
    if (n.chosen) add(wrap, el("div", { class: "cite", text: "Chosen deliberately — no die rolled" }));
    else add(wrap, el("div", { class: "cite", text: `Rolled ${n.rolls[n.rolls.length - 1]} → slot ${n.slot + 1}${n.forced ? " (left to destiny)" : ""}` }));
    return wrap;
  }

  add(wrap, el("div", { text: "Add new, choose, or reroll." }));
  add(wrap, el("div", { class: "cite", text: `Rolled ${n.rolls[n.rolls.length - 1]} → empty slot ${n.slot + 1}` }));
  const row = el("div", { class: "btn-row" });
  add(row, el("button", {
    class: "btn small primary",
    onclick: () => promptModal({
      title: "Add a new plot node",
      label: cat ? cat.name : "New node",
      hint: "Something new or unexpected at this point. It becomes a permanent entry in this list.",
      onSubmit: (v) => {
        if (!v) return;
        const slots = nodeSlots(scope, n.categoryId);
        const at = store.writeNodeToFirstEmpty(n.categoryId, v, slots);
        openBeat.node = { ...n, text: v, empty: false, slot: at >= 0 ? at : n.slot };
        store.addJournal({ kind: "node", title: "Plot node invented", detail: `${cat ? cat.name : ""}: ${v}`, linkedTo: beat.journalId });
        render();
      },
    }),
  }, "Add new"));
  add(row, el("button", {
    class: "btn small", onclick: () => chooseNodeDialog(scope, n, beat),
  }, "Choose"));
  add(row, el("button", {
    class: "btn small",
    onclick: () => {
      openBeat.node = invokeNode(scope, n.categoryId);
      render();
    },
  }, "Reroll"));
  // The Compulsion: reroll until an entry comes up (PUM p.6).
  add(row, el("button", {
    class: "btn small",
    onclick: () => {
      const forced = invokeNode(scope, n.categoryId, { force: true });
      if (forced.empty) { toast("This list is still empty — write a node first."); return; }
      openBeat.node = forced;
      render();
    },
  }, "Leave it to destiny"));
  add(wrap, row);
  return wrap;
}

function chooseNodeDialog(scope, n, beat) {
  const cat = nodeCategory(n.categoryId);
  const list = nodeList(scope, n.categoryId);
  const body = el("div");
  const written = list.map((t, i) => ({ t, i })).filter((x) => x.t && x.t.trim());
  if (!written.length) {
    add(body, el("p", { class: "muted", text: "Nothing is written in this list yet. Add a new node instead." }));
  }
  for (const { t, i } of written) {
    add(body, el("button", {
      class: "btn wide", onclick: () => {
        closeModal();
        openBeat.node = invokeNode(scope, n.categoryId, { chosen: i });
        store.addJournal({ kind: "node", title: "Plot node chosen", detail: t, linkedTo: beat.journalId });
        render();
      },
    }, t));
  }
  modal({ title: `Choose from ${cat ? cat.name : "the list"}`, body, actions: [{ label: "Cancel" }] });
}

function triggersCard() {
  const card = el("div", { class: "card" });
  add(card, el("h3", { text: "When to call which" }));
  for (const key of ["proposal", "prompt"]) {
    const t = BEAT_TRIGGERS[key];
    const d = el("details", { class: "acc" }, el("summary", null, t.name));
    const ul = el("ul");
    for (const item of t.items) add(ul, el("li", { text: item }));
    add(d, el("div", { class: "acc-body" }, ul));
    add(card, d);
  }
  add(card, el("p", { class: "cite", text: "PUM p.28" }));
  return card;
}

// ---------------------------------------------------------------------------
// Plot nodes
// ---------------------------------------------------------------------------
function renderNodes(host, scope) {
  const sheet = plotSheet(scope.sheetId);
  add(host, el("h1", { text: "Plot nodes" }));
  add(host, explain([
    "Plot nodes are your game's own content — the things a random prompt can reach into. Write them at the start and keep them alive as you play.",
    "The die above each list is the one the app will roll: 1d10 while a list is less than half full, 1d20 after that.",
  ], "nodes", openRule));

  if (!sheet || sheet.nodeSlots === 0) {
    add(host, emptyState(
      "This sheet has no plot nodes",
      `${sheet ? sheet.name : "This sheet"} plays lightweight: its prompt column reaches only the random events. Switch to another sheet if you want nodes.`,
      { label: "Back to the track", onClick: () => go("play", "track") }
    ));
    return;
  }

  for (const cat of NODE_CATEGORIES) {
    const slots = nodeSlots(scope, cat.id);
    if (slots === 0) continue;
    if (cat.expanded && !sheet.expandedNodes) continue;
    add(host, nodeCard(scope, cat, slots));
  }
}

function nodeCard(scope, cat, slots) {
  const card = el("div", { class: "card" });
  const list = nodeList(scope, cat.id);
  const fill = nodeFill(scope, cat.id);
  const dieSize = nodeDie(scope, cat.id);

  add(card, el("div", { class: "card-head" },
    el("h3", { text: cat.name }),
    el("span", { class: "pill on", text: `1d${dieSize}` }),
    el("span", { class: "cite", text: `${fill}/${slots}` })
  ));

  const d = el("details", { class: "explain" },
    el("summary", null, "What goes in here"),
    el("div", { class: "body" },
      el("p", { text: cat.definition }),
      el("p", { class: "muted", text: "e.g. " + cat.examples })
    )
  );
  add(card, d);

  const listEl = el("div", { class: "node-list" });
  for (let i = 0; i < slots; i++) {
    const [lo, hi] = slotRange(i);
    const text = list[i] || "";
    add(listEl, el("div", { class: "node-row" },
      el("span", { class: "node-idx", text: fmtRange(lo, hi) }),
      el("button", {
        class: `node-txt ${text ? "" : "empty"} btn ghost`.trim(),
        style: "text-align:left;justify-content:flex-start;flex:1;min-height:40px;padding:.2rem .3rem",
        onclick: () => promptModal({
          title: cat.name,
          label: `Slot ${lo}-${hi}`,
          value: text,
          onSubmit: (v) => { store.setNode(cat.id, i, v); render(); },
        }),
      }, text || "Add new, choose, or reroll"),
      text ? el("button", {
        class: "btn small",
        "aria-label": `Invoke ${text}`,
        onclick: () => invokeDeliberately(scope, cat, i, text),
      }, "Invoke") : null
    ));
  }
  add(card, listEl);
  return card;
}

// Permission: invoke a node deliberately, counting as a beat (PUM p.9).
function invokeDeliberately(scope, cat, index, text) {
  modal({
    title: "Invoke this node",
    body: el("div", null,
      el("p", null, el("strong", { text })),
      el("p", { class: "muted", text: "You may reference a plot node deliberately instead of rolling a random prompt, and count it as a beat for the purpose of advancing the track." })
    ),
    actions: [
      {
        label: "Invoke as a beat", primary: true,
        onClick: () => {
          const node = invokeNode(scope, cat.id, { chosen: index });
          openBeat = {
            kind: "beat", beatType: "prompt", roll: 0,
            text: `${cat.name} (chosen)`, prompt: { label: cat.name, node: cat.id },
            dice: [], repeat: false, key: "chosen:" + cat.id + ":" + index,
            node, event: null, journalId: null,
          };
          const entry = store.addJournal({
            kind: "beat", title: "Plot node invoked deliberately", detail: `${cat.name}: ${text}`,
          });
          openBeat.journalId = entry.id;
          store.setLastBeat({ key: openBeat.key, text: openBeat.text, open: true });
          go("play", "track");
        },
      },
      { label: "Cancel" },
    ],
  });
}
