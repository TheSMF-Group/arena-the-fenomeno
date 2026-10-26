// @ts-nocheck
import {loadScript} from "./games/futgeo";
export const MQTT_LIB="https://cdnjs.cloudflare.com/ajax/libs/mqtt/5.10.1/mqtt.min.js",VL_BROKERS=["wss://broker.emqx.io:8084/mqtt","wss://broker.hivemq.com:8884/mqtt"];
export function vlPeerId(){let id=null;try{id=sessionStorage.getItem("fen:vlpeer")}catch(e){}if(!id){id="p"+Math.random().toString(36).slice(2,12);try{sessionStorage.setItem("fen:vlpeer",id)}catch(e){}}return id}
export async function mqttRoom(){await loadScript(MQTT_LIB);if(!window.mqtt)return null;
  return{async join(name){const me=vlPeerId(),base=`thefenomeno-jogos/v1/${name}/p/`;
    const client=await new Promise((ok,no)=>{let i=0;const next=()=>{if(i>=VL_BROKERS.length)return no({code:"upstream_error"});
      const c=mqtt.connect(VL_BROKERS[i++],{clientId:"fen_"+me+"_"+Math.random().toString(36).slice(2,6),clean:true,connectTimeout:6000,reconnectPeriod:2000,keepalive:20,will:{topic:base+me,payload:"",retain:true,qos:1}});
      let done=false;const bad=()=>{if(done)return;done=true;clearTimeout(t);c.end(true);next()};const t=setTimeout(bad,7000);
      c.once("connect",()=>{if(done)return;done=true;clearTimeout(t);ok(c)});c.once("error",bad)};next()});
    const peers=new Map(),hs=new Set();let mine={};
    const snap=()=>Object.freeze([{peer:me,by:null,isMe:true,sameTab:true,kind:"viewer",guest:false,presence:mine},...peers.values()]);
    const fire=()=>{const ps=snap();hs.forEach(h=>h({peers:ps,joined:[],left:[],updated:[]}))};
    client.on("message",(t,buf)=>{const id=t.slice(base.length);if(id===me||!/^[a-z0-9]{4,20}$/.test(id))return;const txt=buf.toString();
      if(!txt)peers.delete(id);else{try{const pr=JSON.parse(txt);if(pr&&typeof pr==="object")peers.set(id,{peer:id,by:null,isMe:false,sameTab:false,kind:"viewer",guest:false,presence:pr})}catch(e){}}fire()});
    client.subscribe(base+"+",{qos:1});
    return{name,presence:async patch=>{mine={...mine,...patch};client.publish(base+me,JSON.stringify(mine),{retain:true,qos:1});fire()},peers:snap,
      onPeers:h=>{hs.add(h);setTimeout(fire,0);return()=>hs.delete(h)},
      leave:async()=>{try{client.publish(base+me,"",{retain:true,qos:1},()=>client.end())}catch(e){client.end(true)}}}}}}
