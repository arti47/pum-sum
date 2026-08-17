// Emits tutorial.pdf from tutorial.html — the fourth rendering of
// data-tutorial.js, and the only one that needs a browser, which is why it is a
// separate script from gen-tutorial.mjs (that one must run anywhere).
//
// Pagination lives in the page's own `@media print` block, not here: this file
// only prints it. What is set here is what CSS cannot express in Chromium —
// paper size, margins, the running header, the page numbers, and the contents
// page numbers, which need the document to have been laid out before they can
// be known.
//
// Contents numbering is a fixed point. Chromium does not implement CSS
// `target-counter`, so the first print is a measurement: its named destinations
// say which page each section landed on. Those numbers go into the contents and
// the document is printed again — which can itself move a page boundary, so it
// repeats until two consecutive prints agree. Without that loop a contents page
// that grew a line would be numbered one page out for its whole length.
//
// Drift: a PDF cannot be byte-diffed the way the doc and the page can (the
// bytes carry a build timestamp and a font subset), so the generator records
// the SHA-256 of the HTML it printed. The harness hashes the current HTML and
// compares. Same guarantee, deterministic.

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { LAUNCH } from "../serve.mjs";
// playwright is imported below, after --check: the drift check must run where
// no dependency is installed (the Pages workflow installs nothing).

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const htmlPath = join(root, "tutorial.html");
const pdfPath = join(root, "tutorial.pdf");
const hashPath = join(root, "docs/tutorial-pdf.sha256");

const html = readFileSync(htmlPath, "utf8");
const sourceHash = createHash("sha256").update(html).digest("hex");

if (process.argv.includes("--check")) {
  let recorded = null;
  try { recorded = readFileSync(hashPath, "utf8").trim(); } catch { /* absent */ }
  if (recorded !== sourceHash) {
    console.error("tutorial.pdf is out of date — run `npm run pdf`");
    process.exit(1);
  }
  console.log("tutorial.pdf is current.");
  process.exit(0);
}

const { chromium } = await import("playwright-core");
const { TUTORIAL_META } = await import(join(root, "data-tutorial.js"));

// --- reading the printed document back --------------------------------------
// Skia writes a flat `/Dests` dictionary of named destinations — one per `id`
// an anchor points at — each holding the page object it sits on. Walking the
// page tree in order turns those object numbers into page numbers.
function destinationPages(bytes) {
  const s = bytes.toString("latin1");
  const objs = {};
  for (const m of s.matchAll(/(\d+) 0 obj\b([\s\S]*?)endobj/g)) objs[m[1]] = m[2];
  const rootNode = Object.entries(objs)
    .find(([, b]) => /\/Type\s*\/Pages/.test(b) && !/\/Parent/.test(b));
  const order = [];
  (function walk(n) {
    const kids = /\/Kids\s*\[([^\]]*)\]/.exec(objs[n]);
    if (!kids) { order.push(n); return; }
    for (const m of kids[1].matchAll(/(\d+) 0 R/g)) walk(m[1]);
  })(rootNode[0]);
  const pageOf = new Map(order.map((n, i) => [n, i + 1]));

  const catalog = Object.entries(objs).find(([, b]) => /\/Type\s*\/Catalog/.test(b));
  const destsRef = /\/Dests\s+(\d+) 0 R/.exec(catalog[1]);
  const out = new Map();
  if (destsRef) {
    for (const m of objs[destsRef[1]].matchAll(/\/([A-Za-z0-9_.-]+)\s*\[\s*(\d+) 0 R/g)) {
      out.set(m[1], pageOf.get(m[2]));
    }
  }
  return { pages: order.length, dests: out };
}

// Write the measured page numbers into the contents. Only the contents nav is
// touched, and only its own links, so nothing in the body can be rewritten by
// accident.
function numberContents(src, dests) {
  const nav = /<nav class="toc"[\s\S]*?<\/nav>/.exec(src);
  if (!nav) return src;
  let hit = 0, miss = 0;
  const numbered = nav[0].replace(
    /<a([^>]*)href="#([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g,
    (whole, pre, id, post, label) => {
      const p = dests.get(id);
      if (!p) { miss += 1; return whole; }
      hit += 1;
      return `<a${pre}href="#${id}"${post}>${label}<span class="pno">${p}</span></a>`;
    }
  );
  if (miss) console.warn(`  ${miss} contents entr${miss === 1 ? "y" : "ies"} had no destination`);
  return src.slice(0, nav.index) + numbered + src.slice(nav.index + nav[0].length) + `<!--toc:${hit}-->`;
}

const chrome = (t) => `<div style="font-family:Georgia,'Times New Roman',serif;font-size:8pt;
  color:#8a8271;width:100%;padding:0 16mm;">${t}</div>`;

const PDF_OPTIONS = {
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: chrome(
    `<div style="display:flex"><span>${TUTORIAL_META.title}</span>` +
    `<span style="margin-left:auto">PUM v9 &middot; SUM v8 Rev2 &middot; GUM v2.2</span></div>`
  ),
  footerTemplate: chrome(
    `<div style="text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`
  ),
  margin: { top: "18mm", bottom: "16mm", left: "16mm", right: "16mm" },
  outline: true,   // a 26-page guide needs a bookmark rail
  tagged: true,    // structure for a screen reader
};

const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage();
// Light, always: a dark-mode PDF is a wall of ink on paper and unreadable in
// half the viewers that render it on white.
await page.emulateMedia({ media: "print", colorScheme: "light" });

async function print(source) {
  await page.setContent(source, { waitUntil: "load" });
  const bytes = await page.pdf(PDF_OPTIONS);
  return { bytes, ...destinationPages(bytes) };
}

let run = await print(html);
let numbers = run.dests;
let settled = false;
for (let i = 0; i < 4 && !settled; i += 1) {
  run = await print(numberContents(html, numbers));
  settled = [...run.dests].every(([id, p]) => numbers.get(id) === p);
  numbers = run.dests;
}

await browser.close();

if (!settled) {
  console.error("contents page numbers never settled — printed anyway, check them");
  process.exitCode = 1;
}

writeFileSync(pdfPath, run.bytes);
writeFileSync(hashPath, sourceHash + "\n");
console.log(`tutorial.pdf written — ${(run.bytes.length / 1024).toFixed(0)} KB, `
  + `${run.pages} pages, ${numbers.size} contents entries numbered`);
