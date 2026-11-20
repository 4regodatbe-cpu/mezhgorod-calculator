import {compareCorridors} from './compare.mjs';
export const places=[{id:'a',label:'Точка А — особая территория',special:true},{id:'b',label:'Точка Б — особая территория',special:true},{id:'ordinary',label:'Точка В — обычная территория',special:false}];
// Deliberately synthetic: these are interface examples, never geographic evidence.
export const scenarios={
 near:{label:'Близкие точки: объезд невыгоден',direct:{seconds:10800,specialSeconds:10800,meters:200000,ordinaryKm:0,specialKm:200,tollAmount:0},external:{seconds:43200,specialSeconds:7200,meters:900000,ordinaryKm:770,specialKm:130,tollAmount:null}},
 far:{label:'Дальний проезд: объезд имеет смысл',direct:{seconds:25200,specialSeconds:25200,meters:450000,ordinaryKm:0,specialKm:450,tollAmount:0},external:{seconds:32400,specialSeconds:7200,meters:650000,ordinaryKm:510,specialKm:140,tollAmount:1200}},
 unavailable:{label:'Второй маршрут не получен',direct:{seconds:10800,specialSeconds:10800,meters:200000,ordinaryKm:0,specialKm:200,tollAmount:0},external:null},
};
export function makeView({from,to,scenario='near',selected=null}){
 const pair=[from,to].map(id=>places.find(p=>p.id===id));
 if(pair.some(p=>!p)||from===to)return {status:'enter-addresses',showSwitch:false};
 if(!pair.every(p=>p.special))return {status:'ordinary-demo',showSwitch:false};
 const data=scenarios[scenario];if(!data)throw Error('Unknown scenario');
 const candidates=['direct','external'].flatMap(id=>data[id]?[{id,...data[id],verified:true}]:[]);
 const recommendation=compareCorridors(candidates);
 const chosen=selected??recommendation.selected??'direct';
 if(!['direct','external'].includes(chosen))throw Error('Unknown route mode');
 const active=data[chosen];
 if(!active)return {status:'unavailable',showSwitch:true,selected:chosen,recommended:recommendation.selected};
 const transfer=Math.round(active.ordinaryKm*25+active.specialKm*70);
 const other=data[chosen==='direct'?'external':'direct'];
 const total=active.tollAmount===null?null:transfer+active.tollAmount;
 const otherTotal=other&&other.tollAmount!==null?Math.round(other.ordinaryKm*25+other.specialKm*70)+other.tollAmount:null;
 return {status:'ready',showSwitch:true,selected:chosen,recommended:recommendation.selected,active,transfer,total,
  deltaSeconds:other?active.seconds-other.seconds:null,deltaPrice:total!==null&&otherTotal!==null?total-otherTotal:null};
}
