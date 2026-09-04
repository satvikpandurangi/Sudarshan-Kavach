import type { RiskLevel } from "./types";

type AiFinding = { classification?: string; explanation?: string; warningSigns?: string[]; evidence?: string[]; recommendedActions?: string[]; confidence?: number };
const schemaHint = `Return ONLY valid JSON with keys: classification (string), explanation (simple string), warningSigns (string array), evidence (string array), recommendedActions (string array), confidence (number 0 to 1). Do not state certainty.`;
const prompt = (input:string, inputType:string) => `You are a digital-safety analyst. Assess this ${inputType} content for phishing, impersonation, payment fraud, credential theft, unsafe downloads, fake jobs, and investment scams. Explain in simple language for an Indian consumer. Do not browse or open any link. ${schemaHint}\n\nSubmitted content:\n${input}`;

function clean(data:unknown): AiFinding | null { if (!data || typeof data !== "object") return null; const v=data as AiFinding; return { classification:typeof v.classification==="string"?v.classification:undefined, explanation:typeof v.explanation==="string"?v.explanation:undefined, warningSigns:Array.isArray(v.warningSigns)?v.warningSigns.filter(x=>typeof x==="string").slice(0,5):undefined, evidence:Array.isArray(v.evidence)?v.evidence.filter(x=>typeof x==="string").slice(0,5):undefined, recommendedActions:Array.isArray(v.recommendedActions)?v.recommendedActions.filter(x=>typeof x==="string").slice(0,5):undefined, confidence:typeof v.confidence==="number"?Math.max(0,Math.min(1,v.confidence)):undefined }; }

export async function getAiFinding(input:string,inputType:string):Promise<{finding:AiFinding|null;provider:"OpenAI"|"Google Gemini"|"Sudarshan Heuristic Engine"}> {
  if(process.env.OPENAI_API_KEY){
    const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5",input:prompt(input,inputType),text:{format:{type:"json_object"}},store:false})});
    if(res.ok){const data=await res.json() as {output_text?:string};try{return{finding:clean(JSON.parse(data.output_text||"{}")),provider:"OpenAI"}}catch{/* use local engine */}}
  }
  if(process.env.GEMINI_API_KEY){
    const model=process.env.GEMINI_MODEL||"gemini-2.0-flash";
    const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt(input,inputType)}]}],generationConfig:{responseMimeType:"application/json"}})});
    if(res.ok){const data=await res.json() as {candidates?:{content?:{parts?:{text?:string}[]}}[]};try{return{finding:clean(JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text||"{}")),provider:"Google Gemini"}}catch{/* use local engine */}}
  }
  return {finding:null,provider:"Sudarshan Heuristic Engine"};
}
