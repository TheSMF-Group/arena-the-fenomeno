// @ts-nocheck
/* ilustrações dos 22 jogos (geradas no Figma), uma por id: src/assets/thumbs/<id>.webp */
const THUMBS=Object.fromEntries(Object.entries(import.meta.glob("./assets/thumbs/*.webp",{eager:true,query:"?url",import:"default"})).map(([k,v])=>[k.split("/").pop().replace(".webp",""),v]));
import dMm from "./assets/dest-maisoumenos.webp?url";
import dMan from "./assets/dest-manager.webp?url";
import dFen from "./assets/dest-fenomeno.webp?url";
import d100 from "./assets/dest-100pracada.webp?url";
import dRec from "./assets/dest-reconstruindo.webp?url";
import dCon from "./assets/dest-conecte.webp?url";
import {$, BODE, BODEHEAD, dayNum, esc, store, toast, todayKey} from "./core";
import {GAMES, KIND, MODE, clockStop, dayLevel, dayLockKey, dayResult, drawFire, fireHTML, fmtDur, gameRng, isHard, loadStreak, resultKey, share, verdict} from "./engine";
import {ST} from "./state";
import {art} from "./art";
import {hasUser, pfGet, userGate, whoLine, withWho} from "./profile";
import {lobbysSecao} from "./lobbys";

/* ---------- telas ---------- */
export const NEW=["draft","leilao","maleta","reconstruindo","camisa","carreira","questoes","forca","velha","entrosa","piramide","top10","top100"];
export const ORDER=["draft","leilao","maleta","reconstruindo","camisa","carreira","questoes","forca","velha","entrosa","piramide","top10","top100","futgeo","quem","grade","conexoes","bodle","impostor","escudo","bingo","velho"];
/* os jogos do ecossistema The Fenômeno, que vivem fora da Arena: faixa "Os mais jogados" */
export const OUTROS=[
  {n:"MAIS OU MENOS",i:dMm,d:"Qual é maior? Idade do clube contra valor de transferência e mais. Acerte em sequência.",u:"https://maisoumenos.thefenomeno.com"},
  {n:"THE MANAGER",i:dMan,d:"Assuma um clube e comande a carreira temporada por temporada. Beta por convite.",u:"https://manager.thefenomeno.com"},
  {n:"THE FENOMENO",i:dFen,d:"A carreira de jogador. Roube dos craques, viva a carreira e veja onde você fica entre os maiores.",u:"https://www.thefenomeno.com"},
  {n:"100 PRA CADA",i:d100,d:"Leilão de craques com os amigos. Cada um tem 100: gaste e monte o melhor time para vencer.",u:"https://100pracada.thefenomeno.com"},
  {n:"RECONSTRUINDO",i:dRec,d:"Monte o XI ideal do seu time do coração para 2027 e veja se ele aguenta a temporada que vem.",u:"https://reconstruindo.thefenomeno.com"},
  {n:"CONECTE",i:dCon,d:"Ligue dois craques pelos clubes que os dois vestiram. Um confronto novo todo dia.",u:"https://conecte.thefenomeno.com"}];
/* uma linha por card: o que se faz no jogo, para entender antes de clicar */
const SHORT={camisa:"Adivinhe o dono da camisa",carreira:"Descubra o jogador pelos clubes",questoes:"Sim ou não até achar o craque",forca:"Letra por letra, salve o bode",entrosa:"Quem jogou com esses cinco?",piramide:"Monte o ranking do 1º ao 10º",top10:"Complete o Top 10",top100:"Chute fundo no Top 100",futgeo:"Onde foi? Clique no mapa",quem:"A foto clareia. Quem é?",grade:"Seleção × clube na grade 3×3",conexoes:"16 craques, 4 grupos",bodle:"O Wordle do bode",impostor:"Ache o intruso",escudo:"Qual clube é esse escudo?",bingo:"Encaixe o craque na cartela",velho:"Quem nasceu primeiro?",draft:"Monte o 4-3-3 e vença o amigo",leilao:"Dê lance pelos craques",maleta:"Escolha a maleta, arrisque",reconstruindo:"Mantenha ou troque o titular",velha:"Jogo da velha com craques"};
export const DIFFS=["normal","hard"],DNAME={normal:"NORMAL",hard:"DIFÍCIL"};
export const DAILY=()=>ORDER.filter(id=>!GAMES[id].multi&&!GAMES[id].freeOnly);
export const allDone=()=>DAILY().every(id=>dayResult(id));
/* placar do dia no topo: desafios do dia ganhos e perdidos (nos de pontos, só a pontuação máxima conta como ganho) */
export function updateToday(){const OD=DAILY(),R=OD.map(id=>dayResult(id)).filter(Boolean),w=R.filter(x=>x.res.won).length,l=R.length-w;
  const el=$("#todayScore");el.innerHTML=`<b class="tw">${w}</b> ${w===1?"ganha":"ganhas"} · <b class="tl">${l}</b> ${l===1?"perdida":"perdidas"}`;
  $("#todayPill").title=`Desafios do dia: ${R.length} de ${OD.length} jogados`;document.dispatchEvent(new CustomEvent("fen:today"))}
export function countdown(){const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.floor((m-n)/1000);return[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,"0")).join(":")}
export const bestOf=(id,d)=>(store.get("streak:"+id+":"+d)||{best:0}).best;

/* virada do dia: à meia-noite (ou ao voltar para a aba) tudo recomeça com os desafios novos */
export function checkDay(){if(todayKey()===ST.PLAYDAY)return;ST.PLAYDAY=todayKey();toast("Novo dia! Desafios renovados");if(GAMES[ST.VIEW]&&GAMES[ST.VIEW].multi)return;
  if(ST.VIEW==="home")home();else if(MODE.free)updateToday();else if(ST.PHASE==="play")startGame(ST.VIEW);else openGame(ST.VIEW)}
setInterval(()=>{const c=$("#cd");if(c){c.textContent=countdown();c.classList.remove("tk");void c.offsetWidth;c.classList.add("tk")}checkDay()},1000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)checkDay()});
export function modeToggle(prefix){const M=prefix&&MODE.multi;return`<div class="mode" role="group" aria-label="Modo de jogo"><button type="button" data-m="d" aria-pressed="${!MODE.free&&!M}">${prefix?"Desafio do dia":"Dia"}</button><button type="button" data-m="f" aria-pressed="${MODE.free&&!M}">${prefix?"Modo infinito":"Infinito"}</button>${prefix?`<button type="button" data-m="m" aria-pressed="${M}">Multiplayer</button>`:""}</div>`}
export function stampFor(id,d,res){const v=verdict(id,res);
  return`<div class="stamp ${v.cls}"><span class="sv">${esc(v.cls==="score"?v.word:v.word==="GANHOU"?"VENCEU":v.word)}</span><span class="sl">${d==="hard"?"DIFÍCIL":"NORMAL"}</span></div>`}
export function cleanup(){document.body.classList.remove("home-view");clockStop();if(ST.CLEAN){ST.CLEAN();ST.CLEAN=null}document.querySelectorAll(".modal").forEach(m=>m.remove())}
/* ---------- mensagens do topo da home ----------
   Escolhe uma frase conforme a hora, o nome (quem tem conta), quanto falta, vitórias e a sequência de dias.
   A escolha muda a cada dia e a cada jogo concluído, mas não pisca quando a home é redesenhada. */
const pick=(arr,seed)=>arr[Math.abs(seed)%arr.length];
export function heroMsg(s){
  const h=new Date().getHours(),u=hasUser()?pfGet().n:"",N=u?`, <em>${esc(u)}</em>`:"",n=u?`, ${esc(u)}`:"",U=u?esc(u):"craque";
  const sau=h<5?"Boa madrugada":h<12?"Bom dia":h<18?"Boa tarde":"Boa noite";
  const hrsLeft=24-h,seed=dayNum()*7+s.done,wd=new Date().getDay(),fds=wd===0||wd===6;
  const T=s.total,L=s.left,W=s.wins,P=s.losses,S=s.streak,D=s.done;
  const jogos=x=>x===1?"1 jogo":`${x} jogos`,vit=x=>x===1?"1 vitória":`${x} vitórias`,dias=x=>x===1?"1 dia":`${x} dias`,hrs=hrsLeft===1?"1 hora":`${hrsLeft} horas`;
  const conta=u?"":" Crie seu usuário e guarde suas camisas no vestiário.";
  const turno=h<5?"Insônia boa é a que vira desafio.":h<12?"Café na mão e bola no pé.":h<18?"Aquele intervalo perfeito para um jogo.":"Fim de dia é hora de mostrar que entende de bola.";
  /* dia completo */
  if(!L)return pick(W===T?[
      [`Perfeito${N}.<br>${T} de ${T}.`,`Você ganhou todos os desafios de hoje. Isso é coisa de Fenômeno.${conta}`],
      [`Gabaritou${N}.`,`${vit(T)} em ${T}. Amanhã tem mais, à meia-noite.`],
      [`Que <em>temporada</em>${n}.`,`${T} de ${T} num dia só. Dá para emoldurar.`],
      [`Bola de <em>ouro</em> do dia${n}.`,`Todos os desafios, todas as vitórias. Volte à meia-noite e defenda o título.`],
      [`Invicto${N}.`,`${T} jogos, ${T} vitórias. Conta para os amigos e vê se alguém iguala.`],
      [`Aula${N}.`,`Hoje você não errou uma. Amanhã a régua sobe.`],
      [`Campeão <em>invicto</em>${n}.`,`Nenhuma derrota hoje. O bode está orgulhoso.`]]
    :[[`Dia <em>completo</em>${n}.`,`${vit(W)} hoje. Volte à meia-noite para os desafios novos.${conta}`],
      [`Missão cumprida${N}.`,`Você fechou os ${T} desafios. A sequência agora é de ${dias(S)}.`],
      [`Fechou o dia${N}.`,`Resultado: ${vit(W)}, ${P} ${P===1?"derrota":"derrotas"}. Amanhã é revanche.`],
      [`Apito <em>final</em>${n}.`,`${W} a ${P} no placar de hoje. Nova rodada à meia-noite.`],
      [`Jogo encerrado${N}.`,`Você jogou todos. Veja o resumo do dia e compare com os amigos.`],
      [`Todos jogados${N}.`,`${vit(W)} em ${T}. Amanhã dá para bater esse número.`],
      [`Dever de casa <em>feito</em>${n}.`,`${dias(S)} de sequência. Não quebra amanhã, hein.`],
      [`Até <em>amanhã</em>${n}.`,`Os ${T} de hoje já foram. À meia-noite chega rodada nova.`]],seed);
  /* nada jogado ainda */
  if(!s.playedToday){
    if(S>=2)return pick([
      [`${sau}${N}.<br>Não perca a <em>sequência</em>.`,`São ${dias(S)} seguidos. Jogue pelo menos um desafio hoje para não zerar.`],
      [`${dias(S)} seguidos${N}.`,`Hoje é o dia ${S+1}? Faltam ${jogos(L)} para fechar o dia.`],
      [`A <em>sequência</em> está em jogo${n}.`,`${dias(S)} sem falhar. Um jogo hoje e ela continua viva.`],
      [`${sau}${N}.<br>Vai deixar a chama <em>apagar</em>?`,`Sua sequência é de ${dias(S)}. Basta um desafio para manter.`],
      [`Dia ${S+1}${N}?`,`Você vem jogando há ${dias(S)} seguidos. Não para agora.`],
      [`${sau}${N}.<br>Bora pro dia <em>${S+1}</em>.`,`Cada dia jogado aumenta a chama. Faltam ${jogos(L)} hoje.`]],seed);
    if(h>=21)return pick([
      [`${sau}${N}.<br>Ainda dá <em>tempo</em>.`,`Os desafios de hoje somem em ${hrs}. Faltam ${jogos(L)}.`],
      [`Corre${N}!`,`Faltam ${jogos(L)} e o dia acaba à meia-noite.`],
      [`Acréscimos${N}.`,`O juiz já olhou o relógio: ${hrs} para jogar os ${T} de hoje.`],
      [`Últimos <em>minutos</em>${n}.`,`À meia-noite os desafios de hoje vão embora. Dá tempo de alguns.`],
      [`${sau}${N}.<br>Um antes de <em>dormir</em>?`,`Leva dois minutos. Os ${T} de hoje acabam à meia-noite.`]],seed);
    return pick([
      [`${sau}${N}.<br>Faltam <em>${L}</em> jogos. Vamos?`,`Todo mundo joga o mesmo desafio hoje. Quanto você acerta?${conta}`],
      [`${sau}${N}.<br>Seus ${T} desafios estão <em>esperando</em>.`,`Começa pelo primeiro: um clique e você já está jogando.${conta}`],
      [`${sau}${N}.<br>Bora <em>aquecer</em>?`,`${T} desafios novos hoje. ${fds?"Fim de semana é dia de gabaritar.":"Comece pelo mais fácil e pegue ritmo."}`],
      [`${sau}${N}.<br>Hoje é dia de <em>Fenômeno</em>.`,`${T} jogos novos, um placar só. Mostre que entende de bola.${conta}`],
      [`${sau}${N}.<br>A bola está <em>rolando</em>.`,`${turno} ${T} desafios novos te esperando.`],
      [`${sau}${N}.<br>Rodada <em>nova</em> no ar.`,`Os ${T} desafios de hoje acabaram de sair. Seja dos primeiros.${conta}`],
      [`${sau}${N}.<br>Entra em <em>campo</em>?`,`${T} jogos, ${T} chances de ganhar. O primeiro está logo abaixo.`],
      [`${sau}${N}.<br>Quem sabe, <em>sabe</em>.`,`Prove hoje: ${T} desafios de futebol, um placar no fim do dia.`],
      [`${sau}${N}.<br>Hoje tem <em>clássico</em>.`,`Você contra os ${T} desafios do dia. ${turno}`],
      [`${sau}${N}.<br>O bode te <em>desafia</em>.`,`${T} jogos novos. Aposto que você não fecha todos.${conta}`],
      [`${sau}${N}.<br>Pronto pro <em>apito</em>?`,`Os ${T} desafios estão liberados até a meia-noite.`],
      [`${sau}${N}.<br>Vamos de <em>${T}</em>?`,`${fds?"Fim de semana é dia de futebol o dia inteiro.":turno} Começa agora.`],
      [`Olha quem <em>chegou</em>${n}.`,`${T} desafios novos hoje. O primeiro leva dois minutos.`],
      [`${sau}${N}.<br>Dia de <em>gabaritar</em>.`,`${T} desafios, nenhum repetido. Todo mundo jogando os mesmos.`]],seed);}
  /* jogando */
  if(L===1)return pick([
    [`Falta <em>só um</em>${n}.`,`Um jogo e o dia está fechado. Não vai deixar para amanhã, vai?`],
    [`Último jogo${N}.`,`Você fez ${D} de ${T}. Feche com chave de ouro.`],
    [`Pênalti decisivo${N}.`,`Só falta um desafio. Bate com categoria.`],
    [`É <em>agora</em>${n}.`,`${D} de ${T}. O último está logo abaixo.`],
    [`Um pra <em>fechar</em>${n}.`,`${vit(W)} até aqui. Termina o serviço.`],
    [`Quase lá${N}!`,`Um jogo separa você do dia completo.`]],seed);
  if(D>=T/2)return pick([
    [`Mais da <em>metade</em>${n}.`,`${D} de ${T}. Faltam ${jogos(L)} para fechar o dia.`],
    [`Reta final${N}.`,`Faltam ${jogos(L)}. Quem fecha o dia ganha camisas no vestiário.`],
    [`Faltam <em>${L}</em>${n}.<br>Bora fechar?`,`${vit(W)} até agora. Dá para melhorar esse placar.`],
    [`Segundo <em>tempo</em>${n}.`,`Primeira metade já foi. Faltam ${jogos(L)}.`],
    [`Tá voando${N}!`,`${D} jogados, ${L} pela frente. Não perde o ritmo.`],
    [`Descendo a ladeira${N}.`,`Só ${jogos(L)} para completar os ${T} de hoje.`],
    [`${sau}${N}.<br>Faltam só <em>${L}</em>.`,`Você já passou da metade. Fecha o dia e garante a sequência.`],
    [`Contra-ataque${N}.`,`${vit(W)}. Mais ${jogos(L)} e o dia é seu.`]],seed);
  if(P>W)return pick([
    [`Bola pra frente${N}.`,`Ainda faltam ${jogos(L)}. Dá tempo de virar esse placar.`],
    [`Hora da <em>virada</em>${n}.`,`${vit(W)}, ${P} ${P===1?"derrota":"derrotas"}. Os próximos ${L} decidem o dia.`],
    [`Levanta a <em>cabeça</em>${n}.`,`Todo craque perde um lance. Faltam ${jogos(L)} para se recuperar.`],
    [`Vira o jogo${N}.`,`Placar de ${W} a ${P}. Ainda tem ${jogos(L)} para buscar.`],
    [`Faz parte${N}.`,`Até o Fenômeno errou pênalti. O próximo é seu.`],
    [`Tem <em>jogo</em> ainda${n}.`,`${L} desafios pela frente. Bota pressão.`]],seed);
  return pick([
    [`Faltam <em>${L}</em>${n}.<br>Bora fechar o dia?`,`Você já jogou ${D} de ${T}. Quem fecha o dia ganha camisas no vestiário.`],
    [`Embalou${N}!`,`${vit(W)} já. Faltam ${jogos(L)} para completar.`],
    [`${sau}${N}.<br>Continua, faltam <em>${L}</em>.`,`O próximo já está aí embaixo. Um clique.`],
    [`Aquecido${N}.`,`${D} jogados. Agora é manter o ritmo nos próximos ${L}.`],
    [`Isso, <em>${U}</em>!`,`${vit(W)} no bolso. Faltam ${jogos(L)}.`],
    [`Pegou no <em>tranco</em>${n}.`,`${D} de ${T}. O próximo já está liberado.`],
    [`Não para${N}.`,`${L} desafios para fechar o dia. Você está no caminho.`],
    [`Primeiro <em>tempo</em> bom${n}.`,`${vit(W)} até aqui. Segue que faltam ${jogos(L)}.`],
    [`Vai, <em>${U}</em>!`,`Mais ${jogos(L)} e você completa os ${T} de hoje.`]],seed);
}
export function home(){ST.VIEW="home";ST.PHASE="home";ST.PLAYDAY=todayKey();cleanup();
  if(location.hash)history.replaceState(null,"",location.pathname+location.search);
  document.body.classList.add("home-view");
  const OD=DAILY(),nDone=OD.filter(id=>dayResult(id)).length,pct=OD.length?Math.round(nDone/OD.length*100):0,left=OD.length-nDone;
  /* sequência de dias: dias seguidos com pelo menos um desafio do dia jogado (hoje conta; se ainda não jogou hoje, vale até ontem) */
  const kOf=d=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  const playedOn=k=>OD.some(id=>store.get(resultKey(id,k,"normal"))||store.get(resultKey(id,k,"hard")));
  let dStreak=0;{const d=new Date();if(!playedOn(kOf(d)))d.setDate(d.getDate()-1);while(dStreak<999&&playedOn(kOf(d))){dStreak++;d.setDate(d.getDate()-1)}}
  const daily=!MODE.free&&!MODE.multi,next=daily?OD.find(id=>!dayResult(id)):null;
  const stOf=id=>{const r=dayResult(id);if(!r)return"";const v=verdict(id,r.res);return v.cls==="win"?"won":v.cls==="loss"?"lost":"scored"};
  const head=!daily?(MODE.free?["Modo infinito","Jogue sem parar. Cada acerto aumenta a sequência."]:["Multiplayer","Chame os amigos e jogue em salas por código."])
    :heroMsg({total:OD.length,done:nDone,left,wins:OD.filter(id=>stOf(id)==="won").length,losses:OD.filter(id=>stOf(id)==="lost").length,streak:dStreak,playedToday:nDone>0});
  const cards=list=>list.map(id=>{const g=GAMES[id];
      const dr=MODE.free||g.multi||g.freeOnly?null:dayResult(id),cf=!MODE.multi&&!MODE.free&&g.cardFoot?g.cardFoot():null;
      const v=dr?verdict(id,dr.res):null,best=Math.max(bestOf(id,"normal"),bestOf(id,"hard"));
      const sub=cf?cf:g.multi&&MODE.multi?"contra amigo":g.multi&&!g.dayToo?"com amigos":g.freeOnly&&!MODE.free?"infinito":MODE.free?`${fireHTML(best)} recorde`:"desafio de hoje";
      const badge=v?`<span class="rz ${v.cls}">${v.cls==="score"?esc(v.word)+(KIND[id]?" pts":" seg."):v.word==="GANHOU"?"✓ Venceu":v.cls==="loss"?"✗ "+esc(v.word):esc(v.word)}</span>`:`<span class="pl">Jogar</span>`;
      return`<button type="button" class="gc rv ${v?"done "+stOf(id):""}${id===next?" nxt":""}" data-g="${id}" aria-label="${esc(g.name)}: ${esc(g.desc||"")}">
        <span class="fr"><span class="im">${THUMBS[id]?`<img src="${THUMBS[id]}" alt="" loading="lazy" width="204" height="306">`:`<span class="fit">${art(id)}</span>`}</span>
        ${id===next?'<span class="tg nx">Próximo</span>':NEW.includes(id)&&!v?'<span class="tg">Novo</span>':""}
        <span class="gcb"><b>${g.name}</b><span class="sd">${esc(SHORT[id]||"")}</span><span class="ft">${badge}<small>${v&&dr.res.ms?fmtDur(dr.res.ms):sub}</small></span></span><span class="pull" aria-hidden="true"></span></span>
        <span class="dr" aria-hidden="true"><span class="pv art"><span class="fit">${art(id)}</span></span>
          <span class="dr-t"><b>${g.name}</b><span class="dr-d">${esc(g.desc||SHORT[id]||"")}</span>
          <span class="dr-f">${v?badge:`<span class="dr-go">Jogar <i>→</i></span>`}<small>${v&&dr.res.ms?fmtDur(dr.res.ms):sub}</small></span></span></span></button>`}).join("");
  $("#app").innerHTML=`<div class="hm">
    <section class="hx">
      <div class="hx-l"><p class="eyebrow">${daily?`Desafio nº ${dayNum()}`:"Arena The Fenômeno"}</p><h1>${head[0]}</h1><p class="lede">${head[1]}</p>
        ${daily?`<div class="dots" aria-label="${nDone} de ${OD.length} desafios jogados">${OD.map((id,i)=>`<i style="--i:${i}" class="${stOf(id)}" title="${esc(GAMES[id].name)}"></i>`).join("")}</div>`:""}
        <div class="cta-r">${next?`<button type="button" class="cta2" data-g="${next}">Jogar ${esc(GAMES[next].name)} <span>→</span></button>`:daily&&!left?`<button class="cta2" type="button" data-a="sum">Ver resumo do dia <span>→</span></button>`:""}
        ${daily?`<span class="strk${dStreak?"":" off"}"><span class="fl">🔥</span> ${dStreak?`<b>${dStreak}</b> ${dStreak===1?"dia seguido":"dias seguidos"}`:"Comece sua sequência hoje"}</span>`:""}</div></div>
      <div class="hx-r"><div class="ring" style="--p:${pct}"><b>${nDone}<small>/${OD.length}</small></b><span>hoje</span></div>
        <div class="cd2"><small>Novos desafios em</small><b id="cd">${countdown()}</b></div></div>
    </section>
    <div class="tabs">${modeToggle(true)}</div>
    ${[["solo",daily?`Desafios de hoje${left?` <em>· ${left} ${left===1?"restante":"restantes"}</em>`:""}`:"Um jogador",ORDER.filter(id=>!GAMES[id].multi||GAMES[id].dayToo)],["multi","Multiplayer",ORDER.filter(id=>GAMES[id].multi)]].map(([key,title,list])=>`<section class="blk" aria-labelledby="h-${key}"><h2 class="bh" id="h-${key}">${title}</h2><div class="grid2" id="g-${key}">${cards(list)}</div></section>`).join("")}
    <section class="lobbys" id="lobbys" aria-labelledby="h-lobbys"></section>
    <section class="blk" aria-labelledby="h-fam"><h2 class="bh" id="h-fam">Mais da família The Fenômeno</h2>
      <div class="fam2">${OUTROS.map(o=>`<a href="${o.u}" target="_blank" rel="noopener"><img src="${o.i}" alt="" loading="lazy" width="347" height="570"><span><b>${o.n}</b><small>${o.d}</small></span></a>`).join("")}</div></section></div>`;
  {const pararLb=lobbysSecao($("#lobbys"),(j,c)=>{if(!hasUser())return userGate();const g=GAMES[j];g&&g.entrar?g.entrar(c):openGame(j)});const old=ST.CLEAN;ST.CLEAN=()=>{pararLb();old&&old()}}
  $("#app").querySelector(".hm").addEventListener("click",e=>{const c=e.target.closest(".gc,.cta2[data-g]");if(c)openGame(c.dataset.g)});
  /* prévia: cada miniatura tem um tamanho; na primeira vez que o mouse entra, amplia ou reduz até caber */
  $("#app").querySelectorAll(".gc .pv").forEach(pv=>pv.closest(".gc").addEventListener("pointerenter",()=>{if(pv.dataset.ok)return;pv.dataset.ok=1;
    const f=pv.firstElementChild;f.style.zoom="1";let w=f.scrollWidth,h=f.scrollHeight;if(w<8){f.style.width="100%";w=f.scrollWidth;h=f.scrollHeight}
    const aw=pv.clientWidth-28,ah=pv.clientHeight-28;if(w>8&&h>8)f.style.zoom=String(Math.max(.35,Math.min(aw/w,ah/h,2.4)))}));
  /* entrada dos cards ao rolar + inclinação 3D e reflexo seguindo o mouse */
  {const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,cs=[...$("#app").querySelectorAll(".gc")];
    if(reduce||!("IntersectionObserver" in window))cs.forEach(c=>c.classList.remove("rv"));
    else{const io=new IntersectionObserver(es=>{let k=0;es.forEach(e=>{if(e.isIntersecting){e.target.style.setProperty("--d",k++);e.target.classList.add("in");io.unobserve(e.target);
      setTimeout(()=>{e.target.classList.remove("rv","in");e.target.style.removeProperty("--d")},900+k*55)}})},{rootMargin:"0px 0px 40px 0px"});cs.forEach(c=>io.observe(c))}
    /* reflexo seguindo o mouse */
    if(!reduce&&matchMedia("(hover:hover)").matches)cs.forEach(c=>c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect();
      c.style.setProperty("--mx",(e.clientX-r.left)/r.width*100+"%");c.style.setProperty("--my",(e.clientY-r.top)/r.height*100+"%")}));
    /* no toque: arrastar o card para o lado abre ou fecha a gaveta com a descrição; toque normal joga */
    cs.forEach(c=>{let x0=null,y0=0,moved=false;
      c.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse")return;x0=e.clientX;y0=e.clientY;moved=false});
      c.addEventListener("pointermove",e=>{if(x0===null||e.pointerType==="mouse")return;const dx=e.clientX-x0;if(Math.abs(dx)<24||Math.abs(dx)<Math.abs(e.clientY-y0))return;
        moved=true;x0=null;if(dx<0){cs.forEach(o=>o!==c&&o.classList.remove("open"));c.classList.add("open")}else c.classList.remove("open")});
      c.addEventListener("pointerup",()=>{x0=null});
      c.addEventListener("click",e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true)})}
  const sb=$("#app").querySelector("[data-a=sum]");sb&&sb.addEventListener("click",daySummary);
  $("#app").querySelector(".mode").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;MODE.multi=b.dataset.m==="m";MODE.free=b.dataset.m==="f";home()});
  updateToday();window.scrollTo(0,0)}
/* Cada miniatura tem um tamanho próprio; aqui ela é ampliada até preencher o espaço do tile, como no futbol11.
   Mede o conteúdo sem zoom e aplica o fator que cabe. Refaz quando as fontes carregam e quando a largura muda. */
function fitArts(grid){if(!grid)return;
  const fit=()=>{if(!grid.isConnected)return;grid.querySelectorAll(".art").forEach(a=>{const f=a.firstElementChild;if(!f||f.classList.contains("thumb"))return;
    f.style.zoom="1";const w=f.scrollWidth,h=f.scrollHeight,cs=getComputedStyle(a),aw=a.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),ah=a.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
    if(w<8||h<8||aw<8||ah<8){f.style.zoom="";return}
    f.style.zoom=String(Math.max(.4,Math.min(aw/w,ah/h,2.2)*.94))})};
  fit();document.fonts&&document.fonts.ready.then(fit);
  let t;const onR=()=>{if(!grid.isConnected){removeEventListener("resize",onR);return}clearTimeout(t);t=setTimeout(fit,120)};addEventListener("resize",onR);
  grid.querySelectorAll("img").forEach(i=>{if(!i.complete)i.addEventListener("load",fit,{once:true})})}
/* faixa "Os mais jogados": setas, troca automática e rolagem por toque. Pausa com o mouse em cima, com o foco dentro
   ou logo depois de a pessoa mexer; não troca sozinha com a aba escondida nem com "reduzir movimento". */
function carousel(root){if(!root)return;const tr=root.querySelector(".car-track"),reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hover=false,lastUser=0;
  const step=()=>{const li=tr.querySelector("li");return li?li.getBoundingClientRect().width+(parseFloat(getComputedStyle(tr).columnGap)||0):300};
  const go=dir=>{const max=tr.scrollWidth-tr.clientWidth,b=reduce?"auto":"smooth";
    if(dir>0&&tr.scrollLeft>=max-4)tr.scrollTo({left:0,behavior:b});else if(dir<0&&tr.scrollLeft<=4)tr.scrollTo({left:max,behavior:b});else tr.scrollBy({left:dir*step(),behavior:b})};
  root.querySelector(".prev").addEventListener("click",()=>{lastUser=Date.now();go(-1)});
  root.querySelector(".next").addEventListener("click",()=>{lastUser=Date.now();go(1)});
  root.addEventListener("pointerenter",()=>{hover=true});root.addEventListener("pointerleave",()=>{hover=false});
  ["pointerdown","wheel","touchstart","keydown"].forEach(t=>root.addEventListener(t,()=>{lastUser=Date.now()},{passive:true}));
  if(reduce)return;
  const t=setInterval(()=>{if(!root.isConnected){clearInterval(t);return}
    if(hover||document.hidden||root.contains(document.activeElement)||Date.now()-lastUser<8000)return;go(1)},4500)}
/* tela de escolha: normal ou difícil */
export function openGame(id){if(GAMES[id]&&GAMES[id].freeOnly&&!MODE.multi)MODE.free=true;if(GAMES[id]&&(MODE.multi||(GAMES[id].multi&&!GAMES[id].dayToo))&&!hasUser())return userGate();
  if(GAMES[id]&&GAMES[id].open)return GAMES[id].open();MODE.multi=false;ST.VIEW=id;ST.PHASE="choose";ST.PLAYDAY=todayKey();cleanup();
  const g=GAMES[id];if(!g)return home();
  if(location.hash!=="#"+id)history.replaceState(null,"","#"+id);
  const info={normal:["Craques que todo mundo conhece, com todas as dicas.","618 craques"],
    hard:["Jogadores de nicho, de 1970 até hoje, com menos dicas e menos erros.","740 jogadores · menos dicas"]};
  const lv=g.levels||info;
  $("#app").innerHTML=`<div class="stagehead"><button class="back" type="button">← Jogos</button><h2>${g.name.replace(/\?$/,"<b>?</b>")}</h2><span class="spacer"></span>${modeToggle(false)}</div>
    <p class="rules">Escolha o nível. ${MODE.free?"No modo infinito as rodadas não acabam: cada acerto aumenta a sequência e um erro apaga o fogo. Jogue qualquer nível, quantas vezes quiser.":"No desafio do dia você joga um nível só: escolheu, valeu. O outro fica travado até amanhã."}</p>
    <div class="choose">${DIFFS.map(d=>{const dl=MODE.free?null:dayLevel(id),locked=dl&&dl!==d;const res=!MODE.free&&!locked&&store.get(resultKey(id,null,d));const v=res?verdict(id,res):null;
      return`<button type="button" class="lvl ${d}${locked?" locked":""}" data-d="${d}" ${locked?`aria-disabled="true"`:""}><span class="lv-top"><span class="d">${DNAME[d]}</span>${d==="hard"?`<span class="skull">☠</span>`:""}</span><p>${lv[d][0]}</p><span class="lv-foot"><small>${lv[d][1]}</small>${MODE.free?`<span class="rec">${fireHTML(bestOf(id,d))} recorde</span>`:locked?`<span class="lock-note">🔒 hoje você jogou no ${DNAME[dl].toLowerCase()}</span>`:v?`<span class="verdict ${v.cls}">${v.cls==="score"?esc(v.word)+" "+v.detail.toUpperCase():v.word}</span>`:dl===d?`<span class="go">CONTINUAR →</span>`:`<span class="go">JOGAR →</span>`}</span></button>`}).join("")}</div>`;
  $("#app").querySelector(".back").addEventListener("click",home);
  $("#app").querySelector(".stagehead .mode").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;MODE.free=b.dataset.m==="f";openGame(id)});
  $("#app").querySelector(".choose").addEventListener("click",e=>{const b=e.target.closest(".lvl");if(!b)return;
    if(b.classList.contains("locked")){toast(`Hoje você jogou no ${DNAME[dayLevel(id)].toLowerCase()}. Perdeu, perdeu! Amanhã tem mais.`);return}
    ST.DIFF=b.dataset.d;startGame(id)});
  window.scrollTo(0,0)}
export function startGame(id){ST.VIEW=id;ST.PHASE="play";ST.PLAYDAY=todayKey();cleanup();ST.CURGAME=id;loadStreak();
  const g=GAMES[id];
  if(!MODE.free&&!g.multi){const dl=dayLevel(id);if(dl&&dl!==ST.DIFF)ST.DIFF=dl}
  $("#app").innerHTML=`<div class="stagehead"><button class="back" type="button">← Níveis</button><h2>${g.name.replace(/\?$/,"<b>?</b>")}</h2><span class="lvbadge ${ST.DIFF}">${DNAME[ST.DIFF]}</span><span class="spacer"></span>${MODE.free?`<div id="fireBox" class="firebox"></div>`:modeToggle(false)}</div><p class="rules">${g.rules}${isHard()?` <b class="hardnote">Difícil: ${g.hard}</b>`:""}</p><div class="stage"></div>`;
  $("#app").querySelector(".back").addEventListener("click",()=>openGame(id));
  const mt=$("#app").querySelector(".stagehead .mode");mt&&mt.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;MODE.free=b.dataset.m==="f";startGame(id)});
  drawFire(false);
  const st=$("#app").querySelector(".stage");const prev=!MODE.free&&store.get(resultKey(id));
  if(prev){st.innerHTML=`<div class="result"><img src="${BODEHEAD}" alt=""><div>${whoLine()}${(v=>`<span class="verdict ${v.cls}">${v.cls==="score"?v.word+" "+v.detail.toUpperCase():v.word}</span>`)(verdict(id,prev))}<div class="d">DESAFIO DE HOJE FEITO</div><p>${esc(prev.label)} Volte amanhã para o próximo, ou jogue no modo infinito.</p><div class="row"><button class="btn y" data-a="share">Copiar resultado</button><button class="btn" data-a="free">Jogar no modo infinito</button></div></div></div>`;
    st.addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;if(a==="share")share(withWho(prev.share));if(a==="free"){MODE.free=true;startGame(id)}});}
  else{if(!MODE.free&&!g.multi){if(!store.get(dayLockKey(id)))store.set(dayLockKey(id),ST.DIFF);ST.CLOCK={id,day:ST.PLAYDAY,t0:document.hidden?0:Date.now()}}g.start(st,gameRng(id))}
  window.scrollTo(0,0)}
export function daySummary(){ST.VIEW="resumo";ST.PHASE="home";cleanup();
  if(location.hash!=="#resumo")history.replaceState(null,"","#resumo");
  const rows=DAILY().map(id=>({id,g:GAMES[id],r:dayResult(id)}));
  const done=rows.filter(x=>x.r),win=done.filter(x=>x.r.res.won).length,loss=done.filter(x=>!x.r.res.won&&KIND[x.id]==="wl").length,part=done.length-win-loss;
  const tot=done.reduce((s,x)=>s+(x.r.res.ms||0),0),byLv={normal:0,hard:0},nLv={normal:0,hard:0};done.forEach(x=>{byLv[x.r.d]+=x.r.res.ms||0;nLv[x.r.d]++});
  const tag=x=>{const v=verdict(x.id,x.r.res);return{cls:v.cls,txt:v.cls==="score"?`${v.word} ${v.detail}`:v.word==="GANHOU"?"VENCEU":"PERDEU"}};
  $("#app").innerHTML=`<div class="sumwrap"><div class="stagehead"><button class="back" type="button">← Jogos</button><h2>RESUMO DO <b>DIA #${dayNum()}</b></h2></div>
    <p class="rules">${done.length===rows.length?"Você fechou todos os desafios de hoje.":`Faltam ${rows.length-done.length} desafio(s) de hoje.`} O tempo conta só enquanto a partida está aberta na tela.</p>
    <div class="sum-kpis"><div class="g"><small>Vitórias</small><b>${win}</b></div><div class="r"><small>Derrotas</small><b>${loss}</b></div><div class="y"><small>Por pontos</small><b>${part}</b></div><div><small>Tempo total</small><b>${fmtDur(tot)}</b></div><div><small>No normal (${nLv.normal})</small><b>${fmtDur(byLv.normal)}</b></div><div><small>No difícil (${nLv.hard})</small><b>${fmtDur(byLv.hard)}</b></div></div>
    <div class="sum-list">${rows.map(x=>{if(!x.r)return`<button type="button" class="sum-row" data-g="${x.id}"><span class="n">${x.g.name}</span><span class="lv">—</span><span class="v muted">não jogado</span><span class="t">JOGAR →</span></button>`;const t=tag(x);
      return`<div class="sum-row ${t.cls}"><span class="n">${x.g.name}</span><span class="lv">${DNAME[x.r.d]}</span><span class="v">${esc(t.txt)}</span><span class="t">⏱ ${fmtDur(x.r.res.ms)}</span></div>`}).join("")}</div>
    <div class="row" style="margin-top:18px"><button class="btn y" type="button" data-a="share">Copiar resumo</button><button class="btn" type="button" data-a="home">Voltar aos jogos</button></div></div>`;
  const app=$("#app");app.querySelector(".back").addEventListener("click",home);
  app.querySelector(".sumwrap").addEventListener("click",e=>{const b=e.target.closest("[data-a],[data-g]");if(!b)return;
    if(b.dataset.g){MODE.free=false;openGame(b.dataset.g);return}
    if(b.dataset.a==="home")home();
    if(b.dataset.a==="share")share(withWho(`THE FENÔMENO · RESUMO DO DIA #${dayNum()}\n✅ ${win} vitórias · ❌ ${loss} derrotas · 🎯 ${part} por pontos\n⏱ ${fmtDur(tot)} jogando\n`+rows.filter(x=>x.r).map(x=>{const t=tag(x);return`${t.cls==="win"?"🟩":t.cls==="loss"?"🟥":"🟨"} ${x.g.name} (${DNAME[x.r.d].toLowerCase()}) ${t.cls==="score"?t.txt:""} ${fmtDur(x.r.res.ms)}`.replace(/\s+/g," ").trim()}).join("\n")))});
  window.scrollTo(0,0)}
