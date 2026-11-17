/* =========================================================
   STREAM PACK "POSTAIS DE LEONIDA" — GTA VI
   EDITE AQUI. Todas as cenas leem deste arquivo.
   (Também dá pra trocar pela URL: ?nome=FULANO&min=10)
   ========================================================= */
window.PACK_CONFIG = {
  nome: "SEU NOME",
  cidade: "VICE CITY, LEONIDA",
  temperatura: "31°C",

  redes: {
    twitch: "seunome",          // só o nome do canal (também liga o ChatBox)
    tiktok: "@seunome",
    instagram: "@seunome",
    youtube: "@seunome",
  },

  contagemMinutos: 5,           // "A live está iniciando"
  intervaloMinutos: 5,          // "Pausa"
  horarios: "SEG • QUA • SEX — 20H",

  meta: { texto: "META DE SEGUIDORES", atual: 320, total: 500 },
  metaLike: { atual: 2342, total: 3500 },

  // Qual postal / cenário / personagem aparece em cada tela.
  // Personagens: boobie, brian, cal, drequan, raul, realdimez
  // Postais: vicecity, keys, portgellhorn, grassrivers  •  Cenários: cena-1 … cena-6
  telas: {
    inicio:    { postal: "vicecity",     cena: "cena-3", personagem: "boobie" },
    pausa:     { postal: "keys",         cena: "cena-1", personagem: "brian" },
    fim:       { postal: "portgellhorn", cena: "cena-4", personagem: "raul" },
    offline:   { postal: "grassrivers",  cena: "cena-5", personagem: "drequan" },
  },

  // Telas 3D: personagem principal de cada uma (jasonlucia-1, jasonlucia-2, jasonlucia-3 ou outro personagem)
  telas3d: { inicio: "jasonlucia-1", pausa: "jasonlucia-3", fim: "jasonlucia-2", offline: "jasonlucia-1" },

  // Frases da faixa de notícias
  ticker: [
    "AO VIVO DIRETO DE LEONIDA",
    "TRÂNSITO PARADO NA PONTE: MOTORISTAS CULPAM UM CERTO STREAMER",
    "SEGUE NO TIKTOK PRA VER OS CORTES",
    "PREVISÃO: 100% DE CHANCE DE CAOS EM VICE CITY",
    "DEIXA O FOLLOW E ATIVA O SININHO",
    "JACARÉ VISTO NA PISCINA DO HOTEL. DE NOVO.",
  ],

  apoio: "PIX: seuemail@exemplo.com",
};
