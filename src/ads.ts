// @ts-nocheck
/* Google Ad Manager (rede 23362641595), mesmas unidades do www:
   - fenomeno_sidebar_desktop: dois trilhos 160x600, só >=1536px;
   - fenomeno_top_banner: barra fixa no rodapé (970x90/728x90 no desktop, 320x50 no celular) e 1 banner no fim de cada partida.
   Ritmo: sem pop-up e sem intersticial. O anúncio renova só em pausa natural (troca de jogo, fim de partida) e nunca em menos de 60s,
   que é o que a documentação de jogos casuais recomenda pra não derrubar retenção nem viewability.
   ?adpreview=1 desenha o espaço dos anúncios sem criativo (o Ad Manager não serve em localhost). */
const NET="/23362641595/",BANNER=NET+"fenomeno_top_banner",RAIL=NET+"fenomeno_sidebar_desktop",MIN_GAP=60000,PREVIEW=new URLSearchParams(location.search).has("adpreview");
let last=Date.now(),lastInline=0,ready=false,seq=0;const slots={};
window.googletag=window.googletag||{cmd:[]};
const el=(h)=>{const d=document.createElement("div");d.innerHTML=h.trim();return d.firstChild};
function mapping(){return googletag.sizeMapping().addSize([1024,0],[[970,90],[728,90]]).addSize([768,0],[[728,90]]).addSize([0,0],[[320,50]]).build()}
function defineBanner(id){googletag.cmd.push(()=>{const s=googletag.defineSlot(BANNER,[[970,90],[728,90],[320,50]],id).defineSizeMapping(mapping()).addService(googletag.pubads());slots[id]=s;googletag.display(id)})}
function sweep(){googletag.cmd.push(()=>{const dead=Object.entries(slots).filter(([id])=>!document.getElementById(id)).map(([id,s])=>(delete slots[id],s));if(dead.length)googletag.destroySlots(dead)})}

export function initAds(){
  if(ready)return;ready=true;
  const rails=el(`<div><div class="gam-rail gam-rail-left" aria-hidden="true"><div id="div-gpt-ad-fenomeno-rail-left"></div></div><div class="gam-rail gam-rail-right" aria-hidden="true"><div id="div-gpt-ad-fenomeno-rail-right"></div></div></div>`);
  document.body.append(...rails.children);
  let closed=false;try{closed=sessionStorage.getItem("fen_hub_bar_closed")==="1"}catch(e){}
  let bar=null;
  if(!closed){bar=el(`<div class="adbar" id="adbar" hidden><button type="button" class="adbar-x" aria-label="Fechar anúncio">×</button><div id="div-gpt-ad-hub-bar"></div></div>`);document.body.appendChild(bar);
    bar.querySelector(".adbar-x").addEventListener("click",()=>{try{sessionStorage.setItem("fen_hub_bar_closed","1")}catch(e){}bar.remove();document.body.style.paddingBottom="";googletag.cmd.push(()=>{const s=slots["div-gpt-ad-hub-bar"];if(s){googletag.destroySlots([s]);delete slots["div-gpt-ad-hub-bar"]}})})}
  if(PREVIEW){document.querySelectorAll(".gam-rail").forEach(r=>r.setAttribute("data-preview",""));if(bar){bar.hidden=false;bar.querySelector("#div-gpt-ad-hub-bar").style.cssText="min-height:50px;display:grid;place-items:center;color:#ffd40099;font:10px system-ui;letter-spacing:.15em;text-transform:uppercase";bar.querySelector("#div-gpt-ad-hub-bar").textContent="ad 728×90 / 320×50";document.body.style.paddingBottom="58px"}return}
  const s=document.createElement("script");s.async=true;s.crossOrigin="anonymous";s.src="https://securepubads.g.doubleclick.net/tag/js/gpt.js";document.head.appendChild(s);
  googletag.cmd.push(()=>{
    googletag.pubads().addEventListener("slotRenderEnded",e=>{const id=e.slot.getSlotElementId(),node=document.getElementById(id);if(!node)return;
      const rail=node.closest(".gam-rail"),b=node.closest(".adbar"),inl=node.closest(".adinline");
      if(rail)rail.style.display=e.isEmpty?"none":"";
      if(b){b.hidden=e.isEmpty;document.body.style.paddingBottom=e.isEmpty?"":b.offsetHeight+"px"}
      if(inl)inl.hidden=e.isEmpty});
    for(const [id,side] of [["div-gpt-ad-fenomeno-rail-left","l"],["div-gpt-ad-fenomeno-rail-right","r"]])slots[id]=googletag.defineSlot(RAIL,[[160,600]],id).addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();googletag.enableServices();
    googletag.display("div-gpt-ad-fenomeno-rail-left");googletag.display("div-gpt-ad-fenomeno-rail-right");
    if(bar)defineBanner("div-gpt-ad-hub-bar")});
}
/* banner no fim da partida / meio da home: pausa natural, o momento de maior atenção. Devolve o nó pra quem chamou encaixar na tela. */
export function inlineAd(where){
  const now=Date.now();if(where!=="home"&&now-lastInline<MIN_GAP)return el('<div hidden></div>');lastInline=now;
  const id="div-gpt-ad-hub-in-"+(++seq),box=el(`<div class="adinline" ${PREVIEW?"":"hidden"} aria-label="Publicidade"><small>PUBLICIDADE</small><div id="${id}"></div></div>`);
  if(PREVIEW){const d=box.querySelector("#"+id);d.style.cssText="min-height:90px;display:grid;place-items:center;color:#ffd40099;font:10px system-ui;letter-spacing:.15em;text-transform:uppercase;outline:2px dashed #ffd40080";d.textContent="ad "+where}
  else setTimeout(()=>{if(document.getElementById(id))defineBanner(id)},0);
  return box;
}
/* renovação dos anúncios fixos: só em pausa natural, só com a aba à vista, nunca em menos de 60s */
export function adsRoute(){if(!ready||PREVIEW)return;sweep();
  const now=Date.now();if(document.hidden||now-last<MIN_GAP)return;last=now;
  googletag.cmd.push(()=>{const live=Object.entries(slots).filter(([id,s])=>s&&!id.includes("-in-")).map(([,s])=>s);if(live.length)googletag.pubads().refresh(live)})}
export const adsBreak=adsRoute;
