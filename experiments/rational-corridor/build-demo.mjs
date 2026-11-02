import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL(name,import.meta.url),'utf8');
const [html,compare,model]=await Promise.all([read('demo.html'),read('compare.mjs'),read('demo-model.mjs')]);
const source=[compare.replaceAll('export ',''),model.replace(/^import .*;\n/m,'').replaceAll('export ','')].join('\n');
const output=html.replace("import {places,makeView} from './demo-model.mjs';",source);
await writeFile(new URL('demo-preview.html',import.meta.url),output);
console.log('Standalone preview: experiments/rational-corridor/demo-preview.html');
