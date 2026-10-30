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
function mount(){if(tab)return;tab=document.createElement("div");tab.id="objTab";document.body.appendChild(tab);
  tab.addEventListener("click",e=>{const r=e.target.closest("[data-claim]");if(r){claim(OBJ.find(o=>o.id===r.dataset.claim));return}
    if(e.target.closest(".obj-pill")){open=!open;render()}});
  document.addEventListener("click",e=>{if(open&&tab&&!e.composedPath().includes(tab)){open=false;render()}})}
export function renderObj(){mount();render()}
function render(){const {st,w,ready,next}=state();
  const line=o=>{const got=!!st[o.id],can=w>=o.n&&!got,pct=Math.min(100,w/o.n*100);
    return`<div class="obj-row ${got?"done":""}"><div class="obj-t"><b>VENÇA MODOS DIÁRIOS ${Math.min(w,o.n)}/${o.n}</b><span>${o.t}</span></div><div class="obj-bar"><i style="width:${pct}%"></i></div>${got?`<em>Resgatada hoje</em>`:can?`<button type="button" class="btn y" data-claim="${o.id}">RESGATAR</button>`:`<small>Faltam ${o.n-w}</small>`}</div>`};
  tab.className=open?"open":"";
  tab.innerHTML=`<div class="obj-panel">${OBJ.map(line).join("")}<p class="obj-note">Só contam as vitórias nos desafios do dia. Você ganha 1 camisa de cada por dia, e elas vão para o seu Vestiário.</p></div>
    <button type="button" class="obj-pill ${ready.length?"ready":""}" aria-expanded="${open}"><span class="obj-ic"><img src="${cubeImg}" alt=""></span><span class="obj-tx">${next?`<b>VENÇA MODOS DIÁRIOS ${Math.min(w,next.n)}/${next.n}</b><small>${next.t}</small>`:`<b>OBJETIVOS CUMPRIDOS</b><small>Volte amanhã</small>`}</span>${ready.length?`<span class="obj-dot" aria-label="${ready.length} recompensa pronta">${ready.length}</span>`:""}</button>`}
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
function boxAnim(sh,o){document.querySelectorAll(".rw").forEach(x=>x.remove());const m=document.createElement("div");m.className="rw";
  m.innerHTML=`<div class="rw-in"><div class="rw-top"><img class="rw-logo" src="${logoImg}" alt="FMB Futebol Mystery Box"><b class="d">SUA MYSTERY BOX CHEGOU!</b></div>
    <div class="rw-stage"><div class="rw-rays"></div>
      <div class="rw-box"><div class="rw-shadow"></div><div class="bx3">
        <div class="f f-bottom"></div><div class="f f-back"></div><div class="f f-left"><div class="band s l"><i>★★★</i></div></div><div class="f f-right"><div class="band s r"><i>★★★</i></div></div>
        <div class="f in-back"></div><div class="f in-left"></div><div class="f in-right"></div><div class="f f-floor"></div>
        <div class="f f-front"><div class="band"><span><em>A 1ª</em> MYSTERY BOX <em>DE FUTEBOL DO BRASIL!</em></span></div></div>
        <div class="lid"><div class="lid-in"></div><div class="lid-top" style="background-image:url(${lidImg})"></div><div class="lid-lip"></div><div class="lid-l"></div><div class="lid-r"></div></div>
      </div></div>
      <div class="rw-shirt"><img src="${sh.f}" alt="Camisa do ${esc(sh.n)}"></div></div>
    <button type="button" class="btn y rw-open">ABRIR A BOX</button>
    <div class="rw-res"><h3 class="d">VOCÊ GANHOU!</h3><p><b>${esc(sh.n)}</b><span>${o.t}</span></p><small>Já está no seu Vestiário.</small><div class="row"><button type="button" class="btn y" data-ves>Ver no Vestiário</button><button type="button" class="btn" data-x>Fechar</button></div></div></div>`;
  document.body.appendChild(m);
  const T=(ms,f)=>setTimeout(()=>{if(m.isConnected)f()},ms);
  m.querySelector(".rw-open").addEventListener("click",e=>{e.currentTarget.remove();m.classList.add("shake");T(1100,()=>{m.classList.remove("shake");m.classList.add("open")});T(1500,()=>m.classList.add("burst"));T(2500,()=>m.classList.add("reveal"))});
  m.addEventListener("click",e=>{if(e.target.closest("[data-ves]")){m.remove();document.dispatchEvent(new CustomEvent("fen:perfil"))}else if(e.target.closest("[data-x]")||(e.target===m&&m.classList.contains("reveal")))m.remove()})}
