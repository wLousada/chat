# Stream Pack "POSTAIS DE LEONIDA" — GTA VI

Stream pack animado para lives de **GTA VI** na **Twitch (16:9)** e no **TikTok (9:16)**.

**O conceito (único):** cada tela é um cartão-postal oficial *Visit Leonida* (Vice City, Leonida Keys, Port Gellhorn, Grassrivers).
Dentro dele vai um cenário oficial do jogo, e o personagem salta para fora da moldura. Por cima vêm um selo do VI e um
carimbo dos correios com o **nome do seu canal** e a data do dia. O fundo é o pôr do sol de Vice City com as palmeiras oficiais,
e a imagem tem cara de câmera VHS (REC, timecode, cantos de câmera), como os vídeos de rede social dos trailers do GTA VI.

Todo o material visual é oficial da Rockstar (rockstargames.com/VI): logo GTA VI, personagens (Boobie, Brian, Cal, Dre'Quan,
Raul, Real Dimez, Jason e Lucia), cenários e postais.

## 0. Instale a fonte (1 minuto)
Baixe grátis a **Pricedown** em dafont.com/pricedown.font, abra `Pricedown Bl.otf` e clique em **Instalar**.
A licença não permite mandar a fonte junto. Sem ela, as cenas animadas usam uma fonte parecida.
Os PNGs e vídeos em `exports/` já saem com a Pricedown.

## 1. Coloque seu nome
Abra `config.js` (Bloco de Notas serve) e troque `nome`, `redes`, horários e metas.
Em `telas` você escolhe o **postal, o cenário e o personagem** de cada tela.

## 2. O que vem no pack (`cenas/`)
| Arquivo | Formato | Uso |
|---|---|---|
| `01-iniciando` | 16:9 + VERTICAL | "A live está iniciando" com contagem regressiva |
| `02-pausada` | 16:9 + VERTICAL | Pausa com contagem |
| `03-finalizou` | 16:9 + VERTICAL | Fim, com seus horários |
| `04-offline` | 1920×1080 | Tela offline |
| `05-overlay-gameplay` | 1920×1080 transparente | Câmera 540×304 em x=1330, y=712 (canto direito, longe do minimapa), AO VIVO, meta, redes |
| `06-base-tiktok` | 1080×1920 transparente | Câmera 600×338 (x=56, y=300), jogo 1080×608 (y=690), meta de like |
| `07-webcam` | 760×520 | Moldura neon avulsa |
| `08-alertas` | 1920×1080 transparente | Postal que vira + carimbada: seguidor, sub, doação, raid, bits, sub gift |
| `09-banner-twitch` | 1200×480 | Banner com Real Dimez |
| `10-painel` | 320×160 | Painéis: `?p=sobre`, regras, redes, apoie, setup, horarios, comandos |
| `11-react` | 1920×1080 | Vídeo 1300×731 (x=40, y=110) + câmera 460×259 (x=1420, y=110) |
| `12-conversa` | 1920×1080 | Câmera 1240×698 (x=60, y=110) + chat 460×420 (x=1400, y=480) |
| `13-meta-de-like` | 640×160 | Meta de like avulsa |
| `14-transicao` | 16:9 + VERTICAL | Stinger com as artes da capa e o logo. Vídeo pronto em `exports/transicao/` |
| `15-chatbox` | 520×760 transparente | **ChatBox real da Twitch** (lê o chat do canal em `redes.twitch`, sem login) |

## 3. No OBS
- **Cenas:** Fonte → **Navegador** → marque *Arquivo local* → escolha o `.html` → 1920×1080 (ou 1080×1920 nos verticais).
- **Transição:** Transições → **+ Stinger** → `exports/transicao/transicao-1920x1080.webm` → ponto de transição **620 ms**.
- **Alertas:** teste com `08-alertas.html?demo`. Para um alerta fixo: `?tipo=sub&user=FULANO&valor=3&fixo=1`.
  Também dá pra usar os PNGs de `exports/alertas/` no StreamElements/Streamlabs.
- **ChatBox:** coloque o nome do canal em `redes.twitch` no config (ou `15-chatbox.html?canal=seucanal`).
  Para ver um exemplo antes, use `?demo`.

Os PNGs ficam em `exports/`. Abra `galeria.html` para ver tudo junto.
Gerar tudo de novo depois de mudar o config: `node ferramentas/exportar.js` (precisa do Node + Playwright).

## 4. Cores
Rosa `#FF3EA5` · Laranja `#FF8A5C` · Pêssego `#FFC46B` · Violeta `#6A2BD9` · Noite `#12061F` · Neon ciano `#3EE6F0`
Fontes: Pricedown (instalar), Anton, Barlow Condensed, Oswald e Yellowtail (incluídas).
