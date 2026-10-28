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

let RANK: Map<string, number> | null = null;
/** Posição do clube (pelo escudo) do mais ao menos expressivo: primeiro os 50 grandes, depois pelos famosos que passaram pelo clube. */
export function slugRank(slug: string | null | undefined): number {
  if (!slug) return 99999;
  if (!RANK) {
    const score = new Map<string, number>();
    for (const p of ST.P) if (p.fam === 1 && p.club != null && ST.CLUBS[p.club]) {
      const s = ST.CLUBS[p.club][1] as unknown as string;
      if (s) score.set(s, (score.get(s) || 0) + 1);
    }
    const all = [...new Set(ST.CLUBS.map((c) => c[1] as unknown as string).filter(Boolean))];
    all.sort((a, b) => Number(BIG.has(b)) - Number(BIG.has(a)) || (score.get(b) || 0) - (score.get(a) || 0));
    RANK = new Map(all.map((s, i) => [s, i]));
  }
  return RANK.get(slug) ?? 99999;
}
