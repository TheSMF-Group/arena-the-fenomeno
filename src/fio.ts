// @ts-nocheck
/* Retenção sem truque: só mostra progresso que o jogador de fato fez (nada de barra presenteada, nada de relógio de medo).
   - sequência de dias: dias seguidos com pelo menos 1 desafio do dia concluído, lida do que já está salvo no aparelho;
   - progresso do dia: X de N desafios fechados;
   - próximo jogo: até 3 sugestões, as mais rápidas primeiro, pra o "só mais um" custar pouco. */
import {store, esc} from "./core";
import {META, pathOf} from "./meta";
import {promoMini} from "./promo";
const RE=new RegExp("^fen:("+Object.keys(META).join("|")+"):(?:d:)?(\\d{8})$");
const dkey=d=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
const playedDays=()=>{const s=new Set();try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||"",m=RE.exec(k);if(!m)continue;let v=null;try{v=JSON.parse(localStorage.getItem(k))}catch(e){}if(v&&typeof v==="object")s.add(+m[2])}}catch(e){}return s};
export function dayStreak(){
  const s=playedDays(),d=new Date(),today=s.has(dkey(d));if(!today)d.setDate(d.getDate()-1);
  let n=0;while(s.has(dkey(d))){n++;d.setDate(d.getDate()-1)}
  const best=Math.max(n,(store.get("diastreak")||{best:0}).best);if(n>(store.get("diastreak")||{best:0}).best)store.set("diastreak",{best:n});
  return{n,best,today,total:s.size};
}
export function paintStreak(){const el=document.getElementById("dayStreak");if(!el)return;const{n,today,total}=dayStreak();
  if(!total){el.hidden=true;return}
  el.hidden=false;el.classList.toggle("idle",!today);
  /* a sequência pode zerar, o total de dias jogados nunca: quem perde a sequência continua vendo o que já fez */
  el.innerHTML=n?`<b>${n}</b> ${n===1?"dia seguido":"dias seguidos"}`:`<b>${total}</b> ${total===1?"dia jogado":"dias jogados"}`;
  el.title=`${total} ${total===1?"dia jogado":"dias jogados"} no total`+(n?` · sequência atual: ${n}`:"")+` · melhor sequência: ${Math.max(n,dayStreak().best)}`}
const mins=id=>parseInt(META[id]&&META[id].mins)||5;
export function progressHTML(done,total){
  const left=total-done,pct=Math.round(done/total*100);
  const msg=done===0?"Nenhum desafio hoje ainda. Comece pelo que quiser.":left===0?"Dia fechado.":left<=3?`Faltam ${left} pra fechar o dia.`:`${done} de ${total} do dia.`;
  return`<div class="dayprog" role="img" aria-label="${done} de ${total} desafios do dia"><div class="bar"><i style="width:${pct}%"></i></div><span>${esc(msg)}</span></div>`}
/* bloco depois de cada partida. Daily: o que falta no dia. Infinito: trocar de jogo. */
export function nextUpEl({id,free,daily,done,name,open}){
  const others=daily.filter(g=>g!==id);
  const pend=others.filter(g=>!done(g));
  let pool,title;
  if(free){pool=others.slice().sort(()=>Math.random()-.5);title="TROQUE DE JOGO"}
  else if(pend.length){pool=pend.slice().sort((a,b)=>mins(a)-mins(b));title=pend.length<=3?`FALTAM ${pend.length} PRA FECHAR O DIA`:"O QUE JOGAR AGORA"}
  else{pool=others.slice().sort(()=>Math.random()-.5);title="DIA FECHADO. TEM MAIS NO MODO INFINITO"}
  const picks=pool.slice(0,3);
  const box=document.createElement("div");box.className="nextup";
  box.innerHTML=`<div class="nx-h">${esc(title)}</div><div class="nx-row">${picks.map(g=>`<a class="nx" href="${pathOf(g)}" data-g="${g}"><span class="d">${esc(name(g))}</span><small>${esc(META[g]?META[g].mins:"")} · ${esc(META[g]?META[g].desc:"")}</small></a>`).join("")}</div>${promoMini(id)}`;
  box.addEventListener("click",e=>{const a=e.target.closest("a.nx");if(!a)return;e.preventDefault();open(a.dataset.g)});
  return box}
