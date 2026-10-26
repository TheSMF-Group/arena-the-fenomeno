// @ts-nocheck
import {ST} from "../state";
import {dayNum, esc, face, fmtDate, pick, sample, shuffle, toast, year} from "../core";
import {GAMES, MODE, dailyPick, finish, hit, isHard, markPeople, memAdd, memList, miss, pool, prefer, seenPeople, shareHead, unseenCount} from "../engine";
import {fmtN} from "./futgeo";
import {entYear, failBox, isoFlag, loadEnt, loadNovos, loadingBox, natByIso} from "./entrosa";

/* 11. PIRÂMIDE — o "Pyramid" do futbol11: 10 jogadores, 1-2-3-4 casas, do maior para o menor */
export const PYR_ROWS=[1,2,3,4],tierOf=s=>s<1?0:s<3?1:s<6?2:3,TIER_TXT=["1º","2º–3º","4º–6º","7º–10º"];
export function ageList(r,HG){const PL=prefer(pool().filter(p=>p.birth),seenPeople("piramide"),400);let it=[];
  for(let t=0;t<60&&it.length<10;t++){const a=pick(r,PL),y=year(a),w=HG?3:12;const near=shuffle(r,PL.filter(p=>Math.abs(year(p)-y)<=w));it=[];const seen=new Set();for(const p of near){if(seen.has(p.birth))continue;seen.add(p.birth);it.push(p);if(it.length===10)break}}
  markPeople("piramide",it);
  return{t:"Quem nasceu primeiro?",s:HG?"todos nasceram com poucos anos de diferença":"do mais velho (no topo) ao mais novo",age:true,it:it.map(p=>({name:p.name,v:-p.birth,show:fmtDate(p.birth),h:ST.NATS[p.nat][1],p}))}}
export const anosMeses=m=>{const a=Math.floor(m/12),b=m%12;return a?`${a} ano${a>1?"s":""}${b?` e ${b} m`:""}`:`${b} meses`};
export function pyrGen(D,r,HG){const seenP=seenPeople("piramide"),past=new Set(memList("piramide"));const base=(HG?ST.HARD:ST.FAM).filter(p=>D.S.has(p.id)&&D.K[p.id]);
  for(let t=0;t<60;t++){const k=pick(r,["clubes","carreira","ficou","chegou"]);let rows=[],title,sub,key;
    if(k==="clubes"||k==="carreira"){const ps=sample(r,prefer(base,seenP,200),10);if(ps.length<10)continue;
      rows=ps.map(p=>{const K=D.K[p.id];return k==="clubes"?{p,v:K[0],show:K[0]+" clubes"}:{p,v:K[2]-K[1],show:anosMeses(K[2]-K[1])}});
      title=k==="clubes"?"Quem rodou mais clubes?":"Quem teve a carreira mais longa?";sub=k==="clubes"?"clubes profissionais na carreira, empréstimos inclusos":"da primeira transferência como profissional até o último jogo";key=k+":"+ps.map(p=>p.id).sort().join(",")}
    else{const c=pick(r,Object.keys(D.idx));const at=new Map();for(const [p,a,b] of D.idx[c])if(base.includes(p)){const o=at.get(p)||{p,tot:0,first:a};o.tot+=b-a;o.first=Math.min(o.first,a);at.set(p,o)}
      const vals=[...at.values()];if(vals.length<10)continue;const ten=sample(r,prefer(vals.map(x=>x.p),seenP,10),10).map(p=>at.get(p));
      rows=ten.map(x=>k==="ficou"?{p:x.p,v:x.tot,show:anosMeses(x.tot)}:{p:x.p,v:-x.first,show:"chegou em "+entYear(x.first)});
      title=k==="ficou"?`Mais tempo de clube: ${D.C[c]}`:`Quem chegou primeiro? ${D.C[c]}`;sub=k==="ficou"?"tempo somado de todas as passagens pelo clube":"do primeiro a chegar (no topo) ao mais recente";key=k+c+":"+ten.map(x=>x.p.id).sort().join(",")}
    if(past.has(key)||new Set(rows.map(x=>x.v)).size<6)continue;
    memAdd("piramide",key);markPeople("piramide",rows.map(x=>x.p));
    return{gen:true,t:title,s:sub,kick:k==="chegou"?"Chegada":"Carreira",it:rows.map(x=>({name:x.p.name,v:x.v,show:x.show,h:ST.NATS[x.p.nat][1],p:x.p}))}}
  return null}
GAMES.piramide={name:"PIRÂMIDE",hard:"vale ponto só quem estiver na posição exata (1º ao 10º, da esquerda para a direita em cada linha), listas de nicho ou jogadores nascidos com até 3 anos de diferença, e sem o botão de ajuda.",
desc:"Monte o ranking: do 1º no topo ao 10º na base.",
levels:{normal:["Rankings que todo boleiro conhece: artilheiros das Copas, da Premier League, da Seleção, Bolas de Ouro, além de \"quem nasceu primeiro\". Cada jogador tem que ficar na posição exata, do maior para o menor, da esquerda para a direita. Um botão de ajuda por jogo.","crave a posição · 1 ajuda"],hard:["Artilheiros históricos de La Liga, Serie A e Bundesliga, com Zarra, Piola e Burgsmüller, ou dez jogadores nascidos quase no mesmo ano. Tem que cravar a posição exata de cada um, sem ajuda.","crave a posição · sem ajuda"]},
rules:"Os 10 jogadores aparecem um por vez: clique numa casa vazia para colocar cada um. As casas vão do 1º (topo) ao 10º, da esquerda para a direita em cada linha: 1º no topo, 2º e 3º na segunda linha, 4º a 6º na terceira e 7º a 10º na base. Clique em dois jogadores já colocados para trocar de lugar. Cada jogador na posição exata vale um ponto (do maior para o menor, da esquerda para a direita); jogadores empatados valem em qualquer ordem.",
start(st,r){let alive=true;ST.CLEAN=()=>{alive=false};loadingBox(st,"EMPILHANDO OS CRAQUES…");
  Promise.all([loadNovos(),MODE.free?loadEnt().catch(()=>null):null]).then(([N,D])=>{if(!alive)return;
    const HG=isHard(),cur=N.L.filter(l=>l.pyr&&(HG?l.dif===3:l.dif===1));
    let L=null;if(MODE.free){const x=r();L=x<(unseenCount("piramide",cur)?.3:0)?dailyPick("piramide",cur,r):x<.6&&D?pyrGen(D,r,HG):ageList(r,HG)}
    else L=dayNum()%2===0?ageList(r,HG):dailyPick("piramide",cur,r);
    if(!L)L=ageList(r,HG);
    const items=L.age||L.gen?L.it:L.it.map(x=>({...x,show:fmtN(x.v),h:x.h}));
    const sorted=items.map(x=>x.v).sort((a,b)=>b-a);
    const okTier=(x,t)=>sorted.some((v,j)=>tierOf(j)===t&&v===x.v),okAt=(x,i)=>!!x&&sorted[i]===x.v;
    const queue=shuffle(r,items),slots=Array(10).fill(null);let sel=-1,checked=false,help=!HG,helpOn=new Set();
    st.innerHTML=`<div class="t10-head"><div class="fg-kick">${L.age?"Idade":L.kick||"Ranking"}</div><div class="t10-title">${esc(L.t)}</div><small>${esc(L.s)}</small></div>
      <div class="pyr"><div class="pnow"></div><div><div class="pyr-rows"></div><div class="row" style="justify-content:center;margin-top:14px"><button class="btn y" type="button" data-a="ok" disabled>Conferir pirâmide</button>${HG?"":`<button class="btn" type="button" data-a="help" disabled>Ajuda (1x)</button>`}</div></div></div>`;
    const rows=st.querySelector(".pyr-rows"),now=st.querySelector(".pnow"),okb=st.querySelector("[data-a=ok]"),hb=st.querySelector("[data-a=help]");
    const card=x=>`${face(x.p)}<b>${esc(x.name)}</b>`;
    function draw(){let s=0;
      rows.innerHTML=PYR_ROWS.map((n,ri)=>`<div class="pyr-row">${Array.from({length:n},()=>{const i=s++,x=slots[i];
        const cls=checked?(okAt(x,i)?"ok":"no"):(x?"full":"")+(i===sel?" sel":"")+(helpOn.has(i)?" helpok":"");
        return`<button type="button" class="slot ${cls}" data-s="${i}" ${checked?"disabled":""} aria-label="${x?esc(x.name):"Posição "+(i+1)}">${x?card(x)+(checked?`<span class="vl">${esc(x.show)}</span>`:""):`<span class="rk">${i+1}º</span>`}</button>`}).join("")}</div>`).join("");
      const q=queue[0];
      now.innerHTML=checked?"":q?`<div class="now"><small class="fg-kick">Coloque na pirâmide · faltam ${queue.length}</small>${face(q.p)}<b>${esc(q.name)}</b>${q.h?`<small>${isoFlag(q.h)} ${esc(natByIso(q.h))}</small>`:""}</div>`:`<div class="now"><small class="fg-kick">Todos na pirâmide</small><b>Troque o que quiser e confira.</b></div>`;
      okb.disabled=checked||queue.length>0;if(hb)hb.disabled=checked||!help||slots.every(x=>!x)}
    rows.addEventListener("click",e=>{const b=e.target.closest(".slot");if(!b||checked)return;const i=+b.dataset.s;
      if(sel<0&&!slots[i]&&queue.length){slots[i]=queue.shift();helpOn.delete(i);draw();return}
      if(sel<0){if(slots[i]){sel=i;draw()}return}
      if(sel===i){sel=-1;draw();return}
      [slots[sel],slots[i]]=[slots[i],slots[sel]];helpOn.delete(sel);helpOn.delete(i);sel=-1;draw()});
    hb&&hb.addEventListener("click",()=>{if(!help)return;help=false;slots.forEach((x,i)=>{if(x&&okAt(x,i))helpOn.add(i)});toast(helpOn.size?`${helpOn.size} na posição certa (contorno verde)`:"Nenhum na posição certa ainda");draw()});
    okb.addEventListener("click",()=>{checked=true;sel=-1;draw();st.querySelector(".pyr .row").remove();
      const ok=slots.filter((x,i)=>okAt(x,i)).length;ok>=7?hit():miss();let s=0;
      const sq=PYR_ROWS.map(n=>Array.from({length:n},()=>{const i=s++;return okAt(slots[i],i)?"🟩":"🟥"}).join("")).join("\n");
      const top=items.slice().sort((a,b)=>b.v-a.v)[0];
      finish("piramide",st,{won:ok===10,score:ok,label:`${ok} de 10 na posição exata. O topo era ${top.name} (${top.show}).`,chip:`${ok}/10`,share:`${shareHead("PIRÂMIDE")}\n${sq}`})});
    draw();
  }).catch(()=>failBox(st));
}};
