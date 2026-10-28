// @ts-nocheck
import {ST} from "../state";
import {clubCrest, clubName, esc, face, flag, natName, pick, sample, shuffle, toast, year} from "../core";
import {GAMES, finish, hit, isHard, markPeople, miss, pool, prefer, seenPeople, shareHead} from "../engine";
import {crit, groupsBy} from "./conexoes";
import {bigClub} from "../bigclubs";

/* 7. BINGO */
GAMES.bingo={hard:"Jogadores de nicho e só 20 cartas.",name:"BINGO",desc:"Encaixe cada craque na casa certa da cartela.",
rules:"Os jogadores aparecem um por vez. Coloque cada um numa casa que combine (seleção, último clube ou década) ou pule. Errar queima o jogador. Complete as 16 casas com as 24 cartas.",
start(st,r){
  let cats,deck;const PL=pool(),EXTRA=isHard()?4:8,seenP=seenPeople("bingo");
  for(let t=0;t<3000;t++){
    const nats=sample(r,groupsBy(PL,p=>p.nat,3).map(x=>x[0]),6).map(v=>crit("nat",v));
    const clubs=sample(r,groupsBy(PL,p=>p.club,3).filter(x=>isHard()||bigClub(x[0])).map(x=>x[0]),7).map(v=>crit("club",v));
    const decs=sample(r,[1940,1950,1960,1970,1980,1990,2000].filter(d=>PL.filter(p=>Math.floor(year(p)/10)*10===d).length>=3),3).map(v=>crit("dec",v));
    cats=shuffle(r,[...nats,...clubs,...decs]);if(cats.length!==16)continue;
    const used=new Set();let ok=true;
    for(const c of cats){const opts=PL.filter(p=>c.test(p)&&!used.has(p.id));if(!opts.length){ok=false;break}used.add(pick(r,prefer(opts,seenP,1)).id)}
    if(!ok)continue;const extra=sample(r,prefer(PL.filter(p=>!used.has(p.id)),seenP,EXTRA),EXTRA);deck=shuffle(r,[...PL.filter(p=>used.has(p.id)),...extra]);break}
  markPeople("bingo",deck);
  const filled=Array(16).fill(null);let di=0,errors=0,over=false;
  st.innerHTML=`<div class="bingo"><div class="now"></div><div class="bgrid"></div></div>`;
  const now=st.querySelector(".now"),bg=st.querySelector(".bgrid");
  function catIcon(c){return c.type==="nat"?`<i class="flag fl">${flag(ST.NATS[c.v][1])}</i><span>${esc(natName(c.v))}</span>`:c.type==="club"?`${clubCrest(c.v)}<span>${esc(clubName(c.v))}</span>`:`<b class="dec">ANOS ${String(c.v).slice(2)}</b><span>nascidos</span>`}
  function draw(){const p=deck[di];
    now.innerHTML=over?`<b class="d" style="font-size:30px">FIM DO BARALHO</b>`:`${face(p)}<div><small class="muted">Jogador ${di+1} de ${deck.length} · erros ${errors}</small><br><b>${esc(p.name)}</b><div class="row" style="margin-top:8px;justify-content:center"><button class="btn" data-a="skip">Pular</button></div></div>`;
    bg.innerHTML=cats.map((c,i)=>filled[i]?`<div class="bcell done">${face(filled[i])}<span>${esc(filled[i].name)}</span></div>`:`<button type="button" class="bcell" data-i="${i}" ${over?"disabled":""}>${catIcon(c)}</button>`).join("")}
  function next(){di++;if(di>=deck.length||filled.every(Boolean))return end();draw()}
  function end(){over=true;draw();const n=filled.filter(Boolean).length;
    finish("bingo",st,{won:n===16,score:n,label:`${n}/16 casas preenchidas, ${errors} erro(s).`,chip:`${n}/16`,share:`${shareHead("BINGO")} ${n}/16\n${[0,1,2,3].map(r=>[0,1,2,3].map(c=>filled[r*4+c]?"🟩":"⬛").join("")).join("\n")}`})}
  st.addEventListener("click",e=>{if(over)return;if(e.target.closest("[data-a=skip]"))return next();const b=e.target.closest(".bcell[data-i]");if(!b)return;const i=+b.dataset.i,p=deck[di];
    if(cats[i].test(p)){filled[i]=p;hit();next()}else{errors++;miss();b.classList.add("bad");toast(`${p.name}: ${natName(p.nat)}, ${clubName(p.club)}, ${year(p)}`);setTimeout(next,450)}});
  draw();
}};
