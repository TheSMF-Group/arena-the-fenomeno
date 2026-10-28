// @ts-nocheck
import {esc, face, fmtDate, natFlag, natName, pick, year} from "../core";
import {GAMES, finish, hit, isHard, markPeople, miss, pool, prefer, seenPeople, shareHead} from "../engine";

/* 8. MAIS VELHO */
GAMES.velho={hard:"Os dois nasceram com no máximo 2 anos de diferença.",name:"MAIS VELHO?",desc:"Quem nasceu primeiro? Faça a maior sequência.",
rules:"Clique no mais velho dos dois. Acertou, ele fica e enfrenta o próximo. Um erro encerra a sequência.",
start(st,r){
  const PL0=pool(),HV=isHard(),PL=prefer(PL0,seenPeople("velho"),200),shown=new Set();
  const nextP=ex=>{let p,t=0;do{p=pick(r,t<300?PL:PL0);t++}while(t<2000&&(shown.has(p.id)&&t<200||ex.some(x=>x.id===p.id||x.birth===p.birth||(HV&&t<400&&Math.abs(year(x)-year(p))>2))));shown.add(p.id);markPeople("velho",[p]);return p};
  let a=nextP([]),b=nextP([a]),streak=0,lock=false;
  st.innerHTML=`<div class="row" style="align-items:baseline;gap:14px;margin-bottom:10px"><span class="streak">0</span><span class="muted">acertos seguidos</span></div><div class="duel"></div>`;
  const du=st.querySelector(".duel"),sk=st.querySelector(".streak");
  const card=(p,show,cls)=>`<button type="button" class="pc ${cls||""}" data-id="${p.id}" ${show?"disabled":""}>${face(p)}<b>${esc(p.name)}</b><small>${natFlag(p.nat)} ${esc(natName(p.nat))}</small><small style="font-size:15px;color:var(--fg);font-weight:800">${show?fmtDate(p.birth):"?"}</small></button>`;
  function draw(show,ch){const old=a.birth<b.birth?a:b;du.innerHTML=card(a,show,show?(a===old?"right":a===ch?"wrong":""):"")+`<span class="vsb">VS</span>`+card(b,show,show?(b===old?"right":b===ch?"wrong":""):"");sk.textContent=streak}
  du.addEventListener("click",e=>{const el=e.target.closest(".pc");if(!el||lock)return;lock=true;const ch=+el.dataset.id===a.id?a:b;const old=a.birth<b.birth?a:b;
    if(ch===old){streak++;hit();draw(true,ch);setTimeout(()=>{a=old;b=nextP([a]);lock=false;draw(false)},1100)}
    else{miss();draw(true,ch);finish("velho",st,{won:streak>=5,score:streak,label:`Sequência de ${streak}. ${old.name} nasceu em ${fmtDate(old.birth)}.`,chip:`${streak} seguidos`,share:`${shareHead("MAIS VELHO?")}\n🐐 ${streak} acertos seguidos`})}});
  draw(false);
}};
