import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import vm from 'node:vm';

const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=resolve(dirname(new URL(import.meta.url).pathname),'..');
const file=resolve(root,'app/v2/error.tsx');
const mod={exports:{}};
const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(code,{module:mod,exports:mod.exports,process,require});
const V2Error=mod.exports.default;
function render(){return renderToStaticMarkup(React.createElement(V2Error,{error:Object.assign(new Error('private-marker provider.internal.example'),{digest:'private-digest-marker'}),reset:()=>{}}));}

test('production error boundary does not render raw exception or digest',()=>{
 const previous=process.env.NODE_ENV;
 try{process.env.NODE_ENV='production';const html=render();assert.doesNotMatch(html,/private-marker|private-digest-marker/);}
 finally{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;}
});

test('development error boundary retains explicitly test-only diagnostics',()=>{
 const previous=process.env.NODE_ENV;
 try{process.env.NODE_ENV='development';const html=render();assert.match(html,/private-marker/);assert.match(html,/private-digest-marker/);}
 finally{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;}
});
