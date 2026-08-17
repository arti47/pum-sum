// Emits docs/TUTORIAL.md from data-tutorial.js. Run it after editing the
// content; the harness regenerates and diffs, so a hand-edited doc fails.
//
// Blocks marked `inApp` are omitted: the app already carries every table row,
// so reproducing one there discloses nothing, while the doc and the published
// page are shareable and quote only the rows their examples land on.

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { TUTORIAL_META, QUICK_START, PARTS } = await import(join(root, "data-tutorial.js"));

const out = [];
const w = (s = "") => out.push(s);

w(`# ${TUTORIAL_META.title}`);
w();
w(`> ${TUTORIAL_META.blurb}`);
w();
w("*Generated from `data-tutorial.js` by `tests/tools/gen-tutorial.mjs`. Edit the data, not this file.*");
w();
w("The same guide is inside the app at **More → Tutorial**, where it also reproduces the tables in full."
  + (TUTORIAL_META.page ? ` It is published as a page at <${TUTORIAL_META.page}>.` : ""));
w();
w("---");
w();
w("## Your first session in ten minutes");
w();
for (const s of QUICK_START) {
  w(`### ${s.title}`);
  w();
  w(`**Why.** ${s.why}`);
  w();
  w(`**Do.** ${s.act}`);
  w();
}

function block(b) {
  if (b.inApp) return;                       // in-app only
  if (b.p) { w(b.p); w(); return; }
  if (b.tap) { w("`" + b.tap + "`"); w(); return; }
  if (b.note) { w(`> **Why.** ${b.note}`); w(); return; }
  if (b.warn) { w(`> **Watch out.** ${b.warn}`); w(); return; }
  if (b.ref) { w(`*${b.ref}*`); w(); return; }
  if (b.bullets) { for (const t of b.bullets) w(`- ${t}`); w(); return; }
  if (b.steps) { b.steps.forEach((t, i) => w(`${i + 1}. ${t}`)); w(); return; }
  if (b.roll) {
    const r = b.roll;
    w(`> **${r.what}** — ${r.die}${r.value ? ` = ${r.value}` : ""}`);
    w(`> “${r.result}” — *${r.page}*`);
    if (r.then) { w(">"); w(`> ${r.then}`); }
    w();
    return;
  }
  if (b.table) { w(`*(${b.table.name}, ${b.table.page} — reproduced in the app only.)*`); w(); return; }
}

for (const part of PARTS) {
  w("---");
  w();
  w(`## ${part.title}`);
  w();
  w(`*${part.blurb}*`);
  w();
  for (const sec of part.sections) {
    w(`### ${sec.title}`);
    w();
    for (const b of sec.blocks) block(b);
  }
}

w("---");
w();
w("## The books");
w();
w(TUTORIAL_META.licence);
w();

// --- the published page: a third rendering of the same data ---------------
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function htmlBlock(b) {
  if (b.inApp) {
    return `<p class="elided">${esc(b.table.name)}, ${esc(b.table.page)} — reproduced in the app only.</p>`;
  }
  if (b.p) return `<p>${esc(b.p)}</p>`;
  if (b.tap) return `<p class="tap">${esc(b.tap)}</p>`;
  if (b.note) return `<aside class="note"><b>Why.</b> ${esc(b.note)}</aside>`;
  if (b.warn) return `<aside class="warn"><b>Watch out.</b> ${esc(b.warn)}</aside>`;
  if (b.ref) return `<p class="cite">${esc(b.ref)}</p>`;
  if (b.bullets) return `<ul>${b.bullets.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  if (b.steps) return `<ol>${b.steps.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>`;
  if (b.roll) {
    const r = b.roll;
    const die = r.value ? `<span class="die">${esc(r.value)}</span>` : "";
    return `<figure class="roll">
      <figcaption><span class="what">${esc(r.what)}</span>${die}<span class="cite">${esc(r.die)}</span></figcaption>
      <blockquote>${esc(r.result)}</blockquote>
      <p class="cite">${esc(r.page)}</p>
      ${r.then ? `<p class="then">${esc(r.then)}</p>` : ""}
    </figure>`;
  }
  return "";
}

const allSections = [
  { id: "quick", title: "Your first session in ten minutes", sections: [] },
  ...PARTS.map((p) => ({ id: p.id, title: p.title, sections: p.sections })),
];

const toc = allSections.map((p) => {
  const kids = p.sections.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join("");
  return `<li><a class="top" href="#${p.id}">${esc(p.title)}</a>${kids ? `<ul>${kids}</ul>` : ""}</li>`;
}).join("");

const quickHtml = QUICK_START.map((s) => `<section class="step">
  <h3>${esc(s.title)}</h3>
  <p><b>Why.</b> ${esc(s.why)}</p>
  <p><b>Do.</b> ${esc(s.act)}</p>
</section>`).join("");

const partsHtml = PARTS.map((part) => `<section class="part" id="${part.id}">
  <p class="eyebrow">${esc(part.title.split(" · ")[0])}</p>
  <h2>${esc(part.title.split(" · ").slice(1).join(" · ") || part.title)}</h2>
  <p class="blurb">${esc(part.blurb)}</p>
  ${part.sections.map((sec) => `<section class="sec" id="${sec.id}">
    <h3>${esc(sec.title)}</h3>
    ${sec.blocks.map(htmlBlock).join("\n")}
  </section>`).join("\n")}
</section>`).join("\n");

const boxes = Array.from({ length: 22 }, () => `<i></i>`).join("");

const html = `<title>${esc(TUTORIAL_META.title)}</title>
<style>
:root{
  --paper:#f7f1e3; --paper-2:#fffaf0; --paper-sunk:#efe7d4;
  --ink:#1b2130; --ink-2:#46506a; --ink-3:#656d87;
  --rule:#d9cfb8; --rule-2:#c3b79b;
  --accent:#e2603c; --accent-text:#b64d30;
  --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#14161d; --paper-2:#1c1f28; --paper-sunk:#0f1116;
  --ink:#ece5d6; --ink-2:#b3ab9a; --ink-3:#8c8678;
  --rule:#333744; --rule-2:#454a5b;
  --accent:#f4784f; --accent-text:#f4784f;
}}
:root[data-theme="dark"]{
  --paper:#14161d; --paper-2:#1c1f28; --paper-sunk:#0f1116;
  --ink:#ece5d6; --ink-2:#b3ab9a; --ink-3:#8c8678;
  --rule:#333744; --rule-2:#454a5b;
  --accent:#f4784f; --accent-text:#f4784f;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);
  font-size:17px;line-height:1.55;-webkit-text-size-adjust:100%}
.wrap{max-width:1180px;margin:0 auto;padding:0 1.1rem 5rem;
  display:grid;grid-template-columns:1fr;gap:0 3rem}
header.masthead{grid-column:1/-1;padding:3.2rem 0 1.4rem;border-bottom:1px solid var(--rule)}
h1{font-size:clamp(2rem,5vw,3rem);line-height:1.08;margin:0 0 .5rem;
  text-wrap:balance;letter-spacing:-.015em}
.lede{font-size:1.12rem;color:var(--ink-2);margin:0 0 1.2rem;max-width:60ch}
.byline{font-family:var(--mono);font-size:.74rem;color:var(--ink-3);
  text-transform:uppercase;letter-spacing:.09em}
/* The plot track, as a reading-progress bar. The app's core visual is a row of
   boxes you cross; here they cross as you read. */
.track{position:sticky;top:0;z-index:5;background:var(--paper);
  padding:.5rem 0 .45rem;border-bottom:1px solid var(--rule);
  grid-column:1/-1;display:flex;gap:3px;align-items:center}
.track i{flex:1 1 0;height:7px;border-radius:2px;background:var(--paper-sunk);
  border:1px solid var(--rule-2)}
.track i.on{background:var(--accent);border-color:var(--accent)}
nav.toc{grid-column:1/-1;padding:1.4rem 0;font-size:.9rem}
nav.toc ul{list-style:none;margin:0;padding:0}
nav.toc>ul>li{margin:0 0 .55rem}
nav.toc ul ul{padding-left:.9rem;margin:.25rem 0 0;color:var(--ink-3)}
nav.toc ul ul li{margin:.1rem 0;font-size:.85rem}
nav.toc a{color:var(--ink-2);text-decoration:none;border-bottom:1px solid transparent}
nav.toc a:hover,nav.toc a:focus-visible{color:var(--accent-text);border-bottom-color:var(--accent)}
nav.toc a.top{font-weight:700;color:var(--ink)}
main{grid-column:1/-1;max-width:68ch}
.part{padding:2.6rem 0 0;border-top:1px solid var(--rule);margin-top:2.6rem}
.part:first-of-type{border-top:0;margin-top:0}
.eyebrow{font-family:var(--mono);font-size:.72rem;letter-spacing:.11em;
  text-transform:uppercase;color:var(--accent-text);margin:0 0 .3rem}
h2{font-size:1.7rem;line-height:1.15;margin:0 0 .4rem;text-wrap:balance}
h3{font-size:1.12rem;margin:2rem 0 .5rem;text-wrap:balance}
.blurb{color:var(--ink-2);font-style:italic;margin:0 0 .5rem}
p{margin:.75rem 0}
ul,ol{margin:.75rem 0;padding-left:1.15rem}
li{margin:.3rem 0}
b{font-weight:700}
.cite{font-family:var(--mono);font-size:.74rem;color:var(--ink-3);margin:.2rem 0}
.tap{font-family:var(--mono);font-size:.82rem;color:var(--accent-text);
  background:var(--paper-2);border:1px solid var(--rule);border-radius:8px;
  padding:.4rem .6rem;display:inline-block}
.note,.warn{border-left:3px solid var(--rule-2);padding:.15rem 0 .15rem .8rem;
  color:var(--ink-2);font-size:.94rem;margin:.9rem 0}
.warn{border-left-color:var(--accent)}
.roll{margin:1rem 0;padding:.7rem .8rem;background:var(--paper-2);
  border:1px solid var(--rule);border-radius:10px}
.roll figcaption{display:flex;align-items:center;gap:.5rem}
.roll .what{font-weight:700;font-size:.94rem}
.roll .cite{margin:0 0 0 auto}
.die{font-family:var(--mono);font-size:.8rem;font-weight:700;
  min-width:26px;height:26px;display:grid;place-items:center;
  background:var(--accent);color:#1b2130;border-radius:6px;padding:0 .35rem;
  font-variant-numeric:tabular-nums}
.roll blockquote{margin:.45rem 0 .2rem;font-size:1.02rem}
.roll blockquote::before{content:"\\201C"}
.roll blockquote::after{content:"\\201D"}
.roll .then{font-size:.93rem;color:var(--ink-2);margin:.5rem 0 0}
.elided{font-family:var(--mono);font-size:.76rem;color:var(--ink-3);
  border:1px dashed var(--rule-2);border-radius:8px;padding:.45rem .6rem}
.step{border-top:1px solid var(--rule);padding-top:.9rem;margin-top:1.2rem}
.step:first-of-type{border-top:0}
.step h3{margin-top:0}
footer{grid-column:1/-1;max-width:68ch;margin-top:3.5rem;padding-top:1.2rem;
  border-top:1px solid var(--rule);font-size:.88rem;color:var(--ink-2)}
a{color:var(--accent-text)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
@media (min-width:1000px){
  .wrap{grid-template-columns:16rem minmax(0,1fr)}
  .track{grid-column:1/-1}
  nav.toc{grid-column:1;position:sticky;top:2.6rem;align-self:start;
    max-height:calc(100vh - 4rem);overflow-y:auto;padding-right:.5rem}
  main{grid-column:2}
  footer{grid-column:2}
}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="wrap">
  <header class="masthead">
    <h1>${esc(TUTORIAL_META.title)}</h1>
    <p class="lede">${esc(TUTORIAL_META.blurb)}</p>
    <p class="byline">PUM v9 · SUM v8 Rev2 · GUM v2.2 — a complete guide</p>
  </header>

  <div class="track" id="track" aria-hidden="true">${boxes}</div>

  <nav class="toc" aria-label="Contents"><ul>${toc}</ul></nav>

  <main>
    <section class="part" id="quick">
      <p class="eyebrow">Start here</p>
      <h2>Your first session in ten minutes</h2>
      <p class="blurb">Enough to play tonight. Everything after it is the complete guide.</p>
      ${quickHtml}
    </section>
    ${partsHtml}
  </main>

  <footer>
    <p>${esc(TUTORIAL_META.licence)}</p>
    <p class="cite">Generated from data-tutorial.js — the same content the app renders at More → Tutorial, where the tables appear in full.</p>
  </footer>
</div>

<script>
(function(){
  var boxes=[].slice.call(document.querySelectorAll("#track i"));
  function paint(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    var p=max>0?h.scrollTop/max:0;
    var n=Math.round(p*boxes.length);
    for(var i=0;i<boxes.length;i++) boxes[i].className=i<n?"on":"";
  }
  addEventListener("scroll",paint,{passive:true});
  addEventListener("resize",paint);
  paint();
})();
</script>
`;

const text = out.join("\n");
const path = join(root, "docs/TUTORIAL.md");
const prev = (() => { try { return readFileSync(path, "utf8"); } catch { return null; } })();
if (process.argv.includes("--check")) {
  if (prev !== text) {
    console.error("docs/TUTORIAL.md is out of date — run `npm run tutorial`");
    process.exit(1);
  }
  console.log("docs/TUTORIAL.md is current.");
} else {
  writeFileSync(path, text);
  console.log(`docs/TUTORIAL.md written — ${text.split("\n").length} lines, ${text.length} chars`);
  const htmlArg = process.argv.indexOf("--html");
  if (htmlArg > -1 && process.argv[htmlArg + 1]) {
    writeFileSync(process.argv[htmlArg + 1], html);
    console.log(`page written — ${html.length} chars`);
  }
}
