// @ts-nocheck
/* SALA AO VIVO: o streamer cria a sala e manda o link; cada pessoa do chat joga no próprio celular, cada um por si, com placar ao vivo.
   Arquitetura: o navegador do STREAMER é o servidor da sala (host autoritativo). Ele sorteia o desafio, recebe as respostas, confere e pontua.
   Cada jogador só assina o estado da sala e o próprio resultado, então o tráfego cresce linear com o número de jogadores (o host recebe N respostas por rodada).
   Transporte: o mesmo broker MQTT público das outras salas. Sem servidor novo.
   LIMITES CONHECIDOS (ver docs/HANDOFF.md): quem abrir o DevTools consegue achar a resposta de Mais Velho (a base de jogadores está no navegador);
   se o host fechar a aba a sala acaba; broker público não tem garantia de capacidade. Pra premiar de verdade, mover o host pra um servidor. */
import {ST} from "./state";
import {$, esc, natName, clubName, year, fmtDate, shuffle, norm, toast} from "./core";
import {loadScript} from "./games/futgeo";
import {groupsBy} from "./games/conexoes";
import {MQTT_LIB, VL_BROKERS, vlPeerId} from "./mqtt";
import {makeSearch} from "./search";
import {ev} from "./track";

const ROOT="thefenomeno-jogos/live/v1/",QR_LIB="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
const CODE_CH="ABCDEFGHJKMNPQRSTUVWXYZ23456789",MAX_PLAYERS=300,REVEAL_MS=7000;
const newCode=()=>Array.from({length:4},()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join("");
const R=Math.random,pickOf=a=>a[Math.floor(R()*a.length)];
const TYPES={velho:{label:"Quem nasceu primeiro?",len:10},imp:{label:"Quem é o impostor?",len:15},quem:{label:"Quem é o jogador?",len:25},esc:{label:"De que clube é o escudo?",len:25}};
const PATTERN=["velho","imp","quem","velho","esc","imp","quem","velho","esc","imp"];
/* lista curta e básica; o host também pode expulsar. Não é moderação completa. */
const BAD=["nazi","hitler","estupr","pedofil","puta","caralho","porra","viado","buceta","cuzao","arrombad","macaco","preto fedido"];
export const cleanNick=s=>String(s||"").replace(/[^\p{L}\p{N} _.\-]/gu,"").replace(/\s+/g," ").trim().slice(0,14);
const badNick=s=>{const n=norm(s).replace(/[^a-z0-9 ]/g,"");return BAD.some(b=>n.includes(b))};

async function connect(code,will){
  await loadScript(MQTT_LIB);if(!window.mqtt)throw new Error("mqtt");
  return new Promise((ok,no)=>{let i=0;const next=()=>{if(i>=VL_BROKERS.length)return no(new Error("broker"));
    const c=mqtt.connect(VL_BROKERS[i++],{clientId:"fenlive_"+vlPeerId()+"_"+Math.random().toString(36).slice(2,6),clean:true,connectTimeout:6000,reconnectPeriod:2000,keepalive:20,...(will?{will}:{})});
    let done=false;const bad=()=>{if(done)return;done=true;clearTimeout(t);c.end(true);next()};const t=setTimeout(bad,7000);
    c.once("connect",()=>{if(done)return;done=true;clearTimeout(t);ok(c)});c.once("error",bad)};next()})}
const send=(c,topic,obj,retain=false)=>c.publish(topic,obj===""?"":JSON.stringify(obj),{qos:1,retain});

/* ---------- desafios (só o host sabe a resposta) ---------- */
const famPhoto=()=>ST.FAM.filter(p=>ST.FOTOS[p.id]&&p.birth);
function makeRound(tp){
  const L=famPhoto();
  if(tp==="velho"){let a,b,t=0;do{a=pickOf(L);b=pickOf(L);t++}while(t<500&&(a.id===b.id||a.birth===b.birth));
    const side=p=>({n:p.name,i:ST.FOTOS[p.id],c:natName(p.nat)});
    return{pz:{a:side(a),b:side(b)},ans:a.birth<b.birth?"a":"b",reveal:{a:fmtDate(a.birth),b:fmtDate(b.birth)}}}
  if(tp==="imp"){const T={nat:p=>p.nat,club:p=>p.club},ty=pickOf(["nat","club"]);
    const [k,mem]=pickOf(groupsBy(L,T[ty],4));const four=shuffle(R,mem).slice(0,4);
    const imp=pickOf(L.filter(p=>T[ty](p)!==k));const five=shuffle(R,[...four,imp]);
    return{pz:{five:five.map(p=>({n:p.name,i:ST.FOTOS[p.id]}))},ans:five.indexOf(imp),
      reveal:{why:ty==="nat"?"Os quatro são da seleção "+natName(k):"Os quatro passaram por "+clubName(k),who:imp.name}}}
  if(tp==="quem"){const p=pickOf(L);return{pz:{i:ST.FOTOS[p.id]},ans:p.id,reveal:{name:p.name,sub:clubName(p.club)}}}
  const cs=ST.CRESTS.filter(c=>ST.ESC[c.id]),c=pickOf(cs);return{pz:{i:ST.ESC[c.id]},ans:c.id,reveal:{name:c.name,sub:c.pais||""}}}

/* =============================== HOST =============================== */
export async function liveHost(){
  const app=$("#app");app.innerHTML=`<div class="lv"><p class="lv-msg">Abrindo a sala…</p></div>`;
  let client,code,B;
  try{client=await connect()}catch(e){app.innerHTML=`<div class="lv"><p class="lv-msg">Não consegui conectar ao servidor de salas. Recarregue a página.</p></div>`;return}
  /* escolhe um código que ninguém esteja usando */
  for(let t=0;t<6;t++){code=newCode();B=ROOT+code;const used=await new Promise(res=>{let hit=false;const h=(tp,b)=>{if(tp===B+"/s"&&b.length){try{if(JSON.parse(b.toString()).ph!=="end")hit=true}catch(e){}}};client.on("message",h);client.subscribe(B+"/s",{qos:1});setTimeout(()=>{client.off("message",h);client.unsubscribe(B+"/s");res(hit)},700)});if(!used)break}
  const S={ph:"lobby",r:-1,tot:8,cur:null,players:new Map(),timer:null,t0:0,top:[],stats:null};
  const roomUrl=location.origin+"/?sala="+code;
  const rank=()=>[...S.players.entries()].map(([id,p])=>({id,nick:p.nick,score:p.score})).sort((a,b)=>b.score-a.score||a.nick.localeCompare(b.nick));
  const pubState=()=>{const o={v:1,ph:S.ph,r:S.r,tot:S.tot,n:S.players.size,top:rank().slice(0,10).map(x=>[x.nick,x.score])};
    if(S.cur){o.tp=S.cur.tp;o.len=S.cur.len;o.pz=S.cur.pz;o.an=S.cur.answered;if(S.ph==="reveal"||S.ph==="end")o.rv=S.cur.reveal,o.ok=S.cur.ok}
    send(client,B+"/s",o,true)};
  client.subscribe([B+"/j/+",B+"/a/+"],{qos:1});
  client.on("message",(tp,buf)=>{const m=tp.slice(B.length+1).split("/"),kind=m[0],id=m[1];if(!id||!/^[a-z0-9]{4,20}$/.test(id))return;let o=null;const txt=buf.toString();if(txt){try{o=JSON.parse(txt)}catch(e){return}}
    if(kind==="j"){if(!o){if(S.ph==="lobby")S.players.delete(id);render();return}
      if(S.players.has(id)||S.players.size>=MAX_PLAYERS)return;let nick=cleanNick(o.nick);if(nick.length<2||badNick(nick)){send(client,B+"/p/"+id,{kick:1,why:"apelido"});return}
      const names=new Set([...S.players.values()].map(p=>p.nick.toLowerCase()));let n2=nick,k=2;while(names.has(n2.toLowerCase()))n2=nick.slice(0,12)+" "+k++;
      S.players.set(id,{nick:n2,score:0,ans:{}});send(client,B+"/p/"+id,{hello:1,nick:n2});if(S.ph==="lobby")pubState();render();return}
    if(kind==="a"&&o&&S.ph==="round"&&S.cur&&o.r===S.r){const p=S.players.get(id);if(!p||p.ans[S.r]!==undefined)return;
      const el=Date.now()-S.t0,ok=o.v!==undefined&&o.v!==null&&o.v!==""&&(S.cur.tp==="velho"?o.v===S.cur.ans:String(o.v)===String(S.cur.ans));
      const pts=ok?Math.round(400+600*Math.max(0,1-el/(S.cur.len*1000))):0;p.ans[S.r]={ok,pts};p.score+=pts;S.cur.answered++;if(ok)S.cur.ok++;
      renderLive();if(S.cur.answered>=S.players.size&&S.players.size)finishRound()}});
  function nextRound(){clearTimeout(S.timer);S.r++;if(S.r>=S.tot){return endGame()}
    const tp=PATTERN[S.r%PATTERN.length],T=TYPES[tp],rd=makeRound(tp);S.cur={tp,len:T.len,pz:rd.pz,ans:rd.ans,reveal:rd.reveal,answered:0,ok:0};
    S.ph="round";S.t0=Date.now();pubState();render();S.timer=setTimeout(finishRound,T.len*1000+500)}
  function finishRound(){if(S.ph!=="round")return;clearTimeout(S.timer);S.ph="reveal";const rk=rank();
    rk.forEach((x,i)=>{const p=S.players.get(x.id),a=p.ans[S.r];send(client,B+"/p/"+x.id,{r:S.r,ok:!!(a&&a.ok),pts:a?a.pts:0,score:p.score,rank:i+1,of:rk.length})});
    pubState();render();S.timer=setTimeout(nextRound,REVEAL_MS)}
  function endGame(){S.ph="end";const rk=rank();rk.forEach((x,i)=>send(client,B+"/p/"+x.id,{end:1,score:x.score,rank:i+1,of:rk.length}));pubState();render();ev("live_end",{players:S.players.size,rounds:S.tot})}
  function start(){if(S.ph!=="lobby")return;S.r=-1;ev("live_start",{players:S.players.size,rounds:S.tot});nextRound()}
  const kick=id=>{send(client,B+"/p/"+id,{kick:1});S.players.delete(id);pubState();render()};

  /* ---- tela do host (feita pra captura 1080p no OBS) ---- */
  let qrSvg="";loadScript(QR_LIB).then(()=>{try{const q=qrcode(0,"M");q.addData(roomUrl);q.make();qrSvg=q.createSvgTag(6,0);render()}catch(e){}}).catch(()=>{});
  const pz=()=>{const c=S.cur;if(!c)return"";
    if(c.tp==="velho")return`<div class="lv-duel">${["a","b"].map(k=>`<div class="lv-pc ${S.ph==="reveal"?(c.ans===k?"right":"dim"):""}"><img src="${c.pz[k].i}" alt=""><b>${esc(c.pz[k].n)}</b><small>${esc(c.pz[k].c)}</small>${S.ph==="reveal"?`<em>${c.reveal[k]}</em>`:""}</div>`).join("")}</div>`;
    if(c.tp==="imp")return`<div class="lv-five">${c.pz.five.map((p,i)=>`<div class="lv-pc ${S.ph==="reveal"?(c.ans===i?"right":"dim"):""}"><span class="lv-n">${i+1}</span><img src="${p.i}" alt=""><b>${esc(p.n)}</b></div>`).join("")}</div>`;
    return`<div class="lv-clear"><img class="lv-blur ${S.ph==="round"?"go":"done"}" style="--len:${c.len}s" src="${c.pz.i}" alt=""></div>`};
  const board=n=>`<ol class="lv-top5">${rank().slice(0,n).map((x,i)=>`<li><span>${i+1}</span><b>${esc(x.nick)}</b><em>${x.score}</em></li>`).join("")}</ol>`;
  function render(){const body=app.querySelector(".lv-body");if(!body){app.innerHTML=`<div class="lv host"><div class="lv-head"><b class="d">SALA AO VIVO</b><span class="lv-pill" id="lvn"></span></div><div class="lv-body"></div></div>`}
    const b=app.querySelector(".lv-body");app.querySelector("#lvn").textContent=S.players.size+" jogando";
    if(S.ph==="lobby"){b.innerHTML=`<div class="lv-lobby"><div class="lv-join"><small>ENTRE PELO CELULAR</small><div class="lv-code">${code}</div><a class="lv-link" href="${roomUrl}" target="_blank" rel="noopener">${roomUrl.replace(/^https?:\/\//,"")}</a>${qrSvg?`<div class="lv-qr">${qrSvg}</div>`:""}
        <div class="lv-set"><label>Rodadas <select id="lvtot">${[5,8,10].map(n=>`<option ${n===S.tot?"selected":""}>${n}</option>`).join("")}</select></label><button class="btn y" id="lvgo">COMEÇAR</button></div></div>
      <div class="lv-who"><h3 class="d">QUEM ENTROU</h3><div class="lv-chips">${[...S.players.entries()].slice(-80).map(([id,p])=>`<span class="lv-chip">${esc(p.nick)}<button data-k="${id}" aria-label="Expulsar ${esc(p.nick)}">×</button></span>`).join("")||`<span class="muted">Aguardando o chat entrar…</span>`}</div></div></div>`;
      b.querySelector("#lvgo").onclick=start;b.querySelector("#lvtot").onchange=e=>{S.tot=+e.target.value};b.querySelectorAll("[data-k]").forEach(x=>x.onclick=()=>kick(x.dataset.k));return}
    if(S.ph==="round"||S.ph==="reveal"){const c=S.cur,T=TYPES[c.tp];
      b.innerHTML=`<div class="lv-rd"><div class="lv-rh"><span>RODADA ${S.r+1}/${S.tot}</span><b class="d">${T.label}</b><span class="lv-ans" id="lvan">${c.answered}/${S.players.size} responderam</span></div>
        ${S.ph==="round"?`<div class="lv-timer"><i style="animation-duration:${c.len}s"></i></div>`:""}${pz()}
        ${S.ph==="reveal"?`<div class="lv-rev"><div class="lv-ok"><b>${S.players.size?Math.round(c.ok/S.players.size*100):0}%</b> acertaram</div>${c.tp==="imp"?`<p>${esc(c.reveal.why)}. Impostor: <b>${esc(c.reveal.who)}</b></p>`:c.tp==="velho"?"":`<p>Era <b>${esc(c.reveal.name)}</b> <small>${esc(c.reveal.sub||"")}</small></p>`}${board(5)}<button class="btn" id="lvnx">Próxima rodada →</button></div>`:""}</div>`;
      const nx=b.querySelector("#lvnx");if(nx)nx.onclick=nextRound;return}
    const rk=rank();b.innerHTML=`<div class="lv-end"><h2 class="d">PÓDIO</h2><div class="lv-pod">${[1,0,2].map(i=>rk[i]?`<div class="lv-p p${i+1}"><b>${esc(rk[i].nick)}</b><em>${rk[i].score}</em><span>${i+1}º</span></div>`:"").join("")}</div>${board(10)}<button class="btn y" id="lvnew">Nova sala</button></div>`;
    b.querySelector("#lvnew").onclick=()=>{client.end(true);liveHost()}}
  const renderLive=()=>{const el=app.querySelector("#lvan");if(el&&S.cur)el.textContent=S.cur.answered+"/"+S.players.size+" responderam"};
  render();pubState();
  window.addEventListener("beforeunload",()=>{try{send(client,B+"/s",{v:1,ph:"end",r:S.r,tot:S.tot,n:0,top:[]},true)}catch(e){}});
}

/* =============================== JOGADOR =============================== */
export async function liveJoin(codeIn){
  const code=String(codeIn||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4),B=ROOT+code,me=vlPeerId(),app=$("#app");
  const view=h=>{app.innerHTML=`<div class="lv play"><div class="lv-head"><b class="d">SALA ${esc(code)}</b><span class="lv-pill" id="lvme"></span></div><div class="lv-pbody">${h}</div></div>`};
  if(code.length!==4){view(`<p class="lv-msg">Código de sala inválido.</p>`);return}
  let nick="";try{nick=localStorage.getItem("fen:livenick")||""}catch(e){}
  view(`<form class="lv-form"><label>Seu apelido<input id="lvnick" maxlength="14" autocomplete="off" value="${esc(nick)}" placeholder="Como você quer aparecer?"></label><button class="btn y" type="submit">ENTRAR NA SALA</button><small class="muted">Só o apelido aparece para os outros. Sem chat.</small></form>`);
  await new Promise(res=>{app.querySelector("form").onsubmit=e=>{e.preventDefault();const n=cleanNick(app.querySelector("#lvnick").value);if(n.length<2){toast("Use pelo menos 2 letras");return}if(badNick(n)){toast("Escolha outro apelido");return}nick=n;try{localStorage.setItem("fen:livenick",n)}catch(e){}res()}});
  view(`<p class="lv-msg">Conectando…</p>`);
  let client;try{client=await connect(code,{topic:B+"/j/"+me,payload:"",retain:false,qos:1})}catch(e){view(`<p class="lv-msg">Não consegui conectar. Tente de novo.</p>`);return}
  let S=null,mine=null,sent=null,late=false,myNick=nick,timer=null,ended=false;
  client.subscribe([B+"/s",B+"/p/"+me],{qos:1});
  const answer=v=>{if(sent!==null||!S||S.ph!=="round")return;sent=v;send(client,B+"/a/"+me,{r:S.r,v});paint()};
  client.on("message",(tp,buf,pkt)=>{const t=tp.slice(B.length+1);const txt=buf.toString();if(!txt)return;let o;try{o=JSON.parse(txt)}catch(e){return}
    if(t==="s"){const fresh=!(pkt&&pkt.retain);const prevR=S?S.r:-2,prevPh=S?S.ph:"";S=o;
      if(o.ph==="round"&&(o.r!==prevR||prevPh!=="round")){sent=null;mine=null;late=!fresh&&prevR===-2;if(late)sent="late"}
      paint();return}
    if(t==="p/"+me){if(o.kick){ended=true;view(`<p class="lv-msg">Você saiu da sala.</p>`);client.end(true);return}if(o.hello){myNick=o.nick;const el=app.querySelector("#lvme");if(el)el.textContent=myNick;return}mine=o;paint()}});
  send(client,B+"/j/"+me,{nick});
  function paint(){if(ended)return;const b=app.querySelector(".lv-pbody"),me_=app.querySelector("#lvme");if(me_)me_.textContent=myNick;if(!b)return;
    if(!S){b.innerHTML=`<p class="lv-msg">Procurando a sala ${esc(code)}…</p>`;return}
    if(S.ph==="lobby"){b.innerHTML=`<div class="lv-wait"><b class="d">VOCÊ ESTÁ DENTRO!</b><p>${S.n} ${S.n===1?"pessoa":"pessoas"} na sala. O streamer vai começar já.</p></div>`;return}
    if(S.ph==="end"){const m=mine&&mine.end?mine:null;b.innerHTML=`<div class="lv-wait"><b class="d">FIM DE JOGO</b>${m?`<div class="lv-big">${m.rank}º</div><p>de ${m.of} · ${m.score} pontos</p>`:`<p>A sala foi encerrada.</p>`}<ol class="lv-top5">${(S.top||[]).slice(0,5).map((x,i)=>`<li><span>${i+1}</span><b>${esc(x[0])}</b><em>${x[1]}</em></li>`).join("")}</ol></div>`;return}
    const T=TYPES[S.tp]||{label:""};
    if(S.ph==="reveal"){const m=mine&&mine.r===S.r?mine:null;b.innerHTML=`<div class="lv-wait ${m&&m.ok?"good":"bad"}"><b class="d">${m?(m.ok?"ACERTOU!":"NÃO FOI DESSA VEZ"):"RODADA ENCERRADA"}</b>${m?`<div class="lv-big">+${m.pts}</div><p>${m.rank}º de ${m.of} · ${m.score} pontos</p>`:"<p>Aguardando o resultado…</p>"}${S.tp==="imp"&&S.rv?`<p class="muted">${esc(S.rv.why)}</p>`:S.rv&&S.rv.name?`<p class="muted">Era <b>${esc(S.rv.name)}</b></p>`:""}<p class="muted">Próxima rodada já já…</p></div>`;return}
    /* rodada */
    clearTimeout(timer);const left=S.len;
    let h=`<div class="lv-rh"><span>RODADA ${S.r+1}/${S.tot}</span><b class="d">${T.label}</b></div><div class="lv-timer"><i style="animation-duration:${left}s"></i></div>`;
    if(sent!==null){h+=`<div class="lv-wait"><b class="d">${sent==="late"?"ENTROU NO MEIO":"RESPOSTA ENVIADA"}</b><p>${sent==="late"?"Você joga a partir da próxima rodada.":"Aguarde o resultado…"}</p></div>`;b.innerHTML=h;return}
    if(S.tp==="velho")h+=`<div class="lv-two">${["a","b"].map(k=>`<button type="button" class="lv-opt" data-v="${k}"><img src="${S.pz[k].i}" alt=""><b>${esc(S.pz[k].n)}</b><small>${esc(S.pz[k].c)}</small></button>`).join("")}</div>`;
    else if(S.tp==="imp")h+=`<div class="lv-grid5">${S.pz.five.map((p,i)=>`<button type="button" class="lv-opt" data-v="${i}"><span class="lv-n">${i+1}</span><img src="${p.i}" alt=""><b>${esc(p.n)}</b></button>`).join("")}</div>`;
    else h+=`<div class="lv-clear"><img class="lv-blur go" style="--len:${S.len}s" src="${S.pz.i}" alt=""></div><div class="lv-srch"></div>`;
    b.innerHTML=h;b.querySelectorAll(".lv-opt").forEach(x=>x.onclick=()=>answer(x.dataset.v==="a"||x.dataset.v==="b"?x.dataset.v:Number(x.dataset.v)));
    const host=b.querySelector(".lv-srch");if(host)makeSearch(host,{kind:S.tp==="esc"?"crest":"player",placeholder:S.tp==="esc"?"Digite o clube…":"Digite o nome do jogador…",onPick:it=>answer(it.id)})}
  window.addEventListener("beforeunload",()=>{try{client.publish(B+"/j/"+me,"",{qos:0})}catch(e){}});
}
