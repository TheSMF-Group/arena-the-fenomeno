// @ts-nocheck
import {$, pick, shuffle, store, toast} from "../core";
import {route} from "../nav";
import {GAMES} from "../engine";
import {drPlay} from "./draft-play";
import {lePool} from "./leilao";
import {pfLocal, pfMount} from "../profile";
import {ST} from "../state";
import {cleanup, home} from "../home";
export let MAP=null;
export const maTier=pr=>pr>=60000?0:pr>=20000?1:pr>=5000?2:3;
export function maCases(s){const pool=lePool(s.cfg.diff),slot=s.slot,used=new Set(s.used),seen=new Set(store.get("maleta:seen")||[]),r=Math.random;
  const base=pool.filter(e=>e.slots.includes(slot)&&!used.has(e.p.id)),fresh=base.filter(e=>!seen.has(e.p.id)),src=fresh.length>=12?fresh:base;
  const out=[],take=t=>{const c=src.filter(e=>maTier(e.price)===t&&!out.includes(e));if(c.length)out.push(pick(r,c))};
  [0,1,2,2,3].forEach(take);
  while(out.length<5){const c=src.filter(e=>!out.includes(e));if(!c.length)break;out.push(pick(r,c))}
  try{store.set("maleta:seen",(store.get("maleta:seen")||[]).concat(out.map(e=>e.p.id)).slice(-1500))}catch(e){}
  return shuffle(r,out).map(e=>e.p.id)}
export function maRound(s){s.fin=null;s.tr=null;s.step=0;s.slot=s.round;s.cases=maCases(s);s.rv=[];s.pk={};s.fp=s.round%2===0?"X":"O";s.turn=s.fp;s.ph="pick1";s.dl=Date.now()+maT(s,"pick");return s}
export const maT=(s,k)=>({pick:20,swap:20,show:5}[k])*(s.cfg.diff==="hard"?.75:1)*1000;
export const maFresh=base=>{const s={...base,kind:"maleta",tx:Array(11).fill(0),to:Array(11).fill(0),used:[],round:0,slot:0,cases:null,rv:[],pk:{},fp:"X",turn:"X",ph:"pick1",sx:0,so:0,over:null,last:null,game:(base.game||0)+1,dl:0};
  return base.O?maRound(s):s};
export const maStart=s=>maRound(s);
GAMES.maleta={name:"MALETA",multi:true,desc:"Cinco maletas por posição, cada uma com um craque escondido. Escolha, arrisque e troque.",
rules:"São 11 rodadas, uma para cada posição do 4-3-3 (goleiro, laterais, zagueiros…). Em cada rodada há 5 maletas numeradas, cada uma escondendo um jogador da posição. Quem abre primeiro escolhe uma maleta e mostra o craque; o outro escolhe às cegas entre as 4 que sobraram. Aí cada um, começando por quem abriu primeiro, decide: ficar com o seu craque ou trocar. Trocar descarta o seu jogador (ele não volta para maleta nenhuma) e você abre, às cegas, uma das maletas que sobraram, e leva o que estiver lá dentro. Depois todas as maletas viram e todo mundo vê o que deixou passar. Quem abre primeiro (e também troca primeiro) alterna a cada rodada. Só entram jogadores em atividade. Com os dois times prontos, a partida é simulada e, se empatar, vai para os pênaltis.",
open(){ST.VIEW="maleta";ST.PHASE="choose";cleanup();route("maleta");
  const app=$("#app");let cfg={diff:"normal"};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2><b>MALETA</b></h2><span class="lvbadge normal">MULTIPLAYER</span></div>
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
  const help={diff:{normal:"Craques conhecidos misturados com médios e ruins em cada maleta. 20 segundos por escolha.",hard:"Qualquer jogador em atividade da base, a maioria desconhecidos. 15 segundos por escolha."}};
  const paint=()=>{app.querySelectorAll(".vl-seg").forEach(sg=>sg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===cfg[sg.dataset.k]))));app.querySelector('[data-h=diff]').textContent=help.diff[cfg.diff]};
  app.querySelectorAll(".vl-seg").forEach(sg=>sg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cfg[sg.dataset.k]=b.dataset.v;paint()}));
  app.querySelector(".back").addEventListener("click",home);
  const inp=app.querySelector(".vl-code");inp.addEventListener("input",()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"")});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")app.querySelector("[data-a=join]").click()});
  const mk=()=>({diff:cfg.diff,mal:1});
  app.querySelector(".vl-lobby").addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;
    if(a==="create")drPlay({mode:"host",cfg:mk(),kind:"maleta"});
    if(a==="local")pfLocal(pfs=>drPlay({mode:"local",cfg:mk(),kind:"maleta",pfs}));
    if(a==="join"){const c=inp.value.trim();if(c.length!==5){toast("O código tem 5 letras/números");inp.focus();return}drPlay({mode:"join",code:c,kind:"maleta"})}});
  paint();pfMount(app);window.scrollTo(0,0)}};

/* 20. CAMISA E CONTA: números de camisa de quem jogou 2025/26 (Transfermarkt).
   Normal = "De quem é a camisa?": clube e número, 3 chutes e dicas a cada erro. Difícil = "Operações": contas com a camisa de craques. */
