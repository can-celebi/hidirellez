// ─── Hıdırellez backend — Google Apps Script ─────────────────────────
//
// Paste this whole file into a new project at https://script.google.com,
// then Deploy → New deployment → Web app:
//   • Execute as:  me
//   • Who has access:  Anyone
// Copy the resulting /exec URL into config.js as APPS_SCRIPT_URL.
//
// On first request the script auto-creates a Google Sheet
// named "Hıdırellez Wishes" in your Drive and remembers its ID.
//
// Sheet columns:
//   A  timestamp        — when the wish was buried
//   B  label            — public marker stone
//   C  ciphertext       — base64 of salt+iv+AES-GCM(plaintext, password) — opaque
//   D  revealed_at      — when the wisher publicly revealed it as fulfilled (optional)
//   E  revealed_text    — the plaintext, only present when the wisher chose to reveal
//
// API (all POSTs are JSON in text/plain to avoid CORS preflight):
//
//   GET  /exec
//     → { rows: [{ ts, label, ct, revealed_at, revealed_text }, …] }
//
//   POST /exec   { label, ciphertext }
//     → { ok: true }       — appends a new wish row
//
//   POST /exec   { action: "reveal", ciphertext, revealed_text }
//     → { ok: true }       — finds row by ciphertext, writes revealed_at + revealed_text
//
// The reveal handler trusts that whoever has the ciphertext has the right
// to reveal it. The ciphertext is effectively a per-wish capability: anyone
// who can decrypt it (i.e. has the password) saw the plaintext, and anyone
// can read the ciphertext from the sheet. We rely on social honor here,
// not on cryptographic auth — appropriate for a friends-only rose tree.

const SHEET_TAB  = "wishes";
const MAX_LABEL  = 200;
const MAX_CT     = 10000;
const MAX_REVEAL = 5000;

const HEADERS = ["timestamp", "label", "ciphertext", "revealed_at", "revealed_text"];

function doGet() {
  const sh = getOrCreateSheet_();
  const values = sh.getDataRange().getValues();
  const rows = values.slice(1).map(r => ({
    ts:            r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ""),
    label:         String(r[1] || ""),
    ct:            String(r[2] || ""),
    revealed_at:   r[3] instanceof Date ? r[3].toISOString() : String(r[3] || ""),
    revealed_text: String(r[4] || ""),
  })).filter(r => r.label && r.ct);
  return jsonOut_({ rows });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: "bad json" });
  }

  const action = String(data.action || "plant");

  if (action === "reveal") return handleReveal_(data);
  return handlePlant_(data);
}

function handlePlant_(data) {
  const label = String(data.label || "").trim().slice(0, MAX_LABEL);
  const ct    = String(data.ciphertext || "").trim();
  if (!label || !ct)       return jsonOut_({ ok: false, error: "missing fields" });
  if (ct.length > MAX_CT)  return jsonOut_({ ok: false, error: "ciphertext too long" });

  const sh = getOrCreateSheet_();
  sh.appendRow([new Date(), label, ct, "", ""]);
  return jsonOut_({ ok: true });
}

function handleReveal_(data) {
  const ct  = String(data.ciphertext || "").trim();
  const txt = String(data.revealed_text || "").trim().slice(0, MAX_REVEAL);
  if (!ct || !txt) return jsonOut_({ ok: false, error: "missing fields" });

  const sh = getOrCreateSheet_();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][2]) === ct) {
      sh.getRange(i + 1, 4).setValue(new Date());
      sh.getRange(i + 1, 5).setValue(txt);
      return jsonOut_({ ok: true, revealed: true });
    }
  }
  return jsonOut_({ ok: false, error: "wish not found" });
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// One-shot cleanup helper. Run manually from the Apps Script editor:
// pick "cleanup" in the function dropdown next to Run, then click Run.
// Wipes early test rows (setup-test, node-roundtrip-*, ffffff).
function cleanup() {
  const TEST_LABELS = new Set(["setup-test", "ffffff", "kandil"]);
  const sh = getOrCreateSheet_();
  const values = sh.getDataRange().getValues();
  let n = 0;
  for (let i = values.length - 1; i >= 1; i--) { // skip header, walk bottom-up
    const label = String(values[i][1] || "");
    if (TEST_LABELS.has(label) || label.startsWith("node-roundtrip-") || label.startsWith("test-")) {
      sh.deleteRow(i + 1);
      n++;
    }
  }
  Logger.log("Deleted " + n + " test rows");
}

function getOrCreateSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SHEET_ID");
  let ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { id = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create("Hıdırellez Wishes");
    props.setProperty("SHEET_ID", ss.getId());
  }
  let sh = ss.getSheetByName(SHEET_TAB);
  if (!sh) {
    sh = ss.getSheets()[0];
    sh.setName(SHEET_TAB);
  }
  // Ensure all five header columns exist
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
  } else {
    const existing = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
    for (let i = 0; i < HEADERS.length; i++) {
      if (existing[i] !== HEADERS[i]) sh.getRange(1, i + 1).setValue(HEADERS[i]);
    }
  }
  return sh;
}
