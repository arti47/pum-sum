// Foundational constants, DOM helpers and raw dice. No imports (template §6.1).

export const APP_VERSION = "1.0.0";
export const STORAGE_KEY = "umState";
export const STATE_VERSION = 1;

// --- dice -------------------------------------------------------------------
// Cryptographic source, never Math.random (template §5.1). Rejection-sampled so
// every face is exactly equally likely regardless of die size.
export function die(sides) {
  if (!Number.isInteger(sides) || sides < 2) throw new Error("die: bad size " + sides);
  const limit = Math.floor(4294967296 / sides) * sides;
  const buf = new Uint32Array(1);
  let n;
  do {
    crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= limit);
  return (n % sides) + 1;
}

export const d10 = () => die(10);
export const d100 = () => die(100);

export function uid(prefix = "id") {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  return `${prefix}-${buf[0].toString(36)}${buf[1].toString(36)}`;
}

// --- DOM --------------------------------------------------------------------
// Null-safe element factory: nullish children are skipped, so
// el("div", {}, maybe && node) can never render the literal text "null" (D-1).
export function el(tag, attrs = null, ...children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "text") node.textContent = v;
      else if (k === "dataset") Object.assign(node.dataset, v);
      else if (k.startsWith("on") && typeof v === "function") {
        node.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v === true) node.setAttribute(k, "");
      else node.setAttribute(k, String(v));
    }
  }
  add(node, ...children);
  return node;
}

// The matching append helper. Use it for EVERY append of a value that can be null.
export function add(parent, ...children) {
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false || c === true || c === "") continue;
    parent.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return parent;
}

export function clear(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export const $ = (sel, root = document) => root.querySelector(sel);

// --- formatting -------------------------------------------------------------
export function fmtRange(min, max) {
  return min === max ? String(min) : `${min}-${max}`;
}

export function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function fmtDay(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric",
  });
}

export function announce(text) {
  const region = document.getElementById("live-region");
  if (!region) return;
  region.textContent = "";
  // Re-assign on the next frame so repeat announcements are not swallowed.
  requestAnimationFrame(() => { region.textContent = text; });
}
