// @ts-nocheck
import __A9__ from "../assets/af12da171.webp?url";
import __A10__ from "../assets/ac222521c.webp?url";
import __A11__ from "../assets/aa48dd3f0.webp?url";
import {ST} from "../state";
import {$, esc, flag, natName, pick, sample, shuffle, toast, year} from "../core";
import {GAMES} from "../engine";
import {vlPlay} from "./velha-play";
import {pfLocal, pfMount} from "../profile";
import {cleanup, home} from "../home";
export const VL_TROF={"pl": __A9__, "ucl": __A10__, "br": __A11__};
export const VL={pl:{name:"Premier League",crest:"man-city",
    normal:["man-city","man-utd","liverpool","arsenal","chelsea","tottenham","newcastle","aston-villa","everton","west-ham"],
    hard:["nottm-forest","crystal-palace","brighton","bournemouth","brentford","wolves","leeds","leicester","southampton","sunderland","burnley","ipswich","everton","west-ham"]},
  ucl:{name:"Champions",crest:"real-madrid",
    normal:["real-madrid","barcelona","atletico","bayern","dortmund","leverkusen","juventus","ac-milan","inter","napoli","roma","psg","man-city","man-utd","liverpool","arsenal","chelsea","benfica","porto","ajax"],
    hard:["sporting","psv","feyenoord","celtic","rangers","galatasaray","fenerbahce","olympiacos","brugge","anderlecht","dinamo-zagreb","red-star-belgrade","shakhtar","salzburg","basel","young-boys","copenhagen","sturm-graz","leipzig","atalanta","lazio","lille","monaco","marseille","lyon","villarreal","sevilla","valencia","stuttgart"]},
  br:{name:"Brasileirão",crest:"flamengo",
    normal:["flamengo","palmeiras","corinthians","sao-paulo","santos","vasco","fluminense","botafogo","gremio","internacional","atletico-mg","cruzeiro"],
    hard:["bahia","athletico-pr","juventude","bragantino","fortaleza","criciuma","cuiaba","sport-recife","ceara","coritiba","goias","vila-nova","chapecoense","ponte-preta","avai","mirassol","america-mg"]}};
export const VL_NAT={normal:["BR","AR","FR","ES","DE","GB-ENG","PT","IT","NL","UY","BE","CO"],
  hard:["HR","RS","NG","SN","CI","GH","CM","MA","JP","KR","US","MX","EC","PE","PY","CL","DK","SE","NO","GB-SCT","GB-WLS","IE","PL","CH","AT","CZ","TR","GR","DZ","VE","BO","AU"]};
export const VL_DEC={normal:[1980,1990],hard:[1970,2000]};
export const VL_MD={3:2,5:3,10:6},VL_TURN={normal:45,hard:30},VL_LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export const VL_ART="https://claude.ai/artifact/1aeY4bTMLALyFD1XsS3kXR";
export let VLC=null,VLPASS=null,VLPASSP=null;
/* passagens.json: por clube, os jogadores que já passaram por ele (Wikidata), além do último clube */
export function loadPass(){if(!VLPASSP)VLPASSP=fetch("passagens.json").then(r=>r.ok?r.json():{}).catch(()=>({})).then(m=>{VLPASS={};for(const k in m)VLPASS[k]=new Set(m[k]);VLC=null;return VLPASS});return VLPASSP}
export function vlPrep(){if(VLC)return VLC;const byCrest={},count={},isoIdx={};
  for(const p of ST.P)count[p.club]=(count[p.club]||0)+1;
  ST.CLUBS.forEach((c,i)=>{if(c[1]&&(!byCrest[c[1]]||(count[i]||0)>(count[byCrest[c[1]]]||0)))byCrest[c[1]]=i});
  ST.NATS.forEach((n,i)=>{isoIdx[n[1]]=i});
  const byClub={};for(const p of ST.P)(byClub[p.club]=byClub[p.club]||[]).push(p);
  if(VLPASS){const byId=new Map(ST.P.map(p=>[p.id,p]));for(const k in VLPASS){const c=+k;for(const id of VLPASS[k]){const p=byId.get(id);if(p&&p.club!==c)(byClub[c]=byClub[c]||[]).push(p)}}}
  return VLC={byCrest,isoIdx,byClub}}
export const vlIn=(p,club)=>p.club===club||!!(VLPASS&&VLPASS[club]&&VLPASS[club].has(p.id));
export const vlFits=(p,club,cr)=>vlIn(p,club)&&(cr[0]==="n"?p.nat===cr[1]:Math.floor(year(p)/10)*10===cr[1]);
export function vlGrid(cfg){const C=vlPrep(),L=VL[cfg.lg],HG=cfg.diff==="hard",MIN=HG?1:3;
  const clubsOf=k=>L[k].map(id=>C.byCrest[id]).filter(i=>i!=null&&(C.byClub[i]||[]).length>=8);
  const natsOf=k=>VL_NAT[k].map(iso=>C.isoIdx[iso]).filter(i=>i!=null).map(i=>["n",i]);
  let cp=clubsOf(HG?"hard":"normal"),crit=natsOf(HG?"hard":"normal").concat(VL_DEC[HG?"hard":"normal"].map(d=>["d",d]));
  const r=Math.random;
  for(let t=0;t<4000;t++){
    if(t===1500){cp=cp.concat(clubsOf(HG?"normal":"hard"))}
    if(t===2500){crit=crit.concat(natsOf(HG?"normal":"hard"),VL_DEC[HG?"normal":"hard"].map(d=>["d",d]))}
    const cs=sample(r,cp,3);const ok=crit.filter(cr=>cs.every(c=>(C.byClub[c]||[]).filter(p=>p.birth&&vlFits(p,c,cr)).length>=MIN));
    // pelo menos duas linhas de seleção; no máximo uma de década
    const nNat=shuffle(r,ok.filter(c=>c[0]==="n")),dec=ok.filter(c=>c[0]==="d");if(nNat.length<2)continue;
    if(nNat.length>=3&&(r()<.75||!dec.length))return{c:cs,r:nNat.slice(0,3)};
    if(dec.length)return{c:cs,r:shuffle(r,[...nNat.slice(0,2),pick(r,dec)])}}
  return null}
export const critLabel=cr=>cr[0]==="n"?`<i class="flag fl">${flag(ST.NATS[cr[1]][1])}</i><span>${esc(natName(cr[1]))}</span>`:`<b class="dec">${String(cr[1]).slice(2)}s</b><span>Nasceu nos anos ${String(cr[1]).slice(2)}</span>`;
export const critText=cr=>cr[0]==="n"?natName(cr[1]):`nascido nos anos ${String(cr[1]).slice(2)}`;
export function vlCode(){const A="ABCDEFGHJKMNPQRSTUVWXYZ23456789";let s="";for(let i=0;i<5;i++)s+=A[Math.floor(Math.random()*A.length)];return s}
export function vlLine(b){for(const l of VL_LINES){const m=b[l[0]]&&b[l[0]][0];if(m&&l.every(i=>b[i]&&b[i][0]===m))return{m,l}}return null}

GAMES.velha={name:"JOGO DA VELHA",multi:true,desc:"Multiplayer: crie a partida, mande o código e jogue contra um amigo.",
rules:"Cada casa pede um jogador que passou pelo clube da coluna, em qualquer época, e que bata com a linha: seleção ou década de nascimento. Na sua vez, clique numa casa e diga o jogador; acertou, a casa é sua. Errou ou o tempo acabou, a vez passa. Três em linha vence a rodada.",
open(){ST.VIEW="velha";ST.PHASE="choose";cleanup();if(location.hash!=="#velha")history.replaceState(null,"","#velha");
  const app=$("#app");let cfg={diff:"normal",lg:"ucl",md:3};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2>JOGO DA <b>VELHA</b></h2><span class="lvbadge normal">MULTIPLAYER</span></div>
    <p class="rules">${this.rules}</p>
    <div class="vl-lobby">
      <section class="vl-box"><h3 class="d">CRIAR JOGO</h3>
        <div class="vl-opt"><small>Nível</small><div class="vl-seg" data-k="diff"><button type="button" data-v="normal">Normal</button><button type="button" data-v="hard">Difícil ☠</button></div>
          <p class="muted vl-help" data-h="diff"></p></div>
        <div class="vl-opt"><small>Liga</small><div class="vl-seg vl-lg" data-k="lg">${Object.entries(VL).map(([k,l])=>`<button type="button" data-v="${k}"><img class="vl-tr" src="${VL_TROF[k]}" alt=""><span>${l.name}</span></button>`).join("")}</div></div>
        <div class="vl-opt"><small>Formato</small><div class="vl-seg" data-k="md">${[3,5,10].map(n=>`<button type="button" data-v="${n}">MD${n}</button>`).join("")}</div>
          <p class="muted vl-help" data-h="md"></p></div>
        <button class="btn y vl-go" type="button" data-a="create">Criar partida</button>
        <button class="btn vl-go" type="button" data-a="local">Jogar no mesmo aparelho</button></section>
      <section class="vl-box"><h3 class="d">ENTRAR EM JOGO</h3>
        <label class="vl-opt"><small>Código da partida</small><input class="vl-code" maxlength="5" autocomplete="off" spellcheck="false" placeholder="EX: BODE7" aria-label="Código da partida"></label>
        <button class="btn g vl-go" type="button" data-a="join">Entrar</button>
        <p class="muted vl-help">Peça o código para quem criou a partida. Os dois precisam estar com esta página aberta${window.claude?" e logados no claude.ai":""}.</p></section></div>`;
  const help={diff:{normal:"Clubes grandes e seleções famosas, 45 segundos por jogada.",hard:"Clubes menores e seleções exóticas (Croácia, Senegal, Japão, Gales…), 30 segundos por jogada."},
    md:{3:"Melhor de 3: quem vencer 2 rodadas leva.",5:"Melhor de 5: quem vencer 3 rodadas leva.",10:"Maratona: quem vencer 6 rodadas leva."}};
  const paint=()=>{app.querySelectorAll(".vl-seg").forEach(s=>s.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===String(cfg[s.dataset.k])))));
    app.querySelector('[data-h=diff]').textContent=help.diff[cfg.diff];app.querySelector('[data-h=md]').textContent=help.md[cfg.md]};
  app.querySelectorAll(".vl-seg").forEach(s=>s.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const k=s.dataset.k;cfg[k]=k==="md"?+b.dataset.v:b.dataset.v;paint()}));
  app.querySelector(".back").addEventListener("click",home);
  const inp=app.querySelector(".vl-code");inp.addEventListener("input",()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"")});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")app.querySelector("[data-a=join]").click()});
  app.querySelector(".vl-lobby").addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;
    if(a==="create")vlPlay({mode:"host",cfg:{...cfg}});
    if(a==="local")pfLocal(pfs=>vlPlay({mode:"local",cfg:{...cfg},pfs}));
    if(a==="join"){const c=inp.value.trim();if(c.length!==5){toast("O código tem 5 letras/números");inp.focus();return}vlPlay({mode:"join",code:c})}});
  paint();pfMount(app);window.scrollTo(0,0)}};

/* fora do claude.ai (site no Vercel): a sala vira um tópico MQTT num servidor público, sem login.
   Cada jogador deixa a sua "presence" como mensagem retida em .../p/<id>; a última vontade apaga ao cair. */
