/* Fonte única de copy e SEO por jogo. Usada pelo build (páginas /jogos/<slug>) e pelo navegador (cards, título, resultado). */

export const SITE = "https://jogue.thefenomeno.com";
export const SITE_NAME = "Central The Fenômeno de Mini Games";

export interface GameMeta {
  slug: string;
  name: string;
  /** frase do card: promessa + mecânica, uma linha */
  desc: string;
  /** <title> da página do jogo, até ~60 caracteres */
  title: string;
  /** meta description, até ~155 caracteres */
  seo: string;
  /** como se joga, texto estático que o buscador lê antes do JS */
  how: string;
  /** duração típica de uma partida, para o card */
  mins: string;
}

export const CATS: Record<string,string> = {"camisa": "adivinhe", "carreira": "adivinhe", "questoes": "adivinhe", "entrosa": "adivinhe", "quem": "adivinhe", "escudo": "adivinhe", "piramide": "ranking", "top10": "ranking", "top100": "ranking", "forca": "palavras", "bodle": "palavras", "grade": "logica", "conexoes": "logica", "impostor": "logica", "bingo": "logica", "velho": "logica", "futgeo": "mapa"};
export const CAT_LABELS: [string,string][] = [["todos","Todos"],["adivinhe","Adivinhe o craque"],["ranking","Rankings"],["logica","Lógica"],["palavras","Palavras"],["mapa","Mapa"],["rapidos","Rápidos"]];

export const META: Record<string, GameMeta> = {
  camisa: {
    slug: "camisa-e-conta", name: "CAMISA E CONTA", mins: "2 min",
    desc: "Descubra de quem é a camisa ou feche a conta com os números dos craques.",
    title: "Camisa e Conta: de quem é essa camisa? | Jogue grátis",
    seo: "Adivinhe o craque pela camisa ou resolva a conta com os números dos jogadores. Desafio de futebol novo todo dia, grátis, direto no navegador.",
    how: "Veja a camisa do clube e descubra o dono, ou resolva a conta somando os números das camisas dos craques."
  },
  carreira: {
    slug: "carreira", name: "CARREIRA", mins: "3 min",
    desc: "Os clubes aparecem um por um. Descubra o craque com o mínimo de pistas.",
    title: "Carreira: adivinhe o jogador pelos clubes | Jogue grátis",
    seo: "Os clubes da carreira aparecem um por um e você descobre o jogador com o mínimo de pistas. Desafio diário de futebol, grátis e sem cadastro.",
    how: "Cada pista revela um clube da carreira do jogador. Quanto menos clubes você precisar ver, mais pontos faz."
  },
  questoes: {
    slug: "questionamentos", name: "QUESTIONAMENTOS", mins: "3 min",
    desc: "Pergunte sim ou não e crave o craque secreto em 3 chutes.",
    title: "Questionamentos: 20 perguntas de futebol | Jogue grátis",
    seo: "Faça perguntas de sim ou não e descubra o craque secreto em 3 chutes. Jogo diário de futebol, grátis e direto no navegador.",
    how: "Escolha perguntas de sim ou não sobre o jogador secreto e use só 3 chutes para cravar quem é."
  },
  forca: {
    slug: "forca", name: "FORCA", mins: "2 min",
    desc: "Craque ou time, letra por letra. Erre demais e o bode vai parar na forca.",
    title: "Forca do Futebol: craques e times | Jogue grátis",
    seo: "Jogo da forca de futebol com craques e clubes. Chute as letras antes que o bode fique inteiro na forca. Grátis, novo desafio todo dia.",
    how: "Chute uma letra por vez para descobrir o nome do jogador ou do time antes de errar demais."
  },
  entrosa: {
    slug: "entrosamento", name: "ENTROSAMENTO", mins: "2 min",
    desc: "Ele jogou com esses cinco. Quem é? Quem acompanha futebol resolve rápido.",
    title: "Entrosamento: quem jogou com esses cinco? | Jogue grátis",
    seo: "Cinco companheiros de time, um craque em comum. Descubra quem é neste jogo de futebol diário, grátis e sem cadastro.",
    how: "Veja cinco jogadores que atuaram com o craque misterioso e descubra quem ele é."
  },
  piramide: {
    slug: "piramide", name: "PIRÂMIDE", mins: "3 min",
    desc: "Monte o ranking do 1º ao 10º. Um jogador fora do lugar e a pirâmide cai.",
    title: "Pirâmide: monte o ranking do futebol | Jogue grátis",
    seo: "Ordene dez jogadores do 1º ao 10º num ranking de futebol. Desafio diário grátis para quem conhece a história do esporte.",
    how: "Coloque cada jogador na posição certa, do primeiro no topo ao décimo na base."
  },
  top10: {
    slug: "top-10", name: "TOP 10", mins: "3 min",
    desc: "Rankings de verdade: artilheiros, valor de mercado, carreiras. Quantos você completa?",
    title: "Top 10 do Futebol: complete o ranking | Jogue grátis",
    seo: "Complete rankings de verdade do futebol: artilheiros, valor de mercado e carreiras. Desafio diário grátis, direto no navegador.",
    how: "Chute os nomes que fazem parte do ranking e complete as dez posições."
  },
  top100: {
    slug: "top-100", name: "TOP 100", mins: "5 min",
    desc: "100 jogadores num ranking. Quanto mais fundo o chute, mais pontos. Sozinho ou em duelo.",
    title: "Top 100: chute o ranking mais fundo | Jogue grátis",
    seo: "Rankings de 100 jogadores de futebol: quanto mais fundo na lista o seu chute, mais pontos. Desafio do dia ou duelo com amigo, grátis.",
    how: "Chute o nome de um jogador do ranking. Quanto mais abaixo ele estiver na lista, mais pontos você ganha."
  },
  futgeo: {
    slug: "futgeo", name: "FUTGEO", mins: "4 min",
    desc: "Onde foi? Crave no mapa o lugar do jogo, do gol, da história.",
    title: "FutGeo: o GeoGuessr do futebol | Jogue grátis",
    seo: "Crave no mapa onde aconteceu o jogo, o gol ou a história. O GeoGuessr do futebol, grátis e com desafio novo todo dia.",
    how: "Leia a pergunta de futebol e clique no mapa no lugar onde aconteceu. Quanto mais perto, mais pontos."
  },
  quem: {
    slug: "quem-e", name: "QUEM É?", mins: "2 min",
    desc: "A foto vai clareando. Descubra o craque em 6 chutes antes que ele apareça inteiro.",
    title: "Quem é? Adivinhe o craque pela foto | Jogue grátis",
    seo: "A foto do jogador vai clareando a cada erro. Descubra quem é em 6 chutes neste jogo de futebol diário, grátis e sem cadastro.",
    how: "Veja a foto escondida do jogador e chute o nome. A cada erro a imagem fica mais clara."
  },
  grade: {
    slug: "grade", name: "GRADE", mins: "4 min",
    desc: "3×3: seleção na linha, último clube na coluna. Preencha sem repetir.",
    title: "Grade de Futebol 3x3: seleção e clube | Jogue grátis",
    seo: "Preencha a grade 3x3 com jogadores que combinam seleção na linha e último clube na coluna. Desafio diário de futebol, grátis.",
    how: "Em cada quadrado, escolha um jogador que atenda à seleção da linha e ao clube da coluna, sem repetir."
  },
  conexoes: {
    slug: "conexoes", name: "CONEXÕES", mins: "3 min",
    desc: "16 craques, 4 grupos escondidos. Ache as ligações antes de gastar os erros.",
    title: "Conexões do Futebol: ache os 4 grupos | Jogue grátis",
    seo: "16 jogadores formam 4 grupos escondidos. Descubra as ligações antes de gastar seus erros neste jogo diário de futebol, grátis.",
    how: "Agrupe os 16 jogadores em 4 grupos com algo em comum, sem estourar o limite de erros."
  },
  bodle: {
    slug: "bodle", name: "BODLE", mins: "2 min",
    desc: "O Wordle do bode: o sobrenome de um craque, seis tentativas.",
    title: "Bodle: o Wordle do futebol | Jogue grátis",
    seo: "O Wordle do futebol: descubra o sobrenome de um craque em seis tentativas. Palavra nova todo dia, grátis e sem cadastro.",
    how: "Chute o sobrenome do craque em até seis tentativas e use as cores para fechar a palavra."
  },
  impostor: {
    slug: "impostor", name: "IMPOSTOR", mins: "2 min",
    desc: "Quatro têm algo em comum. Um é intruso. Ache quem não pertence.",
    title: "Impostor: ache o intruso do futebol | Jogue grátis",
    seo: "Quatro jogadores têm algo em comum e um é o impostor. Descubra o intruso neste jogo de futebol diário, grátis e rápido.",
    how: "Veja cinco jogadores, descubra o que quatro deles têm em comum e aponte o intruso."
  },
  escudo: {
    slug: "escudo", name: "ESCUDO", mins: "2 min",
    desc: "Só um pedaço do escudo. De qual clube é?",
    title: "Escudo: adivinhe o clube pelo pedaço | Jogue grátis",
    seo: "Veja só um pedaço do escudo e adivinhe de qual clube é. Mais de 800 escudos, desafio diário de futebol grátis.",
    how: "Um recorte do escudo aparece ampliado. Chute o clube, e cada erro libera mais pistas."
  },
  bingo: {
    slug: "bingo", name: "BINGO", mins: "4 min",
    desc: "Encaixe cada craque na casa certa da cartela. Linha, coluna, bingo.",
    title: "Bingo do Futebol: encaixe os craques | Jogue grátis",
    seo: "Encaixe cada craque na casa certa da cartela e feche linhas e colunas neste bingo de futebol diário, grátis e sem cadastro.",
    how: "Cada carta sorteada tem de ir para a casa da cartela que combina com o jogador."
  },
  velho: {
    slug: "mais-velho", name: "MAIS VELHO?", mins: "1 min",
    desc: "Quem nasceu primeiro? Emende acertos e faça a maior sequência.",
    title: "Mais Velho? Quem nasceu primeiro | Jogue grátis",
    seo: "Dois craques, uma pergunta: quem nasceu primeiro? Faça a maior sequência de acertos neste jogo de futebol rápido e grátis.",
    how: "Compare dois jogadores e aponte quem nasceu primeiro. Cada acerto aumenta a sequência."
  },
  draft: {
    slug: "draft", name: "DRAFT", mins: "8 min",
    desc: "Monte um 4-3-3 no sorteio e vença seu amigo numa partida simulada.",
    title: "Draft de Futebol multiplayer: monte o seu 4-3-3 | Jogue grátis",
    seo: "Monte um 4-3-3 com o sorteio da vez e vença o amigo numa partida simulada. Draft multiplayer de futebol, grátis e sem cadastro.",
    how: "Crie a sala, mande o código e escolha um craque por posição a cada sorteio. O melhor time vence a partida simulada."
  },
  leilao: {
    slug: "leilao", name: "LEILÃO", mins: "8 min",
    desc: "Orçamento na mão, craque na mesa. Os dois querem? Vai a leilão.",
    title: "Leilão de Craques multiplayer | Jogue grátis",
    seo: "Cada jogador tem um orçamento e o craque aparece na mesa. Se os dois querem, vai a leilão. Multiplayer de futebol, grátis.",
    how: "Crie a sala e dispute craques com o orçamento que tem. Quem fechar o melhor elenco vence."
  },
  maleta: {
    slug: "maleta", name: "MALETA", mins: "6 min",
    desc: "Cinco maletas, um craque em cada. Escolha, arrisque e troque.",
    title: "Maleta de Craques multiplayer | Jogue grátis",
    seo: "Cinco maletas por posição, cada uma com um craque escondido. Escolha, arrisque e troque no multiplayer de futebol grátis.",
    how: "Abra a maleta que quiser por posição e decida se fica com o craque ou troca no escuro."
  },
  reconstruindo: {
    slug: "reconstruindo", name: "RECONSTRUINDO", mins: "10 min",
    desc: "Reforme seu time de 11: mantenha ou venda e compre um craque melhor.",
    title: "Reconstruindo: gerencie um clube multiplayer | Jogue grátis",
    seo: "Cada um gerencia um clube de 11 titulares. Posição a posição, mantenha ou venda e compre um craque melhor. Multiplayer grátis.",
    how: "Em cada posição, decida entre manter o titular ou vender e comprar um craque melhor. Se os dois quiserem o mesmo, é leilão."
  },
  velha: {
    slug: "jogo-da-velha", name: "JOGO DA VELHA", mins: "3 min",
    desc: "Jogo da Velha com craques. Crie a sala, mande o código e vença o amigo.",
    title: "Jogo da Velha de Futebol multiplayer | Jogue grátis",
    seo: "Jogo da Velha de futebol contra um amigo: crie a partida, mande o código e vença. Multiplayer grátis e sem cadastro.",
    how: "Crie a partida, compartilhe o código e marque as casas respondendo certo sobre craques."
  }
};

export const ID_BY_SLUG: Record<string, string> = Object.fromEntries(Object.entries(META).map(([id, m]) => [m.slug, id]));
export const slugOf = (id: string) => META[id]?.slug;
export const pathOf = (id: string) => (META[id] ? `/jogos/${META[id].slug}` : "/");

export const HOME_TITLE = "Jogos de Futebol Grátis: Quiz, Draft e Desafio do Dia | The Fenômeno";
export const HOME_DESC = "22 jogos de futebol grátis no navegador: desafio novo todo dia, modo infinito e multiplayer com amigo. Sem cadastro. Você é o Fenômeno?";

/* frases de resultado: comédia BR curta, sem tirar sarro de quem perdeu */
export const WIN_LINES = ["FENÔMENO!", "O BODE APROVA", "NÍVEL DE SELEÇÃO", "GABARITOU"];
export const LOSS_LINES = ["NÃO FOI DESSA VEZ", "O BODE VIU E NÃO FALOU NADA", "ERRAR FAZ PARTE DO JOGO", "A REVANCHE É JÁ"];
export const pickLine = (won: boolean, seed = Date.now()) => {
  const a = won ? WIN_LINES : LOSS_LINES;
  return a[Math.abs(seed | 0) % a.length];
};
