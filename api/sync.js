// POST /api/sync  {perfil, hist, rew}  -> devolve os dados fundidos da conta
import {redis, send, body, userOf, merge, limit} from "./_lib.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return send(res, 405, {error: "método"});
    const uid = await userOf(req);
    if (!uid) return send(res, 401, {error: "Entre na sua conta."});
    if (!(await limit(req, "sync", 120, 600))) return send(res, 429, {error: "Calma."});
    const data = merge(await redis.get("data:" + uid) || {}, await body(req));
    await redis.set("data:" + uid, data);
    return send(res, 200, {data});
  } catch (e) {
    return send(res, 500, {error: "Erro no servidor."});
  }
}
