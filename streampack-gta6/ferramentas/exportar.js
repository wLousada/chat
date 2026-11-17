// Exporta todas as cenas em PNG (transparentes quando for overlay).
// Uso: node ferramentas/exportar.js   (precisa do Playwright: npm i playwright)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "exports");
const url = (f, qs = "") => "file://" + path.join(ROOT, "cenas", f) + (qs ? "?" + qs : "");

const JOBS = [
  ["01-iniciando.html", 1920, 1080, "telas/01-iniciando-1920x1080.png"],
  ["postal-01-iniciando.html", 1920, 1080, "telas-postal/01-iniciando-1920x1080.png"],
  ["postal-01-iniciando-VERTICAL.html", 1080, 1920, "telas-postal/01-iniciando-1080x1920.png"],
  ["postal-02-pausada.html", 1920, 1080, "telas-postal/02-pausada-1920x1080.png"],
  ["postal-03-finalizou.html", 1920, 1080, "telas-postal/03-finalizou-1920x1080.png"],
  ["01-iniciando-VERTICAL.html", 1080, 1920, "telas/01-iniciando-1080x1920.png"],
  ["02-pausada.html", 1920, 1080, "telas/02-pausada-1920x1080.png"],
  ["02-pausada-VERTICAL.html", 1080, 1920, "telas/02-pausada-1080x1920.png"],
  ["03-finalizou.html", 1920, 1080, "telas/03-finalizou-1920x1080.png"],
  ["03-finalizou-VERTICAL.html", 1080, 1920, "telas/03-finalizou-1080x1920.png"],
  ["04-offline.html", 1920, 1080, "twitch/offline-1920x1080.png"],
  ["05-overlay-gameplay.html", 1920, 1080, "overlays/overlay-gameplay-1920x1080.png", true],
  ["06-base-tiktok.html", 1080, 1920, "overlays/base-tiktok-1080x1920.png", true],
  ["07-webcam.html", 760, 520, "overlays/webcam-760x520.png", true],
  ["11-react.html", 1920, 1080, "overlays/react-1920x1080.png", true],
  ["12-conversa.html", 1920, 1080, "overlays/conversa-1920x1080.png", true],
  ["13-meta-de-like.html", 640, 160, "overlays/meta-de-like-640x160.png", true],
  ["08-alertas.html", 1920, 440, "alertas/alerta-follow.png", true, "tipo=follow&user=NOVO_SEGUIDOR&fixo=1"],
  ["08-alertas.html", 1920, 440, "alertas/alerta-sub.png", true, "tipo=sub&user=NOVO_SUB&valor=3&fixo=1"],
  ["08-alertas.html", 1920, 440, "alertas/alerta-doacao.png", true, "tipo=donate&user=DOADOR&valor=R$%2025,00&fixo=1"],
  ["08-alertas.html", 1920, 440, "alertas/alerta-raid.png", true, "tipo=raid&user=RAIDER&valor=120&fixo=1"],
  ["15-chatbox.html", 520, 760, "overlays/chatbox-previa.png", true, "demo"],
  ["09-banner-twitch.html", 1200, 480, "twitch/banner-1200x480.png"],
  ...["sobre", "regras", "redes", "apoie", "setup", "horarios", "comandos"].map((p) => ["10-painel.html", 320, 160, `twitch/paineis/painel-${p}.png`, false, "p=" + p]),
];

(async () => {
  const browser = await chromium.launch();
  for (const [file, w, h, out, transparent, qs] of JOBS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url(file, qs));
    await page.waitForTimeout(/^(postal-)?0[1-4]|09|11|12/.test(file) ? 6000 : 3000);
    const dest = path.join(OUT, out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.screenshot({ path: dest, omitBackground: !!transparent });
    console.log("ok", out);
    await page.close();
  }
  // transição (stinger) -> WebM com transparência
  const { execFileSync } = require("child_process");
  for (const [file, w, h, name] of [["14-transicao.html", 1920, 1080, "transicao-1920x1080"], ["14-transicao-VERTICAL.html", 1080, 1920, "transicao-1080x1920"]]) {
    const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "stinger-"));
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url(file, "t=0"));
    await page.waitForTimeout(800);
    const fps = 30, dur = await page.evaluate(() => window.STINGER.dur);
    for (let f = 0; f <= Math.round((dur / 1000) * fps); f++) {
      await page.evaluate((t) => window.renderAt(t), (f * 1000) / fps);
      await page.screenshot({ path: path.join(tmp, `f${String(f).padStart(4, "0")}.png`), omitBackground: true });
    }
    await page.close();
    const dest = path.join(OUT, "transicao", name + ".webm");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    execFileSync("ffmpeg", ["-y", "-v", "error", "-framerate", String(fps), "-i", path.join(tmp, "f%04d.png"), "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "4M", "-auto-alt-ref", "0", dest]);
    fs.copyFileSync(path.join(tmp, "f0019.png"), dest.replace(".webm", "-previa.png"));
    fs.rmSync(tmp, { recursive: true });
    console.log("ok", "transicao/" + name + ".webm");
  }
  // vídeos MP4 das telas 3D animadas (12 s cada)
  for (const [file, w, h, name] of [["01-iniciando.html", 1920, 1080, "iniciando-1920x1080"], ["01-iniciando-VERTICAL.html", 1080, 1920, "iniciando-1080x1920"],
    ["02-pausada.html", 1920, 1080, "pausada-1920x1080"], ["02-pausada-VERTICAL.html", 1080, 1920, "pausada-1080x1920"],
    ["03-finalizou.html", 1920, 1080, "finalizou-1920x1080"], ["03-finalizou-VERTICAL.html", 1080, 1920, "finalizou-1080x1920"]]) {
    const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "rec-"));
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: tmp, size: { width: w, height: h } } });
    const page = await ctx.newPage();
    await page.goto(url(file));
    await page.waitForTimeout(13200);
    const raw = await page.video().path();
    await ctx.close();
    const dest = path.join(OUT, "videos", name + ".mp4");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", "1.0", "-i", raw, "-t", "12", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "20", "-r", "30", "-movflags", "+faststart", dest]);
    fs.rmSync(tmp, { recursive: true });
    console.log("ok", "videos/" + name + ".mp4");
  }
  await browser.close();
})();
