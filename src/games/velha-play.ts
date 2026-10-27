// @ts-nocheck
import {$, BODEHEAD, clubCrest, clubName, esc, face, flag, natName, toast, year} from "../core";
import {ST} from "../state";
import {makeSearch} from "../search";
import {GAMES, share} from "../engine";
import {VL, VL_ART, VL_MD, VL_TROF, VL_TURN, critLabel, critText, loadPass, vlCode, vlFits, vlGrid, vlIn, vlLine} from "./velha";
import {mqttRoom} from "../mqtt";
import {pfGet, pfImg} from "../profile";
import {cleanup} from "../home";
export const vlOk=s=>s&&typeof s==="object"&&s.cfg&&VL[s.cfg.lg]&&VL_MD[s.cfg.md]&&VL_TURN[s.cfg.diff]&&Array.isArray(s.b)&&s.b.length===9&&Array.isArray(s.used)&&typeof s.seq==="number";
export async function vlPlay({mode,cfg,code,pfs}){ST.VIEW="velha";ST.PHASE="play";cleanup();
  const app=$("#app");let alive=true,timer=null,nr=null,offPeers=null,me=null,S=null,pend=null,nextT=null;
  ST.CLEAN=()=>{alive=false;clearInterval(timer);clearTimeout(nextT);offPeers&&offPeers();nr&&nr.leave().catch(()=>{})};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Sair</button><h2>JOGO DA <b>VELHA</b></h2><span class="spacer"></span></div><div class="stage vl-stage"><div class="fg-load"><img src="${BODEHEAD}" alt=""><b>${mode==="join"?"PROCURANDO A PARTIDA…":"PREPARANDO O CAMPO…"}</b></div></div>`;
  const st=app.querySelector(".stage");await loadPass();if(!alive)return;
  app.querySelector(".back").addEventListener("click",()=>{if(S&&!S.over&&mode!=="local"&&!confirm("Sair da partida?"))return;GAMES.velha.open()});
  const fail=(msg,local)=>{if(!alive)return;st.innerHTML=`<div class="vl-box vl-msg"><h3 class="d">OPS</h3><p>${msg}</p><div class="row">${local?`<button class="btn y" type="button" data-a="local">Jogar no mesmo aparelho</button>`:""}<button class="btn" type="button" data-a="back">Voltar</button></div></div>`;
    st.querySelector("[data-a=back]").onclick=()=>GAMES.velha.open();const l=st.querySelector("[data-a=local]");l&&(l.onclick=()=>vlPlay({mode:"local",cfg:cfg||{diff:"normal",lg:"ucl",md:3}}))};
  const keyOf=p=>p.by||p.peer;
  const newRound=(s,first)=>{const g=vlGrid(s.cfg);const starter=first?"X":(s.starter==="X"?"O":"X");
    return{...s,seq:s.seq+1,round:first?1:s.round+1,starter,turn:starter,g,b:Array(9).fill(null),used:[],win:null,last:null,dl:Date.now()+VL_TURN[s.cfg.diff]*1000}};
  // publica um estado novo (o meu passa a valer se o seq for maior)
  const push=s=>{S=s;render();if(nr)nr.presence({st:s}).catch(()=>{})};
  const mySeat=()=>mode==="local"?S.turn:(S.X===me?"X":S.O===me?"O":null);

  if(mode!=="local"){
    const room=window.claude?await claude.use("room").catch(()=>null):await mqttRoom().catch(()=>null);
    if(!alive)return;
    if(!room)return fail(window.claude?"O multiplayer não está disponível aqui. Ele funciona dentro do claude.ai, para quem está logado e tem acesso a esta página.":"Não deu para conectar no servidor da partida. Confira a internet e tente de novo.",true);
    code=code||vlCode();
    try{nr=await room.join("velha-"+code.toLowerCase())}catch(e){return fail(e&&e.code==="not_permitted"?"Sua conta não pode entrar em salas nesta página. Peça para quem compartilhou te convidar pelo e-mail no claude.ai.":"Não deu para abrir a sala. Tente de novo em instantes.",true)}
    if(!alive){nr.leave().catch(()=>{});return}
    const meP=()=>nr.peers().find(p=>p.sameTab);
    offPeers=nr.onPeers(ch=>{if(!me){const m=meP();if(m)me=keyOf(m)}
      let best=null;for(const p of ch.peers){const s=p.presence&&p.presence.st;if(vlOk(s)&&s.code===code&&(!best||s.seq>best.seq))best=s}
      if(best&&(!S||best.seq>S.seq)){S=best;render()}else if(S)renderPeers()});
    const waitMe=async()=>{for(let i=0;i<50&&!me&&alive;i++){const m=meP();if(m)me=keyOf(m);else await new Promise(r=>setTimeout(r,100))}};
    await waitMe();if(!alive)return;if(!me)return fail("Não deu para conectar na sala.",true);
    if(mode==="host"){push(newRound({code,cfg,seq:0,X:me,O:null,sx:0,so:0,over:null,pf:{X:pfGet("P1")}},true))}
    else{const t0=Date.now();while(alive&&!S&&Date.now()-t0<9000)await new Promise(r=>setTimeout(r,200));
      if(!alive)return;if(!S)return fail(`Não achei a partida <b>${esc(code)}</b>. Confira o código e peça para quem criou deixar a tela da partida aberta.`);
      cfg=S.cfg;if(!S.O&&S.X!==me)push({...S,seq:S.seq+1,O:me,pf:{...S.pf,O:pfGet("P2")},dl:Date.now()+VL_TURN[S.cfg.diff]*1000});else render()}
  }else{code="LOCAL";push(newRound({code,cfg,seq:0,X:"x",O:"o",sx:0,so:0,over:null,pf:pfs?{X:pfs[0],O:pfs[1]}:undefined},true))}
  timer=setInterval(tick,250);

  function tick(){if(!S||!S.O||S.win||S.over)return;const left=S.dl-Date.now(),el=st.querySelector(".vl-clock");
    if(el){const s=Math.max(0,Math.ceil(left/1000));el.textContent=`${s}s`;el.classList.toggle("low",s<=10)}
    // o tempo acabou: quem está na vez passa; se ele sumiu, o outro passa por ele depois de 4 s
    if(left<=0&&(mySeat()===S.turn||left<-4000)&&!pend){pend=1;setTimeout(()=>pend=null,800);move(null,null,"tempo")}}
  function move(cell,p,why){const s={...S,seq:S.seq+1,b:S.b.slice(),used:S.used.slice()},who=S.turn;
    if(p&&cell!=null&&!why){s.b[cell]=[who,p.id];s.used.push(p.id);s.last={t:"ok",m:who,pid:p.id,c:cell}}else s.last={t:why||"x",m:who,pid:p?p.id:null,c:cell};
    const ln=vlLine(s.b);
    if(ln){s.win=ln.m;s.line=ln.l;s[ln.m==="X"?"sx":"so"]++;if(s[ln.m==="X"?"sx":"so"]>=VL_MD[s.cfg.md])s.over=ln.m}
    else if(s.b.every(Boolean)){s.win="D"}
    else{s.turn=who==="X"?"O":"X";s.dl=Date.now()+VL_TURN[s.cfg.diff]*1000}
    push(s);
    if(s.win&&!s.over)schedNext()}
  function schedNext(){clearTimeout(nextT);nextT=setTimeout(()=>{if(!alive||!S||!S.win||S.over)return;
      // quem cria a rodada nova é o anfitrião (X); no aparelho único, a própria página
      if(mode==="local"||S.X===me)push(newRound(S,false))},3200)}
  async function names(){const ids=[S.X,S.O].filter(k=>k&&k.startsWith("u_"));let ps={};
    try{const u=await claude.use("user");if(u&&ids.length)ps=await u.profiles(ids)}catch(e){}
    const nm=k=>{const seat=S&&k===S.X?"X":S&&k===S.O?"O":null,pn=seat&&S.pf&&S.pf[seat]&&S.pf[seat].n;return pn||(mode==="local"?(k==="x"?"P1":"P2"):k===me?"Você":(ps[k]&&ps[k].name)||"Adversário")};return nm}
  function renderPeers(){const el=st.querySelector(".vl-away");if(!el||mode==="local"||!nr)return;const here=new Set(nr.peers().map(keyOf));
    const opp=mySeat()==="X"?S.O:S.X;el.hidden=!(opp&&!here.has(opp)&&!S.over)}
  async function render(){if(!alive||!S)return;const nm=await names();if(!alive)return;
    const seat=mySeat(),L=VL[S.cfg.lg],tgt=VL_MD[S.cfg.md];
    if(!S.O){st.innerHTML=`<div class="vl-box vl-wait"><small>Código da partida</small><div class="vl-bigcode">${esc(S.code)}</div><img class="vl-tr" src="${VL_TROF[S.cfg.lg]}" alt="Troféu da ${esc(L.name)}">
        <p>${esc(L.name)} · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · MD${S.cfg.md}</p>
        <div class="row" style="justify-content:center"><button class="btn y" type="button" data-a="copy">Copiar código</button><button class="btn" type="button" data-a="invite">Copiar convite para o WhatsApp</button></div>
        <p class="muted">Esperando o adversário entrar… deixe esta tela aberta.</p></div>`;
      st.querySelector("[data-a=copy]").onclick=()=>share(S.code);
      st.querySelector("[data-a=invite]").onclick=()=>share(`🐐⚽ Bora um Jogo da Velha de futebol no The Fenômeno?\n${L.name} · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · MD${S.cfg.md}\nCódigo da partida: ${S.code}\nAbra ${/vercel\.app$/.test(location.hostname)?location.origin:VL_ART} → Jogo da Velha → Entrar em jogo`);
      return}
    if(!S.g){st.innerHTML=`<p class="muted">Não deu para montar a grade desta liga. Volte e tente outra.</p>`;return}
    const mine=seat===S.turn&&!S.win&&!S.over;
    const chip=(m)=>`<div class="vl-p ${m.toLowerCase()} ${S.turn===m&&!S.win&&!S.over?"on":""}"><span class="vl-mk">${m==="X"?"✕":"◯"}</span>${pfImg(S,m)}<span class="vl-nm"></span><b>${m==="X"?S.sx:S.so}</b></div>`;
    const lastP=S.last&&S.last.pid?ST.P.find(p=>p.id===S.last.pid):null;
    const status=S.over?(mode==="local"?`<b>${esc(nm(S.over==="X"?S.X:S.O))} venceu a partida!</b>`:S.over===seat?"<b>VOCÊ VENCEU A PARTIDA! 🐐</b>":"<b>Fim de jogo: o adversário levou.</b>")
      :S.win?(S.win==="D"?"Deu velha! Ninguém pontua. Próxima rodada já vem…":`${S.win===seat&&mode!=="local"?"Você ganhou a rodada!":esc(nm(S.win==="X"?S.X:S.O))+" ganhou a rodada!"} Próxima já vem…`)
      :mine?`<b>${mode==="local"?esc(nm(S.turn==="X"?S.X:S.O))+", sua vez":"Sua vez"}</b>: clique numa casa e diga o jogador.`:`Vez de ${esc(nm(S.turn==="X"?S.X:S.O))}…`;
    const lastTxt=S.last?(S.last.t==="ok"?`${S.last.m==="X"?"✕":"◯"} cravou ${esc(lastP?lastP.name:"um jogador")}.`:S.last.t==="tempo"?`${S.last.m==="X"?"✕":"◯"} perdeu a vez no tempo.`:S.last.t==="pass"?`${S.last.m==="X"?"✕":"◯"} passou a vez.`:`${S.last.m==="X"?"✕":"◯"} errou${lastP?` (${esc(lastP.name)})`:""}.`):"";
    let h=`<div class="vl-head">${chip("X")}<div class="vl-mid"><small>${esc(L.name)} · ${S.cfg.diff==="hard"?"DIFÍCIL":"NORMAL"}</small><b>Rodada ${S.round}</b><small>MD${S.cfg.md} · vence quem fizer ${tgt}</small></div>${chip("O")}</div>
      <div class="vl-status ${mine?"mine":""}"><span>${status}</span>${!S.win&&!S.over?`<span class="pill vl-clock"></span>`:""}</div>
      <p class="vl-away hardnote" hidden>O adversário saiu da página. Se não voltar, a vez passa sozinha.</p>
      <div class="grid3 vl-grid"><div class="corner"><img src="${BODEHEAD}" alt=""><small>${S.code==="LOCAL"?"local":esc(S.code)}</small></div>`;
    h+=S.g.c.map(c=>`<div class="gh">${clubCrest(c)}<span>${esc(clubName(c))}</span></div>`).join("");
    S.g.r.forEach((cr,ri)=>{h+=`<div class="gh">${critLabel(cr)}</div>`;S.g.c.forEach((c,ci)=>{const i=ri*3+ci,v=S.b[i];
      if(v){const p=ST.P.find(x=>x.id===v[1]);h+=`<div class="cell vl-c ${v[0].toLowerCase()} ${S.line&&S.win===v[0]&&S.line.includes(i)?"lin":""}"><span class="vl-mark">${v[0]==="X"?"✕":"◯"}</span>${p?face(p):""}<div class="nm">${esc(p?p.name:"")}</div></div>`}
      else h+=`<button type="button" class="cell" data-i="${i}" ${mine?"":"disabled"} aria-label="${esc(clubName(c))} e ${esc(critText(cr))}"></button>`})});
    h+=`</div><div class="row vl-act">${mine?`<button class="btn" type="button" data-a="pass">Passar a vez</button>`:""}${S.over?`<button class="btn y" type="button" data-a="again">Revanche</button><button class="btn" type="button" data-a="share">Gerar card</button>`:""}<span class="muted vl-last">${lastTxt}</span></div>`;
    st.innerHTML=h;
    st.querySelectorAll(".vl-p").forEach(el=>{const m=el.classList.contains("x")?"X":"O";el.querySelector(".vl-nm").textContent=nm(m==="X"?S.X:S.O)});
    renderPeers();tick();
    if(S.win&&!S.over)schedNext();
  }
  st.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!S)return;
    if(b.dataset.a==="pass"){if(mySeat()===S.turn&&!S.win)move(null,null,"pass");return}
    if(b.dataset.a==="again"){push(newRound({...S,sx:0,so:0,over:null},true));return}
    if(b.dataset.a==="share"){share(`🐐 THE FENÔMENO · JOGO DA VELHA\n${VL[S.cfg.lg].name} · ${S.cfg.diff==="hard"?"Difícil":"Normal"} · MD${S.cfg.md}\n✕ ${S.sx} x ${S.so} ◯`);return}
    if(!b.classList.contains("cell")||b.disabled)return;const i=+b.dataset.i,cr=S.g.r[Math.floor(i/3)],c=S.g.c[i%3],seq0=S.seq;
    const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="box"><h3>${clubCrest(c)}${esc(clubName(c))} + ${cr[0]==="n"?`<i class="flag">${flag(ST.NATS[cr[1]][1])}</i>`:""}${esc(critText(cr))}</h3><div class="s"></div><p class="muted" style="font-size:13px;margin:10px 0 0">Vale qualquer passagem pelo clube como profissional. Errou, a vez passa.</p><div class="row" style="margin-top:12px"><button class="btn" data-x>Cancelar</button></div></div>`;
    document.body.appendChild(m);const close=()=>m.remove();m.addEventListener("click",ev=>{if(ev.target===m||ev.target.closest("[data-x]"))close()});
    const inp=makeSearch(m.querySelector(".s"),{onPick(p){close();if(!S||S.seq!==seq0||S.b[i]||mySeat()!==S.turn){toast("A jogada mudou, tente de novo");return}
      if(S.used.includes(p.id)){toast("Esse jogador já foi usado nesta rodada");return}
      if(vlFits(p,c,cr))move(i,p);else{toast(vlIn(p,c)?`${p.name}: ${natName(p.nat)}, nasceu em ${year(p)||"?"}`:`${p.name} não passou pelo ${clubName(c)}`);move(i,p,"x")}}});
    setTimeout(()=>inp.focus(),30)});
}

/* 17. DRAFT (multiplayer): cada um monta um 4-3-3 com o sorteio da vez (clube, seleção ou os dois).
   Cada jogador só entra nas posições em que joga ou jogou (Transfermarkt). No fim, partida simulada e, se empatar, pênaltis */
