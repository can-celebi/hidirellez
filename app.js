// ════════════════════════════════════════════════════════════════
// Hıdırellez — wishes under the digital rose tree
// ════════════════════════════════════════════════════════════════

const CFG = window.HIDIRELLEZ_CONFIG;

// ─── Crypto: AES-GCM-256 + PBKDF2-SHA256 (250k) ─────────────────────

const PBKDF2_ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;

async function deriveKey(password, salt) {
  const km = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
  );
}
async function encryptWish(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv   = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key  = await deriveKey(password, salt);
  const ct   = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext)
  );
  const blob = new Uint8Array(SALT_LEN + IV_LEN + ct.byteLength);
  blob.set(salt, 0); blob.set(iv, SALT_LEN); blob.set(new Uint8Array(ct), SALT_LEN + IV_LEN);
  return bytesToB64(blob);
}
async function decryptWish(b64, password) {
  const blob = b64ToBytes(b64);
  const salt = blob.slice(0, SALT_LEN);
  const iv   = blob.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ct   = blob.slice(SALT_LEN + IV_LEN);
  const key  = await deriveKey(password, salt);
  const pt   = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}
function bytesToB64(b) { let s = ""; for (let i=0; i<b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
function b64ToBytes(b64) { const s = atob(b64); const o = new Uint8Array(s.length); for (let i=0; i<s.length; i++) o[i] = s.charCodeAt(i); return o; }

// ─── Stars + petals + fireflies ─────────────────────────────────────

(function makeStars() {
  const sky = document.querySelector(".stars");
  if (!sky) return;
  const N = window.innerWidth < 600 ? 80 : 130;
  for (let i = 0; i < N; i++) {
    const s = document.createElement("span");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top  = Math.random() * 100 + "%";
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
    s.style.transform = `scale(${(0.4 + Math.random() * 1.1).toFixed(2)})`;
    sky.appendChild(s);
  }
})();

(function makePetals() {
  const layer = document.querySelector(".petals");
  if (!layer) return;
  const N = window.innerWidth < 600 ? 26 : 52;
  const palette = ["#f4a8b5", "#d97a8a", "#c24658", "#f0c75e", "#ffe6c2"];
  for (let i = 0; i < N; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = (14 + Math.random() * 24).toFixed(1) + "s";
    p.style.animationDelay    = (Math.random() * 35).toFixed(1) + "s";
    const r = Math.random();
    p.style.background = palette[r < 0.5 ? 0 : r < 0.8 ? 1 : r < 0.9 ? 2 : r < 0.97 ? 3 : 4];
    const sz = (6 + Math.random() * 8).toFixed(1) + "px";
    p.style.width = sz; p.style.height = sz;
    p.style.opacity = (0.35 + Math.random() * 0.45).toFixed(2);
    p.style.transform = `scale(${(0.5 + Math.random() * 1.2).toFixed(2)})`;
    layer.appendChild(p);
  }
})();

function makeFireflies(layer, count, palette) {
  if (!layer) return;
  for (let i = 0; i < count; i++) {
    const f = document.createElement("span");
    f.className = "firefly";
    f.style.left = Math.random() * 100 + "%";
    f.style.top  = Math.random() * 100 + "%";
    f.style.animationDuration = (6 + Math.random() * 12).toFixed(1) + "s";
    f.style.animationDelay    = (Math.random() * 18).toFixed(1) + "s";
    const c = palette[Math.floor(Math.random() * palette.length)];
    f.style.background = c;
    // size variety — some fat lazy bugs, some tiny zippy ones
    const sz = (1.5 + Math.random() * 3).toFixed(1) + "px";
    f.style.width = sz; f.style.height = sz;
    f.style.boxShadow = `0 0 8px ${c}, 0 0 22px ${c}, 0 0 44px ${c}AA`;
    // randomised flight path — dx/dy ranges much wider, with mid-curve points
    const dx = (Math.random() * 220 - 110).toFixed(0);
    const dy = (Math.random() * 200 - 100).toFixed(0);
    const mx = (Math.random() * 60 - 30).toFixed(0);
    const my = (Math.random() * 60 - 30).toFixed(0);
    f.style.setProperty("--ff-dx", dx + "px");
    f.style.setProperty("--ff-dy", dy + "px");
    f.style.setProperty("--ff-mx", mx + "px");
    f.style.setProperty("--ff-my", my + "px");
    layer.appendChild(f);
  }
}

makeFireflies(
  document.querySelector(".soil-fireflies"),
  window.innerWidth < 600 ? 32 : 55,
  ["#f0c75e", "#f0c75e", "#f0c75e", "#f4a8b5", "#4ec9c9", "#fff5d4"]
);
makeFireflies(
  document.querySelector(".tree-fireflies"),
  window.innerWidth < 600 ? 30 : 52,
  ["#f0c75e", "#f4a8b5", "#f4a8b5", "#fff5d4", "#4ec9c9", "#f0c75e"]
);
makeFireflies(
  document.querySelector(".about-fireflies"),
  window.innerWidth < 600 ? 22 : 38,
  ["#f0c75e", "#f4a8b5", "#fff5d4", "#4ec9c9", "#f0c75e"]
);

// ─── The rose tree ──────────────────────────────────────────────────

const ROSE_POSITIONS = [
  // [x, y, size]
  [ 70, 470, 1.10], [ 95, 440, 0.95], [125, 415, 0.85], [155, 395, 0.75],
  [195, 475, 1.05], [230, 460, 0.85], [255, 440, 0.75], [275, 410, 0.65],
  [110, 365, 0.85], [140, 340, 0.75], [180, 360, 0.70],
  [730, 470, 1.10], [705, 440, 0.95], [675, 415, 0.85], [645, 395, 0.75],
  [605, 475, 1.05], [570, 460, 0.85], [545, 440, 0.75], [525, 410, 0.65],
  [690, 365, 0.85], [660, 340, 0.75], [620, 360, 0.70],
  [170, 285, 1.10], [200, 305, 0.90], [225, 340, 0.80], [260, 360, 0.75],
  [290, 370, 0.70], [320, 350, 0.65],
  [630, 285, 1.10], [600, 305, 0.90], [575, 340, 0.80], [540, 360, 0.75],
  [510, 370, 0.70], [480, 350, 0.65],
  [285, 130, 1.05], [310, 175, 0.85], [335, 215, 0.75], [355, 250, 0.70],
  [515, 130, 1.05], [490, 175, 0.85], [465, 215, 0.75], [445, 250, 0.70],
  [355, 130, 0.90], [380, 110, 0.80], [400, 85, 1.00], [420, 110, 0.80], [445, 130, 0.90],
  [400, 165, 0.85], [400, 220, 0.75], [400, 280, 0.80], [400, 360, 0.70],
];

// Leaf clusters anchored at actual branch endpoints from the SVG paths,
// so leaves sit on twigs instead of floating in empty space.
const LEAF_CLUSTERS = [
  // [x, y, count, spread]
  // ─── lower-left branch tips ───
  [ 70, 470, 5, 22], [ 90, 440, 4, 20], [110, 380, 4, 22], [230, 480, 5, 24],
  // ─── lower-right branch tips ───
  [730, 470, 5, 22], [710, 440, 4, 20], [690, 380, 4, 22], [570, 480, 5, 24],
  // ─── mid-left branch tips ───
  [170, 300, 6, 28], [200, 310, 4, 22], [250, 400, 4, 22], [290, 370, 4, 22],
  // ─── mid-right branch tips ───
  [630, 300, 6, 28], [600, 310, 4, 22], [550, 400, 4, 22], [510, 370, 4, 22],
  // ─── upper-left ───
  [290, 140, 5, 26], [320, 200, 4, 22], [320, 230, 4, 22],
  // ─── upper-right ───
  [510, 140, 5, 26], [480, 200, 4, 22], [480, 230, 4, 22],
  // ─── crown ───
  [360, 140, 4, 22], [440, 140, 4, 22], [400, 100, 5, 24], [400, 200, 4, 22],
];

// Anchor points where small twigs fan out, with the golden angle (≈137.5°)
// driving the spacing between successive sub-branches at each anchor. Each
// anchor sits at an existing branch endpoint or strong segment.
const TWIG_ANCHORS = [
  // [cx, cy, count, baseLen, baseAngle]
  // lower fans (bigger fans on the outer reaches)
  [ 70, 470, 9, 18, 200], [ 90, 440, 6, 14, 210], [110, 380, 6, 14, 200],
  [730, 470, 9, 18, 340], [710, 440, 6, 14, 330], [690, 380, 6, 14, 340],
  [230, 480, 5, 12, 220], [570, 480, 5, 12, 320],
  // mid fans
  [170, 300, 7, 16, 210], [630, 300, 7, 16, 330],
  [200, 310, 5, 12, 200], [600, 310, 5, 12, 340],
  [250, 400, 5, 12, 200], [550, 400, 5, 12, 340],
  [290, 370, 4, 10, 230], [510, 370, 4, 10, 310],
  // upper fans
  [290, 140, 7, 14, 230], [510, 140, 7, 14, 310],
  [320, 200, 5, 12, 220], [480, 200, 5, 12, 320],
  [320, 230, 4, 10, 230], [480, 230, 4, 10, 310],
  // crown fans
  [360, 140, 5, 11, 250], [440, 140, 5, 11, 290],
  [400, 100, 8, 16, 270], [400, 200, 5, 12, 270],
];

const GOLDEN_ANGLE_DEG = 137.5077640500378;

(function plantTree() {
  const rosesG    = document.querySelector(".rose-tree .roses");
  const leavesG   = document.querySelector(".rose-tree .leaves");
  const branchesG = document.querySelector(".rose-tree .branches");
  if (!rosesG || !leavesG || !branchesG) return;

  const NS = "http://www.w3.org/2000/svg";

  // ─── Procedurally fan extra twigs at anchor points (golden-angle spacing) ───
  for (const [cx, cy, count, baseLen, baseAngle] of TWIG_ANCHORS) {
    for (let i = 0; i < count; i++) {
      const ang = (baseAngle + i * GOLDEN_ANGLE_DEG) * Math.PI / 180;
      const len = baseLen * (0.7 + Math.random() * 0.6);
      const x2 = cx + Math.cos(ang) * len;
      const y2 = cy + Math.sin(ang) * len;
      const cxc = cx + Math.cos(ang) * len * 0.4 + Math.sin(ang) * 4;
      const cyc = cy + Math.sin(ang) * len * 0.4 - Math.cos(ang) * 4;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d",
        `M${cx.toFixed(1)},${cy.toFixed(1)} Q ${cxc.toFixed(1)},${cyc.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
      path.setAttribute("stroke", "url(#trunk-grad)");
      path.setAttribute("stroke-width", (1.6 + Math.random() * 1.6).toFixed(1));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("fill", "none");
      // Bypass the dash-draw CSS for twigs — they'd flicker through partial
      // states with the line-glow blur filter. Use a simple opacity fade-in.
      path.style.strokeDasharray = "none";
      path.style.opacity = "0";
      path.style.setProperty("--twig-final-opacity", (0.75 + Math.random() * 0.2).toFixed(2));
      path.style.animation = `twig-fade ${(1 + Math.random()*0.6).toFixed(2)}s ease-out ${(1.0 + Math.random() * 1.6).toFixed(2)}s forwards`;
      branchesG.appendChild(path);

      // Each twig usually ends in a tiny terminal twiglet (recursive feel)
      if (Math.random() < 0.55) {
        const ang2 = ang + (Math.random() - 0.5) * 0.8;
        const len2 = len * (0.4 + Math.random() * 0.3);
        const x3 = x2 + Math.cos(ang2) * len2;
        const y3 = y2 + Math.sin(ang2) * len2;
        const tw = document.createElementNS(NS, "path");
        tw.setAttribute("d", `M${x2.toFixed(1)},${y2.toFixed(1)} L ${x3.toFixed(1)},${y3.toFixed(1)}`);
        tw.setAttribute("stroke", "url(#trunk-grad)");
        tw.setAttribute("stroke-width", "1.1");
        tw.setAttribute("stroke-linecap", "round");
        tw.setAttribute("fill", "none");
        tw.style.strokeDasharray = "none";
        tw.style.opacity = "0";
        tw.style.setProperty("--twig-final-opacity", "0.65");
        tw.style.animation = `twig-fade 0.8s ease-out ${(1.5 + Math.random() * 1.6).toFixed(2)}s forwards`;
        branchesG.appendChild(tw);
      }
    }
  }

  // ─── Leaves ───
  for (const [cx, cy, count, spread] of LEAF_CLUSTERS) {
    for (let i = 0; i < count; i++) {
      const dx = (Math.random() - 0.5) * spread;
      const dy = (Math.random() - 0.5) * spread;
      const rot = Math.random() * 360;
      const sc = 0.7 + Math.random() * 0.7;
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", "M 0,-7 C 4,-3 4,4 0,7 C -4,4 -4,-3 0,-7 Z");
      path.setAttribute("fill", Math.random() > 0.5 ? "#20a4a4" : "#4ec9c9");
      path.setAttribute("opacity", (0.55 + Math.random() * 0.3).toFixed(2));
      path.setAttribute("transform", `translate(${cx + dx} ${cy + dy}) rotate(${rot}) scale(${sc})`);
      path.style.animationDelay = (1.5 + Math.random() * 1.5).toFixed(2) + "s";
      leavesG.appendChild(path);
    }
  }

  // ─── Roses (3-level nesting):
  //   wrap (positioning)   →  rose (bloom-in)  →  rose-sway (gentle wind)  →  <use>
  ROSE_POSITIONS.forEach(([x, y, sc], idx) => {
    const wrap = document.createElementNS(NS, "g");
    wrap.setAttribute("transform", `translate(${x} ${y}) scale(${sc})`);

    const rose = document.createElementNS(NS, "g");
    rose.setAttribute("class", "rose");
    rose.style.animationDelay = (2.0 + idx * 0.06).toFixed(2) + "s";

    const sway = document.createElementNS(NS, "g");
    sway.setAttribute("class", "rose-sway");
    // randomize each rose's sway timing so they don't move in lockstep
    const dur = (4 + Math.random() * 3).toFixed(2);
    const delay = (Math.random() * 5).toFixed(2);
    sway.style.animation = `sway ${dur}s ease-in-out ${delay}s infinite`;

    const use = document.createElementNS(NS, "use");
    use.setAttribute("href", "#rose-symbol");
    sway.appendChild(use);
    rose.appendChild(sway);
    wrap.appendChild(rose);
    rosesG.appendChild(wrap);
  });
})();

// ════════════════════════════════════════════════════════════════
// PLANT MODAL
// ════════════════════════════════════════════════════════════════

const plantModal = document.getElementById("plant-modal");
const openPlantBtns = [document.getElementById("plant-orb")].filter(Boolean);
openPlantBtns.forEach(b => b.addEventListener("click", openPlantModal));

document.querySelectorAll("[data-close-plant]").forEach(b =>
  b.addEventListener("click", closePlantModal));

plantModal.addEventListener("click", (e) => {
  if (e.target === plantModal) closePlantModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!plantModal.classList.contains("hidden")) closePlantModal();
    if (!modal.classList.contains("hidden"))      closeDig();
  }
});

function openPlantModal() {
  plantModal.classList.remove("hidden");
  burstPetals(plantModal.querySelector(".modal-petals"));
  const card = plantModal.querySelector(".modal-card");
  card.style.animation = "none";
  void card.offsetHeight;
  card.style.animation = "";
  setTimeout(() => document.getElementById("wish").focus(), 600);
  document.body.style.overflow = "hidden";
}
function closePlantModal() {
  plantModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function burstPetals(container) {
  if (!container) return;
  container.innerHTML = "";
  const palette = ["#f4a8b5", "#d97a8a", "#c24658", "#f0c75e", "#ffe6c2"];
  const N = 24;
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + Math.random() * 0.4;
    const dist  = 220 + Math.random() * 260;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const p = document.createElement("span");
    p.className = "burst-petal";
    p.style.setProperty("--dx", `calc(-50% + ${dx}px)`);
    p.style.setProperty("--dy", `calc(-50% + ${dy}px)`);
    p.style.background = palette[Math.floor(Math.random() * palette.length)];
    p.style.animationDelay = (Math.random() * 0.3).toFixed(2) + "s";
    p.style.transform = "translate(-50%, -50%)";
    container.appendChild(p);
  }
  setTimeout(() => container.innerHTML = "", 2000);
}

// ─── Plant a wish ───────────────────────────────────────────────────

const plantForm   = document.getElementById("plant-form");
const plantStatus = document.getElementById("plant-status");

plantForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const wish  = document.getElementById("wish").value.trim();
  const label = document.getElementById("label").value.trim();
  const pw1   = document.getElementById("password").value;
  const pw2   = document.getElementById("password2").value;

  if (!wish || !label || !pw1) return;
  if (pw1 !== pw2) { setStatus(plantStatus, "the two passwords don't match.", "err"); return; }

  setStatus(plantStatus, "sealing your wish…", "");

  let ciphertext;
  try {
    ciphertext = await encryptWish(wish, pw1);
  } catch (err) {
    setStatus(plantStatus, "could not seal: " + err.message, "err");
    return;
  }

  if (!CFG.APPS_SCRIPT_URL || CFG.APPS_SCRIPT_URL.includes("REPLACE_DEPLOYMENT_ID")) {
    setStatus(plantStatus,
      "the garden isn't connected yet (config.js). your sealed wish is below — keep it safe.", "warn");
    showLocalPayload(label, ciphertext);
    return;
  }

  const submitBtn = plantForm.querySelector('button[type="submit"]');
  fireBurialAnimation(submitBtn, hashHue(label));

  try {
    const res = await fetch(CFG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ label, ciphertext }),
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch (_) {}
    if (json && json.ok === false) throw new Error(json.error || "server rejected the wish");
    setStatus(plantStatus, "buried. the earth has it now. ✦", "ok");
    plantForm.reset();
    setTimeout(() => {
      closePlantModal();
      loadGarden();
      document.getElementById("garden").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1400);
  } catch (err) {
    setStatus(plantStatus, "could not bury: " + err.message, "err");
  }
});

function setStatus(el, msg, kind) { el.textContent = msg; el.className = "status " + (kind || ""); }

function showLocalPayload(label, ciphertext) {
  const old = plantStatus.parentNode.querySelector(".payload-box");
  if (old) old.remove();
  const box = document.createElement("pre");
  box.className = "payload-box";
  box.textContent = JSON.stringify({ label, ciphertext }, null, 2);
  plantStatus.after(box);
}

function fireBurialAnimation(sourceEl, hue) {
  const overlay = document.getElementById("burial-overlay");
  if (!overlay) return;
  const rect = sourceEl.getBoundingClientRect();
  const orb = document.createElement("div");
  orb.className = "burial-orb";
  orb.style.left = (rect.left + rect.width / 2 - 12) + "px";
  orb.style.top  = (rect.top  + rect.height / 2 - 12) + "px";
  orb.style.background =
    `radial-gradient(circle, hsl(${hue},75%,75%) 0%, hsl(${hue},65%,55%) 60%, transparent 80%)`;
  orb.style.boxShadow =
    `0 0 30px hsl(${hue},70%,70%), 0 0 60px hsl(${hue},65%,60%)`;
  overlay.appendChild(orb);
  setTimeout(() => orb.remove(), 1700);
}

// ─── The garden ─────────────────────────────────────────────────────

const gardenList  = document.getElementById("garden-list");
const gardenCount = null;

async function loadGarden() {
  if (!CFG.APPS_SCRIPT_URL || CFG.APPS_SCRIPT_URL.includes("REPLACE_DEPLOYMENT_ID")) {
    gardenList.innerHTML =
      `<p class="loading">the garden isn't connected yet. edit <code>config.js</code> with your apps script url.</p>`;
    return;
  }

  let rows;
  try {
    const res = await fetch(CFG.APPS_SCRIPT_URL + "?_=" + Date.now());
    const json = await res.json();
    rows = (json.rows || []).filter(r => r.label && r.ct);
    // Hide a small set of legacy test rows from the view until the gardener
    // gets around to running cleanup() in the Apps Script editor.
    const HIDE = new Set(["setup-test", "ffffff", "kandil"]);
    rows = rows.filter(r => !HIDE.has(r.label) && !r.label.startsWith("node-roundtrip-") && !r.label.startsWith("test-"));
  } catch (err) {
    gardenList.innerHTML = `<p class="loading">could not read the garden: ${err.message}</p>`;
    return;
  }

  if (!rows.length) {
    gardenList.innerHTML = `<p class="loading">no wishes have been buried yet. be the first.</p>`;
    if (gardenCount) gardenCount.textContent = "";
    return;
  }

  // Random order — soft shuffle so the garden looks alive each visit.
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  if (gardenCount) {
    const fulfilledN = rows.filter(r => r.revealed_text).length;
    const total = rows.length;
    let txt = total === 1 ? "· 1 wish buried ·" : `· ${total} wishes buried ·`;
    if (fulfilledN > 0) txt += `   ${fulfilledN} came true ✦`;
    gardenCount.textContent = txt;
  }

  gardenList.innerHTML = "";
  for (const row of rows) {
    const hue = hashHue(row.label);
    const fulfilled = !!(row.revealed_text);
    const card = document.createElement("button");
    card.className = "wish-bundle" + (fulfilled ? " fulfilled" : "");
    card.type = "button";
    card.style.setProperty("--hue", String(hue));
    // Each wish gets its own breathing rhythm + tremble so the garden never pulses in lockstep.
    card.style.setProperty("--pulse-dur",     (3.5 + Math.random() * 4).toFixed(2) + "s");
    card.style.setProperty("--breathe-dur",   (4.5 + Math.random() * 4).toFixed(2) + "s");
    card.style.setProperty("--pulse-delay",   (Math.random() * 4).toFixed(2) + "s");
    card.style.setProperty("--tremble-dur",   (5 + Math.random() * 6).toFixed(2) + "s");
    card.style.setProperty("--tremble-delay", (Math.random() * 5).toFixed(2) + "s");
    // Per-wish translation offsets break the rigid grid so the garden looks
    // chaotic — alive, scattered like seeds settled into uneven soil.
    const ox = (Math.random() * 30 - 15).toFixed(0);
    const oy = (Math.random() * 30 - 15).toFixed(0);
    const rot = (Math.random() * 8 - 4).toFixed(1);
    card.style.setProperty("--scatter-x", ox + "px");
    card.style.setProperty("--scatter-y", oy + "px");
    card.style.setProperty("--scatter-r", rot + "deg");
    card.innerHTML = `
      <div class="medallion-wrap">
        ${sparkleStars(fulfilled ? 6 : 3)}
        <div class="medallion-glow"></div>
        ${medallionSvg(hue, fulfilled)}
      </div>
      <span class="bundle-label">${escapeHtml(row.label)}</span>
      ${fulfilled
        ? `<span class="fulfilled-tag">✦ came true ✦</span>`
        : `<span class="bundle-when">${formatWhen(row.ts)}</span>`}
    `;
    card.addEventListener("click", () => openDig(row));
    gardenList.appendChild(card);
  }
}

function sparkleStars(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + Math.random() * 0.6;
    const r = 50 + Math.random() * 18;
    const x = 48 + Math.cos(angle) * r;
    const y = 48 + Math.sin(angle) * r;
    const dur = (1.8 + Math.random() * 2.5).toFixed(2);
    const delay = (Math.random() * 4).toFixed(2);
    out.push(`<span class="sparkle"
      style="left:${x}px;top:${y}px;
             animation-duration:${dur}s;animation-delay:${delay}s;
             font-size:${(7 + Math.random()*4).toFixed(0)}px">✦</span>`);
  }
  return out.join("");
}

function medallionSvg(hue, fulfilled) {
  const c = (s, l, a) => `hsla(${hue},${s}%,${l}%,${a})`;
  const dotColor = "#f0c75e";
  const ringColor = fulfilled ? "rgba(240,199,94,0.7)" : c(60, 60, 0.4);
  return `
    <svg class="medallion-svg" viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="core-${hue}-${fulfilled ? "f" : "n"}" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stop-color="${fulfilled ? "#fff5d4" : c(80, 88, 1)}"/>
          <stop offset="50%" stop-color="${fulfilled ? "rgba(240,199,94,0.85)" : c(70, 65, 0.8)}"/>
          <stop offset="100%" stop-color="${c(60, 50, 0)}"/>
        </radialGradient>
      </defs>
      <path d="M 0 -42 L 10 -10 L 42 0 L 10 10 L 0 42 L -10 10 L -42 0 L -10 -10 Z"
            fill="none" stroke="${c(55, 60, 0.35)}" stroke-width="0.7"/>
      <path d="M 0 -42 L 10 -10 L 42 0 L 10 10 L 0 42 L -10 10 L -42 0 L -10 -10 Z"
            fill="none" stroke="${c(60, 65, 0.45)}" stroke-width="0.6"
            transform="rotate(22.5)"/>
      <circle r="32" fill="none" stroke="${ringColor}" stroke-width="0.5" stroke-dasharray="2 3"/>
      <circle r="28" fill="${c(55, 50, 0.18)}"/>
      <circle r="22" fill="${c(60, 55, 0.3)}"/>
      <g class="medallion-core core-pulse">
        <circle r="16" fill="url(#core-${hue}-${fulfilled ? "f" : "n"})"/>
        <circle r="9"  fill="${fulfilled ? "rgba(255,245,212,0.9)" : c(75, 80, 0.85)}"/>
        <circle r="3"  fill="${fulfilled ? "#fff" : c(85, 95, 1)}"/>
      </g>
      <circle cx="0"   cy="-32" r="1.4" fill="${dotColor}"/>
      <circle cx="32"  cy="0"   r="1.4" fill="${dotColor}"/>
      <circle cx="0"   cy="32"  r="1.4" fill="${dotColor}"/>
      <circle cx="-32" cy="0"   r="1.4" fill="${dotColor}"/>
      <circle cx="22"  cy="-22" r="0.9" fill="${c(70, 70, 0.7)}"/>
      <circle cx="22"  cy="22"  r="0.9" fill="${c(70, 70, 0.7)}"/>
      <circle cx="-22" cy="22"  r="0.9" fill="${c(70, 70, 0.7)}"/>
      <circle cx="-22" cy="-22" r="0.9" fill="${c(70, 70, 0.7)}"/>
    </svg>
  `;
}

function hashHue(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}
function formatWhen(ts) {
  if (!ts) return "";
  const m = /Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/.exec(String(ts));
  let d;
  if (m) d = new Date(+m[1], +m[2], +m[3], +m[4], +m[5], +m[6]);
  else   d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ════════════════════════════════════════════════════════════════
// DIG-UP MODAL — supports public reveal
// ════════════════════════════════════════════════════════════════

const modal      = document.getElementById("dig-modal");
const modalClose = document.getElementById("modal-close");
const digBody    = document.getElementById("dig-body");
const digLabel   = document.getElementById("dig-label");
const digResult  = document.getElementById("dig-result");
let currentRow = null;
let currentPlaintext = null;

function openDig(row) {
  currentRow = row;
  currentPlaintext = null;
  digLabel.textContent = row.label;
  digResult.innerHTML = "";

  if (row.revealed_text) {
    digBody.innerHTML = `<p class="hint">This wish has been revealed by its wisher — it came true.</p>`;
    digResult.innerHTML = `
      <div class="revealed public-reveal">
        <p class="revealed-label">✦ revealed ✦</p>
        <p class="revealed-text">${escapeHtml(row.revealed_text)}</p>
      </div>`;
  } else {
    digBody.innerHTML = `
      <p class="hint">Enter the password the wisher chose.</p>
      <form id="dig-form">
        <input id="dig-password" type="password" placeholder="Password" autocomplete="off" required />
        <button type="submit" class="btn primary">Open</button>
      </form>`;
    bindDigForm();
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    const inp = document.getElementById("dig-password");
    if (inp) inp.focus();
  }, 50);
}
function closeDig() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  currentRow = null;
  currentPlaintext = null;
}
modalClose.addEventListener("click", closeDig);
modal.addEventListener("click", (e) => { if (e.target === modal) closeDig(); });

function bindDigForm() {
  const form = document.getElementById("dig-form");
  const pwd  = document.getElementById("dig-password");
  if (!form || !pwd) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentRow) return;
    digResult.innerHTML = `<p class="muted">brushing the soil away…</p>`;
    try {
      const pt = await decryptWish(currentRow.ct, pwd.value);
      currentPlaintext = pt;
      digResult.innerHTML = `
        <div class="revealed">
          <p class="revealed-label">the wish reads</p>
          <p class="revealed-text">${escapeHtml(pt)}</p>
        </div>
        <div class="reveal-action">
          <p>Did this wish come true? Reveal it to the garden so others can read it.</p>
          <button type="button" id="reveal-btn" class="btn btn-reveal">✦ Reveal as fulfilled ✦</button>
          <p id="reveal-status" class="status" style="margin-top:0.8rem"></p>
        </div>`;
      document.getElementById("reveal-btn").addEventListener("click", revealCurrent);
    } catch (err) {
      digResult.innerHTML = `<p class="err-msg">that's not the right password. the wish stays sealed.</p>`;
    }
  });
}

async function revealCurrent() {
  if (!currentRow || !currentPlaintext) return;
  const btn = document.getElementById("reveal-btn");
  const status = document.getElementById("reveal-status");
  if (!confirm("Once revealed, your wish becomes public to anyone visiting this garden. Continue?")) return;
  btn.disabled = true;
  status.textContent = "lighting it up…";
  status.className = "status";
  try {
    const res = await fetch(CFG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "reveal",
        ciphertext: currentRow.ct,
        revealed_text: currentPlaintext,
      }),
    });
    const text = await res.text();
    let json = null; try { json = JSON.parse(text); } catch (_) {}
    if (json && json.ok === false) {
      // Most likely cause: the Apps Script wasn't redeployed to the version
      // that knows about the "reveal" action; the old one then routes to
      // handlePlant_ which complains about a missing label.
      const hint = (json.error || "").includes("missing")
        ? " — has the Apps Script been redeployed with the latest apps-script.gs?"
        : "";
      throw new Error((json.error || "server rejected the reveal") + hint);
    }
    status.textContent = "revealed ✦ — your wish now glows for everyone";
    status.className = "status ok";
    setTimeout(loadGarden, 1500);
    setTimeout(closeDig, 2500);
  } catch (err) {
    status.textContent = "could not reveal: " + err.message;
    status.className = "status err";
    btn.disabled = false;
  }
}

// ════════════════════════════════════════════════════════════════
// Info popovers (oriental ? icon → text)
// ════════════════════════════════════════════════════════════════

document.querySelectorAll(".info-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = btn.dataset.infoTarget;
    const pop = document.getElementById(id);
    if (!pop) return;
    const wasOpen = pop.classList.contains("open");
    document.querySelectorAll(".info-popover.open").forEach(p => {
      p.classList.remove("open"); p.hidden = true;
    });
    if (!wasOpen) {
      pop.hidden = false;
      requestAnimationFrame(() => pop.classList.add("open"));
    }
  });
});
document.addEventListener("click", () => {
  document.querySelectorAll(".info-popover.open").forEach(p => {
    p.classList.remove("open");
    setTimeout(() => { p.hidden = true; }, 250);
  });
});

// ════════════════════════════════════════════════════════════════
// Garden breeze — pulsing wishes emit fireflies that drift away
// ════════════════════════════════════════════════════════════════

function startGardenBreeze() {
  const breeze = document.querySelector(".breeze");
  const spines = document.querySelector(".spines");
  if (!breeze) return;
  const tick = () => {
    const bundles = document.querySelectorAll(".wish-bundle");
    if (bundles.length) {
      const n = Math.random() < 0.4 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const target = bundles[Math.floor(Math.random() * bundles.length)];
        emitWishFirefly(target, breeze);
      }
      // Spines flicker often — energy connections between wishes in every direction.
      if (spines && bundles.length >= 2) {
        if (Math.random() < 0.85) flickerSpine(spines, bundles);
        if (Math.random() < 0.40) flickerSpine(spines, bundles);  // sometimes a second
        if (Math.random() < 0.12) flickerSpine(spines, bundles);  // rare third
      }
    }
    setTimeout(tick, 320 + Math.random() * 680);
  };
  setTimeout(tick, 1200);
}

// Every minute or so, swap two random wishes in the DOM so the garden
// reshuffles itself softly. The wishes are alive — they don't stay put.
function startGardenShuffle() {
  const tick = () => {
    const list = document.getElementById("garden-list");
    if (list) {
      const cards = Array.from(list.children).filter(c => c.classList.contains("wish-bundle"));
      if (cards.length >= 2) {
        const a = Math.floor(Math.random() * cards.length);
        let b = Math.floor(Math.random() * cards.length);
        while (b === a) b = Math.floor(Math.random() * cards.length);
        const aN = cards[a], bN = cards[b];
        const aNext = aN.nextSibling === bN ? aN : aN.nextSibling;
        const bNext = bN.nextSibling === aN ? bN : bN.nextSibling;
        list.insertBefore(aN, bNext);
        list.insertBefore(bN, aNext);
      }
    }
    setTimeout(tick, 45000 + Math.random() * 45000);  // every 45–90s
  };
  setTimeout(tick, 30000);  // first shuffle 30s after load
}

function flickerSpine(layer, bundles) {
  const a = bundles[Math.floor(Math.random() * bundles.length)];
  let b = bundles[Math.floor(Math.random() * bundles.length)];
  if (b === a) {
    b = bundles[(Array.from(bundles).indexOf(a) + 1) % bundles.length];
  }
  const aw = a.querySelector(".medallion-wrap");
  const bw = b.querySelector(".medallion-wrap");
  if (!aw || !bw) return;
  const ar = aw.getBoundingClientRect();
  const br = bw.getBoundingClientRect();
  const lr = layer.getBoundingClientRect();
  const x1 = ar.left + ar.width  / 2 - lr.left;
  const y1 = ar.top  + ar.height / 2 - lr.top;
  const x2 = br.left + br.width  / 2 - lr.left;
  const y2 = br.top  + br.height / 2 - lr.top;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Skip if the two wishes are too far apart visually — keeps the network legible.
  if (len < 50 || len > 480) return;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const hueA = a.style.getPropertyValue("--hue") || "40";
  const hueB = b.style.getPropertyValue("--hue") || "40";
  const spine = document.createElement("div");
  spine.className = "spine";
  spine.style.left = x1 + "px";
  spine.style.top  = y1 + "px";
  spine.style.width = len + "px";
  spine.style.transform = `rotate(${angle}deg)`;
  spine.style.background =
    `linear-gradient(90deg,
        hsla(${hueA},78%,72%,0) 0%,
        hsla(${hueA},80%,80%,0.85) 18%,
        hsla(${(parseInt(hueA)+parseInt(hueB))/2},80%,85%,1) 50%,
        hsla(${hueB},80%,80%,0.85) 82%,
        hsla(${hueB},78%,72%,0) 100%)`;
  spine.style.boxShadow =
    `0 0 8px hsl(${hueA},75%,72%), 0 0 18px hsla(${hueB},65%,60%,0.5)`;
  layer.appendChild(spine);
  setTimeout(() => spine.remove(), 2700);
}

function emitWishFirefly(bundleEl, breezeLayer) {
  const wrap = bundleEl.querySelector(".medallion-wrap");
  if (!wrap) return;
  const wRect = wrap.getBoundingClientRect();
  const bRect = breezeLayer.getBoundingClientRect();
  const x = (wRect.left - bRect.left) + wRect.width / 2;
  const y = (wRect.top  - bRect.top)  + wRect.height / 2;
  // skip if the wish is far offscreen (saves DOM churn while user is far away)
  if (y < -200 || y > bRect.height + 200) return;

  const hue = bundleEl.style.getPropertyValue("--hue") || "40";
  const fulfilled = bundleEl.classList.contains("fulfilled");
  const orb = document.createElement("span");
  orb.className = "wish-firefly";
  orb.style.left = x + "px";
  orb.style.top  = y + "px";

  const angle = Math.random() * Math.PI * 2;
  const dist  = 60 + Math.random() * 240;
  orb.style.setProperty("--ox", (Math.cos(angle) * dist).toFixed(0) + "px");
  orb.style.setProperty("--oy", (Math.sin(angle) * dist).toFixed(0) + "px");
  orb.style.setProperty("--dur", (3 + Math.random() * 3).toFixed(2) + "s");

  const c = fulfilled ? "#fff5d4" : `hsl(${hue},78%,75%)`;
  orb.style.background = c;
  orb.style.boxShadow =
    `0 0 8px ${c}, 0 0 18px hsl(${hue},65%,60%), 0 0 36px hsla(${hue},60%,55%,0.55)`;
  const sz = (2 + Math.random() * 2.5).toFixed(1) + "px";
  orb.style.width = sz; orb.style.height = sz;

  breezeLayer.appendChild(orb);
  setTimeout(() => orb.remove(), 7000);
}

// ════════════════════════════════════════════════════════════════
// Soil cracks — light bleeds through the underground tile pattern
// ════════════════════════════════════════════════════════════════

function startSoilCracks() {
  const layer = document.querySelector(".soil-cracks");
  if (!layer) return;
  const palette = ["#f0c75e", "#f4a8b5", "#4ec9c9", "#fff5d4", "#f0c75e"];
  const tick = () => {
    const horizontal = Math.random() < 0.5;
    const len = 30 + Math.random() * 90;
    const c = palette[Math.floor(Math.random() * palette.length)];
    const crack = document.createElement("span");
    crack.className = "crack";
    if (horizontal) {
      crack.style.width  = len + "px";
      crack.style.height = "2px";
      crack.style.background = `linear-gradient(90deg, transparent, ${c} 50%, transparent)`;
    } else {
      crack.style.width  = "2px";
      crack.style.height = len + "px";
      crack.style.background = `linear-gradient(180deg, transparent, ${c} 50%, transparent)`;
    }
    crack.style.boxShadow = `0 0 14px ${c}, 0 0 28px ${c}90`;
    crack.style.left = Math.random() * 100 + "%";
    crack.style.top  = Math.random() * 100 + "%";
    crack.style.animationDuration = (1.6 + Math.random() * 2.4).toFixed(2) + "s";
    layer.appendChild(crack);
    setTimeout(() => crack.remove(), 4500);
    // sometimes a small starburst at the same spot for emphasis
    if (Math.random() < 0.25) {
      const star = document.createElement("span");
      star.className = "crack-star";
      star.style.left = crack.style.left;
      star.style.top  = crack.style.top;
      star.style.color = c;
      layer.appendChild(star);
      setTimeout(() => star.remove(), 2200);
    }
    setTimeout(tick, 600 + Math.random() * 1700);
  };
  setTimeout(tick, 600);
}

// ════════════════════════════════════════════════════════════════
// Creatures of light — slow lantern-like beings on long orbits
// ════════════════════════════════════════════════════════════════

function spawnCreatures() {
  const layer = document.querySelector(".creatures");
  if (!layer) return;
  const palette = [
    { c: "#f0c75e", glow: "rgba(240,199,94,0.7)" },
    { c: "#f4a8b5", glow: "rgba(244,168,181,0.7)" },
    { c: "#4ec9c9", glow: "rgba(78,201,201,0.7)" },
    { c: "#fff5d4", glow: "rgba(255,245,212,0.7)" },
  ];
  const N = window.innerWidth < 600 ? 3 : 5;
  for (let i = 0; i < N; i++) {
    const { c, glow } = palette[i % palette.length];
    const creature = document.createElement("span");
    creature.className = "creature";
    // each creature has its own long, looping CSS-keyframed path
    const dur = (28 + Math.random() * 32).toFixed(0) + "s";
    creature.style.animationDuration = dur;
    creature.style.animationDelay = (-Math.random() * 30).toFixed(1) + "s";
    creature.style.setProperty("--c-color", c);
    creature.style.setProperty("--c-glow",  glow);
    // randomized starting region so they don't cluster
    creature.style.setProperty("--c-base-x", (10 + Math.random() * 80).toFixed(0) + "%");
    creature.style.setProperty("--c-base-y", (15 + Math.random() * 70).toFixed(0) + "%");
    // each creature gets a different of 3 motion patterns
    const variants = ["creature-orbit-a", "creature-orbit-b", "creature-orbit-c"];
    creature.style.animationName = variants[i % variants.length];
    layer.appendChild(creature);
  }
}

// ─── Footer link & boot ────────────────────────────────────────────
const repoLink = document.getElementById("repo-link");
if (repoLink && CFG.REPO_URL) repoLink.href = CFG.REPO_URL;

loadGarden().then(() => {
  startGardenBreeze();
  startGardenShuffle();
});
startSoilCracks();
spawnCreatures();
