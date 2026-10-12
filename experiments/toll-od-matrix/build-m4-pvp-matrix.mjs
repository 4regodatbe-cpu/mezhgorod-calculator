import {readFileSync} from "node:fs";
const home=new URL("./",import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,home),"utf8"));
import {compileVerifiedM4Tariffs} from "./m4-pvp-compiler.mjs";
const template=read("matrix/m4-pvp-corridors.json");
const intake=read("matrix/m4-verified-source-intake.json");
const result=compileVerifiedM4Tariffs(template,intake);
// No files are written. Review compiled rows before checking them into the sandbox matrix.
if(process.argv.includes("--json"))console.log(JSON.stringify(result,null,2));
else console.log(JSON.stringify({status:"sandbox_only",verifiedSpanCells:result.spanCells.length,knownPvps:result.knownPvps.length,sourceIntakeRecords:intake.records.length,needsVerifiedSpanSources:result.spanCells.length===0},null,2));
