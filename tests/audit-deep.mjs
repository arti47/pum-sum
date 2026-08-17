// Deep audit (§11.1 C, widened). The interaction and modal audits run one
// fixture — a Standard sheet, mid-session — so two whole regions of the app were
// never clicked: the other nine plot sheets, and the prep wizard.
//
// Three passes:
//   A. the sheet matrix — every plot sheet, every Play route, every control
//   B. the wizard — every control on every step, in isolation
//   C. the write-back invariant — nothing may be written into a list the chosen
//      sheet does not print, because the Nodes screen would then hide it
//
// Findings are printed and the process exits non-zero, like the other audits.

import { chromium } from "playwright-core";
import { serve, LAUNCH } from "./serve.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MID = JSON.parse(readFileSync(join(root, "tests/fixtures/mid-session.json"), "utf8"));

const SHEETS = [
  "standard", "journey", "story-focus", "scenes", "dungeon",
  "exploration", "story-parts", "improvised", "sandbox", "customized",
];
const PLAY_ROUTES = [["play", "track"], ["play", "nodes"], ["play", "cast"]];
// Sheets whose dialogs are swept button by button as well.
const DEEP_MODALS = ["journey", "improvised", "sandbox", "customized"];

// Controls whose whole job is to destroy state, exercised by unit tests instead.
const SKIP = ["Erase everything", "Delete the current game", "Clear the journal", "Import", "Delete"];

const { server, url } = await serve();
const browser = await chromium.launch(LAUNCH);
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
const page = await ctx.newPage();

const jsErrors = [];
page.on("pageerror", (e) => jsErrors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") jsErrors.push(m.text()); });

await page.addInitScript((s) => localStorage.setItem("umState", JSON.stringify(s)), MID);
await page.goto(url, { waitUntil: "networkidle" });

const findings = [];
let clicked = 0, inner = 0, checkedStates = 0;

// A fixture on a named sheet, with every node list pre-filled so the lists the
// sheet does not print are demonstrably unreachable rather than merely empty.
function fixtureFor(sheetId) {
  const state = JSON.parse(JSON.stringify(MID));
  const scope = state.games[0].scopes[0];
  scope.sheetId = sheetId;
  scope.track = { crossed: 1, marks: { 2: "the siege arrives" }, fired: {}, custom: null };
  scope.customNames = { custom1: "Rumours", custom2: "" };
  for (const id of ["world", "problems", "findings", "questions", "characters", "locations", "custom1", "custom2"]) {
    scope.nodes[id] = ["written one", "written two", "", "", ""];
  }
  return state;
}

async function reset(state, tab, section) {
  await page.evaluate(async ([s, t, sec]) => {
    localStorage.setItem("umState", JSON.stringify(s));
    (await import("./src/store.js")).load();
    (await import("./src/viewstate.js")).clearTransient();
    document.querySelectorAll(".modal-back").forEach((n) => n.remove());
    (await import("./src/router.js")).go(t, sec);
  }, [state, tab, section]);
  // Expand inspiration blocks so their controls are audited too. Only these —
  // expanding every fold on a ten-list Nodes screen would triple the run for
  // surfaces the other passes already cover.
  await page.evaluate(() => {
    document.querySelectorAll("#screen details.inspire").forEach((d) => { d.open = true; });
  });
  await page.waitForTimeout(25);
}

const SELECTOR = "#screen button, #screen .btn, #action-bar button, #screen summary";

// A control marked as the current one — the section you are on, the sheet you
// already chose — is *meant* to do nothing when tapped. Auditing it for change
// would report the correct behaviour as a fault.
const HERE = '[aria-current="true"], [aria-current="page"], [aria-pressed="true"]';

async function controls() {
  return page.evaluate(([sel, here]) => [...document.querySelectorAll(sel)]
    .filter((n) => n.offsetParent !== null && !n.disabled
      && !n.matches(here)
      && !n.closest("details:not([open]) > *:not(summary)"))
    .map((n) => (n.textContent || "").trim().slice(0, 40)), [SELECTOR, HERE]);
}

async function snapshot() {
  return page.evaluate(() => {
    // Hash the markup rather than measuring it: swapping which of two cards is
    // selected changes the DOM without changing its length, and a length check
    // calls that a no-op. (This blind spot hid three wizard controls.)
    const hash = (node) => {
      const str = node ? node.innerHTML : "";
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
      return str.length + ":" + h.toString(36);
    };
    return {
    html: hash(document.querySelector("#screen")),
    modal: document.querySelectorAll(".modal").length,
    modalId: [...document.querySelectorAll(".modal")].map(hash).join("|"),
    toast: document.querySelectorAll(".toast").length,
    store: (localStorage.getItem("umState") || "").length,
    storeTail: (localStorage.getItem("umState") || "").slice(-500),
    route: document.querySelector('.tab-bar [aria-current="page"]')?.textContent || "",
    section: [...document.querySelectorAll('.section-nav [aria-current="true"]')]
      .map((n) => n.textContent).join("|"),
    scroll: window.scrollY,
    };
  });
}

function changed(a, b) {
  return a.html !== b.html || a.modal !== b.modal || a.modalId !== b.modalId
    || a.toast !== b.toast || a.store !== b.store || a.storeTail !== b.storeTail
    || a.route !== b.route || a.section !== b.section || a.scroll !== b.scroll;
}

// Pass C's invariant. The fixture deliberately pre-fills lists the sheet does
// not print — that is legacy data, which the app keeps rather than destroys —
// so the invariant is about the DELTA: a click must never push more into a list
// than the Nodes screen can read back.
async function unreadableCounts() {
  return page.evaluate(async () => {
    const derived = await import("./src/derived.js");
    const store = await import("./src/store.js");
    const { NODE_CATEGORIES } = await import("./data-pum-plot.js");
    const out = {};
    for (const g of store.getState().games) {
      for (const sc of g.scopes) {
        for (const cat of NODE_CATEGORIES) {
          const written = (sc.nodes[cat.id] || []).filter((s) => s && s.trim()).length;
          const slots = derived.nodeSlots(sc, cat.id);
          out[`${sc.id}/${cat.id}`] = Math.max(0, written - slots);
        }
      }
    }
    return out;
  });
}

async function assertWriteBack(where, baseline) {
  const now = await unreadableCounts();
  checkedStates += 1;
  for (const [key, n] of Object.entries(now)) {
    const was = baseline[key] || 0;
    if (n > was) findings.push(`write-back · ${where} — ${key}: ${n - was} entr(y/ies) written where nothing can read them`);
  }
}

// --- pass A: the sheet matrix ----------------------------------------------
for (const sheetId of SHEETS) {
  const fixture = fixtureFor(sheetId);
  for (const [tab, section] of PLAY_ROUTES) {
    await reset(fixture, tab, section);
    const labels = await controls();

    for (let i = 0; i < labels.length; i++) {
      if (SKIP.some((s) => labels[i].includes(s))) continue;
      await reset(fixture, tab, section);

      const baseline = await unreadableCounts();
      const before = await snapshot();
      const errs = jsErrors.length;
      const hit = await page.evaluate(([sel, here, idx]) => {
        const nodes = [...document.querySelectorAll(sel)]
          .filter((n) => n.offsetParent !== null && !n.disabled && !n.matches(here)
            && !n.closest("details:not([open]) > *:not(summary)"));
        if (!nodes[idx]) return false;
        nodes[idx].click();
        return true;
      }, [SELECTOR, HERE, i]);
      if (!hit) continue;
      clicked += 1;

      let after = before, moved = false;
      for (let t = 0; t < 8; t++) {
        await page.waitForTimeout(30);
        after = await snapshot();
        moved = changed(before, after);
        if (moved) break;
      }
      if (jsErrors.length > errs) {
        findings.push(`${sheetId} ${tab}/${section} · "${labels[i]}" threw — ${jsErrors[errs]}`);
      } else if (!moved) {
        findings.push(`${sheetId} ${tab}/${section} · "${labels[i]}" changed nothing`);
      }

      // Every button inside whatever dialog it opened, one at a time. Only on
      // the structurally distinct sheets — audit-modals.mjs already sweeps the
      // dialogs of a Standard sheet, and the rest differ only in their track.
      if (after.modal && DEEP_MODALS.includes(sheetId)) {
        const innerLabels = await page.evaluate(() =>
          [...document.querySelectorAll(".modal button")].filter((n) => !n.disabled)
            .map((n) => (n.textContent || "").trim().slice(0, 40)));
        for (let j = 0; j < innerLabels.length; j++) {
          if (SKIP.some((s) => innerLabels[j] === s)) continue;
          await reset(fixture, tab, section);
          await page.evaluate(([sel, here, idx]) => {
            const nodes = [...document.querySelectorAll(sel)]
              .filter((n) => n.offsetParent !== null && !n.disabled && !n.matches(here)
                && !n.closest("details:not([open]) > *:not(summary)"));
            nodes[idx] && nodes[idx].click();
          }, [SELECTOR, HERE, i]);
          await page.waitForTimeout(110);
          if (!(await page.locator(".modal").count())) continue;

          const b2 = await snapshot();
          const e2 = jsErrors.length;
          const did = await page.evaluate((jdx) => {
            const b = [...document.querySelectorAll(".modal button")].filter((n) => !n.disabled)[jdx];
            if (!b) return false;
            b.click();
            return true;
          }, j);
          if (!did) continue;
          inner += 1;

          let m2 = false;
          for (let t = 0; t < 8; t++) {
            await page.waitForTimeout(30);
            m2 = changed(b2, await snapshot());
            if (m2) break;
          }
          if (jsErrors.length > e2) {
            findings.push(`${sheetId} ${tab}/${section} · "${labels[i]}" → "${innerLabels[j]}" threw — ${jsErrors[e2]}`);
          } else if (!m2) {
            findings.push(`${sheetId} ${tab}/${section} · "${labels[i]}" → "${innerLabels[j]}" changed nothing`);
          }
          await assertWriteBack(`${sheetId} ${tab}/${section} "${labels[i]}" → "${innerLabels[j]}"`, baseline);
        }
      }
      await assertWriteBack(`${sheetId} ${tab}/${section} "${labels[i]}"`, baseline);
      await page.evaluate(() => document.querySelectorAll(".modal-back").forEach((n) => n.remove()));
    }
  }
}

// --- pass B: the wizard -----------------------------------------------------
// Never reached by the other audits: it only renders while a draft exists.
async function enterWizard(step, sheetId) {
  await page.evaluate(async ([s, st, sheet]) => {
    localStorage.setItem("umState", JSON.stringify(s));
    (await import("./src/store.js")).load();
    (await import("./src/viewstate.js")).clearTransient();
    document.querySelectorAll(".modal-back").forEach((n) => n.remove());
    const w = await import("./src/wizard.js");
    w.startWizard();
    // Walk the draft forward the legal way, through the wizard's own controls.
    const type = (sel, v) => {
      const n = document.querySelectorAll(sel)[0];
      if (!n) return;
      n.value = v;
      n.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const next = () => document.querySelector("#action-bar .btn.primary").click();
    if (st >= 1) { type("#screen input[type=text]", "Audit game"); next(); }
    if (st >= 2) { type("#screen input[type=text]", "Audit scope"); next(); }
    if (st >= 3) {
      type("#screen input[type=text]", "Vera");
      [...document.querySelectorAll("#screen button")]
        .find((b) => b.textContent.includes("Add protagonist")).click();
      next();
    }
    if (st >= 4) {
      const pick = [...document.querySelectorAll("#screen .card")]
        .find((c) => c.querySelector("h3") && c.querySelector("h3").textContent.trim().toLowerCase()
          === sheet.replace("-", "-"));
      if (pick) pick.querySelector("button.btn.wide").click();
      next();
    }
  }, [MID, step, sheetId]);
  await page.waitForTimeout(80);
}

for (const sheetId of ["standard", "journey", "customized"]) {
  for (let step = 0; step <= 4; step++) {
    await enterWizard(step, sheetId);
    const labels = await controls();
    for (let i = 0; i < labels.length; i++) {
      if (SKIP.some((s) => labels[i].includes(s))) continue;
      await enterWizard(step, sheetId);
      const baseline = await unreadableCounts();
      const before = await snapshot();
      const errs = jsErrors.length;
      const hit = await page.evaluate(([sel, here, idx]) => {
        const nodes = [...document.querySelectorAll(sel)]
          .filter((n) => n.offsetParent !== null && !n.disabled && !n.matches(here)
            && !n.closest("details:not([open]) > *:not(summary)"));
        if (!nodes[idx]) return false;
        nodes[idx].click();
        return true;
      }, [SELECTOR, HERE, i]);
      if (!hit) continue;
      clicked += 1;

      let moved = false;
      for (let t = 0; t < 8; t++) {
        await page.waitForTimeout(30);
        moved = changed(before, await snapshot());
        if (moved) break;
      }
      if (jsErrors.length > errs) {
        findings.push(`wizard[${sheetId}] step ${step + 1} · "${labels[i]}" threw — ${jsErrors[errs]}`);
      } else if (!moved) {
        findings.push(`wizard[${sheetId}] step ${step + 1} · "${labels[i]}" changed nothing`);
      }
      await assertWriteBack(`wizard[${sheetId}] step ${step + 1} "${labels[i]}"`, baseline);
      await page.evaluate(() => document.querySelectorAll(".modal-back").forEach((n) => n.remove()));
    }
  }
}

// --- pass C: prep round-trip through the real wizard ------------------------
// Fill every node slot the wizard offers, finish, and assert every written entry
// is readable back on the plot sheet.
for (const sheetId of ["standard", "journey"]) {
  await enterWizard(4, sheetId);
  const wrote = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll("#screen .node-row input")];
    inputs.forEach((n, i) => {
      n.value = `written ${i}`;
      n.dispatchEvent(new Event("input", { bubbles: true }));
    });
    return inputs.length;
  });
  await page.evaluate(() => document.querySelector("#action-bar .btn.primary").click());
  await page.waitForTimeout(160);
  const readable = await page.evaluate(async () => {
    const derived = await import("./src/derived.js");
    const store = await import("./src/store.js");
    const { NODE_CATEGORIES } = await import("./data-pum-plot.js");
    const sc = store.currentScope();
    let n = 0;
    for (const cat of NODE_CATEGORIES) {
      n += derived.nodeList(sc, cat.id).filter((s) => s && s.trim()).length;
    }
    return n;
  });
  if (wrote !== readable) {
    findings.push(`prep round-trip[${sheetId}] — wrote ${wrote} node entries, ${readable} readable back`);
  }
  checkedStates += 1;
}

await browser.close();
server.close();

console.log(`\nDeep audit: ${clicked} controls, ${inner} in-dialog buttons, ${checkedStates} write-back checks`);
console.log(`  across ${SHEETS.length} plot sheets and the prep wizard\n`);
if (findings.length) {
  console.log("Findings:");
  for (const f of [...new Set(findings)]) console.log("  ✗ " + f);
  console.log("");
  process.exit(1);
}
console.log("Every control acts, nothing threw, and nothing was written where it cannot be read.\n");
