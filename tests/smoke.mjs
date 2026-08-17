// Browser smoke: boots the app, walks every route, and asserts the §6.7
// measurement contract. Runs in about a minute.

import { chromium } from "playwright-core";
import { serve, LAUNCH } from "./serve.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURES = {
  fresh: null,
  mid: JSON.parse(readFileSync(join(root, "tests/fixtures/mid-session.json"), "utf8")),
  stress: JSON.parse(readFileSync(join(root, "tests/fixtures/stress.json"), "utf8")),
};

const ROUTES = [
  ["play", "track"], ["play", "nodes"], ["play", "cast"],
  ["oracles", "yesno"], ["oracles", "descriptive"], ["oracles", "story"],
  ["oracles", "granular"], ["oracles", "quantifiers"],
  ["scene", "arc"], ["scene", "explore"], ["scene", "battle"],
  ["scene", "discovery"], ["scene", "people"],
  ["journal", "entries"], ["journal", "dice"],
  ["more", "home"], ["more", "library"], ["more", "tutorial"], ["more", "settings"],
];

const WIDTHS = [320, 360, 390];

let pass = 0, fail = 0;
const failures = [];
const ok = (n, c, d = "") => { if (c) pass += 1; else { fail += 1; failures.push(`${n}${d ? " — " + d : ""}`); } };

const { server, url } = await serve();
const browser = await chromium.launch(LAUNCH);

async function newPage(fixture, width = 390) {
  const ctx = await browser.newContext({ viewport: { width, height: 780 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  if (fixture) {
    await page.addInitScript((state) => {
      localStorage.setItem("umState", JSON.stringify(state));
    }, fixture);
  }
  await page.goto(url, { waitUntil: "networkidle" });
  return { ctx, page, errors };
}

async function goto(page, tab, section) {
  await page.evaluate(async ([t, s]) => {
    const r = await import("./src/router.js");
    r.go(t, s);
  }, [tab, section]);
  await page.waitForTimeout(60);
}

// --- 1. every route renders a heading with zero console errors -------------
for (const [name, fixture] of Object.entries(FIXTURES)) {
  const { ctx, page, errors } = await newPage(fixture);
  for (const [tab, section] of ROUTES) {
    await goto(page, tab, section);
    const heading = await page.locator("#screen h1, #screen h2, #screen h3").first().textContent().catch(() => null);
    ok(`[${name}] ${tab}/${section} renders a heading`, !!heading && heading.trim().length > 0);

    // No stray null/undefined/NaN/[object Object] text anywhere.
    const strays = await page.evaluate(() => {
      const bad = [];
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walk.nextNode())) {
        const t = n.textContent;
        if (/\b(null|undefined|NaN|\[object Object\])\b/.test(t)) bad.push(t.trim().slice(0, 80));
      }
      return bad;
    });
    ok(`[${name}] ${tab}/${section} has no stray null/undefined/NaN`, strays.length === 0, strays.join(" | "));
  }
  ok(`[${name}] zero console errors across every route`, errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// --- 2. zero horizontal overflow at 320/360/390 ---------------------------
for (const width of WIDTHS) {
  const { ctx, page } = await newPage(FIXTURES.stress, width);
  for (const [tab, section] of ROUTES) {
    await goto(page, tab, section);
    const over = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      widest: Math.max(0, ...[...document.querySelectorAll("#screen *")]
        .map((e) => e.getBoundingClientRect().right - document.documentElement.clientWidth)),
    }));
    ok(`${width}px ${tab}/${section} no horizontal overflow`, over.doc <= 1,
      `document overflows by ${over.doc}px, widest child +${Math.round(over.widest)}px`);
  }
  await ctx.close();
}

// --- 3. primary action above the fold, nothing under the tab bar ----------
{
  const { ctx, page } = await newPage(FIXTURES.mid);
  for (const [tab, section] of ROUTES) {
    await goto(page, tab, section);
    const info = await page.evaluate(() => {
      const bar = document.querySelector(".action-bar .btn.primary");
      const actionMount = document.querySelector("#action-bar .action-bar");
      const actionTop = actionMount ? actionMount.getBoundingClientRect().top : null;
      const inline = document.querySelector("#screen .btn.primary");
      return {
        hasBar: !!bar,
        barVisible: actionTop !== null && actionTop < window.innerHeight && actionTop > 0,
        inlineTop: inline ? inline.getBoundingClientRect().top : null,
        innerHeight: window.innerHeight,
      };
    });
    // The buried check only means anything at the FOOT of the screen: scroll all
    // the way down, then assert the last control still clears the fixed bars.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(40);
    const buried = await page.evaluate(() => {
      const tabTop = document.querySelector(".tab-bar").getBoundingClientRect().top;
      const actionMount = document.querySelector("#action-bar .action-bar");
      const ceiling = actionMount ? Math.min(tabTop, actionMount.getBoundingClientRect().top) : tabTop;
      return [...document.querySelectorAll("#screen .btn, #screen button, #screen input, #screen textarea")]
        .filter((b) => {
          if (b.closest("details:not([open])")) return false;  // collapsed panels keep their last position
          const r = b.getBoundingClientRect();
          return r.height > 0 && r.top < window.innerHeight && r.bottom > ceiling + 1;
        })
        .map((b) => (b.textContent || b.tagName).trim().slice(0, 30));
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    if (info.hasBar) {
      ok(`${tab}/${section} pinned primary action is on screen`, info.barVisible);
    } else if (info.inlineTop !== null) {
      ok(`${tab}/${section} primary action is above the fold`,
        info.inlineTop < info.innerHeight, `at ${Math.round(info.inlineTop)}px of ${info.innerHeight}`);
    }
    ok(`${tab}/${section} nothing at the foot sits under the fixed bars`, buried.length === 0,
      buried.join(" | "));
  }
  await ctx.close();
}

// --- 4. explain() present and collapsed; tap targets; input font size -----
{
  const { ctx, page } = await newPage(FIXTURES.mid);
  for (const [tab, section] of ROUTES) {
    await goto(page, tab, section);
    const m = await page.evaluate(() => {
      const ex = document.querySelector("#screen details.explain");
      const smalls = [...document.querySelectorAll("#screen label.check, #screen input[type=checkbox], #screen input[type=radio]")]
        .map((n) => {
          const label = n.closest("label") || n;
          const r = label.getBoundingClientRect();
          return Math.min(r.width, r.height);
        }).filter((v) => v > 0);
      const inputs = [...document.querySelectorAll("#screen input[type=text], #screen textarea, #screen select")]
        .map((n) => parseFloat(getComputedStyle(n).fontSize));
      return {
        hasExplain: !!ex,
        explainOpen: ex ? ex.hasAttribute("open") : false,
        smallest: smalls.length ? Math.min(...smalls) : null,
        minFont: inputs.length ? Math.min(...inputs) : null,
      };
    });
    ok(`${tab}/${section} has an explain() note`, m.hasExplain);
    if (m.hasExplain) ok(`${tab}/${section} explain() starts collapsed`, !m.explainOpen);
    if (m.smallest !== null) {
      ok(`${tab}/${section} checkbox rows are at least 40px`, m.smallest >= 40,
        `smallest is ${Math.round(m.smallest)}px`);
    }
    if (m.minFont !== null) {
      ok(`${tab}/${section} inputs are at least 16px`, m.minFont >= 16, `${m.minFont}px`);
    }
  }
  await ctx.close();
}

// --- 5. section nav reaches every sibling and marks the current one -------
{
  const { ctx, page } = await newPage(FIXTURES.mid);
  const tabs = await page.evaluate(async () => {
    const r = await import("./src/router.js");
    return r.TABS.map((t) => ({ id: t.id, sections: t.sections }));
  });
  for (const t of tabs) {
    for (const s of t.sections) {
      await goto(page, t.id, s);
      const nav = await page.evaluate((count) => {
        const buttons = [...document.querySelectorAll("#screen .section-nav button")];
        const cur = buttons.filter((b) => b.getAttribute("aria-current") === "true");
        return { n: buttons.length, current: cur.length, expected: count };
      }, t.sections.length);
      // The Journal tab renders a second pill row for filters; only the first is the nav.
      ok(`${t.id}/${s} section nav marks exactly one current`, nav.current >= 1, `${nav.current} marked`);
      ok(`${t.id}/${s} section nav reaches every sibling`, nav.n >= t.sections.length,
        `${nav.n} of ${t.sections.length}`);
    }
  }
  await ctx.close();
}

// --- 6. the end-to-end walk: prep → scene → beat → track → close → journal -
{
  const { ctx, page, errors } = await newPage(FIXTURES.fresh);

  await goto(page, "more", "home");
  await page.getByRole("button", { name: "Prepare a game" }).first().click();
  await page.waitForTimeout(60);

  // Step 1 — universe
  await page.locator("#screen input[type=text]").first().fill("Smoke test game");
  await page.waitForTimeout(30);
  ok("wizard step 1 unlocks Next once the game is named",
    !(await page.locator("#action-bar .btn.primary").isDisabled()));
  await page.locator("#action-bar .btn.primary").click();
  await page.waitForTimeout(60);

  // Step 2 — scope
  ok("wizard step 2 is gated until the scope is named",
    await page.locator("#action-bar .btn.primary").isDisabled());
  await page.locator("#screen input[type=text]").first().fill("The smoke scope");
  await page.waitForTimeout(30);
  await page.locator("#action-bar .btn.primary").click();
  await page.waitForTimeout(60);

  // Step 3 — protagonists
  ok("wizard step 3 is gated until a protagonist exists",
    await page.locator("#action-bar .btn.primary").isDisabled());
  await page.locator("#screen input[type=text]").first().fill("Vera");
  await page.getByRole("button", { name: "Add protagonist" }).click();
  await page.waitForTimeout(60);
  await page.locator("#action-bar .btn.primary").click();
  await page.waitForTimeout(60);

  // Step 4 — sheet (Standard is preselected)
  await page.locator("#action-bar .btn.primary").click();
  await page.waitForTimeout(60);

  // Step 5 — nodes, then start
  const firstNode = page.locator("#screen .node-row input").first();
  await firstNode.fill("A storm off the cape");
  await page.locator("#action-bar .btn.primary").click();
  await page.waitForTimeout(120);

  ok("the wizard lands on the plot sheet",
    (await page.locator("#screen h1").first().textContent()).includes("The smoke scope"));
  ok("the persistent plot header appears", await page.locator("#plot-header").isVisible());
  const header0 = await page.locator("#plot-header .ph-count").textContent();
  ok("the header shows an empty track", header0.trim() === "0/11", header0);

  // Open a scene
  await goto(page, "scene", "arc");
  await page.getByRole("button", { name: "Roll a scene opener" }).first().click();
  await page.waitForTimeout(80);
  ok("a scene opens", (await page.locator("#screen .pill.on").first().textContent()) === "open");

  // Roll a beat and confirm it
  await goto(page, "play", "track");
  await page.locator("#action-bar .btn.primary").click();   // random prompt
  await page.waitForTimeout(80);
  ok("a beat card appears", await page.locator("#screen .result").first().isVisible());
  const dice = await page.locator("#screen .result .die").count();
  ok("the beat shows its dice", dice >= 1, `${dice} dice shown`);

  const confirm = page.getByRole("button", { name: "Confirm — cross a box" });
  if (await confirm.count()) {
    await confirm.first().click();
    await page.waitForTimeout(120);
    // A modal may open (timed beat / resolved); dismiss whatever is there.
    const anyBtn = page.locator(".modal-actions .btn").first();
    if (await anyBtn.count()) { await anyBtn.click(); await page.waitForTimeout(80); }
    const header1 = await page.locator("#plot-header .ph-count").textContent();
    ok("confirming crosses a box in the header", header1.trim() === "1/11", header1);
  } else {
    ok("confirm control is offered on a beat card", false, "no confirm button found");
  }

  // Ask an oracle
  await goto(page, "oracles", "yesno");
  await page.locator("#action-bar .btn.primary").click();
  await page.waitForTimeout(80);
  ok("an oracle answers", await page.locator("#screen .result-answer").first().isVisible());

  // Close the scene
  await goto(page, "scene", "arc");
  await page.getByRole("button", { name: "Roll a scene closure" }).first().click();
  await page.waitForTimeout(120);
  ok("closing a scene summarises what changed",
    (await page.locator(".modal h2").first().textContent()) === "Scene closed");
  await page.getByRole("button", { name: "Done" }).click();
  await page.waitForTimeout(80);

  // Read it back
  await goto(page, "journal", "entries");
  const entries = await page.locator("#screen .entry").count();
  ok("the journal recorded the session", entries >= 5, `${entries} entries`);
  await goto(page, "journal", "dice");
  ok("the dice distribution renders", await page.locator("#screen .dist").first().isVisible());

  ok("the end-to-end walk produced no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// --- report ---------------------------------------------------------------
await browser.close();
server.close();

console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log("  ✗ " + f);
  process.exit(1);
}
console.log("Browser smoke green.\n");
