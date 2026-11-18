// Utilidades compartilhadas das funções da conta. Arquivos com "_" não viram rota na Vercel.
import {Redis} from "@upstash/redis";
import {randomBytes, scryptSync, timingSafeEqual} from "node:crypto";

export const redis = Redis.fromEnv();           // lê UPSTASH_REDIS_REST_URL/TOKEN ou KV_REST_API_URL/TOKEN
const COOKIE = "fen_s", TTL = 60 * 60 * 24 * 30; // sessão de 30 dias

export const send = (res, code, body, headers = {}) => {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(body));
};

export async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let n = 0;
  for await (const c of req) { n += c.length; if (n > 200_000) throw new Error("grande"); chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { return {}; }
}

export const handleOk = h => typeof h === "string" && /^[a-z0-9_.-]{3,20}$/.test(h);
export const norm = h => String(h || "").trim().toLowerCase();

export function hashPw(pw) {
  const salt = randomBytes(16);
  return salt.toString("hex") + ":" + scryptSync(pw, salt, 64).toString("hex");
}
export function checkPw(pw, stored) {
  const [s, h] = String(stored || "").split(":");
  if (!s || !h) return false;
  const a = scryptSync(pw, Buffer.from(s, "hex"), 64), b = Buffer.from(h, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function startSession(res, uid) {
  const tok = randomBytes(32).toString("hex");
  await redis.set("sess:" + tok, uid, {ex: TTL});
  res.setHeader("Set-Cookie", `${COOKIE}=${tok}; Path=/; Max-Age=${TTL}; HttpOnly; Secure; SameSite=Lax`);
}
export const tokenOf = req => (req.headers.cookie || "").split(/;\s*/).map(c => c.split("=")).find(([k]) => k === COOKIE)?.[1] || null;
export async function userOf(req) {
  const t = tokenOf(req);
  return t ? await redis.get("sess:" + t) : null;
}
export async function endSession(req, res) {
  const t = tokenOf(req);
  if (t) await redis.del("sess:" + t);
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

/* limite simples por IP: n tentativas por janela */
export async function limit(req, key, n, secs) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?";
  const k = `rl:${key}:${ip}`, c = await redis.incr(k);
  if (c === 1) await redis.expire(k, secs);
  return c <= n;
}

/* ---- fusão dos dados do jogador (nunca perde nada: une, não sobrescreve) ---- */
const cleanPerfil = p => {
  p = p && typeof p === "object" ? p : {};
  const o = {};
  if (typeof p.n === "string") o.n = p.n.slice(0, 12);
  for (const k of ["k", "bg", "c", "a"]) if (typeof p[k] === "string") o[k] = p[k].slice(0, 60);
  if (Array.isArray(p.o)) o.o = [...new Set(p.o.filter(x => typeof x === "string").map(x => x.slice(0, 60)))].slice(0, 400);
  return o;
};
const cleanHist = h => (Array.isArray(h) ? h : []).filter(x => x && typeof x.g === "string" && Number.isFinite(x.t))
  .map(x => ({t: x.t, g: x.g.slice(0, 30), w: x.w ? 1 : 0, m: typeof x.m === "string" ? x.m.slice(0, 12) : null,
    s: Number.isFinite(x.s) ? x.s : null, l: typeof x.l === "string" ? x.l.slice(0, 80) : ""}));
export function merge(a = {}, b = {}) {
  const pa = cleanPerfil(a.perfil), pb = cleanPerfil(b.perfil);
  const perfil = {...pa, ...pb, o: [...new Set([...(pa.o || []), ...(pb.o || [])])]};
  const seen = new Set(), hist = [];
  for (const x of [...cleanHist(a.hist), ...cleanHist(b.hist)].sort((x, y) => x.t - y.t)) {
    const id = x.t + ":" + x.g; if (!seen.has(id)) { seen.add(id); hist.push(x); }
  }
  const ra = a.rew || {}, rb = b.rew || {};
  const rew = (rb.d || 0) >= (ra.d || 0) ? rb : ra;
  const ach = {};
  for (const src of [a.ach, b.ach]) if (src && typeof src === "object") for (const [k, v] of Object.entries(src)) if (/^[a-z0-9]{1,12}$/.test(k) && Number.isFinite(v) && (!ach[k] || v < ach[k])) ach[k] = v;
  return {perfil, ach, hist: hist.slice(-400), rew: rew && rew.d ? {d: rew.d, br: rew.br ? 1 : 0, eu: rew.eu ? 1 : 0} : {}};
}
