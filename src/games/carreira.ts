// @ts-nocheck
import {ST} from "../state";
import {esc, face, natFlag, natName, sample, toast} from "../core";
import {makeSearch} from "../search";
import {GAMES, dailyPick, finish, hit, isHard, miss, shareHead} from "../engine";
import {entYear, failBox, loadEnt, loadingBox} from "./entrosa";

/* 16. CARREIRA: quatro clubes da carreira, fora de ordem. Adivinhe o jogador */
export const CR_YOUTH=/(\bS\d\d\b|\bU-?\d\d\b|Sub-?\d\d|\bCJ$|Madrileño|Juv\.|Jgd|\sB$|\sII$)/i;
GAMES.carreira={name:"CARREIRA",hard:"jogadores de nicho e nenhuma dica além dos clubes.",
desc:"Os clubes aparecem um por um. Descubra o jogador com o mínimo de clubes.",
levels:{normal:["Craques conhecidos. Os clubes aparecem um por vez e, a partir do 3º, a seleção dele vira dica.","4 clubes · seleção no 3º"],hard:["Jogadores de nicho, de qualquer época. Só os clubes, sem nenhuma outra dica.","4 clubes · sem dicas"]},
rules:"Aparece o primeiro clube por onde o jogador passou: arrisque um nome. Errou (ou pulou), aparece o próximo clube, até o 4º. Os clubes vêm fora da ordem da carreira. Com os 4 na mesa, você tem um último chute. Vale qualquer jogador que tenha passado pelos 4 clubes.",
start(st,r){let alive=true;ST.CLEAN=()=>{alive=false};loadingBox(st,"PUXANDO A FICHA…");
  loadEnt().then(D=>{if(!alive)return;
    const HG=isHard();
    const crestClubs=p=>[...new Set(D.S.get(p.id).map(x=>x[0]))].filter(c=>D.C[c]&&!CR_YOUTH.test(D.C[c])&&D.E[c]&&ST.ESC[D.E[c]]);
    const base=(HG?ST.HARD:ST.FAM).filter(p=>D.S.has(p.id)&&D.K[p.id]&&crestClubs(p).length>=4&&(HG||D.K[p.id][2]-D.K[p.id][1]>=72));
    const ans=dailyPick("carreira",base,r),four=sample(r,crestClubs(ans),4),fourN=four.map(c=>D.C[c].trim());
    const fits=p=>{if(!D.S.has(p.id))return false;const ns=new Set(D.S.get(p.id).map(x=>D.C[x[0]].trim()));return fourN.every(n=>ns.has(n))};
    let shown=1,done=false;const g=[],ev=[];
    st.innerHTML=`<div class="cr"><div class="cr-clubs"></div>
      <div class="cr-side"><div class="qs-myst"><div class="ph"><div class="q">?</div></div><div><small class="fg-kick">Quem passou por esses clubes?</small><b class="cr-name">? ? ?</b><div class="mhint"></div></div></div>
      <div class="srch"></div><div class="row"><button class="btn" type="button" data-a="skip">Mostrar o próximo clube →</button><span class="lives"></span></div><div class="guesses"></div><div class="cr-end"></div></div></div>`;
    const clubsEl=st.querySelector(".cr-clubs"),srch=st.querySelector(".srch"),gl=st.querySelector(".guesses"),skip=st.querySelector("[data-a=skip]");
    function draw(fresh){
      clubsEl.innerHTML=four.map((c,i)=>i<shown||done?`<div class="cr-club ${fresh&&i===shown-1?"new":""}"><img src="${ST.ESC[D.E[c]]}" alt=""><b>${esc(D.C[c].trim())}</b></div>`:`<div class="cr-club lock" aria-label="Clube escondido"><span class="cr-ini">${i+1}</span><b>? ? ?</b></div>`).join("");
      st.querySelector(".qs-myst .ph").innerHTML=done?face(ans):`<div class="q">?</div>`;st.querySelector(".cr-name").textContent=done?ans.name:"? ? ?";
      st.querySelector(".mhint").innerHTML=(!HG&&shown>=3)||done?`${natFlag(ans.nat)} ${esc(natName(ans.nat))}`:`<span class="muted">${HG?"sem dicas no difícil":"a seleção aparece no 3º clube"}</span>`;
      skip.disabled=done||shown>=4;skip.hidden=done;
      st.querySelector(".lives").innerHTML=done?"":shown>=4?"<b class='hardnote'>Último chute!</b>":`${shown} de 4 clubes`}
    function end(won,who){done=true;srch.innerHTML="";won?hit():miss();draw();
      const car=[];D.S.get(ans.id).forEach(([c,a,b])=>{const n=D.C[c].trim();if(CR_YOUTH.test(n))return;const l=car[car.length-1];if(l&&l.n===n)l.b=b;else car.push({n,a,b})});
      st.querySelector(".cr-end").innerHTML=`<div class="qs-car"><small class="fg-kick">Carreira de ${esc(ans.name)}</small><ol class="cr-car">${car.map(x=>`<li class="${fourN.includes(x.n)?"hl":""}"><span>${entYear(x.a)}${entYear(x.b)!==entYear(x.a)?"–"+entYear(x.b):""}</span>${esc(x.n)}</li>`).join("")}</ol>${who&&who.id!==ans.id?`<p class="muted">Você cravou ${esc(who.name)}, que também passou pelos 4: vale!</p>`:""}</div>`;
      const sq=ev.map(x=>x==="ok"?"🟩":x==="skip"?"⬜":"🟥").join("");
      finish("carreira",st,{won,score:won?shown:0,label:won?`Era ${ans.name}. Acertou com ${shown} de 4 clubes na mesa.`:`Era ${ans.name}.`,chip:won?`${shown}/4`:"X/4",share:`${shareHead("CARREIRA")}\n${sq}`})}
    skip.addEventListener("click",()=>{if(done||shown>=4)return;ev.push("skip");shown++;draw(true)});
    makeSearch(srch,{onPick(p){if(done||g.some(x=>x.id===p.id)){if(!done)toast("Você já chutou esse");return}g.push(p);
      if(p.id===ans.id||fits(p)){ev.push("ok");end(true,p);return}
      ev.push("x");gl.insertAdjacentHTML("afterbegin",`<div><span class="mini" style="width:26px">${face(p)}</span>${esc(p.name)} não é</div>`);
      if(shown>=4)end(false);else{shown++;draw(true)}}});
    draw(true);
  }).catch(()=>failBox(st));
}};
