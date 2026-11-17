/* ===== STREAM PACK "POSTAIS DE LEONIDA" — motor das cenas ===== */
(function () {
  const C = Object.assign({}, window.PACK_CONFIG || {});
  const q = new URLSearchParams(location.search);
  if (q.get("nome")) C.nome = q.get("nome");
  if (q.get("min")) { C.contagemMinutos = +q.get("min"); C.intervaloMinutos = +q.get("min"); }

  const B = document.body, cena = B.dataset.cena, fmt = B.dataset.formato || "h";
  const W = fmt === "v" ? 1080 : 1920, H = fmt === "v" ? 1920 : 1080, v = fmt === "v";
  B.classList.add(fmt);
  const OF = "../assets/oficial/";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nome = esc(C.nome || "SEU NOME");
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  const R = C.redes || {};

  const CHARS = { boobie: [928, 1500], brian: [1500, 1370], cal: [1500, 894], drequan: [1456, 1500], raul: [856, 1500], realdimez: [1373, 1500] };
  const POSTAIS = ["vicecity", "keys", "portgellhorn", "grassrivers"];

  /* ---------- peças ---------- */
  function sunsetBG() {
    return `<div class="layer sky"></div><div class="layer sky-shade"></div><div class="layer sky-side"></div>
      <div class="sun" style="${v ? "width:620px;height:620px;left:230px;top:820px" : "width:560px;height:560px;left:1060px;top:300px"}"></div>
      <div class="layer leak"></div><div class="layer scan"></div><div class="layer vignette"></div><div class="layer grain"></div>`;
  }
  const logo = (h, which) => `<img src="${OF}logo-${which || "gtavi"}.webp" style="height:${h}px;display:block;filter:drop-shadow(0 10px 24px rgba(18,6,31,.6))" alt="">`;

  function carimbo(extra) {
    const d = new Date(), data = pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear();
    const id = "c" + Math.random().toString(36).slice(2, 7);
    return `<div class="carimbo ${extra || ""}"><svg viewBox="0 0 230 230">
      <defs><path id="${id}" d="M115,115 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0"/></defs>
      <circle cx="115" cy="115" r="104" fill="none" stroke="currentColor" stroke-width="6"/>
      <circle cx="115" cy="115" r="62" fill="none" stroke="currentColor" stroke-width="3"/>
      <text font-family="Barlow C" font-weight="800" font-size="22" letter-spacing="4" fill="currentColor"><textPath href="#${id}" startOffset="0">★ ${nome} ★ AO VIVO DE LEONIDA ★</textPath></text>
      <text x="115" y="108" text-anchor="middle" font-family="Barlow C" font-weight="800" font-size="24" letter-spacing="2" fill="currentColor">AO VIVO</text>
      <text x="115" y="136" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="20" fill="currentColor">${data}</text>
      <path d="M230,70 q20,-12 40,0 t40,0 t40,0 M230,100 q20,-12 40,0 t40,0 t40,0 M230,130 q20,-12 40,0 t40,0 t40,0 M230,160 q20,-12 40,0 t40,0 t40,0" fill="none" stroke="currentColor" stroke-width="5"/>
    </svg></div>`;
  }
  const selo = (style) => `<div class="selo" style="${style}"><div class="in"><img src="${OF}logo-vi.webp" alt=""><b>LEONIDA</b></div></div>`;

  // postal com personagem saltando para fora
  function postal(x, y, w, cfg, rot, opts) {
    opts = opts || {};
    const h = Math.round(w / 1.5), ch = CHARS[cfg.personagem];
    let charHTML = "";
    if (ch) {
      const ar = ch[0] / ch[1];
      let chH = h * (ar > 1.2 ? 1.0 : 1.32), chW = chH * ar;
      if (chW > w * 0.8) { chW = w * 0.8; chH = chW / ar; }
      charHTML = `<img class="char pop" src="${OF}char-${cfg.personagem}.webp" style="height:${chH.toFixed(0)}px;right:${(-w * (v ? 0.07 : 0.17)).toFixed(0)}px" alt="">`;
    }
    return `<div class="postal in-up d2" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot || 0}deg)">
      <div class="photo"><img src="${OF}${cfg.cena}.jpg" alt=""></div>
      <img class="frame" src="${OF}postal-${cfg.postal}.webp" alt="">
      ${opts.noSelo ? "" : selo(`left:${(w * 0.035).toFixed(0)}px;top:${(h * 0.06).toFixed(0)}px;transform:rotate(-7deg) scale(${(w / 900).toFixed(2)});transform-origin:top left`)}
      ${charHTML}
      ${opts.noStamp ? "" : `<div style="position:absolute;left:${(w * 0.05).toFixed(0)}px;top:${(h * 0.42).toFixed(0)}px;transform:scale(${(w / 900).toFixed(2)});transform-origin:top left">${carimbo("stamp-slam")}</div>`}
    </div>`;
  }

  function ticker() {
    const items = (C.ticker || []).map(esc);
    if (R.tiktok) items.push("TIKTOK " + esc(R.tiktok));
    if (R.instagram) items.push("INSTAGRAM " + esc(R.instagram));
    const run = items.join("<i>✦</i>") + "<i>✦</i>";
    return `<div class="ticker"><div class="tag"><img src="${OF}logo-vi.webp" alt="">AO VIVO</div><div class="track"><div class="move" style="animation-duration:${Math.max(30, run.length * 0.12)}s">${run}${run}</div></div></div>`;
  }
  const topbar = () => `<div class="topbar"><span class="rec">REC <span class="tc" id="tc">00:00:00</span></span><span>${esc(C.cidade)} • ${esc(C.temperatura)} • <span class="clk"></span></span></div>`;
  const corners = () => `<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl" style="bottom:92px"></i><i class="corner br" style="bottom:92px"></i>`;

  function runClocks() {
    const t0 = Date.now();
    const f = () => {
      document.querySelectorAll(".clk").forEach((e) => (e.textContent = hhmm()));
      const s = Math.floor((Date.now() - t0) / 1000), tc = document.getElementById("tc");
      if (tc) tc.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
    };
    f(); setInterval(f, 1000);
  }
  function countdown(el, minutes) {
    const end = Date.now() + minutes * 60000;
    (function tick() {
      const left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      el.textContent = left > 0 ? pad(m) + ":" + pad(s) : "JÁ JÁ!";
      if (left > 0) setTimeout(tick, 250);
    })();
  }

  /* ---------- TELAS ---------- */
  const TELAS = {
    inicio: { cfg: "inicio", k: "A LIVE ESTÁ", t: "INICIANDO", neon: "ao vivo de Vice City", lbl: "COMEÇA EM", min: () => C.contagemMinutos },
    pausa: { cfg: "pausa", k: "A LIVE ESTÁ", t: "PAUSADA", neon: "volto já, não sai daí", lbl: "VOLTA EM", min: () => C.intervaloMinutos },
    fim: { cfg: "fim", k: "A LIVE JÁ", t: "FINALIZOU", neon: "valeu pela presença", lbl: "PRÓXIMAS" },
    offline: { cfg: "offline", k: "CANAL", t: "OFFLINE", neon: "fora de Leonida", lbl: "LIVES" },
  };
  function buildTela(tipo) {
    const T = TELAS[tipo], cfg = (C.telas || {})[T.cfg] || { postal: "vicecity", cena: "cena-3", personagem: "boobie" };
    const clock = T.min ? `<div class="timer"><div class="lbl">${T.lbl}</div><div class="val" id="cd">--:--</div></div>`
      : `<div class="timer"><div class="lbl">${T.lbl}</div><div class="val small">${esc(C.horarios)}</div></div>`;
    const size = v ? 200 : 210;
    B.innerHTML = `${sunsetBG()}${topbar()}${corners()}
      <div class="content abs" style="${v ? "left:0;right:0;top:130px;text-align:center" : "left:110px;top:120px;width:900px"}">
        <div class="in-l" style="${v ? "display:flex;justify-content:center" : ""}">${logo(v ? 210 : 230)}</div>
        <div class="in-l d1" style="margin-top:${v ? 26 : 30}px"><div class="kick"><span>${T.k}</span></div></div>
        <div class="in-l d2" style="margin-top:14px"><div class="vi-text title" style="font-size:${size}px;display:inline-block;transform:rotate(-3deg)">${T.t}</div></div>
        <div class="in-l d3 neon" style="font-size:${v ? 68 : 72}px;margin-top:${v ? 4 : 0}px">${T.neon}</div>
        <div class="in-l d4" style="margin-top:${v ? 22 : 26}px"><div class="plate"><small>COM</small><b>${nome}</b></div></div>
        <div class="in-l d5" style="margin-top:${v ? 24 : 28}px">${clock}</div>
      </div>
      ${v ? postal(110, 1150, 860, cfg, -3) : postal(960, 310, 780, cfg, 4)}
      ${ticker()}`;
    if (T.min) countdown(document.getElementById("cd"), T.min());
    // ajusta o título para caber
    const t = document.querySelector(".title"), max = v ? 960 : 880;
    if (t.scrollWidth > max) t.style.fontSize = (size * max / t.scrollWidth).toFixed(0) + "px";
    if (v) { // postal logo abaixo do texto
      const place = () => { const b = document.querySelector(".content").getBoundingClientRect().bottom; document.querySelector(".postal").style.top = Math.max(1150, b + 200) + "px"; };
      place(); window.addEventListener("load", place); setTimeout(place, 800);
    }
    runClocks();
  }

  /* ---------- molduras ---------- */
  function neonFrame(x, y, w, h, label, opts) {
    opts = opts || {};
    const lbl = label === false ? "" : `<div class="lbl"><div class="n">${label || nome}</div><div class="g">${opts.tag || "GTA VI"}</div></div>`;
    const peek = opts.peek ? `<img class="peek" src="${OF}char-${opts.peek}.webp" style="height:${opts.peekH || h * 1.1}px;${opts.peekSide || "right"}:${opts.peekOff || -(h * 0.55)}px" alt="">` : "";
    return `<div class="frame-neon ${opts.cls || ""}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="hole"></div>${lbl}${opts.rec ? `<div class="rec-badge rec">REC</div>` : ""}${peek}</div>`;
  }
  function hudLive() {
    return `<div class="hud-live"><div class="a">AO VIVO</div><div class="b clk"></div><div class="c">${esc((C.cidade || "").split(",")[0])}</div></div>`;
  }
  function metaBar(width) {
    const m = C.meta || { texto: "META", atual: 0, total: 1 }, pct = Math.min(100, (m.atual / m.total) * 100).toFixed(1);
    return `<div class="bar-meta" style="width:${width || 440}px"><div class="row"><span>${esc(m.texto)}</span><b>${m.atual}/${m.total}</b></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  function likeMeta(width) {
    const L = C.metaLike || { atual: 0, total: 1 }, pct = Math.min(100, (L.atual / L.total) * 100).toFixed(1), n = (x) => Number(x).toLocaleString("pt-BR");
    return `<div class="like" style="width:${width || 520}px"><div class="th"><svg viewBox="0 0 24 24" fill="#fff"><path d="M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.3l1-4.6v-.3c0-.4-.2-.8-.4-1.1L13.2 1 6.6 7.6C6.2 8 6 8.5 6 9v10a2 2 0 0 0 2 2h9c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.2-.5.2-.7v-2z"/></svg></div>
      <div class="bar-meta"><div class="row"><span>META DE LIKE</span><b>${n(L.atual)}/${n(L.total)}</b></div><div class="bar"><i style="width:${pct}%"></i></div></div></div>`;
  }
  function socialToast(style) {
    const list = [["TW", "SIGA NA TWITCH", R.twitch && "twitch.tv/" + R.twitch], ["TT", "SIGA NO TIKTOK", R.tiktok], ["IG", "INSTAGRAM", R.instagram], ["YT", "YOUTUBE", R.youtube]].filter((x) => x[2]);
    setTimeout(() => {
      const el = document.getElementById("toast"); if (!el || !list.length) return;
      let i = 0; const show = () => { const [ico, l, val] = list[i++ % list.length]; el.innerHTML = `<div class="ico">${ico}</div><div><small>${l}</small><b>${esc(val)}</b></div>`; el.classList.remove("out"); setTimeout(() => el.classList.add("out"), 7000); };
      show(); setInterval(show, 9000);
    }, 600);
    return `<div class="toast out" id="toast" style="${style}"></div>`;
  }
  function holedBG(holes) {
    const g = "linear-gradient(#000,#000)", imgs = [g].concat(holes.map(() => g)).join(",");
    const pos = ["0 0"].concat(holes.map((h) => `${h[0]}px ${h[1]}px`)).join(","), size = ["100% 100%"].concat(holes.map((h) => `${h[2]}px ${h[3]}px`)).join(",");
    const m = `-webkit-mask-image:${imgs};-webkit-mask-position:${pos};-webkit-mask-size:${size};-webkit-mask-repeat:no-repeat;-webkit-mask-composite:xor;mask-image:${imgs};mask-position:${pos};mask-size:${size};mask-repeat:no-repeat;mask-composite:exclude;`;
    return `<div class="layer" style="${m}"><div class="layer sky"></div><div class="layer sky-shade" style="background:linear-gradient(180deg,rgba(18,6,31,.85),rgba(36,9,63,.6) 50%,rgba(18,6,31,.8))"></div><div class="layer leak"></div><div class="layer scan"></div><div class="layer grain"></div></div>`;
  }

  /* ---------- OVERLAY GAMEPLAY ---------- */
  function buildOverlay() {
    // câmera no canto inferior DIREITO (minimapa do GTA fica no inferior esquerdo)
    B.innerHTML = `<div class="abs in-l" style="left:40px;top:36px">${hudLive()}${metaBar(440)}</div>
      ${neonFrame(1330, 712, 540, 304, null, { rec: true })}
      ${selo("left:1800px;top:640px;transform:rotate(8deg) scale(.6);transform-origin:top left")}
      ${socialToast("left:50%;bottom:30px;margin-left:-260px;width:520px")}`;
    runClocks();
  }

  /* ---------- BASE TIKTOK ---------- */
  function buildTikTok() {
    B.innerHTML = `${neonFrame(56, 300, 600, 338, null, { rec: true })}
      <div class="abs in-l d2" style="left:700px;top:270px;width:330px">${logo(150)}<div style="margin-top:20px">${hudLive()}</div><div class="neon" style="font-size:44px;margin-top:10px">ao vivo de Leonida</div></div>
      ${neonFrame(0, 690, 1080, 608, false, { cls: "cyan" })}
      <div class="abs" style="left:56px;top:1340px">${likeMeta(968)}</div>`;
    runClocks();
  }

  /* ---------- WEBCAM AVULSA ---------- */
  function buildWebcam() { B.style.width = "760px"; B.style.height = "520px"; B.innerHTML = neonFrame(90, 120, 560, 315, null, { rec: true }); }

  /* ---------- REACT ---------- */
  function buildReact() {
    const vid = [40, 110, 1300, 731], cam = [1420, 110, 460, 259];
    B.innerHTML = `${holedBG([vid, cam])}
      ${neonFrame(...vid, "REACT", { tag: "AO VIVO", cls: "cyan" })}${neonFrame(...cam, null)}
      <div class="abs in-l" style="left:1420px;top:430px;width:460px">${logo(130)}<div style="margin-top:20px">${metaBar(460)}</div><div style="margin-top:14px">${likeMeta(460)}</div></div>
      <div class="abs in-l d2" style="left:40px;top:880px"><div class="plate"><small>REAGINDO COM</small><b>${nome}</b></div></div>
      ${socialToast("left:1420px;top:890px;width:460px")}
      ${ticker()}`;
    runClocks();
  }

  /* ---------- CONVERSA ---------- */
  function buildConversa() {
    const cam = [60, 110, 1240, 698], chat = [1400, 480, 460, 420];
    B.innerHTML = `${holedBG([cam, chat])}
      ${neonFrame(...cam, null, { rec: true })}${neonFrame(...chat, "CHAT", { tag: "AO VIVO", cls: "cyan" })}
      <div class="abs in-l" style="left:1400px;top:100px;width:460px">${logo(150)}<div class="neon pink" style="font-size:56px;margin-top:8px">só conversa</div><div style="margin-top:6px">${hudLive()}</div></div>
      <div class="abs in-l d2" style="left:60px;top:870px"><div class="plate"><small>PAPO COM</small><b>${nome}</b></div></div>
      ${ticker()}`;
    runClocks();
  }

  /* ---------- META DE LIKE ---------- */
  function buildLike() { B.style.width = "640px"; B.style.height = "160px"; B.innerHTML = `<div class="abs" style="left:30px;top:30px">${likeMeta(580)}</div>`; }

  /* ---------- ALERTAS ---------- */
  const ALERTAS = {
    follow: { k: "NOVO SEGUIDOR", sb: () => "acabou de chegar em Leonida", p: "vicecity", c: "cena-3" },
    sub: { k: "NOVO SUB", sb: (v) => `agora é da família${v ? " • " + v + " meses" : ""}`, p: "keys", c: "cena-1" },
    donate: { k: "DOAÇÃO RECEBIDA", sb: (v) => `mandou ${v || "R$ 10,00"} pro caixa`, p: "portgellhorn", c: "cena-4" },
    raid: { k: "RAID CHEGANDO", sb: (v) => `trouxe ${v || "50"} da gangue`, p: "grassrivers", c: "cena-5" },
    bits: { k: "BITS RECEBIDOS", sb: (v) => `mandou ${v || "100"} bits`, p: "vicecity", c: "cena-2" },
    gift: { k: "SUB DE PRESENTE", sb: (v) => `presenteou ${v || "5"} subs`, p: "keys", c: "cena-6" },
  };
  function buildAlerta() {
    B.innerHTML = `<div class="alert" id="al"><div class="card"><div class="pc"><div class="photo"><img alt=""></div><img class="frame" alt=""></div>
      <div class="bd"><div class="k"></div><div class="nm vi-text"></div><div class="sb"></div>${carimbo()}</div></div></div>`;
    const el = document.getElementById("al"); let timer;
    window.showAlert = function (tipo, quem, valor, dur) {
      const A = ALERTAS[tipo] || ALERTAS.follow;
      el.querySelector(".pc .photo img").src = OF + A.c + ".jpg"; el.querySelector(".pc .frame").src = OF + "postal-" + A.p + ".webp";
      el.querySelector(".k").textContent = A.k; el.querySelector(".nm").textContent = quem || "FULANO"; el.querySelector(".sb").textContent = A.sb(valor);
      el.className = "alert"; void el.offsetWidth; el.className = "alert on";
      clearTimeout(timer); timer = setTimeout(() => (el.className = "alert off"), dur || 6000);
    };
    const tipo = q.get("tipo"), user = q.get("user");
    if (tipo || user) window.showAlert(tipo || "follow", user || "FULANO", q.get("valor"), q.get("fixo") ? 1e9 : 6000);
    if (q.get("demo") !== null) {
      const seq = [["follow", "LUCIA_FAN"], ["sub", "JASON_D", "3"], ["donate", "VICE_KING", "R$ 25,00"], ["raid", "REAL_DIMEZ_FC", "120"], ["gift", "BOOBIE_IKE", "5"]];
      let i = 0; const go = () => { const s = seq[i++ % seq.length]; window.showAlert(s[0], s[1], s[2], 5200); }; go(); setInterval(go, 7000);
    }
  }

  /* ---------- CHATBOX (chat real da Twitch, sem login) ---------- */
  function buildChat() {
    B.style.width = "520px"; B.style.height = "760px";
    B.innerHTML = `<div class="chat" id="chat"></div>`;
    const box = document.getElementById("chat");
    const add = (who, txt) => { const m = document.createElement("div"); m.className = "msg"; m.innerHTML = `<div class="who">${esc(who)}</div><div class="txt">${esc(txt)}</div>`; box.appendChild(m); while (box.children.length > 12) box.firstChild.remove(); };
    const canal = (q.get("canal") || R.twitch || "").toLowerCase().replace(/^@/, "");
    if (q.get("demo") !== null || !canal || canal === "seunome") {
      const demo = [["lucia_fan", "BORA VICE CITY 🔥"], ["jason_d", "esse jacaré na piscina kkkkk"], ["real_dimez_fc", "manda o link do tiktok"], ["boobie_ike", "salve salve!!"], ["vice_king", "GTA VI chegou e eu chorei"], ["leonida_br", "primeira vez aqui, já dei follow"]];
      let i = 0; const go = () => { const d = demo[i++ % demo.length]; add(d[0], d[1]); }; for (let k = 0; k < 4; k++) go(); setInterval(go, 2500);
      return;
    }
    const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    ws.onopen = () => { ws.send("CAP REQ :twitch.tv/tags"); ws.send("PASS SCHMOOPIIE"); ws.send("NICK justinfan" + Math.floor(Math.random() * 80000 + 1000)); ws.send("JOIN #" + canal); };
    ws.onmessage = (e) => e.data.split("\r\n").forEach((line) => {
      if (line.startsWith("PING")) return ws.send("PONG :tmi.twitch.tv");
      const m = line.match(/display-name=([^;]*).* PRIVMSG #\S+ :(.*)$/); if (m) add(m[1] || "anon", m[2]);
    });
  }

  /* ---------- TRANSIÇÃO (stinger) — renderAt(ms) ---------- */
  function buildTransicao() {
    const bands = ["#2a0b4a", "#6a2bd9", "#ff3ea5", "#ff8a5c", "#ffc46b"];
    const flyers = v
      ? [["painel-1", 620, 540, 100], ["painel-3", 380, 300, 1280], ["painel-6", 420, 120, 1500], ["painel-2", 380, 640, 180]]
      : [["painel-1", 640, 140, 120], ["painel-3", 380, 1380, 80], ["painel-6", 430, 1280, 560], ["painel-8", 560, 220, 600], ["painel-5", 470, 820, 640]];
    B.innerHTML = bands.map((c, i) => `<div class="wipe" style="background:${c};left:${-20 + i * (v ? 26 : 24)}%;width:${v ? 40 : 36}%"></div>`).join("") +
      flyers.map((f) => `<img class="flyer" src="${OF}${f[0]}.webp" style="width:${f[1]}px;left:${f[2]}px;top:${f[3]}px" alt="">`).join("") +
      `<div class="tlogo">${logo(v ? 420 : 520)}</div>`;
    const wipes = [...document.querySelectorAll(".wipe")], fl = [...document.querySelectorAll(".flyer")], lg = document.querySelector(".tlogo");
    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3), easeIn = (x) => Math.pow(Math.min(1, Math.max(0, x)), 3);
    window.STINGER = { dur: 1300, ponto: 620 };
    window.renderAt = function (t) {
      wipes.forEach((e, i) => { const d = i * 40; const x = (1 - ease((t - d) / 420)) * -260 + easeIn((t - 780 - d) / 420) * 260; e.style.transform = `skewX(-18deg) translateX(${x}%)`; });
      fl.forEach((e, i) => { const d = 140 + i * 60, a = ease((t - d) / 420), o = easeIn((t - 760 - i * 30) / 380), dir = i % 2 ? 1 : -1;
        e.style.transform = `translate(${(1 - a) * dir * 120 + o * -dir * 140}vw, ${(1 - a) * 30}vh) rotate(${(1 - a) * dir * 40 + dir * 6 + o * dir * 30}deg)`; e.style.opacity = a > 0 ? 1 : 0; });
      const s = ease((t - 380) / 280), out = easeIn((t - 820) / 220);
      lg.style.opacity = s * (1 - out); lg.style.transform = `translate(-50%,-50%) scale(${0.5 + 0.5 * s + 0.4 * out}) rotate(${-6 + 6 * s}deg)`;
    };
    const fixed = q.get("t");
    if (fixed !== null) window.renderAt(+fixed);
    else { const t0 = performance.now(); (function f(n) { window.renderAt((n - t0) % 2600); requestAnimationFrame(f); })(t0); }
  }

  /* ---------- BANNER (1200x480) ---------- */
  function buildBanner() {
    B.style.width = "1200px"; B.style.height = "480px";
    B.innerHTML = `<div class="layer sky" style="animation:none"></div><div class="layer" style="background:linear-gradient(90deg,rgba(18,6,31,.9),rgba(18,6,31,.4) 55%,transparent)"></div><div class="layer leak"></div><div class="layer grain"></div>
      <div class="abs" style="left:50px;top:40px">${logo(120)}<div class="vi-text" style="font-size:120px;margin-top:16px;transform:rotate(-3deg);transform-origin:left">${nome}</div>
      <div class="neon" style="font-size:46px;margin-top:6px">ao vivo de Leonida</div><div style="margin-top:12px"><div class="plate"><small>LIVES</small><b style="font-size:38px">${esc(C.horarios)}</b></div></div></div>
      ${postal(720, 110, 420, { postal: "vicecity", cena: "cena-2", personagem: "realdimez" }, 5, { noStamp: true })}`;
  }

  /* ---------- PAINÉIS (320x160) ---------- */
  const PAINEIS = { sobre: ["SOBRE MIM", "QUEM É " + (C.nome || "")], regras: ["REGRAS", "LEIA ANTES"], redes: ["REDES", "ME SEGUE LÁ"], apoie: ["APOIE", "FORTALECE A LIVE"], setup: ["SETUP", "EQUIPAMENTOS"], horarios: ["HORÁRIOS", C.horarios || ""], comandos: ["COMANDOS", "DO CHAT"] };
  function buildPainel() {
    const p = q.get("p") || "sobre", P = PAINEIS[p] || PAINEIS.sobre;
    B.style.width = "320px"; B.style.height = "160px";
    B.innerHTML = `<div class="panel"><div class="bgp"></div><img class="vi" src="${OF}logo-vi.webp" alt=""><div class="t white-text">${esc(P[0])}</div><div class="s">${esc(P[1]).toUpperCase()}</div></div>`;
    const t = document.querySelector(".panel .t"); if (t.scrollWidth > 270) t.style.fontSize = (62 * 270 / t.scrollWidth).toFixed(0) + "px";
  }

  const build = { tela: () => buildTela(B.dataset.tipo), overlay: buildOverlay, tiktok: buildTikTok, webcam: buildWebcam, react: buildReact, conversa: buildConversa, like: buildLike, alerta: buildAlerta, chat: buildChat, transicao: buildTransicao, banner: buildBanner, painel: buildPainel }[cena];
  const fonts = ["400 20px Pricedown", "400 20px Anton", "600 20px 'Barlow C'", "800 20px 'Barlow C'", "20px Yellowtail", "700 20px Oswald"];
  (document.fonts ? Promise.all(fonts.map((f) => document.fonts.load(f))).catch(() => {}) : Promise.resolve()).finally(build);
})();
