import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const files=new Map([['/','demo.html'],['/demo.html','demo.html'],['/demo-model.mjs','demo-model.mjs'],['/compare.mjs','compare.mjs']]);
const server=createServer(async(req,res)=>{const path=files.get(new URL(req.url,'http://localhost').pathname);if(!path){res.writeHead(404).end();return;}try{const body=await readFile(new URL(path,import.meta.url));res.writeHead(200,{'content-type':path.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8','cache-control':'no-store'}).end(body);}catch{res.writeHead(500).end();}});
server.listen(3188,'127.0.0.1',()=>console.log('Local demo: http://127.0.0.1:3188'));
