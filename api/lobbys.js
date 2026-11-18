// GET /api/lobbys  -> salas públicas abertas do 100pracada (o navegador não pode chamar o outro site direto por causa do CORS)
import {send} from "./_lib.js";

export default async function handler(req, res) {
  try {
    const r = await fetch("https://100pracada.thefenomeno.com/api/rooms?mode=all", {signal: AbortSignal.timeout(4000)});
    const j = await r.json();
    const rooms = (Array.isArray(j.rooms) ? j.rooms : []).filter(x => x && /^[A-Z0-9]{3,8}$/.test(x.code) && x.phase === "lobby").slice(0, 30)
      .map(x => ({code: x.code, host: String(x.host || "?").slice(0, 20), n: x.n | 0, size: x.size | 0, mode: x.mode === "kl" ? "kl" : "br"}));
    return send(res, 200, {rooms}, {"Cache-Control": "public, s-maxage=5"});
  } catch { return send(res, 200, {rooms: []}); }
}
