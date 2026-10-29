export interface LocalItem { id:string; title:string; label:string; region:string; position:{lat:number;lng:number}; qualityFlags:string[]; }
export interface LocalSearchResult {items:LocalItem[]; truncated:boolean; hasMore?:boolean; matchingRecords?:number; sourceDate?:string; license?:{name:string;url:string;attribution:string};}
export interface LocalLoader {search(query:string,options?:{signal?:AbortSignal;limit?:number;maxScan?:number}):Promise<LocalSearchResult>;stats():{residentShards:number;pending:number;loads:number};}
export function openShardLoader(directory:string):Promise<LocalLoader>;
export function createShardLoader(manifest:unknown,loadBytes:(file:string)=>Promise<Buffer>):LocalLoader;
