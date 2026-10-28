// @ts-nocheck
import {BODEHEAD, dayNum, esc, hash, pick, rngOf, shuffle, store, toast, todayKey} from "./core";
import {ST} from "./state";
import {DIFFS, allDone, daySummary, startGame, updateToday} from "./home";

/* ---------- moldura de jogo ---------- */
export const MODE={free:false,multi:false};

export const isHard=()=>ST.DIFF==="hard";
export const pool=()=>isHard()?ST.HARD:ST.FAM;
export function gameRng(id){const seed=MODE.free?(Math.random()*4294967296)>>>0:hash(todayKey()+":"+id+":"+ST.DIFF);return rngOf(seed)}
export function resultKey(id,day,diff){diff=diff||ST.DIFF;return id+":"+(diff==="hard"?"d:":"")+(day||todayKey())}

/* ---------- sequência (modo infinito) ---------- */
export let STREAK=0,BEST=0;
export const streakKey=()=>"streak:"+ST.CURGAME+":"+ST.DIFF;
export function loadStreak(){const v=store.get(streakKey())||{n:0,best:0};STREAK=v.n;BEST=v.best}
export function saveStreak(){store.set(streakKey(),{n:STREAK,best:BEST})}
export function tier(n){return n>=5000?"t3":n>=500?"t2":n>=100?"t1":"t0"}
export let FIREID=0;
export function fireHTML(n,big){const u="f"+(++FIREID);return`<span class="fire ${tier(n)} ${n?"":"off"} ${big?"big":""} dg${String(n).length}" role="img" aria-label="Sequência de ${n} acertos"><svg viewBox="0 0 64 84" aria-hidden="true"><defs><linearGradient id="o${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--f1)"/><stop offset=".55" style="stop-color:var(--f2)"/><stop offset="1" style="stop-color:var(--f3)"/></linearGradient><linearGradient id="i${u}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--f4)"/><stop offset="1" style="stop-color:var(--f2)"/></linearGradient></defs><g class="fl1"><path d="M32 2c4 15 20 24 21 45 1 19-9 33-21 35C19 80 9 68 10 50c1-11 7-18 11-25 2 9 6 12 9 12-3-12-1-24 2-35z" fill="url(#o${u})"/></g><g class="fl2"><path d="M33 30c3 10 13 15 13 29 0 11-6 18-14 18s-13-7-13-17c0-8 4-12 7-17 1 6 4 8 6 8-1-8-1-14 1-21z" fill="url(#i${u})"/></g></svg><b>${n}</b></span>`}
export function drawFire(bump){const el=document.getElementById("fireBox");if(!el)return;el.innerHTML=fireHTML(STREAK)+`<span class="best">recorde<br><b>${BEST}</b></span>`;if(bump){const f=el.querySelector(".fire");f.classList.add("bump")}}
export function hit(n=1){if(!MODE.free)return;const old=tier(STREAK);STREAK+=n;if(STREAK>BEST)BEST=STREAK;saveStreak();drawFire(true);if(tier(STREAK)!==old)toast(STREAK>=5000?"FOGO ARCO-ÍRIS!":STREAK>=500?"FOGO AZUL!":"FOGO VERMELHO!")}
export function miss(){if(!MODE.free)return;const had=STREAK;STREAK=0;saveStreak();drawFire(false);if(had>0){const f=document.querySelector("#fireBox .fire");f&&f.classList.add("out");toast(`Sequência de ${had} apagada`)}}

/* resposta do dia: ordem fixa embaralhada por jogo, avança um item por dia, sem repetir até a lista acabar */
/* memória do modo infinito: cada jogo e nível lembra o que já saiu e não repete até esgotar as opções */
export const MEM_MAX=3000;
export const memKey=id=>"mem:"+id+":"+ST.DIFF;
export function memList(id){const a=store.get(memKey(id));return Array.isArray(a)?a:[]}
export function memAdd(id,ks){if(!MODE.free)return;const a=memList(id);for(const k of [].concat(ks))a.push(String(k));store.set(memKey(id),a.slice(-MEM_MAX))}
export function freshPick(id,pool,r,keyOf=x=>x.id){const a=memList(id),seen=new Set(a);let opts=pool.filter(x=>!seen.has(String(keyOf(x))));
  if(!opts.length){const keep=new Set(a.slice(-Math.floor(pool.length*.6)));opts=pool.filter(x=>!keep.has(String(keyOf(x))));if(!opts.length)opts=pool}
  const x=pick(r,opts);memAdd(id,keyOf(x));return x}
export const unseenCount=(id,pool,keyOf=x=>x.id)=>{const s=new Set(memList(id));return pool.filter(x=>!s.has(String(keyOf(x)))).length};
/* jogadores vistos há pouco: prefere quem não apareceu, se sobrar gente suficiente */
export const seenPeople=id=>MODE.free?new Set(memList(id+":p")):new Set();
export function prefer(arr,seen,n){if(!seen.size)return arr;const f=arr.filter(p=>!seen.has(String(p.id)));return f.length>=n?f:arr}
export const markPeople=(id,ps)=>memAdd(id+":p",ps.map(p=>p.id));
export function dailyPick(id,pool,r){if(MODE.free)return freshPick(id,pool,r);const order=shuffle(rngOf(hash("ordem:"+id+":"+ST.DIFF)),pool.slice().sort((a,b)=>String(a.id)<String(b.id)?-1:1));const n=dayNum()-1;return order[((n%order.length)+order.length)%order.length]}
export const KIND={camisa:"wl",carreira:"wl",questoes:"wl",forca:"wl",entrosa:"wl",piramide:10,top10:"wl",quem:"wl",bodle:"wl",escudo:"wl",conexoes:"wl",grade:9,impostor:10,bingo:16,velho:0,futgeo:25000};
export function verdict(id,res){const k=KIND[id];
  if(k==="wl")return res.won?{cls:"win",word:"GANHOU",detail:res.chip}:{cls:"loss",word:"PERDEU",detail:res.chip};
  return k>1000?{cls:"score",word:Math.round(res.score).toLocaleString("pt-BR"),detail:`de ${k.toLocaleString("pt-BR")} pts`}:{cls:"score",word:k?`${res.score}/${k}`:String(res.score),detail:k?"pontos":"acertos seguidos"}}
/* desafio do dia: um nível por jogo (o primeiro que a pessoa abrir) e o tempo jogando, que pausa com a aba escondida */
export const dayLockKey=(id,day)=>"dia:"+id+":"+(day||todayKey()),timeKey=(id,day)=>"tempo:"+id+":"+(day||todayKey());
export const dayLevel=id=>store.get(dayLockKey(id))||DIFFS.find(d=>store.get(resultKey(id,null,d)))||null;
export const dayResult=id=>{const d=dayLevel(id);const r=d&&store.get(resultKey(id,null,d));return r?{d,res:r}:null};

export function clockFlush(){if(ST.CLOCK&&ST.CLOCK.t0){const k=timeKey(ST.CLOCK.id,ST.CLOCK.day);store.set(k,(store.get(k)||0)+(Date.now()-ST.CLOCK.t0));ST.CLOCK.t0=Date.now()}}
export function clockStop(){clockFlush();ST.CLOCK=null}
document.addEventListener("visibilitychange",()=>{if(!ST.CLOCK)return;if(document.hidden){clockFlush();ST.CLOCK.t0=0}else ST.CLOCK.t0=Date.now()});
export const fmtDur=ms=>{const s=Math.round((ms||0)/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}h ${String(m).padStart(2,"0")}min`:m?`${m}min ${String(x).padStart(2,"0")}s`:`${x}s`};
export function finish(id,stage,res){
  if(!MODE.free&&!store.get(resultKey(id,ST.PLAYDAY))){if(ST.CLOCK&&ST.CLOCK.id===id){clockFlush();ST.CLOCK=null}res.ms=store.get(timeKey(id,ST.PLAYDAY))||0;store.set(resultKey(id,ST.PLAYDAY),res)}
  if(MODE.free){const div=document.createElement("div");div.className="result inf";
    div.innerHTML=`${fireHTML(STREAK,true)}<div><div class="d ${res.won?"win":""}">${KIND[id]==="wl"?(res.won?"ACERTOU!":"ERROU"):"RODADA ENCERRADA"}</div><p>${esc(res.label)} ${STREAK?`Sua sequência está em <b>${STREAK}</b>.`:"A sequência voltou a zero."} Recorde: <b>${BEST}</b>.</p><div class="row"><button class="btn y" data-a="next">Próxima rodada →</button><button class="btn" data-a="share">Copiar resultado</button></div></div>`;
    div.addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;if(a==="share")share(res.share+`\n🔥 sequência ${STREAK} (recorde ${BEST})`);if(a==="next")startGame(id)});
    stage.appendChild(div);div.scrollIntoView({behavior:"smooth",block:"nearest"});const nb=div.querySelector("[data-a=next]");setTimeout(()=>nb.focus({preventScroll:true}),400);return}
  updateToday();
  const div=document.createElement("div");div.className="result";
  div.innerHTML=`<img src="${BODEHEAD}" alt=""><div>${(v=>`<span class="verdict ${v.cls}">${v.cls==="score"?v.word+" "+v.detail.toUpperCase():v.word}</span>`)(verdict(id,res))}<div class="d ${res.won?"win":""}">${KIND[id]==="wl"?(res.won?"FENÔMENO!":"NÃO FOI DESSA VEZ"):"FIM DE JOGO"}</div><p>${esc(res.label)}</p><div class="row">${allDone()?`<button class="btn y" data-a="sum">Ver o resumo do dia →</button>`:""}<button class="btn ${allDone()?"":"y"}" data-a="share">Copiar resultado</button><button class="btn" data-a="again">Jogar no modo infinito</button></div>${res.ms?`<p class="muted" style="margin:8px 0 0">Tempo: ${fmtDur(res.ms)}</p>`:""}</div>`;
  div.addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;if(a==="share")share(res.share);if(a==="sum")daySummary();if(a==="again"){MODE.free=true;startGame(id)}});
  stage.appendChild(div);div.scrollIntoView({behavior:"smooth",block:"nearest"});
}
export function share(text){const done=()=>toast("Resultado copiado");
  try{navigator.clipboard.writeText(text).then(done,()=>fallback())}catch(e){fallback()}
  function fallback(){const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();try{document.execCommand("copy");done()}catch(e){toast("Selecione e copie o texto")}t.remove()}}
export const shareHead=(name)=>`THE FENÔMENO · ${name}${isHard()?" DIFÍCIL":""} ${MODE.free?"(infinito)":"#"+dayNum()}`;

/* ---------- jogos ---------- */
export const GAMES={};
