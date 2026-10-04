import { NextRequest, NextResponse } from "next/server";
import { classifyTerritory } from "@/lib/special-territory-geometry";
import { SPECIAL_TERRITORY_BOUNDARIES } from "@/lib/special-territory-boundaries";
export async function POST(request:NextRequest) {
  try {
    const {positions}=await request.json();
    if(!Array.isArray(positions)||positions.length>2||!positions.length)throw new Error("INVALID");
    const territories=positions.map(position=>classifyTerritory(position,SPECIAL_TERRITORY_BOUNDARIES));
    return NextResponse.json({territories,mode:territories.some(Boolean)?"dual":"standard"});
  } catch {return NextResponse.json({error:"Не удалось определить тарифную зону по координатам"},{status:400});}
}
