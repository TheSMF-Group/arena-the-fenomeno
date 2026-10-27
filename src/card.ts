// @ts-nocheck
/* Share card: imagem 1080x1350 (feed e story) gerada no próprio navegador, sem servidor.
   Regras visuais do thefenomeno: card sempre escuro, um amarelo só, verde só para "conquistado", o número é o herói.
   Todos os jogos passam por share(texto): este módulo lê o texto padrão ("THE FENÔMENO · JOGO #dia" + quadradinhos) e desenha o card,
   então um jogo novo ganha o card sem escrever nada. */
import {BODEHEAD, toast} from "./core";
import {dayStreak} from "./fio";
import {ev} from "./track";

const W=1080,H=1350,Y="#ffd400",G="#00c46a",R="#dc2626";
const SQ={"🟩":"#00a859","🟨":"#ffd400","🟥":"#dc2626","⬛":"#1f1f1f","⬜":"#e8e8e8","🟦":"#2f55d4","🟧":"#f59e0b"};
const CLS={win:G,loss:R,score:Y};

/* "THE FENÔMENO · FORCA (infinito)\n..." -> campos */
export function parseShare(text){
  const lines=String(text).split("\n").map(s=>s.trim()).filter(Boolean);
  const head=(lines.shift()||"").replace(/^🐐\s*/,"").replace(/^THE FENÔMENO\s*·\s*/,"");
  const m=/^(.*?)(?:\s+DIFÍCIL)?\s*(?:#(\d+)|\(infinito\))\s*(.*)$/.exec(head);
  const title=(m?m[1]:head).trim()||"MINI GAME",day=m&&m[2]||null,inf=/\(infinito\)/.test(head),hard=/DIFÍCIL/.test(head),extra=(m&&m[3]||"").trim();
  return{title,day,inf,hard,extra,lines};
}
const squaresIn=l=>[...l].filter(c=>SQ[c]);

export function buildSpec(text,meta={}){
  const p=parseShare(text),day=/RESUMO DO DIA/.test(p.title);
  const tag=day?`DIA #${p.day||""}`:p.inf?"MODO INFINITO":p.day?`DIA #${p.day}${p.hard?" · DIFÍCIL":""}`:"DUELO";
  const rows=[],texts=[],grid=[];let kp=null,time=meta.ms?null:null;
  for(const l of p.lines){
    const k=/✅\s*(\d+).*?❌\s*(\d+).*?🎯\s*(\d+)/.exec(l);if(k){kp={win:+k[1],loss:+k[2],part:+k[3]};continue}
    const t=/^⏱\s*(.+?)\s*jogando/.exec(l);if(t){time=t[1];continue}
    const r=/^(🟩|🟥|🟨)\s+(.+)$/.exec(l);if(day&&r){rows.push({c:SQ[r[1]],name:r[2].replace(/\s*\(.*$/,"")});continue}
    if(squaresIn(l).length>=3){grid.push(squaresIn(l));continue}
    texts.push(l)}
  return{kind:day?"day":"game",title:day?"RESUMO DO DIA":p.title,sub:p.extra,tag,v:meta.v||null,label:meta.label||"",ms:meta.ms||0,time,streak:meta.streak||0,best:meta.best||0,kp,rows,texts,grid,text};
}

function fit(ctx,txt,font,max,start,min=40){let s=start;do{ctx.font=`${s}px ${font}`;if(ctx.measureText(txt).width<=max)break;s-=6}while(s>min);return s}
function wrap(ctx,txt,max,maxLines){const w=String(txt).split(/\s+/),out=[];let cur="";for(const x of w){const t=cur?cur+" "+x:x;if(ctx.measureText(t).width>max&&cur){out.push(cur);cur=x}else cur=t}if(cur)out.push(cur);if(out.length>maxLines){out.length=maxLines;out[maxLines-1]=out[maxLines-1].replace(/.{0,3}$/,"…")}return out}
const rr=(ctx,x,y,w,h,r)=>{ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
const img=src=>new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src});
const mmss=ms=>{const s=Math.round(ms/1000),m=Math.floor(s/60);return m?`${m}min ${String(s%60).padStart(2,"0")}s`:`${s}s`};

export async function renderCard(spec){
  try{await Promise.all([document.fonts.load('120px "Bebas Neue"'),document.fonts.load('700 30px Inter'),document.fonts.load('500 30px Inter')])}catch(e){}
  const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const D='"Bebas Neue",Oswald,Impact,sans-serif',B='Inter,system-ui,sans-serif';
  /* fundo: noite de estádio, brilho amarelo no topo e círculo de campo */
  x.fillStyle="#0a0a0a";x.fillRect(0,0,W,H);
  let g=x.createRadialGradient(W/2,-40,40,W/2,-40,820);g.addColorStop(0,"rgba(255,212,0,.20)");g.addColorStop(1,"rgba(255,212,0,0)");x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle="rgba(255,255,255,.045)";x.lineWidth=3;for(let r=150;r<=560;r+=70){x.beginPath();x.arc(W*.8,430,r,0,Math.PI*2);x.stroke()}
  x.strokeStyle="rgba(255,255,255,.14)";x.lineWidth=2;rr(x,28,28,W-56,H-56,38);x.stroke();
  x.strokeStyle=Y;x.lineWidth=6;x.beginPath();x.moveTo(28,110);x.lineTo(28,66);x.arcTo(28,28,66,28,38);x.lineTo(150,28);x.stroke();
  /* marca */
  const goat=await img(BODEHEAD);if(goat){const gh=118,gw=gh*(goat.width/goat.height);x.drawImage(goat,70,64,gw,gh)}
  x.textBaseline="alphabetic";x.font=`92px ${D}`;x.fillStyle="#fff";const tw=x.measureText("THE ").width;x.fillText("THE ",250,150);x.fillStyle=Y;x.fillText("FENÔMENO",250+tw,150);
  x.font=`700 25px ${B}`;x.fillStyle=Y;x.letterSpacing="6px";x.fillText("CENTRAL DE MINI GAMES",254,196);x.letterSpacing="0px";
  /* etiqueta do dia */
  x.font=`44px ${D}`;x.letterSpacing="3px";const cw=x.measureText(spec.tag).width+56;rr(x,70,252,cw,64,32);x.strokeStyle=Y;x.lineWidth=3;x.stroke();x.fillStyle=Y;x.fillText(spec.tag,98,300);x.letterSpacing="0px";
  /* título do jogo */
  const ts=fit(x,spec.title,D,W-140,spec.kind==="day"?170:190,70);x.font=`${ts}px ${D}`;x.fillStyle="#fff";x.fillText(spec.title,70,470);
  if(spec.sub){x.font=`700 34px ${B}`;x.fillStyle="#9a9a9a";x.fillText(spec.sub.toUpperCase(),74,520)}
  let y=spec.sub?590:540;
  if(spec.kind==="day"&&spec.kp){
    /* card geral do dia: três números herói */
    const cols=[["VITÓRIAS",spec.kp.win,G],["DERROTAS",spec.kp.loss,R],["POR PONTOS",spec.kp.part,Y]],cw3=(W-140)/3;
    cols.forEach(([l,n,col],i)=>{const cx=70+cw3*i+cw3/2;x.textAlign="center";x.font=`230px ${D}`;x.fillStyle=col;x.fillText(String(n),cx,y+190);x.font=`700 26px ${B}`;x.fillStyle="#9a9a9a";x.letterSpacing="4px";x.fillText(l,cx,y+240);x.letterSpacing="0px"});x.textAlign="left";y+=300;
    const two=spec.rows.slice(0,16),colW=(W-140)/2;
    two.forEach((r,i)=>{const cx=70+(i%2)*colW,cy=y+Math.floor(i/2)*58;x.fillStyle=r.c;rr(x,cx,cy,34,34,7);x.fill();x.font=`42px ${D}`;x.fillStyle="#f1f1f1";x.fillText(r.name,cx+50,cy+30)});
    y+=Math.ceil(two.length/2)*58+10;
  }else if(spec.v){
    /* o veredito é o herói */
    const col=CLS[spec.v.cls]||Y,word=String(spec.v.word);
    /* orçamento de altura: o veredito encolhe só o necessário pra legenda e os quadradinhos caberem acima dos chips */
    x.font=`500 38px ${B}`;const nLab=spec.label?wrap(x,spec.label,W-140,3).length:0,gR=spec.grid.slice(0,7).length;
    const budget=1112-y-(spec.v.detail?64:0)-(nLab?nLab*54+14:0)-(gR?gR*((gR>2?42:62)+10)+10:0)-20;
    const vs=fit(x,word,D,W-140,Math.max(110,Math.min(300,budget/.78)),100);x.font=`${vs}px ${D}`;x.fillStyle=col;
    x.shadowColor=col;x.shadowBlur=40;x.fillText(word,70,y+vs*.78);x.shadowBlur=0;y+=vs*.78+24;
    if(spec.v.detail){x.font=`800 36px ${B}`;x.fillStyle="#bdbdbd";x.letterSpacing="3px";x.fillText(String(spec.v.detail).toUpperCase(),74,y+30);x.letterSpacing="0px";y+=64}
  }else if(spec.texts.length){
    x.font=`600 40px ${B}`;x.fillStyle="#f1f1f1";spec.texts.slice(0,5).forEach(t=>{wrap(x,t,W-140,2).forEach(l=>{x.fillText(l,70,y+44);y+=56})});y+=10}
  if(spec.label&&spec.kind!=="day"){x.font=`500 38px ${B}`;x.fillStyle="#cfcfcf";wrap(x,spec.label,W-140,3).forEach(l=>{x.fillText(l,70,y+44);y+=54});y+=14}
  /* quadradinhos do jogo, desenhados (emoji muda de fonte entre aparelhos) */
  if(spec.grid.length&&spec.kind!=="day"){const rows=spec.grid.slice(0,7),cols=Math.max(...rows.map(r=>r.length)),s=Math.min(rows.length>2?42:62,Math.floor((W-140-(cols-1)*10)/cols));
    rows.forEach((r,ri)=>r.forEach((c,ci)=>{x.fillStyle=SQ[c];rr(x,70+ci*(s+10),y+ri*(s+10),s,s,10);x.fill()}));y+=rows.length*(s+10)+10}
  /* números de apoio */
  const chips=[];if(spec.ms)chips.push("⏱ "+mmss(spec.ms));else if(spec.time)chips.push("⏱ "+spec.time);const st=dayStreak();if(st.n)chips.push(`${st.n} ${st.n===1?"dia seguido":"dias seguidos"}`);if(spec.streak)chips.push(`sequência ${spec.streak}`);
  let cx=70;const cy=1138;x.font=`700 32px ${B}`;chips.forEach(t=>{const w=x.measureText(t).width+44;rr(x,cx,cy,w,62,31);x.fillStyle="#141414";x.fill();x.strokeStyle="rgba(255,255,255,.14)";x.lineWidth=2;x.stroke();x.fillStyle="#f1f1f1";x.fillText(t,cx+22,cy+42);cx+=w+14});
  /* rodapé */
  x.fillStyle="rgba(255,212,0,.95)";x.fillRect(70,1228,W-140,3);
  x.textAlign="center";x.font=`66px ${D}`;x.fillStyle=Y;x.letterSpacing="2px";x.fillText("JOGUE GRÁTIS: JOGUE.THEFENOMENO.COM",W/2,1296);x.letterSpacing="0px";x.textAlign="left";
  return c;
}

/* modal: prévia, compartilhar, baixar, copiar texto */
export function openCard(text,meta,copy){
  document.querySelectorAll(".modal.sharecard").forEach(m=>m.remove());
  const spec=buildSpec(text,meta),m=document.createElement("div");m.className="modal sharecard";m.setAttribute("role","dialog");m.setAttribute("aria-label","Card para compartilhar");
  m.innerHTML=`<div class="box"><h3 class="d">${spec.kind==="day"?"CARD DO DIA":"SEU CARD"}</h3><div class="cardprev"><div class="cardload">Gerando o card…</div></div>
    <div class="row cardact"><button class="btn y" type="button" data-a="share">Compartilhar</button><button class="btn" type="button" data-a="dl">Baixar imagem</button><button class="btn" type="button" data-a="txt">Copiar texto</button><button class="btn" type="button" data-a="x">Fechar</button></div></div>`;
  document.body.appendChild(m);const prev=m.querySelector(".cardprev");let blob=null;
  const file=()=>new File([blob],"the-fenomeno-card.png",{type:"image/png"});
  const close=()=>{m.remove();document.removeEventListener("keydown",esc)};const esc=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",esc);
  m.addEventListener("click",async e=>{
    if(e.target===m){close();return}
    const a=e.target.closest("button")?.dataset.a;if(!a)return;
    if(a==="x")close();
    if(a==="txt"){copy(text);ev("share_card",{action:"texto",kind:spec.kind,game:spec.title})}
    if(!blob)return;
    if(a==="dl"){const u=URL.createObjectURL(blob),l=document.createElement("a");l.href=u;l.download="the-fenomeno-card.png";l.click();setTimeout(()=>URL.revokeObjectURL(u),2000);ev("share_card",{action:"baixar",kind:spec.kind,game:spec.title})}
    if(a==="share"){
      const data={files:[file()],text:text.split("\n")[0].replace(/^🐐\s*/,"")+" · jogue.thefenomeno.com"};
      try{if(navigator.canShare&&navigator.canShare(data)){await navigator.share(data);ev("share_card",{action:"nativo",kind:spec.kind,game:spec.title})}else{const u=URL.createObjectURL(blob),l=document.createElement("a");l.href=u;l.download="the-fenomeno-card.png";l.click();setTimeout(()=>URL.revokeObjectURL(u),2000);toast("Card baixado. Poste onde quiser.");ev("share_card",{action:"baixar",kind:spec.kind,game:spec.title})}}catch(err){/* quem cancela o compartilhamento não é erro */}}
  });
  renderCard(spec).then(c=>{c.toBlob(b=>{blob=b;const i=new Image();i.alt="Card do resultado";i.src=URL.createObjectURL(b);prev.innerHTML="";prev.appendChild(i);m.querySelector("[data-a=share]").focus({preventScroll:true})},"image/png")}).catch(()=>{prev.innerHTML='<div class="cardload">Não deu pra gerar o card. Use "Copiar texto".</div>'});
}
