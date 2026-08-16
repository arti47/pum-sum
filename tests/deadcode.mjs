// The dead-data scan (§11.2.1): every export nothing else imports, and every
// named import a file never uses. This is the pass that finds the §0 defect —
// data extracted faithfully, unit-tested, documented in the UI, and never called.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rx = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// \b is no boundary for a name containing $, so bound on the identifier charset.
const word = (n) => new RegExp(`(?<![A-Za-z0-9_$])${rx(n)}(?![A-Za-z0-9_$])`, "g");

const files = [
  ...readdirSync(join(root, "src")).filter((f) => f.endsWith(".js")).map((f) => join("src", f)),
  ...readdirSync(root).filter((f) => f.startsWith("data-") && f.endsWith(".js")),
];

const sources = new Map();
for (const f of files) sources.set(f, readFileSync(join(root, f), "utf8"));

// Also scan the harnesses: a table read only by a test is still read, but the
// scan reports it separately so it cannot masquerade as a shipped consumer.
const testFiles = readdirSync(join(root, "tests")).filter((f) => f.endsWith(".mjs"));
const testSource = testFiles.map((f) => readFileSync(join(root, "tests", f), "utf8")).join("\n");

const exportsOf = new Map();     // file -> [names]
const importsOf = new Map();     // file -> [{ name, from }]

for (const [file, src] of sources) {
  const names = [];
  for (const m of src.matchAll(/^export\s+(?:const|let|function|class)\s+([A-Za-z0-9_$]+)/gm)) {
    names.push(m[1]);
  }
  for (const m of src.matchAll(/^export\s*\{([^}]+)\}/gm)) {
    for (const part of m[1].split(",")) {
      const n = part.trim().split(/\s+as\s+/).pop().trim();
      if (n) names.push(n);
    }
  }
  exportsOf.set(file, names);

  const imps = [];
  for (const m of src.matchAll(/import\s+(?:\*\s+as\s+([A-Za-z0-9_$]+)|\{([^}]*)\}|([A-Za-z0-9_$]+))\s+from\s+["']([^"']+)["']/g)) {
    const [, star, braced, def, from] = m;
    if (star) imps.push({ name: "*" + star, from });
    else if (def) imps.push({ name: def, from });
    else if (braced) {
      for (const part of braced.split(",")) {
        const n = part.trim().split(/\s+as\s+/).pop().trim();
        if (n) imps.push({ name: n, from });
      }
    }
  }
  // Multi-line braced imports (the regex above needs the closing brace on any line).
  for (const m of src.matchAll(/import\s*\{([\s\S]*?)\}\s*\n?\s*from\s+["']([^"']+)["']/g)) {
    for (const part of m[1].split(",")) {
      const n = part.trim().split(/\s+as\s+/).pop().trim();
      if (n && !imps.some((i) => i.name === n)) imps.push({ name: n, from: m[2] });
    }
  }
  importsOf.set(file, imps);
}

const findings = [];
const notes = [];

// --- 1. every export nothing else imports ---------------------------------
const allImported = new Set();
for (const imps of importsOf.values()) {
  for (const i of imps) allImported.add(i.name);
}

for (const [file, names] of exportsOf) {
  for (const name of names) {
    if (allImported.has(name)) continue;
    const usedInTests = word(name).test(testSource);
    // A star-import consumer counts: `import * as store` then `store.foo()`.
    const starUsed = [...sources.entries()].some(([f, src]) => {
      if (f === file) return false;
      const alias = (importsOf.get(f) || []).find((i) => i.name.startsWith("*") && i.from.includes(basename(file, ".js")));
      return alias && word(alias.name.slice(1) + "." + name).test(src);
    });
    if (starUsed) continue;
    if (usedInTests) {
      notes.push(`${file}: ${name} — read only by the harness`);
    } else {
      findings.push(`${file}: exports ${name}, and nothing imports it`);
    }
  }
}

// --- 2. every named import a file never uses ------------------------------
for (const [file, imps] of importsOf) {
  const src = sources.get(file);
  // strip the import block so an import line does not count as a use
  const body = src.replace(/^import[\s\S]*?from\s+["'][^"']+["'];?$/gm, "");
  for (const i of imps) {
    const name = i.name.startsWith("*") ? i.name.slice(1) : i.name;
    const uses = (body.match(word(name)) || []).length;
    if (uses === 0) findings.push(`${file}: imports ${name} from ${i.from} and never uses it`);
  }
}

// --- 3. every data table has a consumer in src/ ---------------------------
// The ledger promises every table names the module that consumes it.
const srcBody = [...sources.entries()]
  .filter(([f]) => f.startsWith("src/"))
  .map(([, s]) => s).join("\n");

for (const [file, names] of exportsOf) {
  if (!file.startsWith("data-")) continue;
  for (const name of names) {
    if (word(name).test(srcBody)) continue;
    if (word(name).test(testSource)) {
      notes.push(`${file}: ${name} — extracted and tested, but no shipped surface reads it`);
    } else {
      findings.push(`${file}: ${name} is extracted and nothing reads it at all`);
    }
  }
}

console.log(`\nDead-data scan: ${files.length} files\n`);
if (notes.length) {
  console.log("Notes (triage, not necessarily findings):");
  for (const n of notes) console.log("  · " + n);
  console.log("");
}
if (findings.length) {
  console.log("Findings:");
  for (const f of findings) console.log("  ✗ " + f);
  console.log("");
  process.exit(1);
}
console.log("No dead data.\n");
