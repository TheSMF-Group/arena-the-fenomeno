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
  /* tabuleiro persistente: as casas não são recriadas, só mudam, pra o giro e o pulso poderem rodar */
  board.innerHTML=Array.from({length:6},()=>`<div class="brow" style="grid-template-columns:repeat(${N},auto)">${Array.from({length:N},()=>`<div class="bt"></div>`).join("")}</div>`).join("");
  const tiles=[...board.children].map(r=>[...r.children]);
  const COL={g:"var(--green-dk)",y:"#b58a00",x:"#2a2a2a"},STEP=280,REVEAL=N*STEP+560;
  let kshown={};
  function paintKb(){kb.innerHTML=KR.map(rw=>`<div class="kr">${[...rw].map(k=>`<button type="button" data-k="${k}" class="${k==="⏎"||k==="⌫"?"wide":""} ${kshown[k]||""}" aria-label="${k==="⏎"?"Enviar":k==="⌫"?"Apagar":k}">${k==="⏎"?"ENTER":k}</button>`).join("")}</div>`).join("")}
  function paint(){
    tiles.forEach((row,ri)=>row.forEach((tl,i)=>{if(tl.dataset.fin)return;const ch=ri===rows.length?(cur[i]||""):"";if(tl.textContent!==ch)tl.textContent=ch;tl.classList.toggle("f",!!ch)}));
    const fails=rows.length;
    hint.innerHTML=isHard()&&!done?`${N} letras · sem dicas`:`${N} letras${fails>=3||done?` · ${natFlag(ans.nat)} ${esc(natName(ans.nat))}`:""}${fails>=5||done?` · ${esc(clubName(ans.club))}`:""}`;
  }
  const draw=()=>{paint()};
  function reveal(ri,s,w){tiles[ri].forEach((tl,i)=>{tl.textContent=w[i];tl.dataset.fin=1;tl.style.setProperty("--d",(i*STEP/1000)+"s");tl.style.setProperty("--c",COL[s[i]]);tl.classList.remove("f");tl.classList.add("rev",s[i])})}
  function press(k){if(done)return;
    if(k==="⌫"){cur=cur.slice(0,-1)}
    else if(k==="⏎"){if(cur.length<N){const rr=board.children[rows.length];rr.classList.remove("shake");void rr.offsetWidth;rr.classList.add("shake");toast(`Faltam letras: são ${N}`);return}
      const s=score(cur),ri=rows.length,w=cur;rows.push({w,s});[...w].forEach((c,i)=>{const o=keys[c];if(s[i]==="g"||o==="g")keys[c]="g";else if(s[i]==="y"||o==="y")keys[c]="y";else keys[c]="x"});
      const won=w===W;cur="";reveal(ri,s,w);
      /* o teclado só colore depois que o giro termina, senão entrega o resultado antes da hora */
      setTimeout(()=>{kshown=Object.assign({},keys);paintKb()},REVEAL-120);
      if(won||rows.length>=6){done=true;won?hit():miss();paint();
        if(won)setTimeout(()=>tiles[ri].forEach((tl,i)=>{tl.style.setProperty("--w",(i*.09)+"s");tl.classList.add("wave")}),REVEAL-80);
        const sq=rows.map(x=>x.s.map(c=>c==="g"?"🟩":c==="y"?"🟨":"⬛").join("")).join("\n");
        setTimeout(()=>finish("bodle",st,{won,score:won?rows.length:0,label:won?`${W} em ${rows.length}/6.`:`A palavra era ${W}.`,chip:won?`${rows.length}/6`:"X/6",share:`${shareHead("BODLE")} ${won?rows.length:"X"}/6\n${sq}`}),REVEAL+(won?500:150));return}
      paint();return}
    else if(/^[A-Z]$/.test(k)&&cur.length<N){cur+=k;paint();const tl=tiles[rows.length][cur.length-1];tl.classList.remove("pop");void tl.offsetWidth;tl.classList.add("pop");return}
    paint()}
  kb.addEventListener("click",e=>{const b=e.target.closest("button");if(b)press(b.dataset.k)});
  const onKey=e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.tagName==="INPUT")return;const k=e.key==="Enter"?"⏎":e.key==="Backspace"?"⌫":e.key.length===1?norm(e.key).toUpperCase():"";if(k){press(k);e.preventDefault()}};
  document.addEventListener("keydown",onKey);ST.CLEAN=()=>document.removeEventListener("keydown",onKey);
  paint();paintKb();
}};
