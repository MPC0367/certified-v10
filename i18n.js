/* CERTIFIED_V10 — language layer.
   English is authored in the HTML. TH holds the Thai for static text
   (data-i18n, data-i18n-alt, data-i18n-label). STR holds both languages for
   text that scripts generate. The Thai is a draft pending native review.
   Brand, artist and venue names stay in Latin script. */
(function () {
  "use strict";

  var TH = {
    "skip": "ข้ามไปยังเนื้อหา",
    "notice.text": "เว็บไซต์คอนเซ็ปต์อิสระ ไม่ใช่เว็บไซต์ทางการของ Certified_V10",
    "notice.link": "เกี่ยวกับเว็บไซต์นี้",
    "preview.notice.strong": "ตัวอย่างสำหรับลูกค้า - ใช้ข้อมูลสมมติ",
    "preview.notice.text": "งานที่แสดงเป็นเพียงตัวอย่าง ไม่ใช่งานที่ยืนยันแล้ว",

    "nav.label": "เมนูหลัก",
    "nav.shows": "งานแสดง",
    "nav.djs": "ดีเจ",
    "nav.about": "เกี่ยวกับ",
    "nav.past": "ผลงานที่ผ่านมา",
    "nav.hire": "ว่าจ้างคอลเลกทีฟ",
    "menu.open": "เปิดเมนู",
    "menu.close": "ปิดเมนู",
    "menu.title": "เมนู",
    "home.label": "Certified_V10 หน้าแรก",

    "hero.eyebrow": "ดีเจคอลเลกทีฟจากกรุงเทพฯ",
    "hero.claim": "ดีเจสี่คน หนึ่งคอลเลกทีฟ",
    "hero.body": "Certified_V10 รวม OSSY, WICHAYA, MAWON และ TEW โดยมี MAXLERR เป็น MC สำหรับคลับไนต์และงานอีเวนต์ ดูงานสาธารณะครั้งถัดไปของแต่ละคน หรือสอบถามสำหรับงานของคุณ",
    "hero.cta.shows": "ดูงานที่กำลังจะมาถึง",
    "hero.cta.hire": "ว่าจ้างคอลเลกทีฟ",
    "hero.next.label": "งานถัดไปของคอลเลกทีฟ",
    "hero.photo.alt": "สมาชิกทั้งห้าคนของ Certified_V10 ยืนอยู่ในสตูดิโอพื้นหลังสีขาว",
    "hero.photo.cap": "คอลเลกทีฟในสตูดิโอ ปี 2026 ภาพ: มีเดียแพ็กของ Certified_V10",

    "shows.title": "งานที่กำลังจะมาถึง",
    "shows.lede": "งานสาธารณะที่ยืนยันแล้วของคอลเลกทีฟ เวลาที่แสดงเป็นเวลาท้องถิ่นของสถานที่จัดงาน",
    "shows.official": "Certified_V10 บน Instagram",
    "recent.label": "งานล่าสุด",
    "recent.status": "จบแล้ว",
    "recent.date.k": "วันที่",
    "recent.venue.k": "สถานที่",
    "recent.venue.v": "สามย่านมิตรทาวน์ กรุงเทพฯ",
    "recent.head.k": "เฮดไลเนอร์",
    "recent.lineup.k": "ไลน์อัพ",
    "recent.link": "ดูประกาศบน Instagram",
    "recent.poster.alt": "โปสเตอร์ทางการของงาน Certified × Wingstop Vol. 2 วันที่ 29 ส.ค. 2026 ที่สามย่านมิตรทาวน์",
    "recent.poster.cap": "อาร์ตเวิร์กทางการจาก @certified_v10",

    "lineup.title": "พบกับดีเจ",
    "lineup.lede": "ดูงานสาธารณะครั้งถัดไปของดีเจแต่ละคน วันและเวลาเป็นเวลากรุงเทพฯ เว้นแต่จะระบุเป็นอย่างอื่น",
    "lineup.col.member": "สมาชิก",
    "lineup.col.next": "งานสาธารณะครั้งถัดไป",
    "lineup.col.count": "เริ่มใน",
    "lineup.details": "รายละเอียด",
    "lineup.noscript": "ตารางงานตามที่เผยแพร่เมื่อ 12 ต.ค. 2026 เปิด JavaScript เพื่อดูข้อมูลล่าสุด",
    "lineup.preview": "ตัวอย่างสำหรับลูกค้า: ดูส่วนนี้พร้อมตารางงานสมมติ",
    "role.dj": "ดีเจ",
    "role.mc": "MC",
    "d.role": "บทบาท",
    "d.known": "เป็นที่รู้จักจาก",
    "d.next": "งานสาธารณะครั้งถัดไป",
    "d.listen": "ฟังเพลง",
    "d.listen.link": "Certified_V10 บน YouTube",
    "d.credit": "ภาพ: มีเดียแพ็กของ Certified_V10",
    "d.mawon.known": "เซ็ตพลังงานแบบเฟสติวัล",
    "d.ossy.known": "สายฮิปฮอป",
    "d.wichaya.known": "เพลงที่ทั้งฟลอร์ร้องตามได้",
    "thumb.mawon": "ภาพถ่ายของ MAWON",
    "thumb.ossy": "ภาพถ่ายของ OSSY",
    "thumb.tew": "ภาพถ่ายของ TEW",
    "thumb.wichaya": "ภาพถ่ายของ WICHAYA",
    "thumb.maxlerr": "ภาพถ่ายของ MAXLERR",

    "about.title": "เกี่ยวกับคอลเลกทีฟ",
    "about.p1": "Certified_V10 คือดีเจคอลเลกทีฟจากกรุงเทพฯ ที่จัดปาร์ตี้มาตั้งแต่ปี 2023 ดีเจสี่คนใช้บูธเดียวกัน และมี MC หนึ่งคนคอยคุมบรรยากาศของห้อง",
    "about.p2": "แนวเพลงมีทั้งเฮาส์ ฮิปฮอป และเพลงไทยที่ฟลอร์กรุงเทพฯ ร้องตามได้ทุกท่อน",
    "about.caption": "เป็นเครื่องยนต์ ไม่ใช่แค่ไลน์อัพ: ห้าคน หนึ่งคืน เล่นเป็นทีมเดียว",
    "about.base.k": "ฐาน",
    "about.base.v": "กรุงเทพฯ ประเทศไทย",
    "about.since.k": "เริ่มตั้งแต่",
    "about.members.k": "สมาชิก",
    "about.members.v": "OSSY, WICHAYA, MAWON, TEW (ดีเจ) และ MAXLERR (MC)",
    "about.sound.k": "แนวเพลง",
    "about.sound.v": "เฮาส์ ฮิปฮอป เพลงไทย",
    "about.formats.k": "รูปแบบงาน",
    "about.formats.v": "คลับไนต์ เวทีอีเวนต์ งานแบรนด์",
    "about.listen": "ฟังบน YouTube",

    "sound.title": "หนึ่งคืนเป็นอย่างไร",
    "sound.lede": "สี่ช่วง ตั้งแต่เปิดประตูจนปิดร้าน เลือกช่วงที่ต้องการดู",
    "sound.tabs": "ช่วงของคืน",
    "sound.bpm": "จังหวะโดยประมาณ",
    "sound.around": "ประมาณ",
    "sound.illus": "ภาพประกอบ",
    "sound.note": "เวลาและจังหวะเป็นค่าประมาณของคืนทั่วไป ไม่ใช่เซ็ตลิสต์ตายตัว ภาพในส่วนนี้เป็นภาพประกอบที่สร้างขึ้น ไม่ใช่ภาพจากงานจริง",
    "sound.p1.name": "สตาร์ท",
    "sound.p2.name": "ไต่รอบ",
    "sound.p3.name": "เรดไลน์",
    "sound.p4.name": "ปล่อยรอบ",
    "sound.p1.text": "เปิดประตู ดีเจเริ่มที่จังหวะต่ำ ๆ เพื่ออุ่นห้อง ฟลอร์จึงค่อย ๆ เต็มโดยไม่ทันสังเกต",
    "sound.p2.text": "ฟลอร์เริ่มแน่น มิกซ์เริ่มกระชับ เพลงที่ทุกคนรู้จักถูกดึงไว้หนึ่งห้องก่อนถึงท่อนฮุค",
    "sound.p3.text": "MC คุมห้อง ท่อนฮุคมาถึง และทั้งฟลอร์ขยับไปพร้อมกัน นี่คือจุดพีคของคืน",
    "sound.p4.text": "จังหวะลดลง เพลงช้าสำหรับคนที่ยังอยู่ ไฟเปิดครึ่งหนึ่ง คืนค่อย ๆ จบลง",

    "past.title": "ผลงานที่ผ่านมา",
    "past.lede": "งานที่คัดมาบางส่วน ระบุบทบาทและวันที่เฉพาะที่ยืนยันได้",
    "past.col.what": "งาน",
    "past.col.role": "บทบาท",
    "past.col.when": "เมื่อไร",
    "past.col.source": "ที่มา",
    "past.tbc": "รอยืนยันวันที่",
    "past.r1.role": "งานของคอลเลกทีฟ ร่วมกับ YOUNGOHM",
    "past.r1.where": "สามย่านมิตรทาวน์ กรุงเทพฯ",
    "past.r2.title": "เทคโอเวอร์ที่ MIL",
    "past.r2.role": "คลับเทคโอเวอร์",
    "past.r2.where": "กรุงเทพฯ",
    "past.r3.title": "ปาร์ตี้พรีฮาโลวีน",
    "past.r3.role": "ร่วมกับ onenightstory.project และ rospa.club",
    "past.r3.where": "Shanghai Mansion กรุงเทพฯ",
    "past.r4.role": "การแสดง",
    "past.r4.where": "กรุงเทพฯ",
    "past.r5.title": "บริสเบน ออสเตรเลีย",
    "past.r5.role": "ร่วมกับ Brisbane Thai Society",
    "past.src.ig": "โพสต์ Instagram",
    "past.src.bio": "โปรไฟล์ Instagram",
    "past.src.owner": "ข้อมูลที่ได้รับมา รอการยืนยัน",
    "past.r2.when": "พ.ค. 2026",
    "rooms.title": "สถานที่ที่เคยเล่น",
    "rooms.note": "รายชื่อนี้คือเครดิตงานที่ผ่านมา ไม่ใช่รายชื่อเรสซิเดนซีหรือตารางงานคืนนี้ ดูว่าดีเจแต่ละคนเล่นที่ไหนครั้งถัดไปได้ในรายชื่อดีเจ ข้อมูลเครดิตได้รับมาสำหรับคอนเซ็ปต์นี้ และยังรอการยืนยันวันที่",
    "rooms.area.s24": "สุขุมวิท 24",
    "rooms.area.ratch": "รัชโยธิน",
    "rooms.area.s49": "สุขุมวิท 49",
    "rooms.area.bkk": "กรุงเทพฯ",
    "rooms.area.thonglor": "ทองหล่อ",

    "hire.title": "พา Certified_V10 ไปงานของคุณ",
    "hire.lede": "บอกวันที่ เมือง สถานที่ และรูปแบบงานของคุณ ทีมงานจะยืนยันคิวว่าง ไลน์อัพ และค่าตัวโดยตรง",
    "hire.send": "สิ่งที่ควรส่งมา",
    "hire.i1": "วันที่จัดงาน",
    "hire.i2": "เมืองและสถานที่",
    "hire.i3": "รูปแบบงาน",
    "hire.i4": "ดีเจที่ต้องการ หรือทั้งคอลเลกทีฟ",
    "hire.i5": "ความยาวของเซ็ต",
    "hire.i6": "ช่องทางติดต่อของคุณ",
    "hire.cta": "สอบถามทาง Instagram",
    "hire.reassure": "การสอบถามยังไม่ใช่การจองวัน ปุ่มนี้จะเปิด Instagram และการส่งข้อความเป็นเพียงการเริ่มสอบถาม",
    "draft.title": "ร่างข้อความสอบถาม",
    "draft.help": "แก้ไขร่างนี้ แล้วคัดลอกไปวางในข้อความของคุณ เว็บไซต์นี้ไม่ส่งและไม่บันทึกข้อมูลใด ๆ",
    "draft.copy": "คัดลอกร่างข้อความ",

    "footer.nav": "ส่วนท้าย",
    "footer.follow": "ติดตาม",
    "footer.site": "เว็บไซต์นี้",
    "footer.prov.title": "เกี่ยวกับเว็บไซต์นี้",
    "footer.prov.1": "เว็บไซต์คอนเซ็ปต์อิสระ ไม่ใช่เว็บไซต์ทางการของคอลเลกทีฟ และไม่มีการเชื่อมต่อปฏิทินหรือระบบขายบัตร",
    "footer.prov.2": "ภาพสมาชิก ภาพหมู่ โลโก้ และโปสเตอร์งาน มาจากมีเดียแพ็กและ Instagram ของ Certified_V10 ภาพในส่วน “หนึ่งคืนเป็นอย่างไร” เป็นภาพประกอบที่สร้างขึ้น",
    "footer.prov.3": "เว็บไซต์นี้ไม่เก็บข้อมูลส่วนบุคคลและไม่ใช้คุกกี้ ภาษาที่เลือกจะถูกจำไว้ในเบราว์เซอร์ของคุณ ฟอนต์โหลดจาก Google Fonts",
    "footer.back": "กลับไปยังเว็บไซต์หลัก",

    "preview.title": "งานสาธารณะครั้งถัดไป",
    "preview.lede": "หน้านี้แสดงการทำงานของตารางงานรายดีเจด้วยข้อมูลสมมติและนาฬิกาจำลอง ยังไม่มีการเชื่อมต่อปฏิทินจริง",
    "preview.clock": "นาฬิกาจำลอง เวลากรุงเทพฯ",
    "preview.scenario": "เลือกสถานะตารางงานที่ต้องการสาธิต",
    "preview.s.upcoming": "งานที่กำลังจะมาถึง",
    "preview.s.playing": "กำลังเล่นอยู่",
    "preview.s.cancelled": "ยกเลิกงาน",
    "preview.s.empty": "ไม่มีงานสาธารณะ",
    "preview.s.unavailable": "ตารางงานไม่พร้อมแสดง",
    "preview.s.stale": "ข้อมูลเก่า (61 นาที)",
    "preview.reset": "รีเซ็ตตัวอย่าง",
    "preview.noscript": "ปิด JavaScript อยู่ ตัวอย่างนี้ต้องใช้ JavaScript เพื่อแสดงตารางงานสมมติ",
    "preview.foot": "วันที่ สถานที่ และการจัดคิวทั้งหมดในหน้านี้เป็นข้อมูลสมมติ ไม่มีการส่งข้อความ ขายบัตร หรือจองใด ๆ การเผยแพร่จริงต้องใช้ข้อมูลงานสาธารณะที่ลูกค้าอนุมัติ"
  };

  var STR = {
    en: {
      "lang.switch": "Switch to Thai (ภาษาไทย)",
      "status.live": "Playing now",
      "status.tonight": "Tonight",
      "status.upcoming": "Upcoming",
      "status.none": "Not announced",
      "status.unavailable": "Unavailable",
      "status.cancelled": "Cancelled",
      "status.postponed": "Postponed",
      "demo": "demo",
      "none.line": "No public set announced.",
      "none.hint": "This does not indicate booking availability.",
      "unavail.line": "Schedule temporarily unavailable.",
      "unavail.hint": "Check the official channel for the latest details.",
      "conflict.line": "Schedule is being updated.",
      "count.starts": "Starts in",
      "count.status": "Set status",
      "count.on": "On now, ends {time}",
      "count.soon": "Less than a minute",
      "count.days": "{d}d {h}h",
      "count.hours": "{h}h {m}m",
      "count.mins": "{m} min",
      "notice.cancelled": "Cancelled: {venue}, {date}. A new date has not been announced.",
      "notice.postponed": "Postponed: {venue}, {date}. A new date has not been announced.",
      "stale": "Last updated {time}. Check the official channel.",
      "detail.set": "{venue}. Starts {start}. Ends {end}.",
      "detail.demo": "Example booking, not a confirmed appearance.",
      "link.tickets": "Tickets",
      "link.details": "Event details",
      "link.map": "Map",
      "announce.live": "{name} is playing now at {venue}.",
      "shows.empty": "No upcoming show has been confirmed here yet. Check the official channel for new dates.",
      "shows.lineup": "Lineup: {names}",
      "hero.none": "None confirmed yet",
      "hero.unavail": "Schedule temporarily unavailable",
      "draft.template": "Hello Certified_V10,\n\nDate(s): \nCity and venue: \nEvent format: \nPreferred DJ or the full collective: \nSet duration: \nContact: \n",
      "draft.ok": "Draft copied.",
      "draft.fail": "Copying was blocked. The draft is selected so you can copy it yourself.",
      "preview.changed": "Demo changed to {name}. No live schedule is connected.",
      "preview.clock.suffix": "demo time"
    },
    th: {
      "lang.switch": "เปลี่ยนเป็นภาษาอังกฤษ (English)",
      "status.live": "กำลังเล่นอยู่",
      "status.tonight": "คืนนี้",
      "status.upcoming": "เร็ว ๆ นี้",
      "status.none": "ยังไม่ประกาศ",
      "status.unavailable": "ไม่พร้อมแสดง",
      "status.cancelled": "ยกเลิก",
      "status.postponed": "เลื่อน",
      "demo": "ตัวอย่าง",
      "none.line": "ยังไม่มีประกาศงานสาธารณะ",
      "none.hint": "ไม่ได้หมายความว่ามีคิวว่างรับงาน",
      "unavail.line": "ตารางงานไม่พร้อมแสดงชั่วคราว",
      "unavail.hint": "ดูรายละเอียดล่าสุดได้ที่ช่องทางทางการ",
      "conflict.line": "กำลังอัปเดตตารางงาน",
      "count.starts": "เริ่มใน",
      "count.status": "สถานะ",
      "count.on": "กำลังเล่น จบ {time}",
      "count.soon": "ไม่ถึงหนึ่งนาที",
      "count.days": "{d} วัน {h} ชม.",
      "count.hours": "{h} ชม. {m} นาที",
      "count.mins": "{m} นาที",
      "notice.cancelled": "ยกเลิก: {venue} {date} ยังไม่ประกาศวันใหม่",
      "notice.postponed": "เลื่อน: {venue} {date} ยังไม่ประกาศวันใหม่",
      "stale": "อัปเดตล่าสุด {time} โปรดตรวจสอบที่ช่องทางทางการ",
      "detail.set": "{venue} เริ่ม {start} จบ {end}",
      "detail.demo": "งานตัวอย่าง ไม่ใช่งานที่ยืนยันแล้ว",
      "link.tickets": "บัตร",
      "link.details": "รายละเอียดงาน",
      "link.map": "แผนที่",
      "announce.live": "{name} กำลังเล่นอยู่ที่ {venue}",
      "shows.empty": "ยังไม่มีงานที่ยืนยันแล้วในขณะนี้ ติดตามวันใหม่ได้ที่ช่องทางทางการ",
      "shows.lineup": "ไลน์อัพ: {names}",
      "hero.none": "ยังไม่มีงานที่ยืนยัน",
      "hero.unavail": "ตารางงานไม่พร้อมแสดงชั่วคราว",
      "draft.template": "สวัสดี Certified_V10\n\nวันที่จัดงาน: \nเมืองและสถานที่: \nรูปแบบงาน: \nดีเจที่ต้องการ หรือทั้งคอลเลกทีฟ: \nความยาวของเซ็ต: \nช่องทางติดต่อ: \n",
      "draft.ok": "คัดลอกร่างข้อความแล้ว",
      "draft.fail": "ไม่สามารถคัดลอกอัตโนมัติได้ ร่างข้อความถูกเลือกไว้ให้คัดลอกเอง",
      "preview.changed": "เปลี่ยนตัวอย่างเป็น {name} ยังไม่มีการเชื่อมต่อตารางงานจริง",
      "preview.clock.suffix": "เวลาจำลอง"
    }
  };

  var ATTRS = [["data-i18n-alt", "alt"], ["data-i18n-label", "aria-label"]];
  var lang = "en";
  var listeners = [];
  var originals = new WeakMap();

  function supported(value) { return value === "en" || value === "th" ? value : null; }

  function fromUrl() {
    try { return supported(new URLSearchParams(location.search).get("lang")); }
    catch (e) { return null; }
  }

  function saved() {
    try { return supported(localStorage.getItem("cv-lang")); }
    catch (e) { return null; }
  }

  function t(key, vars) {
    var s = STR[lang][key];
    if (s == null) s = STR.en[key];
    if (s == null) return key;
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
  }

  function remember(el) {
    var o = originals.get(el);
    if (!o) { o = { attrs: {} }; originals.set(el, o); }
    return o;
  }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var o = remember(el);
      if (o.text === undefined) o.text = el.textContent;
      var th = TH[el.getAttribute("data-i18n")];
      el.textContent = lang === "th" && th != null ? th : o.text;
    });
    ATTRS.forEach(function (pair) {
      document.querySelectorAll("[" + pair[0] + "]").forEach(function (el) {
        var o = remember(el);
        if (o.attrs[pair[1]] === undefined) o.attrs[pair[1]] = el.getAttribute(pair[1]) || "";
        var th = TH[el.getAttribute(pair[0])];
        el.setAttribute(pair[1], lang === "th" && th != null ? th : o.attrs[pair[1]]);
      });
    });
    document.querySelectorAll(".js-lang").forEach(function (btn) {
      btn.setAttribute("aria-label", t("lang.switch"));
    });
    /* Links between this site's pages carry the language with them. */
    document.querySelectorAll("a[data-keep-lang]").forEach(function (a) {
      var url = new URL(a.getAttribute("href"), location.href);
      url.searchParams.set("lang", lang);
      a.setAttribute("href", url.pathname.split("/").pop() + url.search + url.hash);
    });
  }

  function set(next, opts) {
    next = supported(next);
    if (!next) return;
    opts = opts || {};
    lang = next;
    apply();
    if (opts.save) { try { localStorage.setItem("cv-lang", lang); } catch (e) { /* storage blocked */ } }
    if (opts.url) {
      try {
        var url = new URL(location.href);
        url.searchParams.set("lang", lang);
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      } catch (e) { /* history unavailable */ }
    }
    listeners.forEach(function (fn) { fn(lang); });
  }

  function init() {
    lang = fromUrl() || saved() || "en";
    apply();
    document.querySelectorAll(".js-lang").forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        set(lang === "en" ? "th" : "en", { save: true, url: true });
      });
    });
    window.addEventListener("popstate", function () {
      var wanted = fromUrl();
      if (wanted && wanted !== lang) set(wanted, {});
    });
  }

  window.CVI18n = {
    init: init,
    set: set,
    t: t,
    onChange: function (fn) { listeners.push(fn); },
    get lang() { return lang; }
  };
})();
