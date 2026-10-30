// @ts-nocheck
/* Perfil do jogador: criação (nome + camisa + cor) e Vestiário (escolher a camisa, ver suas partidas). */
import fmbImg from "./assets/fmb-badge.webp?url";
import {$, esc, toast} from "./core";
import {GAMES, KIND} from "./engine";
import {ST} from "./state";
import {cleanup, home} from "./home";
import {BGS, CAT, avatarHTML, loadAvKits, shirtOf} from "./avatars";
import {BEARD, BROWS, EXTRA, EYES, GLASS, HAIRC, HAIRS, MOUTH, SKINS, defAv, randAv} from "./avatarArt";
import {hasUser, histGet, pfGet, userSet} from "./profile";
import {store} from "./core";

export function renderMe(){const b=$("#meBtn");if(!b)return;
  if(hasUser()){const u=pfGet();b.classList.add("has");b.innerHTML=`${avatarHTML(u,26)}<span>${esc(u.n)}</span>`}
  else{b.classList.remove("has");b.innerHTML=`<span class="plus">+</span><span>Criar usuário</span>`}}
const LIGAS=[["all","Todas"],["br","Brasileirão"],["eu","Champions"]];
const tabsHTML=cur=>`<div class="vt-tabs" role="group" aria-label="Liga">${LIGAS.map(([k,n])=>`<button type="button" data-l="${k}" aria-pressed="${k===cur}">${n}</button>`).join("")}</div>`;
const inLiga=(c,l)=>l==="all"||c.l===l;
const FMB=`<aside class="fmbcard"><b class="d">GOSTOU DE ALGUMA CAMISA?</b><span>Use o cupom abaixo!</span><a class="fmb-badge" href="https://www.fmbbr.com.br/plan/form?plan_id=3&coupon=THEFENOMENO&utm_source=arena&utm_medium=partner_badge&utm_campaign=fmb&utm_content=vestiario" target="_blank" rel="noopener" aria-label="Assine uma Mystery Box e ganhe 1 mês grátis, com o cupom THEFENOMENO (abre em nova aba)"><img src="${fmbImg}" alt="Assine uma Mystery Box e ganhe 1 mês grátis. Use o cupom: THEFENOMENO" width="800" height="200" loading="lazy"></a><small>Publicidade · Football Mystery Box Brasil</small></aside>`;

export async function perfilScreen(){ST.VIEW="perfil";ST.PHASE="perfil";cleanup();
  if(location.hash!=="#perfil")history.replaceState(null,"","#perfil");
  $("#app").innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2>${hasUser()?"VESTIÁRIO":"CRIE SEU <b>USUÁRIO</b>"}</h2><span class="spacer"></span></div><div id="pfBody"><p class="muted">Carregando as camisas…</p></div>`;
  $("#app").querySelector(".back").addEventListener("click",home);window.scrollTo(0,0);
  await loadAvKits();if(ST.VIEW!=="perfil")return;
  hasUser()?vestiario():criar()}

/* ---------- criação (no estilo do StopotS): avatar com lápis, apelido sorteado e só o botão de criar ---------- */
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function criar(){let name="Fenômeno"+(100+Math.floor(Math.random()*900)),cur={k:rnd(CAT).k,bg:rnd(BGS),a:randAv()};const body=$("#pfBody");
  body.innerHTML=`<section class="cr2">
    <button type="button" class="cr2-av" aria-label="Editar avatar"><span id="crAv"></span><span class="pencil" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zm17.7-10.2a1 1 0 0 0 0-1.4l-2.34-2.34a1 1 0 0 0-1.4 0l-1.83 1.83 3.75 3.75 1.82-1.84z"/></svg></span></button>
    <input id="crName" class="cr2-name" maxlength="12" autocomplete="off" spellcheck="false" aria-label="Seu nome" value="${esc(name)}">
    <button type="button" class="btn y cr2-go">CRIAR</button></section>`;
  const av=body.querySelector("#crAv"),inp=body.querySelector("#crName");
  const paint=()=>{av.innerHTML=avatarHTML(cur,170)};
  inp.addEventListener("input",()=>{name=inp.value.trim().slice(0,12)});inp.addEventListener("focus",()=>inp.select());
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
  const go=()=>{name=inp.value.trim().slice(0,12);if(name.length<2){toast("O nome precisa de 2 letras ou mais");inp.focus();return}
    userSet({n:name,k:cur.k,bg:cur.bg,a:cur.a,c:ST.ESC&&ST.ESC[cur.k]?cur.k:null});renderMe();toast(`Bem-vindo, ${name}!`);perfilScreen()};
  body.querySelector(".cr2-go").addEventListener("click",go);
  body.querySelector(".cr2-av").addEventListener("click",()=>editor(cur,n=>{cur=n;paint()}));
  paint()}
/* pop-up do avatar, por abas: rosto, cabelo, olhos, óculos, boca, extras, camisa e cor de fundo */
const TABS=[["pele","Rosto"],["cabelo","Cabelo"],["olhos","Olhos"],["oculos","Óculos"],["boca","Boca"],["extras","Extras"],["camisa","Camisa"]];
function editor(start,done){let cur={k:start.k,bg:start.bg,a:{...defAv(),...(start.a||{})}},tab="pele",lg="all";const m=document.createElement("div");m.className="modal";
  m.innerHTML=`<div class="box avt-ed"><h3>Monte seu avatar</h3><div class="ed-top"><div id="edAv"></div><div class="ed-side"><div class="cr-bgs">${BGS.map(c=>`<button type="button" class="sw" data-bg="${c}" style="--c:${c}" aria-label="Cor de fundo"></button>`).join("")}</div><button type="button" class="btn" data-dice>🎲 Sortear</button></div></div><div class="vt-tabs" id="edTabs"></div><div id="edBody"></div><div class="row" style="margin-top:12px"><button type="button" class="btn y" data-ok>Pronto</button></div></div>`;
  document.body.appendChild(m);
  const th=(key,list,label)=>`<div class="ed-grp"><small>${label}</small><div class="ed-opts">${list.map((n,v)=>`<button type="button" class="ot" data-key="${key}" data-v="${v}" aria-pressed="${cur.a[key]===v}" title="${esc(n)}">${avatarHTML({a:{...cur.a,[key]:v},bg:cur.bg},62,true)}<small>${esc(n)}</small></button>`).join("")}</div></div>`;
  const sw=(key,list,label)=>`<div class="ed-grp"><small>${label}</small><div class="cr-bgs">${list.map((c,v)=>`<button type="button" class="sw" data-key="${key}" data-v="${v}" style="--c:${c}" aria-label="${label}" aria-pressed="${cur.a[key]===v}"></button>`).join("")}</div></div>`;
  const bodyHTML=()=>({pele:()=>sw("sk",SKINS,"Tom de pele"),cabelo:()=>th("h",HAIRS,"Estilo")+sw("hc",HAIRC,"Cor do cabelo"),olhos:()=>th("ey",EYES,"Olhos")+th("br",BROWS,"Sobrancelhas"),oculos:()=>th("gl",GLASS,"Óculos"),
    boca:()=>th("mo",MOUTH,"Boca")+th("bd",BEARD,"Barba"),extras:()=>th("ac",EXTRA,"Extras"),
    camisa:()=>`${tabsHTML(lg)}<div class="cr-shirts">${CAT.filter(c=>inLiga(c,lg)).map(c=>`<button type="button" class="cs" data-shirt="${c.k}" aria-pressed="${c.k===cur.k}" title="${esc(c.n)}"><img src="${c.f}" alt=""><span>${esc(c.n)}</span></button>`).join("")}</div>`}[tab]());
  const paint=()=>{m.querySelector("#edAv").innerHTML=avatarHTML(cur,112);m.querySelectorAll(".ed-side .sw").forEach(x=>x.setAttribute("aria-pressed",x.dataset.bg===cur.bg));
    m.querySelector("#edTabs").innerHTML=TABS.map(([k,n])=>`<button type="button" data-tab="${k}" aria-pressed="${k===tab}">${n}</button>`).join("");m.querySelector("#edBody").innerHTML=bodyHTML()};
  m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-ok]")){done(cur);m.remove();return}
    const t=e.target.closest("[data-tab]");if(t){tab=t.dataset.tab;paint();return}
    if(e.target.closest("[data-dice]")){cur.a=randAv();paint();return}
    const l=e.target.closest("[data-l]");if(l){lg=l.dataset.l;paint();return}
    const sh=e.target.closest("[data-shirt]");if(sh){cur.k=sh.dataset.shirt;paint();return}
    const w=e.target.closest(".sw[data-bg]");if(w){cur.bg=w.dataset.bg;paint();return}
    const o=e.target.closest("[data-key]");if(o){cur.a[o.dataset.key]=+o.dataset.v;paint()}});paint()}

/* ---------- vestiário: a parede com as camisas (placa = nome do clube) ---------- */
function vestiario(){let lg="all";const body=$("#pfBody");
  const stats=()=>{const h=histGet();const w=h.filter(x=>x.w).length;return{w,l:h.length-w,n:h.length}};
  body.innerHTML=`<section class="vt-top"><div class="vt-me"><div id="vtAv"></div><div><input class="vt-name" maxlength="12" autocomplete="off" spellcheck="false" aria-label="Seu nome"><small id="vtShirt"></small><button type="button" class="btn vt-edit" data-edit>Editar avatar</button></div></div>
    <div class="vt-stats" id="vtSt"></div></section>
    <p class="rules">Passe o mouse para virar a camisa (no celular, toque) e clique para vestir. Ela vira o seu avatar.</p>
    <div id="vtTabs"></div><section class="games jerseys vt-wall"></section>
    <section class="vt-hist"><h3 class="d">SEUS JOGOS</h3><div id="vtHist"></div></section>
    <div class="row" style="margin:6px 0 24px"><button type="button" class="btn" data-del>Apagar meu usuário</button></div>`;
  const wall=body.querySelector(".vt-wall"),nm=body.querySelector(".vt-name");
  const top=()=>{const u=pfGet();body.querySelector("#vtAv").innerHTML=avatarHTML(u,92);const s=shirtOf(u.k);body.querySelector("#vtShirt").textContent=s?`Camisa: ${s.n}`:"";
    const t=stats();body.querySelector("#vtSt").innerHTML=`<div><b>${t.w}</b><small>vitórias</small></div><div><b>${t.l}</b><small>derrotas</small></div><div><b>${t.n}</b><small>partidas</small></div>`};
  const draw=()=>{const u=pfGet();body.querySelector("#vtTabs").innerHTML=tabsHTML(lg);
    wall.innerHTML=CAT.filter(c=>inLiga(c,lg)).map(c=>{const mine=c.k===u.k;
      return`<button type="button" class="jersey${c.b?"":" nb"}${mine?" mine":""}" data-k="${c.k}" aria-label="${esc(c.n)}${mine?" (sua camisa)":""}"><span class="plaque" aria-hidden="true">${esc(c.n)}</span><span class="hang"></span>${mine?'<span class="tag mine">SUA CAMISA</span>':""}<span class="jsway"><span class="jstage"><img class="jface front" src="${c.f}" alt="Camisa do ${esc(c.n)}">${c.b?`<img class="jface fback" src="${c.b}" alt="" loading="lazy">`:""}</span></span></button>`}).join("")+FMB;
    fit();wall.querySelectorAll(".jersey").forEach(j=>{const o=j.querySelector(".jsway");
      j.addEventListener("pointermove",e=>{if(e.pointerType==="touch")return;const r=j.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;o.style.transform=`rotateZ(${x*-8}deg) rotateX(${-y*10}deg)`});
      j.addEventListener("pointerleave",()=>{o.style.transform=""})})};
  const fit=()=>{const fc=wall.querySelector(".fmbcard");if(!fc)return;const cols=getComputedStyle(wall).gridTemplateColumns.split(" ").length,n=wall.querySelectorAll(".jersey").length,rem=cols-(n%cols||cols)||cols;fc.style.gridColumn="span "+(rem>=2?rem:cols)};
  if(window.ResizeObserver)new ResizeObserver(fit).observe(wall);
  const hist=()=>{const h=histGet().slice().reverse().slice(0,14);body.querySelector("#vtHist").innerHTML=h.length?`<ul class="vt-h">${h.map(x=>{const g=GAMES[x.g],pts=KIND[x.g]&&KIND[x.g]!=="wl"&&x.s!=null;return`<li><span class="hg">${esc(g?g.name:x.g)}</span><span class="hr ${x.w?"win":"loss"}">${pts?x.s+" pts":x.w?"GANHOU":"PERDEU"}</span><small>${x.m==="inf"?"infinito":"dia"} · ${new Date(x.t).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</small></li>`}).join("")}</ul>`:`<p class="muted">Você ainda não terminou nenhuma partida. Os resultados aparecem aqui.</p>`};
  nm.value=pfGet().n;nm.addEventListener("change",()=>{const v=nm.value.trim().slice(0,12);if(v.length<2){nm.value=pfGet().n;toast("O nome precisa de 2 letras ou mais");return}userSet({n:v});renderMe();toast("Nome salvo")});
  body.addEventListener("click",e=>{const t=e.target.closest("[data-l]");if(t){lg=t.dataset.l;draw();return}
    if(e.target.closest("[data-edit]")){editor(pfGet(),n=>{userSet({k:n.k,bg:n.bg,a:n.a,c:ST.ESC&&ST.ESC[n.k]?n.k:null});renderMe();top();draw();toast("Avatar salvo")});return}
    const j=e.target.closest(".jersey");if(j){const k=j.dataset.k;userSet({k,c:ST.ESC&&ST.ESC[k]?k:null});renderMe();top();draw();toast(`Camisa escolhida: ${shirtOf(k).n}`);return}
    if(e.target.closest("[data-del]")&&confirm("Apagar seu usuário? O histórico de partidas também some.")){localStorage.removeItem("fen:perfil");localStorage.removeItem("fen:hist");renderMe();perfilScreen()}});
  top();draw();hist()}
