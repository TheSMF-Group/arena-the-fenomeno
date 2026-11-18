// @ts-nocheck
/* Lobbys abertos. Salas públicas do 100pracada vêm do servidor deles (via /api/lobbys).
   Salas da Arena (Velha etc.) são anunciadas no mesmo broker MQTT das partidas, num tópico próprio, como mensagem retida
   que some sozinha se o anfitrião cair. Sem login, sem banco. */
import {GAMES} from "./engine";
import {esc} from "./core";

const BASE = "thefenomeno-jogos/lobby/v1/";
const FRESCO = 45000;                       // anúncio sem batimento há mais que isso não conta

/* import dinâmico: evita ciclo de módulos com home.ts e os jogos */
async function conectar(opts = {}) {
  const [{MQTT_LIB, VL_BROKERS}, {loadScript}] = await Promise.all([import("./mqtt"), import("./games/futgeo")]);
  await loadScript(MQTT_LIB);
  if (!window.mqtt) throw new Error("mqtt");
  for (const url of VL_BROKERS) {
    try {
      return await new Promise((ok, no) => {
        const c = window.mqtt.connect(url, {clientId: "fenl_" + Math.random().toString(36).slice(2, 10), clean: true, connectTimeout: 6000, reconnectPeriod: 3000, keepalive: 20, ...opts});
        const t = setTimeout(() => { c.end(true); no(); }, 7000);
        c.once("connect", () => { clearTimeout(t); ok(c); }); c.once("error", () => { clearTimeout(t); c.end(true); no(); });
      });
    } catch { /* tenta o próximo broker */ }
  }
  throw new Error("sem broker");
}

/* anfitrião: anuncia a sala até chamar stop() */
export async function anunciar(jogo, code, info) {
  const topic = `${BASE}${jogo}/${code}`;
  let c = null, hb = null, parado = false;
  const pub = () => c && c.publish(topic, JSON.stringify({...info, t: Date.now()}), {retain: true, qos: 1});
  try { c = await conectar({will: {topic, payload: "", retain: true, qos: 1}}); } catch { return {stop() {}}; }
  if (parado) { c.end(true); return {stop() {}}; }
  pub(); hb = setInterval(pub, 15000);
  return {
    update(p) { Object.assign(info, p); pub(); },
    stop() { parado = true; clearInterval(hb); if (c) { try { c.publish(topic, "", {retain: true, qos: 1}, () => c.end()); } catch { c.end(true); } } },
  };
}

/* quem procura: devolve {stop()} e chama cb(lista) a cada mudança */
export async function observar(cb) {
  const mapa = new Map();
  let c = null, tick = null;
  const emit = () => { const agora = Date.now(); for (const [k, v] of mapa) if (agora - v.t > FRESCO) mapa.delete(k); cb([...mapa.values()].sort((a, b) => b.t - a.t)); };
  try { c = await conectar(); } catch { cb([]); return {stop() {}}; }
  c.on("message", (t, buf) => {
    const [jogo, code] = t.slice(BASE.length).split("/");
    if (!jogo || !/^[A-Z0-9]{3,8}$/.test(code || "")) return;
    const txt = buf.toString();
    if (!txt) { mapa.delete(t); return emit(); }
    try { const o = JSON.parse(txt); if (o && typeof o === "object" && GAMES[jogo]) mapa.set(t, {jogo, code, host: String(o.host || "?").slice(0, 20), cfg: String(o.cfg || "").slice(0, 40), t: Number(o.t) || Date.now()}); } catch {}
    emit();
  });
  c.subscribe(BASE + "+/+", {qos: 1});
  tick = setInterval(emit, 10000);
  return {stop() { clearInterval(tick); c.end(true); }};
}

export async function pracada() {
  try { const r = await fetch("/api/lobbys"); const j = await r.json(); return Array.isArray(j.rooms) ? j.rooms : []; } catch { return []; }
}

/* seção da home; devolve a função que para as atualizações */
export function lobbysSecao(el, entrar) {
  let arena = [], prac = [], vivo = true, obs = null, timer = null;
  const card = (cls, nome, quem, detalhe, attrs) => `<button type="button" class="lb ${cls}" ${attrs}><span class="lb-g">${esc(nome)}</span><b>${esc(quem)}</b><small>${esc(detalhe)}</small><span class="lb-go">Entrar →</span></button>`;
  const draw = () => {
    if (!vivo || !el.isConnected) return;
    const itens = [
      ...prac.map(r => card("p", "100 PRA CADA", r.host, `${r.n}/${r.size || "?"} na sala · ${r.mode === "kl" ? "Kings League" : "Brasileirão"}`, `data-p="${esc(r.code)}"`)),
      ...arena.map(r => card("a", GAMES[r.jogo].name, r.host, r.cfg || "aguardando adversário", `data-j="${esc(r.jogo)}" data-c="${esc(r.code)}"`)),
    ];
    el.querySelector(".lb-list").innerHTML = itens.length ? itens.join("") : `<p class="lb-vazio">Nenhum lobby aberto agora. Crie o seu em qualquer jogo multiplayer e marque como <b>sala pública</b>.</p>`;
  };
  el.innerHTML = `<div class="lb-head"><h2 class="sec-t" id="h-lobbys">Lobbys abertos</h2></div><p class="sec-sub">Salas públicas esperando jogador. Entre e jogue na hora.</p><div class="lb-list" role="list"><p class="lb-vazio">Procurando salas…</p></div>`;
  el.addEventListener("click", e => {
    const b = e.target.closest(".lb"); if (!b) return;
    if (b.dataset.p) window.open(`https://100pracada.thefenomeno.com/?sala=${encodeURIComponent(b.dataset.p)}&utm_source=arena`, "_blank", "noopener");
    else entrar(b.dataset.j, b.dataset.c);
  });
  const buscar = async () => { prac = await pracada(); draw(); };
  buscar(); timer = setInterval(buscar, 8000);
  observar(l => { arena = l; draw(); }).then(o => { obs = o; if (!vivo) o.stop(); });
  return () => { vivo = false; clearInterval(timer); obs && obs.stop(); };
}
