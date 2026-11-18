// @ts-nocheck
/* Onboarding da primeira visita, contado como uma estreia em noite de estádio:
   1. convite: um pacote de figurinha fechado, com o mascote borrado na janela (curiosidade) e o custo dito antes
      (20 segundos, sem cadastro, sem senha);
   2. revelação: o pacote abre e o mascote já é seu (posse antes de qualquer escolha). Rerolar é brinquedo, com o
      comentário do olheiro mudando a cada sorteio; ajustar pelagem e cabelo é opcional;
   3. nome: a figurinha mostra o nome enquanto a pessoa digita;
   4. estreia: a figurinha recebe o carimbo, festa curta e o primeiro jogo (o pico e o fim da experiência).
   O progresso já começa com um passo feito ("Pacote"), e "Pular" fica visível em todas as telas, sem texto que
   envergonhe quem pula: quem pula ganha um mascote pronto da reserva e um nome gerado (Cabra#4821).
   O 3D (pacote do repo thefenomeno-mascote, em public/mascote/<versão>/) só baixa quando o pacote abre; no resto do
   site o avatar é um retrato WebP de ~7 KB. Sem senha: tudo fica no aparelho; salvar a conta vem depois, num marco. */
import {esc, store, toast} from "./core";
import {CAT} from "./avatars";
import {hasUser, userSet} from "./profile";
import {MASCOTE} from "./mascote-versao";
import bode from "./assets/fig-bode.png?url";

const rnd = a => a[Math.floor(Math.random() * a.length)];
const outro = (a, atual) => { let v; do v = rnd(a); while (a.length > 1 && v === atual); return v; };
export const nomeGerado = () => "Cabra#" + (1000 + Math.floor(Math.random() * 9000));
let POOL = null;
const pool = () => POOL || (POOL = fetch(MASCOTE + "pool/pool.json").then(r => r.ok ? r.json() : []).catch(() => []));
let LIB = null;
const lib = () => LIB || (LIB = import(/* @vite-ignore */ MASCOTE + "mascote.js").catch(e => { LIB = null; throw e; }));
const blobUrl = b => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
const reduz = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const vibra = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };
const hoje = () => new Date().toLocaleDateString("pt-BR", {day: "2-digit", month: "short", year: "numeric"}).replace(/\./g, "").replace(/ de /g, " ").toUpperCase();

/* o olheiro comenta cada sorteio: recompensa variável e uma personalidade para o mascote */
const OLHEIRO = [
  "Tem cara de camisa 10.", "Bate pênalti de cavadinha.", "Zagueiro raiz: a bola passa, o atacante não.",
  "Chega no estádio duas horas antes.", "Comemora gol até em treino.", "Pé esquerdo calibrado.",
  "Nunca perdeu um rachão.", "Pede a bola no último minuto.", "Driblou o olheiro na peneira.",
  "A torcida já tem música pra ele.", "Faz embaixadinha com laranja.", "Capitão nato.", "Ídolo da várzea.",
  "Joga de chuteira branca e não erra passe.", "Cobra falta no ângulo.", "Volante que dá carrinho limpo.",
];
const AJUSTE = ["Ficou com a sua cara.", "Agora sim, cara de titular.", "Esse visual entra em campo.", "Estilo de quem decide clássico."];

/* confete curto em canvas, saindo do centro de um elemento */
function confete(el, n = 110) {
  if (reduz() || !el || !el.isConnected) return;
  const r = el.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 2;
  const c = document.createElement("canvas"), d = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  c.className = "onb-confete"; c.width = W * d; c.height = H * d;
  document.body.appendChild(c);
  const g = c.getContext("2d"); g.scale(d, d);
  const cores = ["#f7d24c", "#22c55e", "#ffffff", "#138a3f", "#ffe98a"];
  const P = Array.from({length: n}, (_, i) => { const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 8;
    return {x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cores[i % cores.length]}; });
  const t0 = performance.now(), DUR = 1.9;
  const f = t => {
    const k = (t - t0) / 1000; g.clearRect(0, 0, W, H); g.globalAlpha = Math.max(0, 1 - k / DUR);
    for (const p of P) { p.vy += .26; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1); g.restore(); }
    k < DUR ? requestAnimationFrame(f) : c.remove();
  };
  requestAnimationFrame(f);
}

/* a figurinha inclina com o dedo ou o mouse e o brilho acompanha */
function inclina(w) {
  if (!w || reduz()) return;
  const fig = w.querySelector(".onb-fig");
  w.addEventListener("pointermove", e => { const r = w.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    fig.style.setProperty("--ry", ((x - .5) * 16).toFixed(1) + "deg"); fig.style.setProperty("--rx", ((.5 - y) * 12).toFixed(1) + "deg");
    fig.style.setProperty("--mx", (x * 100).toFixed(0) + "%"); fig.style.setProperty("--my", (y * 100).toFixed(0) + "%"); });
  w.addEventListener("pointerleave", () => { ["--rx", "--ry", "--mx", "--my"].forEach(p => fig.style.removeProperty(p)); });
}

/* o nome ocupa a faixa preta inteira: começa grande e diminui até caber */
const cabeNome = el => { if (!el) return; let t = 30; el.style.fontSize = t + "px"; while (el.scrollWidth > el.clientWidth && t > 13) el.style.fontSize = --t + "px"; };
const figurinha = (r, n, extra = "") => `<div class="onb-fig" style="--fundo:${esc(r.bg || "#f7d24c")}">
    <div class="onb-fig-top"><span>ARENA THE FENÔMENO</span><span>${new Date().getFullYear()}</span></div>
    <div class="onb-fig-foto">${r.av ? `<img src="${esc(r.av)}" alt="Seu mascote">` : ""}</div>
    <div class="onb-fig-nome" data-nome>${esc(n)}</div>
    <div class="onb-fig-pe"><span>ESTREANTE</span><span>${hoje()}</span></div>
    <i class="onb-fig-brilho"></i>${extra}</div>`;

/* perfil novo: nome, mascote (código do look + retrato) e a primeira camisa da coleção (as outras vêm da Mystery Box) */
function grava({n, m, av, bg}) {
  const k = rnd(CAT).k;
  userSet({n, m, av, bg, k, o: [k]});
  store.set("onb", 1);
  document.dispatchEvent(new CustomEvent("fen:user"));
}

export const onbPendente = () => !hasUser() && !store.get("onb");

const sorteia = P => { if (!P.length) return {m: null, av: null, bg: null}; const i = Math.floor(Math.random() * P.length); return {m: P[i].c, av: `${MASCOTE}pool/${i}.webp`, bg: P[i].f}; };

/* quem pula: retrato pronto da reserva (sem baixar o 3D) e nome gerado */
async function pula(sorteio) {
  const n = nomeGerado();
  grava({n, ...(sorteio || sorteia(await pool()))});
  return n;
}

const CABELOS_TEXTURA = [["original", "Clássico"], ["raspado", "Raspado"], ["lateral", "Desenho"], ["pontas", "Pontas"], ["careca", "Careca"]];
const DADO = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="8" cy="8" r="1.7" fill="currentColor"/><circle cx="16" cy="16" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="16" cy="8" r="1.7" fill="currentColor"/><circle cx="8" cy="16" r="1.7" fill="currentColor"/></svg>`;
const PRANCHETA = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="currentColor"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

/* tela do mascote em 3D, usada no onboarding e no Vestiário. done({m, av, bg}) ao salvar; cancel() ao sair.
   cabeca: título da etapa (no onboarding), que fica ao lado do palco no computador e acima dele no celular */
function telaMascote(box, {inicial, rotulo, done, cancel, cabeca = "", chegada = false}) {
  let est = null, M = null, look = null, fundo = inicial.bg || "#FFCD00", ocupado = false, frase = rnd(OLHEIRO), ajustou = false;
  box.innerHTML = `<div class="onb-mascote">
      ${cabeca ? `<div class="onb-cab">${cabeca}</div>` : ""}
      <div class="onb-palco-w">
        <div class="onb-palco" style="--fundo:${esc(fundo)}"><img class="onb-prev${chegada ? " pop" : ""}" alt="" ${inicial.av ? `src="${esc(inicial.av)}"` : "hidden"}>
          <div class="onb-load"><span>Aquecendo no vestiário</span><i><b></b></i></div><div class="onb-flash"></div></div>
        <p class="onb-olheiro" aria-live="polite">${PRANCHETA}<span><b>Olheiro</b> <q>${esc(frase)}</q></span></p>
      </div>
      <div class="onb-ctrl">
        <button type="button" class="onb-dado" data-dado disabled><span class="onb-dado-ic">${DADO}</span><span class="onb-dado-tx"><b>Sortear outro</b><small>Quantas vezes quiser</small></span></button>
        <div class="onb-ajuste"><small>Pelagem</small><div class="onb-op" data-g="pel"></div></div>
        <div class="onb-ajuste"><small>Cabelo</small><div class="onb-op" data-g="cab"></div></div>
        <div class="onb-fim"><button type="button" class="onb-cta" data-ok disabled>${esc(rotulo)}</button>${cancel ? `<button type="button" class="onb-sec" data-x>Cancelar</button>` : ""}</div>
      </div></div>`;
  const palco = box.querySelector(".onb-palco"), load = box.querySelector(".onb-load"), olheiro = box.querySelector(".onb-olheiro");
  const diz = t => { frase = t; olheiro.querySelector("q").textContent = t; olheiro.classList.remove("novo"); void olheiro.offsetWidth; olheiro.classList.add("novo"); };
  const pisca = () => { palco.classList.remove("flash"); void palco.offsetWidth; palco.classList.add("flash"); };
  const desenhaOpcoes = () => {
    if (!M) return;
    const pel = look.skin.pelagem.principal.toUpperCase();
    box.querySelector('[data-g="pel"]').innerHTML = M.PELAGENS.map(p => `<button type="button" class="sw" data-pel="${p.id}" style="--c:${p.pelagem.principal}" aria-label="${esc(p.nome)}" title="${esc(p.nome)}" aria-pressed="${p.pelagem.principal.toUpperCase() === pel}"></button>`).join("");
    const atual = look.corte3d || look.skin.cabelo.estilo;
    box.querySelector('[data-g="cab"]').innerHTML = [...CABELOS_TEXTURA, ...M.CORTES_3D.map(c => [c.id, c.nome])].map(([id, n]) => `<button type="button" class="chip" data-cab="${id}" aria-pressed="${id === atual}">${esc(n)}</button>`).join("");
  };
  const usa = l => { look = l; est.usa(l); desenhaOpcoes(); };
  const ajuste = () => { if (!ajustou) { ajustou = true; diz(rnd(AJUSTE)); } };
  (async () => {
    try {
      M = await lib();
      const r = inicial.m ? M.decodificaLook(inicial.m) : null;
      look = r && r.ok ? r.look : M.lookAleatorio();
      if (!box.isConnected) return;
      est = await M.abreEstudio(palco, {raiz: MASCOTE + "modelo/", look, aoProgredir: p => { const v = Math.round(p.fracao * 100); load.querySelector("b").style.width = v + "%"; load.querySelector("span").textContent = `Aquecendo no vestiário · ${v}%`; }});
      if (!box.isConnected) { est.fecha(); return; }
      const cv = palco.querySelector("canvas"); if (cv) palco.prepend(cv); // o canvas fica atrás do retrato e do flash
      palco.classList.add("pronto");
      box.querySelectorAll("[data-dado],[data-ok]").forEach(b => b.disabled = false);
      desenhaOpcoes();
    } catch (e) {
      // sem WebGL ou sem rede: fica o retrato pronto, e o dado troca entre os retratos da reserva
      load.querySelector("span").textContent = "O 3D não abriu aqui. O dado troca o retrato.";
      palco.classList.add("sem3d");
      box.querySelectorAll(".onb-ajuste").forEach(a => a.hidden = true);
      const P = await pool();
      if (P.length) {
        let i = Math.max(0, P.findIndex(p => p.c === inicial.m));
        const mostra = () => { const img = box.querySelector(".onb-prev"); img.hidden = false; img.src = `${MASCOTE}pool/${i}.webp`; fundo = P[i].f; palco.style.setProperty("--fundo", fundo); };
        if (!inicial.av) mostra();
        box.querySelector("[data-dado]").onclick = () => { i = (i + 1 + Math.floor(Math.random() * (P.length - 1))) % P.length; mostra(); pisca(); diz(outro(OLHEIRO, frase)); vibra(); };
        box.querySelector("[data-ok]").onclick = () => done({m: P[i].c, av: `${MASCOTE}pool/${i}.webp`, bg: P[i].f});
        box.querySelectorAll("[data-dado],[data-ok]").forEach(b => b.disabled = false);
      }
    }
  })();
  box.addEventListener("click", async e => {
    if (!est) { if (e.target.closest("[data-x]")) cancel(); return; }
    const dado = e.target.closest("[data-dado]");
    if (dado) {
      dado.classList.remove("rola"); void dado.offsetWidth; dado.classList.add("rola"); vibra(); pisca();
      fundo = rnd(M.FUNDOS).hex; palco.style.setProperty("--fundo", fundo); usa(M.lookAleatorio()); diz(outro(OLHEIRO, frase)); ajustou = false;
      return;
    }
    const p = e.target.closest("[data-pel]");
    if (p) { const pr = M.PELAGENS.find(x => x.id === p.dataset.pel); const l = structuredClone(look); l.skin.pelagem = structuredClone(pr.pelagem); usa(l); ajuste(); return; }
    const c = e.target.closest("[data-cab]");
    if (c) { usa(M.escolheCorte(look, c.dataset.cab)); ajuste(); return; }
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

/* onboarding inteiro (direto = já abre o pacote, para quem clicou em Criar usuário); fim() abre o primeiro jogo (ou o jogo do link) depois de criar ou pular */
export function onboarding(fim, direto = false) {
  const m = document.createElement("div"); m.className = "onb";
  m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "Boas-vindas à Arena The Fenômeno");
  document.body.appendChild(m); document.body.classList.add("onb-on");
  let parar = null, sorteio = null, abrindo = false, saiu = false;
  const pronto = pool().then(P => (sorteio = sorteia(P))); // a reserva é pequena (~5 KB): já vem para a janela do pacote e para o "Pular"
  const sai = () => { if (saiu) return; saiu = true; if (parar) parar(); m.remove(); document.body.classList.remove("onb-on"); fim && fim(); };
  const topo = `<div class="onb-topo"><span class="onb-marca"><img src="${bode}" alt="" width="30" height="30">Arena The Fenômeno</span><button type="button" class="onb-pular" data-pular>Pular</button></div>`;
  const ETAPAS = ["Pacote", "Mascote", "Nome"];
  const OK = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const passos = n => `<ol class="onb-passos" aria-label="Etapa ${n} de 3">${ETAPAS.map((t, i) => `<li class="${i + 1 < n ? "ok" : i + 1 === n ? "at" : ""}"${i + 1 === n ? ' aria-current="step"' : ""}><i>${i + 1 < n ? OK : i + 1}</i>${t}</li>`).join("")}</ol>`;
  const foca = s => requestAnimationFrame(() => { const el = m.querySelector(s); el && el.focus({preventScroll: true}); });

  const convite = () => {
    m.innerHTML = `<div class="onb-tela onb-cv">${topo}
      <div class="onb-cv-grid">
        <button type="button" class="onb-pacote" data-abrir aria-label="Abrir meu pacote de figurinha">
          <span class="onb-pac"><span class="onb-pac-corpo">
            <span class="onb-pac-selo">EDIÇÃO DE ESTREIA</span>
            <span class="onb-pac-janela"><img alt="" hidden><i aria-hidden="true">?</i></span>
            <span class="onb-pac-nome">ARENA<br>THE FENÔMENO</span>
            <span class="onb-pac-qtd">1 FIGURINHA · 1 CRAQUE</span>
          </span><span class="onb-pac-aba"><small>ABRA AQUI</small></span></span>
        </button>
        <div class="onb-cv-txt">
          <p class="onb-eb">Estreia · ${hoje()}</p>
          <h1 class="onb-h">Todo craque começa <em>numa figurinha.</em></h1>
          <p class="onb-lead">A sua já está no pacote. Abra, dê um nome e entre em campo.</p>
          <div class="onb-acoes"><button type="button" class="onb-cta" data-abrir>Abrir meu pacote</button>
            <p class="onb-meta"><span>20 segundos</span><span>sem cadastro</span><span>sem senha</span></p></div>
          <button type="button" class="onb-depois" data-pular>Agora não, só quero jogar</button>
        </div></div></div>`;
    pronto.then(s => { const j = m.querySelector(".onb-pac-janela"); if (!j || !s.av) return; const img = j.querySelector("img"); img.src = s.av; img.hidden = false; j.style.setProperty("--fundo", s.bg); });
    m.tabIndex = -1; m.focus({preventScroll: true});
  };
  const abre = async () => {
    if (abrindo) return; abrindo = true;
    lib().catch(() => {}); // o 3D começa a baixar durante a animação do pacote
    const pac = m.querySelector(".onb-pacote");
    if (!pac) { mascote(); return; }
    m.querySelectorAll("[data-abrir]").forEach(b => b.disabled = true);
    await pronto; vibra();
    pac.classList.add("abrindo");
    setTimeout(() => confete(pac.querySelector(".onb-pac-janela")), reduz() ? 0 : 420);
    setTimeout(mascote, reduz() ? 120 : 1250);
  };
  const mascote = async () => {
    await pronto;
    if (saiu) return;
    m.innerHTML = `<div class="onb-tela onb-ms">${topo}<div class="onb-corpo"></div></div>`;
    parar = telaMascote(m.querySelector(".onb-corpo"), {inicial: sorteio, rotulo: "Fechado, é esse →", chegada: true,
      cabeca: `${passos(2)}<h2 class="onb-h">Prazer, <em>seu mascote.</em></h2><p class="onb-lead">Ele já é seu. Sorteie outro quantas vezes quiser ou ajuste dois detalhes.</p>`,
      done: r => { parar = null; nome(r); }});
  };
  const nome = r => {
    const sugestao = nomeGerado();
    m.innerHTML = `<div class="onb-tela onb-nm">${topo}<div class="onb-nm-grid">
      <div class="onb-fig-w">${figurinha(r, sugestao)}</div>
      <div class="onb-nm-txt">${passos(3)}
        <h2 class="onb-h">Como a torcida <em>vai te chamar?</em></h2>
        <p class="onb-lead">Esse nome vai na sua figurinha e aparece para quem jogar com você. Dá para trocar depois.</p>
        <form class="onb-form"><label class="onb-campo"><span>Nome de craque</span>
          <input class="onb-nome" maxlength="12" autocomplete="nickname" spellcheck="false" enterkeyhint="go" value="${esc(sugestao)}"></label>
          <button type="submit" class="onb-cta">Fechar minha figurinha →</button></form>
      </div></div></div>`;
    const inp = m.querySelector(".onb-nome"), alvo = m.querySelector("[data-nome]");
    inclina(m.querySelector(".onb-fig-w"));
    cabeNome(alvo);
    inp.addEventListener("input", () => { alvo.textContent = inp.value.trim() || "Seu nome"; cabeNome(alvo); });
    if (matchMedia("(pointer:fine)").matches) { inp.focus(); inp.select(); }
    m.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      const n = inp.value.trim().slice(0, 12);
      if (n.length < 2) { toast("O nome precisa de 2 letras ou mais"); inp.focus(); return; }
      grava({...r, n}); estreia(r, n);
    });
    // quem pula aqui fica com o mascote que montou e o nome sugerido
    m.querySelector("[data-pular]").onclick = () => { grava({...r, n: sugestao}); toast(`Você estreia como ${sugestao}. Dá para trocar no Vestiário.`); sai(); };
  };
  const estreia = (r, n) => {
    m.innerHTML = `<div class="onb-tela onb-fe"><div class="onb-fe-in">
      <div class="onb-fig-w">${figurinha(r, n, `<b class="onb-carimbo">ESTREIA<br>CONFIRMADA</b>`)}</div>
      <h2 class="onb-h">Boas-vindas <em>à Arena.</em></h2>
      <p class="onb-lead"><b>${esc(n)}</b>, seu mascote já mora no Vestiário. Agora é jogo: o desafio do dia começa já.</p>
      <button type="button" class="onb-cta onb-auto" data-fim><span>Entrar em campo →</span><i></i></button></div></div>`;
    const fig = m.querySelector(".onb-fig"); cabeNome(fig.querySelector("[data-nome]")); fig.classList.add("colando");
    setTimeout(() => confete(fig, 150), reduz() ? 0 : 560);
    const t = setTimeout(sai, 3600);
    m.querySelector("[data-fim]").onclick = () => { clearTimeout(t); sai(); };
    foca("[data-fim]");
  };
  m.addEventListener("click", e => {
    if (e.target.closest("[data-abrir]")) { abre(); return; }
    const p = e.target.closest("[data-pular]");
    if (p && !p.onclick) { pronto.then(() => pula(sorteio)).then(n => { toast(`Você estreia como ${n}. Dá para trocar no Vestiário.`); sai(); }); }
  });
  if (direto) { convite(); setTimeout(abre, reduz() ? 0 : 450); } else convite();
}
