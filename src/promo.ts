// @ts-nocheck
/* Promoção cruzada: o The Fenômeno (carro-chefe) em destaque e os outros jogos do grupo. Todos abrem em aba nova pra não perder a Central,
   com utm_source=jogue pra o GA4 mostrar quanto tráfego a Central manda pra cada um. */
const u=(base,medium,campaign)=>`${base}/?utm_source=jogue&utm_medium=${medium}&utm_campaign=${campaign}`;
export const FLAGSHIP={url:"https://thefenomeno.com",title:"THE FENÔMENO",kick:"O JOGO PRINCIPAL",
  text:"Roube os craques, viva a carreira inteira e descubra se você entra entre os maiores de todos os tempos. Do primeiro contrato à Copa."};
export const OTHERS=[
  {url:"https://conecte.thefenomeno.com",title:"CONECTE OS FENÔMENOS",text:"Ligue dois craques por uma cadeia de companheiros. Quantos passos você precisa?"},
  {url:"https://maisoumenos.thefenomeno.com",title:"MAIS OU MENOS",text:"Esse craque vale mais ou menos? Acerte e emende a sequência."},
  {url:"https://kingsleague.thefenomeno.com",title:"KINGS LEAGUE",text:"A Kings League dentro do PES 2014: times, elencos e regras da liga."}
];
const a=(url,medium,campaign,cls,inner)=>`<a class="${cls}" href="${u(url,medium,campaign)}" target="_blank" rel="noopener">${inner}</a>`;
/* bloco grande da home, depois da grade de jogos */
export function promoHome(){
  return`<section class="promo" aria-label="Mais do The Fenômeno">
    ${a(FLAGSHIP.url,"home","flagship","flagship",`<span class="fk">${FLAGSHIP.kick}</span><span class="d ft">${FLAGSHIP.title}</span><p>${FLAGSHIP.text}</p><span class="go">JOGAR A CARREIRA →</span>`)}
    <div class="promo-grid">${OTHERS.map(o=>a(o.url,"home",o.title.toLowerCase().replace(/\W+/g,"-"),"pcard",`<span class="d">${o.title}</span><p>${o.text}</p><span class="go">ABRIR →</span>`)).join("")}</div></section>`}
/* faixa pequena depois da partida: o carro-chefe, contextual ao jogo que acabou */
export function promoMini(game){
  return a(FLAGSHIP.url,"resultado",game||"jogo","promo-mini",`<span class="d">THE FENÔMENO</span><span>Gostou? Agora viva a carreira inteira.</span><b>JOGAR →</b>`)}
