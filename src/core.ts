// @ts-nocheck
import __A1__ from "./assets/a0067a760.webp?url";
import __A2__ from "./assets/adc95b0ba.webp?url";
import {ST} from "./state";

export const BODE=__A1__, BODEHEAD=__A2__;
export let CRESTBY={};
export const $=s=>document.querySelector(s);
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();

/* ---------- datas e sementes ---------- */
export function todayKey(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
export function dayNum(){const d=new Date();d.setHours(0,0,0,0);return Math.round((d-new Date(2026,0,1))/864e5)+1}
export function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function rngOf(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export const pick=(r,a)=>a[Math.floor(r()*a.length)];
export function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function sample(r,a,n){return shuffle(r,a).slice(0,n)}

/* ---------- armazenamento ---------- */
export const store={get(k){try{return JSON.parse(localStorage.getItem("fen:"+k))}catch(e){return null}},set(k,v){try{localStorage.setItem("fen:"+k,JSON.stringify(v))}catch(e){}}};

/* ---------- visuais ---------- */
export function flag(iso){if(!iso)return"🏳️";if(iso.startsWith("GB-")){return"\u{1F3F4}"+[..."gb"+iso.slice(3).toLowerCase()].map(c=>String.fromCodePoint(0xE0000+c.charCodeAt(0))).join("")+"\u{E007F}"}return[...iso].map(c=>String.fromCodePoint(0x1F1E6+c.charCodeAt(0)-65)).join("")}
export const natName=i=>ST.NATS[i][0], natFlag=i=>`<i class="flag">${flag(ST.NATS[i][1])}</i>`;
export const initials=n=>n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
export function face(p,cls="",alt){const u=ST.FOTOS[p.id];return u?`<img class="face ${cls}" src="${u}" alt="${esc(alt||p.name)}">`:`<div class="face ava ${cls}" ${p.id>0?`data-pid="${p.id}"`:""} data-cls="${cls}" data-alt="${esc(alt||p.name)}"><span>${esc(initials(p.name))}</span></div>`}
/* fotos dos demais jogadores: pacotes fotos/sN.json, baixados só quando alguém daquele pacote aparece na tela */
export const NSHARD=64,SHARDS={};
export function loadShard(k){if(!SHARDS[k])SHARDS[k]=fetch(`fotos/s${k}.json`).then(r=>r.ok?r.json():{}).then(m=>{Object.assign(ST.FOTOS,m);return m}).catch(()=>({}));return SHARDS[k]}
export let hydT=null;
export function hydrate(){hydT=null;const els=[...document.querySelectorAll(".ava[data-pid]")];if(!els.length)return;
  const need=new Set(els.map(e=>(+e.dataset.pid)%NSHARD));
  need.forEach(k=>loadShard(k).then(()=>{document.querySelectorAll(".ava[data-pid]").forEach(e=>{const u=ST.FOTOS[e.dataset.pid];if(!u)return;
    const img=document.createElement("img");img.className="face "+e.dataset.cls;img.alt=e.dataset.alt;img.src=u;e.replaceWith(img)})}))}
new MutationObserver(()=>{if(!hydT)hydT=setTimeout(hydrate,60)}).observe(document.body,{childList:true,subtree:true});
export function shieldSVG(name){const t=esc(initials(name).slice(0,3));return`<svg class="shield" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2 37 8v14c0 11-8 18-17 22C11 40 3 33 3 22V8z" fill="#1d2a22" stroke="#3b4d40" stroke-width="2"/><text x="20" y="27" text-anchor="middle" font-family="Bebas Neue,Arial Narrow,sans-serif" font-size="14" fill="#97a59b">${t}</text></svg>`}
export function crestImg(id,name,cls="ci"){return id&&ST.ESC[id]?`<img class="crest ${cls}" src="${ST.ESC[id]}" alt="${esc(name||"")}">`:`<span class="${cls}" style="display:inline-block">${shieldSVG(name||"?")}</span>`}
export const clubName=ci=>ST.CLUBS[ci][0];
export const clubCrest=(ci,cls="ci")=>crestImg(ST.CLUBS[ci][1],ST.CLUBS[ci][0],cls);
export const year=p=>Math.floor(p.birth/10000);
export function fmtDate(b){if(!b)return"?";const s=String(b);return`${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`}
export function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
