// POST /api/auth?a=register|login|logout   GET /api/auth?a=me
import {redis, send, body, norm, handleOk, hashPw, checkPw, startSession, endSession, userOf, limit, merge} from "./_lib.js";

const view = (uid, u, data) => ({user: {id: uid, handle: u.handle}, data});

export default async function handler(req, res) {
  try {
    const a = new URL(req.url, "http://x").searchParams.get("a");
    if (a === "me") {
      const uid = await userOf(req);
      if (!uid) return send(res, 200, {user: null});
      const [u, data] = await Promise.all([redis.get("user:" + uid), redis.get("data:" + uid)]);
      return u ? send(res, 200, view(uid, u, data || {})) : send(res, 200, {user: null});
    }
    if (req.method !== "POST") return send(res, 405, {error: "método"});
    if (a === "logout") { await endSession(req, res); return send(res, 200, {ok: true}); }
    const b = await body(req), h = norm(b.handle), pw = String(b.password || "");

    if (a === "register") {
      if (!(await limit(req, "reg", 10, 3600))) return send(res, 429, {error: "Muitas tentativas. Tente mais tarde."});
      if (!handleOk(h)) return send(res, 400, {error: "Usuário: 3 a 20 letras minúsculas, números, ponto, hífen ou _."});
      if (pw.length < 8 || pw.length > 100) return send(res, 400, {error: "A senha precisa de 8 caracteres ou mais."});
      const uid = "u_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      const ok = await redis.set("handle:" + h, uid, {nx: true});
      if (!ok) return send(res, 409, {error: "Esse usuário já existe."});
      const u = {handle: h, pw: hashPw(pw), created: Date.now()};
      const data = merge({}, b.local || {});
      await Promise.all([redis.set("user:" + uid, u), redis.set("data:" + uid, data)]);
      await startSession(res, uid);
      return send(res, 200, view(uid, u, data));
    }
    if (a === "login") {
      if (!(await limit(req, "login", 15, 600))) return send(res, 429, {error: "Muitas tentativas. Espere uns minutos."});
      const uid = await redis.get("handle:" + h), u = uid && await redis.get("user:" + uid);
      if (!u || !checkPw(pw, u.pw)) return send(res, 401, {error: "Usuário ou senha incorretos."});
      const data = merge(await redis.get("data:" + uid) || {}, b.local || {});
      await redis.set("data:" + uid, data);
      await startSession(res, uid);
      return send(res, 200, view(uid, u, data));
    }
    return send(res, 400, {error: "ação"});
  } catch (e) {
    return send(res, 500, {error: "Erro no servidor."});
  }
}
