"use client";
import { useEffect, useRef, useState } from "react";
import { activeOverride, touchSession, type CalculatorMode, type TariffSession } from "@/lib/tariff-session";
import type { Place } from "./types";
const KEY="mezhgorod-v2-mode-session";
export function useTariffMode(from:Place,to:Place) {
  const [automatic,setAutomatic]=useState<CalculatorMode>("standard");
  const [manual,setManual]=useState<CalculatorMode|null>(null);
  const session=useRef<TariffSession>({override:null,lastActivity:0});
  const persist=()=>{try{sessionStorage.setItem(KEY,JSON.stringify(session.current));}catch{}};
  useEffect(()=>{
    try {
      const saved=JSON.parse(sessionStorage.getItem(KEY)??"null");
      if(saved && (saved.override===null||saved.override==="standard"||saved.override==="dual") && Number.isFinite(saved.lastActivity)) session.current=saved;
    }catch{}
    const activity=()=>{session.current=touchSession(session.current,Date.now());setManual(session.current.override);persist();};
    activity();
    window.addEventListener("pointerdown",activity);window.addEventListener("keydown",activity);window.addEventListener("focus",activity);window.addEventListener("scroll",activity,{passive:true});
    return ()=>{window.removeEventListener("pointerdown",activity);window.removeEventListener("keydown",activity);window.removeEventListener("focus",activity);window.removeEventListener("scroll",activity);};
  },[]);
  useEffect(()=>{
    const positions=[from.position,to.position].filter(Boolean);
    if(!positions.length){setAutomatic("standard");return;}
    const controller=new AbortController();
    void fetch("/api/v2/classify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({positions}),signal:controller.signal})
      .then(async response=>{if(!response.ok)return;const data=await response.json();if(!controller.signal.aborted)setAutomatic(data.mode);}).catch(()=>undefined);
    return ()=>controller.abort();
  },[from.position,to.position]);
  const setMode=(mode:CalculatorMode)=>{session.current={override:mode,lastActivity:Date.now()};setManual(mode);persist();};
  const requestMode=()=>{
    const override=activeOverride(session.current,Date.now());
    session.current={override,lastActivity:Date.now()};setManual(override);persist();
    return {mode:override??automatic,modeOverride:override!==null};
  };
  return {mode:manual??automatic,setMode,requestMode,onServerMode:setAutomatic};
}
