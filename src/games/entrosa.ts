// @ts-nocheck
import {BODEHEAD, esc, face, flag, norm, pick, shuffle, toast} from "../core";
import {ST} from "../state";
import {makeSearch} from "../search";
import {GAMES, MODE, dailyPick, finish, hit, isHard, memAdd, memList, miss, shareHead, unseenCount} from "../engine";

/* 10-12. ENTROSAMENTO, PIRÂMIDE e TOP 10 (inspirados no Link, Pyramid e Top10 do futbol11). Listas em novos.json, curadas à mão */
export let NOVOS=null;export const XP=[];
export function loadNovos(){if(!NOVOS)NOVOS=Promise.all([fetch("/novos.json").then(r=>{if(!r.ok)throw new Error("novos");return r.json()}),fetch("/lendas.json").then(r=>r.ok?r.json():{}).catch(()=>({}))]).then(([n,lendas])=>{
    const byId=new Map(ST.P.map(p=>[p.id,p])),keys=new Set(ST.P.map(p=>p.key)),xk={};
    const who=(name,pid)=>{if(pid&&byId.has(pid))return byId.get(pid);const k=norm(name);if(!xk[k]){xk[k]={id:-(XP.length+1),name,nat:null,birth:0,club:null,season:2000,fam:1,key:k,words:k.split(" ")};XP.push(xk[k])}return xk[k]};
    const nick=(p,a)=>{const k=norm(a);if(!keys.has(k)&&k!==p.key)(p.ak=p.ak||[]).push(k)};
    n.L.forEach(l=>{l.it=l.it.map(([name,v,h,pid,alt])=>{const p=who(name,pid);alt.forEach(a=>{if(l.k==="xi")nick(p,a);else if(!keys.has(norm(a)))who(a,0)});return{name,v,h,alt,p,keys:[name,...alt].map(norm)}})});
    n.E.forEach(e=>{e.p=who(e.a,e.p);e.alt.forEach(x=>nick(e.p,x));e.keys=[e.a,...e.alt].map(norm);e.m=e.m.map(([name,w,pid])=>({name,w,p:who(name,pid)}))});
    XP.forEach(p=>{if(lendas[p.name])ST.FOTOS[p.id]=lendas[p.name]});
    return n}).catch(e=>{NOVOS=null;throw e});return NOVOS}
export const isAns=(g,p,keys)=>g.id===p.id||keys.includes(g.key);
export const natByIso=iso=>(ST.NATS.find(n=>n[1]===iso)||[iso||""])[0];
export const isoFlag=iso=>iso?`<i class="flag">${flag(iso)}</i>`:"";
export function loadingBox(st,txt){st.innerHTML=`<div class="fg-load"><img src="${BODEHEAD}" alt=""><b>${txt}</b></div>`}
export function failBox(st){st.innerHTML=`<p class="muted">Não deu para carregar as listas. Recarregue a página.</p>`}

/* 10. ENTROSAMENTO — o "Link" do futbol11 */
/* modo infinito: companheiros gerados das passagens com data (Transfermarkt). Meses contados desde jan/1900 */
export let ENTD=null;
export function loadEnt(){if(!ENTD)ENTD=fetch("/entrosa.json?v=3").then(r=>{if(!r.ok)throw new Error("entrosa");return r.json()}).then(d=>{
    const byId=new Map(ST.P.map(p=>[p.id,p])),idx={},S=new Map();
    for(const k in d.S){const p=byId.get(+k);if(!p)continue;const a=d.S[k],st=[];for(let i=0;i<a.length;i+=3){st.push([a[i],a[i+1],a[i+2]]);(idx[a[i]]=idx[a[i]]||[]).push([p,a[i+1],a[i+2]])}S.set(p.id,st)}
    const K={};for(const k in d.K||{})K[k]=d.K[k];return{C:d.C,S,idx,K,E:d.E||{}}}).catch(e=>{ENTD=null;throw e});return ENTD}
export function entMates(D,p){const out=new Map();
  for(const [c,s,e] of D.S.get(p.id)||[])for(const [q,s2,e2] of D.idx[c]||[]){if(q===p)continue;const a=Math.max(s,s2),b=Math.min(e,e2);
    if(b-a>=6){const o=out.get(q.id);if(!o||b-a>o.b-o.a)out.set(q.id,{p:q,c,a,b})}}
  return[...out.values()]}
export const entYear=m=>Math.floor(m/12)+1900;
export function genEntrosa(D,r,HG){const base=(HG?ST.HARD:ST.FAM).filter(p=>D.S.has(p.id)),seen=new Set(memList("entrosa"));
  const fresh=base.filter(p=>!seen.has(String(p.id))),paths=new Set(memList("entrosa:k"));
  for(let t=0;t<120;t++){const a=pick(r,fresh.length>20&&t<100?fresh:base);
    let ms=entMates(D,a).filter(m=>ST.FOTOS[m.p.id]);
    if(HG){const nich=ms.filter(m=>m.p.fam!==1);if(nich.length>=7)ms=nich}else ms=ms.filter(m=>m.p.fam===1);
    if(ms.length<(HG?6:7)||new Set(ms.map(m=>m.c)).size<2)continue;
    const five=[],per={};for(const m of shuffle(r,ms)){if((per[m.c]||0)>=2)continue;per[m.c]=(per[m.c]||0)+1;five.push(m);if(five.length===5)break}
    for(const m of shuffle(r,ms)){if(five.length===5)break;if(!five.includes(m))five.push(m)}
    if(five.length<5)continue;
    const key=a.id+":"+five.map(m=>m.p.id).sort().join(",");if(paths.has(key))continue;
    memAdd("entrosa",a.id);memAdd("entrosa:k",key);
    return{gen:true,id:"g"+a.id,a:a.name,p:a,f:ST.NATS[a.nat][1],keys:[a.key],
      m:five.map(m=>({name:m.p.name,w:`${D.C[m.c]} · ${entYear(m.a)===entYear(m.b)?entYear(m.a):entYear(m.a)+"–"+entYear(m.b)}`,p:m.p}))}}
  return null}

GAMES.entrosa={name:"ENTROSAMENTO",hard:"craques menos óbvios, companheiros de nicho, sem dizer onde jogaram juntos e sem a bandeira do misterioso.",
desc:"Ele jogou com esses cinco. Quem é?",
levels:{normal:["Craques conhecidos e companheiros famosos. Cada carta diz onde os dois jogaram juntos, e a partir do 3º companheiro aparece a seleção do misterioso. No infinito, os companheiros são sorteados de todas as passagens do Transfermarkt e o caminho nunca se repete.","com dicas · infinito sem repetir"],hard:["Ídolos cult e companheiros de nicho: Mutu, Petković, Kovačević, Fran do Deportivo. Ninguém diz onde jogaram juntos.","sem dicas · infinito sem repetir"]},
rules:"Um jogador misterioso jogou junto (no clube ou na seleção) com os cinco companheiros que vão aparecendo. Começa com um. Chute ou peça o próximo: cada erro também revela mais um companheiro. Com os cinco na mesa, você tem um último chute.",
start(st,r){let alive=true;ST.CLEAN=()=>{alive=false};loadingBox(st,"ESCALANDO OS COMPANHEIROS…");
  Promise.all([loadNovos(),MODE.free?loadEnt().catch(()=>null):null]).then(([N,D])=>{if(!alive)return;
    const HG=isHard(),cur=N.E.filter(e=>HG?e.dif===3:e.dif===1);
    const ans=(MODE.free&&D&&r()<(unseenCount("entrosa",cur)?.6:.97)&&genEntrosa(D,r,HG))||dailyPick("entrosa",cur,r);
    let shown=1,done=false,won=false;const ev=[],tried=new Set();
    st.innerHTML=`<div class="ent"><div><div class="mates"></div><p class="muted ent-note"></p></div>
      <div><div class="myst"><div class="ph"></div><div><small>Jogador misterioso</small><b class="mname">? ? ?</b><div class="mhint"></div></div></div>
      <div class="srch"></div><div class="row" style="margin-top:10px"><button class="btn" type="button" data-a="skip">Mostrar o próximo →</button><span class="lives"></span></div><div class="guesses"></div></div></div>`;
    const mates=st.querySelector(".mates"),srch=st.querySelector(".srch"),skip=st.querySelector("[data-a=skip]"),gl=st.querySelector(".guesses");
    function draw(fresh){
      mates.innerHTML=ans.m.map((m,i)=>i<shown||done?`<div class="mate ${fresh&&i===shown-1?"new":""}">${face(m.p)}<b>${esc(m.name)}</b>${!HG||done?`<small>${esc(m.w)}</small>`:""}</div>`:`<div class="mate lock" aria-label="Companheiro escondido">${i+1}</div>`).join("");
      st.querySelector(".ph").innerHTML=done?face(ans.p):`<div class="q">?</div>`;
      st.querySelector(".mname").textContent=done?ans.a:"? ? ?";
      st.querySelector(".mhint").innerHTML=(!HG&&shown>=3)||done?`${isoFlag(ans.f)} ${esc(natByIso(ans.f))}`:`<span class="muted">${HG?"sem dicas no difícil":"a seleção aparece no 3º companheiro"}</span>`;
      skip.disabled=done||shown>=5;
      st.querySelector(".lives").innerHTML=done?"":shown>=5?"<b class='hardnote'>Último chute!</b>":`${shown} de 5 companheiros`;
      st.querySelector(".ent-note").textContent=done?"":"Os companheiros não estão em ordem cronológica. Vale clube ou seleção, só no profissional."}
    function end(w){done=true;won=w;srch.innerHTML="";w?hit():miss();draw(false);
      const sq=ev.map(x=>x==="ok"?"🟩":x==="skip"?"⬜":"🟥").join("");
      finish("entrosa",st,{won:w,score:w?shown:0,label:w?`Era ${ans.a}. Acertou com ${shown} de 5 companheiros na mesa.`:`Era ${ans.a}.`,chip:w?`${shown}/5`:"X/5",share:`${shareHead("ENTROSAMENTO")}\n${sq}`})}
    skip.addEventListener("click",()=>{if(done||shown>=5)return;ev.push("skip");shown++;draw(true)});
    makeSearch(srch,{onPick(p){if(done)return;if(tried.has(p.key)){toast("Você já chutou esse");return}tried.add(p.key);
      if(isAns(p,ans.p,ans.keys)){ev.push("ok");end(true);return}
      ev.push("x");gl.insertAdjacentHTML("afterbegin",`<div><span class="mini" style="width:26px">${face(p)}</span>${esc(p.name)}</div>`);
      if(shown>=5)end(false);else{shown++;draw(true)}}});
    draw(true);
  }).catch(()=>failBox(st));
}};
