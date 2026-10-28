// @ts-nocheck
import {$, BODE, BODEHEAD, dayNum, esc, store, toast, todayKey} from "./core";
import {GAMES, KIND, MODE, clockStop, dayLevel, dayLockKey, dayResult, drawFire, fireHTML, fmtDur, gameRng, isHard, loadStreak, resultKey, share, verdict} from "./engine";
import {ST} from "./state";
import {art} from "./art";

/* ---------- telas ---------- */
export const NEW=["draft","leilao","maleta","reconstruindo","camisa","carreira","questoes","forca","velha","entrosa","piramide","top10","top100"];
export const ORDER=["draft","leilao","maleta","reconstruindo","camisa","carreira","questoes","forca","velha","entrosa","piramide","top10","top100","futgeo","quem","grade","conexoes","bodle","impostor","escudo","bingo","velho"];
export const DIFFS=["normal","hard"],DNAME={normal:"NORMAL",hard:"DIFÍCIL"};
export const DAILY=()=>ORDER.filter(id=>!GAMES[id].multi);
export const allDone=()=>DAILY().every(id=>dayResult(id));
/* placar do dia no topo: desafios do dia ganhos e perdidos (nos de pontos, só a pontuação máxima conta como ganho) */
export function updateToday(){const OD=DAILY(),R=OD.map(id=>dayResult(id)).filter(Boolean),w=R.filter(x=>x.res.won).length,l=R.length-w;
  const el=$("#todayScore");el.innerHTML=`<b class="tw">${w}</b> ${w===1?"ganha":"ganhas"} · <b class="tl">${l}</b> ${l===1?"perdida":"perdidas"}`;
  $("#todayPill").title=`Desafios do dia: ${R.length} de ${OD.length} jogados`}
export function countdown(){const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.floor((m-n)/1000);return[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,"0")).join(":")}
export const bestOf=(id,d)=>(store.get("streak:"+id+":"+d)||{best:0}).best;

/* virada do dia: à meia-noite (ou ao voltar para a aba) tudo recomeça com os desafios novos */
export function checkDay(){if(todayKey()===ST.PLAYDAY)return;ST.PLAYDAY=todayKey();toast("Novo dia! Desafios renovados");if(GAMES[ST.VIEW]&&GAMES[ST.VIEW].multi)return;
  if(ST.VIEW==="home")home();else if(MODE.free)updateToday();else if(ST.PHASE==="play")startGame(ST.VIEW);else openGame(ST.VIEW)}
setInterval(()=>{const c=$("#cd");if(c)c.textContent=countdown();checkDay()},1000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkDay()});
export function modeToggle(prefix){const M=prefix&&MODE.multi;return`<div class="mode" role="group" aria-label="Modo de jogo"><button type="button" data-m="d" aria-pressed="${!MODE.free&&!M}">${prefix?"Desafio do dia":"Dia"}</button><button type="button" data-m="f" aria-pressed="${MODE.free&&!M}">${prefix?"Modo infinito":"Infinito"}</button>${prefix?`<button type="button" data-m="m" aria-pressed="${M}">Multiplayer</button>`:""}</div>`}
export function stampFor(id,d,res){const v=verdict(id,res);
  return`<div class="stamp ${v.cls}"><span class="sv">${esc(v.cls==="score"?v.word:v.word==="GANHOU"?"VENCEU":v.word)}</span><span class="sl">${d==="hard"?"DIFÍCIL":"NORMAL"}</span></div>`}
export function cleanup(){clockStop();if(ST.CLEAN){ST.CLEAN();ST.CLEAN=null}document.querySelectorAll(".modal").forEach(m=>m.remove())}
export function home(){ST.VIEW="home";ST.PHASE="home";ST.PLAYDAY=todayKey();cleanup();
  if(location.hash)history.replaceState(null,"",location.pathname+location.search);
  $("#app").innerHTML=`<section class="hero"><div><div class="kick">BEM-VINDO À ARENA</div><h1>VOCÊ SABE TUDO?<span>PROVE QUE É <b>FENÔMENO.</b></span></h1><p>Arena é onde os jogos do The Fenômeno se encontram: 22 mini games de futebol, um desafio novo todo dia e duelos contra os amigos.</p>
    <div class="daybar">${modeToggle(true)}<span class="pill">Novos desafios em <span id="cd">${countdown()}</span></span></div></div>
    <img class="goat" src="${BODE}" alt="O bode do The Fenômeno com a camisa 10"></section>
    ${!MODE.free&&!MODE.multi&&allDone()?`<div class="sumbar"><div><b>DESAFIOS DE HOJE COMPLETOS</b><div class="muted">Veja vitórias, derrotas e quanto tempo você jogou.</div></div><button class="btn y" type="button" data-a="sum">Resumo do dia →</button></div>`:""}
    <p class="pick">Escolha o seu jogo:</p>
    <section class="games">${ORDER.filter(id=>MODE.multi?GAMES[id].multi:MODE.free?!GAMES[id].multi:(!GAMES[id].multi||GAMES[id].dayToo)).map((id,i)=>{const g=GAMES[id];
      const dr=MODE.free||g.multi?null:dayResult(id),cf=!MODE.multi&&!MODE.free&&g.cardFoot?g.cardFoot():null,played=dr?[[dr.d,dr.res]]:[];
      const first=played[0]?verdict(id,played[0][1]):null;
      const stamp=dr?stampFor(id,dr.d,dr.res):"";
      const best=Math.max(bestOf(id,"normal"),bestOf(id,"hard"));
      const foot=cf?cf:g.multi&&MODE.multi?`<span class="go">JOGAR</span><span class="chip">contra amigo</span>`:g.multi?`<span class="go">JOGAR</span><span class="chip">hoje</span>`:MODE.free?`<span class="go">JOGAR</span><span class="chip rec">${fireHTML(best)} recorde</span>`
        :played.length?`<span class="res ${first.cls}">${first.cls==="score"?esc(first.word)+(KIND[id]?" PTS":" SEGUIDOS"):first.word==="GANHOU"?"VENCEU":first.word}</span><span class="chip">${played[0][1].ms?"⏱ "+fmtDur(played[0][1].ms):"feito"}</span>`
        :`<span class="go">JOGAR</span><span class="chip">hoje</span>`;
      return`<button type="button" class="gcard ${first?(first.cls==="win"?"won":first.cls==="loss"?"lost":"scored"):""}" data-g="${id}">${NEW.includes(id)&&!played.length?'<span class="tag">NOVO</span>':""}<div class="art">${art(id)}${stamp}</div><div class="meta"><span class="d">${g.name}</span><p>${g.desc}</p><div class="play">${foot}</div></div></button>`}).join("")}</section>`;
  $("#app").querySelector(".games").addEventListener("click",e=>{const c=e.target.closest(".gcard");if(c)openGame(c.dataset.g)});
  const sb=$("#app").querySelector(".sumbar [data-a=sum]");sb&&sb.addEventListener("click",daySummary);
  $("#app").querySelector(".mode").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;MODE.multi=b.dataset.m==="m";MODE.free=b.dataset.m==="f";home()});
  updateToday();window.scrollTo(0,0)}
/* tela de escolha: normal ou difícil */
export function openGame(id){if(GAMES[id]&&GAMES[id].open)return GAMES[id].open();MODE.multi=false;ST.VIEW=id;ST.PHASE="choose";ST.PLAYDAY=todayKey();cleanup();
  const g=GAMES[id];if(!g)return home();
  if(location.hash!=="#"+id)history.replaceState(null,"","#"+id);
  const info={normal:["Craques que todo mundo conhece, com todas as dicas.","618 craques"],
    hard:["Jogadores de nicho, de 1970 até hoje, com menos dicas e menos erros.","740 jogadores · menos dicas"]};
  const lv=g.levels||info;
  $("#app").innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2>${g.name.replace(/\?$/,"<b>?</b>")}</h2><span class="spacer"></span>${modeToggle(false)}</div>
    <p class="rules">Escolha o nível. ${MODE.free?"No modo infinito as rodadas não acabam: cada acerto aumenta a sequência e um erro apaga o fogo. Jogue qualquer nível, quantas vezes quiser.":"No desafio do dia você joga um nível só: escolheu, valeu. O outro fica travado até amanhã."}</p>
    <div class="choose">${DIFFS.map(d=>{const dl=MODE.free?null:dayLevel(id),locked=dl&&dl!==d;const res=!MODE.free&&!locked&&store.get(resultKey(id,null,d));const v=res?verdict(id,res):null;
      return`<button type="button" class="lvl ${d}${locked?" locked":""}" data-d="${d}" ${locked?`aria-disabled="true"`:""}><span class="lv-top"><span class="d">${DNAME[d]}</span>${d==="hard"?`<span class="skull">☠</span>`:""}</span><p>${lv[d][0]}</p><span class="lv-foot"><small>${lv[d][1]}</small>${MODE.free?`<span class="rec">${fireHTML(bestOf(id,d))} recorde</span>`:locked?`<span class="lock-note">🔒 hoje você jogou no ${DNAME[dl].toLowerCase()}</span>`:v?`<span class="verdict ${v.cls}">${v.cls==="score"?esc(v.word)+" "+v.detail.toUpperCase():v.word}</span>`:dl===d?`<span class="go">CONTINUAR →</span>`:`<span class="go">JOGAR →</span>`}</span></button>`}).join("")}</div>`;
  $("#app").querySelector(".back").addEventListener("click",home);
  $("#app").querySelector(".stagehead .mode").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;MODE.free=b.dataset.m==="f";openGame(id)});
  $("#app").querySelector(".choose").addEventListener("click",e=>{const b=e.target.closest(".lvl");if(!b)return;
    if(b.classList.contains("locked")){toast(`Hoje você jogou no ${DNAME[dayLevel(id)].toLowerCase()}. Perdeu, perdeu! Amanhã tem mais.`);return}
    ST.DIFF=b.dataset.d;startGame(id)});
  window.scrollTo(0,0)}
export function startGame(id){ST.VIEW=id;ST.PHASE="play";ST.PLAYDAY=todayKey();cleanup();ST.CURGAME=id;loadStreak();
  const g=GAMES[id];
  if(!MODE.free&&!g.multi){const dl=dayLevel(id);if(dl&&dl!==ST.DIFF)ST.DIFF=dl}
  $("#app").innerHTML=`<div class="stagehead"><button class="back" type="button">← Níveis</button><h2>${g.name.replace(/\?$/,"<b>?</b>")}</h2><span class="lvbadge ${ST.DIFF}">${DNAME[ST.DIFF]}</span><span class="spacer"></span>${MODE.free?`<div id="fireBox" class="firebox"></div>`:modeToggle(false)}</div><p class="rules">${g.rules}${isHard()?` <b class="hardnote">Difícil: ${g.hard}</b>`:""}</p><div class="stage"></div>`;
  $("#app").querySelector(".back").addEventListener("click",()=>openGame(id));
  const mt=$("#app").querySelector(".stagehead .mode");mt&&mt.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;MODE.free=b.dataset.m==="f";startGame(id)});
  drawFire(false);
  const st=$("#app").querySelector(".stage");const prev=!MODE.free&&store.get(resultKey(id));
  if(prev){st.innerHTML=`<div class="result"><img src="${BODEHEAD}" alt=""><div>${(v=>`<span class="verdict ${v.cls}">${v.cls==="score"?v.word+" "+v.detail.toUpperCase():v.word}</span>`)(verdict(id,prev))}<div class="d">DESAFIO DE HOJE FEITO</div><p>${esc(prev.label)} Volte amanhã para o próximo, ou jogue no modo infinito.</p><div class="row"><button class="btn y" data-a="share">Copiar resultado</button><button class="btn" data-a="free">Jogar no modo infinito</button></div></div></div>`;
    st.addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;if(a==="share")share(prev.share);if(a==="free"){MODE.free=true;startGame(id)}});}
  else{if(!MODE.free&&!g.multi){if(!store.get(dayLockKey(id)))store.set(dayLockKey(id),ST.DIFF);ST.CLOCK={id,day:ST.PLAYDAY,t0:document.hidden?0:Date.now()}}g.start(st,gameRng(id))}
  window.scrollTo(0,0)}
export function daySummary(){ST.VIEW="resumo";ST.PHASE="home";cleanup();
  if(location.hash!=="#resumo")history.replaceState(null,"","#resumo");
  const rows=DAILY().map(id=>({id,g:GAMES[id],r:dayResult(id)}));
  const done=rows.filter(x=>x.r),win=done.filter(x=>x.r.res.won).length,loss=done.filter(x=>!x.r.res.won&&KIND[x.id]==="wl").length,part=done.length-win-loss;
  const tot=done.reduce((s,x)=>s+(x.r.res.ms||0),0),byLv={normal:0,hard:0},nLv={normal:0,hard:0};done.forEach(x=>{byLv[x.r.d]+=x.r.res.ms||0;nLv[x.r.d]++});
  const tag=x=>{const v=verdict(x.id,x.r.res);return{cls:v.cls,txt:v.cls==="score"?`${v.word} ${v.detail}`:v.word==="GANHOU"?"VENCEU":"PERDEU"}};
  $("#app").innerHTML=`<div class="sumwrap"><div class="stagehead"><button class="back" type="button">← Jogos</button><h2>RESUMO DO <b>DIA #${dayNum()}</b></h2></div>
    <p class="rules">${done.length===rows.length?"Você fechou todos os desafios de hoje.":`Faltam ${rows.length-done.length} desafio(s) de hoje.`} O tempo conta só enquanto a partida está aberta na tela.</p>
    <div class="sum-kpis"><div class="g"><small>Vitórias</small><b>${win}</b></div><div class="r"><small>Derrotas</small><b>${loss}</b></div><div class="y"><small>Por pontos</small><b>${part}</b></div><div><small>Tempo total</small><b>${fmtDur(tot)}</b></div><div><small>No normal (${nLv.normal})</small><b>${fmtDur(byLv.normal)}</b></div><div><small>No difícil (${nLv.hard})</small><b>${fmtDur(byLv.hard)}</b></div></div>
    <div class="sum-list">${rows.map(x=>{if(!x.r)return`<button type="button" class="sum-row" data-g="${x.id}"><span class="n">${x.g.name}</span><span class="lv">—</span><span class="v muted">não jogado</span><span class="t">JOGAR →</span></button>`;const t=tag(x);
      return`<div class="sum-row ${t.cls}"><span class="n">${x.g.name}</span><span class="lv">${DNAME[x.r.d]}</span><span class="v">${esc(t.txt)}</span><span class="t">⏱ ${fmtDur(x.r.res.ms)}</span></div>`}).join("")}</div>
    <div class="row" style="margin-top:18px"><button class="btn y" type="button" data-a="share">Copiar resumo</button><button class="btn" type="button" data-a="home">Voltar aos jogos</button></div></div>`;
  const app=$("#app");app.querySelector(".back").addEventListener("click",home);
  app.querySelector(".sumwrap").addEventListener("click",e=>{const b=e.target.closest("[data-a],[data-g]");if(!b)return;
    if(b.dataset.g){MODE.free=false;openGame(b.dataset.g);return}
    if(b.dataset.a==="home")home();
    if(b.dataset.a==="share")share(`THE FENÔMENO · RESUMO DO DIA #${dayNum()}\n✅ ${win} vitórias · ❌ ${loss} derrotas · 🎯 ${part} por pontos\n⏱ ${fmtDur(tot)} jogando\n`+rows.filter(x=>x.r).map(x=>{const t=tag(x);return`${t.cls==="win"?"🟩":t.cls==="loss"?"🟥":"🟨"} ${x.g.name} (${DNAME[x.r.d].toLowerCase()}) ${t.cls==="score"?t.txt:""} ${fmtDur(x.r.res.ms)}`.replace(/\s+/g," ").trim()}).join("\n"))});
  window.scrollTo(0,0)}
