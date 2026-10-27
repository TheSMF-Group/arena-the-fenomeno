// @ts-nocheck
/* Analytics do hub: mesma propriedade GA4 do www (G-KELHFXW0JS), então os pageviews por jogo e a origem (utm_source=jogue) aparecem no mesmo relatório. */
const GA="G-KELHFXW0JS";
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments)}
if(!window.__gaBoot){window.__gaBoot=1;gtag("js",new Date());gtag("config",GA);
  const s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+GA;document.head.appendChild(s)}
/* a Central é um app de uma página só: cada troca de tela vira um pageview de verdade, com o caminho do jogo */
export function pageview(path,title){gtag("event","page_view",{page_path:path,page_title:title,page_location:location.origin+path})}
export function ev(name,params){gtag("event",name,params||{})}
