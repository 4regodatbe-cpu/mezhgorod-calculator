import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {compileVerifiedM4Tariffs} from "./m4-pvp-compiler.mjs";
const home=new URL("./",import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,home),"utf8"));
const template=read("matrix/m4-pvp-corridors.json");
const intake=read("matrix/m4-verified-source-intake.json");
const result=compileVerifiedM4Tariffs(template,intake);
// NO files are written and the source template is NEVER overwritten. 
// The caller must separately review the result before checking it into Git.
if(process.argv.includes("--json"))console.log(JSON.stringify(result,null,2));
else console.log(JSON.stringify({status:"diagnostic_only",verifiedPriceCells:result.priceCells.length,knownPvps:result.knownPvps.length,sourceIntakeRecords:intake.records.length,actualOperatorVerificationRequired:result.priceCells.length===0},null,2));
