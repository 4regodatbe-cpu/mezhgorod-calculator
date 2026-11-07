export function normalize(value:string):string;
export function createLocalGazetteer(data:unknown):{
 search(query:string,options?:{limit?:number;maxScan?:number}):import('./local-gazetteer-shards.mjs').LocalSearchResult;
 recordCount:number;postingCount:number;
};
