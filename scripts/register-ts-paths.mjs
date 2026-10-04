// Node's native TypeScript runner does not resolve Next's @/ alias or extensionless imports.
import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier.startsWith('@/'))specifier=pathToFileURL(path.join(root,specifier.slice(2))).href;
  try{return nextResolve(specifier,context);}catch(error){
    if(specifier.startsWith('.')||specifier.startsWith('file:')){
      const url=new URL(specifier,context.parentURL);const file=fileURLToPath(url);
      for(const extension of ['.ts','.tsx','.js','/index.ts'])if(existsSync(file+extension))return nextResolve(url.href+extension,context);
    }
    if(specifier==='next/server')return nextResolve('next/server.js',context);
    throw error;
  }
}});
