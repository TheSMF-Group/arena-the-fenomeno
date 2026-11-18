// @ts-nocheck
/* Onboarding da primeira visita: boas-vindas -> mascote já sorteado (rerolar ou ajustar pelagem e cabelo) -> nome -> primeiro jogo.
   "Pular" sempre visível: quem pula ganha um mascote pronto da reserva e um nome gerado (Cabra#4821).
   O 3D (pacote do repo thefenomeno-mascote, em public/mascote/<versão>/) só baixa na tela do mascote; no resto do site o
   avatar é um retrato WebP de ~7 KB. Sem senha: tudo fica no aparelho; salvar a conta vem depois, num marco. */
import {esc, store, toast} from "./core";
import {CAT} from "./avatars";
import {hasUser, userSet} from "./profile";
import {MASCOTE} from "./mascote-versao";

const rnd = a => a[Math.floor(Math.random() * a.length)];
export const nomeGerado = () => "Cabra#" + (1000 + Math.floor(Math.random() * 9000));
let POOL = null;
const pool = () => POOL || (POOL = fetch(MASCOTE + "pool/pool.json").then(r => r.ok ? r.json() : []).catch(() => []));
let LIB = null;
const lib = () => LIB || (LIB = import(/* @vite-ignore */ MASCOTE + "mascote.js").catch(e => { LIB = null; throw e; }));
const blobUrl = b => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });

/* perfil novo: nome, mascote (código do look + retrato) e a primeira camisa da coleção (as outras vêm da Mystery Box) */
function grava({n, m, av, bg}) {
  const k = rnd(CAT).k;
  userSet({n, m, av, bg, k, o: [k]});
  store.set("onb", 1);
  document.dispatchEvent(new CustomEvent("fen:user"));
}

export const onbPendente = () => !hasUser() && !store.get("onb");

/* quem pula: retrato pronto da reserva (sem baixar o 3D) e nome gerado */
async function pula() {
  const P = await pool(), i = P.length ? Math.floor(Math.random() * P.length) : -1;
  grava(i < 0 ? {n: nomeGerado(), m: null, av: null, bg: null} : {n: nomeGerado(), m: P[i].c, av: `${MASCOTE}pool/${i}.webp`, bg: P[i].f});
}

const CABELOS_TEXTURA = [["original", "Clássico"], ["raspado", "Raspado"], ["lateral", "Desenho"], ["pontas", "Pontas"], ["careca", "Careca"]];

/* tela do mascote em 3D, usada no onboarding e no Vestiário. done({m, av, bg}) ao salvar; cancel() ao sair */
function telaMascote(box, {inicial, rotulo, done, cancel}) {
  let est = null, M = null, look = null, fundo = inicial.bg || "#FFCD00", ocupado = false;
  box.innerHTML = `<div class="onb-mascote">
      <div class="onb-palco" style="--fundo:${esc(fundo)}"><img class="onb-prev" alt="" ${inicial.av ? `src="${esc(inicial.av)}"` : "hidden"}><div class="onb-load"><i></i><span>Baixando o mascote…</span></div></div>
      <div class="onb-ctrl">
        <button type="button" class="btn y onb-dado" data-dado disabled><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/><circle cx="16" cy="16" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="16" cy="8" r="1.6" fill="currentColor"/><circle cx="8" cy="16" r="1.6" fill="currentColor"/></svg>Aleatório</button>
        <div class="onb-ajuste"><small>PELAGEM</small><div class="onb-op" data-g="pel"></div></div>
        <div class="onb-ajuste"><small>CABELO</small><div class="onb-op" data-g="cab"></div></div>
        <div class="row onb-fim"><button type="button" class="btn y" data-ok disabled>${esc(rotulo)}</button>${cancel ? `<button type="button" class="btn" data-x>Cancelar</button>` : ""}</div>
      </div></div>`;
  const palco = box.querySelector(".onb-palco"), load = box.querySelector(".onb-load");
  const desenhaOpcoes = () => {
    if (!M) return;
    const pel = look.skin.pelagem.principal.toUpperCase();
    box.querySelector('[data-g="pel"]').innerHTML = M.PELAGENS.map(p => `<button type="button" class="sw" data-pel="${p.id}" style="--c:${p.pelagem.principal}" aria-label="${esc(p.nome)}" aria-pressed="${p.pelagem.principal.toUpperCase() === pel}"></button>`).join("");
    const atual = look.corte3d || look.skin.cabelo.estilo;
    box.querySelector('[data-g="cab"]').innerHTML = [...CABELOS_TEXTURA, ...M.CORTES_3D.map(c => [c.id, c.nome])].map(([id, n]) => `<button type="button" class="chip" data-cab="${id}" aria-pressed="${id === atual}">${esc(n)}</button>`).join("");
  };
  const usa = l => { look = l; est.usa(l); desenhaOpcoes(); };
  (async () => {
    try {
      M = await lib();
      const r = inicial.m ? M.decodificaLook(inicial.m) : null;
      look = r && r.ok ? r.look : M.lookAleatorio();
      if (!box.isConnected) return;
      est = await M.abreEstudio(palco, {raiz: MASCOTE + "modelo/", look, aoProgredir: p => { load.querySelector("i").style.width = Math.round(p.fracao * 100) + "%"; }});
      if (!box.isConnected) { est.fecha(); return; }
      palco.classList.add("pronto");
      box.querySelectorAll("[data-dado],[data-ok]").forEach(b => b.disabled = false);
      desenhaOpcoes();
    } catch (e) {
      // sem WebGL ou sem rede: fica o retrato pronto, e o dado troca entre os retratos da reserva
      load.querySelector("span").textContent = "Não deu para abrir o 3D aqui. Use o dado para trocar o retrato.";
      palco.classList.add("sem3d");
      const P = await pool();
      if (P.length) {
        let i = Math.floor(Math.random() * P.length);
        const mostra = () => { const img = box.querySelector(".onb-prev"); img.hidden = false; img.src = `${MASCOTE}pool/${i}.webp`; fundo = P[i].f; };
        if (!inicial.av) mostra();
        box.querySelector("[data-dado]").onclick = () => { i = (i + 1 + Math.floor(Math.random() * (P.length - 1))) % P.length; mostra(); };
        box.querySelector("[data-ok]").onclick = () => done({m: P[i].c, av: `${MASCOTE}pool/${i}.webp`, bg: P[i].f});
        box.querySelectorAll("[data-dado],[data-ok]").forEach(b => b.disabled = false);
      }
    }
  })();
  box.addEventListener("click", async e => {
    if (!est) { if (e.target.closest("[data-x]")) cancel(); return; }
    if (e.target.closest("[data-dado]")) { fundo = rnd(M.FUNDOS).hex; palco.style.setProperty("--fundo", fundo); usa(M.lookAleatorio()); return; }
    const p = e.target.closest("[data-pel]");
    if (p) { const pr = M.PELAGENS.find(x => x.id === p.dataset.pel); const l = structuredClone(look); l.skin.pelagem = structuredClone(pr.pelagem); usa(l); return; }
    const c = e.target.closest("[data-cab]");
    if (c) { usa(M.escolheCorte(look, c.dataset.cab)); return; }
    if (e.target.closest("[data-x]")) { est.fecha(); est = null; cancel(); return; }
    if (e.target.closest("[data-ok]") && !ocupado) {
      ocupado = true; const b = e.target.closest("[data-ok]"); b.disabled = true; b.textContent = "Tirando a foto…";
      try {
        const av = await blobUrl(await est.foto({fundo, expressao: "feliz"}));
        const m = M.codificaLook(look);
        est.fecha(); est = null;
        done({m, av, bg: fundo});
      } catch (err) { ocupado = false; b.disabled = false; b.textContent = rotulo; toast("Não deu para tirar a foto. Tente de novo."); }
    }
  });
  return () => { if (est) { est.fecha(); est = null; } };
}

/* editar o mascote depois (Vestiário) */
export function editarMascote(perfil, depois) {
  const m = document.createElement("div"); m.className = "modal onb-modal";
  m.innerHTML = `<div class="box onb-box"><h3>SEU MASCOTE</h3><div class="onb-corpo"></div></div>`;
  document.body.appendChild(m);
  const fecha = telaMascote(m.querySelector(".onb-corpo"), {inicial: perfil, rotulo: "Salvar mascote",
    done: r => { userSet(r); m.remove(); toast("Mascote salvo!"); document.dispatchEvent(new CustomEvent("fen:user")); depois && depois(); },
    cancel: () => m.remove()});
  m.addEventListener("click", e => { if (e.target === m) { fecha(); m.remove(); } });
}

/* onboarding inteiro (direto = já na tela do mascote, para quem clicou em Criar usuário); fim() abre o primeiro jogo (ou o jogo do link) depois de criar ou pular */
export function onboarding(fim, direto = false) {
  const m = document.createElement("div"); m.className = "onb";
  m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "Bem-vindo à Arena The Fenômeno");
  document.body.appendChild(m); document.body.classList.add("onb-on");
  pool(); // a reserva é pequena (~5 KB): já vem para o "Pular" e para o retrato de espera
  let parar = null;
  const sai = () => { if (parar) parar(); m.remove(); document.body.classList.remove("onb-on"); fim && fim(); };
  const pular = `<button type="button" class="onb-pular" data-pular>Pular</button>`;
  const passos = n => `<ol class="onb-passos" aria-label="Passo ${n} de 3">${[1, 2, 3].map(i => `<li class="${i <= n ? "on" : ""}"></li>`).join("")}</ol>`;

  const boasVindas = () => {
    m.innerHTML = `<div class="onb-tela onb-bv">${pular}
      <div class="onb-bv-in"><small class="onb-kick">ARENA THE FENÔMENO</small>
        <h2 class="d">22 jogos de futebol.<br><b>Um craque: você.</b></h2>
        <p class="muted">Monte seu mascote em 10 segundos, escolha o nome e entre em campo.</p>
        <button type="button" class="btn y onb-go" data-go>Criar meu mascote</button>
        <button type="button" class="lnk onb-depois" data-pular>Agora não, só quero jogar</button></div></div>`;
  };
  const mascote = async () => {
    const P = await pool(), i = P.length ? Math.floor(Math.random() * P.length) : -1;
    const inicial = i < 0 ? {m: null, av: null, bg: null} : {m: P[i].c, av: `${MASCOTE}pool/${i}.webp`, bg: P[i].f};
    m.innerHTML = `<div class="onb-tela">${pular}${passos(2)}<h2 class="d onb-tit">ESSE É O SEU <b>MASCOTE</b></h2><p class="muted onb-sub">Não curtiu? Joga o dado de novo ou ajusta a pelagem e o cabelo.</p><div class="onb-corpo"></div></div>`;
    parar = telaMascote(m.querySelector(".onb-corpo"), {inicial, rotulo: "Esse é o meu →", done: r => { parar = null; nome(r); }});
  };
  const nome = r => {
    const sugestao = nomeGerado();
    m.innerHTML = `<div class="onb-tela onb-nm">${pular}${passos(3)}
      <img class="onb-foto" src="${esc(r.av || "")}" alt="Seu mascote" ${r.av ? "" : "hidden"}>
      <h2 class="d onb-tit">COMO A TORCIDA VAI <b>TE CHAMAR?</b></h2>
      <form class="onb-form"><input class="onb-nome" maxlength="12" autocomplete="nickname" spellcheck="false" aria-label="Seu nome" value="${esc(sugestao)}">
      <button type="submit" class="btn y onb-go">Entrar em campo →</button></form>
      <p class="muted onb-sub">Dá para trocar depois no Vestiário.</p></div>`;
    const inp = m.querySelector(".onb-nome"); inp.focus(); inp.select();
    m.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      const n = inp.value.trim().slice(0, 12);
      if (n.length < 2) { toast("O nome precisa de 2 letras ou mais"); inp.focus(); return; }
      grava({...r, n}); toast(`Bem-vindo, ${n}!`); sai();
    });
    // quem pula aqui fica com o mascote que montou e o nome sugerido
    m.querySelector("[data-pular]").onclick = () => { grava({...r, n: sugestao}); sai(); };
  };
  m.addEventListener("click", e => {
    if (e.target.closest("[data-go]") && !e.target.closest("form")) { mascote(); return; }
    const p = e.target.closest("[data-pular]");
    if (p && !p.onclick) { pula().then(sai); }
  });
  direto ? mascote() : boasVindas();
}
