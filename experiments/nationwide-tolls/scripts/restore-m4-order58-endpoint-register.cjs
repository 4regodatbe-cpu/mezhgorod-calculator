const fs=require('node:fs');
const path=require('node:path');

function restoreSelectedM4Rows(register,sourceRows){
 const byKey=new Map(sourceRows.map(row=>[`${row.road}|${row.from}|${row.to}|${row.profile}`,row]));
 const used=new Set();
 const selected=register.selected.map(row=>{
  if(row.road!=='m4-south'&&row.road!=='m4-dzok')return row;
  const key=`${row.road}|${row.from}|${row.to}|${row.profile}`;
  const source=byKey.get(key);
  if(!source)throw new Error(`Missing immutable Order 58 source row ${key}`);
  used.add(key);
  return source;
 });
 if(used.size!==byKey.size)throw new Error(`Order 58 source coverage mismatch: restored ${used.size}/${byKey.size}`);
 return {...register,selected};
}

function keepExternalControlsUnknown(active){
 return {...active,rows:active.rows.map(row=>row.verification?.includes('candidate Yandex actual UI endpoint control')
  ?{...row,runtimeEligible:false,priceConfirmation:'unknown',disposition:'audit-only-external-control-unreconciled',currentTariffReason:'No directed official product vector; external total is not an operator fare.'}
  :row)};
}

function writeRestoredRegister(root){
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 // Stage W flattened vehicle-category rows into supposed transponder columns.
 // Keep that snapshot as historical evidence, but never use it for fares.
 // Rebuild from immutable reviewed source matrices and restore selected M4
 // south/DZOK rows from the saved published-base snapshot.
 const compiled=require('./build-m4-endpoint-register.cjs').compileEndpoints(
  read('TARIFF_VECTOR_MATRIX_2026-10-12.json'),
  read('M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json'),
  read('M4_OPERATOR_ENDPOINT_CELLS.json'));
 const active=keepExternalControlsUnknown(compiled);
 const baseline=read('source-snapshots/m4-order58-v3-selected-rows-from-d60.json');
 const selected=restoreSelectedM4Rows(read('TARIFF_SELECTION_REGISTER.json'),baseline.rows);
 fs.writeFileSync(path.join(root,'M4_ACTIVE_ENDPOINT_REGISTER.json'),JSON.stringify(active,null,2)+'\n');
 fs.writeFileSync(path.join(root,'TARIFF_SELECTION_REGISTER.json'),JSON.stringify(selected,null,2)+'\n');
 console.log(JSON.stringify({activeEndpointRows:active.rows.length,selectedM4Rows:baseline.rows.length,restoredFrom:'d60e733313860d2412d8be64f4be10ef71f7de28'}));
}

module.exports={keepExternalControlsUnknown,restoreSelectedM4Rows,writeRestoredRegister};
if(require.main===module)writeRestoredRegister(path.resolve(__dirname,'..'));
