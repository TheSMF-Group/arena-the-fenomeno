// @ts-nocheck
/* Conta unificada: entra com usuário e senha, e o perfil, as camisas e o histórico passam a viver no servidor (Upstash).
   Sem conta, tudo continua no aparelho como antes. Com conta, o progresso acompanha a pessoa em qualquer aparelho. */
import {esc, store, toast} from "./core";

let ME = null;                       // {id, handle} ou null
export const contaGet = () => ME;
const local = () => ({perfil: store.get("perfil") || {}, hist: store.get("hist") || [], rew: store.get("rew") || {}, ach: store.get("ach") || {}});

async function api(path, body) {
  try {
    const r = await fetch(path, {method: body ? "POST" : "GET", credentials: "same-origin",
      headers: body ? {"Content-Type": "application/json"} : undefined, body: body ? JSON.stringify(body) : undefined});
    const j = await r.json().catch(() => ({}));
    return {ok: r.ok, ...j};
  } catch (e) { return {ok: false, error: "Sem conexão com o servidor."}; }
}

/* grava no aparelho o que veio do servidor (já fundido com o que o aparelho mandou) */
function aplicar(data) {
  if (!data) return;
  if (data.perfil && data.perfil.n) store.set("perfil", {...(store.get("perfil") || {}), ...data.perfil});
  if (Array.isArray(data.hist)) store.set("hist", data.hist.slice(-120));
  if (data.rew && data.rew.d) store.set("rew", data.rew);
  if (data.ach) store.set("ach", {...(store.get("ach") || {}), ...data.ach});
  document.dispatchEvent(new CustomEvent("fen:user"));
}

let t = null;
export function syncSoon() {
  if (!ME) return;
  clearTimeout(t);
  t = setTimeout(async () => { const r = await api("/api/sync", local()); if (r.ok) aplicar(r.data); }, 2000);
}

export async function contaBoot() {
  const r = await api("/api/auth?a=me");
  if (r.ok && r.user) { ME = r.user; const s = await api("/api/sync", local()); if (s.ok) aplicar(s.data); }
  document.dispatchEvent(new CustomEvent("fen:conta"));
}
document.addEventListener("fen:hist", syncSoon);
document.addEventListener("fen:ach", syncSoon);
document.addEventListener("fen:user", () => { clearTimeout(t); if (ME) t = setTimeout(syncSoon, 0); });

export async function contaSair() {
  await api("/api/auth?a=logout", {});
  ME = null;
  document.dispatchEvent(new CustomEvent("fen:conta"));
  toast("Você saiu da conta. O progresso continua salvo neste aparelho.");
}

/* janela de entrar / criar conta */
export function contaModal(modo = "criar", done) {
  document.querySelectorAll(".modal.conta").forEach(m => m.remove());
  const m = document.createElement("div"); m.className = "modal conta";
  const draw = () => {
    const novo = modo === "criar";
    m.innerHTML = `<div class="box conta-box"><h3>${novo ? "Salvar meu progresso" : "Entrar na minha conta"}</h3>
      <p class="muted" style="margin:0 0 12px">${novo ? "Crie uma conta e leve seu perfil, camisas e histórico para qualquer aparelho." : "Seu progresso deste aparelho será somado ao da conta."}</p>
      <form class="conta-f" autocomplete="on">
        <label>Usuário<input name="handle" autocomplete="username" maxlength="20" autocapitalize="none" spellcheck="false" required placeholder="ex.: craque10"></label>
        <label>Senha<input name="password" type="password" autocomplete="${novo ? "new-password" : "current-password"}" minlength="8" maxlength="100" required placeholder="8 caracteres ou mais"></label>
        <p class="conta-err" role="alert" hidden></p>
        <div class="row"><button class="btn y" type="submit">${novo ? "Criar conta" : "Entrar"}</button><button class="btn" type="button" data-x>Agora não</button></div>
      </form>
      <p class="muted conta-sw">${novo ? "Já tem conta? <button type=\"button\" class=\"lnk\" data-sw>Entrar</button>" : "Ainda não tem? <button type=\"button\" class=\"lnk\" data-sw>Criar conta</button>"}</p></div>`;
    m.querySelector("input").focus();
  };
  draw();
  m.addEventListener("click", e => {
    if (e.target === m || e.target.closest("[data-x]")) m.remove();
    else if (e.target.closest("[data-sw]")) { modo = modo === "criar" ? "entrar" : "criar"; draw(); }
  });
  m.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target), btn = m.querySelector("button[type=submit]"), err = m.querySelector(".conta-err");
    btn.disabled = true; err.hidden = true;
    const r = await api("/api/auth?a=" + (modo === "criar" ? "register" : "login"),
      {handle: String(f.get("handle")), password: String(f.get("password")), local: local()});
    btn.disabled = false;
    if (!r.ok) { err.textContent = r.error || "Não deu certo. Tente de novo."; err.hidden = false; return; }
    ME = r.user; aplicar(r.data); m.remove();
    toast(modo === "criar" ? "Conta criada! Seu progresso está salvo." : `Bem-vindo de volta, ${esc(r.user.handle)}!`);
    document.dispatchEvent(new CustomEvent("fen:conta"));
    done && done();
  });
  document.body.appendChild(m);
}
