// @ts-nocheck
import {ST} from "../state";
import {clubName, hash, pick, rngOf} from "../core";
import {groupsBy} from "./conexoes";
import {VL, vlIn, vlPrep} from "./velha";
import {ATU, leBonus} from "./leilao";
export const DR_POS=[["GOL",4,3],["LD",3,5],["ZAG",3,4],["ZAG",3,2],["LE",3,1],["VOL",2,3],["MC",2,2],["MEI",2,4],["PD",1,5],["CA",1,3],["PE",1,1]];
export const DR_NAME=["Goleiro","Lateral-direito","Zagueiro","Zagueiro","Lateral-esquerdo","Volante","Meio-campo","Meia","Ponta-direita","Centroavante","Ponta-esquerda"];
export const DR_TURN={normal:60,hard:40};
/* posições do Transfermarkt -> casas do 4-3-3 onde o jogador pode entrar */
export const TM_POS={1:{n:"goleiro",s:["GOL"]},2:{n:"líbero",s:["ZAG"]},3:{n:"zagueiro",s:["ZAG"]},4:{n:"lateral-esquerdo",s:["LE"]},5:{n:"lateral-direito",s:["LD"]},6:{n:"volante",s:["VOL","MC"]},7:{n:"meio-campo",s:["MC","VOL","MEI"]},8:{n:"meia-direita",s:["MC","MEI","PD"]},9:{n:"meia-esquerda",s:["MC","MEI","PE"]},10:{n:"meia-atacante",s:["MEI","MC"]},11:{n:"ponta-esquerda",s:["PE"]},12:{n:"ponta-direita",s:["PD"]},13:{n:"segundo atacante",s:["CA","MEI"]},14:{n:"centroavante",s:["CA"]}};
export let DRPOS=null,DRPOSP=null;
/* posicoes.json: {id: [maior valor de mercado em euros, posição principal, secundária, secundária]} */
export function loadPos(){if(!DRPOSP)DRPOSP=fetch("/posicoes.json?v=1").then(r=>r.ok?r.json():{}).catch(()=>({})).then(m=>DRPOS=m);return DRPOSP}
export const drPosOf=p=>DRPOS&&DRPOS[p.id]?DRPOS[p.id].slice(1):[];
export const drCanPlay=(p,slot)=>drPosOf(p).some(id=>TM_POS[id]&&TM_POS[id].s.includes(DR_POS[slot][0]));
export const TM_AB={1:"GOL",2:"LIB",3:"ZAG",4:"LE",5:"LD",6:"VOL",7:"MC",8:"MD",9:"ME",10:"MEI",11:"PE",12:"PD",13:"SA",14:"CA"};
export const drPosAb=(p,slot)=>{const ids=[...new Set(drPosOf(p))].filter(id=>TM_AB[id]);return ids.length?ids.map(id=>`<span class="pz${TM_POS[id].s.includes(DR_POS[slot][0])?" ok":""}">${TM_AB[id]}</span>`).join(""):`<span class="pz">sem posição</span>`};
export const drPosTxt=p=>[...new Set(drPosOf(p).map(id=>TM_POS[id]&&TM_POS[id].n).filter(Boolean))].join(", ");
/* força do jogador: pelo maior valor de mercado da carreira; lendas sem valor registrado contam pela lista de craques da base */
export function drPow(p){if(!p)return 40;const v=ST.DR_CUR&&ATU&&ATU[p.id]>0?ATU[p.id]:DRPOS&&DRPOS[p.id]?DRPOS[p.id][0]:0;if(v>0)return Math.max(42,Math.min(96,50+15*Math.log10(v/1e6)));return p.fam===1?82:p.fam===2?71:60}
export const DR_LG={br:{name:"Brasileirão",keys:["br"],any:"qualquer clube do Brasileirão"},eu:{name:"Europa",keys:["pl","ucl"],any:"qualquer clube da Europa"}};
export const drCN=c=>{const id=ST.CLUBS[c][1];return(id&&(ST.CRESTS.find(x=>x.id===id)||{}).name)||clubName(c)};
export function drClubs(cfg){const C=vlPrep(),HG=cfg.diff==="hard",L=DR_LG[cfg.lg]||DR_LG.eu;
  const ids=[...new Set(L.keys.flatMap(k=>HG?[...VL[k].normal,...VL[k].hard]:VL[k].normal))];
  return ids.map(id=>C.byCrest[id]).filter(i=>i!=null&&(C.byClub[i]||[]).length>=8)}
/* quem serve para um sorteio: clube e seleção, só clube (qualquer seleção) ou só seleção (qualquer clube da liga) */
export function drCands(d,used,cfg,slots){if(!d)return[];const C=vlPrep(),u=new Set(used);
  const pool=d.c!=null?(C.byClub[d.c]||[]):[...new Map(drClubs(cfg).flatMap(c=>C.byClub[c]||[]).map(p=>[p.id,p])).values()];
  return pool.filter(p=>!u.has(p.id)&&p.nat!=null&&ST.NATS[p.nat]&&(d.n==null||p.nat===d.n)&&(!slots||slots.some(sl=>drCanPlay(p,sl))))}
export const drFits=(p,d,cfg)=>(d.n==null||p.nat===d.n)&&(d.c!=null?vlIn(p,d.c):drClubs(cfg).some(c=>vlIn(p,c)));
export function drDraw(cfg,used,slots){const HG=cfg.diff==="hard",cs=drClubs(cfg),r=Math.random,C=vlPrep(),u=new Set(used);slots=slots||DR_POS.map((_,i)=>i);
  const ok=list=>list.filter(p=>!u.has(p.id)&&p.nat!=null&&ST.NATS[p.nat]&&slots.some(sl=>drCanPlay(p,sl)));const famN=list=>list.filter(p=>p.fam===1).length;
  for(let t=0;t<500;t++){const x=r(),ty=x<.5?"cn":x<.75?"c":"n";
    const few=t>300;
    if(ty==="c"){const c=pick(r,cs),m=ok(C.byClub[c]||[]);if(m.length>=(few?1:HG?4:6)&&(HG||few||famN(m)>=3))return{c,n:null};continue}
    if(ty==="n"){const all=drCands({c:null,n:null},used,cfg,slots);const g=groupsBy(all,p=>p.nat,few?1:HG?3:5).filter(([n,m])=>HG||few||famN(m)>=3);if(!g.length)continue;const [n]=pick(r,g);return{c:null,n:+n}}
    const c=pick(r,cs);const g=groupsBy(ok(C.byClub[c]||[]),p=>p.nat,few?1:HG?2:2).filter(([n,m])=>HG||few||famN(m)>=1);if(!g.length)continue;const [n]=pick(r,g);return{c,n:+n}}
  return null}
/* partida simulada: força de cada setor vira gols esperados; empate vai para os pênaltis. Mesmo resultado nas duas telas (sorteio fixo da sala) */
export function drSim(s){const r=rngOf(hash(s.code+":"+s.game+":jogo")),pl=id=>id?ST.P.find(p=>p.id===id):null,T={X:s.tx.map(pl),O:s.to.map(pl)};
  const R=m=>{const a=i=>drPow(T[m][i]);return{gk:a(0),def:(a(1)+a(2)+a(3)+a(4))/4,mid:(a(5)+a(6)+a(7))/3,att:(a(8)+a(9)+a(10))/3}};
  const rx=R("X"),ro=R("O");
  if(s.cards){const bx=leBonus(s,"X"),bo=leBonus(s,"O");for(const k in rx){rx[k]+=bx;ro[k]+=bo}}
  const xg=(A,B)=>Math.max(.25,1.3*Math.exp(((A.att*.6+A.mid*.4)-(B.def*.6+B.mid*.2+B.gk*.2))/9));
  const pois=l=>{let k=0,p=Math.exp(-l),c=p;const u=r();while(u>c&&k<8){k++;p*=l/k;c+=p}return k};
  const W=[0,.03,.03,.03,.03,.06,.08,.15,.19,.27,.19];
  const pickW=m=>{const t=T[m],w=t.map((p,i)=>W[i]*drPow(p));let x=r()*w.reduce((a,b)=>a+b,0);for(let i=0;i<11;i++){x-=w[i];if(x<=0)return i}return 9};
  const ev=[],used=new Set();const minute=()=>{let m;do{m=1+Math.floor(r()*90)}while(used.has(m));used.add(m);return m};
  const gx=pois(xg(rx,ro)),go=pois(xg(ro,rx));
  for(const [m,g] of [["X",gx],["O",go]]){for(let k=0;k<g;k++){const i=pickW(m);ev.push({min:minute(),m,t:"gol",i})}
    const miss=2+Math.floor(r()*3);for(let k=0;k<miss;k++){const i=pickW(m);ev.push({min:minute(),m,t:r()<.55?"defesa":"fora",i})}}
  ev.sort((a,b)=>a.min-b.min);
  const pen=[];let px=0,po=0;
  if(gx===go){const ord=[9,8,10,7,6,5,2,3,1,4,0];
    for(let k=0;k<30;k++){for(const m of ["X","O"]){const i=ord[k%11],kk=T[m][i],gk=T[m==="X"?"O":"X"][0];const ok=r()<Math.max(.55,Math.min(.92,.76+(drPow(kk)-drPow(gk))/150));pen.push({m,i,ok});if(ok)m==="X"?px++:po++}
      const n=k+1;if(n<5){const left=5-n;if(px>po+left||po>px+left)break}else if(px!==po)break}}
  return{gx,go,ev,pen,px,po,rx,ro,win:gx!==go?(gx>go?"X":"O"):(px>po?"X":"O")}}
export const drOk=s=>s&&typeof s==="object"&&s.cfg&&DR_TURN[s.cfg.diff]&&(DR_LG[s.cfg.lg]||s.cfg.bud>0||s.cfg.mal||s.cfg.rec)&&Array.isArray(s.tx)&&s.tx.length===11&&Array.isArray(s.to)&&s.to.length===11&&Array.isArray(s.used)&&typeof s.seq==="number";
