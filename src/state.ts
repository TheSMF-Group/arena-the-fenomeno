import { todayKey } from "./core";
import type { Crest, Difficulty, Phase, Player } from "./types";

/** Variáveis globais mutáveis que vários módulos alteram (no site antigo eram `let` soltos). */
export const ST = {
  /** todos os jogadores, os famosos, os de nicho */
  P: [] as Player[],
  FAM: [] as Player[],
  HARD: [] as Player[],
  NATS: [] as string[],
  CLUBS: [] as string[],
  CRESTS: [] as Crest[],
  FOTOS: {} as Record<string, string>,
  ESC: {} as Record<string, string>,
  CLEAN: null as boolean | null,
  DIFF: "normal" as Difficulty,
  CURGAME: null as string | null,
  PLAYDAY: todayKey() as number,
  CLOCK: null as any,
  DR_CUR: false,
  VIEW: "home" as string,
  PHASE: "home" as Phase,
};
