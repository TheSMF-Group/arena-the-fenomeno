// @ts-nocheck
import {$, toast} from "../core";
import {route} from "../nav";
import {GAMES} from "../engine";
import {VL_TROF} from "./velha";
import {drPlay} from "./draft-play";
import {pfLocal, pfMount} from "../profile";
import {ST} from "../state";
import {cleanup, home} from "../home";
GAMES.draft={name:"DRAFT",multi:true,desc:"Monte um 4-3-3 com o sorteio da vez e vença o amigo numa partida simulada.",
rules:"Escolha a liga (Brasileirão ou Europa). Na sua vez, o bode sorteia um clube e uma seleção, só um clube ou só uma seleção: escolha um jogador que bata com o sorteio (vale qualquer passagem pelo clube, aposentados também) e coloque numa posição vazia do seu 4-3-3. Depois é a vez do amigo, com outro sorteio, e cada um só vê o próprio time. Cada jogador só entra nas posições em que joga ou já jogou (Transfermarkt): centroavante não vira zagueiro. Com os dois times completos, os dois se enfrentam numa partida simulada, que leva em conta a força de cada setor. Empatou, vai para os pênaltis.",
open(){ST.VIEW="draft";ST.PHASE="choose";cleanup();route("draft");
  const app=$("#app");let cfg={diff:"normal",lg:"eu"};
  app.innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2><b>DRAFT</b></h2><span class="lvbadge normal">MULTIPLAYER</span></div>
    <p class="rules">${this.rules}</p>
    <div class="vl-lobby">
      <section class="vl-box"><h3 class="d">CRIAR JOGO</h3>
        <div class="vl-opt"><small>Nível</small><div class="vl-seg" data-k="diff"><button type="button" data-v="normal">Normal</button><button type="button" data-v="hard">Difícil ☠</button></div>
          <p class="muted vl-help" data-h="diff"></p></div>
        <div class="vl-opt"><small>Liga</small><div class="vl-seg vl-lg" data-k="lg"><button type="button" data-v="br"><img class="vl-tr" src="${VL_TROF.br}" alt=""><span>Brasileirão</span></button><button type="button" data-v="eu"><img class="vl-tr" src="${VL_TROF.ucl}" alt=""><span>Europa</span></button></div>
          <p class="muted vl-help" data-h="lg"></p></div>
        <button class="btn y vl-go" type="button" data-a="create">Criar partida</button>
        <button class="btn vl-go" type="button" data-a="local">Jogar no mesmo aparelho</button></section>
      <section class="vl-box"><h3 class="d">ENTRAR EM JOGO</h3>
        <label class="vl-opt"><small>Código da partida</small><input class="vl-code" maxlength="5" autocomplete="off" spellcheck="false" placeholder="EX: BODE7" aria-label="Código da partida"></label>
        <button class="btn g vl-go" type="button" data-a="join">Entrar</button>
        <p class="muted vl-help">Peça o código para quem criou a partida. Os dois precisam estar com esta página aberta${window.claude?" e logados no claude.ai":""}.</p></section></div>`;
  const help={diff:{normal:"Clubes grandes e seleções com craques conhecidos, 60 segundos por escolha.",hard:"Entram também clubes menores e qualquer seleção, 40 segundos por escolha."},
    lg:{br:"Só clubes do Brasileirão.",eu:"Clubes das cinco grandes ligas (Inglaterra, Espanha, Itália, Alemanha e França) e da Champions."}};
  const paint=()=>{app.querySelectorAll(".vl-seg").forEach(sg=>sg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===cfg[sg.dataset.k]))));app.querySelector('[data-h=diff]').textContent=help.diff[cfg.diff];app.querySelector('[data-h=lg]').textContent=help.lg[cfg.lg]};
  app.querySelectorAll(".vl-seg").forEach(sg=>sg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;cfg[sg.dataset.k]=b.dataset.v;paint()}));
  app.querySelector(".back").addEventListener("click",home);
  const inp=app.querySelector(".vl-code");inp.addEventListener("input",()=>{inp.value=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,"")});
  inp.addEventListener("keydown",e=>{if(e.key==="Enter")app.querySelector("[data-a=join]").click()});
  app.querySelector(".vl-lobby").addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;
    if(a==="create")drPlay({mode:"host",cfg:{...cfg}});
    if(a==="local")pfLocal(pfs=>drPlay({mode:"local",cfg:{...cfg},pfs}));
    if(a==="join"){const c=inp.value.trim();if(c.length!==5){toast("O código tem 5 letras/números");inp.focus();return}drPlay({mode:"join",code:c})}});
  paint();pfMount(app);window.scrollTo(0,0)}};
