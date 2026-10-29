/* Loudness map for one DJ set, so the page background can follow the actual sound.

   node tools/levels.mjs <audio or video file> <youtube video id>

   Reads the file with ffmpeg (on PATH, or set FFMPEG=path/to/ffmpeg) and writes data/levels/<id>.json:
   20 readings a second of overall loudness and of the bass (below ~150 Hz), each scaled 0–255 between the
   set's own quiet floor (5th percentile) and its loudest moments (99.5th percentile). The page lines these
   up with the YouTube player's position while the set plays. Use the same recording that is on YouTube,
   or the background will drift out of time with it. */
import { spawn } from "node:child_process";
import fs from "node:fs";

const [file, id] = process.argv.slice(2);
if (!file || !id) { console.error("usage: node tools/levels.mjs <audio or video file> <youtube video id>"); process.exit(1); }
const FF = process.env.FFMPEG || "ffmpeg";
const RATE = 8000, HOP = 0.05, N = RATE * HOP;

function pcm(filter) {
  return new Promise((resolve, reject) => {
    const args = ["-v", "error", "-i", file, "-vn", "-ac", "1", "-ar", String(RATE), ...(filter ? ["-af", filter] : []), "-f", "s16le", "-"];
    const p = spawn(FF, args);
    const chunks = [];
    p.stdout.on("data", (c) => chunks.push(c));
    p.stderr.on("data", (d) => process.stderr.write(d));
    p.on("error", reject);
    p.on("close", (code) => (code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error("ffmpeg exited with " + code))));
  });
}
/* RMS level of each 50 ms window, in dBFS */
function levels(buf) {
  const n = Math.floor(buf.length / 2 / N), out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < N; j++) { const v = buf.readInt16LE((i * N + j) * 2) / 32768; sum += v * v; }
    out[i] = 10 * Math.log10(sum / N + 1e-10);
  }
  return out;
}
function scale(db) {
  const sorted = Array.from(db).sort((a, b) => a - b);
  const lo = sorted[Math.floor(sorted.length * 0.05)], hi = sorted[Math.floor(sorted.length * 0.995)];
  const out = new Uint8Array(db.length);
  for (let i = 0; i < db.length; i++) out[i] = Math.max(0, Math.min(255, Math.round(((db[i] - lo) / Math.max(1, hi - lo)) * 255)));
  return { out, lo, hi };
}

const full = scale(levels(await pcm(null)));
const bass = scale(levels(await pcm("lowpass=f=150,lowpass=f=150")));
const n = Math.min(full.out.length, bass.out.length);
fs.mkdirSync("data/levels", { recursive: true });
fs.writeFileSync(`data/levels/${id}.json`, JSON.stringify({
  id, hop: HOP, seconds: +(n * HOP).toFixed(2), dBFS: [+full.lo.toFixed(1), +full.hi.toFixed(1)],
  loud: Buffer.from(full.out.subarray(0, n)).toString("base64"),
  bass: Buffer.from(bass.out.subarray(0, n)).toString("base64"),
}) + "\n");
console.log(`data/levels/${id}.json — ${n} readings (${(n * HOP / 60).toFixed(1)} min), loudness ${full.lo.toFixed(1)} to ${full.hi.toFixed(1)} dBFS`);
