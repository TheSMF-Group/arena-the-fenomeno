// @ts-nocheck
/* Objetivos do dia e Mystery Box da FMB: 3 vitórias no diário = camisa do Brasileirão, 5 = camisa da Champions (1 de cada por dia). */
import {$, esc, toast} from "./core";
import {DAILY} from "./home";
import {dayResult} from "./engine";
import {CAT, loadAvKits, shirtOf} from "./avatars";
import {hasUser, ownedAdd, ownedGet, rewGet, rewSet, userGate} from "./profile";
import lidImg from "./assets/fmb-lid.webp?url";
import cubeImg from "./assets/fmb-cube.webp?url";
import logoImg from "./assets/fmb-logo.webp?url";

const OBJ=[{id:"br",n:3,t:"Camisa do Brasileirão",pool:"br"},{id:"eu",n:5,t:"Camisa da Champions",pool:"eu"}];
export const winsToday=()=>DAILY().filter(id=>{const r=dayResult(id);return r&&r.res&&r.res.won}).length;
const state=()=>{const st=rewGet(),w=winsToday();return{st,w,ready:OBJ.filter(o=>w>=o.n&&!st[o.id]),next:OBJ.find(o=>!st[o.id])}};

/* ---------- aba de objetivo (canto da tela) ---------- */
let tab=null,open=false;
function mount(){if(tab)return;tab=document.createElement("div");tab.id="objTab";(document.querySelector(".hrow")||document.body).appendChild(tab);
  tab.addEventListener("click",e=>{const r=e.target.closest("[data-claim]");if(r){claim(OBJ.find(o=>o.id===r.dataset.claim));return}
    if(e.target.closest(".obj-pill")){open=!open;render()}});
  document.addEventListener("click",e=>{if(open&&tab&&!e.composedPath().includes(tab)){open=false;render()}})}
/* a aba fica sempre no cabeçalho, no topo da tela */
function dock(){if(!tab)return;const hr=document.querySelector(".hrow");if(hr&&tab.parentElement!==hr)hr.appendChild(tab)}
export function renderObj(){mount();render();dock();const app=document.querySelector("#app");if(app&&!app._obs){app._obs=new MutationObserver(dock);app._obs.observe(app,{childList:true,subtree:true})}}
function render(){const {st,w,ready,next}=state();
  const line=o=>{const got=!!st[o.id],can=w>=o.n&&!got,pct=Math.min(100,w/o.n*100);
    return`<div class="obj-row ${got?"done":""}"><div class="obj-t"><b>VENÇA MODOS DIÁRIOS ${Math.min(w,o.n)}/${o.n}</b><span>${o.t}</span></div><div class="obj-bar"><i style="width:${pct}%"></i></div>${got?`<em>Resgatada hoje</em>`:can?`<button type="button" class="btn y" data-claim="${o.id}">RESGATAR</button>`:`<small>Faltam ${o.n-w}</small>`}</div>`};
  tab.className=open?"open":"";
  tab.innerHTML=`<div class="obj-panel">${OBJ.map(line).join("")}<p class="obj-note">Só contam as vitórias nos desafios do dia. Você ganha 1 camisa de cada por dia, e elas vão para o seu Vestiário.</p></div>
    <button type="button" class="obj-pill ${ready.length?"ready":""}" aria-expanded="${open}"><span class="obj-ic"><img src="${cubeImg}" alt=""></span><span class="obj-tx"><b>OBJETIVOS</b><small>${next||ready.length?"Ganhe camisas":"Volte amanhã"}</small></span>${ready.length?`<span class="obj-dot" aria-label="${ready.length} recompensa pronta">${ready.length}</span>`:""}</button>`}
document.addEventListener("fen:today",()=>{if(tab)render()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&tab)render()});

/* ---------- resgate: sorteia uma camisa que ele ainda não tem ---------- */
async function claim(o){if(!o)return;if(!hasUser()){userGate();return}
  const {st,w}=state();if(w<o.n||st[o.id])return;await loadAvKits();
  const own=ownedGet(),pool=CAT.filter(c=>c.l===o.pool&&!own.includes(c.k));
  st[o.id]=1;rewSet(st);open=false;render();
  if(!pool.length){toast("Você já tem todas as camisas dessa coleção!");return}
  const got=pool[Math.floor(Math.random()*pool.length)];ownedAdd(got.k);boxAnim(got,o)}

/* ---------- Mystery Box abrindo ---------- */
function boxAnim(sh,o,op={}){document.querySelectorAll(".rw").forEach(x=>x.remove());const m=document.createElement("div");m.className="rw";
  m.innerHTML=`<div class="rw-in"><div class="rw-top"><img class="rw-logo" src="${logoImg}" alt="FMB Futebol Mystery Box"><b class="d">${op.title||"SUA MYSTERY BOX CHEGOU!"}</b></div>
    <div class="rw-stage"><div class="rw-rays"></div>
      <div class="rw-box"><div class="rw-shadow"></div><div class="bx3">
        <div class="f f-bottom"></div><div class="f f-back"></div><div class="f f-left"><div class="band s l"><i>★★★</i></div></div><div class="f f-right"><div class="band s r"><i>★★★</i></div></div>
        <div class="f in-back"></div><div class="f in-left"></div><div class="f in-right"></div><div class="f f-floor"></div>
        <div class="f f-front"><div class="band"><span><em>A 1ª</em> MYSTERY BOX <em>DE FUTEBOL DO BRASIL!</em></span></div></div>
        <div class="lid"><div class="lid-in"></div><div class="lid-top" style="background-image:url(${lidImg})"></div><div class="lid-lip"></div><div class="lid-l"></div><div class="lid-r"></div></div>
      </div></div>
      <div class="rw-shirt"><img src="${sh.f}" alt="Camisa do ${esc(sh.n)}"></div></div>
    <button type="button" class="btn y rw-open">${op.btn||"ABRIR A BOX"}</button>
    <div class="rw-res"><h3 class="d">${op.res||"VOCÊ GANHOU!"}</h3><p><b>${esc(sh.n)}</b><span>${o.t}</span></p><small>${op.note||"Já está no seu Vestiário."}</small><div class="row"><button type="button" class="btn y" data-ves>Ver no Meu Perfil</button><button type="button" class="btn" data-x>Fechar</button></div></div></div>`;
  document.body.appendChild(m);
  const T=(ms,f)=>setTimeout(()=>{if(m.isConnected)f()},ms);
  m.querySelector(".rw-open").addEventListener("click",e=>{e.currentTarget.remove();m.classList.add("shake");T(1100,()=>{m.classList.remove("shake");m.classList.add("open")});T(1500,()=>m.classList.add("burst"));T(2500,()=>m.classList.add("reveal"))});
  m.addEventListener("click",e=>{if(e.target.closest("[data-ves]")){m.remove();document.dispatchEvent(new CustomEvent("fen:perfil"))}else if(e.target.closest("[data-x]")||(e.target===m&&m.classList.contains("reveal")))m.remove()})}

/* ---------- presentes do fundador: link com código único (?presente=CÓDIGO) ---------- */
const GIFTS={"pietrin-flu-k7q3":{k:"fluminense",who:"Pietrin O Bala"}};
const gk="fen:giftpend",gdone=()=>{try{return JSON.parse(localStorage.getItem("fen:gifts"))||[]}catch(e){return[]}};
export function checkGift(){const q=new URLSearchParams(location.search).get("presente");
  if(q){try{localStorage.setItem(gk,q)}catch(e){}const u=new URL(location.href);u.searchParams.delete("presente");history.replaceState(null,"",u.pathname+u.search+u.hash)}
  let code=null;try{code=localStorage.getItem(gk)}catch(e){}
  const g=code&&GIFTS[code];if(!g){if(code)try{localStorage.removeItem(gk)}catch(e){}return}
  if(gdone().includes(code)){try{localStorage.removeItem(gk)}catch(e){}toast("Esse presente já foi aberto");return}
  if(!hasUser()){giftAsk();return}
  loadAvKits().then(()=>{const sh=shirtOf(g.k);if(!sh)return;
    try{localStorage.setItem("fen:gifts",JSON.stringify([...gdone(),code]));localStorage.removeItem(gk)}catch(e){}
    ownedAdd(g.k);boxAnim(sh,{t:"Camisa do "+sh.n+" · presente do fundador"},{title:"PRESENTE DO FUNDADOR",btn:"ABRIR O PRESENTE",res:"UM PRESENTE PARA VOCÊ!",note:"O fundador da Arena liberou essa camisa para o seu Meu Perfil."})})}
function giftAsk(){document.querySelectorAll(".gate").forEach(x=>x.remove());const m=document.createElement("div");m.className="modal gate";
  m.innerHTML=`<div class="box"><h3>🎁 Presente do fundador</h3><p class="muted" style="margin:0 0 12px">Você ganhou uma camisa! Crie seu usuário primeiro e o presente abre logo depois.</p><div class="row"><button type="button" class="btn y" data-go>Criar meu usuário →</button><button type="button" class="btn" data-x>Depois</button></div></div>`;
  document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-x]"))m.remove();else if(e.target.closest("[data-go]")){m.remove();document.dispatchEvent(new CustomEvent("fen:perfil"))}})}
document.addEventListener("fen:user",()=>setTimeout(checkGift,600));
