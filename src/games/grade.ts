// @ts-nocheck
import {BODEHEAD, clubCrest, clubName, esc, face, flag, natName, sample, toast} from "../core";
import {ST} from "../state";
import {makeSearch} from "../search";
import {failBox, loadingBox} from "./entrosa";
import {VLPASS, loadPass, vlIn} from "./velha";
import {GAMES, MODE, finish, hit, isHard, memAdd, memList, miss, shareHead} from "../engine";

/* 3. GRADE */
export let BUCKET=null,CLUBCOUNT=null,NATCOUNT=null;
export function buckets(){if(BUCKET)return;BUCKET=new Map();CLUBCOUNT={};NATCOUNT={};
  const add=(p,c)=>{const k=p.nat*100000+c;if(!BUCKET.has(k))BUCKET.set(k,[]);BUCKET.get(k).push(p);CLUBCOUNT[c]=(CLUBCOUNT[c]||0)+1};
  const byId=new Map(ST.P.map(p=>[p.id,p]));
  for(const p of ST.P){add(p,p.club);NATCOUNT[p.nat]=(NATCOUNT[p.nat]||0)+1}
  /* qualquer clube por onde o jogador passou também vale */
  if(VLPASS)for(const k in VLPASS){const c=+k;for(const id of VLPASS[k]){const p=byId.get(id);if(p&&p.club!==c)add(p,c)}}}
GAMES.grade={hard:"Quadrados com poucas respostas e sem contador.",name:"GRADE",desc:"3×3: seleção na linha, clube na coluna. Vale qualquer clube por onde o jogador passou.",
rules:"Preencha os 9 quadrados com jogadores da seleção da linha que já passaram pelo clube da coluna. São 9 chutes, sem repetir jogador.",
start(st,r){let alive=true;ST.CLEAN=()=>{alive=false};loadingBox(st,"MONTANDO A GRADE…");loadPass().then(()=>{if(!alive)return;buckets();
  const HG=isHard(),famClubs=new Set(ST.FAM.map(p=>p.club));
  const cPool=Object.keys(CLUBCOUNT).map(Number).filter(c=>HG?CLUBCOUNT[c]>=15:ST.CLUBS[c][1]&&CLUBCOUNT[c]>=30&&famClubs.has(c));
  const nPool=Object.keys(NATCOUNT).map(Number).filter(n=>NATCOUNT[n]>=(HG?40:150));
  const need=t=>HG?(t<12000?1:1):(t<8000?3:t<15000?2:1),cap=t=>HG?(t<12000?2:4):Infinity;
  const past=MODE.free?memList("grade").slice(-40).map(k=>new Set(k.split(","))):[],heads=(cs,ns)=>[...cs.map(c=>"c"+c),...ns.map(n=>"n"+n)];
  const novel=(cs,ns)=>{const h=heads(cs,ns);return past.every(s=>h.filter(x=>s.has(x)).length<4)};
  let cs,ns;for(let t=0;t<20000;t++){cs=sample(r,cPool,3);ns=sample(r,nPool,3);
    if((t>=17000||novel(cs,ns))&&ns.every(n=>cs.every(c=>{const k=(BUCKET.get(n*100000+c)||[]).length;return k>=need(t)&&k<=cap(t)})))break}
  memAdd("grade",heads(cs,ns).join(","));
  const cells=Array(9).fill(null);let left=9,over=false;const used=new Set();
  st.innerHTML=`<div class="grid3"></div><div class="row" style="margin-top:14px"><button class="btn" data-a="give">Desistir e ver respostas</button></div>`;
  const grid=st.querySelector(".grid3");
  function draw(){
    let h=`<div class="corner"><img src="${BODEHEAD}" alt=""><b>${left}</b><small>chutes</small></div>`;
    h+=cs.map(c=>`<div class="gh">${clubCrest(c)}<span>${esc(clubName(c))}</span></div>`).join("");
    ns.forEach((n,ri)=>{h+=`<div class="gh"><i class="flag fl">${flag(ST.NATS[n][1])}</i><span>${esc(natName(n))}</span></div>`;
      cs.forEach((c,ci)=>{const i=ri*3+ci,v=cells[i];const tot=(BUCKET.get(n*100000+c)||[]).length;
        h+=v?`<div class="cell ${v.rev?"rev":"done"}">${face(v.p)}<div class="nm">${esc(v.p.name)}</div></div>`
          :`<button type="button" class="cell" data-i="${i}" ${over?"disabled":""} aria-label="${esc(natName(n))} e ${esc(clubName(c))}"><span class="muted" style="font-size:11px">${over||HG?"":tot+" possíveis"}</span></button>`})});
    grid.innerHTML=h}
  function end(){over=true;const filled=cells.filter(v=>v&&!v.rev).length;draw();
    const sq=[0,1,2].map(r=>[0,1,2].map(c=>cells[r*3+c]&&!cells[r*3+c].rev?"🟩":"⬛").join("")).join("\n");
    finish("grade",st,{won:filled===9,score:filled,label:`Você preencheu ${filled}/9 quadrados.`,chip:`${filled}/9`,share:`${shareHead("GRADE")} ${filled}/9\n${sq}`})}
  grid.addEventListener("click",e=>{const b=e.target.closest("button.cell");if(!b||over)return;const i=+b.dataset.i;const n=ns[Math.floor(i/3)],c=cs[i%3];
    const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="box"><h3><i class="flag">${flag(ST.NATS[n][1])}</i>${esc(natName(n))} + ${clubCrest(c)}${esc(clubName(c))}</h3><div class="s"></div><div class="row" style="margin-top:12px"><button class="btn" data-x>Cancelar</button></div></div>`;
    document.body.appendChild(m);const close=()=>m.remove();m.addEventListener("click",ev=>{if(ev.target===m||ev.target.closest("[data-x]"))close()});
    const inp=makeSearch(m.querySelector(".s"),{onPick(p){close();if(used.has(p.id)){toast("Esse jogador já foi usado");return}left--;
      if(p.nat===n&&vlIn(p,c)){cells[i]={p};used.add(p.id);hit();draw()}else{miss();draw();const cell=grid.querySelector(`[data-i="${i}"]`);cell&&cell.classList.add("bad");toast(`${p.name}: ${natName(p.nat)}, ${vlIn(p,c)?"passou pelo clube, mas a seleção não bate":"não passou por "+clubName(c)}`)}
      if(left<=0||cells.every(Boolean))end()}});setTimeout(()=>inp.focus(),30)});
  st.querySelector("[data-a=give]").addEventListener("click",()=>{if(over)return;cells.forEach((v,i)=>{if(!v){const n=ns[Math.floor(i/3)],c=cs[i%3];const opts=(BUCKET.get(n*100000+c)||[]).filter(p=>!used.has(p.id)).sort((a,b)=>(a.fam||9)-(b.fam||9)||b.season-a.season);if(opts[0]){cells[i]={p:opts[0],rev:true};used.add(opts[0].id)}}});end()});
  draw();
})}};
