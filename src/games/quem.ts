// @ts-nocheck
import {clubCrest, clubName, esc, face, initials, natFlag, natName, year} from "../core";
import {makeSearch} from "../search";
import {GAMES, dailyPick, finish, hit, isHard, miss, pool, shareHead} from "../engine";

/* 1. QUEM É? */
GAMES.quem={hard:"foto escura e sem cor até o fim, dicas só a partir do 3º erro, sem iniciais e sem \"perto\" na tabela.",name:"QUEM É?",desc:"A foto vai clareando. Descubra o jogador em 6 chutes.",
rules:"A foto começa borrada. A cada chute errado ela fica mais nítida e uma dica nova aparece. A tabela compara seu chute com o jogador secreto: verde é igual, amarelo é perto (até 2 anos), as setas dizem se o ano certo é maior ou menor.",
start(st,r){
  const ans=dailyPick("quem",pool(),r),MAX=6,g=[];let done=false,lastOpen=0;
  st.innerHTML=`<div class="quem"><div class="ph">${face(ans,"","Jogador misterioso")}</div><div><ul class="clues"></ul><div class="srch"></div><div class="gt-wrap"><table class="gtable"><thead><tr><th>Jogador</th><th>Seleção</th><th>Último clube</th><th>Nasc.</th><th>Últ. temp.</th></tr></thead><tbody></tbody></table></div></div></div>`;
  const img=st.querySelector(".ph .face"),clues=st.querySelector(".clues"),tb=st.querySelector("tbody");
  const C0=[["Seleção",()=>`${natFlag(ans.nat)} ${esc(natName(ans.nat))}`],["Nascimento",()=>year(ans)],["Último clube",()=>`${clubCrest(ans.club)} ${esc(clubName(ans.club))}`],["Última temporada",()=>ans.season],["Iniciais",()=>initials(ans.name)]];
  const HARDQ=isHard(),C=HARDQ?[C0[1],C0[3],C0[0],C0[2]]:C0,OFF=HARDQ?2:0;
  const arrow=(a,b)=>a===b?"":a>b?" ↑":" ↓";
  const cmp=(a,b)=>a===b?"ok":!isHard()&&Math.abs(a-b)<=2?"near":"no";
  function draw(){const wrong=g.filter(p=>p.id!==ans.id).length;
    img.style.filter=done?"none":HARDQ?`blur(${[30,27,24,21,18,15][Math.min(wrong,5)]}px) grayscale(1) brightness(.75)`:`blur(${[22,16,11,7,4,2][Math.min(wrong,5)]}px) grayscale(${wrong<3?1:0})`;
    const nOpen=done?C.length:Math.max(0,Math.min(C.length,wrong-OFF));
    clues.innerHTML=C.map((c,i)=>{const open=done||i<wrong-OFF;return`<li class="${open?"":"lock"}${open&&!done&&i===nOpen-1&&nOpen>lastOpen?" fresh":""}"><small>${c[0]}</small><b>${open?c[1]():"? ? ?"}</b></li>`}).join("");
    lastOpen=nOpen;
    tb.innerHTML=g.map((p,gi)=>`<tr${gi===g.length-1?' class="new"':""}><td><span class="who">${face(p)}${esc(p.name)}</span></td><td class="${p.nat===ans.nat?"ok":"no"}">${natFlag(p.nat)} ${esc(natName(p.nat))}</td><td class="${p.club===ans.club?"ok":"no"}">${clubCrest(p.club)}${esc(clubName(p.club))}</td><td class="${cmp(year(p),year(ans))}">${year(p)}${arrow(year(ans),year(p))}</td><td class="${cmp(p.season,ans.season)}">${p.season}${arrow(ans.season,p.season)}</td></tr>`).reverse().join("")}
  const srch=st.querySelector(".srch");
  makeSearch(srch,{onPick(p){if(done||g.some(x=>x.id===p.id))return;g.push(p);let endFn=null;
    if(p.id===ans.id||g.length>=MAX){done=true;srch.innerHTML="";const won=p.id===ans.id;won?hit():miss();
      const sq=g.map(x=>x.id===ans.id?"🟩":"🟥").join("");
      endFn=()=>finish("quem",st,{won,score:won?g.length:0,label:won?`Era ${ans.name}. Acertou em ${g.length}/${MAX}.`:`Era ${ans.name}.`,chip:won?`${g.length}/${MAX}`:"X/6",share:`${shareHead("QUEM É?")}\n${sq}`})}
    draw();if(endFn)setTimeout(endFn,1100)}});
  draw();
}};
