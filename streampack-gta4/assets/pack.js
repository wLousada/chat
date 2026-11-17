/* ===== STREAM PACK "CIDADE SEM LEI" — motor das cenas ===== */
(function () {
  const C = Object.assign({}, window.PACK_CONFIG || {});
  const q = new URLSearchParams(location.search);
  if (q.get("nome")) C.nome = q.get("nome");
  if (q.get("min")) { C.contagemMinutos = +q.get("min"); C.intervaloMinutos = +q.get("min"); }
  if (q.get("horarios")) C.horarios = q.get("horarios");

  const B = document.body;
  const cena = B.dataset.cena;
  const fmt = B.dataset.formato || "h";
  const W = fmt === "v" ? 1080 : 1920;
  const H = fmt === "v" ? 1920 : 1080;
  B.classList.add(fmt);

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nome = esc(C.nome || "SEU NOME");
  const jogo = esc(C.jogo || "GTA IV");
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };

  /* ---------- skyline procedural (original, sem assets de terceiros) ---------- */
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function skyline(w, h, seed, o) {
    o = Object.assign({ bridge: true, windows: true, density: 1 }, o || {});
    const r = rng(seed);
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice">`;
    // ponte suspensa ao fundo
    if (o.bridge) {
      const x1 = w * 0.52, x2 = w * 1.08, tw = (x2 - x1) * 0.22, deck = h * 0.62, top = h * 0.12;
      const t1 = x1 + tw, t2 = x2 - tw;
      s += `<g fill="#3a312b" stroke="#3a312b">`;
      s += `<rect x="${t1 - 9}" y="${top}" width="18" height="${h - top}"/><rect x="${t2 - 9}" y="${top}" width="18" height="${h - top}"/>`;
      s += `<rect x="${t1 - 15}" y="${top + 20}" width="30" height="8"/><rect x="${t2 - 15}" y="${top + 20}" width="30" height="8"/>`;
      s += `<rect x="${x1 - 40}" y="${deck}" width="${x2 - x1 + 80}" height="10"/>`;
      s += `<path d="M${x1 - 40},${deck} Q${(x1 + t1) / 2},${deck - 20} ${t1},${top + 4} Q${(t1 + t2) / 2},${deck + 40} ${t2},${top + 4} Q${(t2 + x2) / 2},${deck - 20} ${x2 + 40},${deck}" fill="none" stroke-width="4"/>`;
      for (let x = t1 + 24; x < t2; x += 24) {
        const tt = (x - t1) / (t2 - t1), y = (1 - tt) * (1 - tt) * (top + 4) + 2 * (1 - tt) * tt * (deck + 40) + tt * tt * (top + 4);
        s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${deck}" stroke-width="1.5"/>`;
      }
      s += `</g>`;
    }
    const layers = [
      { fill: "#2c2724", min: 0.32, max: 0.82, wmin: 50, wmax: 130, win: 0.05, wop: 0.35 },
      { fill: "#181a19", min: 0.2, max: 0.66, wmin: 60, wmax: 150, win: 0.16, wop: 0.75 },
      { fill: "#0a0c0c", min: 0.1, max: 0.42, wmin: 70, wmax: 190, win: 0.2, wop: 1 },
    ];
    let wins = "";
    layers.forEach((L, li) => {
      s += `<g fill="${L.fill}">`;
      let x = -30 - r() * 60;
      while (x < w + 30) {
        const bw = (L.wmin + r() * (L.wmax - L.wmin)) / o.density;
        let bh = h * (L.min + r() * (L.max - L.min));
        if (r() < 0.12) bh *= 1.25; // torres altas
        bh = Math.min(bh, h * 0.96);
        const y = h - bh;
        s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}"/>`;
        // topos: recuo, antena, caixa d'água
        const k = r();
        if (k < 0.25) s += `<rect x="${(x + bw * 0.2).toFixed(1)}" y="${(y - bh * 0.08).toFixed(1)}" width="${(bw * 0.6).toFixed(1)}" height="${(bh * 0.08 + 1).toFixed(1)}"/>`;
        else if (k < 0.42) s += `<rect x="${(x + bw / 2 - 2).toFixed(1)}" y="${(y - 70).toFixed(1)}" width="4" height="70"/>`;
        else if (k < 0.62 && li > 0) {
          const cx = x + bw * (0.25 + r() * 0.5);
          s += `<rect x="${(cx - 14).toFixed(1)}" y="${(y - 38).toFixed(1)}" width="28" height="22" rx="3"/><path d="M${(cx - 17).toFixed(1)},${(y - 38).toFixed(1)} L${cx.toFixed(1)},${(y - 52).toFixed(1)} L${(cx + 17).toFixed(1)},${(y - 38).toFixed(1)}Z"/><rect x="${(cx - 12).toFixed(1)}" y="${(y - 16).toFixed(1)}" width="3" height="16"/><rect x="${(cx + 9).toFixed(1)}" y="${(y - 16).toFixed(1)}" width="3" height="16"/>`;
        }
        if (o.windows && L.win > 0) {
          for (let wy = y + 16; wy < h - 10; wy += 22) for (let wx = x + 10; wx < x + bw - 12; wx += 16) {
            if (r() < L.win) {
              const op = (L.wop * (0.45 + r() * 0.55)).toFixed(2);
              const col = r() < 0.85 ? "#f2a541" : "#efe7d4";
              wins += `<rect class="win${r() < 0.04 ? " fl" : ""}" x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="7" height="10" fill="${col}" opacity="${op}"/>`;
            }
          }
        }
        x += bw + (r() < 0.3 ? r() * 14 : 0);
      }
      s += `</g>`;
      if (li === 1) { s += `<g>${wins}</g>`; wins = ""; }
    });
    s += `<g>${wins}</g></svg>`;
    return s;
  }

  function ambient(skyH, seed) {
    return `<div class="layer sky"></div><div class="layer sun"></div>
      <div class="skyline" style="height:${skyH}px">${skyline(W, skyH, seed)}</div>
      <div class="fogband"></div><div class="layer fog"></div>
      <canvas class="rain" width="${W}" height="${H}"></canvas>
      <div class="layer vignette"></div><div class="layer grain"></div>`;
  }

  function rain(cv) {
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const drops = Array.from({ length: fmt === "v" ? 160 : 220 }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 14 + Math.random() * 26, v: 14 + Math.random() * 14 }));
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(200,205,200,.5)"; ctx.lineWidth = 1.4; ctx.beginPath();
      drops.forEach((d) => { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.25, d.y + d.l); d.y += d.v; d.x -= d.v * 0.25; if (d.y > H) { d.y = -30; d.x = Math.random() * (W + 200); } });
      ctx.stroke(); requestAnimationFrame(frame);
    })();
  }

  function ticker() {
    const items = (C.ticker || []).map(esc);
    const r = C.redes || {};
    if (r.tiktok) items.push("TIKTOK " + esc(r.tiktok));
    if (r.instagram) items.push("INSTAGRAM " + esc(r.instagram));
    const run = items.join("<i>★</i>") + "<i>★</i>";
    const secs = Math.max(30, items.join("").length * 0.32);
    return `<div class="ticker"><div class="tag">PLANTÃO</div><div class="track"><div class="move" style="animation-duration:${secs}s">${run}${run}</div></div></div>`;
  }

  function phone(msgs) {
    return `<div class="phone"><div class="spk"></div><div class="screen">
      <div class="status"><span class="clk">${hhmm()}</span><span class="bars"><i style="height:6px"></i><i style="height:10px"></i><i style="height:14px"></i><i style="height:18px"></i></span></div>
      <div class="head"><span>MENSAGENS</span><span>1/1</span></div>
      <div class="msgs"><div class="from">DE: ${nome}</div><div class="typing"><i></i><i></i><i></i></div></div>
      </div><div class="keys"><div class="soft ok"></div><div class="dpad"></div><div class="soft no"></div></div></div>`;
  }
  function playMsgs(msgs) {
    const box = document.querySelector(".phone .msgs"); if (!box) return;
    let t = 1400;
    msgs.forEach((m, i) => {
      setTimeout(() => {
        const ty = box.querySelector(".typing"); if (ty) ty.remove();
        const b = document.createElement("div"); b.className = "bubble" + (m.me ? " me" : ""); b.textContent = m.t; box.appendChild(b);
        if (i < msgs.length - 1 && !msgs[i + 1].me) { const d = document.createElement("div"); d.className = "typing"; d.innerHTML = "<i></i><i></i><i></i>"; box.appendChild(d); }
      }, t);
      t += 1700;
    });
  }

  function countdown(el, minutes) {
    const end = Date.now() + minutes * 60000;
    (function tick() {
      const left = Math.max(0, end - Date.now());
      const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      el.textContent = left > 0 ? pad(m) + ":" + pad(s) : "JÁ JÁ!";
      if (left > 0) setTimeout(tick, 250);
    })();
  }
  function clocks() { const f = () => document.querySelectorAll(".clk").forEach((e) => (e.textContent = hhmm())); f(); setInterval(f, 5000); }

  /* ---------- TELAS (começar / intervalo / encerrada / offline) ---------- */
  const TELAS = {
    inicio: { k: "PREPARA O CARRO", t: ["A LIVE", "VAI COMEÇAR"], acc: 1, lbl: "COMEÇA EM", min: () => C.contagemMinutos,
      msgs: [{ t: "E aí! Cola aqui que a live já vai começar." }, { t: "Pega o café e chega junto. A cidade tá agitada hoje." }, { t: "Bora!", me: true }] },
    intervalo: { k: "PAUSA RÁPIDA", t: ["VOLTO", "JÁ"], acc: 1, lbl: "RETORNO EM", min: () => C.intervaloMinutos,
      msgs: [{ t: "Fui ali resolver uma parada rapidinho." }, { t: "Não sai daí, volto em instantes!" }, { t: "Tô esperando", me: true }] },
    encerrada: { k: "FIM DA LINHA", t: ["LIVE", "ENCERRADA"], acc: 1, lbl: "PRÓXIMAS",
      msgs: [{ t: "Valeu demais pela presença hoje!" }, { t: "Segue o canal pra não perder a próxima missão." }, { t: "Até a próxima!", me: true }] },
    offline: { k: "FORA DO AR", t: ["OFFLINE"], acc: 0, lbl: "LIVES",
      msgs: [{ t: "No momento estou fora da cidade." }, { t: "Confere os horários e ativa as notificações." }] },
  };

  function buildTela(tipo) {
    const T = TELAS[tipo];
    const lines = T.t.map((l, i) => `<span class="title-line${i === T.acc ? " accent" : ""}">${l}</span>`).join("");
    const hasCount = !!T.min;
    const clock = hasCount
      ? `<div class="clockbox in-l d4"><div class="lbl">${T.lbl}</div><div class="val" id="cd">--:--</div></div>`
      : `<div class="clockbox in-l d4"><div class="lbl">${T.lbl}</div><div class="val small">${esc(C.horarios)}</div></div>`;
    const v = fmt === "v";
    const titleSize = v ? (T.t.some((l) => l.length > 8) ? 150 : 210) : (T.t.some((l) => l.length > 9) ? 176 : 210);
    B.innerHTML = `${ambient(v ? 760 : 470, 7)}
      <div class="topbar"><span><span class="dot"></span>${esc(C.slogan)}</span><span>${jogo} • <span class="clk"></span></span></div>
      <div class="content" style="position:absolute;${v ? "left:0;right:0;top:230px;text-align:center" : "left:120px;top:160px;width:1200px"}">
        <div class="in-l"><div class="kicker"><span>${T.k}</span></div></div>
        <div class="in-l d1"><div class="title" style="${v ? "transform-origin:center" : ""}">${lines}</div></div><br>
        <div class="in-l d3"><div class="plate"><small>${tipo === "offline" || tipo === "encerrada" ? "CANAL" : "AO VIVO COM"}</small><b>${nome}</b></div></div><br>
        ${clock}
      </div>
      <div class="phone-wrap in-up d3" style="position:absolute;${v ? "left:50%;top:1020px;width:420px;height:810px;margin-left:-210px;transform:scale(.8) rotate(-3deg);transform-origin:top center" : "right:190px;top:120px;width:420px;height:810px;transform:rotate(5deg)"}">${phone()}</div>
      ${ticker()}`;
    document.querySelectorAll(".title-line").forEach((e) => (e.style.fontSize = titleSize + "px"));
    if (v) { // no vertical, o celular sempre fica logo abaixo do bloco de texto
      const bottom = document.querySelector(".content").getBoundingClientRect().bottom;
      document.querySelector(".phone-wrap").style.top = Math.max(1000, Math.min(1150, bottom + 50)) + "px";
    }
    if (hasCount) countdown(document.getElementById("cd"), T.min());
    playMsgs(T.msgs); clocks(); rain(document.querySelector("canvas.rain"));
  }

  /* ---------- OVERLAY GAMEPLAY 16:9 ---------- */
  function camHTML(x, y, w, h, tagPos) {
    const tag = `<div class="tag" style="${tagPos}"><div class="n">${nome}</div><div class="g">${jogo}</div></div>`;
    return `<div class="cam" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
      <div class="hole"></div><i class="br tl"></i><i class="br tr"></i><i class="br bl"></i><i class="br brr"></i>
      <div class="tape" style="right:-46px;bottom:-12px">AO VIVO</div>${tag}</div>`;
  }
  function liveHUD() {
    const m = C.meta || { texto: "META", atual: 0, total: 1 };
    const pct = Math.min(100, (m.atual / m.total) * 100).toFixed(1);
    return `<div class="livepill"><div class="a">AO VIVO</div><div class="b clk"></div><div class="c">${jogo}</div></div>
      <div class="meta"><div class="row"><span>${esc(m.texto)}</span><b>${m.atual}/${m.total}</b></div><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  function socialToast(style) {
    const r = C.redes || {};
    const list = [["TW", "SIGA NA TWITCH", r.twitch], ["TT", "SIGA NO TIKTOK", r.tiktok], ["IG", "INSTAGRAM", r.instagram], ["YT", "YOUTUBE", r.youtube]].filter((x) => x[2]);
    setTimeout(() => {
      const el = document.getElementById("toast"); if (!el || !list.length) return;
      let i = 0;
      const show = () => { const [ico, lbl, val] = list[i % list.length]; el.innerHTML = `<div class="ico">${ico}</div><div><small>${lbl}</small><b>${esc(val)}</b></div>`; el.classList.remove("out"); i++; setTimeout(() => el.classList.add("out"), 7000); };
      show(); setInterval(show, 9000);
    }, 600);
    return `<div class="toast out" id="toast" style="${style}"></div>`;
  }
  function buildOverlay() {
    // Webcam no canto inferior DIREITO: o radar do GTA IV fica no inferior esquerdo.
    B.innerHTML = `
      <div style="position:absolute;left:40px;top:36px" class="in-l">${liveHUD()}</div>
      ${camHTML(1316, 704, 544, 306, "left:-6px;top:-74px")}
      ${socialToast("left:50%;bottom:34px;margin-left:-250px;width:500px")}`;
    clocks();
  }

  /* ---------- OVERLAY TIKTOK 9:16 ---------- */
  function buildTikTok() {
    // zona segura: topo ~250px e base ~460px ficam sob a interface do TikTok
    const r = C.redes || {};
    B.innerHTML = `
      ${camHTML(56, 290, 576, 324, "left:-6px;top:-72px")}
      <div style="position:absolute;left:672px;top:282px;width:360px" class="in-l d2">
        <div class="kicker" style="font-size:24px;letter-spacing:5px"><span>AO VIVO</span></div>
        <div style="font:400 64px/1 Anton;margin-top:18px;color:var(--cream);text-shadow:5px 5px 0 #000,10px 10px 0 rgba(212,87,42,.85);transform:rotate(-3deg);transform-origin:left">${jogo}</div>
        <div class="meta" style="width:350px;margin-top:26px"><div class="row"><span>META</span><b>${C.meta.atual}/${C.meta.total}</b></div><div class="bar"><i style="width:${Math.min(100, (C.meta.atual / C.meta.total) * 100)}%"></i></div></div>
        <div style="margin-top:14px;font:400 26px/1.25 'Special Elite';color:var(--cream);text-shadow:2px 2px 0 #000">horário: <span class="clk"></span></div>
      </div>
      <div class="gameframe" style="top:672px"></div>
      <div class="strip" style="left:0;right:0;top:1300px;height:76px"><span>SEGUE</span><i>${esc(r.tiktok || "")}</i><span>★ TWITCH</span><i>${esc((r.twitch || "").replace(/^twitch\.tv\//, ""))}</i></div>`;
    clocks();
  }

  /* ---------- WEBCAM AVULSA ---------- */
  function buildWebcam() {
    B.style.width = "720px"; B.style.height = "520px";
    B.innerHTML = camHTML(80, 120, 560, 315, "left:-6px;top:-74px");
  }

  /* ---------- ALERTAS ---------- */
  const PHONE_ICON = `<svg viewBox="0 0 24 24" fill="#050606"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>`;
  const ALERTAS = {
    follow: { k: "CHAMADA RECEBIDA • NOVO SEGUIDOR", sb: () => "acabou de chegar na cidade" },
    sub: { k: "CHAMADA RECEBIDA • NOVO SUB", sb: (v) => `agora é da família${v ? " — " + v + " meses" : ""}` },
    donate: { k: "TRANSFERÊNCIA RECEBIDA", sb: (v) => `mandou ${v || "R$ 10,00"} pro caixa` },
    raid: { k: "REFORÇOS CHEGANDO • RAID", sb: (v) => `chegou com ${v || "50"} da gangue` },
    bits: { k: "PAGAMENTO RECEBIDO • BITS", sb: (v) => `mandou ${v || "100"} bits` },
    gift: { k: "PRESENTE RECEBIDO • SUB GIFT", sb: (v) => `presenteou ${v || "5"} subs` },
  };
  function buildAlerta() {
    B.innerHTML = `<div class="alert" id="al"><div class="av"><i class="rg"></i><i class="rg"></i>${PHONE_ICON}</div><div class="bd"><div class="k"></div><div class="nm"></div><div class="sb"></div></div></div>`;
    const el = document.getElementById("al");
    let timer;
    window.showAlert = function (tipo, quem, valor, dur) {
      const A = ALERTAS[tipo] || ALERTAS.follow;
      el.querySelector(".k").textContent = A.k;
      el.querySelector(".nm").textContent = quem || "FULANO";
      el.querySelector(".sb").textContent = A.sb(valor);
      el.className = "alert"; void el.offsetWidth; el.className = "alert on";
      clearTimeout(timer); timer = setTimeout(() => { el.className = "alert off"; }, dur || 6000);
    };
    const tipo = q.get("tipo"), user = q.get("user");
    if (tipo || user) window.showAlert(tipo || "follow", user || "FULANO", q.get("valor"), q.get("fixo") ? 1e9 : 6000);
    if (q.get("demo") !== null) {
      const seq = [["follow", "NIKO_FAN99"], ["sub", "ROMAN_PRIMO", "3"], ["donate", "BELLIC_22", "R$ 25,00"], ["raid", "TAXI_DRIVER", "120"], ["gift", "BOLADAO", "5"]];
      let i = 0; const go = () => { const s = seq[i++ % seq.length]; window.showAlert(s[0], s[1], s[2], 5000); }; go(); setInterval(go, 7000);
    }
  }

  /* ---------- BANNER / CAPA (1200x480) ---------- */
  function buildBanner() {
    B.style.width = "1200px"; B.style.height = "480px";
    B.innerHTML = `<div class="layer sky"></div><div class="layer sun" style="background:radial-gradient(ellipse 50% 70% at 78% 72%, rgba(242,165,65,.6), transparent 70%)"></div>
      <div class="skyline" style="height:330px">${skyline(1200, 330, 11)}</div><div class="layer fog"></div><div class="layer vignette"></div><div class="layer grain"></div>
      <div style="position:absolute;left:70px;top:70px">
        <div class="kicker" style="font-size:26px"><span>${esc(C.slogan)}</span></div>
        <div style="font:400 150px/.95 Anton;margin-top:18px;color:var(--cream);text-shadow:6px 6px 0 #000,12px 12px 0 rgba(212,87,42,.9);transform:rotate(-3deg);transform-origin:left;white-space:nowrap">${nome}</div>
        <div class="plate" style="margin-top:30px"><small>LIVES</small><b style="font-size:44px">${esc(C.horarios)}</b></div>
      </div>`;
  }

  /* ---------- PAINÉIS (320x160) ---------- */
  const PAINEIS = {
    sobre: ["SOBRE MIM", "QUEM É " + (C.nome || "")], regras: ["REGRAS", "LEIA ANTES DE CHEGAR"], redes: ["REDES", "ME SEGUE LÁ"],
    apoie: ["APOIE", "FORTALECE A LIVE"], setup: ["SETUP", "EQUIPAMENTOS"], horarios: ["HORÁRIOS", C.horarios || ""], comandos: ["COMANDOS", "DO CHAT"],
  };
  function buildPainel() {
    const p = q.get("p") || "sobre", P = PAINEIS[p] || PAINEIS.sobre, idx = Object.keys(PAINEIS).indexOf(p) + 1;
    B.style.width = "320px"; B.style.height = "160px"; B.classList.add("solid");
    B.innerHTML = `<div class="panel"><div class="skyline">${skyline(320, 90, 20 + idx, { bridge: false, density: 2.2 })}</div><div class="layer halftone" style="opacity:.35"></div>
      <div class="stripe"></div><div class="num">#0${idx}</div><div class="t">${esc(P[0])}</div><div class="s">${esc(P[1]).toUpperCase()}</div></div>`;
  }

  const build = { tela: () => buildTela(B.dataset.tipo), overlay: buildOverlay, tiktok: buildTikTok, webcam: buildWebcam, alerta: buildAlerta, banner: buildBanner, painel: buildPainel }[cena];
  if (document.fonts && document.fonts.load) {
    Promise.all(["400 20px Anton", "600 20px 'Barlow C'", "800 20px 'Barlow C'", "20px 'Special Elite'", "700 20px Oswald"].map((f) => document.fonts.load(f))).finally(build);
  } else build();
})();
