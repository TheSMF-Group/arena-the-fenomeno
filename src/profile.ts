// @ts-nocheck
import {BODEHEAD, esc, store} from "./core";
import {ST} from "./state";
import {avatarHTML, shirtSrc} from "./avatars";

/* ---------- perfil dos multiplayers: nome e escudo ---------- */
export const pfGet=def=>{const v=store.get("perfil")||{};return{n:(v.n||"").trim()||def||"",c:v.c||null,k:v.k||null,bg:v.bg||null}};
export const pfSet=o=>store.set("perfil",{...(store.get("perfil")||{}),...o});
export const pfSrc=pf=>pf&&pf.c&&ST.ESC[pf.c]?ST.ESC[pf.c]:(pf&&pf.k&&shirtSrc(pf.k))||BODEHEAD;
export const pfImg=(S,m)=>{const pf=S&&S.pf&&S.pf[m];return`<img class="pf-img" src="${pfSrc(pf)}" alt="">`};
export function pfPick(cb){const m=document.createElement("div");m.className="modal";
  const byL=new Map();ST.CRESTS.forEach(c=>{if(!ST.ESC[c.id])return;if(!byL.has(c.liga))byL.set(c.liga,[]);byL.get(c.liga).push(c)});
  const PR=["Brasileirão","Premier League","La Liga","Serie A","Bundesliga","Ligue 1","Liga Portugal","Eredivisie","Liga Argentina","Saudi Pro League","MLS","Liga MX"];
  const ligas=[...byL.keys()].sort((a,b)=>{const ia=PR.indexOf(a),ib=PR.indexOf(b);return(ia<0?99:ia)-(ib<0?99:ib)||byL.get(b).length-byL.get(a).length||a.localeCompare(b)});
  m.innerHTML=`<div class="box pf-pick"><h3>Escolha seu escudo</h3><p class="muted" style="margin:0 0 8px">Toque numa liga e depois no time.</p><div class="pf-ligas"></div><div class="pf-grid"></div><div class="row" style="margin-top:12px"><button class="btn" data-x type="button">Fechar</button></div></div>`;
  document.body.appendChild(m);const lg=m.querySelector(".pf-ligas"),gr=m.querySelector(".pf-grid");let cur=ligas[0];
  const draw=()=>{lg.innerHTML=ligas.map(l=>`<button type="button" data-l="${esc(l)}" aria-pressed="${l===cur}">${esc(l)} <small>${byL.get(l).length}</small></button>`).join("");
    gr.innerHTML=byL.get(cur).slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<button type="button" data-c="${esc(c.id)}" title="${esc(c.name)}"><img src="${ST.ESC[c.id]}" alt=""><span>${esc(c.name)}</span></button>`).join("")};
  m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-x]")){m.remove();return}
    const l=e.target.closest("[data-l]");if(l){cur=l.dataset.l;draw();gr.scrollTop=0;return}
    const c=e.target.closest("[data-c]");if(c){m.remove();cb(c.dataset.c)}});
  draw()}
export function pfMount(app){const box=document.createElement("section");box.className="vl-box pf-box";
  if(hasUser()){const u=pfGet();box.innerHTML=`<h3 class="d">SEU PERFIL</h3><div class="pf-row pf-user">${avatarHTML(u,44)}<b class="pf-uname">${esc(u.n)}</b><button type="button" class="btn" data-edit>Editar no Vestiário</button></div>`;
    app.querySelector(".vl-lobby").prepend(box);box.querySelector("[data-edit]").addEventListener("click",()=>document.dispatchEvent(new CustomEvent("fen:perfil")));return}
  box.innerHTML=`<h3 class="d">SEU PERFIL</h3><div class="pf-row"><button type="button" class="pf-btn" aria-label="Escolher escudo"></button><input class="pf-name" maxlength="12" autocomplete="off" spellcheck="false" placeholder="Seu nome" aria-label="Seu nome"></div><p class="muted vl-help">Escreva seu nome e escolha seu escudo. O adversário vê os dois. Fica salvo para as próximas partidas.</p>`;
  app.querySelector(".vl-lobby").prepend(box);const inp=box.querySelector("input"),btn=box.querySelector("button");
  const paint=()=>{const p=pfGet();inp.value=p.n;btn.innerHTML=`<img src="${pfSrc(p)}" alt=""><span>${p.c?"Trocar escudo":"Escolher escudo"}</span>`};
  inp.addEventListener("input",()=>pfSet({n:inp.value.trim().slice(0,12)}));btn.addEventListener("click",()=>pfPick(c=>{pfSet({c});paint()}));paint()}
/* no mesmo aparelho: os dois escrevem o nome e escolhem o escudo antes de começar */
export function pfLocal(cb){const m=document.createElement("div");m.className="modal";const pfs=[{n:"P1",c:null},{n:"P2",c:null}];
  m.innerHTML=`<div class="box"><h3>Quem vai jogar?</h3><div class="pf-two">${[0,1].map(i=>`<div class="pf-one"><small>${i?"P2":"P1"}</small><div class="pf-row"><button type="button" class="pf-btn" data-i="${i}" aria-label="Escolher escudo"></button><input class="pf-name" data-i="${i}" maxlength="12" autocomplete="off" spellcheck="false" value="${i?"P2":"P1"}" aria-label="Nome do ${i?"P2":"P1"}"></div></div>`).join("")}</div><div class="row" style="margin-top:12px"><button class="btn y" data-go type="button">Começar</button><button class="btn" data-x type="button">Cancelar</button></div></div>`;
  document.body.appendChild(m);const paint=()=>m.querySelectorAll(".pf-btn").forEach(b=>{const p=pfs[+b.dataset.i];b.innerHTML=`<img src="${pfSrc(p)}" alt=""><span>${p.c?"Trocar escudo":"Escolher escudo"}</span>`});paint();
  m.addEventListener("input",e=>{const i=e.target.dataset.i;if(i!=null)pfs[+i].n=e.target.value.trim().slice(0,12)});
  m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-x]")){m.remove();return}
    const b=e.target.closest(".pf-btn");if(b){pfPick(c=>{pfs[+b.dataset.i].c=c;paint()});return}
    if(e.target.closest("[data-go]")){pfs.forEach((p,i)=>{if(!p.n)p.n=i?"P2":"P1"});m.remove();cb(pfs)}})}
/* 19. MALETA (multiplayer): 11 rodadas, uma por posição do 4-3-3. Cinco maletas escondem cinco jogadores daquela posição.
   Quem abre primeiro mostra o que pegou, o outro escolhe às cegas entre as que sobram e o primeiro decide se troca. */

/* ---------- usuário (nome + camisa + cor), histórico e trava do multiplayer ---------- */
export const hasUser=()=>{const v=store.get("perfil")||{};return!!(v.n&&v.k)};
export const userSet=o=>store.set("perfil",{...(store.get("perfil")||{}),...o});
export const whoHTML=(px=34)=>{if(!hasUser())return"";const u=pfGet();return`<span class="who">${avatarHTML(u,px)}<b>${esc(u.n)}</b></span>`};
export const withWho=t=>hasUser()?`${pfGet().n} · ${t}`:t;
/* histórico: cada partida que termina (dia ou infinito) */
export function recordHist(g,res,mode){if(!hasUser())return;const h=store.get("hist")||[];h.push({t:Date.now(),g,w:res&&res.won?1:0,m:mode,s:res&&res.score!=null?res.score:null,l:(res&&res.label)||""});store.set("hist",h.slice(-120))}
export const histGet=()=>store.get("hist")||[];
export function userGate(){document.querySelectorAll(".gate").forEach(m=>m.remove());const m=document.createElement("div");m.className="modal gate";
  m.innerHTML=`<div class="box"><h3>Crie seu usuário primeiro</h3><p class="muted" style="margin:0 0 12px">Para jogar no multiplayer você precisa de um nome e de uma camisa. Leva meio minuto.</p><div class="row"><button type="button" class="btn y" data-go>Criar meu usuário →</button><button type="button" class="btn" data-x>Agora não</button></div></div>`;
  document.body.appendChild(m);m.addEventListener("click",e=>{if(e.target===m||e.target.closest("[data-x]"))m.remove();else if(e.target.closest("[data-go]")){m.remove();document.dispatchEvent(new CustomEvent("fen:perfil"))}})}
export const whoLine=()=>hasUser()?`<div class="who-line">${whoHTML(30)}</div>`:"";
