// @ts-nocheck
import {ST} from "../state";
import {$, BODEHEAD, clubName, dayNum, esc, face, hash, rngOf, shuffle, store, toast, year} from "../core";
import {makeSearch} from "../search";
import {GAMES, share} from "../engine";
import {VL_ART, vlCode} from "./velha";
import {mqttRoom} from "../mqtt";
import {pfGet, pfImg, pfLocal, pfMount} from "../profile";
import {cleanup, home} from "../home";

/* TOP 100: cada tema é um ranking de 100 jogadores (public/top100.json).
   Chutou um nome da lista? A posição dele vale os pontos: o 1º vale 1 e o 100º vale 100. Fora da lista = 0. */
let TH=null;
export const loadT100=()=>TH||(TH=fetch("top100.json?v=1").then(r=>r.json()).then(d=>d.themes));
const pl=id=>ST.P.find(p=>p.id===id);
const sub=p=>[year(p)||"",p.club!=null?clubName(p.club):""].filter(Boolean).join(" · ");
const ptsOf=(th,id)=>{const i=th.ids.indexOf(id);return i<0?0:i+1};
const fmtV=v=>v>=1?`€${String(v).replace(".",",")} mi`:`€${Math.round(v*1000)} mil`;
const dailyTheme=ths=>{const order=shuffle(rngOf(hash("top100")),ths.map((_,i)=>i));return ths[order[(dayNum()-1)%order.length]]};
const RULES="Cada tema é um ranking de 100 jogadores, por exemplo os maiores valores de mercado do mundo. Você chuta um nome e a posição dele na lista vale os pontos: o 100º colocado vale 100 pontos, o 1º vale só 1 e quem não está na lista vale 0. Ou seja, quanto mais fundo na lista você achar, mais pontos faz. No desafio do dia são 5 chutes no mesmo tema (máximo de 500 pontos), uma vez por dia. No multiplayer são 3 temas, 3 chutes de cada um por tema, sem repetir jogador, e quem somar mais pontos vence.";
const confetti=()=>Array.from({length:36},(_,i)=>`<i class="confetti-piece" style="left:${(Math.random()*100).toFixed(1)}%;width:${6+Math.floor(Math.random()*6)}px;height:${10+Math.floor(Math.random()*8)}px;background:${["#ffd400","#22c55e","#fff","#f97316"][i%4]};animation-duration:${(1.8+Math.random()*1.6).toFixed(2)}s;animation-delay:${(Math.random()*.8).toFixed(2)}s"></i>`).join("");
/* acertou exatamente o 100º da lista */
function boom(){const el=document.createElement("div");el.className="t1-boom";
  el.innerHTML=`${confetti()}<div class="t1-boom-c"><img src="${BODEHEAD}" alt=""><b>TOP 100!</b><small>100 PONTOS</small></div>`;
  document.body.appendChild(el);el.onclick=()=>el.remove();setTimeout(()=>el.remove(),3200)}
const listH=(th,marks)=>`<ol class="t1-list">${th.ids.map((id,i)=>{const p=pl(id),m=marks[id];
  return`<li class="${m?"hit "+m.c:""}"><b class="t1-r">${i+1}</b><span class="mini">${p?face(p):""}</span><span class="t1-n">${esc(p?p.name:"?")}${m?` <i class="t1-by">${esc(m.by)}</i>`:""}</span><small>${fmtV(th.v[i])}</small><em>${i+1} pts</em></li>`}).join("")}</ol>`;
const pickRow=(th,x,n)=>{const p=pl(x.id);return`<div class="t1-pick ${x.pts===100?"top":x.pts?"in":"out"}"><i>${n}</i><span class="mini">${p?face(p):""}</span><b>${esc(p?p.name:"Sem chute")}</b><span class="t1-res">${!x.id?"passou":x.pts?`${x.pts}º da lista`:"fora do top 100"}</span><strong>${x.pts} pts</strong></div>`};

/* ---------- desafio do dia ---------- */
async function daily(){ST.VIEW="top100";ST.PHASE="play";cleanup();if(location.hash!=="#top100")history.replaceState(null,"","#top100");
  const app=$("#app");app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Top 100</button><h2><b>TOP 100</b></h2><span class="lvbadge normal">DIA ${dayNum()}</span></div><div class="stage"><div class="fg-load"><img src="${BODEHEAD}" alt=""><b>MONTANDO O RANKING…</b></div></div>`;
  app.querySelector(".back").addEventListener("click",()=>GAMES.top100.open());
  const ths=await loadT100(),th=dailyTheme(ths),key="top100:"+dayNum(),rec=store.get(key)||{p:[]},st=app.querySelector(".stage");
  const total=()=>rec.p.reduce((a,x)=>a+x.pts,0);
  const draw=()=>{const done=rec.p.length>=5;
    st.innerHTML=`<div class="t1-theme"><small>Tema de hoje</small><h3>${esc(th.t)}</h3><p class="muted">${esc(th.s)}</p></div>
      <div class="t1-score"><div><small>Pontos</small><b>${total()}</b><span> / 500</span></div><div><small>${done?"Fim do desafio":"Chute"}</small><b>${done?"5/5":rec.p.length+1+"/5"}</b></div></div>
      <div class="t1-picks">${[0,1,2,3,4].map(i=>rec.p[i]?pickRow(th,rec.p[i],i+1):`<div class="t1-pick empty"><i>${i+1}</i><b>${i===rec.p.length?"Seu próximo chute":"—"}</b></div>`).join("")}</div>
      ${done?"":`<div class="t1-srch"></div><p class="muted">O 100º da lista vale 100 pontos e o 1º vale 1. Chute fundo na lista, mas quem está fora dela não pontua.</p>`}
      ${done?`<div class="le-act"><p><b>Você fez ${total()} de 500 pontos.</b> ${total()>=400?"Que leitura de mercado!":total()>=250?"Bom jogo, volte amanhã para outro tema.":"Amanhã tem outro tema."}</p><div class="row"><button class="btn y" type="button" data-a="share">Copiar resultado</button></div></div>
        <h4 class="rc-h">O ranking completo</h4>${listH(th,Object.fromEntries(rec.p.filter(x=>x.id).map(x=>[x.id,{c:"me",by:"você"}])))}`:""}`;
    const host=st.querySelector(".t1-srch");
    if(host){const inp=makeSearch(host,{placeholder:"Chute um jogador…",sub,onPick:p=>{if(rec.p.some(x=>x.id===p.id)){toast("Você já chutou esse jogador");return}
        const pts=ptsOf(th,p.id);rec.p.push({id:p.id,pts});store.set(key,rec);draw();if(pts===100)boom()}});inp.focus()}
    const sh=st.querySelector("[data-a=share]");if(sh)sh.onclick=()=>share(`🐐 THE FENÔMENO · TOP 100 #${dayNum()}\n${th.t}\n${rec.p.map(x=>x.pts===100?"🟣":x.pts>=70?"🟩":x.pts>=30?"🟨":x.pts?"🟧":"⬛").join("")} ${total()}/500`)};
  draw();window.scrollTo(0,0)}

/* ---------- multiplayer ---------- */
export async function t100Play({mode,code,pfs}){ST.VIEW="top100";ST.PHASE="play";cleanup();
  const app=$("#app");let alive=true,timer=null,nr=null,offPeers=null,me=null,S=null,pend=null;const seen=new Set(),T=30000;
  ST.CLEAN=()=>{alive=false;clearInterval(timer);offPeers&&offPeers();nr&&nr.leave().catch(()=>{})};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Sair</button><h2><b>TOP 100</b></h2><span class="spacer"></span></div><div class="stage dr-stage"><div class="fg-load"><img src="${BODEHEAD}" alt=""><b>${mode==="join"?"PROCURANDO A PARTIDA…":"MONTANDO OS RANKINGS…"}</b></div></div>`;
  const st=app.querySelector(".stage"),ths=await Promise.all([loadT100(),window.__pass||0]).then(a=>a[0]);if(!alive)return;
  const byId=id=>ths.find(t=>t.id===id);
  app.querySelector(".back").addEventListener("click",()=>{if(S&&S.ph!=="over"&&mode!=="local"&&!confirm("Sair da partida?"))return;GAMES.top100.open()});
  const fail=(msg,local)=>{if(!alive)return;st.innerHTML=`<div class="vl-box vl-msg"><h3 class="d">OPS</h3><p>${msg}</p><div class="row">${local?`<button class="btn y" type="button" data-a="local">Jogar no mesmo aparelho</button>`:""}<button class="btn" type="button" data-a="back">Voltar</button></div></div>`;
    st.querySelector("[data-a=back]").onclick=()=>GAMES.top100.open();const l=st.querySelector("[data-a=local]");l&&(l.onclick=()=>t100Play({mode:"local"}))};
  const keyOf=p=>p.by||p.peer,ok=s=>s&&typeof s==="object"&&s.kind==="top100"&&Array.isArray(s.th)&&Array.isArray(s.g)&&typeof s.seq==="number";
  const mk=base=>{const g=(base.game||0)+1;return{...base,kind:"top100",th:shuffle(Math.random,ths.map(t=>t.id)).slice(0,3),g:[[],[],[]],round:0,ph:"play",f:g%2?"X":"O",turn:g%2?"X":"O",sx:0,so:0,over:null,game:g,dl:base.O?Date.now()+T:0}};
  const fOf=(s,r)=>((r+s.game)%2===1)?"X":"O",other=m=>m==="X"?"O":"X";
  const push=s=>{S=s;render();if(nr)nr.presence({st:s}).catch(()=>{})};
  const mySeat=()=>mode==="local"?(S.ph!=="over"?S.turn:null):(S.X===me?"X":S.O===me?"O":null);
  if(mode!=="local"){
    const room=window.claude?await claude.use("room").catch(()=>null):await mqttRoom().catch(()=>null);if(!alive)return;
    if(!room)return fail(window.claude?"O multiplayer não está disponível aqui. Ele funciona dentro do claude.ai, para quem está logado e tem acesso a esta página.":"Não deu para conectar no servidor da partida. Confira a internet e tente de novo.",true);
    code=code||vlCode();
    try{nr=await room.join("top100-"+code.toLowerCase())}catch(e){return fail("Não deu para abrir a sala. Tente de novo em instantes.",true)}
    if(!alive){nr.leave().catch(()=>{});return}
    const meP=()=>nr.peers().find(p=>p.sameTab);
    offPeers=nr.onPeers(ch=>{if(!me){const m=meP();if(m)me=keyOf(m)}
      let best=null;for(const p of ch.peers){const s=p.presence&&p.presence.st;if(ok(s)&&s.code===code&&(!best||s.seq>best.seq))best=s}
      if(best&&(!S||best.seq>S.seq)){S=best;render()}else if(S)renderAway()});
    for(let i=0;i<50&&!me&&alive;i++){const m=meP();if(m)me=keyOf(m);else await new Promise(r=>setTimeout(r,100))}
    if(!alive)return;if(!me)return fail("Não deu para conectar na sala.",true);
    if(mode==="host")push(mk({code,seq:1,X:me,O:null,pf:{X:pfGet("P1")}}));
    else{const t0=Date.now();while(alive&&!S&&Date.now()-t0<9000)await new Promise(r=>setTimeout(r,200));
      if(!alive)return;if(!S)return fail(`Não achei a partida <b>${esc(code)}</b>. Confira o código e peça para quem criou deixar a tela da partida aberta.`);
      if(!S.O&&S.X!==me)push({...S,seq:S.seq+1,O:me,pf:{...S.pf,O:pfGet("P2")},dl:Date.now()+T});else render()}
  }else{code="LOCAL";push(mk({code,seq:1,X:"x",O:"o",pf:pfs?{X:pfs[0],O:pfs[1]}:undefined}))}
  timer=setInterval(tick,250);
  function tick(){if(!S||!S.O||S.ph==="over")return;const left=S.dl-Date.now(),el=st.querySelector(".vl-clock");
    if(el){const s=Math.max(0,Math.ceil(left/1000));el.textContent=`${s}s`;el.classList.toggle("low",s<=8)}
    const mine=S.ph==="play"?mySeat()===S.turn:(mode==="local"||mySeat()==="X");
    if(left<=0&&(mine||left<-4000)&&!pend){pend=1;setTimeout(()=>pend=null,800);if(S.ph==="play")guess(0);else next()}}
  function guess(id){if(!S||S.ph!=="play")return;const m=S.turn,r=S.round,th=byId(S.th[r]);
    if(id&&S.g[r].some(x=>x.id===id)){toast("Esse jogador já foi chutado nesta rodada");return}
    const s={...S,seq:S.seq+1,g:S.g.map(a=>a.slice())},pts=id?ptsOf(th,id):0;s.g[r].push({m,id,pts});
    if(m==="X")s.sx+=pts;else s.so+=pts;
    if(s.g[r].length>=6){s.ph="show";s.dl=Date.now()+12000}else{s.turn=other(m);s.dl=Date.now()+T}
    push(s)}
  function next(){if(!S||S.ph!=="show")return;const s={...S,seq:S.seq+1};
    if(s.round>=2){s.ph="over";s.dl=0;s.over=s.sx>s.so?"X":s.so>s.sx?"O":"D"}else{s.round++;s.ph="play";s.turn=fOf(s,s.round);s.dl=Date.now()+T}
    push(s)}
  async function names(){const ids=[S.X,S.O].filter(k=>k&&k.startsWith("u_"));let ps={};
    try{const u=await claude.use("user");if(u&&ids.length)ps=await u.profiles(ids)}catch(e){}
    return k=>{const seat=S&&k===S.X?"X":S&&k===S.O?"O":null,pn=seat&&S.pf&&S.pf[seat]&&S.pf[seat].n;return pn||(mode==="local"?(k==="x"?"P1":"P2"):k===me?"Você":(ps[k]&&ps[k].name)||"Adversário")}}
  function renderAway(){const el=st.querySelector(".vl-away");if(!el||mode==="local"||!nr)return;const here=new Set(nr.peers().map(keyOf));
    const opp=mySeat()==="X"?S.O:S.X;el.hidden=!(opp&&!here.has(opp)&&S.ph!=="over")}
  async function render(){if(!alive||!S)return;const nm=await names();if(!alive)return;const seat=mySeat();
    if(!S.O){st.innerHTML=`<div class="vl-box vl-wait"><small>Código da partida</small><div class="vl-bigcode">${esc(S.code)}</div><p>Top 100 · 3 temas · 3 chutes cada</p>
        <div class="row" style="justify-content:center"><button class="btn y" type="button" data-a="copy">Copiar código</button><button class="btn" type="button" data-a="invite">Copiar convite para o WhatsApp</button></div><p class="muted">Esperando o adversário entrar… deixe esta tela aberta.</p></div>`;
      st.querySelector("[data-a=copy]").onclick=()=>share(S.code);
      st.querySelector("[data-a=invite]").onclick=()=>share(`🐐⚽ Bora um TOP 100 no The Fenômeno? São 3 rankings de 100 jogadores, 3 chutes cada: quanto mais fundo na lista, mais pontos. Quem somar mais vence.\nCódigo da partida: ${S.code}\nAbra ${/vercel\.app$/.test(location.hostname)?location.origin:VL_ART} → Multiplayer → Top 100 → Entrar em jogo`);return}
    const nX=nm(S.X),nO=nm(S.O),th=byId(S.th[S.round]),r=S.round,turnMe=seat===S.turn&&S.ph==="play",ms=m=>m==="X"?"✕":"◯",nmOf=m=>m==="X"?nX:nO;
    const chip=m=>`<div class="vl-p ${m.toLowerCase()} ${S.ph==="play"&&S.turn===m?"on":""}"><span class="vl-mk">${ms(m)}</span>${pfImg(S,m)}<span class="vl-nm">${esc(nmOf(m))}</span><b>${m==="X"?S.sx:S.so}</b></div>`;
    let h=`<div class="vl-head">${chip("X")}<div class="vl-mid"><small>TOP 100 · ${S.ph==="over"?"FIM":"TEMA "+(r+1)+"/3"}</small><b>${S.ph==="over"?"Placar":S.ph==="show"?"Fim do tema":"Chutes"}</b><small>${S.code==="LOCAL"?"no mesmo aparelho":"código "+esc(S.code)}</small></div>${chip("O")}</div><p class="vl-away hardnote" hidden>O adversário saiu da página. Se não voltar, a vez passa sozinha.</p>`;
    const rows=(rr)=>rr.map((x,i)=>`<div class="t1-pick ${x.pts===100?"top":x.pts?"in":"out"}"><i>${ms(x.m)}</i><span class="mini">${x.id?face(pl(x.id)):""}</span><b>${esc(x.id?pl(x.id).name:"Sem chute")}</b><span class="t1-res">${!x.id?"passou":x.pts?`${x.pts}º da lista`:"fora do top 100"}</span><strong>${x.pts} pts</strong></div>`).join("");
    const marks=rr=>Object.fromEntries(rr.filter(x=>x.id).map(x=>[x.id,{c:x.m==="X"?"x":"o",by:ms(x.m)+" "+nmOf(x.m)}]));
    if(S.ph==="over"){const w=S.over,rounds=[0,1,2].map(i=>{const t=byId(S.th[i]),a=S.g[i].filter(x=>x.m==="X").reduce((q,x)=>q+x.pts,0),b=S.g[i].filter(x=>x.m==="O").reduce((q,x)=>q+x.pts,0);return`<div class="t1-rrow"><span>${esc(t.t)}</span><b>${a} x ${b}</b></div>`}).join("");
      h+=`<div class="vl-status mine"><span><b>${w==="D"?"Empate!":(mode==="local"||seat===w)&&mode!=="local"?"Você venceu!":esc(nmOf(w))+" venceu!"}</b> ${S.sx} x ${S.so}</span></div><div class="t1-rounds">${rounds}</div>
        <div class="row"><button class="btn y" type="button" data-a="again">Revanche</button><button class="btn" type="button" data-a="share">Copiar resultado</button></div>`}
    else{h+=`<div class="t1-theme"><small>Tema ${r+1} de 3</small><h3>${esc(th.t)}</h3><p class="muted">${esc(th.s)}</p></div>`;
      if(S.ph==="play")h+=`<div class="vl-status ${turnMe?"mine":""}"><span>${turnMe?`<b>${mode==="local"?esc(nmOf(S.turn))+", seu":"Seu"} chute ${Math.floor(S.g[r].length/2)+1} de 3.</b> Quanto mais fundo na lista, mais pontos.`:`Vez de ${esc(nmOf(S.turn))}…`}</span><span class="pill vl-clock"></span></div>${turnMe?`<div class="t1-srch"></div>`:""}`;
      h+=`<div class="t1-picks">${rows(S.g[r])||`<p class="muted">Nenhum chute ainda.</p>`}</div>`;
      if(S.ph==="show")h+=`<div class="le-act"><p><b>Tema encerrado.</b> ${ms("X")} ${esc(nX)} ${S.g[r].filter(x=>x.m==="X").reduce((q,x)=>q+x.pts,0)} pts · ${ms("O")} ${esc(nO)} ${S.g[r].filter(x=>x.m==="O").reduce((q,x)=>q+x.pts,0)} pts</p><div class="row"><button class="btn y" type="button" data-a="next">${r>=2?"Ver o placar":"Próximo tema"}</button><span class="pill vl-clock"></span></div></div><details open><summary class="rc-h">O ranking completo</summary>${listH(th,marks(S.g[r]))}</details>`}
    st.innerHTML=h;
    const host=st.querySelector(".t1-srch");if(host){const inp=makeSearch(host,{placeholder:"Chute um jogador…",sub,onPick:p=>guess(p.id)});inp.focus()}
    S.g.forEach((rr,ri)=>rr.forEach((x,i)=>{const k=S.code+":"+S.game+":"+ri+":"+i;if(x.pts===100&&!seen.has(k)){seen.add(k);boom()}else seen.add(k)}));
    renderAway()}
  st.addEventListener("click",e=>{const b=e.target.closest("button[data-a]");if(!b||!S)return;const a=b.dataset.a;
    if(a==="next")next();
    if(a==="again")push(mk({...S,seq:S.seq+1}));
    if(a==="share")share(`🐐 THE FENÔMENO · TOP 100\n✕ ${S.sx} x ${S.so} ◯\n${S.th.map(id=>byId(id).t).join("\n")}`)})}

GAMES.top100={name:"TOP 100",multi:true,hard:"sem nível difícil",desc:"Rankings de 100 jogadores. Chute um nome: quanto mais fundo na lista, mais pontos. Desafio do dia ou duelo multiplayer.",rules:RULES,
open(){ST.VIEW="top100";ST.PHASE="choose";cleanup();if(location.hash!=="#top100")history.replaceState(null,"","#top100");
  const app=$("#app"),rec=store.get("top100:"+dayNum()),tot=rec?rec.p.reduce((a,x)=>a+x.pts,0):0,done=rec&&rec.p.length>=5;
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2><b>TOP 100</b></h2><span class="lvbadge normal">DIA + MULTIPLAYER</span></div>
    <p class="rules">${RULES}</p>
    <div class="vl-lobby">
      <section class="vl-box" style="grid-column:1/-1"><h3 class="d">DESAFIO DO DIA</h3><p class="muted">5 chutes em um tema, máximo de 500 pontos. ${done?`Hoje você fez <b>${tot}</b>. Volte amanhã para outro tema.`:rec&&rec.p.length?`Você está com ${tot} pontos em ${rec.p.length} de 5 chutes.`:"Um tema novo todo dia."}</p>
        <button class="btn y vl-go" type="button" data-a="daily">${done?"Ver o resultado":rec&&rec.p.length?"Continuar o desafio":"Jogar o desafio do dia"}</button></section>
      <section class="vl-box"><h3 class="d">CRIAR JOGO</h3><p class="muted">3 temas, 3 chutes de cada um por tema. Quem somar mais pontos vence.</p>
        <button class="btn y vl-go" type="button" data-a="create">Criar partida</button>
        <button class="btn vl-go" type="button" data-a="local">Jogar no mesmo aparelho</button></section>
      <section class="vl-box"><h3 class="d">ENTRAR EM JOGO</h3>
        <label class="vl-opt"><small>Código da partida</small><input class="vl-code" maxlength="5" autocomplete="off" spellcheck="false" placeholder="EX: BODE7" aria-label="Código da partida"></label>
        <button class="btn g vl-go" type="button" data-a="join">Entrar</button>
        <p class="muted vl-help">Peça o código para quem criou a partida. Os dois precisam estar com esta página aberta${window.claude?" e logados no claude.ai":""}.</p></section></div>`;
  app.querySelector(".back").addEventListener("click",home);
  const inp=app.querySelector(".vl-code");inp.addEventListener("input",()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"")});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")app.querySelector("[data-a=join]").click()});
  app.querySelector(".vl-lobby").addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;
    if(a==="daily")daily();
    if(a==="create")t100Play({mode:"host"});
    if(a==="local")pfLocal(pfs=>t100Play({mode:"local",pfs}));
    if(a==="join"){const c=inp.value.trim();if(c.length!==5){toast("O código tem 5 letras/números");inp.focus();return}t100Play({mode:"join",code:c})}});
  pfMount(app);window.scrollTo(0,0)}};
