// Themed UI primitives. No native alert/confirm/prompt anywhere in the app.

import { el, add, clear, $ } from "./core.js";

let openModal = null;

export function modal({ title, body, actions = [], onClose = null, dismissable = true }) {
  closeModal();
  const prevFocus = document.activeElement;

  const actionRow = el("div", { class: "modal-actions" });
  const box = el("div", {
    class: "modal", role: "dialog", "aria-modal": "true", "aria-label": title || "Dialog",
  });
  add(box, title ? el("h2", { text: title }) : null);
  add(box, body);
  // Actions are ordered primary-first, everywhere, without exception (§6.4).
  for (const a of actions) {
    add(actionRow, el("button", {
      class: `btn ${a.primary ? "primary" : ""} ${a.danger ? "danger" : ""}`.trim(),
      onclick: () => {
        const keep = a.onClick ? a.onClick() : undefined;
        if (keep !== true) closeModal();
      },
    }, a.label));
  }
  if (actions.length) add(box, actionRow);

  const back = el("div", {
    class: "modal-back",
    onclick: (e) => { if (dismissable && e.target === back) closeModal(); },
  }, box);

  function onKey(e) {
    if (e.key === "Escape" && dismissable) { e.preventDefault(); closeModal(); }
    if (e.key !== "Tab") return;
    const f = box.querySelectorAll(
      'button, [href], input, select, textarea, details > summary, [tabindex]:not([tabindex="-1"])'
    );
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener("keydown", onKey);

  $("#modal-mount").append(back);
  openModal = { back, onKey, prevFocus, onClose };
  const focusTarget = box.querySelector("input, textarea, select") || box.querySelector("button");
  if (focusTarget) focusTarget.focus();
  return back;
}

export function closeModal() {
  if (!openModal) return;
  const { back, onKey, prevFocus, onClose } = openModal;
  document.removeEventListener("keydown", onKey);
  back.remove();
  openModal = null;
  if (onClose) onClose();
  if (prevFocus && prevFocus.focus) prevFocus.focus();
}

export function toast(text, ms = 2600) {
  const mount = $("#toast-mount");
  if (!mount) return;
  const t = el("div", { class: "toast", text });
  mount.append(t);
  setTimeout(() => t.remove(), ms);
}

export function confirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm }) {
  // Destructive actions confirm AND name the loss (§6.4).
  return modal({
    title,
    body: el("p", { text: message }),
    actions: [
      { label: confirmLabel, primary: !danger, danger, onClick: onConfirm },
      { label: "Cancel" },
    ],
  });
}

export function promptModal({ title, label, value = "", multiline = false, placeholder = "", hint = "", onSubmit }) {
  const input = multiline
    ? el("textarea", { placeholder })
    : el("input", { type: "text", placeholder });
  input.value = value;
  const body = el("div", null,
    el("label", { class: "field" },
      el("span", { class: "lbl", text: label }),
      input,
      hint ? el("div", { class: "hint", text: hint }) : null
    )
  );
  if (!multiline) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const v = input.value.trim();
        closeModal();
        onSubmit(v);
      }
    });
  }
  return modal({
    title,
    body,
    actions: [
      { label: "Save", primary: true, onClick: () => onSubmit(input.value.trim()) },
      { label: "Cancel" },
    ],
  });
}

// --- the per-screen "what this does" note (§6.6 layer 1) --------------------
// Two to four sentences, in the app's own voice, collapsed by default.
export function explain(text, ruleId = null, onRuleLink = null) {
  const body = el("div", { class: "body" });
  const paras = Array.isArray(text) ? text : [text];
  for (const p of paras) add(body, el("p", { text: p }));
  if (ruleId && onRuleLink) {
    add(body, el("button", {
      class: "btn small ghost",
      onclick: () => onRuleLink(ruleId),
    }, "Read the rule →"));
  }
  return el("details", { class: "explain" },
    el("summary", null, "What this does"),
    body
  );
}

// --- the pinned action bar (§6.2) -------------------------------------------
// Returns the bar; the mount owns the body class that reserves its space, so a
// caller cannot forget the spacer.
export function actionBar({ label, context = "", onClick, disabled = false, secondary = null }) {
  const mount = $("#action-bar");
  clear(mount);
  const bar = el("div", { class: "action-bar" });
  add(bar, context ? el("span", { class: "ab-ctx", text: context }) : null);
  add(bar, secondary
    ? el("button", { class: "btn small", onclick: secondary.onClick }, secondary.label)
    : null);
  add(bar, el("button", {
    class: "btn primary", onclick: onClick, disabled: disabled || undefined,
  }, label));
  mount.append(bar);
  document.body.classList.add("has-actionbar");
  return bar;
}

export function clearActionBar() {
  clear($("#action-bar"));
  document.body.classList.remove("has-actionbar");
}

// --- rows (§6.5: long values stack, short values sit inline) ----------------
export function defRow(k, v) {
  return el("div", { class: "defrow" },
    el("span", { class: "k", text: k }),
    el("span", { class: "v" }, v)
  );
}

export function inlineRow(k, v) {
  return el("div", { class: "inlinerow" },
    el("span", { class: "k", text: k }),
    el("span", { class: "v" }, v)
  );
}

export function emptyState(title, message, action = null) {
  // Empty states name the thing to do and link to it (§6.4).
  return el("div", { class: "empty" },
    el("h3", { text: title }),
    el("p", { class: "muted", text: message }),
    action ? el("button", { class: "btn primary", onclick: action.onClick }, action.label) : null
  );
}

// --- the result card --------------------------------------------------------
// Shows the dice, the working and the consequence (§6.4). Takes plain data so it
// stays free of engine imports; every roller surface renders through this one.
function diceRow(dice) {
  const row = el("div", { class: "dice" });
  for (const d of dice) {
    add(row, el("span", {
      class: `die ${d.kept === false ? "dropped" : "kept"}`,
      title: `${d.label}: ${d.value}`,
    }, String(d.value)));
  }
  return row;
}

export function resultCard({ kind, answer, second, dice = [], strip = null, actions = [], extra = null }) {
  const card = el("div", { class: "result", role: "group", "aria-label": kind });
  const head = el("div", { class: "result-head" },
    el("span", { class: "result-kind", text: kind })
  );
  if (dice.length) add(head, diceRow(dice));
  add(card, head);

  const body = el("div", { class: "result-body" });
  add(body, el("div", { class: "result-answer", text: answer }));
  if (second) add(body, el("div", { class: "result-second" }, second));
  if (extra) add(body, extra);
  if (strip) {
    add(body, el("div", { class: "strip" },
      el("div", { class: "strip-k", text: strip.label }),
      el("div", null, strip.text)
    ));
  }
  add(card, body);

  if (actions.length) {
    const foot = el("div", { class: "result-foot" });
    for (const a of actions) {
      add(foot, el("button", {
        class: `btn small ${a.primary ? "primary" : ""}`.trim(),
        onclick: a.onClick,
      }, a.label));
    }
    add(card, foot);
  }
  return card;
}

