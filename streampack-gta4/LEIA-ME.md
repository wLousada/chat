# Stream Pack "CIDADE SEM LEI" — GTA IV

Stream pack animado para lives de GTA IV na **Twitch (16:9)** e no **TikTok (9:16)**, no visual oficial do jogo:
fundo em grade de artes (como a capa do GTA IV), fonte Pricedown branca com contorno preto, logo oficial e cores das telas de loading (mostarda, verde-azulado, oliva, tijolo, azul aço e ameixa).

## 0. COLOQUE AS ARTES OFICIAIS (obrigatório para o visual oficial)
O pack já está montado para receber o material oficial. Coloque os arquivos em `assets/oficial/` com estes nomes:
- `logo.png`: logo "Grand Theft Auto IV" (fundo transparente)
- `personagem.png`: arte principal no quadro grande (ex.: Niko Bellic)
- `arte-1.jpg` até `arte-6.jpg`: as 6 artes da grade de fundo e da transição (pode ser .png também)
- Fonte **Pricedown**: instale no Windows ou salve como `assets/fonts/pricedown.ttf`

Onde achar: artworks oficiais no site da Rockstar (rockstargames.com/IV) e em wikis de GTA. A fonte Pricedown é gratuita (Typodermic).
Enquanto as imagens não estiverem na pasta, as cenas mostram um fundo provisório colorido e o logo em texto.
Depois de colocar as imagens, as cenas no OBS atualizam sozinhas. Para gerar os PNGs/vídeos de novo: `node ferramentas/exportar.js`.

## 1. Coloque seu nome (uma vez só)
Abra `config.js` em qualquer editor de texto (Bloco de Notas serve) e troque:
- `nome`: o nome do seu canal
- `redes`: seus @ da Twitch, TikTok, Instagram e YouTube
- `contagemMinutos` / `intervaloMinutos`: tempo da contagem regressiva
- `horarios`, `meta`, `ticker` (as frases da faixa "PLANTÃO")

Salve. Todas as cenas animadas já usam o novo nome. Para gerar os PNGs de novo, rode `node ferramentas/exportar.js` (precisa do Node e do `npm i playwright`).

## 2. O que vem no pack

| Arquivo (`cenas/`) | Formato | Uso |
|---|---|---|
| `01-live-vai-comecar` | 1920×1080 + VERTICAL 1080×1920 | Tela de início com contagem regressiva |
| `02-volto-ja` | 16:9 + 9:16 | Tela de intervalo (BRB) com contagem |
| `03-live-encerrada` | 16:9 + 9:16 | Tela final com seus horários |
| `04-offline` | 1920×1080 | Tela offline da Twitch |
| `05-overlay-gameplay` | 1920×1080 transparente | Moldura da webcam, AO VIVO + relógio, meta, redes que se alternam |
| `06-overlay-tiktok` | 1080×1920 transparente | Webcam em cima, jogo no meio, faixa com seus @ |
| `07-webcam` | 720×520 transparente | Moldura de webcam avulsa |
| `08-alertas` | 1920×1080 transparente | Alertas em formato de "chamada recebida": seguidor, sub, doação, raid, bits, sub gift |
| `09-banner-twitch` | 1200×480 | Banner do perfil |
| `10-painel` | 320×160 | Painéis: sobre, regras, redes, apoie, setup, horários, comandos |
| `11-react` | 1920×1080 | Layout de React: vídeo 1300×731 (x=40, y=100) + câmera 460×259 (x=1420, y=100) |
| `12-conversa` | 1920×1080 | Só Conversa: câmera grande 1260×709 (x=60, y=100) + chat 440×470 (x=1420, y=470) |
| `13-meta-de-like` | 640×160 transparente | Meta de like (edite `metaLike` no config) |
| `14-transicao` | 16:9 + VERTICAL | Transição (stinger) com as artes oficiais + logo; vídeo pronto em `exports/transicao/*.webm` |

Os PNGs prontos ficam em `exports/`. Abra `galeria.html` para ver tudo de uma vez.

## 3. Como colocar no OBS / Streamlabs (versão animada)
1. **Fonte → Navegador (Browser Source)**
2. Marque **Arquivo local** e escolha o `.html` dentro de `cenas/`
3. Largura/Altura: 1920×1080 (ou 1080×1920 para os verticais / TikTok Live Studio)
4. Pronto: chuva, contagem, mensagens no celular, faixa de notícias e relógio já ficam animados.

Dicas:
- **Webcam do overlay gameplay:** fica no canto inferior **direito** de propósito, porque o radar do GTA IV fica no inferior esquerdo. Encaixe sua câmera no retângulo (544×306 na posição x=1316, y=704).
- **TikTok:** o topo (~250px) e a parte de baixo (~460px) ficam embaixo da interface do TikTok; o overlay já respeita essa área. Câmera: 576×324 em x=56, y=290. Jogo: 1080×608 em y=672.
- **Trocar nome direto pela URL** (sem mexer no config): desmarque "Arquivo local" e use `file:///C:/caminho/cenas/01-live-vai-comecar.html?nome=FULANO&min=10`.

## 3.1 Transição (stinger) no OBS
1. Cenas → Transições → **+ Stinger**
2. Arquivo: `exports/transicao/transicao-1920x1080.webm` (ou o vertical para o TikTok)
3. Ponto de transição: **560 ms**
O vídeo tem fundo transparente. Depois de colocar as artes oficiais, gere de novo com `node ferramentas/exportar.js` para a transição usar elas.

## 4. Alertas
- Testar: abra `cenas/08-alertas.html?demo` (passa por todos os tipos em sequência).
- Alerta fixo para gravar ou usar como imagem: `?tipo=sub&user=FULANO&valor=3&fixo=1`
- Tipos: `follow`, `sub`, `donate`, `raid`, `bits`, `gift`.
- No **StreamElements/Streamlabs**, use os PNGs de `exports/alertas/` como imagem do alerta, ou cole o HTML/CSS em um "Custom alert" e chame `showAlert('follow', '{name}')`.
- O pack não traz som de propósito (direitos autorais). Use um som livre de direitos, por exemplo um toque de celular.

## 5. Cores
Âmbar `#F2A541` · Ferrugem `#D4572A` · Creme `#EFE7D4` · Noite `#0B0D0D` · Aço `#8D978F`
Fontes: Anton, Oswald, Barlow Condensed, Special Elite (todas livres e já incluídas em `assets/fonts`).
