// @ts-nocheck
import {ST} from "../state";
import {rulesHTML} from "../ui";
import {route} from "../nav";
import {$, hash, pick, rngOf, shuffle, store, toast} from "../core";
import {GAMES} from "../engine";
import {qsCont} from "./questoes";
import {VL} from "./velha";
import {DRPOS, DR_POS, TM_POS, drCanPlay, drSim} from "./draft-core";
import {drPlay} from "./draft-play";
import {pfLocal, pfMount} from "../profile";
import {cleanup, home} from "../home";
export const LE_FLOOR=500,LE_RES=500;
export const fmtK=k=>k>=1000000?`€${(k/1e6).toLocaleString("pt-BR",{maximumFractionDigits:2})} bi`:k>=1000?`€${(k/1000).toLocaleString("pt-BR",{maximumFractionDigits:1})} mi`:`€${k} mil`;
/* atuais.json: {id: valor de mercado ATUAL em euros} só de quem jogou 2025/26 (Transfermarkt) */
export let ATU=null,ATUP=null;
export function loadAtu(){if(!ATUP)ATUP=fetch("/atuais.json?v=1").then(r=>r.ok?r.json():{}).catch(()=>({})).then(m=>ATU=m);return ATUP}
export const lePrice=p=>Math.max(LE_FLOOR,Math.round((ATU&&ATU[p.id]||0)/1000/100)*100);
export const lePl=id=>(lePl.m||(lePl.m=new Map(ST.P.map(p=>[p.id,p])))).get(id);
export const leEmpty=a=>a.map((x,i)=>x?-1:i).filter(i=>i>=0),leTeam=(s,m)=>m==="X"?s.tx:s.to,leB=(s,m)=>m==="X"?s.bx:s.bo;
export const leCapOf=(s,m)=>{const n=leEmpty(leTeam(s,m)).length;return n?leB(s,m)-LE_RES*(n-1):0};
export const leSlots=(p,arr)=>leEmpty(arr).filter(i=>drCanPlay(p,i));
export const leCan=(s,m)=>{const p=s.lot&&lePl(s.lot.id);return !!p&&s.lot.price<=leCapOf(s,m)&&leSlots(p,leTeam(s,m)).length>0};
export const leT=(s,k)=>({ask:15,bid:20,place:25,pick:35}[k])*(s.cfg.diff==="hard"?.7:1)*1000;
export const LEP={};
export function lePool(diff){if(LEP[diff])return LEP[diff];const out=[];
  for(const p of ST.P){const e=DRPOS&&DRPOS[p.id];if(!e||p.nat==null||!ST.NATS[p.nat]||!(ATU&&ATU[p.id]>0))continue;if(!e.slice(1).some(i=>TM_POS[i]))continue;const price=lePrice(p);
    if(diff!=="hard"&&!(p.fam===1||p.fam===2||price>=10000))continue;
    const slots=[];DR_POS.forEach((_,i)=>{if(drCanPlay(p,i))slots.push(i)});if(!slots.length)continue;
    out.push({p,price,slots,tier:price>=60000?0:price>=20000?1:price>=5000?2:3})}
  return LEP[diff]=out}
/* sorteia o próximo craque: começa misturando bons, médios e ruins; evita quem já saiu em partidas recentes e só traz quem cabe em alguma vaga aberta */
export function leDraw(s){const pool=lePool(s.cfg.diff),used=new Set(s.used),seen=new Set(store.get("leilao:seen")||[]),r=Math.random;
  const em={X:leEmpty(s.tx),O:leEmpty(s.to)},cap=m=>leCapOf(s,m),all=em.X.concat(em.O);if(!all.length)return null;
  /* os preços acompanham a verba: u é quanto cada vaga aberta tem, em média, para gastar. Estrela = bem acima de u; barato = bem abaixo */
  const per=m=>em[m].length?leB(s,m)/em[m].length:0,u=Math.max(3000,Math.max(per("X"),per("O")));
  const tierOf=e=>{const x=e.price/u;return x>=1.4?0:x>=.7?1:x>=.3?2:3};
  const early=shuffle(rngOf(hash(String(s.code)+":"+s.game+":lotes")),[0,1,2,1,0,2,3,1]);
  for(let t=0;t<60;t++){const sl=pick(r,all),tier=s.n<8?early[s.n]:(x=>x<.32?0:x<.74?1:x<.95?2:3)(r());
    const okT=e=>{const d=Math.abs(tierOf(e)-tier);return t<12?d===0:t<30?d<=1:true};
    const c=pool.filter(e=>okT(e)&&e.slots.includes(sl)&&!used.has(e.p.id)&&(t>40||!seen.has(e.p.id))&&["X","O"].some(m=>em[m].includes(sl)&&e.price<=cap(m)));
    if(c.length){const e=pick(r,c);return{id:e.p.id,price:e.price}}}
  const c=pool.filter(e=>!used.has(e.p.id)&&e.slots.some(sl=>all.includes(sl)));
  if(!c.length)return null;const e=pick(r,c);return{id:e.p.id,price:LE_FLOOR,sale:true}}
/* cartas de objetivo (nível difícil): cada um recebe 2, em segredo. Cumprir = +2 em todos os setores do time na simulação; falhar = −2 */
export const leLiga=p=>{if(!leLiga.m)leLiga.m=new Map(ST.CRESTS.map(c=>[c.id,c.liga]));const cr=p.club!=null&&ST.CLUBS[p.club]?ST.CLUBS[p.club][1]:null;return cr?leLiga.m.get(cr)||"":""};
export const leUCL=p=>{if(!leUCL.s)leUCL.s=new Set([...VL.ucl.normal,...VL.ucl.hard]);const cr=p.club!=null&&ST.CLUBS[p.club]?ST.CLUBS[p.club][1]:null;return !!cr&&leUCL.s.has(cr)};
export const leAge=p=>{if(!p.birth)return 30;const n=new Date(),y=Math.floor(p.birth/10000),m=Math.floor(p.birth/100)%100||1,d=p.birth%100||1;return n.getFullYear()-y-((n.getMonth()+1<m||(n.getMonth()+1===m&&n.getDate()<d))?1:0)};
export const leIso=p=>p.nat!=null&&ST.NATS[p.nat]?ST.NATS[p.nat][1]:"";
export const LE_CARDS=(()=>{const c=[];
  const nat=(id,t,n,f)=>c.push({id,k:"nat",t,n,f});
  nat("sa","Compre 3 sul-americanos",3,p=>qsCont(leIso(p))==="América do Sul");
  nat("eu","Compre 5 europeus",5,p=>qsCont(leIso(p))==="Europa");
  nat("af","Compre 2 africanos",2,p=>qsCont(leIso(p))==="África");
  nat("as","Compre 2 jogadores da Ásia ou da Oceania",2,p=>qsCont(leIso(p))==="Ásia e Oceania");
  nat("na","Compre 2 jogadores da América do Norte ou Central",2,p=>qsCont(leIso(p))==="Américas do Norte e Central");
  [["BR","brasileiros",3],["AR","argentinos",2],["FR","franceses",3],["GB-ENG","ingleses",3],["ES","espanhóis",3],["DE","alemães",3],["PT","portugueses",2],["IT","italianos",3],["NL","holandeses",2],["BE","belgas",2],["UY","uruguaios",2],["CO","colombianos",2]]
    .forEach(([iso,nm,n])=>nat("n"+iso,`Compre ${n} ${nm}`,n,p=>leIso(p)===iso));
  [["Premier League","na Premier League",3],["La Liga","na La Liga",3],["Serie A","na Serie A",3],["Bundesliga","na Bundesliga",3],["Ligue 1","na Ligue 1",3],["Brasileirão","no Brasileirão",2],["Saudi Pro League","na Liga Saudita",2],["Primeira Liga","em Portugal",2],["Eredivisie","na Holanda",2]]
    .forEach(([lg,nm,n])=>c.push({id:"l"+lg,k:"liga",t:`Compre ${n} jogadores que atuam hoje ${nm}`,n,f:p=>leLiga(p)===lg}));
  c.push({id:"ucl",k:"liga",t:"Compre 5 jogadores de clubes que disputam a Champions League",n:5,f:p=>leUCL(p)});
  c.push({id:"jov",k:"idade",t:"Compre 3 jogadores com até 21 anos",n:3,f:p=>leAge(p)<=21});
  c.push({id:"vet",k:"idade",t:"Compre 2 jogadores com 33 anos ou mais",n:2,f:p=>leAge(p)>=33});
  c.push({id:"bar",k:"preco",t:"Compre 3 jogadores por até € 10 mi cada",n:3,f:(p,paid)=>paid!=null&&paid<=10000});
  c.push({id:"est",k:"preco",t:s=>`Compre 2 jogadores por ${fmtK(Math.round(s.cfg.bud*.08/1000)*1000)} ou mais cada`,n:2,f:(p,paid,s)=>paid!=null&&paid>=Math.round(s.cfg.bud*.08/1000)*1000});
  c.push({id:"lei",k:"leilao",t:"Vença 2 leilões contra o adversário",n:2,ev:(s,m)=>({have:(s.aw&&s.aw[m])||0})});
  c.push({id:"sob",k:"verba",t:"Termine com pelo menos 15% da verba sobrando",n:1,ev:(s,m)=>({have:leB(s,m)>=s.cfg.bud*.15?1:0})});
  return c})();
export function leCardEval(id,s,m){const c=LE_CARDS.find(x=>x.id===id);if(!c)return{have:0,need:1,ok:false,txt:"?"};
  const txt=typeof c.t==="function"?c.t(s):c.t;let have;
  if(c.ev)have=c.ev(s,m).have;else have=leTeam(s,m).filter(Boolean).map(lePl).filter(p=>p&&c.f(p,s.paid&&s.paid[p.id],s)).length;
  return{have,need:c.n,ok:have>=c.n,txt}}
export const leBonus=(s,m)=>(s.cards&&s.cards[m]||[]).reduce((a,id)=>a+(leCardEval(id,s,m).ok?2:-2),0);
export const leCardTxt=(id,s)=>{const c=LE_CARDS.find(x=>x.id===id);return c?(typeof c.t==="function"?c.t(s):c.t):"?"};
/* 5 cartas viradas para cada um (10 diferentes): cada um escolhe 2 sem ver o que são */
export function leDealOpts(){const ids=shuffle(Math.random,LE_CARDS.map(c=>c.id));return{X:ids.slice(0,5),O:ids.slice(5,10)}}
export function lePickInit(s){s.ph="pick";s.opts=leDealOpts();s.cards={X:[],O:[]};s.pk={X:false,O:false};s.turn="X";s.lot=null;s.bid=null;s.dl=Date.now()+leT(s,"pick");return s}
export const leBegin=s=>s.cfg.diff==="hard"?lePickInit(s):leNext(s);
export function leDeal(){const r=Math.random,ids=shuffle(r,LE_CARDS.slice()),out={X:[],O:[]},used=new Set();
  for(const m of ["X","O"])for(const c of ids){if(out[m].length>=2)break;if(used.has(c.id))continue;if(out[m].length&&LE_CARDS.find(x=>x.id===out[m][0]).k===c.k)continue;out[m].push(c.id);used.add(c.id)}
  return out}
/* fim do leilão: vagas abertas ganham jogadores aleatórios MAIS BARATOS que o mais barato já comprado (de qualquer um dos dois times) */
export function leFill(s){const pool=lePool("hard"),used=new Set(s.used);let minV=Infinity;
  for(const id of s.tx.concat(s.to)){if(!id)continue;const p=lePl(id);if(p)minV=Math.min(minV,lePrice(p))}
  if(!isFinite(minV))minV=3000;s.auto={X:[],O:[]};
  for(const m of ["X","O"]){const arr=leTeam(s,m);arr.forEach((id,i)=>{if(id)return;
    let c=pool.filter(e=>!used.has(e.p.id)&&e.slots.includes(i)&&e.price<minV);
    if(!c.length)c=pool.filter(e=>!used.has(e.p.id)&&e.slots.includes(i)).sort((a,b)=>a.price-b.price).slice(0,12);
    if(!c.length)return;const e=pick(Math.random,c);arr[i]=e.p.id;used.add(e.p.id);s.used.push(e.p.id);s.auto[m].push(i)})}}
export function leToMatch(s){leFill(s);const R=drSim(s);s.ph="match";s.lot=null;s.bid=null;s.dl=0;s.sx=R.gx;s.so=R.go;s.over=R.win;return s}
export function leNext(s){const fx=s.tx.every(Boolean),fo=s.to.every(Boolean);
  if((fx&&fo)||s.n>=s.max)return leToMatch(s);
  const lot=leDraw(s);if(!lot)return leToMatch(s);
  try{store.set("leilao:seen",(store.get("leilao:seen")||[]).concat(lot.id).slice(-1500))}catch(e){}
  s.n++;s.lot=lot;s.ph="ask";s.bid=null;s.pend=null;s.an={X:fx?false:null,O:fo?false:null};s.f=fx?"O":fo?"X":(s.n%2?"X":"O");s.turn=s.f;s.dl=Date.now()+leT(s,"ask");return s}
export const leFresh=base=>{const s={...base,kind:"leilao",ph:"ask",tx:Array(11).fill(0),to:Array(11).fill(0),used:[],bx:base.cfg.bud,bo:base.cfg.bud,n:0,max:base.cfg.diff==="hard"?26:30,lot:null,an:{X:null,O:null},bid:null,pend:null,turn:"X",f:"X",sx:0,so:0,over:null,last:null,game:(base.game||0)+1,dl:0,cards:null,paid:{},aw:{X:0,O:0},auto:{X:[],O:[]}};
  return base.O?leBegin(s):s};
GAMES.leilao={name:"LEILÃO",multi:true,desc:"Cada um tem um orçamento. O craque aparece: quer? Se os dois querem, vai a leilão.",
rules:"Só jogam craques da atualidade (quem atuou na temporada 2025/26), com o valor de mercado atual do Transfermarkt. Cada jogador começa com o mesmo orçamento (você escolhe) para montar um time de 11. Um craque aparece para os dois e cada um responde QUER ou NÃO. Se só um quer, leva pelo preço de mercado. Se os dois querem, vai a leilão a partir do preço de mercado: um cobre o lance do outro até alguém desistir, e quem ficar leva e paga o último lance. Quem ganha escolhe a posição do time. O orçamento sempre guarda um mínimo para as vagas que faltam. Os craques bons, médios e ruins aparecem misturados: se você recusar demais e os lotes acabarem, as vagas que sobrarem são preenchidas com jogadores aleatórios mais baratos que o jogador mais barato comprado pelos dois (os RES). No nível difícil, antes da partida cada um vê 5 cartas viradas, escolhe 2 sem saber o que são e elas viram mostrando os objetivos secretos (como comprar 3 sul-americanos): cumprir dá +2 nos setores do time, falhar tira 2. Com os dois times prontos, a partida é simulada e, se empatar, vai para os pênaltis.",
open(){ST.VIEW="leilao";ST.PHASE="choose";cleanup();route("leilao");
  const app=$("#app");let cfg={diff:"normal",bud:"1000000"};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2><b>LEILÃO</b></h2><span class="lvbadge normal">MULTIPLAYER</span></div>
    ${rulesHTML("leilao",this.rules)}
    <div class="vl-lobby">
      <section class="vl-box"><h3 class="d">CRIAR JOGO</h3>
        <div class="vl-opt"><small>Nível</small><div class="vl-seg" data-k="diff"><button type="button" data-v="normal">Normal</button><button type="button" data-v="hard">Difícil ☠</button></div>
          <p class="muted vl-help" data-h="diff"></p></div>
        <div class="vl-opt"><small>Orçamento de cada um</small><div class="vl-seg" data-k="bud"><button type="button" data-v="500000">€ 500 mi</button><button type="button" data-v="1000000">€ 1 bi</button></div>
          <p class="muted vl-help" data-h="bud"></p></div>
        <button class="btn y vl-go" type="button" data-a="create">Criar partida</button>
        <button class="btn vl-go" type="button" data-a="local">Jogar no mesmo aparelho</button></section>
      <section class="vl-box"><h3 class="d">ENTRAR EM JOGO</h3>
        <label class="vl-opt"><small>Código da partida</small><input class="vl-code" maxlength="5" autocomplete="off" spellcheck="false" placeholder="EX: BODE7" aria-label="Código da partida"></label>
        <button class="btn g vl-go" type="button" data-a="join">Entrar</button>
        <p class="muted vl-help">Peça o código para quem criou a partida. Os dois precisam estar com esta página aberta${window.claude?" e logados no claude.ai":""}.</p></section></div>`;
  const help={diff:{normal:"Jogadores em atividade conhecidos, mais uma boa parte de médios e ruins. 15 segundos por decisão.",hard:"Qualquer jogador em atividade da base, a maioria desconhecidos. Menos tempo por decisão, 26 lotes e cartas de objetivo: antes de começar, escolha 2 entre 5 cartas viradas (cumpriu: +2 no time, falhou: −2)."},
    bud:{500000:"Aperto: os preços dos craques acompanham a verba, então dá para ter uma ou duas estrelas e completar com o resto.",1000000:"O padrão: os lotes custam caro para a verba, então ter todas as estrelas é impossível: vai ter que abrir mão de alguns."}};
  const paint=()=>{app.querySelectorAll(".vl-seg").forEach(sg=>sg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===cfg[sg.dataset.k]))));app.querySelector('[data-h=diff]').textContent=help.diff[cfg.diff];app.querySelector('[data-h=bud]').textContent=help.bud[cfg.bud]};
  app.querySelectorAll(".vl-seg").forEach(sg=>sg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cfg[sg.dataset.k]=b.dataset.v;paint()}));
  app.querySelector(".back").addEventListener("click",home);
  const inp=app.querySelector(".vl-code");inp.addEventListener("input",()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"")});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")app.querySelector("[data-a=join]").click()});
  const mk=()=>({diff:cfg.diff,bud:+cfg.bud});
  app.querySelector(".vl-lobby").addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;
    if(a==="create")drPlay({mode:"host",cfg:mk(),kind:"leilao"});
    if(a==="local")pfLocal(pfs=>drPlay({mode:"local",cfg:mk(),kind:"leilao",pfs}));
    if(a==="join"){const c=inp.value.trim();if(c.length!==5){toast("O código tem 5 letras/números");inp.focus();return}drPlay({mode:"join",code:c,kind:"leilao"})}});
  paint();pfMount(app);window.scrollTo(0,0)}};
