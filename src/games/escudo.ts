// @ts-nocheck
import {ST} from "../state";
import {crestImg, esc, pick} from "../core";
import {makeSearch} from "../search";
import {GAMES, dailyPick, finish, hit, isHard, miss, shareHead} from "../engine";
import {BIG} from "../bigclubs";

/* 6. ESCUDO */
GAMES.escudo={hard:"Qualquer um dos 811 escudos, sem cor, 5 chutes e dicas só no fim.",name:"ESCUDO",desc:"Um pedaço do escudo. Qual é o clube?",
rules:"O escudo aparece ampliado e borrado. A cada erro ele abre um pouco e ganha uma dica: confederação, país, liga e inicial. São 6 chutes.",
start(st,r){
  const linked=new Set(ST.CLUBS.map(c=>c[1]).filter(Boolean));
  const HE=isHard(),MAXE=HE?5:6;
  const epool=HE?ST.CRESTS.filter(c=>ST.ESC[c.id]):ST.CRESTS.filter(c=>linked.has(c.id)&&BIG.has(c.id));const ans=dailyPick("escudo",epool,r);const ox=pick(r,["25% 25%","75% 30%","30% 75%","70% 70%","50% 20%"]);
  const g=[];let done=false;
  st.innerHTML=`<div class="esc"><div class="cbox"><img src="${ST.ESC[ans.id]}" alt="Escudo misterioso"></div><div><ul class="clues"></ul><div class="srch"></div><div class="guesses"></div></div></div>`;
  const img=st.querySelector(".cbox img"),clues=st.querySelector(".clues"),gl=st.querySelector(".guesses"),srch=st.querySelector(".srch");
  const H=HE?[["Confederação",ans.conf],["País",ans.pais.replace(/-/g," ")]]:[["Confederação",ans.conf],["País",ans.pais.replace(/-/g," ")],["Liga",ans.liga],["Inicial",ans.name[0]]];
  function draw(){const w=g.filter(c=>c.id!==ans.id).length;const z=done?1:(HE?[5,4.2,3.5,2.9,2.4]:[3.4,2.7,2.1,1.6,1.25,1.05])[Math.min(w,MAXE-1)];const b=done?0:(HE?[12,10,8,6,4]:[9,7,5,3,1.5,.5])[Math.min(w,MAXE-1)];
    if(HE&&!done)img.style.filter+="";
    img.style.transformOrigin=ox;img.style.transform=`scale(${z})`;img.style.filter=`blur(${b}px)${HE&&!done?" grayscale(1)":""}`;
    clues.innerHTML=H.map((h,i)=>{const open=done||i<w-(HE?2:0);return`<li class="${open?"":"lock"}"><small>${h[0]}</small><b style="text-transform:${i===1?"capitalize":"none"}">${open?esc(h[1]):"? ? ?"}</b></li>`}).join("");
    gl.innerHTML=g.map(c=>`<div class="${c.id===ans.id?"ok":""}">${crestImg(c.id,c.name)}${esc(c.name)}</div>`).join("")}
  makeSearch(srch,{kind:"crest",placeholder:"Digite o nome do clube…",onPick(c){if(done||g.includes(c))return;g.push(c);
    if(c.id===ans.id||g.length>=MAXE){done=true;srch.innerHTML="";const won=c.id===ans.id;won?hit():miss();
      finish("escudo",st,{won,score:won?g.length:0,label:won?`${ans.name} em ${g.length}/${MAXE}.`:`Era ${ans.name}.`,chip:won?`${g.length}/${MAXE}`:`X/${MAXE}`,share:`${shareHead("ESCUDO")}\n${g.map(x=>x.id===ans.id?"🟩":"🟥").join("")}`})}
    draw()}});
  draw();
}};
