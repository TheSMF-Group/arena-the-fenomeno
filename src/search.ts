// @ts-nocheck
import {ST} from "./state";
import {crestImg, esc, face, norm, year} from "./core";
import {XP} from "./games/entrosa";

/* ---------- busca ---------- */
export function searchPlayers(q,limit=8){
  q=norm(q);if(q.length<2)return[];const toks=q.split(" ");const out=[];
  for(const p of XP.length?ST.P.concat(XP):ST.P){const k=p.key;let ok=k.includes(q)||!!(p.ak&&p.ak.some(a=>a.startsWith(q)));if(!ok){ok=toks.every(t=>p.words.some(w=>w.startsWith(t)))}
    if(ok){out.push([p,(k===q?200:0)+(p.fam===1?100:p.fam===2?60:0)+(k.startsWith(q)?25:0)+(p.words.some(w=>w===q)?15:0)+(p.season-1950)/10])}}
  out.sort((a,b)=>b[1]-a[1]);return out.slice(0,limit).map(x=>x[0]);
}
export function searchCrests(q,limit=8){q=norm(q);if(q.length<2)return[];return ST.CRESTS.filter(c=>c.key.includes(q)||c.words.some(w=>w.startsWith(q))).sort((a,b)=>(b.key.startsWith(q)?1:0)-(a.key.startsWith(q)?1:0)).slice(0,limit)}
export function makeSearch(host,{kind="player",placeholder="Digite o nome do jogador…",onPick,sub}){
  host.innerHTML=`<div class="search"><input id="srch-${kind}" type="text" autocomplete="off" spellcheck="false" placeholder="${placeholder}" aria-label="${placeholder}"><div class="sugg" hidden role="listbox"></div></div>`;
  const inp=host.querySelector("input"),box=host.querySelector(".sugg");let items=[],sel=0;
  const draw=()=>{if(!items.length){box.hidden=true;return}box.hidden=false;
    box.innerHTML=items.map((it,i)=>kind==="player"
      ?`<button type="button" role="option" data-i="${i}" aria-selected="${i===sel}"><span class="mini">${face(it)}</span><b>${esc(it.name)}</b><small>${sub?sub(it):year(it)||""}</small></button>`
      :`<button type="button" role="option" data-i="${i}" aria-selected="${i===sel}"><span class="mini c">${crestImg(null,it.name,"crest")}</span><b>${esc(it.name)}</b></button>`).join("")};
  const choose=i=>{const it=items[i];if(!it)return;inp.value="";items=[];draw();onPick(it)};
  inp.addEventListener("input",()=>{items=kind==="player"?searchPlayers(inp.value):searchCrests(inp.value);sel=0;draw()});
  inp.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){sel=Math.min(sel+1,items.length-1);draw();e.preventDefault()}else if(e.key==="ArrowUp"){sel=Math.max(sel-1,0);draw();e.preventDefault()}else if(e.key==="Enter"){choose(sel);e.preventDefault()}else if(e.key==="Escape"){items=[];draw()}});
  box.addEventListener("mousedown",e=>{const b=e.target.closest("button");if(b){e.preventDefault();choose(+b.dataset.i)}});
  return inp;
}
