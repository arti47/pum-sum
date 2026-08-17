// Modal audit. The interaction audit (§11.1 C) clicks top-level controls and then
// discards whatever modal opened — so every button INSIDE a dialog was unaudited.
// This pass opens each modal and clicks each of its buttons in isolation.

import { chromium } from "playwright-core";
import { serve, LAUNCH } from "./serve.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MID = JSON.parse(readFileSync(join(root, "tests/fixtures/mid-session.json"), "utf8"));

const ROUTES = [
  ["play", "track"], ["play", "nodes"], ["play", "cast"],
  ["scene", "arc"], ["scene", "explore"], ["scene", "people"],
  ["oracles", "yesno"], ["oracles", "granular"],
  ["forge", "seed"], ["forge", "world"], ["forge", "grand"],
  ["journal", "entries"], ["journal", "dice"],
  ["more", "home"], ["more", "library"], ["more", "settings"],
];

// Destroy-everything controls are exercised by unit tests, not here.
const SKIP_OPENER = ["Erase everything", "Delete the current game", "Clear the journal", "Import"];
const SKIP_INNER = ["Erase everything", "Delete this game", "Erase", "Import"];

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
let openers = 0, innerClicks = 0;

async function reset(tab, section) {
  await page.evaluate(async ([state, t, s]) => {
    localStorage.setItem("umState", JSON.stringify(state));
    (await import("./src/store.js")).load();
    (await import("./src/viewstate.js")).clearTransient();
    document.querySelectorAll(".modal-back").forEach((n) => n.remove());
    (await import("./src/router.js")).go(t, s);
  }, [MID, tab, section]);
  await page.waitForTimeout(40);
}

async function screenControls() {
  return page.evaluate(() => {
    const sel = "#screen button, #screen .btn, #action-bar button";
    return [...document.querySelectorAll(sel)]
      .filter((n) => n.offsetParent !== null && !n.disabled
        && !n.closest("details:not([open]) > *:not(summary)"))
      .map((n) => (n.textContent || "").trim().slice(0, 40));
  });
}

for (const [tab, section] of ROUTES) {
  await reset(tab, section);
  const labels = await screenControls();

  for (let i = 0; i < labels.length; i++) {
    if (SKIP_OPENER.some((s) => labels[i].includes(s))) continue;
    await reset(tab, section);

    // click the opener
    const opened = await page.evaluate(async (idx) => {
      const sel = "#screen button, #screen .btn, #action-bar button";
      const nodes = [...document.querySelectorAll(sel)]
        .filter((n) => n.offsetParent !== null && !n.disabled
          && !n.closest("details:not([open]) > *:not(summary)"));
      if (!nodes[idx]) return false;
      nodes[idx].click();
      return true;
    }, i);
    if (!opened) continue;
    await page.waitForTimeout(120);

    const hasModal = await page.locator(".modal").count();
    if (!hasModal) continue;
    openers += 1;

    const inner = await page.evaluate(() =>
      [...document.querySelectorAll(".modal button")]
        .filter((n) => !n.disabled)
        .map((n) => (n.textContent || "").trim().slice(0, 40)));

    const modalTitle = await page.locator(".modal h2").first().textContent().catch(() => "(untitled)");

    for (let j = 0; j < inner.length; j++) {
      if (SKIP_INNER.some((s) => inner[j] === s)) continue;
      // re-open the modal fresh for each of its buttons
      await reset(tab, section);
      await page.evaluate(async (idx) => {
        const sel = "#screen button, #screen .btn, #action-bar button";
        const nodes = [...document.querySelectorAll(sel)]
          .filter((n) => n.offsetParent !== null && !n.disabled
            && !n.closest("details:not([open]) > *:not(summary)"));
        nodes[idx] && nodes[idx].click();
      }, i);
      await page.waitForTimeout(110);
      if (!(await page.locator(".modal").count())) continue;

      const before = await page.evaluate(() => ({
        store: localStorage.getItem("umState") || "",
        html: document.querySelector("#screen").innerHTML.length,
        modals: document.querySelectorAll(".modal").length,
        toasts: document.querySelectorAll(".toast").length,
        // A dialog that closes itself and opens another leaves the COUNT at 1.
        // Fingerprint the dialog itself or those swaps read as no-ops.
        modalId: [...document.querySelectorAll(".modal")]
          .map((m) => m.getAttribute("aria-label") + "#" + m.innerHTML.length).join("|"),
      }));
      const errsBefore = jsErrors.length;

      const clicked = await page.evaluate((jdx) => {
        const b = [...document.querySelectorAll(".modal button")].filter((n) => !n.disabled)[jdx];
        if (!b) return false;
        b.click();
        return true;
      }, j);
      innerClicks += 1;
      if (!clicked) continue;

      let changed = false;
      for (let t = 0; t < 10; t++) {
        await page.waitForTimeout(40);
        const after = await page.evaluate(() => ({
          store: localStorage.getItem("umState") || "",
          html: document.querySelector("#screen").innerHTML.length,
          modals: document.querySelectorAll(".modal").length,
          toasts: document.querySelectorAll(".toast").length,
          modalId: [...document.querySelectorAll(".modal")]
            .map((m) => m.getAttribute("aria-label") + "#" + m.innerHTML.length).join("|"),
        }));
        changed = after.store !== before.store || after.html !== before.html
          || after.modals !== before.modals || after.toasts !== before.toasts
          || after.modalId !== before.modalId;
        if (changed) break;
      }

      if (jsErrors.length > errsBefore) {
        findings.push(`${tab}/${section} · "${labels[i]}" → [${modalTitle}] "${inner[j]}" threw — ${jsErrors[errsBefore]}`);
      } else if (!changed) {
        findings.push(`${tab}/${section} · "${labels[i]}" → [${modalTitle}] "${inner[j]}" changed nothing`);
      }
      await page.evaluate(() => document.querySelectorAll(".modal-back").forEach((n) => n.remove()));
    }
  }
}

await browser.close();
server.close();

console.log(`\nModal audit: ${openers} modals opened, ${innerClicks} in-dialog buttons clicked\n`);
if (findings.length) {
  console.log("Findings:");
  for (const f of findings) console.log("  ✗ " + f);
  console.log("");
  process.exit(1);
}
console.log("Every dialog button does something, and nothing threw.\n");
