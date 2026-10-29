/* Builds the sub-pages (artists, sets, events, booking, internships, 404), the shared assets and the sitemap
   from data/*.json. The homepage stays hand-maintained in index.html; its stylesheet and Thai dictionary are
   shared from it, so every page looks and translates the same.
   Run from the repo root:  node tools/build.mjs */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const BASE = "/certified-v10/";
const ORIGIN = "https://mpc0367.github.io";
const BUILD = process.env.BUILD_TAG || "Build R32 · 29 Oct 2026";
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => { const f = path.join(ROOT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const json = (p) => JSON.parse(read(p));

const { artists, mc, group } = json("data/artists.json");
const { sets } = json("data/sets.json");
const { events, updated: scheduleUpdated } = json("data/events.json");
const merch = json("data/merch.json");
const intake = json("data/intake.json");
const home = read("index.html");

/* ---------- shared assets from the homepage ---------- */
const homeCSS = home.match(/<style>\n([\s\S]*?)\n<\/style>\n<noscript>/)[1];
const homeTH = home.match(/<script>\n([\s\S]*?)\n<\/script>/)[1];
if (!homeTH.includes("window.CV_TH")) throw new Error("the first inline script is not the Thai dictionary");
const o2credit = home.match(/<!-- the studio credit[\s\S]*?<\/p>\n/)[0];

const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const A = (id) => artists.find((a) => a.id === id);
const setById = (id) => sets.find((s) => s.id === id);
const evBySlug = (slug) => events.find((e) => e.slug === slug);
const url = (p = "") => ORIGIN + BASE + p;
const mmss = (sec) => { const m = Math.floor(sec / 60), s = sec % 60; return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`; };
const longDate = (iso) => new Date(iso + (iso.length === 10 ? "T12:00:00+07:00" : "")).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });
const dayNum = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", timeZone: "Asia/Bangkok" });
const monYr = (iso) => new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).toUpperCase();
/* Thai twins for the dates written into the HTML; registered as dictionary keys so the language toggle swaps them */
const monYrTH = (iso) => new Date(iso).toLocaleDateString("th-TH-u-ca-gregory", { month: "short", year: "numeric", timeZone: "Asia/Bangkok" });
const longDateTH = (iso) => new Date(iso + (iso.length === 10 ? "T12:00:00+07:00" : "")).toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });
const cityHTML = (c) => c === "Bangkok" ? '<span data-i18n="ev.bkk">Bangkok</span>' : h(c);
const placeHTML = (e) => `${cityHTML(e.city)}, ${(e.country || "Thailand") === "Thailand" ? '<span data-i18n="ev.thai">Thailand</span>' : h(e.country)}`;
const tzHTML = '<span data-i18n="ev.tz">Bangkok time, GMT+7</span>';
function evKeys(e) {
  TH[`ev.date.${e.slug}`] = e.dateText.th;
  TH[`ev.mon.${e.slug}`] = monYrTH(e.start);
  if (e.timeText) TH[`ev.time.${e.slug}`] = e.timeText.th;
}
const NOW = Date.now();
const evEnd = (e) => e.endDate ? Date.parse(e.endDate + "T00:00:00+07:00") + 86400000 : Date.parse(e.start) + (e.allDay ? 86400000 : 12 * 3600000);
const upcoming = events.filter((e) => evEnd(e) > NOW).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

/* ---------- Thai for sub-page strings (the homepage dictionary already covers shared ones) ---------- */
const TH = {
  "pg.home": "หน้าแรก", "pg.sets": "ดีเจเซ็ต", "pg.events": "อีเวนต์", "pg.booking": "จองดีเจ", "pg.interns": "ฝึกงาน",
  "nav.sets": "เซ็ต", "nav.events": "อีเวนต์", "nav.jobsP": "ฝึกงาน", "nav.bookP": "จองเลย",
  "pg.back": "← ไลน์อัพ", "pg.backEvents": "← อีเวนต์ทั้งหมด", "pg.backHome": "← หน้าแรก",
  "ft.pages": "หน้าต่าง ๆ", "ft.djs": "ดีเจ", "ft.line": "LINE ↗︎",
  "ar.bioSrc": "— จากคำอธิบายของ Certified V10 บน YouTube", "ar.book": "จอง {a}", "ar.intl": "จองจากต่างประเทศ", "ar.watch": "ดูเซ็ตเต็ม ↓",
  "ar.next": "งานถัดไปที่ยืนยันแล้ว", "ar.nextNone": "ยังไม่มีงานที่ประกาศ — ติดตาม @certified_v10 เพื่อรอวันถัดไป",
  "ar.sched": "ตารางงาน", "ar.schedLede": "งานที่มีป้าย ยืนยันแล้ว คืองานจริงที่ประกาศแล้ว ส่วนวันในคลับที่มีป้าย ตัวอย่าง เป็นข้อมูลตัวอย่าง จนกว่าจะเชื่อมกับปฏิทินการจองของ Certified",
  "ar.posterOpen": "ดูโปสเตอร์ขนาดเต็ม", "ar.posterHint": "ดูขนาดเต็ม", "ar.close": "ปิด", "ar.posterCap": "โปสเตอร์นี้สร้างจากตารางข้างต้น และจะอัปเดตตามข้อมูลเสมอ",
  "ar.set": "เซ็ตเต็ม", "ar.setLede": "บันทึกสดจากช่อง YouTube ทางการของ Certified", "ar.others": "สมาชิกคนอื่นในยูนิต", "ar.allSets": "ดูเซ็ตทั้งหมด →",
  "ar.bandT": "จอง {a}", "ar.go": "โปรไฟล์และเซ็ต →",
  "st.label": "ดีเจเซ็ต", "st.t1": "ฟังเสียง", "st.t2": "ของยูนิต",
  "st.lede": "เซ็ตเต็มจากช่องทางการของ Certified V10 — บันทึกสดที่ After Sun Studio และ Wingstop Rave กดเล่นเพื่อดูที่นี่ หรือเปิดบน YouTube",
  "st.yt": "ดูบน YouTube ↗︎", "st.play": "เล่นเซ็ต", "st.recorded": "บันทึกเมื่อ", "st.bandT1": "ชอบสิ่งที่ได้ยินไหม?", "st.bandT2": "จองยูนิตนี้",
  "ev.label": "อีเวนต์", "ev.t1": "งานถัดไป", "ev.t2": "และงานที่ผ่านมา", "ev.lede": "ทุกงานที่ Certified ขึ้นเล่น — วันที่ สถานที่ และลิงก์บัตรจากผู้จัดโดยตรง งานที่ผ่านมาเก็บไว้พร้อมเซ็ตที่บันทึกไว้",
  "ev.up": "เร็ว ๆ นี้", "ev.past": "งานที่ผ่านมา", "ev.none": "ยังไม่มีงานที่ประกาศ — ติดตาม @certified_v10",
  "ev.k.date": "วันที่", "ev.k.time": "เวลา", "ev.k.venue": "สถานที่", "ev.k.by": "ผู้จัด", "ev.k.head": "เฮดไลเนอร์", "ev.k.lineup": "ไลน์อัพ", "ev.k.unit": "จากยูนิต", "ev.k.tickets": "บัตร",
  "ev.tickets": "ซื้อบัตรที่ {p}", "ev.book": "จองยูนิตสำหรับงานของคุณ", "ev.sets": "เซ็ตที่บันทึกจากงานนี้", "ev.setTimes": "ยังไม่ประกาศเวลาเซ็ตของแต่ละคน",
  "bk.label": "จองดีเจ", "bk.t1": "เล่าเรื่องงาน", "bk.t2": "ของคุณให้เราฟัง",
  "bk.lede": "เลือกดีเจหรือทั้งยูนิต แล้วบอกวันและสถานที่ ทีมงานจะยืนยันคิวว่างและขั้นตอนถัดไป",
  "bk.modeV": "งานในไทย", "bk.modeVd": "คลับ เฟสติวัล งานแบรนด์ หรือปาร์ตี้ส่วนตัวในประเทศไทย",
  "bk.modeI": "จองจากต่างประเทศ", "bk.modeId": "จัดงานนอกประเทศไทย? ใส่ปลายทางและวันที่เสนอ รายละเอียดการเดินทางและโปรดักชันคุยกับทีมได้",
  "bk.s1": "ใคร", "bk.s2": "งาน", "bk.s3": "ติดต่อ",
  "bk.who": "อยากจองใคร?", "bk.unit": "ทั้งยูนิต", "bk.help": "ช่วยเลือกให้หน่อย",
  "bk.format": "ประเภทงาน", "bk.f.club": "คลับไนต์", "bk.f.fest": "เฟสติวัล", "bk.f.show": "คอนเสิร์ตหรือโชว์", "bk.f.brand": "งานแบรนด์หรืองานเปิดตัว", "bk.f.private": "ปาร์ตี้ส่วนตัว", "bk.f.wedding": "งานแต่งงาน", "bk.f.other": "อื่น ๆ", "bk.choose": "เลือก…",
  "bk.date": "วันจัดงาน", "bk.tbc": "ยังไม่ระบุวัน", "bk.time": "เวลาเริ่ม (เวลาท้องถิ่น)", "bk.setlen": "ความยาวเซ็ต", "bk.len.1": "1 ชั่วโมง", "bk.len.2": "2 ชั่วโมง", "bk.len.3": "3 ชั่วโมง", "bk.len.x": "นานกว่านั้น / คุยกันได้",
  "bk.venue": "ชื่อสถานที่", "bk.city": "เมือง", "bk.country": "ประเทศ", "bk.audience": "จำนวนผู้ชมโดยประมาณ", "bk.budget": "งบประมาณ", "bk.budgetHint": "ช่วงงบหรือพิมพ์ “คุยกัน” — ไม่บังคับ", "bk.currency": "สกุลเงิน",
  "bk.tz": "เขตเวลาของงาน", "bk.travel": "ตั๋วเครื่องบิน", "bk.hotel": "ที่พัก", "bk.ground": "การเดินทางในพื้นที่", "bk.cover": "ผู้จัดรับผิดชอบ", "bk.discuss": "คุยกัน",
  "bk.details": "เล่าเรื่องงานให้ฟัง", "bk.detailsHint": "คอนเซ็ปต์ ไลน์อัพ แนวเพลง หรืออะไรก็ได้ที่ช่วยให้ทีมเข้าใจงาน",
  "bk.name": "ชื่อของคุณ", "bk.email": "อีเมล", "bk.org": "องค์กรหรือสถานที่", "bk.orgHint": "สถานที่ โปรโมเตอร์ แบรนด์ หรือ “บุคคล”", "bk.phone": "โทรศัพท์ (พร้อมรหัสประเทศ)",
  "bk.web": "เว็บไซต์หรือโซเชียล", "bk.contact": "ช่องทางที่สะดวก", "bk.opt": "ไม่บังคับ",
  "bk.submit": "เตรียมข้อความจอง", "bk.privacy": "หน้านี้ไม่ได้ส่งหรือเก็บข้อมูลใด ๆ ข้อความจะถึง Certified เมื่อคุณกดส่งใน LINE หรือ Instagram เท่านั้น",
  "bk.readyT": "ข้อความจองพร้อมแล้ว", "bk.readyD": "ส่งถึง Certified ทาง LINE หรือ Instagram ยังไม่มีอะไรถูกส่ง และการสอบถามยังไม่ใช่การยืนยันการจอง",
  "bk.sendLine": "ส่งทาง LINE", "bk.sendIg": "คัดลอกแล้วเปิด Instagram DM", "bk.copy": "คัดลอกข้อความ",
  "bk.alt": "อยากคุยก่อน? แอด LINE ของ Certified หรือ DM @certified_v10 บน Instagram",
  "in.label": "ฝึกงาน", "in.roles": "ตำแหน่ง", "in.closedNote": "เมื่อเปิดรับรอบถัดไป รายละเอียดการสมัครจะแสดงที่นี่",
  "in.follow": "ติดตามบน Instagram", "in.apply": "สมัครรอบนี้",
  "pg.merch": "เมิร์ช",
  "mc.label": "เมิร์ช", "mc.t1": "เมิร์ช", "mc.t2": "จากยูนิต",
  "mc.lede": "เมิร์ชทางการของ Certified V10 กำลังจะมา สินค้าด้านล่างเป็นตัวอย่างชั่วคราว ดีไซน์ รูป ไซซ์ และราคาจริงจะประกาศก่อนวันวางขาย",
  "mc.soon": "เร็ว ๆ นี้", "mc.soonD": "ยังไม่เปิดขาย — กดรับแจ้งเตือนทาง LINE หรือติดตาม @certified_v10 เพื่อไม่พลาดวันวางขาย",
  "mc.notifyAll": "รับแจ้งเตือนทาง LINE", "mc.follow": "ติดตามบน Instagram",
  "mc.items": "สินค้า", "mc.ph": "ตัวอย่าง", "mc.tbc": "รอประกาศราคา", "mc.notify": "แจ้งเตือนฉัน",
  "mc.drop": "รายละเอียดการวางขาย", "mc.k.date": "วันวางขาย", "mc.k.order": "วิธีสั่งซื้อ", "mc.k.ship": "การจัดส่ง", "mc.k.pickup": "รับที่งาน",
  "mc.tba": "รอประกาศ", "mc.back": "← เมิร์ชทั้งหมด", "mc.stock": "ยังไม่มีจำหน่าย", "mc.size": "ไซซ์", "mc.qty": "จำนวน",
  "mc.less": "ลดจำนวน", "mc.more": "เพิ่มจำนวน", "mc.order": "สั่งซื้อ — ยังไม่เปิดขาย", "mc.notifyLine": "แจ้งเตือนฉันทาง LINE",
  "mc.buyNote": "เปิดสั่งซื้อเมื่อประกาศวันวางขาย ตอนนี้ยังซื้อหรือชำระเงินบนเว็บไซต์นี้ไม่ได้",
  "mc.k.material": "วัสดุและทรง", "mc.k.guide": "ตารางไซซ์", "mc.k.delivery": "การจัดส่ง", "mc.k.returns": "การคืนสินค้าและติดต่อ",
  "mc.more2": "เมิร์ชอื่น ๆ", "mc.empty": "ยังไม่มีสินค้าจำหน่าย", "mc.dropNote": "ข้อมูลทั้งหมดในหน้านี้เป็นตัวอย่างจนกว่า Certified จะประกาศรายละเอียดจริง",
  "st.latest": "เซ็ตล่าสุด", "st.muted": "ตัวอย่างแบบปิดเสียงในคุณภาพสูงสุด — กด “เล่นพร้อมเสียง” เพื่อฟัง", "st.sound": "เล่นพร้อมเสียง", "st.now": "กำลังเล่น",
  "bk.type": "ประเภทการจอง", "ev.bkk": "กรุงเทพฯ", "ev.thai": "ประเทศไทย", "ev.tz": "เวลากรุงเทพฯ GMT+7",
  "ar.confirmed": "ยืนยันแล้ว", "ev.credit": "อาร์ตเวิร์กทางการ — จาก @certified_v10",
  "lost.t1": "หลง", "lost.t2": "ทางแล้ว", "lost.d": "ไม่พบหน้านี้ ลองเริ่มจากหน้าแรก หรือดูไลน์อัพ",
};
events.forEach(evKeys);
TH["ar.upd"] = "อัปเดตตารางเมื่อ " + longDateTH(scheduleUpdated) + ".";

/* ---------- page frame ---------- */
function head({ title, desc, pathRel, image, ld = [], noindex = false }) {
  const can = url(pathRel);
  const img = image ? (image.startsWith("http") ? image : url(image)) : url("img/og.jpg");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${h(title)}</title>
<meta name="description" content="${h(desc)}">
<meta name="theme-color" content="#0B0B0C">
${noindex ? '<meta name="robots" content="noindex">\n' : `<link rel="canonical" href="${h(can)}">\n`}<meta property="og:url" content="${h(can)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CERTIFIED_V10">
<meta property="og:title" content="${h(title)}">
<meta property="og:description" content="${h(desc)}">
<meta property="og:image" content="${h(img)}">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="th_TH">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230B0B0C'/%3E%3Ccircle cx='32' cy='34' r='19' fill='none' stroke='%23FF3117' stroke-width='5'/%3E%3Cpath d='M32 34 45 19' stroke='%23EDEAE3' stroke-width='5' stroke-linecap='round'/%3E%3Ccircle cx='32' cy='34' r='4.5' fill='%23FF3117'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Anuphan:wght@400;500;600;700&family=Chakra+Petch:wght@400;500;600;700&family=Kanit:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700;1,800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${BASE}assets/site.css">
<noscript><style>.l{transform:none}[data-rev]{opacity:1;transform:none}</style></noscript>
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>`;
}
const NAV = [
  { href: BASE + "#lineup", key: "nav.lineup", en: "Lineup" },
  { href: BASE + "sets/", key: "nav.sets", en: "Sets", id: "sets" },
  { href: BASE + "events/", key: "nav.events", en: "Events", id: "events" },
  { href: BASE + "merch/", key: "nav.merch", en: "Merch", id: "merch" },
  { href: BASE + "internships/", key: "nav.jobsP", en: "Jobs", id: "interns" },
];
function header(current) {
  return `<a class="skip" href="#main" data-i18n="a11y.skip">Skip to content</a>
<header class="nav is-solid" id="nav">
  <a class="nav__brand" href="${BASE}" aria-label="Certified_V10 — home"><img class="nav__logo" src="${BASE}assets/img/logo.png" alt="CERTIFIED_V10" width="933" height="96"></a>
  <nav class="nav__links" aria-label="Pages">
${NAV.map((n) => `    <a href="${n.href}" data-i18n="${n.key}"${n.id === current ? ' aria-current="page"' : ""}>${n.en}</a>`).join("\n")}
    <a class="nav__cta" href="${BASE}booking/" data-i18n="nav.bookP"${current === "booking" ? ' aria-current="page"' : ""}>Book</a>
  </nav>
  <div class="nav__side">
    <span class="nav__clock" id="clock" aria-hidden="true">BKK --:--</span>
    <button class="nav__lang" id="lang-toggle" type="button" aria-label="สลับเป็นภาษาไทย / switch language"><span class="nav__lang-en">EN</span><span class="nav__lang-sep">/</span><span class="nav__lang-th">ไทย</span></button>
    <button class="nav__burger" id="burger" type="button" aria-expanded="false" aria-controls="sheet" aria-label="Menu"><span></span><span></span></button>
  </div>
</header>
<div class="sheet" id="sheet" hidden>
  <nav class="sheet__links" aria-label="Pages">
    <a href="${BASE}"><em>01</em><span data-i18n="pg.home">Home</span></a>
    <a href="${BASE}#lineup"><em>02</em><span data-i18n="sheet.lineup">The lineup</span></a>
    <a href="${BASE}sets/"${current === "sets" ? ' aria-current="page"' : ""}><em>03</em><span data-i18n="pg.sets">DJ sets</span></a>
    <a href="${BASE}events/"${current === "events" ? ' aria-current="page"' : ""}><em>04</em><span data-i18n="pg.events">Events</span></a>
    <a href="${BASE}booking/"${current === "booking" ? ' aria-current="page"' : ""}><em>05</em><span data-i18n="pg.booking">Booking</span></a>
    <a href="${BASE}merch/"${current === "merch" ? ' aria-current="page"' : ""}><em>06</em><span data-i18n="pg.merch">Merch</span></a>
    <a href="${BASE}internships/"${current === "interns" ? ' aria-current="page"' : ""}><em>07</em><span data-i18n="pg.interns">Internships</span></a>
  </nav>
</div>`;
}
function footer() {
  return `<footer class="footer">
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <span>CERTIFIED — V10 — BANGKOK — NIGHTLIFE UNIT — </span><span>CERTIFIED — V10 — BANGKOK — NIGHTLIFE UNIT — </span>
    </div>
  </div>
  <div class="footer__grid">
    <div class="footer__brand">
      <p class="footer__word"><img class="footer__logo" src="${BASE}assets/img/logo.png" alt="CERTIFIED_V10" width="933" height="96" loading="lazy"></p>
      <p class="meta" data-i18n="footer.tag">Bangkok, TH — after midnight.</p>
    </div>
    <nav class="footer__col" aria-label="Follow">
      <p class="meta footer__h" data-i18n="footer.follow">Follow</p>
      <a href="https://www.instagram.com/certified_v10/" target="_blank" rel="noopener">Instagram ↗︎</a>
      <a href="https://www.tiktok.com/@certified_v10" target="_blank" rel="noopener">TikTok ↗︎</a>
      <a href="https://www.youtube.com/@certified_v10" target="_blank" rel="noopener">YouTube ↗︎</a>
      <a href="https://lin.ee/pxpEb2f" target="_blank" rel="noopener">LINE ↗︎</a>
    </nav>
    <nav class="footer__col" aria-label="Pages">
      <p class="meta footer__h" data-i18n="ft.pages">Pages</p>
      <a href="${BASE}" data-i18n="pg.home">Home</a>
      <a href="${BASE}sets/" data-i18n="pg.sets">DJ sets</a>
      <a href="${BASE}events/" data-i18n="pg.events">Events</a>
      <a href="${BASE}booking/" data-i18n="pg.booking">Booking</a>
      <a href="${BASE}merch/" data-i18n="pg.merch">Merch</a>
      <a href="${BASE}internships/" data-i18n="pg.interns">Internships</a>
    </nav>
    <nav class="footer__col" aria-label="DJs">
      <p class="meta footer__h" data-i18n="ft.djs">DJs</p>
${artists.map((a) => `      <a href="${BASE}artists/${a.id}/">${a.name}</a>`).join("\n")}
    </nav>
  </div>
  <div class="footer__fine meta">
    <p data-i18n="footer.d1">© 2026 Certified_V10 concept. Independent design study — not the collective's official site.</p>
    <p data-i18n="footer.d2">Photography is original generated artwork, art-directed for this concept. Venue names appear as public performance credits.</p>
    <p>${h(BUILD)}</p>
  </div>
  ${o2credit.trim()}
</footer>
<nav class="hud" id="hud" aria-label="Follow Certified_V10">
  <p class="hud__links meta">
    <a href="https://www.instagram.com/certified_v10/" target="_blank" rel="noopener">Instagram ↗︎</a>
    <a href="https://www.tiktok.com/@certified_v10" target="_blank" rel="noopener">TikTok ↗︎</a>
    <a href="https://www.youtube.com/@certified_v10" target="_blank" rel="noopener">YouTube ↗︎</a>
  </p>
  <div class="hud__track" aria-hidden="true"><span class="hud__head" id="hud-head"></span></div>
</nav>
<div class="grain" aria-hidden="true"></div>`;
}
function page({ kind, current, headOpts, main, data, extra = "" }) {
  return `${head(headOpts)}
<body class="page page--${kind}" data-lang="en" data-base="${BASE}">
<div class="bgfx" aria-hidden="true"><canvas></canvas></div>
${header(current)}
<main id="main">
${main}
</main>
${footer()}
${extra}
${data ? `<script type="application/json" id="page-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>\n` : ""}<script src="${BASE}assets/site.js" defer></script>
</body>
</html>
`;
}
const secHead = (no, key, en, tag = "h2") => `<header class="sec-head sec-head--dark"><span class="sec-head__no meta" aria-hidden="true">${no}</span><${tag} class="sec-head__label meta" data-i18n="${key}">${en}</${tag}></header>`;
const title2 = (cls, k1, t1, k2, t2, tag = "h1") => `<${tag} class="display ${cls}">
    <span class="lm"><span class="l" data-i18n="${k1}">${t1}</span></span>
    <span class="lm"><span class="l" data-i18n="${k2}">${t2}</span></span>
  </${tag}>`;

/* ---------- pieces ---------- */
/* Thai keys for a set's title, byline and recording date */
function setKeys(v) {
  TH[`st.rec.${v.id}`] = "บันทึกเมื่อ " + longDateTH(v.recorded);
  if (!v.artists.length) TH[`st.by.${v.id}`] = v.by.th;
  TH[`st.t.${v.id}`] = v.title.th;
}
const setBy = (v) => v.artists.length
  ? v.artists.map((id) => `<a href="${BASE}artists/${id}/">${A(id).name}</a>`).join(" · ")
  : `<span data-i18n="st.by.${v.id}">${h(v.by.en)}</span>`;
function videoCard(v, { level = 2, showBy = true } = {}) {
  setKeys(v);
  const by = setBy(v);
  const ev = evBySlug(v.event);
  return `<article class="vcard" data-rev>
      <div class="vcard__media">
        <button class="vcard__play" type="button" data-yt="${h(v.id)}" data-title="${h(v.title.en)}" aria-label="${h("Play: " + v.title.en + " (" + mmss(v.seconds) + ")")}">
          <img src="${BASE}assets/img/sets/${h(v.id)}.jpg" alt="" width="960" height="540" loading="lazy">
          <span class="vcard__badge"><span class="vcard__icon" aria-hidden="true"></span><span class="meta" data-i18n="st.play">Play set</span></span>
          <span class="vcard__len meta" aria-hidden="true">${mmss(v.seconds)}</span>
        </button>
      </div>
      <div class="vcard__body">
        ${showBy ? `<p class="vcard__by meta">${by}</p>` : ""}
        <h${level} class="vcard__title" data-i18n="st.t.${v.id}">${h(v.title.en)}</h${level}>
        <p class="vcard__meta meta">${ev ? `<a href="${BASE}events/${ev.slug}/">${h(ev.title)}</a> · ` : ""}<span data-i18n="st.rec.${v.id}">Recorded ${h(longDate(v.recorded))}</span> · ${mmss(v.seconds)}</p>
        <p class="vcard__genres meta">${h(v.genres)}</p>
        <a class="vcard__yt meta" href="https://www.youtube.com/watch?v=${h(v.id)}" target="_blank" rel="noopener"><span data-i18n="st.yt">Watch on YouTube ↗︎</span></a>
      </div>
    </article>`;
}
function eventCard(e) {
  evKeys(e);
  const poster = e.poster ? `<img class="ecard__thumb" src="${BASE}${e.poster.src}" alt="" width="64" height="80" loading="lazy">` : "";
  const state = evEnd(e) > NOW ? "upcoming" : "past";
  return `<li class="ecard" data-start="${h(e.start)}"${e.allDay ? " data-allday" : ""}${e.endDate ? ` data-end="${h(e.endDate)}T00:00:00+07:00"` : ""}>
        <p class="ecard__date"><span class="ecard__day">${dayNum(e.start)}</span><span class="ecard__mon meta" data-i18n="ev.mon.${e.slug}">${monYr(e.start)}</span></p>
        <div>
          <h3 class="ecard__title"><a href="${BASE}events/${e.slug}/">${h(e.title)}</a></h3>
          <p class="ecard__meta meta"><span data-i18n="ev.date.${e.slug}">${h(e.dateText.en)}</span> · ${h(e.venue)} · ${cityHTML(e.city)}</p>
        </div>
        <div class="ecard__side"><span class="tag ${state === "past" ? "tag--muted" : "tag--red"}" data-state>${state === "past" ? "Past" : "Upcoming"}</span>${poster}</div>
      </li>`;
}
const personLD = (a) => ({
  "@type": "Person", "@id": url(`artists/${a.id}/#person`), name: a.name, alternateName: "DJ " + a.name,
  jobTitle: "DJ", description: a.bio.en, image: url(a.photo), url: url(`artists/${a.id}/`),
  memberOf: { "@type": "MusicGroup", name: "Certified_V10", url: url() },
  ...(a.links.length ? { sameAs: a.links.map((l) => l.url) } : {}),
});
const groupLD = { "@type": "MusicGroup", name: "Certified_V10", alternateName: "CERTIFIED", url: url(), sameAs: ["https://www.instagram.com/certified_v10/", "https://www.tiktok.com/@certified_v10", "https://www.youtube.com/@certified_v10"] };

/* ---------- artist pages ---------- */
for (const a of artists) {
  const set = setById(a.set);
  /* every upcoming show is written out; the page shows the first that hasn't ended, or the empty note once they all have */
  const nextEvs = upcoming.filter((e) => (e.unit || []).includes(a.id));
  const nextEv = nextEvs[0];
  const others = artists.filter((o) => o.id !== a.id);
  const confirmed = upcoming.filter((e) => (e.unit || []).includes(a.id));
  const tr = (k, v) => `data-i18n="${k}"`;
  TH[`ar.book.${a.id}`] = TH["ar.book"].replace("{a}", a.name);
  TH[`ar.band.${a.id}`] = TH["ar.bandT"].replace("{a}", a.name);
  TH[`ar.bio.${a.id}`] = a.bio.th;
  TH[`ar.role.${a.id}`] = a.role.th;
  const main = `
<section class="artist" aria-labelledby="artist-name">
  <div class="artist__text">
    <a class="phead__back meta" href="${BASE}#lineup" data-i18n="pg.back">← The lineup</a>
    <p class="artist__no meta">OP-${a.no} · CERTIFIED_V10</p>
    <h1 class="artist__logo" id="artist-name"><img src="${BASE}${a.logo.src}" alt="${a.name}" width="${a.logo.w}" height="${a.logo.h}"></h1>
    <p class="artist__role meta" data-i18n="ar.role.${a.id}">${h(a.role.en)}</p>
    <blockquote class="artist__bio" cite="${h(groupSource())}"><p data-i18n="ar.bio.${a.id}">${h(a.bio.en)}</p></blockquote>
    <p class="artist__src meta" data-i18n="ar.bioSrc">— Certified V10, on its YouTube channel</p>
    <ul class="artist__tags" aria-label="Styles">${a.styles.map((x) => `<li class="tag">${h(x)}</li>`).join("")}</ul>
    <div class="artist__cta ctas">
      <a class="btn btn--fill" href="${BASE}booking/?artist=${a.id}"><span data-i18n="ar.book.${a.id}">Book ${a.name}</span><em aria-hidden="true">→</em></a>
      <a class="btn" href="${BASE}booking/?type=international&amp;artist=${a.id}"><span data-i18n="ar.intl">International booking</span><em aria-hidden="true">→</em></a>
    </div>
    <p class="artist__links meta">
      ${set ? `<a href="#set" data-i18n="ar.watch">Watch the full set ↓</a>` : ""}
      ${a.links.map((l) => `<a href="${h(l.url)}" target="_blank" rel="noopener">${h(l.label)} ↗︎</a>`).join("\n      ")}
    </p>
  </div>
  <figure class="artist__photo">
    <img src="${BASE}${a.photo}" alt="${a.name} — studio portrait" width="900" height="1125" fetchpriority="high">
    <figcaption class="meta">FILE ${a.no} — ${a.name}</figcaption>
  </figure>
</section>

<section class="block block--tight" aria-labelledby="next-h">
  ${secHead("01", "ar.next", "Next confirmed show").replace("<header", '<header id="next-h"')}
  <div id="next-host">
  ${nextEvs.map((nextEv, i) => `<div class="next" data-rev data-end="${evEnd(nextEv)}"${i ? " hidden" : ""}>
    <p class="next__date"><span class="next__day">${dayNum(nextEv.start)}</span><span class="next__mon meta" data-i18n="ev.mon.${nextEv.slug}">${monYr(nextEv.start)}</span></p>
    <div>
      <h3 class="next__title"><a href="${BASE}events/${nextEv.slug}/">${h(nextEv.title)}</a></h3>
      <p class="next__meta meta"><span data-i18n="ev.date.${nextEv.slug}">${h(nextEv.dateText.en)}</span> · ${h(nextEv.venue)} · ${placeHTML(nextEv)}</p>
      <p class="next__tba meta">${nextEv.allDay ? "" : `<span data-i18n="ev.time.${nextEv.slug}">${h(nextEv.timeText.en)}</span> (${tzHTML}) · `}<span data-i18n="ev.setTimes">Individual set times not announced</span></p>
      <p class="next__status"><span class="tag tag--red" data-i18n="ar.confirmed">Confirmed</span></p>
    </div>
    <div class="next__side">
      ${nextEv.allDay ? "" : `<p class="next__label meta" data-i18n="ar.doorsIn">Doors in</p><p class="next__count" data-count="${Date.parse(nextEv.start)}">—</p>`}
      <a class="next__go meta textlink" href="${BASE}events/${nextEv.slug}/" data-i18n="ar.event">Event details →</a>
    </div>
  </div>`).join("\n  ")}
  <div class="next next--none"${nextEvs.length ? " hidden" : ""}><p data-i18n="ar.nextNone">No show announced yet — follow @certified_v10 for the next date.</p></div>
  </div>
</section>

<section class="block" id="dates" aria-labelledby="sched-h">
  ${secHead("02", "ar.sched", "Schedule").replace("<header", '<header id="sched-h"')}
  <p class="block__lede" data-i18n="ar.schedLede">Dates marked Confirmed are real, announced shows. Club dates marked Demo are sample data until Certified's booking calendar is connected.</p>
  <div class="sched">
    <div class="poster-wrap" data-rev>
      <button class="poster-btn" id="poster-btn" type="button" aria-haspopup="dialog" data-i18n-aria="ar.posterOpen" aria-label="View the schedule poster full size">
        <span id="poster-host"><span class="poster-empty meta">${a.name} — schedule</span></span>
        <span class="poster-btn__hint meta" aria-hidden="true"><span data-i18n="ar.posterHint">View full size</span><span>↗︎</span></span>
      </button>
    </div>
    <div>
      <ul class="slist" id="slist">
${confirmed.map((e) => `        <li class="slist__row"><p class="slist__date" data-i18n="ev.date.${e.slug}">${h(e.dateText.en)}</p><div><p class="slist__venue"><a href="${BASE}events/${e.slug}/">${h(e.title)}</a></p><p class="slist__time meta">${h(e.venue)}</p></div><span class="tag tag--red">Confirmed</span></li>`).join("\n") || '        <li class="sched__empty">No dates announced yet.</li>'}
      </ul>
      <p class="sched__note meta"><span data-i18n="ar.posterCap">The poster is drawn from this list, so the two always match.</span> <span data-i18n="ar.upd">Schedule updated ${h(longDate(scheduleUpdated))}.</span></p>
    </div>
  </div>
</section>

${set ? `<section class="block" id="set" aria-labelledby="set-h">
  ${secHead("03", "ar.set", "Full set").replace("<header", '<header id="set-h"')}
  <p class="block__lede" data-i18n="ar.setLede">Recorded live, from Certified's official YouTube channel.</p>
  <div class="vgrid vgrid--one">
    ${videoCard(set, { level: 3, showBy: false })}
  </div>
  <p class="alt meta"><a class="textlink" href="${BASE}sets/" data-i18n="ar.allSets">All DJ sets →</a></p>
</section>` : ""}

<section class="block" aria-labelledby="others-h">
  ${secHead(set ? "04" : "03", "ar.others", "Also in the unit").replace("<header", '<header id="others-h"')}
  <ul class="others">
${others.map((o) => `    <li><a href="${BASE}artists/${o.id}/"><img src="${BASE}${o.logo.src}" alt="${o.name}" width="${o.logo.w}" height="${o.logo.h}" loading="lazy"><span class="meta" data-i18n="ar.go">Profile &amp; sets →</span></a></li>`).join("\n")}
  </ul>
</section>

<section class="block">
  <div class="band">
    <h2 class="display band__t" data-i18n="ar.band.${a.id}">Book ${a.name}.</h2>
    <div class="ctas">
      <a class="btn btn--fill btn--big" href="${BASE}booking/?artist=${a.id}"><span data-i18n="ar.book.${a.id}">Book ${a.name}</span><em aria-hidden="true">→</em></a>
      <a class="btn btn--big" href="${BASE}booking/?type=international&amp;artist=${a.id}"><span data-i18n="ar.intl">International booking</span><em aria-hidden="true">→</em></a>
    </div>
  </div>
</section>`;
  const dialog = `<dialog class="lightbox" id="poster-dialog" aria-labelledby="poster-dialog-t">
  <div class="lightbox__inner">
    <button class="btn lightbox__close" id="poster-close" type="button"><span data-i18n="ar.close">Close</span><em aria-hidden="true">✕</em></button>
    <figure class="lightbox__fig">
      <div id="poster-dialog-fig"></div>
      <figcaption class="meta" id="poster-dialog-t">${a.name} — <span data-i18n="ar.sched">Schedule</span></figcaption>
    </figure>
  </div>
</dialog>`;
  const desc = `${a.name} is a DJ with Bangkok collective Certified_V10. ${a.bio.en} Full DJ set, next shows and booking.`;
  write(`artists/${a.id}/index.html`, page({
    kind: "artist", current: "",
    headOpts: {
      title: `${a.name} | DJ sets, schedule & booking | CERTIFIED V10`, desc, pathRel: `artists/${a.id}/`, image: a.photo,
      ld: [{ "@context": "https://schema.org", "@type": "ProfilePage", url: url(`artists/${a.id}/`), name: `${a.name} — Certified_V10`, mainEntity: personLD(a) }],
    },
    main,
    data: {
      artist: { id: a.id, name: a.name, logo: a.logo }, updated: scheduleUpdated,
      events: upcoming.filter((e) => (e.unit || []).includes(a.id)).map((e) => ({ title: e.title, venue: e.venue, start: e.start, allDay: !!e.allDay, url: `${BASE}events/${e.slug}/` })),
    },
    extra: dialog,
  }));
}
function groupSource() { return "https://www.youtube.com/@certified_v10/about"; }
TH["ar.doorsIn"] = "ประตูเปิดอีก"; TH["ar.event"] = "รายละเอียดงาน →";

/* ---------- sets ---------- */
const latestSet = [...sets].sort((a, b) => Date.parse(b.uploaded) - Date.parse(a.uploaded))[0];
write("sets/index.html", page({
  kind: "sets", current: "sets",
  headOpts: { title: "DJ sets | CERTIFIED V10", desc: "Full DJ sets from Bangkok collective Certified_V10 — MAWON, OSSY, TEW and WICHAYA, recorded live at After Sun Studio and Wingstop Rave.", pathRel: "sets/", image: `assets/img/sets/${latestSet.id}.jpg`,
    ld: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Certified_V10 — DJ sets", itemListElement: sets.map((v, i) => ({ "@type": "ListItem", position: i + 1, item: {
      "@type": "VideoObject", name: v.youtubeTitle || v.title.en,
      description: `${v.title.en} — full set from the official Certified V10 YouTube channel, recorded ${longDate(v.recorded)}.`,
      thumbnailUrl: url(`assets/img/sets/${v.id}.jpg`), uploadDate: v.uploaded,
      duration: `PT${Math.floor(v.seconds / 60)}M${v.seconds % 60}S`,
      embedUrl: `https://www.youtube.com/embed/${v.id}`, url: `https://www.youtube.com/watch?v=${v.id}`,
    } })) }] },
  main: `
${setLead(latestSet)}
<section class="phead">
  ${secHead("—", "st.label", "DJ sets", "p")}
  ${title2("phead__title", "st.t1", "Hear the", "st.t2", "unit.")}
  <p class="phead__lede" data-rev data-i18n="st.lede">Full sets from the official Certified V10 channel — recorded live at After Sun Studio and Wingstop Rave. Press play to watch here, or open them on YouTube.</p>
</section>
<section class="block" aria-label="Sets">
  <div class="vgrid">
    ${sets.map((v) => videoCard(v).replace('<article class="vcard"', `<article class="vcard" data-set="${h(v.id)}"${v === latestSet ? " hidden" : ""}`)).join("\n    ")}
  </div>
</section>
<section class="block">
  <div class="band">
    ${title2("band__t", "st.bandT1", "Like what you hear?", "st.bandT2", "Book the unit.", "h2")}
    <div class="ctas"><a class="btn btn--fill btn--big" href="${BASE}booking/"><span data-i18n="pg.booking">Booking</span><em aria-hidden="true">→</em></a></div>
  </div>
</section>`,
}));

/* the newest upload leads the sets page as a large player that starts by itself, muted */
function setLeadInfo(v, on) {
  setKeys(v);
  const ev = evBySlug(v.event);
  return `<div class="setlead__set" data-set="${h(v.id)}"${on ? "" : " hidden"}>
      <div>
        <p class="vcard__by meta">${setBy(v)}</p>
        <p class="setlead__title" id="lead-t-${h(v.id)}" data-i18n="st.t.${v.id}">${h(v.title.en)}</p>
      </div>
      <div>
        <p class="vcard__meta meta">${ev ? `<a href="${BASE}events/${ev.slug}/">${h(ev.title)}</a> · ` : ""}<span data-i18n="st.rec.${v.id}">Recorded ${h(longDate(v.recorded))}</span> · ${mmss(v.seconds)}</p>
        <p class="vcard__genres meta">${h(v.genres)}</p>
        <a class="vcard__yt meta" href="https://www.youtube.com/watch?v=${h(v.id)}" target="_blank" rel="noopener"><span data-i18n="st.yt">Watch on YouTube ↗︎</span></a>
      </div>
    </div>`;
}
function setLead(v) {
  setKeys(v);
  return `<section class="setlead" aria-labelledby="lead-t-${h(v.id)}" data-latest="${h(v.id)}">
  <div class="setlead__wrap">
    <div class="vcard__media setlead__media">
      <button class="vcard__play" type="button" data-yt="${h(v.id)}" data-title="${h(v.title.en)}" data-autoplay aria-label="${h("Play: " + v.title.en + " (" + mmss(v.seconds) + ")")}">
        <img src="${BASE}assets/img/sets/${h(v.id)}.jpg" alt="" width="960" height="540" fetchpriority="high">
        <span class="vcard__badge"><span class="vcard__icon" aria-hidden="true"></span><span class="meta" data-i18n="st.play">Play set</span></span>
        <span class="vcard__len meta" aria-hidden="true">${mmss(v.seconds)}</span>
      </button>
      <div class="setlead__ctrl" id="lead-ctrl" hidden>
        <button class="setlead__btn setlead__btn--sound" type="button" id="lead-sound"><span data-i18n="st.sound">Play with sound</span></button>
        <button class="setlead__btn" type="button" id="lead-pause" aria-pressed="false">Pause</button>
      </div>
    </div>
    <p class="setlead__kicker meta"><span class="setlead__dot" aria-hidden="true"></span><span id="lead-k-latest" data-i18n="st.latest">Latest set</span><span id="lead-k-now" data-i18n="st.now" hidden>Now playing</span></p>
    <div class="setlead__info">
    ${sets.map((o) => setLeadInfo(o, o === v)).join("\n    ")}
      <p class="setlead__muted meta" id="lead-muted" hidden data-i18n="st.muted">Muted preview in top quality — press Play with sound to listen.</p>
    </div>
  </div>
</section>`;
}

/* ---------- events ---------- */
const past = events.filter((e) => evEnd(e) <= NOW).sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
write("events/index.html", page({
  kind: "events", current: "events",
  headOpts: { title: "Events | CERTIFIED V10", desc: "Where Bangkok DJ collective Certified_V10 plays next — dates, venues and official ticket links — plus past shows with recorded sets.", pathRel: "events/", image: upcoming[0] && upcoming[0].poster ? upcoming[0].poster.src : null },
  main: `
<section class="phead">
  ${secHead("—", "ev.label", "Events", "p")}
  ${title2("phead__title", "ev.t1", "Next shift,", "ev.t2", "last shifts.")}
  <p class="phead__lede" data-rev data-i18n="ev.lede">Every show Certified plays — dates, venues and the organiser's own ticket links. Past shows stay here with their recorded sets.</p>
</section>
<section class="block block--tight" aria-labelledby="up-h">
  ${secHead("01", "ev.up", "Upcoming").replace("<header", '<header id="up-h"')}
  <ul class="elist" id="events-up">
      ${upcoming.map(eventCard).join("\n      ")}
  </ul>
  <p class="elist__empty meta"${upcoming.length ? " hidden" : ""} data-i18n="ev.none">No upcoming events announced — follow @certified_v10.</p>
</section>
<section class="block" aria-labelledby="past-h">
  ${secHead("02", "ev.past", "Past").replace("<header", '<header id="past-h"')}
  <ul class="elist" id="events-past">
      ${past.map(eventCard).join("\n      ")}
  </ul>
  <p class="elist__empty meta"${past.length ? " hidden" : ""} data-i18n="ev.none">No events yet.</p>
</section>`,
}));

for (const e of events) {
  const evSets = (e.sets || []).map(setById).filter(Boolean);
  const unit = (e.unit || []).map((id) => (A(id) ? `<a href="${BASE}artists/${id}/">${A(id).name}</a>` : id === mc.id ? mc.name : id)).join(" · ");
  const isUp = evEnd(e) > NOW;
  const ld = {
    "@context": "https://schema.org", "@type": "MusicEvent", name: e.title, url: url(`events/${e.slug}/`),
    startDate: e.allDay ? e.start.slice(0, 10) : e.start, ...(e.endDate ? { endDate: e.endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: e.venue, address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: "TH" } },
    description: e.about.en, ...(e.poster ? { image: url(e.poster.src) } : {}),
    organizer: { "@type": "Organization", name: e.organiser },
    performer: [groupLD, ...(e.unit || []).filter(A).map((id) => ({ "@type": "Person", name: A(id).name, url: url(`artists/${id}/`) }))],
    ...(e.tickets && isUp ? { offers: { "@type": "Offer", url: e.tickets.url, price: "1499", priceCurrency: "THB" } } : {}),
  };
  TH[`ev.sub.${e.slug}`] = e.subtitle.th; TH[`ev.about.${e.slug}`] = e.about.th; TH[`ev.date.${e.slug}`] = e.dateText.th;
  if (e.timeText) TH[`ev.time.${e.slug}`] = e.timeText.th;
  if (e.tickets) { TH[`ev.tk.${e.slug}`] = e.tickets.text.th; TH[`ev.tkBtn.${e.slug}`] = TH["ev.tickets"].replace("{p}", e.tickets.label); }
  const rows = [
    ["ev.k.date", "Date", `<span data-i18n="ev.date.${e.slug}">${h(e.dateText.en)}</span>`],
    e.timeText ? ["ev.k.time", "Time", `<span data-i18n="ev.time.${e.slug}">${h(e.timeText.en)}</span> (${tzHTML})`] : null,
    ["ev.k.venue", "Venue", `${h(e.venue)} — ${placeHTML(e)}`],
    ["ev.k.by", "Presented by", h(e.organiser)],
    e.headliner ? ["ev.k.head", "Headliner", h(e.headliner)] : null,
    e.lineup ? ["ev.k.lineup", "Lineup", h(e.lineup)] : null,
    unit ? ["ev.k.unit", "From the unit", unit] : null,
    e.tickets && isUp ? ["ev.k.tickets", "Tickets", `<span data-i18n="ev.tk.${e.slug}">${h(e.tickets.text.en)}</span>`] : null,
  ].filter(Boolean);
  write(`events/${e.slug}/index.html`, page({
    kind: "event", current: "events",
    headOpts: { title: `${e.title} — ${longDate(e.start.slice(0, 10))} | CERTIFIED V10`, desc: `${e.title}: ${e.dateText.en} at ${e.venue}, ${e.city}. ${e.about.en}`.slice(0, 300), pathRel: `events/${e.slug}/`, image: e.poster ? e.poster.src : (evSets[0] ? `assets/img/sets/${evSets[0].id}.jpg` : null), ld: [ld] },
    main: `
<section class="phead">
  <a class="phead__back meta" href="${BASE}events/" data-i18n="pg.backEvents">← All events</a>
  ${secHead(isUp ? "●" : "—", `ev.date.${e.slug}`, e.dateText.en, "p")}
  <h1 class="display phead__title">${h(e.title)}</h1>
  <p class="phead__lede" data-i18n="ev.sub.${e.slug}">${h(e.subtitle.en)}</p>
  <p class="event__state meta" id="event-state" aria-live="polite"></p>
</section>
<section class="block">
  <div class="event">
    <div>
      <div class="event__count" id="event-count" hidden></div>
      <dl class="shows__table">
${rows.map(([k, en, v]) => `        <div class="shows__row"><dt class="meta" data-i18n="${k}">${en}</dt><dd>${v}</dd></div>`).join("\n")}
      </dl>
      ${e.setTimes === false ? `<p class="next__tba meta" style="margin-top:14px" data-i18n="ev.setTimes">Individual set times not announced</p>` : ""}
      <p class="event__about" data-i18n="ev.about.${e.slug}">${h(e.about.en)}</p>
      <div class="event__cta ctas">
        ${e.tickets && isUp ? `<a class="btn btn--fill btn--big" id="event-tickets" href="${h(e.tickets.url)}" target="_blank" rel="noopener"><span data-i18n="ev.tkBtn.${e.slug}">Tickets on ${h(e.tickets.label)}</span><em aria-hidden="true">↗︎</em></a>` : ""}
        <a class="btn btn--big" href="${BASE}booking/"><span data-i18n="ev.book">Book the unit for your event</span><em aria-hidden="true">→</em></a>
      </div>
    </div>
    ${e.poster ? `<figure class="event__poster" data-rev><img src="${BASE}${e.poster.src}" alt="Official poster — ${h(e.title)}, ${h(e.dateText.en)}, ${h(e.venue)}" width="${e.poster.w}" height="${e.poster.h}"><figcaption class="meta"${e.poster.credit === "Official artwork — via @certified_v10" ? ' data-i18n="ev.credit"' : ""}>${h(e.poster.credit)}</figcaption></figure>` : ""}
  </div>
</section>
${evSets.length ? `<section class="block" aria-labelledby="evsets-h">
  ${secHead("▶", "ev.sets", "Recorded at this event").replace("<header", '<header id="evsets-h"')}
  <div class="vgrid">
    ${evSets.map((v) => videoCard(v, { level: 3 })).join("\n    ")}
  </div>
</section>` : ""}`,
    data: { event: { start: e.start, allDay: !!e.allDay, endDate: e.endDate || null } },
  }));
}

/* ---------- booking ---------- */
const pick = (v, label, key) => `<label class="pick"><input type="checkbox" name="artists" value="${v}" data-label="${h(label)}"><span${key ? ` data-i18n="${key}"` : ""}>${h(label)}</span></label>`;
const opt = (v, key, en) => `<option value="${h(v)}"${key ? ` data-i18n="${key}"` : ""}>${h(en)}</option>`;
const TZ = ["Asia/Bangkok", "Asia/Singapore", "Asia/Kuala_Lumpur", "Asia/Jakarta", "Asia/Ho_Chi_Minh", "Asia/Manila", "Asia/Hong_Kong", "Asia/Taipei", "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Dubai", "Australia/Sydney", "Australia/Brisbane", "Australia/Perth", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Los_Angeles"];
const cover = (name, key, en) => `<div class="field intl-only" hidden><label for="f-${name}" data-i18n="${key}">${en}</label><select id="f-${name}" name="${name}">${opt("To discuss", "bk.discuss", "To discuss")}${opt("Organiser covers", "bk.cover", "Organiser covers")}</select></div>`;
const req = `<span class="req" aria-hidden="true">*</span>`;
const optl = `<span class="opt" data-i18n="bk.opt">optional</span>`;
write("booking/index.html", page({
  kind: "booking", current: "booking",
  headOpts: { title: "Book a DJ — venue & international enquiries | CERTIFIED V10", desc: "Book MAWON, OSSY, TEW, WICHAYA or the full Certified_V10 unit for a club night, festival, brand event or private party — in Thailand or abroad.", pathRel: "booking/" },
  main: `
<section class="phead">
  ${secHead("—", "bk.label", "Booking", "p")}
  ${title2("phead__title", "bk.t1", "Tell us about", "bk.t2", "your event.")}
  <p class="phead__lede" data-rev data-i18n="bk.lede">Choose a DJ or the collective, then share your date and venue. The team will confirm availability and next steps.</p>
</section>
<section class="block">
  <form class="bform" id="bform" novalidate>
    <div class="errsum" id="errsum" tabindex="-1" role="alert" hidden><p></p><ul></ul></div>
    <fieldset class="bform__modes">
      <legend class="sr" data-i18n="bk.type">Enquiry type</legend>
      <label class="mode"><input type="radio" name="type" value="venue" checked><span class="mode__box"><span class="mode__t" data-i18n="bk.modeV">Venue or event in Thailand</span><span class="mode__d" data-i18n="bk.modeVd">Club nights, festivals, brand events and private parties in Thailand.</span></span></label>
      <label class="mode"><input type="radio" name="type" value="international"><span class="mode__box"><span class="mode__t" data-i18n="bk.modeI">International booking</span><span class="mode__d" data-i18n="bk.modeId">Planning an event outside Thailand? Include the destination and proposed dates. Travel and production details can be discussed with the team.</span></span></label>
    </fieldset>

    <fieldset class="fset">
      <legend class="meta"><b>01</b><span data-i18n="bk.s1">Who</span></legend>
      <div class="field" id="field-artists" role="group" aria-labelledby="l-artists">
        <p class="field__label" id="l-artists"><span data-i18n="bk.who">Who would you like to book?</span>${req}</p>
        <div class="picks">
          ${artists.map((a) => pick(a.id, a.name)).join("\n          ")}
          ${pick("maxlerr", "MAXLERR (MC)")}
          ${pick("unit", "The full unit", "bk.unit")}
          ${pick("help", "Help me choose", "bk.help")}
        </div>
        <p class="field__err" aria-live="polite"></p>
      </div>
    </fieldset>

    <fieldset class="fset">
      <legend class="meta"><b>02</b><span data-i18n="bk.s2">The event</span></legend>
      <div class="fgrid">
        <div class="field"><label for="f-format"><span data-i18n="bk.format">Event type</span>${req}</label>
          <select id="f-format" name="format" required>${opt("", "bk.choose", "Choose…")}${opt("Club night", "bk.f.club", "Club night")}${opt("Festival", "bk.f.fest", "Festival")}${opt("Concert or show", "bk.f.show", "Concert or show")}${opt("Brand event or launch", "bk.f.brand", "Brand event or launch")}${opt("Private party", "bk.f.private", "Private party")}${opt("Wedding", "bk.f.wedding", "Wedding")}${opt("Other", "bk.f.other", "Other")}</select>
          <p class="field__err" aria-live="polite"></p></div>
        <div class="field"><label for="f-date"><span data-i18n="bk.date">Event date</span>${req}</label>
          <input id="f-date" name="date" type="date">
          <label class="check"><input type="checkbox" name="date_tbc"><span data-i18n="bk.tbc">Date not confirmed</span></label>
          <p class="field__err" aria-live="polite"></p></div>
        <div class="field"><label for="f-time"><span data-i18n="bk.time">Start time (local time)</span>${optl}</label><input id="f-time" name="time" type="time"></div>
        <div class="field"><label for="f-setlen"><span data-i18n="bk.setlen">Set length</span>${optl}</label>
          <select id="f-setlen" name="setlen">${opt("", "bk.choose", "Choose…")}${opt("1 hour", "bk.len.1", "1 hour")}${opt("2 hours", "bk.len.2", "2 hours")}${opt("3 hours", "bk.len.3", "3 hours")}${opt("Longer / to discuss", "bk.len.x", "Longer / to discuss")}</select></div>
        <div class="field"><label for="f-venue"><span data-i18n="bk.venue">Venue name</span>${optl}</label><input id="f-venue" name="venue" type="text" autocomplete="off"></div>
        <div class="field"><label for="f-city"><span data-i18n="bk.city">City</span>${req}</label><input id="f-city" name="city" type="text" autocomplete="address-level2" required><p class="field__err" aria-live="polite"></p></div>
        <div class="field"><label for="f-country"><span data-i18n="bk.country">Country</span>${req}</label><input id="f-country" name="country" type="text" autocomplete="country-name" value="Thailand" required><p class="field__err" aria-live="polite"></p></div>
        <div class="field intl-only" hidden><label for="f-tz" data-i18n="bk.tz">Event time zone</label>
          <select id="f-tz" name="tz">${opt("", "bk.choose", "Choose…")}${TZ.map((z) => opt(z, null, z.replace(/_/g, " "))).join("")}${opt("Other", "bk.f.other", "Other")}</select></div>
        <div class="field"><label for="f-audience"><span data-i18n="bk.audience">Expected audience</span>${optl}</label><input id="f-audience" name="audience" type="number" min="1" inputmode="numeric"></div>
        <div class="field"><label for="f-budget"><span data-i18n="bk.budget">Budget</span>${optl}</label><input id="f-budget" name="budget" type="text" placeholder="e.g. 30,000–50,000" data-i18n-ph="bk.budgetHint"></div>
        <div class="field"><label for="f-currency" data-i18n="bk.currency">Currency</label>
          <select id="f-currency" name="currency">${["THB", "USD", "SGD", "MYR", "HKD", "JPY", "KRW", "AUD", "EUR", "GBP"].map((c) => opt(c, null, c)).join("")}</select></div>
        ${cover("travel", "bk.travel", "Flights")}
        ${cover("hotel", "bk.hotel", "Accommodation")}
        ${cover("ground", "bk.ground", "Local transport")}
        <div class="field field--full"><label for="f-details"><span data-i18n="bk.details">Tell us about the event</span>${req}</label>
          <p class="field__hint" id="h-details" data-i18n="bk.detailsHint">Concept, lineup, music, timings — anything that helps the team understand the night.</p>
          <textarea id="f-details" name="details" aria-describedby="h-details" required></textarea>
          <p class="field__err" aria-live="polite"></p></div>
      </div>
    </fieldset>

    <fieldset class="fset">
      <legend class="meta"><b>03</b><span data-i18n="bk.s3">Contact</span></legend>
      <div class="fgrid">
        <div class="field"><label for="f-name"><span data-i18n="bk.name">Your name</span>${req}</label><input id="f-name" name="name" type="text" autocomplete="name" required><p class="field__err" aria-live="polite"></p></div>
        <div class="field"><label for="f-email"><span data-i18n="bk.email">Email</span>${req}</label><input id="f-email" name="email" type="email" autocomplete="email" required><p class="field__err" aria-live="polite"></p></div>
        <div class="field"><label for="f-org"><span data-i18n="bk.org">Organisation or venue</span>${req}</label><p class="field__hint" id="h-org" data-i18n="bk.orgHint">Venue, promoter, brand — or “Individual”.</p><input id="f-org" name="org" type="text" autocomplete="organization" aria-describedby="h-org" required><p class="field__err" aria-live="polite"></p></div>
        <div class="field"><label for="f-phone"><span data-i18n="bk.phone">Phone, with country code</span>${optl}</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="f-web"><span data-i18n="bk.web">Website or social</span>${optl}</label><input id="f-web" name="web" type="text" autocomplete="url"></div>
        <div class="field"><label for="f-contact"><span data-i18n="bk.contact">Best way to reach you</span>${optl}</label>
          <select id="f-contact" name="contact">${opt("", "bk.choose", "Choose…")}${opt("LINE", null, "LINE")}${opt("Instagram", null, "Instagram")}${opt("Email", "bk.email", "Email")}${opt("Phone", null, "Phone")}</select></div>
      </div>
    </fieldset>

    <div class="bform__submit">
      <button class="btn btn--fill btn--big" type="submit"><span data-i18n="bk.submit">Prepare enquiry</span><em aria-hidden="true">→</em></button>
      <p class="bform__privacy" data-i18n="bk.privacy">Nothing is sent or stored by this page. Your enquiry reaches Certified when you send it in LINE or Instagram.</p>
    </div>
  </form>

  <div class="ready" id="ready" tabindex="-1" hidden>
    <h2 class="ready__t" data-i18n="bk.readyT">Your enquiry is ready.</h2>
    <p class="ready__d" data-i18n="bk.readyD">Send it to Certified on LINE or Instagram. Nothing has been sent yet, and an enquiry is not a confirmed booking.</p>
    <pre class="ready__msg" id="ready-msg"></pre>
    <div class="ready__ctas ctas">
      <a class="btn btn--fill" id="send-line" href="https://line.me/R/ti/p/@316ghxsa" target="_blank" rel="noopener"><span data-i18n="bk.sendLine">Send on LINE</span><em aria-hidden="true">↗︎</em></a>
      <a class="btn" id="send-ig" href="https://ig.me/m/certified_v10" target="_blank" rel="noopener"><span data-i18n="bk.sendIg">Copy &amp; open Instagram DM</span><em aria-hidden="true">↗︎</em></a>
      <button class="btn" id="copy-msg" type="button"><span data-i18n="bk.copy">Copy message</span></button>
    </div>
    <p class="ready__status meta" id="ready-status" role="status" aria-live="polite"></p>
  </div>
  <p class="alt meta" data-i18n="bk.alt">Prefer to talk first? Add Certified on LINE or DM @certified_v10 on Instagram.</p>
  <p class="ctas" style="margin-top:14px"><a class="btn" href="https://lin.ee/pxpEb2f" target="_blank" rel="noopener"><span>LINE — Certified</span><em aria-hidden="true">↗︎</em></a><a class="btn" href="https://www.instagram.com/certified_v10/" target="_blank" rel="noopener"><span>Instagram — @certified_v10</span><em aria-hidden="true">↗︎</em></a></p>
</section>`,
}));

/* ---------- internships ---------- */
const jobsBlock = home.match(/  <ul class="jobs__list">[\s\S]*?\n  <\/ul>\n/)[0];
const perksA = home.match(/<div data-rev>\n      <p class="meta jobs__h" data-i18n="jobs.getA">[\s\S]*?<\/div>\n/)[0];
const perksB = home.match(/<div data-rev style="--d:\.08s">\n      <p class="meta jobs__h" data-i18n="jobs.getB">[\s\S]*?<\/div>\n/)[0];
const howTable = home.match(/<dl class="jobs__table">[\s\S]*?<\/dl>/)[0];
write("internships/index.html", page({
  kind: "interns", current: "interns",
  headOpts: { title: "Internships | CERTIFIED V10", desc: "Internships with Bangkok DJ collective Certified_V10 — operations, sponsorship, content and KOL roles. Intake status and how to apply.", pathRel: "internships/" },
  main: `
<section class="phead">
  ${secHead("—", "in.label", "Internships", "p")}
  ${title2("phead__title", "jobs.t1", "Join the", "jobs.t2", "pit crew.")}
  <p class="phead__lede" data-rev data-i18n="jobs.lede">Certified is calling for interns: a November 2026 – January 2027 intake, with real work on real events, on and behind the scenes.</p>
</section>
<section class="block block--tight">
  <div class="intake" id="intake" aria-live="polite">
    <div><p class="intake__state" id="intake-state">Applications are closed</p><p class="intake__d" id="intake-d">Applications are currently closed. Follow CERTIFIED for the next intake.</p></div>
    <div class="ctas">
      <a class="btn btn--fill" id="intake-apply" href="${h(intake.apply)}" hidden><span data-i18n="in.apply">Apply for this intake</span><em aria-hidden="true">↗︎</em></a>
      <a class="btn" href="https://www.instagram.com/certified_v10/" target="_blank" rel="noopener"><span data-i18n="in.follow">Follow on Instagram</span><em aria-hidden="true">↗︎</em></a>
    </div>
  </div>
</section>
<section class="block jobs" aria-labelledby="roles-h">
  ${secHead("01", "in.roles", "Roles · " + intake.cycle).replace("<header", '<header id="roles-h"')}
${jobsBlock}
  <div class="jobs__grid">
    ${perksA}    ${perksB}    <div data-rev style="--d:.16s">
      <div id="intake-how" hidden>
        <p class="meta jobs__h" data-i18n="jobs.how">How to apply</p>
        ${howTable}
      </div>
      <p class="jobs__note meta" data-i18n="in.closedNote">When the next intake opens, the application details appear here.</p>
      <p class="jobs__note meta" data-i18n="jobs.note">Every intern receives a certificate on passing the internship. Questions? DM @certified_v10.</p>
      <div class="jobs__cta"><a class="btn" href="https://www.instagram.com/certified_v10/p/DeHQs2JFI2h/" target="_blank" rel="noopener"><span data-i18n="jobs.post">See the hiring post</span><em aria-hidden="true">↗︎</em></a></div>
    </div>
  </div>
</section>`,
}));

/* ---------- merch ----------
   Until the real drop is in, every product is a drawn placeholder, tagged as one, with no price and no checkout:
   "Notify me" opens LINE with a short message to Certified. Set data/merch.json "status" to "live" for real products. */
const MERCH_PH = merch.status !== "live";
const lineMsg = (text) => "https://line.me/R/oaMessage/%40316ghxsa/?" + encodeURIComponent(text);
function merchArt(m) {
  const G = "#1b1b1f", S = "#3a3a41", gid = "mg-" + m.id;
  const logo = (x, y, w) => `<image href="${BASE}assets/img/logo.png" x="${x}" y="${y}" width="${w}" height="${(w * 96 / 933).toFixed(1)}"/>`;
  const art = {
    tee: `<path d="M138 132 L174 116 Q200 142 226 116 L262 132 L328 170 L304 228 L268 212 L268 432 L132 432 L132 212 L96 228 L72 170 Z" fill="${G}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/>
<path d="M174 116 Q200 142 226 116" fill="none" stroke="${S}" stroke-width="6"/>${logo(146, 176, 108)}<rect x="246" y="410" width="10" height="14" fill="#FF3117"/>`,
    hoodie: `<path d="M134 136 Q200 112 266 136 L322 184 L346 316 L316 322 L292 230 L280 230 L280 436 L120 436 L120 230 L108 230 L84 322 L54 316 L78 184 Z" fill="${G}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/>
<path d="M150 144 Q146 78 200 72 Q254 78 250 144 Q226 128 200 128 Q174 128 150 144 Z" fill="${G}" stroke="${S}" stroke-width="2"/>
<path d="M168 138 Q172 98 200 94 Q228 98 232 138 Q216 130 200 130 Q184 130 168 138 Z" fill="#0f0f11"/>
<path d="M186 142 L184 192 M214 142 L216 192" stroke="#8E8B84" stroke-width="3" stroke-linecap="round"/>
<path d="M148 346 L252 346 L266 408 L134 408 Z" fill="none" stroke="${S}" stroke-width="2"/>${logo(146, 214, 108)}<path d="M120 420 L280 420" stroke="${S}" stroke-width="2"/>`,
    cap: `<path d="M96 306 Q96 178 210 170 Q318 176 324 306 Z" fill="${G}" stroke="${S}" stroke-width="2"/>
<path d="M210 172 Q196 236 190 306 M210 172 Q226 236 232 306" fill="none" stroke="${S}" stroke-width="2"/>
<path d="M70 310 Q210 278 350 310 Q356 340 330 346 Q210 322 90 346 Q64 340 70 310 Z" fill="${G}" stroke="${S}" stroke-width="2"/>
<circle cx="210" cy="172" r="7" fill="${G}" stroke="${S}" stroke-width="2"/>${logo(150, 246, 120)}`,
    tote: `<path d="M154 206 L154 160 Q154 108 200 108 Q246 108 246 160 L246 206" fill="none" stroke="${S}" stroke-width="12" stroke-linecap="round"/>
<path d="M104 198 L296 198 L308 434 L92 434 Z" fill="${G}" stroke="${S}" stroke-width="2" stroke-linejoin="round"/>${logo(140, 300, 120)}
<text x="200" y="344" text-anchor="middle" fill="#8E8B84" font-family="Chakra Petch, sans-serif" font-size="11" font-weight="600" letter-spacing="2.5">BANGKOK — AFTER MIDNIGHT</text>`,
    poster: `<rect x="118" y="112" width="180" height="255" fill="#000" opacity=".5"/>
<rect x="110" y="104" width="180" height="255" fill="#141416" stroke="${S}" stroke-width="2"/>
<rect x="176" y="96" width="48" height="16" fill="#8E8B84" opacity=".35" transform="rotate(-4 200 104)"/>${logo(126, 126, 148)}
<rect x="126" y="152" width="40" height="4" fill="#FF3117"/>
<text x="200" y="262" text-anchor="middle" fill="none" stroke="#EDEAE3" stroke-opacity=".55" stroke-width="1.5" font-family="Anton, sans-serif" font-size="92">V10</text>
<path d="M126 290 H246 M126 304 H226 M126 318 H256 M126 332 H210" stroke="#3a3a41" stroke-width="5"/>
<text x="274" y="350" text-anchor="end" fill="#8E8B84" font-family="Chakra Petch, sans-serif" font-size="8" letter-spacing="1.5">BKK 2026</text>`,
    stickers: `<circle cx="170" cy="236" r="80" fill="#EDEAE3"/>
<text x="152" y="232" text-anchor="middle" fill="#0B0B0C" font-family="Anton, sans-serif" font-size="58">I</text>
<path d="M0 -6 C-6 -14 -18 -8 -12 2 L0 12 L12 2 C18 -8 6 -14 0 -6 Z" fill="#FF3117" transform="translate(196 214) scale(1.9)"/>
<text x="170" y="270" text-anchor="middle" fill="#0B0B0C" font-family="Anton, sans-serif" font-size="27" letter-spacing="1">CERTIFIED</text>
<circle cx="286" cy="168" r="42" fill="${G}" stroke="${S}" stroke-width="2"/>
<text x="286" y="176" text-anchor="middle" fill="#EDEAE3" font-family="Chakra Petch, sans-serif" font-size="20" font-weight="700" letter-spacing="3">BKK</text>
<g transform="rotate(-10 262 336)"><rect x="186" y="304" width="152" height="64" rx="10" fill="#FF3117"/><text x="262" y="349" text-anchor="middle" fill="#0B0B0C" font-family="Anton, sans-serif" font-size="36">V10</text></g>`,
  }[m.art] || "";
  return `<svg viewBox="0 0 400 500" aria-hidden="true" focusable="false"><defs><radialGradient id="${gid}" cx="82%" cy="8%" r="80%"><stop offset="0" stop-color="#FF3117" stop-opacity=".2"/><stop offset="1" stop-color="#FF3117" stop-opacity="0"/></radialGradient></defs><rect width="400" height="500" fill="#0f0f11"/><rect width="400" height="500" fill="url(#${gid})"/><path d="M20 34 V20 H34 M366 20 H380 V34 M380 466 V480 H366 M34 480 H20 V466" fill="none" stroke="#2c2c31" stroke-width="2"/>${art}</svg>`;
}
merch.items.forEach((m) => { TH[`mc.n.${m.id}`] = m.name.th; TH[`mc.k.${m.id}`] = m.kind.th; TH[`mc.o.${m.id}`] = m.options.th; });
const merchCard = (m) => `<article class="mcard" data-rev>
      <a class="mcard__media" href="${BASE}merch/${m.id}/" tabindex="-1" aria-hidden="true">
        ${m.image ? `<img src="${BASE}${h(m.image)}" alt="${h(m.name.en)}" loading="lazy">` : merchArt(m)}
        ${MERCH_PH ? '<span class="mcard__stamp tag tag--muted" data-i18n="mc.ph">Placeholder</span>' : ""}
      </a>
      <div class="mcard__body">
        <p class="mcard__kind meta" data-i18n="mc.k.${m.id}">${h(m.kind.en)}</p>
        <h2 class="mcard__title"><a href="${BASE}merch/${m.id}/" data-i18n="mc.n.${m.id}">${h(m.name.en)}</a></h2>
        <p class="mcard__price">${m.price ? `<span class="mcard__amt">THB ${Number(m.price).toLocaleString("en-US")}</span>` : '<span class="mcard__amt" aria-hidden="true">THB —</span><span class="mcard__tbc meta" data-i18n="mc.tbc">Price to be announced</span>'}</p>
        <p class="mcard__opts meta" data-i18n="mc.o.${m.id}">${h(m.options.en)}</p>
        <a class="btn mcard__cta" href="${h(lineMsg(`Hi Certified — please let me know when the ${m.name.en} is available. (Sent from the Certified V10 website)`))}" target="_blank" rel="noopener"><span data-i18n="mc.notify">Notify me</span><em aria-hidden="true">↗︎</em></a>
      </div>
    </article>`;
const dropRow = (k, en, v) => `<div class="shows__row"><dt class="meta" data-i18n="${k}">${en}</dt><dd>${v ? h(v) : '<span data-i18n="mc.tba">To be announced</span>'}</dd></div>`;
write("merch/index.html", page({
  kind: "merch", current: "merch",
  headOpts: { title: "Merch | CERTIFIED V10", desc: "Official Certified V10 merch from the Bangkok DJ collective — coming soon. Get notified on LINE when the drop opens.", pathRel: "merch/", noindex: MERCH_PH },
  main: `
<section class="phead">
  ${secHead("—", "mc.label", "Merch", "p")}
  ${title2("phead__title", "mc.t1", "Merch from", "mc.t2", "the unit.")}
  <p class="phead__lede" data-rev data-i18n="mc.lede">Official Certified V10 merch is on the way. The pieces below are placeholders — final designs, photos, sizes and prices will be posted before the drop.</p>
</section>
<section class="block block--tight">
  <div class="intake is-open">
    <div><p class="intake__state" data-i18n="mc.soon">Coming soon</p><p class="intake__d" data-i18n="mc.soonD">Not on sale yet — get notified on LINE or follow @certified_v10 so you don't miss the drop.</p></div>
    <div class="ctas">
      <a class="btn btn--fill" href="${h(lineMsg("Hi Certified — please let me know when the merch drops. (Sent from the Certified V10 website)"))}" target="_blank" rel="noopener"><span data-i18n="mc.notifyAll">Get notified on LINE</span><em aria-hidden="true">↗︎</em></a>
      <a class="btn" href="https://www.instagram.com/certified_v10/" target="_blank" rel="noopener"><span data-i18n="mc.follow">Follow on Instagram</span><em aria-hidden="true">↗︎</em></a>
    </div>
  </div>
</section>
<section class="block" aria-labelledby="items-h">
  ${secHead("01", "mc.items", "The goods").replace("<header", '<header id="items-h"')}
  <div class="mgrid">
    ${merch.items.length ? merch.items.map(merchCard).join("\n    ") : '<p class="block__lede" data-i18n="mc.empty">Merchandise is not available yet.</p>'}
  </div>
</section>
<section class="block" aria-labelledby="drop-h">
  ${secHead("02", "mc.drop", "Drop details").replace("<header", '<header id="drop-h"')}
  <dl class="shows__table">
    ${dropRow("mc.k.date", "Release date", merch.drop.date)}
    ${dropRow("mc.k.order", "Ordering", merch.drop.ordering)}
    ${dropRow("mc.k.ship", "Shipping", merch.drop.shipping)}
    ${dropRow("mc.k.pickup", "Pickup at shows", merch.drop.pickup)}
  </dl>
  ${MERCH_PH ? '<p class="jobs__note meta" data-i18n="mc.dropNote">Everything on this page is a placeholder until Certified announces the real drop.</p>' : ""}
</section>`,
}));


/* one page per product: sizes, quantity, stock and delivery facts in place, ordering switched off until a shop provider is connected */
const factRow = (k, en) => `<div class="shows__row"><dt class="meta" data-i18n="${k}">${en}</dt><dd><span data-i18n="mc.tba">To be announced</span></dd></div>`;
merch.items.forEach((m) => {
  const sizes = m.sizes && m.sizes.length ? m.sizes : null;
  write(`merch/${m.id}/index.html`, page({
    kind: "product", current: "merch",
    headOpts: { title: `${m.name.en} | Merch | CERTIFIED V10`, desc: `${m.name.en} (${m.kind.en.toLowerCase()}) from the Certified V10 merch line — coming soon.`, pathRel: `merch/${m.id}/`, noindex: MERCH_PH },
    main: `
<section class="block product" aria-labelledby="product-h">
  <a class="phead__back meta" href="${BASE}merch/" data-i18n="mc.back">← All merch</a>
  <div class="product__grid">
    <figure class="product__media mcard__media">
      ${m.image ? `<img src="${BASE}${h(m.image)}" alt="${h(m.name.en)}">` : merchArt(m)}
      ${MERCH_PH ? '<span class="mcard__stamp tag tag--muted" data-i18n="mc.ph">Placeholder</span>' : ""}
    </figure>
    <div class="product__info">
      <p class="mcard__kind meta" data-i18n="mc.k.${m.id}">${h(m.kind.en)}</p>
      <h1 class="product__title" id="product-h" data-i18n="mc.n.${m.id}">${h(m.name.en)}</h1>
      <p class="mcard__price">${m.price ? `<span class="mcard__amt">THB ${Number(m.price).toLocaleString("en-US")}</span>` : '<span class="mcard__amt" aria-hidden="true">THB —</span><span class="mcard__tbc meta" data-i18n="mc.tbc">Price to be announced</span>'}</p>
      <p class="product__stock"><span class="tag tag--muted" data-i18n="mc.stock">Not available yet</span></p>
      <form class="product__form" id="pform" data-name="${h(m.name.en)}" novalidate>
        ${sizes ? `<fieldset class="field">
          <legend class="field__label" data-i18n="mc.size">Size</legend>
          <div class="picks">
            ${sizes.map((z, i) => `<label class="pick"><input type="radio" name="size" value="${h(z)}"${i === 1 ? " checked" : ""}><span>${h(z)}</span></label>`).join("\n            ")}
          </div>
        </fieldset>` : `<p class="mcard__opts meta" data-i18n="mc.o.${m.id}">${h(m.options.en)}</p>`}
        <div class="field product__qty">
          <label for="qty" data-i18n="mc.qty">Quantity</label>
          <div class="qty"><button type="button" class="qty__btn" data-step="-1" aria-label="Fewer" data-i18n-aria="mc.less">−</button><input id="qty" name="qty" type="number" inputmode="numeric" min="1" max="5" value="1"><button type="button" class="qty__btn" data-step="1" aria-label="More" data-i18n-aria="mc.more">+</button></div>
        </div>
        <div class="product__buy">
          <button class="btn btn--fill" type="button" disabled aria-describedby="buy-note"><span data-i18n="mc.order">Order — not available yet</span></button>
          <a class="btn" id="notify" href="${h(lineMsg(`Hi Certified — please let me know when the ${m.name.en}${sizes ? ` (size ${sizes[1]})` : ""} is available. (Sent from the Certified V10 website)`))}" target="_blank" rel="noopener"><span data-i18n="mc.notifyLine">Notify me on LINE</span><em aria-hidden="true">↗︎</em></a>
        </div>
        <p class="jobs__note meta" id="buy-note" data-i18n="mc.buyNote">Ordering opens when the drop is announced. Nothing can be bought or paid for on this site yet.</p>
      </form>
      <dl class="shows__table product__facts">
        ${factRow("mc.k.material", "Material & fit")}
        ${sizes ? factRow("mc.k.guide", "Size guide") : ""}
        ${factRow("mc.k.delivery", "Delivery & dispatch")}
        ${factRow("mc.k.returns", "Returns & support")}
      </dl>
    </div>
  </div>
</section>
<section class="block block--tight" aria-labelledby="more-h">
  ${secHead("—", "mc.more2", "More merch").replace("<header", '<header id="more-h"')}
  <ul class="product__more">
    ${merch.items.filter((o) => o.id !== m.id).map((o) => `<li><a href="${BASE}merch/${o.id}/" data-i18n="mc.n.${o.id}">${h(o.name.en)}</a></li>`).join("\n    ")}
  </ul>
</section>`,
  }));
});

/* ---------- 404 ---------- */
write("404.html", page({
  kind: "lost", current: "",
  headOpts: { title: "Page not found | CERTIFIED V10", desc: "This page does not exist.", pathRel: "404.html", noindex: true },
  main: `
<section class="lost">
  ${secHead("404", "pg.home", "Off the map", "p")}
  ${title2("phead__title", "lost.t1", "Off the", "lost.t2", "map.")}
  <p class="phead__lede" data-i18n="lost.d">This page doesn't exist. Start from the homepage or the lineup.</p>
  <div class="ctas" style="margin-top:32px"><a class="btn btn--fill btn--big" href="${BASE}"><span data-i18n="pg.home">Home</span><em aria-hidden="true">→</em></a><a class="btn btn--big" href="${BASE}#lineup"><span data-i18n="nav.lineup">Lineup</span><em aria-hidden="true">→</em></a></div>
</section>`,
}));

/* ---------- shared assets ---------- */
write("assets/site.css", "/* Generated by tools/build.mjs from index.html + tools/pages.css — edit those, not this. */\n" + homeCSS + "\n\n" + read("tools/pages.css"));
/* which sets have a loudness map (tools/levels.mjs), so the page only asks for files that exist */
const levelsDir = path.join(ROOT, "data/levels");
const levelIds = fs.existsSync(levelsDir) ? fs.readdirSync(levelsDir).filter((n) => n.endsWith(".json")).map((n) => n.slice(0, -5)) : [];
write("assets/site.js", "/* Generated by tools/build.mjs — edit tools/site-src.js and the Thai strings in tools/build.mjs. */\n" + homeTH + "\nObject.assign(window.CV_TH, " + JSON.stringify(TH) + ");\nwindow.CV_LEVELS = " + JSON.stringify(levelIds) + ";\n" + read("tools/site-src.js"));

/* ---------- sitemap ---------- */
const paths = ["", "sets/", "events/", "booking/", "internships/", ...(MERCH_PH ? [] : ["merch/"]), ...artists.map((a) => `artists/${a.id}/`), ...events.map((e) => `events/${e.slug}/`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${url(p)}</loc></url>`).join("\n")}
</urlset>
`);
console.log("built", paths.length, "pages + 404 · upcoming events:", upcoming.map((e) => e.slug).join(", ") || "none");
