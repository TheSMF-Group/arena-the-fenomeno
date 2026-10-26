/** Tipos centrais do site. Os módulos antigos ainda usam `// @ts-nocheck`; a ideia é ir removendo módulo a módulo. */

export interface Player {
  id: number;
  name: string;
  nat: number;
  birth: number;
  club: number;
  season: number;
  /** 1 = famoso (nível normal), 2 = nicho (nível difícil) */
  fam: 0 | 1 | 2;
  key: string;
  words: string[];
}

export interface Crest {
  id: number;
  name: string;
  pais: number;
  cc: string;
  liga: number;
  conf: number;
  key: string;
  words: string[];
}

export type Difficulty = "normal" | "hard";

/** Registro de um mini game em `GAMES`. */
export interface GameDef {
  name?: string;
  desc?: string;
  hard: string;
  multi?: boolean;
  open?: () => void;
  [extra: string]: unknown;
}

/** Fases possíveis da navegação. */
export type Phase = "home" | "choose" | "play" | "end" | string;

/** Estado de uma sala multiplayer (Draft, Leilão, Maleta, Reconstruindo). O de maior `seq` vence. */
export interface RoomState {
  seq: number;
  kind: "draft" | "leilao" | "maleta" | "reconstruindo";
  [extra: string]: unknown;
}

/** Transporte de sala: `claude.use("room")` dentro do claude.ai ou MQTT fora dele. */
export interface RoomTransport {
  presence(patch: unknown): void;
  onPeers(fn: (peers: unknown[]) => void): void;
  leave?(): void;
}
