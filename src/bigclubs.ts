import { ST } from "./state";

/** Clubes de expressão: os que aparecem nos modos normais quando o jogo escolhe clubes. Os difíceis usam qualquer clube. */
export const BIG = new Set(
  ("real-madrid barcelona atletico sevilla valencia man-city man-utd liverpool chelsea arsenal tottenham newcastle " +
    "juventus inter ac-milan napoli roma lazio atalanta bayern dortmund leverkusen psg marseille lyon monaco " +
    "benfica porto sporting ajax psv feyenoord galatasaray fenerbahce besiktas celtic " +
    "flamengo palmeiras corinthians sao-paulo santos gremio internacional fluminense atletico-mg cruzeiro vasco botafogo boca river").split(" "),
);

/** `ci` é o índice do clube em ST.CLUBS. */
export const bigClub = (ci: number): boolean => !!(ST.CLUBS[ci] && BIG.has(ST.CLUBS[ci][1] as unknown as string));
