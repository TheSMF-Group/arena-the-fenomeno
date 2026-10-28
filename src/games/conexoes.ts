// @ts-nocheck
import {ST} from "../state";
import {clubCrest, clubName, esc, face, flag, natName, pick, sample, shuffle, toast, year} from "../core";
import {clubOk, GAMES, finish, hit, isHard, markPeople, memAdd, memList, miss, pool, prefer, seenPeople, shareHead} from "../engine";

/* 4. CONEXÕES */
export function crit(type,v){
  if(type==="club")return{type,v,test:p=>p.club===v,label:()=>`${clubCrest(v)} ${esc(clubName(v))}`,text:"Último clube: "+clubName(v)};
  if(type==="nat")return{type,v,test:p=>p.nat===v,label:()=>`<i class="flag">${flag(ST.NATS[v][1])}</i> Seleção: ${esc(natName(v))}`,text:"Seleção: "+natName(v)};
  if(type==="year")return{type,v,test:p=>year(p)===v,label:()=>`Nascidos em ${v}`,text:"Nascidos em "+v};
  if(type==="dec")return{type,v,test:p=>Math.floor(year(p)/10)*10===v,label:()=>`Nascidos nos anos ${String(v).slice(2)}`,text:"Anos "+String(v).slice(2)};
}
export function groupsBy(arr,fn,min){const m=new Map();for(const p of arr){const k=fn(p);if(!m.has(k))m.set(k,[]);m.get(k).push(p)}return[...m.entries()].filter(([k,v])=>v.length>=min)}
GAMES.conexoes={hard:"Jogadores de nicho e só 3 erros.",name:"CONEXÕES",desc:"16 craques, 4 grupos escondidos.",
rules:"Separe os 16 jogadores em 4 grupos de 4 com algo em comum: mesmo último clube, mesma seleção ou mesmo ano de nascimento. Você pode errar até 4 vezes.",
start(st,r){
  const PL=pool(),MAXL=isHard()?3:4,seenP=seenPeople("conexoes"),pastC=new Set(memList("conexoes").slice(-24));
  const by={club:groupsBy(PL,p=>p.club,4).filter(([k])=>clubOk(k)),nat:groupsBy(PL,p=>p.nat,4),year:groupsBy(PL,p=>year(p),4)};
  let groups;
  for(let t=0;t<5000;t++){const types=pick(r,[["club","club","nat","year"],["club","club","club","nat"],["club","nat","year","year"],["club","club","year","year"]]);
    const usedV=new Set(),usedP=new Set();groups=[];let ok=true;
    for(const ty of types){let opts=by[ty].filter(([k])=>!usedV.has(ty+k));if(t<3000&&ty!=="nat"){const o2=opts.filter(([k])=>!pastC.has(ty+k));if(o2.length)opts=o2}if(!opts.length){ok=false;break}const [k,mem]=pick(r,opts);usedV.add(ty+k);
      const free=mem.filter(p=>!usedP.has(p.id));if(free.length<4){ok=false;break}const four=sample(r,t<4000?prefer(free,seenP,4):free,4);four.forEach(p=>usedP.add(p.id));groups.push({c:crit(ty,k),m:four})}
    if(!ok)continue;const all=groups.flatMap(g=>g.m);if(groups.every(g=>all.filter(g.c.test).length===4))break}
  memAdd("conexoes",groups.map(g=>g.c.type+g.c.v));markPeople("conexoes",groups.flatMap(g=>g.m));
  const order={club:0,nat:1,year:2};groups.sort((a,b)=>order[a.c.type]-order[b.c.type]);groups.forEach((g,i)=>g.col=i);
  let tiles=shuffle(r,groups.flatMap(g=>g.m));const sel=new Set(),solved=[],tries=[];let lives=MAXL,over=false;
  st.innerHTML=`<div class="conn"><div class="sv"></div><div class="tiles"></div><div class="row" style="margin-top:14px;justify-content:space-between"><div class="lives"></div><div class="row"><button class="btn" data-a="mix">Embaralhar</button><button class="btn" data-a="clr">Limpar</button><button class="btn y" data-a="ok">Confirmar</button></div></div></div>`;
  const sv=st.querySelector(".sv"),tl=st.querySelector(".tiles"),lv=st.querySelector(".lives");
  function draw(){
    sv.innerHTML=solved.map(g=>`<div class="solved c${g.col}"><b>${g.c.label()}</b><div>${g.m.map(p=>esc(p.name)).join(" · ")}</div></div>`).join("");
    tl.innerHTML=tiles.map(p=>`<button type="button" class="tile" data-id="${p.id}" aria-pressed="${sel.has(p.id)}" ${over?"disabled":""}>${face(p)}<span>${esc(p.name)}</span></button>`).join("");
    lv.innerHTML=`Erros restantes ${Array.from({length:MAXL},(_,i)=>`<i class="${i<lives?"":"off"}"></i>`).join("")}`;
    st.querySelector("[data-a=ok]").disabled=sel.size!==4||over}
  function end(won){over=true;for(const g of groups)if(!solved.includes(g))solved.push(g);tiles=[];draw();
    finish("conexoes",st,{won,score:won?4-0:0,label:won?`Todos os grupos com ${MAXL-lives} erro(s).`:"Os grupos estão acima.",chip:won?`${MAXL-lives} erros`:"perdeu",share:`${shareHead("CONEXÕES")}\n${tries.map(t=>t.map(c=>["🟨","🟩","🟦","🟪"][c]).join("")).join("\n")}`})}
  st.addEventListener("click",e=>{if(over)return;const t=e.target.closest(".tile");if(t){const id=+t.dataset.id;if(sel.has(id))sel.delete(id);else if(sel.size<4)sel.add(id);draw();return}
    const a=e.target.closest("[data-a]")?.dataset.a;
    if(a==="mix"){tiles=shuffle(Math.random,tiles);draw()}
    if(a==="clr"){sel.clear();draw()}
    if(a==="ok"&&sel.size===4){const picked=tiles.filter(p=>sel.has(p.id));tries.push(picked.map(p=>groups.find(g=>g.m.includes(p)).col));
      const g=groups.find(g=>picked.every(p=>g.m.includes(p)));
      if(g){solved.push(g);hit();tiles=tiles.filter(p=>!sel.has(p.id));sel.clear();draw();if(solved.length===4)end(true)}
      else{lives--;miss();const near=groups.some(g=>picked.filter(p=>g.m.includes(p)).length===3);toast(near?"Faltou só um!":"Não é um grupo");draw();if(lives<=0)end(false)}}});
  draw();
}};
