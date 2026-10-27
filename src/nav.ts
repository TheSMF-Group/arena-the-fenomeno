// @ts-nocheck
import {META,HOME_TITLE,HOME_DESC,SITE,pathOf} from "./meta";
import {pageview} from "./track";
import {adsRoute} from "./ads";
const norm=p=>p.length>1?p.replace(/\/$/,""):p;
let first=true;
const set=(sel,attr,v)=>{const e=document.querySelector(sel);e&&e.setAttribute(attr,v)};
/* cada tela da Central tem endereço próprio: /, /jogos/<slug>. Troca de jogo = pageview novo + anúncio renovado. */
export function route(id){
  const path=id==="home"?"/":pathOf(id),m=META[id];
  const title=m?m.title:HOME_TITLE,desc=m?m.seo:HOME_DESC,url=SITE+(path==="/"?"/":path);
  const changed=norm(location.pathname)!==path;
  if(changed||location.hash){const to=path+location.search;if(first)history.replaceState(null,"",to);else history.pushState(null,"",to)}
  document.title=title;set('meta[name="description"]',"content",desc);set('link[rel="canonical"]',"href",url);
  set('meta[property="og:title"]',"content",title);set('meta[property="og:description"]',"content",desc);set('meta[property="og:url"]',"content",url);
  if(!first&&changed){pageview(path,title);adsRoute()}
  first=false;
}
/* /jogos/<slug> -> id do jogo; a "/#id" antiga continua abrindo o jogo */
export function idFromLocation(ID_BY_SLUG,GAMES){
  const m=norm(location.pathname).match(/^\/jogos\/([^/]+)$/);
  if(m&&ID_BY_SLUG[m[1]])return ID_BY_SLUG[m[1]];
  const h=location.hash.slice(1);return GAMES[h]?h:null;
}
