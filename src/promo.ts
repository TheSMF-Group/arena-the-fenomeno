// @ts-nocheck
import {BODEHEAD} from "./core";
/* Jogos do grupo The Fenômeno dentro da vitrine, junto com os da Central. Abrem em aba nova pra não perder o jogador daqui,
   com utm_source=jogue pra o GA4 mostrar quanto tráfego a Central manda pra cada um. */
const u=(base,medium,campaign)=>`${base}/?utm_source=jogue&utm_medium=${medium}&utm_campaign=${campaign}`;
export const FLAGSHIP={url:"https://thefenomeno.com"};
export const EXT=[
  {k:"fenomeno",url:"https://thefenomeno.com",name:"THE FENÔMENO",tag:"O JOGO PRINCIPAL",mins:"carreira inteira",feat:true,
    desc:"Roube os craques, viva a carreira do primeiro contrato à Copa e descubra se você entra entre os maiores de todos os tempos."},
  {k:"conecte",url:"https://conecte.thefenomeno.com",name:"CONECTE OS FENÔMENOS",tag:"JOGO DO GRUPO",mins:"3 min",
    desc:"Ligue dois craques por uma cadeia de companheiros de time. Em quantos passos você chega?"},
  {k:"maisoumenos",url:"https://maisoumenos.thefenomeno.com",name:"MAIS OU MENOS",tag:"JOGO DO GRUPO",mins:"2 min",
    desc:"Esse craque vale mais ou menos que o outro? Acerte e emende a maior sequência."}];
const art=k=>k==="fenomeno"
  ?`<div class="x-fen"><img src="${BODEHEAD}" alt=""><div><b>99</b><small>OVR</small></div></div>`
  :k==="conecte"
  ?`<div class="x-con"><i></i><u></u><i class="q">?</i><u></u><i></i></div>`
  :`<div class="x-mom"><span class="up">▲ MAIS</span><b>1.250</b><span class="dn">▼ MENOS</span></div>`;
export function extCard(e,medium="grade"){
  return`<a class="gcard ext${e.feat?" feat":""}" href="${u(e.url,medium,e.k)}" target="_blank" rel="noopener" data-ext="${e.k}"><span class="tag ext-tag">${e.tag}</span>
    <div class="art">${art(e.k)}</div><div class="meta"><span class="d">${e.name}</span><span class="mins">${e.mins}</span><p>${e.desc}</p>
    <div class="play"><span class="go">${e.feat?"JOGAR A CARREIRA":"ABRIR"} ↗</span><span class="chip">${e.feat?"jogo principal":"site do grupo"}</span></div></div></a>`}
/* card da vitrine que leva pra sala ao vivo (pra streamers) */
export function liveCard(){
  return`<a class="gcard live" href="/ao-vivo"><span class="tag ext-tag">PRA STREAMERS</span><div class="art"><div class="x-live"><i></i><b>AO VIVO</b></div></div><div class="meta"><span class="d">SALA AO VIVO</span><span class="mins">chat inteiro jogando</span><p>Crie uma sala, mande o link pro chat e jogue valendo placar: cada um no seu celular.</p><div class="play"><span class="go">CRIAR SALA</span><span class="chip">grátis</span></div></div></a>`}
/* faixa pequena depois da partida: o carro-chefe */
export function promoMini(game){
  return`<a class="promo-mini" href="${u(FLAGSHIP.url,"resultado",game||"jogo")}" target="_blank" rel="noopener"><span class="d">THE FENÔMENO</span><span>Gostou? Agora viva a carreira inteira.</span><b>JOGAR →</b></a>`}
