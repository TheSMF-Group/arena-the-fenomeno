// @ts-nocheck
import {ST} from "../state";
import {clubName, dayNum, esc, face, natName, pick, toast} from "../core";
import {makeSearch} from "../search";
import {clubOk, clubSlugOk, markClubs, GAMES, MODE, dailyPick, finish, hit, isHard, memAdd, memList, miss, shareHead} from "../engine";
import {groupsBy} from "./conexoes";
import {fmtN} from "./futgeo";
import {QS_POS} from "./questoes";
import {CR_YOUTH} from "./carreira";
import {failBox, isAns, isoFlag, loadEnt, loadNovos, loadingBox, natByIso} from "./entrosa";
import {anosMeses} from "./piramide";
import {VLPASS, loadPass} from "./velha";
import {DRPOS, loadPos} from "./draft-core";

/* 12. TOP 10 — o "Top10" do futbol11: complete a lista */
/* listas abertas do modo infinito: 10 jogadores de uma seleção que passaram por um clube (qualquer época) */
export function openList(r,HG){const crestOf=ci=>ST.CLUBS[ci][1],cn=ci=>(ST.CRESTS.find(c=>c.id===crestOf(ci))||{name:clubName(ci)}).name;
  if(!openList.by){openList.by={};for(const k in VLPASS){const ci=+k,cr=crestOf(ci),ids=VLPASS[k];openList.by[ci]=ST.P.filter(p=>p.nat!=null&&(crestOf(p.club)===cr&&cr||ids.has(p.id)))}}
  const by=openList.by,past=new Set(memList("top10")),opts=[];
  const fit=mem=>{const fam=mem.filter(p=>p.fam===1).length;return HG?mem.length>=10&&mem.length<=22&&fam<=8:mem.length>=18&&fam>=10};
  const csAll=Object.keys(by).map(Number),csOk=csAll.filter(ci=>clubOk(ci)),cs=csOk.length>=10?csOk:csAll;
  for(const ci of cs){const mem=by[ci];
    for(const [n,m] of groupsBy(mem,p=>p.nat,10))if(fit(m))opts.push({key:"o"+ci+":"+n,cis:[ci],m,t:`${natName(n)} + ${cn(ci)}: 10 que passaram por lá`})}
  for(let a=0;a<cs.length;a++)for(let b=a+1;b<cs.length;b++){const sb=new Set(by[cs[b]].map(p=>p.id)),m=by[cs[a]].filter(p=>sb.has(p.id));
    if(m.length>=10&&fit(m))opts.push({key:"c"+cs[a]+":"+cs[b],cis:[cs[a],cs[b]],m,t:`${cn(cs[a])} + ${cn(cs[b])}: 10 que jogaram nos dois`})}
  const fresh=opts.filter(o=>!past.has(o.key));if(!fresh.length)return null;const o=pick(r,fresh);memAdd("top10",o.key);
  const cand=o.m.slice().sort((a,b)=>(a.fam||9)-(b.fam||9)||b.season-a.season).map(p=>({name:p.name,v:"",h:"",alt:[],p,keys:[p.key]}));
  const set=new Set(o.m.map(p=>p.id));
  return{open:true,k:"open",cis:o.cis,id:o.key,t:o.t,s:`qualquer época, não precisa ser o último clube · ${o.m.length} possíveis na base`,test:p=>set.has(p.id),cand}}
/* listas geradas do Top 10: ranking pelo pico de valor de mercado (Transfermarkt), por posição, seleção e clube */
export const T10_POSN={gol:"Goleiros",zag:"Zagueiros",ld:"Laterais-direitos",le:"Laterais-esquerdos",mc:"Meio-campistas",vol:"Volantes",mei:"Meias-atacantes",pd:"Pontas-direitos",pe:"Pontas-esquerdos",ata:"Atacantes"};
export const T10_CN={"Florenz":"Fiorentina","AC Parma":"Parma","Atlético":"Atlético de Madrid"};
export const fmtEur=v=>`€${(v/1e6).toLocaleString("pt-BR",{maximumFractionDigits:v>=1e7?0:1})} mi`;
export let T10G=null;
export function t10Build(D){if(T10G)return T10G;
  const grpOf={};QS_POS.forEach(([k,,,ids])=>ids.forEach(i=>{grpOf[i]=k}));
  const GV=new Map(),GL=new Map(),add=(G,k,row)=>{let a=G.get(k);if(!a)G.set(k,a=[]);a.push(row)};
  for(const p of ST.P){const e=DRPOS&&DRPOS[p.id];if(!e||p.nat==null||!ST.NATS[p.nat])continue;const g=grpOf[e[1]];if(!g)continue;
    const K=D.K[p.id],rv=e[0]>0?{p,v:e[0]}:null,rl=K&&K[2]-K[1]>=60?{p,v:K[2]-K[1]}:null;if(!rv&&!rl)continue;
    const keys=["g:"+g,"n:"+p.nat,"n:"+p.nat+"|g:"+g],ss=D.S.get(p.id);
    if(ss)for(const c of new Set(ss.map(x=>{const n=(D.C[x[0]]||"").trim();return CR_YOUTH.test(n)||n==="?"?"":(T10_CN[n]||n)}))){if(c){keys.push("c:"+c);keys.push("c:"+c+"|g:"+g)}}
    for(const k of keys){rv&&add(GV,k,rv);rl&&add(GL,k,rl)}}
  const out=[],nameSlug={};D.C.forEach((n,i)=>{const k=T10_CN[n.trim()]||n.trim();if(D.E[i]&&!nameSlug[k])nameSlug[k]=D.E[i]});
  const run=(G,pre,fmt,head,sub0)=>{for(const [key,rows] of G){if(rows.length<10)continue;rows.sort((a,b)=>b.v-a.v);const top=rows.slice(0,10);if(new Set(top.map(x=>x.v)).size<7)continue;
    const parts=key.split("|").map(x=>[x[0],x.slice(2)]),pg=parts.find(x=>x[0]==="g"),pn=parts.find(x=>x[0]==="n"),pc=parts.find(x=>x[0]==="c");
    const who=pg?T10_POSN[pg[1]]:"Jogadores";let t,sub=sub0;
    if(pn){t=pg?`${head(who)}: ${natName(+pn[1])}`:`${head("")} da seleção: ${natName(+pn[1])}`;sub+=" · só jogadores dessa seleção"}
    else if(pc){t=pg?`${head(who)} que passaram pelo ${pc[1]}`:`${head("")} entre quem passou pelo ${pc[1]}`;sub+=" · qualquer época, qualquer passagem"}
    else{t=`${head(who)} da história`;sub+=" · de todas as épocas"}
    out.push({id:pre+key,k:"val",gen:true,club:!!pc,slug:pc?nameSlug[pc[1]]:null,t:t.replace(/^ /,""),s:sub,dif:(f=>f>=8?1:f<=5?3:0)(top.filter(x=>x.p.fam===1).length),
      it:top.map(x=>({name:x.p.name,v:fmt(x.v),h:ST.NATS[x.p.nat][1],alt:[],p:x.p,keys:[x.p.key]}))})}};
  run(GV,"v:",fmtEur,w=>w?`${w} mais valiosos`:"Mais valiosos","maior valor de mercado que o jogador já teve no Transfermarkt");
  run(GL,"l:",anosMeses,w=>w?`${w} com a carreira mais longa`:"Carreira mais longa","do primeiro contrato profissional ao último jogo, pelo Transfermarkt");
  return T10G=out}
GAMES.top10={name:"TOP 10",hard:"Rankings menos óbvios, sem dicas, 3 erros e 2 minutos.",
desc:"Rankings de verdade: artilheiros, valor de mercado, carreiras. Complete o Top 10.",
levels:{normal:["Rankings de verdade: artilheiros, valores de mercado e carreiras mais longas. Sem tempo e com 5 erros.","centenas de rankings · 5 erros"],hard:["Rankings com nomes menos óbvios. Sem dicas, 3 erros e 2 minutos.","centenas de rankings · 2 minutos"]},
rules:"Digite os jogadores do ranking do dia. Cada acerto entra na posição certa e cada nome fora da lista custa uma vida. Completou os 10, ganhou. Faltou algum, perdeu.",
start(st,r){let alive=true,timer=null;ST.CLEAN=()=>{alive=false;clearInterval(timer)};loadingBox(st,"MONTANDO A LISTA…");
  Promise.all([loadNovos(),loadPass(),loadEnt(),loadPos()]).then(([N,,D])=>{if(!alive)return;
    const HG=isHard(),cur=N.L.filter(l=>l.k==="stat"&&(HG?l.dif===3:l.dif===1)),gen=t10Build(D).filter(l=>l.dif===(HG?3:1)&&(!l.club||clubSlugOk(l.slug)));
    let L;if(MODE.free)L=gen.length&&r()<.85?dailyPick("top10v",gen,r):dailyPick("top10",cur,r);
    else L=gen.length&&dayNum()%4!==0?dailyPick("top10v",gen,r):dailyPick("top10",cur,r);
    if(L.slug)markClubs([L.slug]);if(L.cis)markClubs(L.cis);
    const LIVES=HG?3:5,TIME=HG?120:0;let lives=LIVES,done=false,deadline=Date.now()+TIME*1000;const found=new Set(),tried=new Set(),ev=[];
    const KL={stat:"Ranking",award:"Vencedores",xi:"Escalação",open:"Passaram por lá",val:"Valor de mercado"};
    st.innerHTML=`<div class="t10"><div class="t10-head"><div class="fg-kick">${KL[L.k]}</div><div class="t10-title">${esc(L.t)}</div><small>${esc(L.s)}</small></div>
      <div class="t10-bar"><span class="lives"></span>${TIME?`<span class="pill t10-time"></span>`:""}<span class="spacer"></span><button class="btn" type="button" data-a="give">Desistir</button></div>
      <div class="srch"></div><ol class="t10-list"></ol><div class="guesses"></div></div>`;
    const list=st.querySelector(".t10-list"),srch=st.querySelector(".srch"),gl=st.querySelector(".guesses");
    const hintOf=x=>HG||L.open?"":L.k==="xi"?esc(x.h):`${isoFlag(x.h)} ${esc(natByIso(x.h))}`;
    if(L.open){L.it=Array.from({length:10},()=>null);L.left=L.cand.slice()}
    function draw(){
      if(L.open&&done)L.it=L.it.map(x=>x||L.left.shift()||null);
      list.innerHTML=L.it.map((x,i)=>{if(L.open&&!x)return`<li><span class="rk">${i+1}</span><span class="nm"><span class="hn">? ? ?</span></span></li>`;const ok=found.has(i),show=ok||done;
        return`<li class="${ok?"ok":done?"miss":""}"><span class="rk">${i+1}</span>${show?face(x.p):""}<span class="nm">${show?esc(x.name)+(done&&x.alt.length?`<small class="muted"> ou ${x.alt.map(esc).join(", ")}</small>`:""):`<span class="hn">${hintOf(x)||"? ? ?"}</span>`}</span>${show&&L.k!=="xi"&&!L.open?`<span class="vl ${L.k}">${esc(L.k==="stat"?fmtN(x.v):x.v)}</span>`:""}</li>`}).join("");
      st.querySelector(".lives").innerHTML=Array.from({length:LIVES},(_,i)=>`<i class="${i<lives?"":"off"}"></i>`).join("")+` ${found.size}/10`}
    function tick(){const left=Math.max(0,deadline-Date.now()),s=Math.ceil(left/1000);const el=st.querySelector(".t10-time");if(el){el.textContent=`⏱ ${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;el.classList.toggle("low",s<=20)}if(left<=0)end("tempo")}
    function end(why){if(done)return;done=true;clearInterval(timer);srch.innerHTML="";st.querySelector("[data-a=give]").remove();draw();
      const n=found.size;if(n<10&&MODE.free&&why!=="vida")miss();
      finish("top10",st,{won:n===10,score:n,label:`${n===10?"Lista completa!":`Você não completou a lista: achou ${n} de 10.`}${why==="tempo"?" O tempo acabou.":why==="vida"?" Acabaram as vidas.":why==="desistiu"?" Você desistiu.":""}`,chip:`${n}/10`,share:`${shareHead("TOP 10")}\n${L.t}\n${L.it.map((_,i)=>found.has(i)?"🟩":"⬛").join("")}`})}
    st.querySelector("[data-a=give]").addEventListener("click",()=>end("desistiu"));
    makeSearch(srch,{onPick(p){if(done)return;if(tried.has(p.key)){toast("Você já tentou esse");return}tried.add(p.key);
      let i=L.open?(L.test(p)&&!L.it.some(x=>x&&x.p.id===p.id)?L.it.indexOf(null):-1):L.it.findIndex((x,j)=>!found.has(j)&&isAns(p,x.p,x.keys));
      if(L.open&&i>=0){L.it[i]={name:p.name,v:"",h:"",alt:[],p,keys:[p.key]};L.left=L.left.filter(x=>x.p.id!==p.id)}
      if(i>=0){found.add(i);ev.push(1);hit();draw();const li=list.children[i];li&&li.classList.add("pop");if(found.size===10)end("ok");return}
      lives--;ev.push(0);miss();gl.insertAdjacentHTML("afterbegin",`<div><span class="mini" style="width:26px">${face(p)}</span>${esc(p.name)} não está na lista</div>`);draw();if(lives<=0)end("vida")}});
    draw();if(TIME){tick();timer=setInterval(tick,250)}
  }).catch(()=>failBox(st));
}};

/* 13. JOGO DA VELHA — multiplayer por código. Cada partida é uma sala (room.join) e o estado viaja na presence
   de cada jogador: quem tem o seq maior manda. Sem sala disponível, dá para jogar no mesmo aparelho. */
