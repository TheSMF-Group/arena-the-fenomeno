// @ts-nocheck
import {clubCrest, clubName, esc, face, natFlag, natName, pick, sample, shuffle, year} from "../core";
import {GAMES, finish, hit, isHard, markPeople, memAdd, memList, miss, pool, prefer, seenPeople, shareHead} from "../engine";
import {groupsBy} from "./conexoes";

/* 5. IMPOSTOR */
GAMES.impostor={hard:"Jogadores de nicho, e o intruso é da mesma época dos outros.",name:"IMPOSTOR",desc:"Quatro têm algo em comum. Ache o intruso.",
rules:"Em cada rodada, 4 dos 5 jogadores têm algo em comum (seleção, último clube ou década de nascimento). Clique no intruso. São 10 rodadas.",
start(st,r){
  const T={nat:p=>p.nat,club:p=>p.club,dec:p=>Math.floor(year(p)/10)*10};
  const PL=pool();
  const pools={nat:groupsBy(PL,T.nat,4),club:groupsBy(PL,T.club,4),dec:groupsBy(PL,T.dec,4)};
  const rounds=[],seenP=seenPeople("impostor"),pastC=new Set(memList("impostor").slice(-40));let guard=0;
  while(rounds.length<10){guard++;const ty=pick(r,rounds.length%3===0?["club"]:["nat","club","dec"]);let opts=pools[ty].filter(([k])=>!rounds.some(x=>x.ty===ty&&x.k===k));if(ty==="club"&&guard<300){const o2=opts.filter(([k])=>!pastC.has(ty+k));if(o2.length)opts=o2}const [k,mem]=pick(r,opts.length?opts:pools[ty]);const four=sample(r,prefer(mem,seenP,4),4);
    const imp=pick(r,prefer(PL.filter(p=>T[ty](p)!==k&&(!isHard()||ty==="dec"||Math.abs(year(p)-year(four[0]))<=12)),seenP,1));const five=shuffle(r,[...four,imp]);
    const bad=Object.keys(T).some(t=>{const c={};five.forEach(p=>{const v=T[t](p);c[v]=(c[v]||0)+1});return Object.entries(c).some(([v,n])=>n===4&&T[t](imp)==v)});
    if(bad)continue;rounds.push({ty,k,five,imp})}
  memAdd("impostor",rounds.map(x=>x.ty+x.k));markPeople("impostor",rounds.flatMap(x=>x.five));
  let ri=0;const res=[];
  st.innerHTML=`<div class="progress"></div><div class="cards5"></div><p class="exp" style="min-height:48px;margin:14px 0 8px"></p><button class="btn y" data-a="next" hidden>Próxima rodada</button>`;
  const cards=st.querySelector(".cards5"),exp=st.querySelector(".exp"),nx=st.querySelector("[data-a=next]"),pr=st.querySelector(".progress");
  function draw(revealed,chosen){const R=rounds[ri];
    pr.innerHTML=rounds.map((_,i)=>`<i class="${res[i]===true?"ok":res[i]===false?"no":i===ri?"cur":""}"></i>`).join("");
    cards.innerHTML=R.five.map(p=>`<button type="button" class="pc ${revealed?(p===R.imp?"right":p===chosen?"wrong":""):""}" data-id="${p.id}" ${revealed?"disabled":""}>${face(p)}<b>${esc(p.name)}</b>${revealed?`<small>${natFlag(p.nat)} ${year(p)}</small><small>${clubCrest(p.club)} ${esc(clubName(p.club))}</small>`:""}</button>`).join("");
    exp.innerHTML=revealed?`${chosen===R.imp?"<b style='color:var(--green)'>Acertou.</b>":"<b style='color:var(--red)'>Errou.</b>"} Os quatro: <b>${R.ty==="nat"?natFlag(R.k)+" seleção "+esc(natName(R.k)):R.ty==="club"?"último clube "+esc(clubName(R.k)):"nascidos nos anos "+String(R.k).slice(2)}</b>. Impostor: <b>${esc(R.imp.name)}</b>.`:"Quem é o impostor?"}
  cards.addEventListener("click",e=>{const b=e.target.closest(".pc");if(!b||b.disabled)return;const R=rounds[ri];const ch=R.five.find(p=>p.id===+b.dataset.id);res[ri]=ch===R.imp;res[ri]?hit():miss();draw(true,ch);
    if(ri===9){const sc=res.filter(Boolean).length;finish("impostor",st,{won:sc>=7,score:sc,label:`Você acertou ${sc}/10 impostores.`,chip:`${sc}/10`,share:`${shareHead("IMPOSTOR")} ${sc}/10\n${res.map(x=>x?"🟩":"🟥").join("")}`})}else nx.hidden=false});
  nx.addEventListener("click",()=>{ri++;nx.hidden=true;draw(false)});
  draw(false);
}};
