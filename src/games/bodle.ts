// @ts-nocheck
import {clubName, esc, face, natFlag, natName, norm, toast} from "../core";
import {ST} from "../state";
import {GAMES, dailyPick, finish, hit, isHard, miss, pool, shareHead} from "../engine";

/* 2. BODLE */
export function wordOf(p){let t=p.name.split(/\s+/);if(t.length>1&&/^j[uú]nior$/i.test(t[t.length-1]))t=[t[0]];return norm(t[t.length-1]).replace(/[^a-z]/g,"").toUpperCase()}
GAMES.bodle={hard:"jogadores fora da lista de craques e nenhuma dica.",name:"BODLE",desc:"O Wordle do bode: o sobrenome de um craque.",
rules:"Adivinhe o sobrenome (ou apelido) de um jogador famoso em 6 tentativas. Verde: letra no lugar certo. Amarelo: a letra existe em outra posição. Cinza: não existe. A partir do 3º erro aparece a seleção; no 5º, o último clube.",
start(st,r){
  const bpool=pool().filter(p=>{const w=wordOf(p);return w.length>=4&&w.length<=8});
  const ans=dailyPick("bodle",bpool,r),W=wordOf(ans),N=W.length,rows=[];let cur="",done=false;const keys={};
  st.innerHTML=`<div class="bodle"><div class="hintline"></div><div class="board"></div><div class="kb"></div></div>`;
  const board=st.querySelector(".board"),kb=st.querySelector(".kb"),hint=st.querySelector(".hintline");
  const KR=["QWERTYUIOP","ASDFGHJKL","⏎ZXCVBNM⌫"];
  function score(gs){const res=Array(N).fill("x"),rest={};for(let i=0;i<N;i++){if(gs[i]===W[i])res[i]="g";else rest[W[i]]=(rest[W[i]]||0)+1}
    for(let i=0;i<N;i++){if(res[i]!=="g"&&rest[gs[i]]){res[i]="y";rest[gs[i]]--}}return res}
  function draw(){
    board.innerHTML=Array.from({length:6},(_,ri)=>{const row=rows[ri];const letters=row?row.w:(ri===rows.length?cur:"");
      return`<div class="brow" style="grid-template-columns:repeat(${N},auto)">${Array.from({length:N},(_,i)=>`<div class="bt ${row?row.s[i]:letters[i]?"f":""}">${letters[i]||""}</div>`).join("")}</div>`}).join("");
    kb.innerHTML=KR.map(rw=>`<div class="kr">${[...rw].map(k=>`<button type="button" data-k="${k}" class="${k==="⏎"||k==="⌫"?"wide":""} ${keys[k]||""}" aria-label="${k==="⏎"?"Enviar":k==="⌫"?"Apagar":k}">${k==="⏎"?"ENTER":k}</button>`).join("")}</div>`).join("");
    const fails=rows.length;
    hint.innerHTML=isHard()&&!done?`${N} letras · sem dicas`:`${N} letras${fails>=3||done?` · ${natFlag(ans.nat)} ${esc(natName(ans.nat))}`:""}${fails>=5||done?` · ${esc(clubName(ans.club))}`:""}`;
  }
  function press(k){if(done)return;
    if(k==="⌫"){cur=cur.slice(0,-1)}
    else if(k==="⏎"){if(cur.length<N){const rr=board.children[rows.length];rr.classList.remove("shake");void rr.offsetWidth;rr.classList.add("shake");toast(`Faltam letras: são ${N}`);return}
      const s=score(cur);rows.push({w:cur,s});[...cur].forEach((c,i)=>{const o=keys[c];if(s[i]==="g"||o==="g")keys[c]="g";else if(s[i]==="y"||o==="y")keys[c]="y";else keys[c]="x"});
      const won=cur===W;cur="";
      if(won||rows.length>=6){done=true;won?hit():miss();draw();
        const sq=rows.map(x=>x.s.map(c=>c==="g"?"🟩":c==="y"?"🟨":"⬛").join("")).join("\n");
        const box=document.createElement("div");box.className="row";box.style.justifyContent="center";box.innerHTML=`<div style="width:90px">${face(ans)}</div><div><div class="d" style="font-size:30px">${esc(ans.name)}</div><div class="muted">${natFlag(ans.nat)} ${esc(natName(ans.nat))} · ${esc(clubName(ans.club))}</div></div>`;st.querySelector(".bodle").appendChild(box);
        finish("bodle",st,{won,score:won?rows.length:0,label:won?`${W} em ${rows.length}/6.`:`A palavra era ${W}.`,chip:won?`${rows.length}/6`:"X/6",share:`${shareHead("BODLE")} ${won?rows.length:"X"}/6\n${sq}`});return}}
    else if(/^[A-Z]$/.test(k)&&cur.length<N){cur+=k}
    draw()}
  kb.addEventListener("click",e=>{const b=e.target.closest("button");if(b)press(b.dataset.k)});
  const onKey=e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.tagName==="INPUT")return;const k=e.key==="Enter"?"⏎":e.key==="Backspace"?"⌫":e.key.length===1?norm(e.key).toUpperCase():"";if(k){press(k);e.preventDefault()}};
  document.addEventListener("keydown",onKey);ST.CLEAN=()=>document.removeEventListener("keydown",onKey);
  draw();
}};
