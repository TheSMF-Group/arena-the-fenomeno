// @ts-nocheck
/* Objetivos do dia e Mystery Box da FMB: 3 vitórias no diário = camisa do Brasileirão, 5 = camisa da Champions (1 de cada por dia). */
import {$, esc, toast} from "./core";
import {DAILY} from "./home";
import {dayResult} from "./engine";
import {CAT, loadAvKits, shirtOf} from "./avatars";
import {hasUser, ownedAdd, ownedGet, rewGet, rewSet, userGate} from "./profile";

const OBJ=[{id:"br",n:3,t:"Camisa do Brasileirão",pool:"br"},{id:"eu",n:5,t:"Camisa da Champions",pool:"eu"}];
export const winsToday=()=>DAILY().filter(id=>{const r=dayResult(id);return r&&r.res&&r.res.won}).length;
const LOGO=`<svg class="fmb-cube" viewBox="0 0 200 190" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M100 14 L160 46 L100 78 L40 46 Z"/><path d="M40 46 L100 78 L100 150 L40 118 Z"/><path d="M100 78 L160 46 L160 118 L100 150 Z"/></g><text x="100" y="62" text-anchor="middle" font-size="40" font-weight="900" fill="#fff" font-family="Arial Black,Arial,sans-serif">?</text><path d="M52 92 L88 108 L88 130 L52 114 Z" fill="#2fa44f"/><path d="M70 100 L83 111 L70 120 L57 110 Z" fill="#ffd21f"/><text x="130" y="114" text-anchor="middle" font-size="28" font-weight="900" font-style="italic" fill="#fff" font-family="Arial Black,Arial,sans-serif" transform="rotate(-20 130 114)">FMB</text></svg>`;
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
    <button type="button" class="obj-pill ${ready.length?"ready":""}" aria-expanded="${open}"><span class="obj-ic">${LOGO}</span><span class="obj-tx">${next?`<b>VENÇA MODOS DIÁRIOS ${Math.min(w,next.n)}/${next.n}</b><small>${next.t}</small>`:`<b>OBJETIVOS CUMPRIDOS</b><small>Volte amanhã</small>`}</span>${ready.length?`<span class="obj-dot" aria-label="${ready.length} recompensa pronta">${ready.length}</span>`:""}</button>`}
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
  const cf=Array.from({length:34},(_,i)=>{const a=Math.random()*Math.PI*2,d=140+Math.random()*190;return`<i style="--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-90}px;--r:${Math.random()*720-360}deg;--c:${["#ffd21f","#a855f7","#fff","#22c55e","#38bdf8"][i%5]};--t:${(Math.random()*.25).toFixed(2)}s"></i>`}).join("");
  m.innerHTML=`<div class="rw-in"><div class="rw-top"><small>FOOTBALL MYSTERY BOX BRASIL</small><b class="d">SUA MYSTERY BOX CHEGOU!</b></div>
    <div class="rw-stage"><div class="rw-rays"></div>
      <div class="rw-box"><div class="rw-back"></div><div class="rw-shirt"><img src="${sh.f}" alt="Camisa do ${esc(sh.n)}"></div>
        <div class="rw-front"><div class="rw-logo">${LOGO}</div><span>FOOTBALL MYSTERY BOX</span></div>
        <div class="rw-lid"><div class="rw-paper"></div><div class="rw-lidtop">${LOGO}</div></div></div>
      <div class="rw-cf">${cf}</div></div>
    <button type="button" class="btn y rw-open">ABRIR A BOX</button>
    <div class="rw-res"><h3 class="d">VOCÊ GANHOU!</h3><p><b>${esc(sh.n)}</b><span>${o.t}</span></p><small>Já está no seu Vestiário.</small><div class="row"><button type="button" class="btn y" data-ves>Ver no Vestiário</button><button type="button" class="btn" data-x>Fechar</button></div></div></div>`;
  document.body.appendChild(m);
  const T=(ms,f)=>setTimeout(()=>{if(m.isConnected)f()},ms);
  m.querySelector(".rw-open").addEventListener("click",e=>{e.currentTarget.remove();m.classList.add("shake");T(1100,()=>{m.classList.remove("shake");m.classList.add("open")});T(1500,()=>m.classList.add("burst"));T(2500,()=>m.classList.add("reveal"))});
  m.addEventListener("click",e=>{if(e.target.closest("[data-ves]")){m.remove();document.dispatchEvent(new CustomEvent("fen:perfil"))}else if(e.target.closest("[data-x]")||(e.target===m&&m.classList.contains("reveal")))m.remove()})}
