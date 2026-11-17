// Exporta todas as cenas em PNG (transparentes quando for overlay).
// Uso: node ferramentas/exportar.js   (precisa do Playwright: npm i playwright)
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "exports");
const url = (f, qs = "") => "file://" + path.join(ROOT, "cenas", f) + (qs ? "?" + qs : "");

const JOBS = [
  ["01-live-vai-comecar.html", 1920, 1080, "telas/01-live-vai-comecar-1920x1080.png"],
  ["01-live-vai-comecar-VERTICAL.html", 1080, 1920, "telas/01-live-vai-comecar-1080x1920.png"],
  ["02-volto-ja.html", 1920, 1080, "telas/02-volto-ja-1920x1080.png"],
  ["02-volto-ja-VERTICAL.html", 1080, 1920, "telas/02-volto-ja-1080x1920.png"],
  ["03-live-encerrada.html", 1920, 1080, "telas/03-live-encerrada-1920x1080.png"],
  ["03-live-encerrada-VERTICAL.html", 1080, 1920, "telas/03-live-encerrada-1080x1920.png"],
  ["04-offline.html", 1920, 1080, "twitch/offline-1920x1080.png"],
  ["05-overlay-gameplay.html", 1920, 1080, "overlays/overlay-gameplay-1920x1080.png", true],
  ["06-overlay-tiktok.html", 1080, 1920, "overlays/overlay-tiktok-1080x1920.png", true],
  ["07-webcam.html", 720, 520, "overlays/webcam-720x520.png", true],
  ["08-alertas.html", 1920, 400, "alertas/alerta-follow.png", true, "tipo=follow&user=NOVO_SEGUIDOR&fixo=1"],
  ["08-alertas.html", 1920, 400, "alertas/alerta-sub.png", true, "tipo=sub&user=NOVO_SUB&valor=3&fixo=1"],
  ["08-alertas.html", 1920, 400, "alertas/alerta-doacao.png", true, "tipo=donate&user=DOADOR&valor=R$%2025,00&fixo=1"],
  ["08-alertas.html", 1920, 400, "alertas/alerta-raid.png", true, "tipo=raid&user=RAIDER&valor=120&fixo=1"],
  ["09-banner-twitch.html", 1200, 480, "twitch/banner-1200x480.png"],
  ...["sobre", "regras", "redes", "apoie", "setup", "horarios", "comandos"].map((p) => ["10-painel.html", 320, 160, `twitch/paineis/painel-${p}.png`, false, "p=" + p]),
];

(async () => {
  const browser = await chromium.launch();
  for (const [file, w, h, out, transparent, qs] of JOBS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(url(file, qs));
    await page.waitForTimeout(file.includes("tela") || file.startsWith("0") ? 6500 : 2000);
    const dest = path.join(OUT, out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await page.screenshot({ path: dest, omitBackground: !!transparent });
    console.log("ok", out);
    await page.close();
  }
  await browser.close();
})();
