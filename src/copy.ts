// @ts-nocheck
import {META} from "./meta";
/* copy dos cards vem de meta.ts: um lugar só pra escrever e pro SEO bater com o que o jogador lê */
export function applyCopy(GAMES){for(const id in META){if(GAMES[id]){GAMES[id].desc=META[id].desc}}}
