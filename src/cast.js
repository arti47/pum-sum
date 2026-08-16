// The cast: protagonists, and the characters and locations the story has met.
// SUM's character emulation rolls attach to a person and stay with them.

import { el, add, announce } from "./core.js";
import { explain, modal, closeModal, promptModal, confirmModal, toast } from "./ui.js";
import * as store from "./store.js";
import { rollSum, journalRoll, diceText } from "./roller.js";
import { sumTable } from "./rules.js";
import { render, go } from "./router.js";
import { currentBias } from "./scene.js";
import { CHARACTER_TABLE_IDS } from "../data-sum.js";
import { NODE_CATEGORIES } from "../data-pum-plot.js";

export function renderCast(host) {
  const game = store.activeGame();
  add(host, el("h1", { text: "Cast" }));
  add(host, explain([
    "Your protagonists, plus everyone and everywhere the story has actually met.",
    "Roll SUM's character tables from a person's entry and the result is stored with them, so next time you know how they talk and what they want.",
  ]));

  // Protagonists
  const pcs = el("div", { class: "card" });
  add(pcs, el("div", { class: "card-head" },
    el("h2", { text: "Protagonists" }),
    el("span", { class: "cite", text: "your eyes and ears" })
  ));
  if (!game.protagonists.length) {
    add(pcs, el("p", { class: "muted", text: "No protagonists yet. You are in full control of their thoughts, voice and actions." }));
  }
  for (const p of game.protagonists) {
    add(pcs, el("div", { class: "entry" },
      el("div", { class: "entry-head" },
        el("span", { class: "entry-title", text: p.name }),
        el("button", {
          class: "btn small ghost", style: "margin-left:auto",
          onclick: () => editProtagonist(p),
        }, "Edit")
      ),
      p.notes ? el("div", { class: "entry-detail", text: p.notes }) : null
    ));
  }
  add(pcs, el("button", {
    class: "btn wide",
    onclick: () => promptModal({
      title: "Add a protagonist", label: "Name",
      onSubmit: (v) => { if (v) { store.addProtagonist(v); render(); } },
    }),
  }, "Add a protagonist"));
  add(host, pcs);

  // Characters & locations
  for (const kind of ["character", "location"]) {
    const list = game.cast.filter((c) => c.kind === kind);
    const card = el("div", { class: "card" });
    add(card, el("div", { class: "card-head" },
      el("h2", { text: kind === "character" ? "Notable characters" : "Interesting locations" }),
      el("span", { class: "cite", text: `${list.length}` })
    ));
    if (!list.length) {
      add(card, el("p", { class: "muted", text: kind === "character"
        ? "Nobody yet. When a prompt brings someone into the story, keep them here."
        : "Nowhere yet. When a prompt leads somewhere, keep it here." }));
    }
    for (const c of list) {
      add(card, castEntry(c));
    }
    add(card, el("button", {
      class: "btn wide",
      onclick: () => promptModal({
        title: kind === "character" ? "Add a character" : "Add a location",
        label: "Name",
        onSubmit: (v) => { if (v) { store.addCast(kind, v); render(); } },
      }),
    }, kind === "character" ? "Add a character" : "Add a location"));
    add(host, card);
  }
}

function castEntry(c) {
  const wrap = el("div", { class: "entry" });
  add(wrap, el("div", { class: "entry-head" },
    el("span", { class: "entry-title", text: c.name }),
    el("button", {
      class: "btn small ghost", style: "margin-left:auto",
      onclick: () => openCast(c),
    }, "Open")
  ));
  if (c.notes) add(wrap, el("div", { class: "entry-detail", text: c.notes }));
  if (c.traits.length) {
    const ul = el("ul", { style: "margin:.3rem 0 0;padding-left:1.1rem" });
    for (const t of c.traits) {
      add(ul, el("li", { class: "entry-detail" },
        el("span", { class: "cite", text: t.label + ": " }), t.text
      ));
    }
    add(wrap, ul);
  }
  return wrap;
}

function editProtagonist(p) {
  const name = el("input", { type: "text", value: p.name });
  const notes = el("textarea", null);
  notes.value = p.notes || "";
  modal({
    title: "Protagonist",
    body: el("div", null,
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Name" }), name),
      el("label", { class: "field" }, el("span", { class: "lbl", text: "Notes" }), notes)
    ),
    actions: [
      {
        label: "Save", primary: true,
        onClick: () => {
          store.updateProtagonist(p.id, { name: name.value.trim() || p.name, notes: notes.value });
          render();
        },
      },
      {
        label: "Remove", danger: true,
        onClick: () => {
          closeModal();
          confirmModal({
            title: "Remove this protagonist?",
            message: `${p.name} and their notes are deleted. This can be undone once from Settings.`,
            confirmLabel: "Remove", danger: true,
            onConfirm: () => { store.removeProtagonist(p.id); render(); },
          });
          return true;
        },
      },
      { label: "Cancel" },
    ],
  });
}

function openCast(c) {
  const body = el("div");
  const notes = el("textarea", { placeholder: "What do you know about them?" });
  notes.value = c.notes || "";
  add(body, el("label", { class: "field" }, el("span", { class: "lbl", text: "Notes" }), notes));

  if (c.traits.length) {
    const list = el("div", { class: "card" });
    add(list, el("h3", { text: "What SUM has told you" }));
    c.traits.forEach((t, i) => {
      add(list, el("div", { class: "entry" },
        el("div", { class: "entry-head" },
          el("span", { class: "entry-kind", text: t.label }),
          el("span", { class: "entry-ts", text: `rolled ${t.roll}` })
        ),
        el("div", { text: t.text }),
        el("button", {
          class: "btn small ghost",
          onclick: () => { store.removeCastTrait(c.id, i); closeModal(); openCast(store.activeGame().cast.find((x) => x.id === c.id)); },
        }, "Remove")
      ));
    });
    add(body, list);
  }

  if (c.kind === "character") {
    const roll = el("div", { class: "card" });
    add(roll, el("h3", { text: "Ask SUM about them" }));
    add(roll, el("p", { class: "muted", text: "Only roll the depth this scene has actually reached. Bias comes from the Scene tab." }));
    const grid = el("div", { class: "btn-grid" });
    for (const id of CHARACTER_TABLE_IDS) {
      const t = sumTable(id);
      if (!t) continue;
      add(grid, el("button", {
        class: "btn small",
        onclick: () => {
          const r = rollSum({ tableId: id, bias: currentBias() });
          store.addCastTrait(c.id, { table: id, label: t.name, text: r.answer, roll: r.kept });
          journalRoll(r, {
            kind: "sum", title: `${c.name} — ${t.name}: ${r.answer}`, detail: diceText(r.dice),
          });
          announce(`${t.name}: ${r.answer}`);
          closeModal();
          const fresh = store.activeGame().cast.find((x) => x.id === c.id);
          openCast(fresh);
          render();
        },
      }, t.name));
    }
    add(roll, grid);
    add(body, roll);
  }

  modal({
    title: c.name,
    body,
    actions: [
      {
        label: "Save", primary: true,
        onClick: () => { store.updateCast(c.id, { notes: notes.value }); render(); },
      },
      {
        label: "Rename",
        onClick: () => {
          closeModal();
          promptModal({
            title: "Rename", label: "Name", value: c.name,
            onSubmit: (v) => { if (v) { store.updateCast(c.id, { name: v }); render(); } },
          });
          return true;
        },
      },
      {
        label: "Add to plot nodes",
        onClick: () => {
          closeModal();
          addToNodes(c);
          return true;
        },
      },
      {
        label: "Remove", danger: true,
        onClick: () => {
          closeModal();
          confirmModal({
            title: `Remove ${c.name}?`,
            message: `Their notes and ${c.traits.length} rolled trait${c.traits.length === 1 ? "" : "s"} are deleted. This can be undone once from Settings.`,
            confirmLabel: "Remove", danger: true,
            onConfirm: () => { store.removeCast(c.id); render(); },
          });
          return true;
        },
      },
    ],
  });
}

// A cast member is only reachable by a random prompt once they are a plot node.
function addToNodes(c) {
  const scope = store.currentScope();
  const catId = c.kind === "character" ? "characters" : "locations";
  const cat = NODE_CATEGORIES.find((x) => x.id === catId);
  const slots = scope ? (scope.nodes[catId] || []).length : 0;
  modal({
    title: "Add to plot nodes",
    body: el("div", null,
      el("p", null, `Write `, el("strong", { text: c.name }), ` into `, el("strong", { text: cat.name }), `.`),
      el("p", { class: "muted", text: "Until a name sits in a plot node list, a random prompt can never reach them." })
    ),
    actions: [
      {
        label: "Write it in", primary: true,
        onClick: () => {
          const sheetSlots = Math.max(slots, 5);
          const at = store.writeNodeToFirstEmpty(catId, c.name, sheetSlots);
          if (at < 0) toast("That list is full — clear a slot first.");
          else { toast(`Added to ${cat.name}.`); go("play", "nodes"); }
        },
      },
      { label: "Cancel" },
    ],
  });
}
