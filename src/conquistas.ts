// @ts-nocheck
/* Conquistas: calculadas a partir do histórico de partidas, das camisas e do perfil. Ficam salvas no aparelho e, com conta, na nuvem. */
import {store, toast} from "./core";
import {ownedGet, histGet} from "./profile";

const MULTI = ["draft", "leilao", "maleta", "reconstruindo", "velha", "top100"];
const wins = h => h.filter(x => x.w).length;
const jogos = h => new Set(h.map(x => x.g)).size;
const seq = h => { let b = 0, c = 0; for (const x of h.slice().sort((a, z) => a.t - z.t)) { c = x.w ? c + 1 : 0; if (c > b) b = c; } return b; };
const multi = h => h.filter(x => MULTI.includes(x.g)).length;
const noites = h => new Set(h.map(x => new Date(x.t).toDateString())).size;

/* id, ícone, nome, descrição, valor atual, meta */
export const CONQ = [
  {id: "w1", i: "🏆", n: "Primeira vitória", d: "Ganhe uma partida.", v: h => wins(h), m: 1},
  {id: "w10", i: "🥉", n: "Dez vitórias", d: "Ganhe 10 partidas.", v: h => wins(h), m: 10},
  {id: "w50", i: "🥈", n: "Cinquenta vitórias", d: "Ganhe 50 partidas.", v: h => wins(h), m: 50},
  {id: "w100", i: "🥇", n: "Cem vitórias", d: "Ganhe 100 partidas.", v: h => wins(h), m: 100},
  {id: "s3", i: "🔥", n: "Pegando fogo", d: "3 vitórias seguidas.", v: h => seq(h), m: 3},
  {id: "s7", i: "☄️", n: "Imparável", d: "7 vitórias seguidas.", v: h => seq(h), m: 7},
  {id: "g5", i: "🧭", n: "Curioso", d: "Jogue 5 jogos diferentes.", v: h => jogos(h), m: 5},
  {id: "g12", i: "🎮", n: "Versátil", d: "Jogue 12 jogos diferentes.", v: h => jogos(h), m: 12},
  {id: "g22", i: "👑", n: "Arena completa", d: "Jogue todos os 22 jogos.", v: h => jogos(h), m: 22},
  {id: "p25", i: "⚽", n: "Pé quente", d: "Termine 25 partidas.", v: h => h.length, m: 25},
  {id: "p100", i: "🏟️", n: "Torcedor fiel", d: "Termine 100 partidas.", v: h => h.length, m: 100},
  {id: "d7", i: "📅", n: "Sempre presente", d: "Jogue em 7 dias diferentes.", v: h => noites(h), m: 7},
  {id: "m1", i: "🤝", n: "Com os amigos", d: "Jogue uma partida multiplayer.", v: h => multi(h), m: 1},
  {id: "m10", i: "🎉", n: "Rei da resenha", d: "Jogue 10 partidas multiplayer.", v: h => multi(h), m: 10},
  {id: "c5", i: "👕", n: "Vestiário aberto", d: "Tenha 5 camisas.", v: () => ownedGet().length, m: 5},
  {id: "c15", i: "🧥", n: "Colecionador", d: "Tenha 15 camisas.", v: () => ownedGet().length, m: 15},
];

export const achGet = () => store.get("ach") || {};
export function progresso(c) { return Math.min(c.v(histGet()), c.m); }

/* confere tudo, guarda as novas e avisa */
export function conferir(silencioso = false) {
  const h = histGet(), ach = achGet(), novas = [];
  for (const c of CONQ) if (!ach[c.id] && c.v(h) >= c.m) { ach[c.id] = Date.now(); novas.push(c); }
  if (!novas.length) return;
  store.set("ach", ach);
  if (!silencioso) novas.slice(0, 3).forEach((c, k) => setTimeout(() => toast(`${c.i} Conquista: ${c.n}`), k * 1800));
  document.dispatchEvent(new CustomEvent("fen:ach"));
}
document.addEventListener("fen:hist", () => conferir());
document.addEventListener("fen:user", () => conferir(true));

/* bloco do Vestiário */
export function conquistasHTML() {
  const ach = achGet(), n = CONQ.filter(c => ach[c.id]).length;
  return `<div class="ach-head"><h3 class="d">CONQUISTAS</h3><span>${n}/${CONQ.length}</span></div><ul class="ach-grid">${CONQ.map(c => {
    const ok = !!ach[c.id], p = progresso(c);
    return `<li class="ach ${ok ? "on" : ""}" title="${c.d}"><span class="ach-i" aria-hidden="true">${c.i}</span><div><b>${c.n}</b><small>${c.d}</small>${ok ? "" : `<div class="ach-bar"><i style="width:${p / c.m * 100}%"></i></div><em>${p}/${c.m}</em>`}</div></li>`;
  }).join("")}</ul>`;
}
