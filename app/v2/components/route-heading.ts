import type {Leg,Result} from './types';
export function v3RouteHeading(result:Result,leg:Leg){
 if(!result.specialEndpoint)return 'Выбран маршрут с минимальным временем';
 if(result.specialOnly)return 'Выбран маршрут по новым территориям';
 const corridor=leg.corridor??result.preferredCorridor;
 if(corridor==='mainland')return 'Выбран маршрут через материк';
 if(corridor==='crimea')return 'Выбран маршрут через Крым';
 return 'Выбран маршрут с учётом особых территорий';
}
