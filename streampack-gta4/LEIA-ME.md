# Stream Pack "CIDADE SEM LEI" — GTA IV

Stream pack animado para lives de GTA IV na **Twitch (16:9)** e no **TikTok (9:16)**.
Visual: cidade grande à noite, céu cor de âmbar com poluição, chuva, granulado de filme, letreiros no estilo de quadrinho e um celular antigo que manda mensagens no ar.
Toda a arte é original e gerada em código (sem logos nem personagens do jogo), então você pode usar à vontade.

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

## 4. Alertas
- Testar: abra `cenas/08-alertas.html?demo` (passa por todos os tipos em sequência).
- Alerta fixo para gravar ou usar como imagem: `?tipo=sub&user=FULANO&valor=3&fixo=1`
- Tipos: `follow`, `sub`, `donate`, `raid`, `bits`, `gift`.
- No **StreamElements/Streamlabs**, use os PNGs de `exports/alertas/` como imagem do alerta, ou cole o HTML/CSS em um "Custom alert" e chame `showAlert('follow', '{name}')`.
- O pack não traz som de propósito (direitos autorais). Use um som livre de direitos, por exemplo um toque de celular.

## 5. Cores
Âmbar `#F2A541` · Ferrugem `#D4572A` · Creme `#EFE7D4` · Noite `#0B0D0D` · Aço `#8D978F`
Fontes: Anton, Oswald, Barlow Condensed, Special Elite (todas livres e já incluídas em `assets/fonts`).
