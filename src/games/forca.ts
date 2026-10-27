// @ts-nocheck
import __A3__ from "../assets/aaeac0c78.png?url";
import __A4__ from "../assets/a756690ff.png?url";
import __A5__ from "../assets/a090a1bdd.png?url";
import __A6__ from "../assets/afd795b60.png?url";
import __A7__ from "../assets/a5b8c0a1c.png?url";
import __A8__ from "../assets/afc4c43b2.png?url";
import {ST} from "../state";
import {clubCrest, clubName, esc, face, natFlag, natName, norm, store, toast, todayKey} from "../core";
import {GAMES, MODE, dailyPick, finish, gameRng, hit, isHard, miss, shareHead} from "../engine";

/* 14. FORCA DO FUTEBOL: jogador ou time letra por letra. Cada erro pendura uma parte do bode */
/* partes recortadas pixel a pixel do bode (300×459): [nome, x, y, largura, altura, imagem]; juntas formam o bode inteiro */
export const FC_PARTS=[["CABEÇA", 56, 0, 135, 123, __A3__],["CORPO", 91, 62, 170, 274, __A4__],["BRAÇO DIREITO", 0, 12, 92, 170, __A5__],["BRAÇO ESQUERDO", 218, 97, 77, 153, __A6__],["PERNA ESQUERDA", 208, 279, 92, 84, __A7__],["PERNA DIREITA", 142, 322, 109, 137, __A8__]];
export const FC_MAX=FC_PARTS.length,FC_EXTRA={"Ø":"O","Ł":"L","Đ":"D","I":"I","Ð":"D"};
/* letra-base de cada caractere: É vira E, Ç vira C; null = não é letra (espaço, hífen, ponto) e já aparece */
export function fcBase(ch){const u=ch.toUpperCase();if(FC_EXTRA[u])return FC_EXTRA[u];const b=u.normalize("NFD").replace(/[̀-ͯ]/g,"");return /^[A-Z]$/.test(b)?b:(/\p{L}/u.test(ch)?"?":null)}
export const fcOk=name=>{const bs=[...name].map(fcBase);const n=bs.filter(b=>b&&b!=="?").length;return!bs.includes("?")&&n>=4&&n<=20};
export function forcaGallows(){return`<svg class="fc-svg" viewBox="0 0 380 560" role="img" aria-label="Forca com o bode">
  <path class="fc-wood" d="M8 548H200M40 548V12M30 12H200M40 64 92 12"/><path class="fc-rope" d="M150 12V60"/>
  <g class="fc-sway"><g transform="translate(27 58)">${FC_PARTS.map(([n,x,y,w,h,u],i)=>`<image class="fc-part" data-i="${i}" href="${u}" x="${x}" y="${y}" width="${w}" height="${h}"/>`).join("")}</g></g></svg>`}
GAMES.forca={name:"FORCA",hard:"jogadores de nicho e qualquer um dos escudos da base, e a única dica só aparece no 3º erro.",
desc:"Jogador ou time, letra por letra, antes do bode ficar inteiro na forca.",
levels:{normal:["Craques e clubes conhecidos. A seleção do jogador (ou o país do time) aparece desde o começo e, a partir do 3º erro, o último clube (ou a liga).","dica desde o começo"],hard:["Jogadores de nicho e qualquer um dos escudos da base, de qualquer liga. Nenhuma dica até o 3º erro.","sem dica no começo"]},
rules:"Escolha se quer adivinhar um jogador ou um time e descubra o nome letra por letra (acentos não contam: o E vale para É e Ê). Cada letra errada pendura uma parte do bode na forca: cabeça, corpo, braço direito, braço esquerdo, perna esquerda e perna direita. Bode inteiro na forca, perdeu.",
start(st,r){
  const HG=isHard(),dk="forcatipo:"+todayKey();
  let tipo=(!MODE.free&&store.get(dk))||store.get("forca:tipo")||"j";
  const lockT=!MODE.free&&!!store.get(dk);
  if(!MODE.free)store.set(dk,tipo);
  const linked=new Set(ST.CLUBS.map(c=>c[1]).filter(Boolean));
  const pool=tipo==="j"?pool0().filter(p=>fcOk(p.name)):(HG?ST.CRESTS.filter(c=>ST.ESC[c.id]):ST.CRESTS.filter(c=>ST.ESC[c.id]&&linked.has(c.id))).filter(c=>fcOk(c.name));
  function pool0(){return HG?ST.HARD:ST.FAM}
  const ans=dailyPick("forca-"+tipo,pool,r),NAME=ans.name,CH=[...NAME].map(ch=>({ch,b:fcBase(ch)}));
  const need=new Set(CH.filter(c=>c.b).map(c=>c.b)),got=new Set(),bad=new Set();let done=false;
  st.innerHTML=`<div class="fc-tipo mode" role="group" aria-label="Adivinhar"><button type="button" data-t="j" aria-pressed="${tipo==="j"}" ${lockT&&tipo!=="j"?"disabled":""}>Jogadores</button><button type="button" data-t="t" aria-pressed="${tipo==="t"}" ${lockT&&tipo!=="t"?"disabled":""}>Times</button></div>
    <div class="fc"><div class="fc-fig">${forcaGallows()}<div class="fc-lost"></div></div>
    <div class="fc-main"><div class="fc-hint"></div><div class="fc-word" aria-live="polite"></div><div class="fc-miss"></div><div class="kb"></div><div class="fc-end"></div></div></div>`;
  const wordEl=st.querySelector(".fc-word"),kb=st.querySelector(".kb"),hintEl=st.querySelector(".fc-hint"),missEl=st.querySelector(".fc-miss"),lostEl=st.querySelector(".fc-lost");
  st.querySelector(".fc-tipo").addEventListener("click",e=>{const b=e.target.closest("button[data-t]");if(!b||b.disabled||b.dataset.t===tipo)return;
    if(!MODE.free&&(got.size||bad.size)){toast("O desafio de hoje já começou nesse modo");return}
    store.set("forca:tipo",b.dataset.t);if(!MODE.free)store.set(dk,b.dataset.t);if(ST.CLEAN){ST.CLEAN();ST.CLEAN=null}GAMES.forca.start(st,MODE.free?r:gameRng("forca"))});
  const KR=["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
  function hints(){const w=bad.size,h=[];
    if(tipo==="j"){const nat=`${natFlag(ans.nat)} ${esc(natName(ans.nat))}`,club=`${clubCrest(ans.club)} ${esc(clubName(ans.club))}`;
      if(HG){if(w>=3||done)h.push(["Seleção",nat]);if(done)h.push(["Último clube",club])}else{h.push(["Seleção",nat]);if(w>=3||done)h.push(["Último clube",club])}}
    else{const pk=ans.pais.replace(/-/g," "),pn=(ST.NATS.find(n=>norm(n[0])===pk)||[pk])[0],pais=esc(pn),liga=esc(ans.liga||"");
      if(HG){if(w>=3||done)h.push(["País",pais]);if(done)h.push(["Liga",liga])}else{h.push(["País",pais]);if(w>=3||done)h.push(["Liga",liga])}}
    return`<span class="fc-kind">${tipo==="j"?"JOGADOR":"TIME"} · ${need.size} letras diferentes</span>${h.map(([k,v])=>`<span><small>${k}</small> <b style="text-transform:${k==="País"?"capitalize":"none"}">${v}</b></span>`).join("")}${!h.length?`<span class="muted">${HG?"a dica aparece no 3º erro":""}</span>`:""}`}
  function draw(fresh){
    wordEl.innerHTML=NAME.split(/(\s+)/).filter(x=>x.length).map(w=>/^\s+$/.test(w)?`<span class="fc-sp"></span>`:`<span class="fc-w">${[...w].map(ch=>{const b=fcBase(ch);if(!b)return`<i class="fc-c sym">${esc(ch)}</i>`;const show=got.has(b)||done;return`<i class="fc-c ${show?"on":""} ${done&&!got.has(b)?"rev":""} ${fresh===b?"pop":""}">${show?esc(ch.toUpperCase()):""}</i>`}).join("")}</span>`).join("");
    kb.innerHTML=KR.map(rw=>`<div class="kr">${[...rw].map(k=>`<button type="button" data-k="${k}" class="${got.has(k)?"g":bad.has(k)?"x":""}" ${done||got.has(k)||bad.has(k)?"disabled":""} aria-label="Letra ${k}">${k}</button>`).join("")}</div>`).join("");
    hintEl.innerHTML=hints();
    missEl.innerHTML=`<span class="fc-life">${Array.from({length:FC_MAX},(_,i)=>`<i class="${i<bad.size?"off":""}"></i>`).join("")}</span> ${bad.size?`Erros: <b>${[...bad].join(" ")}</b> · ${esc(FC_PARTS[bad.size-1][0].toLowerCase())} na forca`:"Nenhum erro ainda"}`;
    st.querySelectorAll(".fc-part").forEach(el=>el.classList.toggle("on",+el.dataset.i<bad.size))}
  function press(k){if(done||got.has(k)||bad.has(k)||!/^[A-Z]$/.test(k))return;
    if(need.has(k)){got.add(k);draw(k);if([...need].every(b=>got.has(b)))end(true)}
    else{bad.add(k);draw();const f=st.querySelector(".fc-fig");f.classList.remove("shake");void f.offsetWidth;f.classList.add("shake");if(bad.size>=FC_MAX)end(false)}}
  function end(won){done=true;won?hit():miss();draw();lostEl.innerHTML=won?"":`<b>ENFORCADO!</b>`;
    /* vitória: as letras fazem a onda; derrota: o bode balança na corda */
    if(won)wordEl.classList.add("won");else st.querySelector(".fc-svg").classList.add("hung");
    st.querySelector(".fc-end").innerHTML=`<div class="fc-reveal">${tipo==="j"?face(ans):`<img class="crest" src="${ST.ESC[ans.id]}" alt="">`}<div><small class="fg-kick">${won?"Acertou":"Era"}</small><b>${esc(NAME)}</b></div></div>`;
    const e=bad.size;
    setTimeout(()=>finish("forca",st,{won,score:won?FC_MAX-e:0,label:won?`${NAME} com ${e} erro${e===1?"":"s"}.`:`Era ${NAME}.`,chip:won?`${e}/${FC_MAX} erros`:"enforcado",share:`${shareHead("FORCA")} · ${tipo==="j"?"jogador":"time"}\n🐐 ${"🟥".repeat(e)}${"⬜".repeat(FC_MAX-e)}${won?" ✅":" ☠"}`}),won?1100:900)}
  kb.addEventListener("click",e=>{const b=e.target.closest("button[data-k]");if(b)press(b.dataset.k)});
  const onKey=e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.target.tagName==="INPUT")return;const k=fcBase(e.key.length===1?e.key:"");if(k&&k!=="?"){press(k);e.preventDefault()}};
  document.addEventListener("keydown",onKey);const prevClean=ST.CLEAN;ST.CLEAN=()=>{document.removeEventListener("keydown",onKey);prevClean&&prevClean()};
  draw();
}};

/* 15. QUESTIONAMENTOS: perguntas de sim ou não sobre um craque secreto, depois até 3 chutes.
   Só entram perguntas que a base responde com certeza (seleção, nascimento, passagens do Transfermarkt) */
