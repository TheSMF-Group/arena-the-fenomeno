// @ts-nocheck
/* Perfil do jogador: criação (nome + camisa + cor) e Vestiário (escolher a camisa, ver suas partidas). */
import fmbImg from "./assets/fmb-badge.webp?url";
import {$, esc, toast} from "./core";
import {GAMES, KIND} from "./engine";
import {ST} from "./state";
import {cleanup, home} from "./home";
import {BGS, CAT, avatarHTML, loadAvKits, shirtOf} from "./avatars";
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

/* ---------- criação: nome, camisa e cor do avatar ---------- */
function criar(){let name="",k=null,bg=BGS[0],lg="all";const body=$("#pfBody");
  body.innerHTML=`<p class="rules">Escolha um nome e a camisa do seu time. É o seu avatar nos jogos e nos duelos com os amigos.</p>
  <section class="cr"><div class="cr-card"><div class="cr-prev"><div id="crAv"></div><b id="crN">SEU NOME</b></div>
    <label class="cr-l">Seu nome<input id="crName" maxlength="12" autocomplete="off" spellcheck="false" placeholder="Ex.: Fenômeno10"></label>
    <div class="cr-l">Cor do avatar<div class="cr-bgs">${BGS.map(c=>`<button type="button" class="sw" data-bg="${c}" style="--c:${c}" aria-label="Cor do avatar" aria-pressed="${c===bg}"></button>`).join("")}</div></div>
    <button type="button" class="btn y cr-go" disabled>Criar meu usuário</button></div>
    <div class="cr-pick"><div class="cr-tabs"></div><div class="cr-shirts"></div></div></section>`;
  const av=body.querySelector("#crAv"),nn=body.querySelector("#crN"),go=body.querySelector(".cr-go"),inp=body.querySelector("#crName");
  const paint=()=>{av.innerHTML=avatarHTML({k,bg},120);nn.textContent=name||"SEU NOME";go.disabled=!(name.length>=2&&k);
    body.querySelector(".cr-tabs").innerHTML=tabsHTML(lg);
    body.querySelector(".cr-shirts").innerHTML=CAT.filter(c=>inLiga(c,lg)).map(c=>`<button type="button" class="cs" data-k="${c.k}" aria-pressed="${c.k===k}" title="${esc(c.n)}"><img src="${c.f}" alt=""><span>${esc(c.n)}</span></button>`).join("");
    body.querySelectorAll(".sw").forEach(s=>s.setAttribute("aria-pressed",s.dataset.bg===bg))};
  inp.addEventListener("input",()=>{name=inp.value.trim().slice(0,12);av.innerHTML=avatarHTML({k,bg},120);nn.textContent=name||"SEU NOME";go.disabled=!(name.length>=2&&k)});
  body.addEventListener("click",e=>{const t=e.target.closest("[data-l]");if(t){lg=t.dataset.l;paint();return}
    const s=e.target.closest("[data-k]");if(s){k=s.dataset.k;paint();return}
    const c=e.target.closest(".sw");if(c){bg=c.dataset.bg;paint();return}
    if(e.target.closest(".cr-go")&&!go.disabled){userSet({n:name,k,bg,c:ST.ESC&&ST.ESC[k]?k:null});renderMe();toast(`Bem-vindo, ${name}!`);perfilScreen()}});
  paint();setTimeout(()=>inp.focus({preventScroll:true}),150)}

/* ---------- vestiário: a parede com as camisas (placa = nome do clube) ---------- */
function vestiario(){let lg="all";const body=$("#pfBody");
  const stats=()=>{const h=histGet();const w=h.filter(x=>x.w).length;return{w,l:h.length-w,n:h.length}};
  body.innerHTML=`<section class="vt-top"><div class="vt-me"><div id="vtAv"></div><div><input class="vt-name" maxlength="12" autocomplete="off" spellcheck="false" aria-label="Seu nome"><small id="vtShirt"></small></div></div>
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
    const j=e.target.closest(".jersey");if(j){const k=j.dataset.k;userSet({k,c:ST.ESC&&ST.ESC[k]?k:null});renderMe();top();draw();toast(`Camisa escolhida: ${shirtOf(k).n}`);return}
    if(e.target.closest("[data-del]")&&confirm("Apagar seu usuário? O histórico de partidas também some.")){localStorage.removeItem("fen:perfil");localStorage.removeItem("fen:hist");renderMe();perfilScreen()}});
  top();draw();hist()}
