const aliases=new Map([
 ['m4-south','m4'],['m4-candidate','m4'],['m4-dzok','krasnodar-west-bypass'],
 ['m12-candidate','m12'],['ufa','ufa-east'],['heihe','amur-bridge'],
 ['kazan','voznesensky'],['udmurtia','udmurt-bridges'],
]);
function matrixProductId(road){return aliases.get(road)??road;}
module.exports={matrixProductId};
