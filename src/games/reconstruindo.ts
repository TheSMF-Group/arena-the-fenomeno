// @ts-nocheck
import {ST} from "../state";
import {$, sample, shuffle, toast} from "../core";
import {GAMES} from "../engine";
import {drCanPlay, drPow} from "./draft-core";
import {drPlay} from "./draft-play";
import {LE_RES, lePl, lePool, lePrice} from "./leilao";
import {pfLocal, pfMount} from "../profile";
import {cleanup, home} from "../home";
export const rcCrest=p=>p.club!=null&&ST.CLUBS[p.club]?ST.CLUBS[p.club][1]:null;
export function rcAssign(ids){const ps=ids.map(lePl).filter(Boolean),out=Array(11).fill(0),used=new Set();
  const cand=i=>ps.filter(p=>drCanPlay(p,i)),order=[...Array(11).keys()].sort((a,b)=>cand(a).length-cand(b).length);
  for(const i of order){const c=cand(i).filter(p=>!used.has(p.id)).sort((a,b)=>drPow(b)-drPow(a));if(c.length){out[i]=c[0].id;used.add(c[0].id)}}
  return out}
export function rcClubs(){if(rcClubs.m)return rcClubs.m;const by=new Map();
  for(const e of lePool("hard")){const cr=rcCrest(e.p);if(!cr)continue;let o=by.get(cr);if(!o)by.set(cr,o={cr,ci:e.p.club,ids:[],tot:0});o.ids.push(e.p.id);o.tot+=e.price}
  const all=[...by.values()].filter(o=>o.ids.length>=15&&(o.xi=rcAssign(o.ids)).every(Boolean)).sort((a,b)=>b.tot-a.tot);
  return rcClubs.m={normal:all.slice(0,24),hard:all.slice(24)}}
export const rcT=(s,k)=>({pick:30,bid:20,show:6}[k])*(s.cfg.diff==="hard"?.75:1)*1000;
export const rcCap=(s,m)=>s.cash[m]-LE_RES*(10-s.round);
/* opções da posição: os dois titulares e os 3 melhores reservas (quem não é titular em nenhuma vaga) que jogam ali */
export function rcOpts(s){const slot=s.ord[s.round],used=new Set(s.used),out=[];
  [0,1].forEach(k=>{const id=s.xi[k][slot];if(id&&!used.has(id))out.push({id,t:"tit",k})});
  const bench=[];[0,1].forEach(k=>s.sq[k].forEach(id=>{if(used.has(id)||s.xi[k].includes(id))return;const p=lePl(id);if(p&&drCanPlay(p,slot))bench.push({id,t:"res",k,w:drPow(p)})}));
  bench.sort((a,b)=>b.w-a.w);out.push(...bench.slice(0,3));return out}
export function rcRound(s){s.slot=s.ord[s.round];s.opts=rcOpts(s);s.pk={};s.bid=null;s.f=s.round%2===0?"X":"O";s.turn=s.f;s.ph="pick";s.dl=Date.now()+rcT(s,"pick");return s}
export function rcStart(s){const C=rcClubs()[s.cfg.diff==="hard"?"hard":"normal"],two=sample(Math.random,C,2);
  s.cl=[two[0].ci,two[1].ci];s.sq=[two[0].ids.slice(),two[1].ids.slice()];s.xi=[two[0].xi.slice(),two[1].xi.slice()];
  const val=ids=>ids.map(lePl).reduce((a,p)=>a+(p?lePrice(p):0),0),b=Math.round((val(s.xi[0])+val(s.xi[1]))/2*.85/1000)*1000;
  s.cash={X:b,O:b};s.cash0=b;s.ord=shuffle(Math.random,[...Array(11).keys()]);s.round=0;s.tx=Array(11).fill(0);s.to=Array(11).fill(0);s.used=[];s.hist=[];return rcRound(s)}
export const rcFresh=base=>{const s={...base,kind:"reconstruindo",tx:Array(11).fill(0),to:Array(11).fill(0),used:[],sx:0,so:0,over:null,last:null,game:(base.game||0)+1,dl:0,ph:"pick",turn:"X"};return base.O?rcStart(s):s};
GAMES.reconstruindo={name:"RECONSTRUINDO",multi:true,desc:"Dois clubes grandes, 11 titulares cada. Posição a posição, escolha, dispute no leilão e monte o melhor time.",
rules:"Sorteiam-se dois clubes grandes e os 11 titulares de cada um aparecem no 4-3-3. As posições saem uma a uma, em ordem aleatória (pode ser goleiro, depois meio-campo, depois lateral…). Em cada posição há até 5 opções: os dois titulares e os melhores reservas. Cada um escolhe em segredo uma opção, pagando o valor de mercado, ou passa e deixa a vaga para um reserva barato. Se os dois escolherem o mesmo jogador, vai a leilão por ele, e quem perder leva o reserva. A verba é limitada e guarda um mínimo para as vagas que faltam. No fim, o jogo completa vagas vazias com reservas baratos, e os dois times se enfrentam na partida simulada, com pênaltis se empatar. Quem é o melhor gestor?",
open(){ST.VIEW="reconstruindo";ST.PHASE="choose";cleanup();if(location.hash!=="#reconstruindo")history.replaceState(null,"","#reconstruindo");
  const app=$("#app");let cfg={diff:"normal"};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2><b>RECONSTRUINDO</b></h2><span class="lvbadge normal">MULTIPLAYER</span></div>
    <p class="rules">${this.rules}</p>
    <div class="vl-lobby">
      <section class="vl-box"><h3 class="d">CRIAR JOGO</h3>
        <div class="vl-opt"><small>Nível</small><div class="vl-seg" data-k="diff"><button type="button" data-v="normal">Normal</button><button type="button" data-v="hard">Difícil ☠</button></div>
          <p class="muted vl-help" data-h="diff"></p></div>
        <button class="btn y vl-go" type="button" data-a="create">Criar partida</button>
        <button class="btn vl-go" type="button" data-a="local">Jogar no mesmo aparelho</button></section>
      <section class="vl-box"><h3 class="d">ENTRAR EM JOGO</h3>
        <label class="vl-opt"><small>Código da partida</small><input class="vl-code" maxlength="5" autocomplete="off" spellcheck="false" placeholder="EX: BODE7" aria-label="Código da partida"></label>
        <button class="btn g vl-go" type="button" data-a="join">Entrar</button>
        <p class="muted vl-help">Peça o código para quem criou a partida. Os dois precisam estar com esta página aberta${window.claude?" e logados no claude.ai":""}.</p></section></div>`;
  const help={diff:{normal:"Dois dos 24 clubes mais caros do mundo, com elenco de verdade. 30 segundos por escolha.",hard:"Dois clubes médios ou menores. Menos tempo por decisão."}};
  const paint=()=>{app.querySelectorAll(".vl-seg").forEach(sg=>sg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===cfg[sg.dataset.k]))));app.querySelector('[data-h=diff]').textContent=help.diff[cfg.diff]};
  app.querySelectorAll(".vl-seg").forEach(sg=>sg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cfg[sg.dataset.k]=b.dataset.v;paint()}));
  app.querySelector(".back").addEventListener("click",home);
  const inp=app.querySelector(".vl-code");inp.addEventListener("input",()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"")});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")app.querySelector("[data-a=join]").click()});
  const mk=()=>({diff:cfg.diff,rec:1});
  app.querySelector(".vl-lobby").addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;
    if(a==="create")drPlay({mode:"host",cfg:mk(),kind:"reconstruindo"});
    if(a==="local")pfLocal(pfs=>drPlay({mode:"local",cfg:mk(),kind:"reconstruindo",pfs}));
    if(a==="join"){const c=inp.value.trim();if(c.length!==5){toast("O código tem 5 letras/números");inp.focus();return}drPlay({mode:"join",code:c,kind:"reconstruindo"})}});
  paint();pfMount(app);window.scrollTo(0,0)}};
