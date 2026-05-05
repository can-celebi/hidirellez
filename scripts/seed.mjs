// Seed the garden with seven gentle Turkish wishes so visitors arrive
// to a tree that already has a few glowing bundles in the soil.
//
// Run once:   node scripts/seed.mjs
//
// Each wish is encrypted with a known passphrase (printed below) so the
// gardener can dig them up later if they want to reveal one as fulfilled.

const URL = "https://script.google.com/macros/s/AKfycbxxOJZfaioDy70WeXWXFRUoOqKqq_82yIAu3hkp-PcLIHtcZL6g-lpSbe-9uGp73TKu/exec";
const SHARED_PASSWORD = "hidirellez";  // unlocks any of the seed wishes

const SEEDS = [
  { label: "fil",     text: "Cesaretim filinki kadar sakin ve sağlam olsun." },
  { label: "sincap",  text: "Küçük şeyler bana sincapın bir fındıkta bulduğu sevinci versin." },
  { label: "kelebek", text: "Değişimlerim hep güzelliğe doğru olsun." },
  { label: "bulut",   text: "Yumuşak yerlerde dinlenebileyim." },
  { label: "kale",    text: "Sevdiklerime evim hep bir kale gibi gelsin." },
  { label: "süpürge", text: "Eski yaraların tozunu süpüreyim." },
  { label: "kandil",  text: "Sonradan gelen biri için hep küçük bir ışığım kalsın." },
];

const PBKDF2_ITERATIONS = 250_000;
const SALT_LEN = 16;
const IV_LEN = 12;

async function deriveKey(password, salt) {
  const km = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    km, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
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
  return Buffer.from(blob).toString("base64");
}

console.log(`→ planting ${SEEDS.length} seed wishes (password: ${SHARED_PASSWORD})\n`);

let planted = 0;
for (const seed of SEEDS) {
  const ct = await encryptWish(seed.text, SHARED_PASSWORD);
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ label: seed.label, ciphertext: ct }),
  });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch (_) {}
  const ok = !json || json.ok !== false;
  console.log(`  ${ok ? "✓" : "✗"} ${seed.label.padEnd(10)} ${ok ? "" : "(" + (json?.error || "error") + ")"}`);
  if (ok) planted++;
  await new Promise(r => setTimeout(r, 250));  // gentle pacing
}

console.log(`\n✓ planted ${planted}/${SEEDS.length} seed wishes`);
console.log(`  passphrase to dig any of them up:  ${SHARED_PASSWORD}`);
