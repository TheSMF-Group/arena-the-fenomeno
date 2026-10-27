// @ts-nocheck
import {ST} from "../state";
import {clubCrest, clubName, esc, face, flag, natName, pick, sample, toast} from "../core";
import {makeSearch} from "../search";
import {GAMES, dailyPick, finish, hit, isHard, memAdd, miss, shareHead} from "../engine";
import {failBox, loadingBox} from "./entrosa";
import {TM_POS, drPosOf, loadPos} from "./draft-core";
import {ATU, leAge, loadAtu} from "./leilao";
export let CAMD=null,CAMP=null,KITS={};
export function loadCam(){if(!CAMP)CAMP=Promise.all([fetch("camisas.json?v=1").then(r=>r.ok?r.json():{}).catch(()=>({})),loadAtu(),loadPos(),fetch("kits.json?v=1").then(r=>r.ok?r.json():{}).catch(()=>({}))]).then(([m,,,k])=>{CAMD=m;KITS=k||{};return m});return CAMP}
export const camNum=p=>CAMD&&CAMD[p.id]&&CAMD[p.id][0]>0?CAMD[p.id][0]:null;
export const camCrest=p=>p.club!=null&&ST.CLUBS[p.club]?ST.CLUBS[p.club][1]:null;
export const camShirt=p=>KITS[camCrest(p)]?`<div class="cam-shirt kit"><img class="cam-kit" src="${KITS[camCrest(p)]}" alt="Camisa do ${esc(clubName(p.club))}"><b class="cam-n">${camNum(p)}</b></div>`:`<div class="cam-shirt"><svg viewBox="0 0 200 190" aria-hidden="true"><path d="M62 8 12 38l18 40 22-12v116h96V66l22 12 18-40L138 8c-8 18-22 26-38 26S70 26 62 8Z" fill="#232b24" stroke="#ffd21f" stroke-width="4" stroke-linejoin="round"/></svg><img class="cam-cr" src="${ST.ESC[camCrest(p)]||""}" alt=""><b class="cam-n">${camNum(p)}</b></div>`;
export function camPool(HG){return ST.P.filter(p=>ATU&&ATU[p.id]>0&&camNum(p)&&camCrest(p)&&ST.ESC[camCrest(p)]&&p.nat!=null&&ST.NATS[p.nat]&&(HG?ATU[p.id]>=8e6:(p.fam===1||p.fam===2||ATU[p.id]>=15e6)))}
GAMES.camisa={name:"CAMISA E CONTA",hard:"operações com a camisa de craques, cinco contas e só uma tentativa por conta.",
desc:"Descubra o dono da camisa ou resolva a conta com os números dos craques.",
levels:{normal:["De quem é a camisa? Aparece o clube e o número, e você tem 3 chutes. A cada erro, uma dica: seleção, posição, idade.","clube + número · 3 chutes"],hard:["Operações futebolísticas: cinco contas com a camisa de craques de hoje (soma, subtração e multiplicação). Uma tentativa por conta, e é preciso acertar 4.","5 contas · 1 tentativa cada"]},
rules:"Só jogadores que atuaram na temporada 2025/26, com o número de camisa que usam hoje no clube. No normal, descubra o dono da camisa: vale qualquer jogador que use aquele número naquele clube. No difícil, resolva as contas: cada craque vale o número da sua camisa.",
start(st,r){let alive=true;ST.CLEAN=()=>{alive=false};loadingBox(st,"PROVANDO AS CAMISAS…");
  loadCam().then(()=>{if(!alive)return;const HG=isHard();
    if(!HG){const base=camPool(false),ans=dailyPick("camisa",base,r),num=camNum(ans),cr=camCrest(ans);
      const fits=g=>g.id===ans.id||(camNum(g)===num&&camCrest(g)===cr);
      const hints=[()=>`<i class="flag">${flag(ST.NATS[ans.nat][1])}</i> ${esc(natName(ans.nat))}`,()=>esc([...new Set(drPosOf(ans).map(i=>TM_POS[i]&&TM_POS[i].n).filter(Boolean))].join(", ")||"posição desconhecida"),()=>`${leAge(ans)} anos`],kinds=["Seleção","Posição","Idade"];
      let done=false;const g=[];
      st.innerHTML=`<div class="cam"><div class="cam-top">${camShirt(ans)}<div><small class="fg-kick">Camisa ${num}</small><b class="cam-club">${clubCrest(ans.club,"crest")} ${esc(clubName(ans.club))}</b><p class="muted">Quem usa essa camisa hoje? Cada erro revela uma dica.</p></div></div>
        <div class="cam-hints"></div><div class="srch"></div><p class="muted cam-left"></p><div class="guesses"></div></div>`;
      const hh=st.querySelector(".cam-hints"),gl=st.querySelector(".guesses"),left=st.querySelector(".cam-left");
      const draw=()=>{hh.innerHTML=hints.map((h,i)=>`<div class="cam-h ${g.length>i||done?"on":""}"><small>${kinds[i]}</small><b>${g.length>i||done?h():"?"}</b></div>`).join("");left.textContent=done?"":`${3-g.length} chute${3-g.length===1?"":"s"} restante${3-g.length===1?"":"s"}`};
      const end=won=>{done=true;st.querySelector(".srch").innerHTML="";won?hit():miss();draw();
        finish("camisa",st,{won,score:won?1:0,label:won?`Era ${ans.name}, com ${g.length} chute${g.length===1?"":"s"}.`:`Era ${ans.name}.`,chip:won?`${g.length}/3`:"X/3",share:`${shareHead("CAMISA")}\n👕 ${num} · ${g.map(x=>fits(x)?"✅":"❌").join("")}`})};
      makeSearch(st.querySelector(".srch"),{placeholder:"De quem é essa camisa?",onPick(p){if(done)return;if(g.some(x=>x.id===p.id)){toast("Você já chutou esse");return}g.push(p);
        if(fits(p)){end(true);return}gl.insertAdjacentHTML("afterbegin",`<div><span class="mini" style="width:26px">${face(p)}</span>${esc(p.name)} não usa a ${num} do ${esc(clubName(ans.club))}</div>`);draw();if(g.length>=3)end(false)}});
      draw();return}
    /* difícil: operações */
    const base=camPool(true),OPS=["+","−","×"],Q=[];let guard=0;
    while(Q.length<5&&guard++<400){const n=Q.length<3?2:3,ps=sample(r,base,n);if(new Set(ps.map(p=>p.id)).size<n)continue;
      const ops=Array.from({length:n-1},()=>n===2?pick(r,["+","−"]):pick(r,OPS));let v=camNum(ps[0]);ps.slice(1).forEach((p,i)=>{const x=camNum(p);v=ops[i]==="+"?v+x:ops[i]==="−"?v-x:v*x});
      if(v<0||v>180)continue;if(Q.some(q=>q.v===v))continue;Q.push({ps,ops,v})}
    memAdd("camisa:ops",Q.flatMap(q=>q.ps.map(p=>p.id)));
    let qi=0,ok=0,done=false;const res=[];
    st.innerHTML=`<div class="cam cam-ops"><div class="cam-step"></div><div class="cam-q"></div><div class="cam-ans"></div></div>`;
    const stepEl=st.querySelector(".cam-step"),qEl=st.querySelector(".cam-q"),aEl=st.querySelector(".cam-ans");
    function showQ(){const q=Q[qi];stepEl.innerHTML=`<small class="fg-kick">Conta ${qi+1} de 5</small><span class="cam-dots">${Q.map((_,i)=>`<i class="${i<res.length?(res[i]?"ok":"no"):i===qi?"cur":""}"></i>`).join("")}</span>`;
      qEl.innerHTML=q.ps.map((p,i)=>`<div class="cam-pl">${face(p)}<b>${esc(p.name)}</b><small>${clubCrest(p.club,"crest")} ${esc(clubName(p.club))}</small><span class="cam-qn">camisa ?</span></div>${i<q.ops.length?`<span class="cam-op">${q.ops[i]}</span>`:""}`).join("")+`<span class="cam-op">=</span>`;
      aEl.innerHTML=`<form class="cam-form"><input type="number" inputmode="numeric" class="cam-in" placeholder="resultado" aria-label="Resultado da conta" autocomplete="off"><button class="btn y" type="submit">Responder</button></form>`;
      const f=aEl.querySelector("form"),inp=aEl.querySelector("input");setTimeout(()=>inp.focus(),30);
      f.addEventListener("submit",e=>{e.preventDefault();if(inp.value==="")return;const v=+inp.value,right=v===q.v;res.push(right);if(right)ok++;
        qEl.innerHTML=q.ps.map((p,i)=>`<div class="cam-pl">${face(p)}<b>${esc(p.name)}</b><small>${clubCrest(p.club,"crest")} ${esc(clubName(p.club))}</small><span class="cam-qn on">camisa ${camNum(p)}</span></div>${i<q.ops.length?`<span class="cam-op">${q.ops[i]}</span>`:""}`).join("")+`<span class="cam-op">=</span><span class="cam-res ${right?"ok":"no"}">${q.v}</span>`;
        aEl.innerHTML=`<p class="${right?"cam-good":"cam-bad"}"><b>${right?"Certo!":"Errou."}</b> ${right?"":`Você respondeu ${v}. `}${q.ps.map(camNum).map((n,i)=>i?`${q.ops[i-1]} ${n}`:n).join(" ")} = ${q.v}.</p><div class="row"><button class="btn y" type="button" data-a="next">${qi<4?"Próxima conta":"Ver resultado"}</button></div>`;
        stepEl.querySelectorAll(".cam-dots i")[qi].className=right?"ok":"no";
        aEl.querySelector("[data-a=next]").addEventListener("click",()=>{qi++;if(qi>=5)end();else showQ()});aEl.querySelector("[data-a=next]").focus()})}
    function end(){done=true;const won=ok>=4;won?hit():miss();stepEl.innerHTML="";qEl.innerHTML="";aEl.innerHTML="";
      finish("camisa",st,{won,score:ok,label:`${ok} de 5 contas certas.`,chip:`${ok}/5`,share:`${shareHead("CAMISA E CONTA")}\n${res.map(x=>x?"🟩":"🟥").join("")}`})}
    if(Q.length<5){failBox(st);return}showQ()
  }).catch(()=>failBox(st))}};

/* 21. RECONSTRUINDO (multiplayer): sorteiam-se dois clubes grandes e os 11 titulares de cada um aparecem no 4-3-3. As posições saem uma a uma, em ordem aleatória.
   Em cada posição há até 5 opções (os dois titulares e os melhores reservas). Cada um escolhe, em segredo, uma opção. Escolheram a mesma: leilão. Quem perde leva o reserva. */
