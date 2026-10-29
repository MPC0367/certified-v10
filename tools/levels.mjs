/* Sound map for one DJ set, so the page background can react to the actual music.

   node tools/levels.mjs <audio or video file> <youtube video id>

   Reads the file with ffmpeg (on PATH, or set FFMPEG=path/to/ffmpeg) and writes data/levels/<id>.json with
   25 readings a second of:
     loud  overall loudness
     bass  below ~150 Hz (kick drums, sub)          -> the background swells
     mid   ~200 Hz–2.5 kHz (snares, claps, synths)  -> the light warms up
     high  above ~4 kHz (hi-hats, cymbals)           -> fine shimmer
     kick  0 except on detected kicks, where it holds the strength of the hit -> a short flash
   Each band is scaled 0–255 between the set's own quiet floor (5th percentile) and its loud moments
   (99.5th percentile), so quiet and loud sets react alike. Kicks are sudden rises in bass energy over the
   previous quarter-second, at least 0.2 s apart. Use the same recording that is on YouTube, or the
   background will drift out of time with it. */
import { spawn } from "node:child_process";
import fs from "node:fs";

const [file, id] = process.argv.slice(2);
if (!file || !id) { console.error("usage: node tools/levels.mjs <audio or video file> <youtube video id>"); process.exit(1); }
const FF = process.env.FFMPEG || "ffmpeg";
const RATE = 16000, HOP = 0.04, N = Math.round(RATE * HOP);

/* stream ffmpeg's PCM and keep only the RMS of each 40 ms window, in dBFS */
function band(filter) {
  return new Promise((resolve, reject) => {
    const args = ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(RATE), ...(filter ? ["-af", filter] : []), "-f", "s16le", "-"];
    const p = spawn(FF, args);
    const out = [];
    let sum = 0, n = 0, carry = null;
    p.stdout.on("data", (chunk) => {
      if (carry) { chunk = Buffer.concat([carry, chunk]); carry = null; }
      const even = chunk.length - (chunk.length % 2);
      for (let i = 0; i < even; i += 2) {
        const v = chunk.readInt16LE(i) / 32768;
        sum += v * v;
        if (++n === N) { out.push(10 * Math.log10(sum / N + 1e-10)); sum = 0; n = 0; }
      }
      if (even < chunk.length) carry = chunk.subarray(even);
    });
    p.stderr.on("data", (d) => process.stderr.write(d));
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve(out) : reject(new Error("ffmpeg exited with " + code))));
  });
}
function pct(arr, q) { const s = Array.from(arr).sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; }
function scale(db) {
  const lo = pct(db, 0.05), hi = pct(db, 0.995), out = new Uint8Array(db.length);
  for (let i = 0; i < db.length; i++) out[i] = Math.max(0, Math.min(255, Math.round(((db[i] - lo) / Math.max(1, hi - lo)) * 255)));
  return { out, lo, hi };
}
/* kicks: rise of bass energy over the previous ~0.25 s, peak-picked with a 0.2 s gap, and only where the
   bass is actually loud (a quiet stretch would otherwise turn faint hi-hat rumble into "kicks") */
function kicks(bassDb, bassScaled) {
  const n = bassDb.length, rise = new Float64Array(n), W = Math.round(0.24 / HOP);
  for (let i = W; i < n; i++) {
    let avg = 0;
    for (let j = i - W; j < i; j++) avg += bassDb[j];
    rise[i] = Math.max(0, bassDb[i] - avg / W);
  }
  for (let i = 0; i < n; i++) if (bassScaled[i] < 100) rise[i] = 0;
  const top = pct(rise.filter((v) => v > 0), 0.98) || 1, gap = Math.round(0.2 / HOP), out = new Uint8Array(n);
  let last = -gap;
  for (let i = 1; i < n - 1; i++) {
    const v = rise[i] / top;
    if (v > 0.3 && rise[i] >= rise[i - 1] && rise[i] >= rise[i + 1] && i - last >= gap) { out[i] = Math.min(255, Math.round(v * 255)); last = i; }
  }
  return out;
}

const loudDb = await band(null);
const bassDb = await band("lowpass=f=150,lowpass=f=150");
const midDb = await band("highpass=f=200,lowpass=f=2500");
const highDb = await band("highpass=f=4000,highpass=f=4000");
const n = Math.min(loudDb.length, bassDb.length, midDb.length, highDb.length);
const loud = scale(loudDb.slice(0, n)), bass = scale(bassDb.slice(0, n)), mid = scale(midDb.slice(0, n)), high = scale(highDb.slice(0, n));
const kick = kicks(bassDb.slice(0, n), bass.out);
const b64 = (u8) => Buffer.from(u8).toString("base64");
fs.mkdirSync("data/levels", { recursive: true });
fs.writeFileSync(`data/levels/${id}.json`, JSON.stringify({
  id, v: 2, hop: HOP, seconds: +(n * HOP).toFixed(2), dBFS: [+loud.lo.toFixed(1), +loud.hi.toFixed(1)],
  loud: b64(loud.out), bass: b64(bass.out), mid: b64(mid.out), high: b64(high.out), kick: b64(kick),
}) + "\n");
const k = kick.reduce((a, v) => a + (v > 0 ? 1 : 0), 0);
console.log(`data/levels/${id}.json — ${n} readings (${(n * HOP / 60).toFixed(1)} min), ${k} kicks (~${Math.round(k / (n * HOP / 60))} per minute), loudness ${loud.lo.toFixed(1)} to ${loud.hi.toFixed(1)} dBFS`);
