// @ts-nocheck
import {ST} from "../state";
import {esc, face, fmtDate, natFlag, natName, norm, toast} from "../core";
import {makeSearch} from "../search";
import {GAMES, dailyPick, finish, hit, isHard, miss, shareHead} from "../engine";
import {CR_YOUTH} from "./carreira";
import {failBox, loadEnt, loadingBox} from "./entrosa";
import {DRPOS, TM_POS, loadPos} from "./draft-core";
export const QS_CONT={"Europa":"DE IT FR ES GB-ENG GB-WLS GB-SCT GB-NIR NL PT TR BE DK HR RS PL RU SE CZ SK BA CH NO GR UA BG AT SI ME IE FI RO GE HU AL IL LU AM CY XK IS MK BY LT LV EE AZ MD KZ MT".split(" "),
  "América do Sul":"BR AR UY CO PY CL EC PE VE BO".split(" "),"Américas do Norte e Central":"US MX CA CR HN JM PA SV GT TT HT CW".split(" "),
  "África":"CI NG GH DZ MA SN CM ML AO SL LR TG GA EG CD GN TN ZA BF BJ CV ZM ZW GW GM CG MZ KE".split(" "),"Ásia e Oceania":"JP KR QA CN IR AU SA AE IQ UZ NZ".split(" ")};
export const qsCont=iso=>Object.keys(QS_CONT).find(k=>QS_CONT[k].includes(iso))||null;
export const QS_POS=[["gol","GOL","goleiro",[1]],["zag","ZAG","zagueiro",[2,3]],["ld","LD","lateral-direito",[5]],["le","LE","lateral-esquerdo",[4]],["mc","MC","meio-campo",[7,8,9]],["vol","VOL","volante",[6]],["mei","MEI","meia-atacante",[10]],["pd","PD","ponta-direita",[12]],["pe","PE","ponta-esquerda",[11]],["ata","ATA","atacante",[13,14]]];
export const QS_YEARS=[1955,1960,1965,1970,1975,1980,1985,1990,1995,2000,2005];
GAMES.questoes={name:"QUESTIONAMENTOS",hard:"jogadores de nicho, só 8 perguntas e 3 chutes.",
desc:"Faça perguntas de sim ou não e crave o craque secreto em 3 chutes.",
levels:{normal:["Um craque conhecido. Você tem 10 perguntas de sim ou não e 3 chutes.","10 perguntas · 3 chutes"],hard:["Um jogador de nicho, de qualquer época. Só 8 perguntas e 3 chutes.","8 perguntas · 3 chutes"]},
rules:"Tem um craque secreto e quem investiga é você. Escolha as perguntas do cardápio (seleção, continente, ano de nascimento, clubes por onde passou, time atual, posições e carreira) e cada uma volta com SIM ou NÃO. Resposta que já dá para deduzir das anteriores entra de graça no caderninho. Perguntar não gasta chute e chutar não gasta pergunta. Acertou o nome ou gastou os 3 chutes, acabou.",
start(st,r){let alive=true;ST.CLEAN=()=>{alive=false};loadingBox(st,"ESCONDENDO O CRAQUE…");
  Promise.all([loadEnt(),loadPos()]).then(([D])=>{if(!alive)return;
    const HG=isHard(),MAXQ=HG?8:10,MAXG=3;
    const base=(HG?ST.HARD:ST.FAM).filter(p=>D.S.has(p.id)&&D.K[p.id]&&p.birth&&(HG||D.K[p.id][2]-D.K[p.id][1]>=72)&&DRPOS&&DRPOS[p.id]&&DRPOS[p.id].length>1);
    const ans=dailyPick("questoes",base,r),A={iso:ST.NATS[ans.nat][1],clubs:new Set(D.S.get(ans.id).map(x=>x[0])),K:D.K[ans.id]};
    /* perguntas do cardápio: chave, texto e resposta */
    const natsIn=[...new Set(base.map(p=>p.nat))].filter(n=>ST.NATS[n][1]).sort((a,b)=>base.filter(p=>p.nat===b).length-base.filter(p=>p.nat===a).length);
    /* clubes pelo nome que aparece no Transfermarkt; quantos craques do nível passaram por cada um */
    const cnt={};base.forEach(p=>new Set(D.S.get(p.id).map(x=>D.C[x[0]])).forEach(n=>{cnt[n]=(cnt[n]||0)+1}));
    const ansClubs=new Set([...A.clubs].map(c=>D.C[c]));
    const clubsIn=Object.keys(cnt).filter(n=>cnt[n]>=2&&n!=="?").sort((a,b)=>cnt[b]-cnt[a]);
    /* time atual (ou o último clube, para aposentados): a passagem que termina mais tarde, sem base/juvenil */
    const curOf=p=>{const s=D.S.get(p.id).filter(x=>D.C[x[0]]&&D.C[x[0]]!=="?"&&!CR_YOUTH.test(D.C[x[0]]));let b=null;for(const x of s)if(!b||x[2]>=b[2])b=x;return b?D.C[b[0]]:null};
    const ccnt={};base.forEach(p=>{const n=curOf(p);if(n)ccnt[n]=(ccnt[n]||0)+1});
    const curIn=Object.keys(ccnt).filter(n=>ccnt[n]>=2).sort((a,b)=>ccnt[b]-ccnt[a]);
    const ansCur=curOf(ans),ansMain=DRPOS[ans.id].slice(1).filter(i=>TM_POS[i])[0];
    const Q=new Map();
    natsIn.forEach(n=>Q.set("n"+n,{g:"pais",txt:`Seleção: ${natName(n)}`,btn:`${natFlag(n)} ${esc(natName(n))}`,yes:ans.nat===n}));
    Object.keys(QS_CONT).forEach(c=>Q.set("c"+c,{g:"cont",txt:`Continente: ${c}`,btn:esc(c),yes:qsCont(A.iso)===c}));
    QS_YEARS.forEach(y=>Q.set("b"+y,{g:"nasc",txt:`Nasceu em ${y} ou depois`,btn:`${y} ou depois`,yes:ans.birth>=y*10000+101}));
    clubsIn.forEach(n=>Q.set("k"+n,{g:"club",txt:`Passou por: ${n}`,btn:esc(n),yes:ansClubs.has(n)}));
    curIn.forEach(n=>Q.set("t"+n,{g:"atual",txt:`Time atual: ${n}`,btn:esc(n),yes:ansCur===n}));
    QS_POS.forEach(([k,sg,n,ids])=>Q.set("pp"+k,{g:"pos",txt:`Posição: ${n}`,btn:`${sg} · ${esc(n)}`,yes:ids.includes(ansMain)}));
    [["ativa","Jogou a temporada 2025/26",ans.season>=2026],["c6","6 clubes ou mais na carreira",A.K[0]>=6],["c10","10 clubes ou mais na carreira",A.K[0]>=10],["l15","Carreira profissional de 15 anos ou mais",A.K[2]-A.K[1]>=180]]
      .forEach(([k,t,y])=>Q.set("o"+k,{g:"outras",txt:t,btn:esc(t),yes:y}));
    const asked=[],ans2=new Map();let used=0,guesses=[],done=false,tab="pais",filter="";
    /* dedução: marca de graça tudo o que as respostas já garantem */
    function deduce(){let ch=true;while(ch){ch=false;const set=(k,v)=>{if(Q.has(k)&&!ans2.has(k)){ans2.set(k,{yes:v,auto:true});ch=true}};
      for(const [k,a] of [...ans2]){
        if(k[0]==="n"&&a.yes){const iso=ST.NATS[+k.slice(1)][1];natsIn.forEach(n=>set("n"+n,false));Object.keys(QS_CONT).forEach(c=>set("c"+c,qsCont(iso)===c))}
        if(k[0]==="c"&&a.yes){const c=k.slice(1);Object.keys(QS_CONT).forEach(x=>x!==c&&set("c"+x,false));natsIn.forEach(n=>{if(qsCont(ST.NATS[n][1])!==c)set("n"+n,false)})}
        if(k[0]==="c"&&!a.yes){const c=k.slice(1);natsIn.forEach(n=>{if(qsCont(ST.NATS[n][1])===c)set("n"+n,false)})}
        if(k[0]==="b"){const y=+k.slice(1);QS_YEARS.forEach(z=>{if(a.yes&&z<y)set("b"+z,true);if(!a.yes&&z>y)set("b"+z,false)})}
        if(k[0]==="p"&&a.yes)QS_POS.forEach(x=>set("pp"+x[0],false));
        if(k[0]==="t"&&a.yes)curIn.forEach(n=>set("t"+n,false));
        if(k==="oc10"&&a.yes)set("oc6",true);if(k==="oc6"&&!a.yes)set("oc10",false)}}}
    st.innerHTML=`<div class="qs"><div class="qs-side"><div class="qs-myst"><div class="ph"><div class="q">?</div></div><div><small class="fg-kick">Craque secreto</small><b class="qs-name">? ? ?</b></div></div>
      <div class="qs-cnt"><span><small>Perguntas</small><b class="qn"></b></span><span><small>Chutes</small><b class="gn"></b></span></div>
      <div class="qs-guess"><div class="srch"></div><div class="guesses"></div></div>
      <div class="qs-note"><small class="fg-kick">Caderninho</small><ol class="qs-list"></ol></div></div>
      <div class="qs-menu"><div class="qs-tabs" role="tablist"></div><input class="qs-filter" type="text" placeholder="Filtrar…" aria-label="Filtrar perguntas" hidden><div class="qs-opts"></div><div class="qs-end"></div></div></div>`;
    const TABS=[["pais","Seleção"],["cont","Continente"],["nasc","Nascimento"],["club","Clubes que passou"],["atual","Time atual"],["pos","Posições"],["outras","Carreira"]];
    const opts=st.querySelector(".qs-opts"),fil=st.querySelector(".qs-filter"),list=st.querySelector(".qs-list"),srch=st.querySelector(".srch"),gl=st.querySelector(".guesses");
    function draw(){
      st.querySelector(".qn").textContent=`${MAXQ-used}/${MAXQ}`;st.querySelector(".gn").textContent=`${MAXG-guesses.length}/${MAXG}`;
      st.querySelector(".qs-tabs").innerHTML=TABS.map(([k,t])=>`<button type="button" role="tab" data-tab="${k}" aria-selected="${tab===k}">${t}</button>`).join("");
      fil.hidden=!(tab==="club"||tab==="pais"||tab==="atual");
      const items=[...Q].filter(([k,q])=>q.g===tab&&(!filter||!(tab==="club"||tab==="pais"||tab==="atual")||norm(q.txt).includes(norm(filter))));
      const shown=(tab==="club"||tab==="atual")&&!filter?items.slice(0,40):items;
      opts.innerHTML=(shown.map(([k,q])=>{const a=ans2.get(k);return`<button type="button" class="qs-op ${a?(a.yes?"yes":"no"):""}" data-k="${esc(k)}" ${a||done||used>=MAXQ?"disabled":""}>${q.btn}${a?`<em>${a.yes?"SIM":"NÃO"}</em>`:""}</button>`}).join("")||`<p class="muted">Nada com esse nome.</p>`)+((tab==="club"||tab==="atual")&&!filter?`<p class="muted qs-tip">Mostrando os 40 clubes mais comuns. Digite para achar qualquer outro.</p>`:"");
      list.innerHTML=asked.map(([k,free])=>{const q=Q.get(k),a=ans2.get(k);return`<li class="${a.yes?"yes":"no"}"><span>${esc(q.txt)}${free?`<small>+${free} de graça no cardápio</small>`:""}</span><em>${a.yes?"SIM":"NÃO"}</em></li>`}).reverse().join("")||`<li class="muted">Faça a primeira pergunta.</li>`;
      st.querySelector(".qs-myst .ph").innerHTML=done?face(ans):`<div class="q">?</div>`;st.querySelector(".qs-name").textContent=done?ans.name:"? ? ?"}
    st.querySelector(".qs-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(!b)return;tab=b.dataset.tab;filter="";fil.value="";draw()});
    fil.addEventListener("input",()=>{filter=fil.value;draw()});
    opts.addEventListener("click",e=>{const b=e.target.closest(".qs-op");if(!b||b.disabled||done)return;if(used>=MAXQ){toast("Acabaram as perguntas: agora é chutar");return}
      const k=b.dataset.k,q=Q.get(k);used++;ans2.set(k,{yes:q.yes,auto:false});const before=ans2.size;deduce();asked.push([k,ans2.size-before]);draw();
      toast(`${q.txt}? ${q.yes?"SIM":"NÃO"}`);if(used>=MAXQ)toast("Acabaram as perguntas: hora de chutar")});
    function end(won){done=true;srch.innerHTML="";won?hit():miss();draw();
      const car=D.S.get(ans.id).map(x=>D.C[x[0]]).filter((v,i,a)=>a.indexOf(v)===i);
      st.querySelector(".qs-end").innerHTML=`<div class="qs-car"><small class="fg-kick">Carreira de ${esc(ans.name)}</small><p>${natFlag(ans.nat)} ${esc(natName(ans.nat))} · nascido em ${fmtDate(ans.birth)}</p><p>${car.map(esc).join(" → ")}</p></div>`;
      const sq=asked.map(([k])=>ans2.get(k).yes?"🟩":"⬛").join("")+" "+guesses.map(g=>g.id===ans.id?"✅":"❌").join("");
      finish("questoes",st,{won,score:won?1:0,label:won?`Era ${ans.name}. ${used} pergunta${used===1?"":"s"} e ${guesses.length} chute${guesses.length===1?"":"s"}.`:`Era ${ans.name}.`,chip:won?`${used}P · ${guesses.length}C`:"errou",share:`${shareHead("QUESTIONAMENTOS")}\n${sq}`})}
    makeSearch(srch,{placeholder:"Chute o nome do craque…",onPick(p){if(done)return;if(guesses.some(g=>g.id===p.id)){toast("Você já chutou esse");return}
      guesses.push(p);if(p.id===ans.id){end(true);return}
      gl.insertAdjacentHTML("afterbegin",`<div><span class="mini" style="width:26px">${face(p)}</span>${esc(p.name)} não é o craque</div>`);draw();if(guesses.length>=MAXG)end(false)}});
    draw();
  }).catch(()=>failBox(st));
}};
