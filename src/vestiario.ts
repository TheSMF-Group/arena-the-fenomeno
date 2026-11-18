// @ts-nocheck
/* Perfil do jogador: criação (nome + camisa + cor) e Vestiário (escolher a camisa, ver suas partidas). */
import fmbImg from "./assets/fmb-badge.webp?url";
import {$, esc, toast} from "./core";
import {GAMES, KIND} from "./engine";
import {ST} from "./state";
import {cleanup, home} from "./home";
import {CAT, avatarHTML, loadAvKits, shirtOf} from "./avatars";
import {hasUser, histGet, ownedGet, pfGet, userSet} from "./profile";
import {store} from "./core";
import {contaGet, contaModal, contaSair} from "./conta";
import {conquistasHTML, conferir} from "./conquistas";
import {editarMascote, onboarding} from "./onboarding";

export function renderMe(){const b=$("#meBtn");if(!b)return;
  if(hasUser()){const u=pfGet();b.classList.add("has");b.innerHTML=`${avatarHTML(u,26)}<span>Meu Perfil</span>`}
  else{b.classList.remove("has");b.innerHTML=`<span class="plus">+</span><span>Criar usuário</span>`}}
const LIGAS=[["all","Todas"],["br","Brasileirão"],["eu","Champions"],["mine","Minhas"]];
const tabsHTML=cur=>`<div class="vt-tabs" role="group" aria-label="Liga">${LIGAS.map(([k,n])=>`<button type="button" data-l="${k}" aria-pressed="${k===cur}">${n}</button>`).join("")}</div>`;
const inLiga=(c,l)=>l==="all"||c.l===l||(l==="mine"&&ownedGet().includes(c.k));
const FMB=`<aside class="fmbcard"><b class="d">GOSTOU DE ALGUMA CAMISA?</b><span>Use o cupom abaixo!</span><a class="fmb-badge" href="https://www.fmbbr.com.br/plan/form?plan_id=3&coupon=THEFENOMENO&utm_source=arena&utm_medium=partner_badge&utm_campaign=fmb&utm_content=vestiario" target="_blank" rel="noopener" aria-label="Assine uma Mystery Box e ganhe 1 mês grátis, com o cupom THEFENOMENO (abre em nova aba)"><img src="${fmbImg}" alt="Assine uma Mystery Box e ganhe 1 mês grátis. Use o cupom: THEFENOMENO" width="800" height="200" loading="lazy"></a><small>Publicidade · Football Mystery Box Brasil</small></aside>`;

export async function perfilScreen(){ST.VIEW="perfil";ST.PHASE="perfil";cleanup();
  if(location.hash!=="#perfil")history.replaceState(null,"","#perfil");
  $("#app").innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2>${hasUser()?"VESTIÁRIO":"CRIE SEU <b>USUÁRIO</b>"}</h2><span class="spacer"></span></div><div id="pfBody"><p class="muted">Carregando as camisas…</p></div>`;
  $("#app").querySelector(".back").addEventListener("click",home);window.scrollTo(0,0);
  await loadAvKits();if(ST.VIEW!=="perfil")return;
  if(hasUser())vestiario();else onboarding(()=>{renderMe();perfilScreen()},true)}

/* ---------- vestiário: a parede com as camisas (placa = nome do clube) ---------- */
const colHTML=own=>{const n=CAT.length,h=own.length,br=CAT.filter(c=>c.l==="br"),eu=CAT.filter(c=>c.l==="eu"),hb=br.filter(c=>own.includes(c.k)).length,he=eu.filter(c=>own.includes(c.k)).length;
  const bar=(a,b)=>`<div class="cl-bar"><i style="width:${b?a/b*100:0}%"></i></div>`;
  return`<div class="cl-big"><small>COLEÇÃO</small><b class="d">${h}<span>/${n}</span></b></div><div class="cl-bars"><div class="cl-row"><span>Brasileirão</span><em>${hb}/${br.length}</em>${bar(hb,br.length)}</div><div class="cl-row"><span>Champions</span><em>${he}/${eu.length}</em>${bar(he,eu.length)}</div></div>`};
function vestiario(){let lg="all";const body=$("#pfBody");
  const stats=()=>{const h=histGet();const w=h.filter(x=>x.w).length;return{w,l:h.length-w,n:h.length}};
  body.innerHTML=`<section class="vt-top"><div class="vt-me"><div id="vtAv" role="button" tabindex="0" title="Editar seu mascote" aria-label="Editar seu mascote"></div><div><input class="vt-name" maxlength="12" autocomplete="off" spellcheck="false" aria-label="Seu nome"></div></div>
    <a class="fmb-badge vt-fmb" href="https://www.fmbbr.com.br/plan/form?plan_id=3&coupon=THEFENOMENO&utm_source=arena&utm_medium=partner_badge&utm_campaign=fmb&utm_content=vestiario_topo" target="_blank" rel="noopener" aria-label="Assine uma Mystery Box e ganhe 1 mês grátis, com o cupom THEFENOMENO (abre em nova aba)"><img src="${fmbImg}" alt="Assine uma Mystery Box e ganhe 1 mês grátis. Use o cupom: THEFENOMENO" width="800" height="200"></a>
    <div class="vt-stats" id="vtSt"></div></section>
    <section class="vt-conta" id="vtConta"></section>
    <section class="vt-ach" id="vtAch"></section>
    <section class="vt-coll" id="vtColl"></section>
    <div id="vtTabs"></div><section class="games jerseys vt-wall"></section>
    <section class="vt-hist"><h3 class="d">SEUS JOGOS</h3><div id="vtHist"></div></section>
    <div class="row" style="margin:6px 0 24px"><button type="button" class="btn" data-del>Apagar meu usuário</button></div>`;
  const wall=body.querySelector(".vt-wall"),nm=body.querySelector(".vt-name");
  const top=()=>{const u=pfGet();body.querySelector("#vtAv").innerHTML=avatarHTML(u,92);
    const t=stats();body.querySelector("#vtSt").innerHTML=`<div><b>${t.w}</b><small>vitórias</small></div><div><b>${t.l}</b><small>derrotas</small></div>`};
  const draw=()=>{const u=pfGet(),own=ownedGet();body.querySelector("#vtColl").innerHTML=colHTML(own);body.querySelector("#vtTabs").innerHTML=tabsHTML(lg);
    wall.innerHTML=CAT.filter(c=>inLiga(c,lg)).map(c=>{const mine=c.k===u.k,has=own.includes(c.k);
      return`<button type="button" class="jersey nb${mine?" mine":""}${has?"":" lock"}" data-k="${c.k}" aria-label="${esc(c.n)}${mine?" (sua camisa)":""}${has?"":" (bloqueada)"}"><span class="plaque" aria-hidden="true">${esc(c.n)}</span><span class="hang"></span>${has?"":'<span class="tag lk">🔒</span>'}<span class="jsway"><span class="jstage"><img class="jface front" src="${c.f}" alt="Camisa do ${esc(c.n)}"></span></span></button>`}).join("")+FMB;
    fit();wall.querySelectorAll(".jersey").forEach(j=>{const o=j.querySelector(".jsway");
      j.addEventListener("pointermove",e=>{if(e.pointerType==="touch")return;const r=j.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;o.style.transform=`rotateZ(${x*-8}deg) rotateX(${-y*10}deg)`});
      j.addEventListener("pointerleave",()=>{o.style.transform=""})})};
  const fit=()=>{const fc=wall.querySelector(".fmbcard");if(!fc)return;const cols=getComputedStyle(wall).gridTemplateColumns.split(" ").length,n=wall.querySelectorAll(".jersey").length,rem=cols-(n%cols||cols)||cols;fc.style.gridColumn="span "+(rem>=2?rem:cols)};
  if(window.ResizeObserver)new ResizeObserver(fit).observe(wall);
  const hist=()=>{const h=histGet().slice().reverse().slice(0,14);body.querySelector("#vtHist").innerHTML=h.length?`<ul class="vt-h">${h.map(x=>{const g=GAMES[x.g],pts=KIND[x.g]&&KIND[x.g]!=="wl"&&x.s!=null;return`<li><span class="hg">${esc(g?g.name:x.g)}</span><span class="hr ${x.w?"win":"loss"}">${pts?x.s+" pts":x.w?"GANHOU":"PERDEU"}</span><small>${x.m==="inf"?"infinito":"dia"} · ${new Date(x.t).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</small></li>`}).join("")}</ul>`:`<p class="muted">Você ainda não terminou nenhuma partida. Os resultados aparecem aqui.</p>`};
  nm.value=pfGet().n;nm.addEventListener("change",()=>{const v=nm.value.trim().slice(0,12);if(v.length<2){nm.value=pfGet().n;toast("O nome precisa de 2 letras ou mais");return}userSet({n:v});renderMe();toast("Nome salvo")});
  body.addEventListener("click",e=>{if(e.target.closest("#vtAv")){editarMascote(pfGet(),()=>{renderMe();top()});return}
    const t=e.target.closest("[data-l]");if(t){lg=t.dataset.l;draw();return}
    const j=e.target.closest(".jersey");if(j){const k=j.dataset.k;if(!ownedGet().includes(k)){toast("Camisa bloqueada. Ganhe na Mystery Box vencendo modos diários!");return}userSet({k,c:ST.ESC&&ST.ESC[k]?k:null});renderMe();top();draw();toast(`Camisa escolhida: ${shirtOf(k).n}`);return}
    if(e.target.closest("[data-del]")&&confirm("Apagar seu usuário? O histórico de partidas também some.")){localStorage.removeItem("fen:perfil");localStorage.removeItem("fen:hist");renderMe();perfilScreen()}});
  body.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.id==="vtAv"){e.preventDefault();e.target.click()}});
  const conta=()=>{const c=contaGet(),el=body.querySelector("#vtConta");if(!el)return;
    el.innerHTML=c?`<div><b>CONTA</b><span>Conectado como <b>${esc(c.handle)}</b>. Seu progresso está salvo na nuvem.</span></div><button type="button" class="btn" data-sair>Sair</button>`
      :`<div><b>SALVE SEU PROGRESSO</b><span>Crie uma conta para levar camisas, histórico e conquistas para qualquer aparelho.</span></div><div class="row"><button type="button" class="btn y" data-conta="criar">Criar conta</button><button type="button" class="btn" data-conta="entrar">Entrar</button></div>`};
  const onConta=()=>{if(ST.VIEW==="perfil"&&body.isConnected)conta()};document.addEventListener("fen:conta",onConta);
  body.addEventListener("click",e=>{const cb=e.target.closest("[data-conta]");if(cb){contaModal(cb.dataset.conta,()=>{renderMe();perfilScreen()});return}if(e.target.closest("[data-sair]"))contaSair()});
  top();draw();hist();conta();conferir(true);body.querySelector("#vtAch").innerHTML=conquistasHTML()}
