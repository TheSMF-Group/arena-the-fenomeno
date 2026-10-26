// @ts-nocheck
import {$, BODEHEAD, clubCrest, clubName, esc, face, flag, natName, pick, shuffle, toast} from "../core";
import {ST} from "../state";
import {makeSearch} from "../search";
import {GAMES, share} from "../engine";
import {VL_ART, VL_NAT, loadPass, vlCode} from "./velha";
import {mqttRoom} from "../mqtt";
import {DR_LG, DR_NAME, DR_POS, DR_TURN, TM_AB, drCN, drCanPlay, drCands, drClubs, drDraw, drFits, drOk, drPosAb, drPosOf, drPosTxt, drSim, loadPos} from "./draft-core";
import {fmtK, leAge, leB, leBegin, leCan, leCapOf, leCardEval, leCardTxt, leFresh, leNext, lePl, lePrice, leSlots, leT, leTeam, leToMatch, loadAtu} from "./leilao";
import {pfGet, pfImg} from "../profile";
import {maFresh, maRound, maStart, maT} from "./maleta";
import {rcCap, rcFresh, rcRound, rcStart, rcT} from "./reconstruindo";
import {cleanup} from "../home";
export async function drPlay({mode,cfg,code,kind,pfs}){const LE=kind==="leilao",MA=kind==="maleta",RC=kind==="reconstruindo",G=GAMES[kind||"draft"];ST.VIEW=kind||"draft";ST.PHASE="play";cleanup();
  const app=$("#app");let alive=true,timer=null,nr=null,offPeers=null,me=null,S=null,pend=null,spunKey=null,spinT=null,anim=null,animT=null;
  ST.CLEAN=()=>{alive=false;clearInterval(timer);clearInterval(spinT);clearInterval(animT);offPeers&&offPeers();nr&&nr.leave().catch(()=>{})};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Sair</button><h2><b>${LE?"LEILÃO":MA?"MALETA":RC?"RECONSTRUINDO":"DRAFT"}</b></h2><span class="spacer"></span></div><div class="stage dr-stage"><div class="fg-load"><img src="${BODEHEAD}" alt=""><b>${mode==="join"?"PROCURANDO A PARTIDA…":"ABRINDO O MERCADO…"}</b></div></div>`;
  const st=app.querySelector(".stage");ST.DR_CUR=LE||MA||RC;await Promise.all([loadPass(),loadPos(),LE||MA||RC?loadAtu():0]);if(!alive)return;
  app.querySelector(".back").addEventListener("click",()=>{if(S&&!S.over&&mode!=="local"&&!confirm("Sair da partida?"))return;G.open()});
  const fail=(msg,local)=>{if(!alive)return;st.innerHTML=`<div class="vl-box vl-msg"><h3 class="d">OPS</h3><p>${msg}</p><div class="row">${local?`<button class="btn y" type="button" data-a="local">Jogar no mesmo aparelho</button>`:""}<button class="btn" type="button" data-a="back">Voltar</button></div></div>`;
    st.querySelector("[data-a=back]").onclick=()=>G.open();const l=st.querySelector("[data-a=local]");l&&(l.onclick=()=>drPlay({mode:"local",kind,cfg:cfg||(LE?{diff:"normal",bud:1000000}:MA?{diff:"normal",mal:1}:RC?{diff:"normal",rec:1}:{diff:"normal",lg:"eu"})}))};
  const keyOf=p=>p.by||p.peer,T=()=>DR_TURN[S.cfg.diff]*1000;
  const fresh=(base)=>LE?leFresh(base):MA?maFresh(base):RC?rcFresh(base):({...base,ph:"draft",turn:"X",draw:drDraw(base.cfg,[]),tx:Array(11).fill(0),to:Array(11).fill(0),used:[],rr:{X:1,O:1},sx:0,so:0,over:null,last:null,game:(base.game||0)+1,dl:base.O?Date.now()+DR_TURN[base.cfg.diff]*1000:0});
  const emptyOf=(s,m)=>team(s,m).map((x,i)=>x?null:i).filter(i=>i!=null);
  const push=s=>{S=s;render();if(nr)nr.presence({st:s}).catch(()=>{})};
  const mySeat=()=>mode==="local"?(S.ph!=="match"?S.turn:null):(S.X===me?"X":S.O===me?"O":null);
  const team=(s,m)=>m==="X"?s.tx:s.to,full=a=>a.every(Boolean);
  if(mode!=="local"){
    const room=window.claude?await claude.use("room").catch(()=>null):await mqttRoom().catch(()=>null);
    if(!alive)return;
    if(!room)return fail(window.claude?"O multiplayer não está disponível aqui. Ele funciona dentro do claude.ai, para quem está logado e tem acesso a esta página.":"Não deu para conectar no servidor da partida. Confira a internet e tente de novo.",true);
    code=code||vlCode();
    try{nr=await room.join((kind?kind+"-":"draft-")+code.toLowerCase())}catch(e){return fail("Não deu para abrir a sala. Tente de novo em instantes.",true)}
    if(!alive){nr.leave().catch(()=>{});return}
    const meP=()=>nr.peers().find(p=>p.sameTab);
    offPeers=nr.onPeers(ch=>{if(!me){const m=meP();if(m)me=keyOf(m)}
      let best=null;for(const p of ch.peers){const s=p.presence&&p.presence.st;if(drOk(s)&&s.code===code&&(!best||s.seq>best.seq))best=s}
      if(best&&(!S||best.seq>S.seq)){S=best;render()}else if(S)renderAway()});
    for(let i=0;i<50&&!me&&alive;i++){const m=meP();if(m)me=keyOf(m);else await new Promise(r=>setTimeout(r,100))}
    if(!alive)return;if(!me)return fail("Não deu para conectar na sala.",true);
    if(mode==="host")push(fresh({code,cfg,seq:1,X:me,O:null,pf:{X:pfGet("P1")}}));
    else{const t0=Date.now();while(alive&&!S&&Date.now()-t0<9000)await new Promise(r=>setTimeout(r,200));
      if(!alive)return;if(!S)return fail(`Não achei a partida <b>${esc(code)}</b>. Confira o código e peça para quem criou deixar a tela da partida aberta.`);
      cfg=S.cfg;if(!S.O&&S.X!==me)push(LE?leBegin({...S,seq:S.seq+1,O:me,pf:{...S.pf,O:pfGet("P2")}}):MA?maStart({...S,seq:S.seq+1,O:me,pf:{...S.pf,O:pfGet("P2")}}):RC?rcStart({...S,seq:S.seq+1,O:me,pf:{...S.pf,O:pfGet("P2")}}):{...S,seq:S.seq+1,O:me,pf:{...S.pf,O:pfGet("P2")},dl:Date.now()+DR_TURN[S.cfg.diff]*1000});else render()}
  }else{code="LOCAL";push(fresh({code,cfg,seq:1,X:"x",O:"o",pf:pfs?{X:pfs[0],O:pfs[1]}:undefined}))}
  timer=setInterval(tick,250);
  function tick(){if(!S||!S.O||S.ph==="match"||S.over)return;const left=S.dl-Date.now(),el=st.querySelector(".vl-clock");
    if(el){const s=Math.max(0,Math.ceil(left/1000));el.textContent=`${s}s`;el.classList.toggle("low",s<=10)}
    if(LE&&S.ph==="ask"&&mySeat()===S.turn&&!leCan(S,S.turn)&&left<leT(S,"ask")-1800&&!pend){pend=1;setTimeout(()=>pend=null,800);leAnswer(false);return}
    if(left<=0&&(mySeat()===S.turn||left<-4000)&&!pend){pend=1;setTimeout(()=>pend=null,800);if(LE)leTimeout();else if(MA)maTimeout();else if(RC)rcTimeout();else advance({...S,seq:S.seq+1,last:{t:"tempo",m:S.turn}})}}
  /* passa a vez: o outro joga se ainda tiver vaga; com os dois completos, a partida é simulada */
  function advance(s){const other=s.turn==="X"?"O":"X";
    if(full(s.tx)&&full(s.to)){const r=drSim(s);s.ph="match";s.draw=null;s.dl=0;s.sx=r.gx;s.so=r.go;s.over=r.win;push(s);return}
    s.turn=full(team(s,other))?s.turn:other;s.draw=drDraw(s.cfg,s.used,emptyOf(s,s.turn));s.dl=Date.now()+T();push(s)}

  /* ---- LEILÃO: respostas, lances, posse e escolha da posição ---- */
  const cp=s=>({...s,tx:s.tx.slice(),to:s.to.slice(),used:s.used.slice(),an:{...s.an},paid:{...s.paid},aw:{...s.aw},auto:s.auto&&{X:s.auto.X.slice(),O:s.auto.O.slice()}});
  let selPick=[],revKey=null;const flipSeen=new Set();
  function lePickConfirm(ids){const m=S.turn,o=m==="X"?"O":"X",s=cp(S);s.seq++;s.cards={...s.cards,[m]:ids};s.pk={...s.pk,[m]:true};
    if(s.pk[o])s.dl=Date.now()+10000;else{s.turn=o;s.dl=Date.now()+leT(s,"pick")}selPick=[];push(s)}
  function lePickTimeout(){if(S.pk.X&&S.pk.O){leGo();return}lePickConfirm(shuffle(Math.random,S.opts[S.turn].slice()).slice(0,2))}
  function leGo(){if(S.ph!=="pick"||!(S.pk.X&&S.pk.O))return;const s=cp(S);s.seq++;leNext(s);push(s)}
  function leTimeout(){if(S.ph==="pick")lePickTimeout();else if(S.ph==="ask")leAnswer(false,"tempo");else if(S.ph==="bid")leFold("tempo");else if(S.ph==="place")lePlaceAuto()}
  function leAnswer(yes,why){const m=S.turn,o=m==="X"?"O":"X",s=cp(S);s.seq++;s.an[m]=!!yes;s.last=null;
    if(s.an[o]===null){s.turn=o;s.dl=Date.now()+leT(s,"ask");push(s);return}
    const ys=["X","O"].filter(k=>s.an[k]);
    if(!ys.length){s.last={t:"nobody",pid:s.lot.id};leNext(s);push(s);return}
    if(ys.length===1){leWin(s,ys[0],s.lot.price);return}
    s.ph="bid";s.bid={amt:s.lot.price,by:null};s.turn=s.f;s.dl=Date.now()+leT(s,"bid");push(s)}
  function leWin(s,w,amt){const p=lePl(s.lot.id),opts=leSlots(p,leTeam(s,w));
    if(!opts.length){s.last={t:"nobody",pid:s.lot.id};leNext(s);push(s);return}
    if(s.ph==="bid")s.aw[w]=(s.aw[w]||0)+1;s.paid[p.id]=amt;
    if(w==="X")s.bx-=amt;else s.bo-=amt;s.used.push(p.id);s.pend={m:w,pid:p.id,amt,auc:s.ph==="bid",ts:Date.now()};s.ph="place";s.turn=w;s.bid=null;
    if(opts.length===1){lePlaceIn(s,opts[0]);return}
    s.last={t:"won",m:w,pid:p.id,amt,auc:s.pend.auc,ts:s.pend.ts};s.dl=Date.now()+leT(s,"place");push(s)}
  function lePlaceIn(s,slot){const pe=s.pend;leTeam(s,pe.m)[slot]=pe.pid;s.last={t:"ok",m:pe.m,pid:pe.pid,slot,amt:pe.amt,auc:pe.auc,ts:pe.ts};s.pend=null;leNext(s);push(s)}
  function lePlaceAuto(){const s=cp(S);s.seq++;const pe=s.pend;if(!pe)return;const o=leSlots(lePl(pe.pid),leTeam(s,pe.m));lePlaceIn(s,o[0])}
  function leRaise(step){const m=S.turn,o=m==="X"?"O":"X",amt=S.bid.amt+step;if(amt>leCapOf(S,m)){toast("Seu orçamento não cobre esse lance");return}
    push({...S,seq:S.seq+1,bid:{amt,by:m},turn:o,dl:Date.now()+leT(S,"bid"),last:null})}
  function leFold(why){const s=cp(S);s.seq++;s.last=null;leWin(s,S.turn==="X"?"O":"X",S.bid.amt)}
  const leSteps=price=>[Math.max(500,Math.round(price*.05/100)*100),Math.max(1000,Math.round(price*.1/100)*100),Math.max(2500,Math.round(price*.25/100)*100)];
  /* ---- RECONSTRUINDO ---- */
  let rcSel=-1;
  const rcCp=s=>({...cp(s),cash:{...s.cash},pk:{...s.pk},used:s.used.slice(),hist:(s.hist||[]).slice()});
  const rcPr=idx=>{const o=S.opts[idx];return o?lePrice(lePl(o.id)):0};
  function rcTimeout(){if(S.ph==="pick")rcPick(-1);else if(S.ph==="bid")rcFold();else if(S.ph==="show")rcNext()}
  function rcPick(idx){const m=S.turn,o=m==="X"?"O":"X",s=rcCp(S);s.seq++;
    if(idx>=0&&rcPr(idx)>rcCap(S,m)){toast("Seu caixa não cobre essa opção");return}
    s.pk[m]=idx;rcSel=-1;
    if(s.pk[o]===undefined){s.turn=o;s.dl=Date.now()+rcT(s,"pick");return push(s)}
    if(s.pk.X>=0&&s.pk.X===s.pk.O){s.ph="bid";s.bid={amt:rcPr(s.pk.X),by:null};s.turn=s.f;s.dl=Date.now()+rcT(s,"bid");return push(s)}
    rcApply(s,null)}
  /* aplica o resultado da rodada: cada um leva o que escolheu; no leilão, quem perde leva o melhor reserva que sobrou */
  function rcApply(s,auc){const slot=s.slot,res={};
    const give=(m,idx,amt)=>{const o=idx>=0?s.opts[idx]:null;if(!o){res[m]={id:0,amt:0};return}leTeam(s,m)[slot]=o.id;s.cash[m]-=amt;s.used.push(o.id);res[m]={id:o.id,amt,t:o.t,k:o.k}};
    if(auc){const w=auc.w,l=w==="X"?"O":"X";give(w,auc.idx,auc.amt);
      const rest=s.opts.map((o,i)=>({o,i})).filter(x=>x.i!==auc.idx).sort((a,b)=>(a.o.t==="res"?0:1)-(b.o.t==="res"?0:1));const r=rest[0];
      if(r&&lePrice(lePl(r.o.id))<=rcCap(s,l))give(l,r.i,lePrice(lePl(r.o.id)));else give(l,-1,0);res[l].auto=true}
    else{give("X",s.pk.X,s.pk.X>=0?lePrice(lePl(s.opts[s.pk.X].id)):0);give("O",s.pk.O,s.pk.O>=0?lePrice(lePl(s.opts[s.pk.O].id)):0)}
    s.last={t:"rcr",slot,res,auc:auc?{w:auc.w,amt:auc.amt}:null};s.hist.push({slot,res});
    if(auc){s.last.m=auc.w;s.last.pid=res[auc.w].id;s.last.amt=auc.amt;s.last.ts=Date.now()}
    s.ph="show";s.bid=null;s.dl=Date.now()+rcT(s,"show");push(s)}
  function rcRaise(step){const m=S.turn,o=m==="X"?"O":"X",amt=S.bid.amt+step;if(amt>rcCap(S,m)){toast("Seu caixa não cobre esse lance");return}
    push({...S,seq:S.seq+1,bid:{amt,by:m},turn:o,dl:Date.now()+rcT(S,"bid")})}
  function rcFold(){const s=rcCp(S);s.seq++;const w=S.turn==="X"?"O":"X";rcApply(s,{w,idx:S.pk[w],amt:S.bid.amt})}
  function rcNext(){if(S.ph!=="show")return;const s=rcCp(S);s.seq++;s.round++;if(s.round>=11){leToMatch(s);return push(s)}rcRound(s);push(s)}
  const rcSteps=price=>[Math.max(500,Math.round(price*.05/100)*100),Math.max(1000,Math.round(price*.1/100)*100),Math.max(2500,Math.round(price*.25/100)*100)];
  function rcPitch(arr,hl,small){return`<div class="dr-pitch ${small?"sm":""}">${DR_POS.map(([lab,r,c],i)=>{const p=pl(arr[i]);
      return p?`<div class="dr-slot full ${i===hl?"hl":""}" style="grid-row:${r};grid-column:${c}">${face(p)}<b>${esc(p.name)}</b><small>${lab}</small></div>`:`<div class="dr-slot ${i===hl?"hl":""}" style="grid-row:${r};grid-column:${c}"><span>+</span><small>${lab}</small></div>`}).join("")}</div>`}
  function rcBody(nX,nO,seat){const ms=m=>m==="X"?"✕":"◯",nm=m=>m==="X"?nX:nO,who=m=>mode==="local"?nm(m):(m===seat?"Você":nm(m));
    const turnMe=seat===S.turn&&!S.over,ph=S.ph,slot=S.slot,m=mode==="local"?S.turn:(seat||"X");
    const cl=k=>`<div class="rc-cl">${clubCrest(S.cl[k],"crest")}<b>${esc(clubName(S.cl[k]))}</b></div>`;
    const clubs=`<div class="rc-pitches">${[0,1].map(k=>`<div class="dr-team"><h4>${cl(k)}</h4>${rcPitch(S.xi[k],slot,true)}</div>`).join("")}</div>`;
    const optH=(o,i)=>{const p=lePl(o.id),pr=lePrice(p),taken=S.used.includes(o.id),sel=rcSel===i&&ph==="pick",ok=turnMe&&ph==="pick"&&pr<=rcCap(S,S.turn);
      return`<button type="button" class="rc-opt ${sel?"sel":""} ${o.t==="res"?"res":""}" data-a="rc-opt" data-i="${i}" ${ok?"":"disabled"}><i class="rc-n">${i+1}</i>${face(p)}<b>${esc(p.name)}</b><small>${clubCrest(S.cl[o.k],"crest")} ${o.t==="tit"?"titular":"reserva"} · ${leAge(p)} anos</small><span class="rc-pr">${fmtK(pr)}</span></button>`};
    let act="";
    if(ph==="pick"){const first=S.pk[S.turn]===undefined&&Object.keys(S.pk).length===0;
      act=`<div class="le-act"><p>${turnMe?`<b>${mode==="local"?esc(nm(S.turn))+", sua":"Sua"} escolha para ${DR_NAME[slot].toLowerCase()}.</b> Escolha em segredo: se o outro escolher o mesmo jogador, vai a leilão e quem perder fica com o reserva.`:`${esc(who(S.turn))} está escolhendo em segredo…`}</p>
        <div class="rc-opts">${S.opts.map(optH).join("")}</div>
        <div class="row"><span class="pill vl-clock"></span>${turnMe?`<button class="btn y" type="button" data-a="rc-ok" ${rcSel>=0?"":"disabled"}>Confirmar a opção ${rcSel>=0?rcSel+1:""}</button><button class="btn" type="button" data-a="rc-pass">Passar (reserva barato no fim)</button>`:""}</div>
        <small class="muted">Caixa: ${fmtK(S.cash[S.turn])} · limite desta escolha: ${fmtK(Math.max(0,rcCap(S,S.turn)))}</small></div>`}
    else if(ph==="bid"){const o=S.opts[S.pk.X],p=lePl(o.id),cap=rcCap(S,S.turn),st3=rcSteps(rcPr(S.pk.X));
      act=`<div class="le-act"><p><b>Os dois escolheram ${esc(p.name)}! Leilão.</b> ${S.bid.by?`Lance atual: ${fmtK(S.bid.amt)} de ${esc(who(S.bid.by))}.`:`Começa em ${fmtK(S.bid.amt)}.`}</p>
        <div class="rc-opts">${optH(o,S.pk.X).replace('data-a="rc-opt"','data-a="x"').replace(/ data-i="\d+"/,"")}</div>
        ${turnMe?`<div class="row">${st3.map(v=>`<button class="btn y" type="button" data-a="rc-raise" data-v="${v}" ${S.bid.amt+v>cap?"disabled":""}>+ ${fmtK(v)}</button>`).join("")}<button class="btn" type="button" data-a="rc-fold">Desistir</button><span class="pill vl-clock"></span></div><small class="muted">Seu limite: ${fmtK(Math.max(0,cap))}. Quem desistir leva o reserva.</small>`:`<div class="row"><span class="pill">Vez de ${esc(who(S.turn))} cobrir ou desistir</span><span class="pill vl-clock"></span></div>`}</div>`}
    else if(ph==="show"&&S.last&&S.last.t==="rcr"){const L=S.last,line=x=>{const r=L.res[x],p=r.id?lePl(r.id):null;return`<p>${ms(x)} <b>${esc(nm(x))}</b>: ${p?`<b>${esc(p.name)}</b> por ${fmtK(r.amt)}${r.t==="res"?" (reserva)":""}${r.auto?" · levou o reserva":""}`:`passou: vaga para um reserva barato no fim`}.</p>`};
      act=`<div class="le-act">${L.auc?`<p><b>Leilão decidido!</b> ${esc(nm(L.auc.w))} levou por ${fmtK(L.auc.amt)}.</p>`:""}${line("X")}${line("O")}<div class="row"><button class="btn y" type="button" data-a="rc-next">Próxima posição</button><span class="pill vl-clock"></span></div></div>`}
    const team=x=>`<div class="dr-team ${seat===x?"me":""}"><h4>${ms(x)} ${esc(nm(x))} <small class="dr-rt">caixa ${fmtK(S.cash[x])}</small></h4>${rcPitch(leTeam(S,x),-1,true)}</div>`;
    return`<div class="vl-status ${turnMe?"mine":""}"><span>Posição <b>${S.round+1}</b> de 11 · <b>${DR_NAME[slot]}</b></span></div>${clubs}${act}<div class="dr-teams le">${team("X")}${team("O")}</div>`}
  function rcExtra(nX,nO){const nm=x=>x==="X"?nX:nO,ms=x=>x==="X"?"✕":"◯";
    const val=arr=>arr.map(lePl).filter(Boolean).reduce((a,p)=>a+lePrice(p),0);
    const au=["X","O"].map(x=>[x,(S.auto&&S.auto[x]||[]).length]).filter(a=>a[1]);
    return`<div class="le-obj"><h4>O que cada gestor fez</h4>${["X","O"].map(x=>`<div><b>${ms(x)} ${esc(nm(x))}</b><p class="muted">Valor dos 11: ${fmtK(val(x==="X"?S.tx:S.to))} · caixa que sobrou: ${fmtK(S.cash[x])}</p></div>`).join("")}${au.length?`<p class="muted">Vagas completadas com reservas baratos (RES): ${au.map(([x,n])=>`${esc(nm(x))} (${n})`).join(", ")}.</p>`:""}</div>`}
  /* ---- MALETA ---- */
  function maTimeout(){const free=()=>[0,1,2,3,4].filter(i=>!S.rv.includes(i));
    if(S.ph==="pick1"||S.ph==="pick2")maPick(pick(Math.random,free()));else if(S.ph==="swappick")maSwapPick(pick(Math.random,free()));else if(S.ph==="swap")maSwap(false);else if(S.ph==="show")maNextRound()}
  function maPick(i){const m=S.turn,s=cp(S);s.seq++;
    if(S.ph==="pick1"){s.pk={[m]:i};s.rv=[i];s.ph="pick2";s.turn=m==="X"?"O":"X";s.dl=Date.now()+maT(s,"pick");push(s)}
    else if(S.ph==="pick2"){s.pk={...S.pk,[m]:i};s.fin={...s.pk};s.tr={};s.rv=[S.pk[S.fp],i];s.ph="swap";s.step=0;s.turn=S.fp;s.dl=Date.now()+maT(s,"swap");push(s)}}
  /* depois dos dois abrirem, cada um (primeiro quem abriu primeiro) pode ficar ou trocar a sua por uma das maletas que sobraram, às cegas */
  function maAfterSwap(s){const f=S.fp,o=f==="X"?"O":"X";
    if(s.step===0){s.step=1;s.turn=o;s.ph="swap";s.dl=Date.now()+maT(s,"swap");return push(s)}
    leTeam(s,f)[S.slot]=S.cases[s.fin[f]];leTeam(s,o)[S.slot]=S.cases[s.fin[o]];s.used=S.used.concat(S.cases);
    s.last={t:"ma",f,o,slot:S.slot,cases:S.cases.slice(),fin:{...s.fin},tr:{...s.tr}};s.rv=[0,1,2,3,4];s.ph="show";s.turn=f;s.dl=Date.now()+maT(s,"show");push(s)}
  function maSwap(yes){const s=cp(S);s.seq++;if(yes){s.ph="swappick";s.dl=Date.now()+maT(s,"swap");return push(s)}maAfterSwap(s)}
  function maSwapPick(i){const m=S.turn,s=cp(S);s.seq++;s.tr={...S.tr,[m]:{from:S.fin[m],to:i}};s.fin={...S.fin,[m]:i};s.rv=S.rv.concat(i);maAfterSwap(s)}
  function maNextRound(){if(S.ph!=="show")return;const s=cp(S);s.seq++;s.round++;if(s.round>=11){leToMatch(s);push(s);return}maRound(s);push(s)}
  function maBody(nX,nO,seat){const ms=m=>m==="X"?"✕":"◯",nm=m=>m==="X"?nX:nO,who=m=>mode==="local"?nm(m):(m===seat?"Você":nm(m));
    const turnMe=seat===S.turn&&!S.over,ph=S.ph,slot=S.slot,f=S.fp,o=f==="X"?"O":"X",fin=S.fin||S.pk||{};
    const owner=i=>fin.X===i?"X":fin.O===i?"O":null;
    const cases=S.cases.map((id,i)=>{const p=pl(id),rev=S.rv.includes(i),ow=owner(i),can=turnMe&&(ph==="pick1"||ph==="pick2"||ph==="swappick")&&!rev;
      return`<button type="button" class="ma-case ${rev?"open":""} ${ow?"o-"+ow.toLowerCase():""}" data-a="ma-case" data-i="${i}" ${can?"":"disabled"} aria-label="Maleta ${i+1}"><span class="award-perspective"><span class="award-card ${rev?"flipped":""}">
        <span class="award-face ma-front"><i class="ma-handle"></i><b>${i+1}</b></span>
        <span class="award-face back ma-back">${p?`${face(p)}<strong>${esc(p.name)}</strong><small>${p.nat!=null&&ST.NATS[p.nat]?`<i class="flag">${flag(ST.NATS[p.nat][1])}</i> `:""}${leAge(p)} anos</small><span class="ma-pr">${fmtK(lePrice(p))}</span>`:""}</span></span></span>
        <em>${rev?(ow?ms(ow)+" "+esc(nm(ow)):"descartado"):""}</em></button>`}).join("");
    const pc=(p,tag)=>p?`<div class="ma-pc">${face(p)}<div><small>${tag}</small><b>${esc(p.name)}</b><span>${p.nat!=null&&ST.NATS[p.nat]?`<i class="flag">${flag(ST.NATS[p.nat][1])}</i> `:""}${leAge(p)} anos · ${[...new Set(drPosOf(p))].filter(i=>TM_AB[i]).map(i=>TM_AB[i]).join(" ")}</span></div><strong>${fmtK(lePrice(p))}</strong></div>`:"";
    const held=m=>pl(S.cases[fin[m]]);
    let act="";
    if(ph==="pick1")act=turnMe?`<p><b>Sua vez de abrir.</b> Escolha uma maleta para <b>${DR_NAME[slot].toLowerCase()}</b>. O craque aparece para os dois.</p>`:`<p>Vez de ${esc(who(S.turn))} abrir uma maleta…</p>`;
    else if(ph==="pick2"){const p1=pl(S.cases[S.pk[f]]);act=(turnMe?`<p><b>${esc(who(f))} abriu a maleta ${S.pk[f]+1}.</b> Agora escolha a sua, às cegas.</p>`:`<p>${esc(who(S.turn))} está escolhendo a maleta, sabendo que você abriu a ${S.pk[f]+1}…</p>`)+pc(p1,`maleta ${S.pk[f]+1} · ${esc(who(f))} abriu`)}
    else if(ph==="swap"||ph==="swappick"){const t=S.turn,left=5-S.rv.length;
      const cards=pc(held(f),`${esc(who(f))} tem (maleta ${fin[f]+1})`)+pc(held(o),`${esc(who(o))} tem (maleta ${fin[o]+1})`);
      if(ph==="swap")act=(turnMe?`<p><b>Quer trocar?</b> Trocar descarta o seu jogador (ele não volta para nenhuma maleta) e você abre, às cegas, uma das ${left} maletas fechadas.</p>`:`<p>${esc(who(t))} está decidindo se troca por uma das ${left} maletas fechadas…</p>`)+cards+(turnMe?`<div class="row"><button class="btn y" type="button" data-a="ma-swap" ${left<1?"disabled":""}>TROCAR</button><button class="btn" type="button" data-a="ma-keep">FICAR</button></div>`:"");
      else act=(turnMe?`<p><b>Escolha uma maleta fechada</b> para trocar. Você leva o que estiver dentro.</p>`:`<p>${esc(who(t))} está escolhendo uma maleta fechada para trocar…</p>`)+cards}
    else if(ph==="show"&&S.last&&S.last.t==="ma"){const L=S.last,line=m=>{const p=pl(L.cases[L.fin[m]]),t=L.tr[m],old=t?pl(L.cases[t.from]):null;return`<p>${ms(m)} <b>${esc(nm(m))}</b>: ${t?`trocou ${esc(old?old.name:"")} por <b>${esc(p?p.name:"")}</b>`:`ficou com <b>${esc(p?p.name:"")}</b>`}.</p>`};
      act=line(L.f)+line(L.o)+`<div class="row"><button class="btn y" type="button" data-a="ma-next">Próxima maleta</button></div>`}
    const team=m=>`<div class="dr-team ${seat===m?"me":""}"><h4>${ms(m)} ${esc(nm(m))}</h4>${pitch(leTeam(S,m),m,false,true)}</div>`;
    return`<div class="vl-status ${turnMe?"mine":""}"><span>Rodada <b>${S.round+1}</b> de 11 · <b>${DR_NAME[slot]}</b></span><span class="pill vl-clock"></span></div>
      <div class="ma-row">${cases}</div><div class="le-act">${act}</div><div class="dr-teams le">${team("X")}${team("O")}</div>`}
  function leExtra(nX,nO){const nm=m=>m==="X"?nX:nO;let h="";
    const au=["X","O"].map(m=>[m,(S.auto&&S.auto[m]||[]).length]).filter(x=>x[1]);
    if(au.length)h+=`<p class="muted le-res">Vagas completadas com reservas aleatórios, mais baratos que o jogador mais barato comprado pelos dois: ${au.map(([m,n])=>`${esc(nm(m))} (${n})`).join(", ")}. Eles aparecem com "RES" no campo.</p>`;
    if(S.cards)h+=`<div class="le-obj"><h4>Objetivos</h4>${["X","O"].map(m=>`<div><b>${m==="X"?"✕":"◯"} ${esc(nm(m))}</b>${S.cards[m].map(id=>{const r=leCardEval(id,S,m);return`<p class="${r.ok?"ok":"no"}">${r.ok?"✔":"✘"} ${esc(r.txt)} <small>${r.have}/${r.need} · ${r.ok?"+2":"−2"} nos setores</small></p>`}).join("")}</div>`).join("")}</div>`;
    return h}
  function pitchLE(arr,valid){return`<div class="dr-pitch sm">${DR_POS.map(([lab,r,c],i)=>{const p=pl(arr[i]);
      return p?`<div class="dr-slot full" style="grid-row:${r};grid-column:${c}">${face(p)}<b>${esc(p.name)}</b><small>${lab}</small></div>`
        :`<button type="button" class="dr-slot ${valid&&valid.has(i)?"ok":""}" data-slot="${i}" style="grid-row:${r};grid-column:${c}" ${valid&&valid.has(i)?"":"disabled"}><span>+</span><small>${lab}</small></button>`}).join("")}</div>`}
  function lePickView(nX,nO,seat){const m=mode==="local"?S.turn:seat;if(!m)return"";
    const done=S.pk[m],both=S.pk.X&&S.pk.O,canPick=!done&&S.turn===m,opts=S.opts[m],chosen=S.cards[m]||[];
    const key=S.code+":"+S.game+":"+m,anim=done&&!flipSeen.has(key);if(done)flipSeen.add(key);
    const nmOpp=(m==="X"?nO:nX);
    const cardsH=opts.map((id,i)=>{const isC=chosen.includes(id)&&done,sel=selPick.includes(i)&&canPick;
      return`<button type="button" class="pk-card ${sel?"sel":""} ${done&&!isC?"dim":""}" data-a="le-card" data-i="${i}" ${canPick?"":"disabled"}><span class="award-perspective"><span class="award-card ${isC&&!anim?"flipped":""}" ${isC&&anim?"data-flip":""}><span class="award-face pk-back"><img src="${BODEHEAD}" alt=""><b>?</b></span><span class="award-face back pk-front"><b>${esc(isC?leCardTxt(id,S):"")}</b><small>cumprir +2 · falhar −2</small></span></span></span></button>`}).join("");
    return`<div class="le-pick"><h3 class="d">${canPick?(mode==="local"?esc(m==="X"?nX:nO)+", escolha":"Escolha")+" 2 cartas de objetivo":done?"Seus objetivos":"Esperando "+esc(nmOpp)+" escolher as cartas…"}</h3>
      <p class="muted">${canPick?"Cinco cartas viradas para baixo. Escolha 2 sem saber o que são: elas viram e mostram o seu objetivo secreto. Cumprir dá +2 nos setores do time; falhar tira 2.":done?(both?"Cada carta cumprida no fim vale +2 nos setores do time; cada falha tira 2.":"Esperando o adversário escolher…"):"Já já é a sua vez de escolher."}</p>
      <div class="pk-row">${cardsH}</div>
      <div class="row">${canPick?`<button class="btn y" type="button" data-a="le-confirm" ${selPick.length===2?"":"disabled"}>Virar as cartas (${selPick.length}/2)</button>`:both?`<button class="btn y" type="button" data-a="le-go">Começar o leilão</button>`:""}<span class="pill vl-clock"></span></div></div>`}
  function leReveal(m,pid,amt,nX,nO){document.querySelectorAll(".le-rev").forEach(x=>x.remove());const p=pl(pid);if(!p)return;const el=document.createElement("div");el.className="le-rev";
    const nm=m==="X"?nX:nO;
    const conf=Array.from({length:30},(_,i)=>`<i class="confetti-piece" style="left:${(Math.random()*100).toFixed(1)}%;width:${6+Math.floor(Math.random()*6)}px;height:${10+Math.floor(Math.random()*8)}px;background:${["#ffd400","#22c55e","#fff","#f97316"][i%4]};animation-duration:${(1.8+Math.random()*1.6).toFixed(2)}s;animation-delay:${(1.2+Math.random()*.8).toFixed(2)}s"></i>`).join("");
    el.innerHTML=`<div class="le-rev-glow"></div>${conf}<div class="award-perspective"><div class="award-card le-rev-card"><div class="award-face le-rev-q"><img src="${BODEHEAD}" alt=""><b>DISPUTA!</b><small>${esc(p.name)}</small><span class="le-dots"><u></u><u></u><u></u></span></div><div class="award-face back le-rev-w">${pfImg(S,m)}<small>LEVOU O LEILÃO</small><b class="goat-name">${esc(nm)}</b>${face(p)}<strong>${esc(p.name)}</strong><span>${fmtK(amt)}</span></div></div></div>`;
    document.body.appendChild(el);setTimeout(()=>{const c=el.querySelector(".award-card");c&&c.classList.add("flipped")},1300);setTimeout(()=>el.remove(),5600);el.addEventListener("click",()=>el.remove())}
  function leBody(nX,nO,seat){if(S.ph==="pick")return lePickView(nX,nO,seat);const L=S.lot,p=L&&pl(L.id),turnMe=seat===S.turn&&!S.over;
    const who=m=>mode==="local"?(m==="X"?nX:nO):(m===seat?"Você":m==="X"?nX:nO);
    const bidding=S.ph==="bid",price=bidding?S.bid.amt:(L?L.price:0);
    const card=p?`<div class="le-lot ${turnMe?"mine":""}">${face(p)}<div class="le-info"><b>${esc(p.name)}</b><span>${p.nat!=null&&ST.NATS[p.nat]?`<i class="flag">${flag(ST.NATS[p.nat][1])}</i> ${esc(natName(p.nat))}`:""}${p.birth?` · ${leAge(p)} anos`:""}</span><span class="le-pos">${[...new Set(drPosOf(p))].filter(i=>TM_AB[i]).map(i=>`<span class="pz ok">${TM_AB[i]}</span>`).join("")}</span><small>${p.club!=null&&ST.CLUBS[p.club]?esc(clubName(p.club)):""}</small></div>
      <div class="le-price"><small>${bidding?"Lance atual":L.sale?"Saldão":"Valor de mercado atual"}</small><b>${fmtK(price)}</b>${bidding?(S.bid.by?`<small>de ${esc(who(S.bid.by))}</small>`:`<small>ninguém deu lance</small>`):""}</div></div>`:"";
    let act="",valid=null,validM=null;
    if(S.ph==="ask"){
      if(turnMe){const can=leCan(S,S.turn);act=`<p><b>${mode==="local"?esc(who(S.turn))+", você":"Você"} quer ${esc(p.name)} por ${fmtK(L.price)}?</b></p>
        ${can?"":`<p class="muted">Não cabe no seu time ou no seu orçamento. Passando…</p>`}
        <div class="row"><button class="btn y" type="button" data-a="le-yes" ${can?"":"disabled"}>QUER!</button><button class="btn" type="button" data-a="le-no">NÃO</button><span class="pill vl-clock"></span></div>`}
      else{const waiting=seat&&S.an[seat]!==null&&S.an[seat]!==undefined&&seat!==S.turn;act=`<p>${waiting?"Você respondeu. Esperando o adversário…":`Vez de ${esc(who(S.turn))} responder…`}</p><span class="pill vl-clock"></span>`}}
    else if(S.ph==="bid"){
      if(turnMe){const cap=leCapOf(S,S.turn),st3=leSteps(L.price);act=`<p><b>${mode==="local"?esc(who(S.turn))+", seu":"Seu"} lance.</b> Os dois querem ${esc(p.name)}: cubra ou desista.</p>
        <div class="row">${st3.map(v=>`<button class="btn y" type="button" data-a="le-raise" data-v="${v}" ${S.bid.amt+v>cap?"disabled":""}>+ ${fmtK(v)}</button>`).join("")}<button class="btn" type="button" data-a="le-fold">Desistir</button><span class="pill vl-clock"></span></div>
        <small class="muted">Seu limite agora: ${fmtK(cap)} (o orçamento guarda o mínimo para as vagas que faltam).</small>`}
      else act=`<p>Leilão! Vez de ${esc(who(S.turn))} cobrir ou desistir…</p><span class="pill vl-clock"></span>`}
    else if(S.ph==="place"){const pe=S.pend,pp=pe&&pl(pe.pid);
      if(turnMe&&pp){valid=new Set(leSlots(pp,leTeam(S,S.turn)));validM=S.turn;act=`<p><b>${mode==="local"?esc(who(S.turn))+", ":""}${esc(pp.name)} é seu por ${fmtK(pe.amt)}!</b> Clique numa posição verde do seu time.</p><span class="pill vl-clock"></span>`}
      else act=`<p>${esc(who(S.turn))} está escolhendo a posição…</p><span class="pill vl-clock"></span>`}
    const lp=S.last&&S.last.pid?pl(S.last.pid):null,ms=m=>m==="X"?"✕":"◯";
    const last=S.last?(S.last.t==="ok"?`${ms(S.last.m)} ${esc(who(S.last.m))} contratou ${esc(lp?lp.name:"")} por ${fmtK(S.last.amt)} para ${DR_NAME[S.last.slot].toLowerCase()}.`:S.last.t==="nobody"?`Ninguém levou ${esc(lp?lp.name:"o craque")}.`:""):"";
    const team=m=>`<div class="dr-team ${seat===m?"me":""}"><h4>${ms(m)} ${esc(m==="X"?nX:nO)} <small class="dr-rt">${fmtK(leB(S,m))} · ${leTeam(S,m).filter(Boolean).length}/11</small></h4>${pitchLE(leTeam(S,m),validM===m?valid:null)}</div>`;
    const cm=mode==="local"?S.turn:seat;
    const cards=S.cards&&cm&&S.cards[cm]&&S.cards[cm].length?`<div class="le-obj mine"><h4>Seus objetivos secretos${mode==="local"?" · "+esc(who(cm)):""}</h4>${S.cards[cm].map(id=>{const r=leCardEval(id,S,cm);return`<p class="${r.ok?"ok":""}">${r.ok?"✔":"◻"} ${esc(r.txt)} <small>${r.have}/${r.need}</small></p>`}).join("")}<small class="muted">Cumprir dá +2 em todos os setores do time na partida; falhar tira 2. O adversário não vê suas cartas.</small></div>`:"";
    return`<div class="vl-status ${turnMe?"mine":""}"><span>Lote <b>${S.n}</b> de ${S.max}${S.lot&&S.lot.sale?" · saldão":""}</span></div>${card}<div class="le-act">${act}</div>${cards}<p class="muted vl-last">${last}</p><div class="dr-teams le">${team("X")}${team("O")}</div>`}
  function place(slot,p){const s={...S,seq:S.seq+1,tx:S.tx.slice(),to:S.to.slice(),used:S.used.concat(p.id)};team(s,S.turn)[slot]=p.id;s.last={t:"ok",m:S.turn,pid:p.id,slot};advance(s)}
  async function names(){const ids=[S.X,S.O].filter(k=>k&&k.startsWith("u_"));let ps={};
    try{const u=await claude.use("user");if(u&&ids.length)ps=await u.profiles(ids)}catch(e){}
    return k=>{const seat=S&&k===S.X?"X":S&&k===S.O?"O":null,pn=seat&&S.pf&&S.pf[seat]&&S.pf[seat].n;return pn||(mode==="local"?(k==="x"?"P1":"P2"):k===me?"Você":(ps[k]&&ps[k].name)||"Adversário")}}
  function renderAway(){const el=st.querySelector(".vl-away");if(!el||mode==="local"||!nr)return;const here=new Set(nr.peers().map(keyOf));
    const opp=mySeat()==="X"?S.O:S.X;el.hidden=!(opp&&!here.has(opp)&&!S.over)}
  const pl=id=>id?ST.P.find(p=>p.id===id):null;
  function pitch(arr,m,clickable,small){return`<div class="dr-pitch ${small?"sm":""}">${DR_POS.map(([lab,r,c],i)=>{const p=pl(arr[i]);
      return p?`<div class="dr-slot full ${LE&&S.auto&&S.auto[m]&&S.auto[m].includes(i)?"res":""}" style="grid-row:${r};grid-column:${c}">${face(p)}<b>${esc(p.name)}</b><small>${lab}${LE&&S.auto&&S.auto[m]&&S.auto[m].includes(i)?" · RES":""}</small></div>`
        :`<button type="button" class="dr-slot" data-slot="${i}" style="grid-row:${r};grid-column:${c}" ${clickable?"":"disabled"}><span>+</span><small>${lab}</small></button>`}).join("")}</div>`}
  async function render(){if(!alive||!S)return;const nm=await names();if(!alive)return;const seat=mySeat();
    if(!S.O){st.innerHTML=`<div class="vl-box vl-wait"><small>Código da partida</small><div class="vl-bigcode">${esc(S.code)}</div>
        <p>${LE?`Leilão · ${fmtK(S.cfg.bud)} cada · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · 11 jogadores`:MA?`Maleta · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · 11 rodadas`:RC?`Reconstruindo · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · 11 posições`:`Draft · ${esc((DR_LG[S.cfg.lg]||DR_LG.eu).name)} · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · 4-3-3`}</p>
        <div class="row" style="justify-content:center"><button class="btn y" type="button" data-a="copy">Copiar código</button><button class="btn" type="button" data-a="invite">Copiar convite para o WhatsApp</button></div>
        <p class="muted">Esperando o adversário entrar… deixe esta tela aberta.</p></div>`;
      st.querySelector("[data-a=copy]").onclick=()=>share(S.code);
      st.querySelector("[data-a=invite]").onclick=()=>share(`🐐⚽ ${RC?`Bora RECONSTRUIR no The Fenômeno? Dois clubes grandes, posição a posição, escolha em segredo e leilão se escolherem o mesmo. Quem é o melhor gestor?`:MA?`Bora uma MALETA de futebol no The Fenômeno? São 11 rodadas, cinco maletas por posição, escolha às cegas e troque por uma das que sobraram. No fim é mano a mano.`:LE?`Bora um LEILÃO de futebol no The Fenômeno? Cada um tem ${fmtK(S.cfg.bud)} para montar um time dando lance nos craques e no fim é mano a mano.`:`Bora um DRAFT de futebol no The Fenômeno? Cada um monta um 4-3-3 com o sorteio (${(DR_LG[S.cfg.lg]||DR_LG.eu).name}) e no fim é mano a mano.`}\nCódigo da partida: ${S.code}\nAbra ${/vercel\.app$/.test(location.hostname)?location.origin:VL_ART} → Multiplayer → ${RC?"Reconstruindo":MA?"Maleta":LE?"Leilão":"Draft"} → Entrar em jogo`);
      return}
    const nX=nm(S.X),nO=nm(S.O),cnt=a=>a.filter(Boolean).length;
    const chip=m=>`<div class="vl-p ${m.toLowerCase()} ${S.ph!=="match"&&S.turn===m&&!S.over?"on":""}"><span class="vl-mk">${m==="X"?"✕":"◯"}</span>${pfImg(S,m)}<span class="vl-nm">${esc(m==="X"?nX:nO)}</span><b>${S.ph==="match"?"":cnt(team(S,m))+"/11"}</b>${(LE||RC)&&S.ph!=="match"?`<small class="le-bud">${fmtK(LE?leB(S,m):S.cash[m])}</small>`:""}</div>`;
    let h=`<div class="vl-head">${chip("X")}<div class="vl-mid"><small>${RC?`RECONSTRUINDO · ${S.cfg.diff==="hard"?"DIFÍCIL":"NORMAL"}`:MA?`MALETA · ${S.cfg.diff==="hard"?"DIFÍCIL":"NORMAL"}`:LE?`LEILÃO · ${fmtK(S.cfg.bud)} · ${S.cfg.diff==="hard"?"DIFÍCIL":"NORMAL"}`:`DRAFT · ${esc((DR_LG[S.cfg.lg]||DR_LG.eu).name.toUpperCase())} · ${S.cfg.diff==="hard"?"DIFÍCIL":"NORMAL"}`}</small><b>${S.ph==="match"?"Jogo":RC?"Posição "+(S.round+1)+"/11":MA?"Rodada "+(S.round+1)+"/11":LE?"Leilão aberto":"Mercado aberto"}</b><small>${S.code==="LOCAL"?"no mesmo aparelho":"código "+esc(S.code)}</small></div>${chip("O")}</div>
      <p class="vl-away hardnote" hidden>O adversário saiu da página. Se não voltar, a vez passa sozinha.</p>`;
    if(RC&&S.ph!=="match")h+=rcBody(nX,nO,seat);
    else if(MA&&S.ph!=="match")h+=maBody(nX,nO,seat);
    else if(LE&&S.ph!=="match")h+=leBody(nX,nO,seat);
    else if(S.ph==="draft"){const mine=seat===S.turn&&!S.over,d=S.draw,cands=drCands(d,S.used,S.cfg,emptyOf(S,S.turn)),lastP=S.last&&S.last.pid?pl(S.last.pid):null,L=DR_LG[S.cfg.lg]||DR_LG.eu;
      const key=d?JSON.stringify([S.game,S.used.length,S.turn,d,S.rr]):null,spinning=!!d&&key!==spunKey;
      function drawBox(d,spin,mine){const kind=d.c!=null&&d.n!=null?"Clube + seleção":d.c!=null?"Só clube":"Só seleção";
        const club=d.c!=null?`<div class="dr-pair">${spin?`<img class="dr-spin-c" src="" alt="">`:clubCrest(d.c,"crest")}<div><small>Clube</small><b>${spin?"sorteando…":esc(drCN(d.c))}</b></div></div>`:`<div class="dr-pair any"><span class="dr-any">★</span><div><small>Clube</small><b>${L.any}</b></div></div>`;
        const nat=d.n!=null?`<div class="dr-pair">${spin?`<i class="flag fl dr-spin-n"></i>`:`<i class="flag fl">${flag(ST.NATS[d.n][1])}</i>`}<div><small>Seleção</small><b>${spin?"sorteando…":esc(natName(d.n))}</b></div></div>`:`<div class="dr-pair any"><span class="dr-any">★</span><div><small>Seleção</small><b>qualquer seleção</b></div></div>`;
        return`<div class="dr-draw ${mine?"mine":""} ${spin?"spin":""}"><small class="dr-kind">${spin?"Sorteando…":kind}</small>${club}<span class="dr-plus">+</span>${nat}
          <div class="dr-meta">${spin||S.cfg.diff==="hard"?"":`<small>${cands.length} jogador${cands.length===1?"":"es"} possíve${cands.length===1?"l":"is"}</small>`}${mine&&!spin?`<div class="row"><button class="btn" type="button" data-a="reroll" ${S.rr[S.turn]>0?"":"disabled"}>Trocar sorteio (${S.rr[S.turn]})</button><button class="btn" type="button" data-a="pass">Passar a vez</button></div>`:""}</div></div>`}
      const who=mode==="local"?(S.turn==="X"?nX:nO):nm(S.turn==="X"?S.X:S.O);
      h+=`<div class="vl-status ${mine?"mine":""}"><span>${mine?`<b>${mode==="local"?esc(who)+", sua vez":"Sua vez"}</b>: clique numa posição vazia e escolha um jogador do sorteio que jogue nela.`:`Vez de ${esc(who)}…`}</span><span class="pill vl-clock"></span></div>
        ${d?drawBox(d,spinning,mine):`<p class="muted">Sem sorteio possível agora: a vez vai passar.</p>`}
        <p class="muted vl-last">${S.last?(S.last.t==="ok"?`${S.last.m==="X"?"✕":"◯"} contratou ${esc(lastP?lastP.name:"")} para ${DR_NAME[S.last.slot].toLowerCase()}.`:S.last.t==="tempo"?`${S.last.m==="X"?"✕":"◯"} perdeu a vez no tempo.`:`${S.last.m==="X"?"✕":"◯"} passou a vez.`):""}</p>
        ${(()=>{const m=mode==="local"?S.turn:seat;if(!m)return"";return`<div class="dr-teams one"><div class="dr-team me"><h4>${m==="X"?"✕":"◯"} ${mode==="local"?"Time de "+esc(m==="X"?nX:nO):"Seu time"}</h4>${pitch(team(S,m),m,mine&&!spinning,false)}<p class="muted dr-hide">${mode==="local"?"O time do outro só aparece na vez dele.":"O time do adversário fica escondido até o jogo."}</p></div></div>`})()}`;
      if(spinning){const crests=drClubs(S.cfg).map(c=>ST.ESC[ST.CLUBS[c][1]]).filter(Boolean),flags=VL_NAT.normal.concat(VL_NAT.hard);
        setTimeout(()=>{const ci=st.querySelector(".dr-spin-c"),ni=st.querySelector(".dr-spin-n");clearInterval(spinT);let n=0;
          const roll=()=>{if(ci)ci.src=pick(Math.random,crests);if(ni)ni.textContent=flag(pick(Math.random,flags))};roll();
          spinT=setInterval(()=>{roll();if(++n>=16){clearInterval(spinT);spunKey=key;render()}},90)},0)}}
    else{const R=drSim(S),k=S.code+":"+S.game;if(!anim||anim.k!==k)anim={k,t0:Date.now()};
      const tm=(m,arr)=>`<div class="dr-team"><h4>${m==="X"?"✕":"◯"} ${esc(m==="X"?nX:nO)} <small class="dr-rt">ATA ${Math.round((m==="X"?R.rx:R.ro).att)} · MEI ${Math.round((m==="X"?R.rx:R.ro).mid)} · DEF ${Math.round((m==="X"?R.rx:R.ro).def)} · GOL ${Math.round((m==="X"?R.rx:R.ro).gk)}</small></h4>${pitch(arr,m,false,true)}</div>`;
      h+=`<div class="dr-match"><div class="dr-score"><span class="nm">✕ ${esc(nX)}</span><b class="sx">0</b><span class="dr-min">0'</span><b class="so">0</b><span class="nm">${esc(nO)} ◯</span></div>
        <div class="dr-pens" hidden></div><ol class="dr-feed"></ol><div class="dr-final" hidden></div>
        <div class="row" style="justify-content:center"><button class="btn" type="button" data-a="skip">Pular para o fim</button></div></div>
        <div class="dr-teams">${tm("X",S.tx)}${tm("O",S.to)}</div>${LE?leExtra(nX,nO):RC?rcExtra(nX,nO):""}`}
    st.innerHTML=h;renderAway();tick();
    if(LE&&S.ph==="pick")setTimeout(()=>st.querySelectorAll(".award-card[data-flip]").forEach(c=>{c.removeAttribute("data-flip");c.classList.add("flipped")}),250);
    if(LE&&S.last&&S.last.auc&&(S.last.t==="won"||S.last.t==="ok"||S.last.t==="rcr")&&Date.now()-S.last.ts<6000){const k=S.code+":"+S.game+":"+S.last.pid;if(k!==revKey){revKey=k;leReveal(S.last.m,S.last.pid,S.last.amt,nX,nO)}}
    if(S.ph==="match")playMatch(nX,nO)}
  /* narração: 90 minutos em ~20 s, depois os pênaltis, um a cada 0,9 s */
  function playMatch(nX,nO){clearInterval(animT);const R=drSim(S),pl=id=>id?ST.P.find(p=>p.id===id):null,MS=220,PK=900;
    const nameOf=(m,i)=>{const p=pl(team(S,m)[i]);return p?p.name:"Reserva"};
    const feed=st.querySelector(".dr-feed"),pens=st.querySelector(".dr-pens"),fin=st.querySelector(".dr-final");let shown=0,lastHtml="";
    const step=async()=>{if(!alive||!feed.isConnected){clearInterval(animT);return}const el=Date.now()-anim.t0,min=Math.min(90,Math.floor(el/MS));
      const evs=R.ev.filter(e=>e.min<=min);
      if(evs.length!==shown){shown=evs.length;feed.innerHTML=evs.slice().reverse().map(e=>`<li class="${e.t} ${e.m.toLowerCase()}"><span class="mn">${e.min}'</span>${e.t==="gol"?"⚽ GOL! ":e.t==="defesa"?"🧤 ":"↗ "}<b>${esc(nameOf(e.m,e.i))}</b>${e.t==="gol"?"":e.t==="defesa"?` parou em ${esc(nameOf(e.m==="X"?"O":"X",0))}`:" chutou para fora"}</li>`).join("")}
      st.querySelector(".sx").textContent=evs.filter(e=>e.t==="gol"&&e.m==="X").length;st.querySelector(".so").textContent=evs.filter(e=>e.t==="gol"&&e.m==="O").length;
      st.querySelector(".dr-min").textContent=min<90?min+"'":"FIM";
      let done=min>=90;
      if(done&&R.pen.length){const pe=el-90*MS,n=Math.min(R.pen.length,Math.floor(pe/PK)+1);pens.hidden=false;
        const row=m=>R.pen.slice(0,n).filter(x=>x.m===m).map(x=>`<i class="${x.ok?"ok":"no"}" title="${esc(nameOf(m,x.i))}"></i>`).join("");
        const lastK=R.pen[n-1];
        const ht=`<small class="fg-kick">Pênaltis</small><div class="dr-pr"><span>✕ ${esc(nX)}</span>${row("X")}</div><div class="dr-pr"><span>◯ ${esc(nO)}</span>${row("O")}</div><p class="muted">${esc(nameOf(lastK.m,lastK.i))} ${lastK.ok?"converteu":"perdeu"}.</p>`;
        if(ht!==lastHtml){pens.innerHTML=ht;lastHtml=ht}done=n>=R.pen.length&&pe>=R.pen.length*PK}
      if(done&&fin.hidden){clearInterval(animT);const seat=mySeat(),w=R.win,sc=`${R.gx} x ${R.go}${R.pen.length?` (pênaltis ${R.px} x ${R.po})`:""}`;
        fin.hidden=false;fin.innerHTML=`<b>${mode==="local"?`${esc(w==="X"?nX:nO)} venceu! 🐐`:w===seat?"VOCÊ VENCEU! 🐐":"O adversário venceu."}</b><span>${sc}</span><div class="row" style="justify-content:center"><button class="btn y" type="button" data-a="again">Revanche</button><button class="btn" type="button" data-a="share">Copiar resultado</button></div>`;
        const sk=st.querySelector("[data-a=skip]");sk&&sk.parentElement.remove()}};
    step();animT=setInterval(step,120)}
  st.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!S||b.disabled)return;
    if(b.dataset.a==="again"){push(fresh({...S,seq:S.seq+1}));return}
    if(b.dataset.a==="skip"){if(anim)anim.t0=Date.now()-1e6;return}
    if(b.dataset.a==="share"){const R=drSim(S);share(`🐐 THE FENÔMENO · ${RC?"RECONSTRUINDO":MA?"MALETA":LE?"LEILÃO ("+fmtK(S.cfg.bud)+")":"DRAFT ("+(DR_LG[S.cfg.lg]||DR_LG.eu).name+")"}\n✕ ${R.gx} x ${R.go} ◯${R.pen.length?`\nPênaltis: ${R.px} x ${R.po}`:""}`);return}
    if(RC){const a=b.dataset.a;if(a==="rc-next"&&S.ph==="show"){rcNext();return}
      if(S.ph==="match"||mySeat()!==S.turn)return;
      if(S.ph==="pick"){if(a==="rc-opt"){const i=+b.dataset.i;rcSel=rcSel===i?-1:i;render();return}
        if(a==="rc-ok"&&rcSel>=0){rcPick(rcSel);return}if(a==="rc-pass"){rcPick(-1);return}return}
      if(S.ph==="bid"){if(a==="rc-raise"){rcRaise(+b.dataset.v);return}if(a==="rc-fold"){rcFold();return}}
      return}
    if(MA){const a=b.dataset.a;if(S.ph==="show"&&a==="ma-next"){maNextRound();return}
      if(S.ph==="match"||mySeat()!==S.turn)return;
      if((S.ph==="pick1"||S.ph==="pick2")&&a==="ma-case"){const i=+b.dataset.i;if(S.rv.includes(i))return;maPick(i);return}
      if(S.ph==="swappick"&&a==="ma-case"){const i=+b.dataset.i;if(S.rv.includes(i))return;maSwapPick(i);return}
      if(S.ph==="swap"&&(a==="ma-swap"||a==="ma-keep")){if(a==="ma-swap"&&S.rv.length>=5)return;maSwap(a==="ma-swap");return}
      return}
    if(LE&&S.ph==="pick"){const a=b.dataset.a;if(a==="le-go"){leGo();return}const m=mySeat();if(!m||S.pk[m]||S.turn!==m)return;
      if(a==="le-card"){const i=+b.dataset.i;selPick=selPick.includes(i)?selPick.filter(x=>x!==i):selPick.length<2?selPick.concat(i):selPick;render();return}
      if(a==="le-confirm"&&selPick.length===2)lePickConfirm(selPick.map(i=>S.opts[m][i]));return}
    if(LE){if(S.ph==="match"||mySeat()!==S.turn)return;const a=b.dataset.a;
      if(S.ph==="ask"&&a==="le-yes"){if(leCan(S,S.turn))leAnswer(true);return}
      if(S.ph==="ask"&&a==="le-no"){leAnswer(false);return}
      if(S.ph==="bid"&&a==="le-raise"){leRaise(+b.dataset.v);return}
      if(S.ph==="bid"&&a==="le-fold"){leFold();return}
      if(S.ph==="place"&&b.dataset.slot!=null&&S.pend){const slot=+b.dataset.slot;if(!leSlots(pl(S.pend.pid),leTeam(S,S.turn)).includes(slot))return;const s=cp(S);s.seq++;lePlaceIn(s,slot)}
      return}
    if(S.ph!=="draft"||mySeat()!==S.turn)return;
    if(b.dataset.a==="pass"){advance({...S,seq:S.seq+1,last:{t:"pass",m:S.turn}});return}
    if(b.dataset.a==="reroll"){if(S.rr[S.turn]<1)return;const nd=drDraw(S.cfg,S.used,emptyOf(S,S.turn));push({...S,seq:S.seq+1,draw:nd,rr:{...S.rr,[S.turn]:S.rr[S.turn]-1}});return}
    if(b.dataset.slot==null)return;const slot=+b.dataset.slot,d=S.draw,seq0=S.seq;if(!d)return;
    const L=DR_LG[S.cfg.lg]||DR_LG.eu;
    const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="box"><h3>${d.c!=null?clubCrest(d.c)+esc(drCN(d.c)):esc(L.any)} + ${d.n!=null?`<i class="flag">${flag(ST.NATS[d.n][1])}</i>${esc(natName(d.n))}`:"qualquer seleção"}</h3><p class="muted" style="margin:0 0 8px">Para ${DR_NAME[slot].toLowerCase()}: só vale quem joga ou jogou nessa posição. Vale qualquer passagem pelo clube, inclusive de aposentados.</p><div class="s"></div><div class="row" style="margin-top:12px"><button class="btn" data-x>Cancelar</button></div></div>`;
    document.body.appendChild(m);const close=()=>m.remove();m.addEventListener("click",ev=>{if(ev.target===m||ev.target.closest("[data-x]"))close()});
    const inp=makeSearch(m.querySelector(".s"),{sub:p=>drPosAb(p,slot),onPick(p){if(!S||S.seq!==seq0||mySeat()!==S.turn||team(S,S.turn)[slot]){close();toast("A jogada mudou, tente de novo");return}
      if(S.used.includes(p.id)){toast(`${p.name} já foi contratado nesta partida`);return}
      if(d.n!=null&&p.nat!==d.n){toast(`${p.name} é da seleção ${p.nat!=null&&ST.NATS[p.nat]?natName(p.nat):"?"}`);return}
      if(!drFits(p,d,S.cfg)){toast(`${p.name} não passou ${d.c!=null?"pelo "+drCN(d.c):"por "+L.any}`);return}
      if(!drCanPlay(p,slot)){toast(drPosOf(p).length?`${p.name} joga de ${drPosTxt(p)}: não dá para ${DR_NAME[slot].toLowerCase()}`:`${p.name} não tem posição registrada na base`);return}
      close();place(slot,p)}});
    setTimeout(()=>inp.focus(),30)});
}

/* 18. LEILÃO (multiplayer): cada um tem um orçamento para montar o time. O craque aparece para os dois: QUER? Se os dois querem, vai a leilão a partir do preço de mercado.
   Preços em milhares de euros. Time completo dos dois = partida simulada (a mesma do Draft). Quem não completa o time joga com reservas fracos. */
