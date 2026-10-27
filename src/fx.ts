// @ts-nocheck
/* confete de vitória: reaproveita .confetti-piece; some sozinho; respeita prefers-reduced-motion */
export function burst(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const el=document.createElement("div");el.className="fxburst";el.setAttribute("aria-hidden","true");
  el.innerHTML=Array.from({length:46},(_,i)=>`<i class="confetti-piece" style="left:${(Math.random()*100).toFixed(1)}%;width:${6+Math.floor(Math.random()*6)}px;height:${10+Math.floor(Math.random()*9)}px;background:${["#ffd400","#00c46a","#fff","#ffd400"][i%4]};animation-duration:${(1.6+Math.random()*1.4).toFixed(2)}s;animation-delay:${(Math.random()*.5).toFixed(2)}s"></i>`).join("");
  document.body.appendChild(el);setTimeout(()=>el.remove(),3600);
  try{navigator.vibrate&&navigator.vibrate([18,40,18])}catch(e){}
}
