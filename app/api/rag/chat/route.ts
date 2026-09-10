import { NextResponse } from "next/server";
import { askPolicyQuestion } from "@/lib/rag/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockPolicies } from "@/lib/data/mock";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(req:Request){try{const limit=checkRateLimit(requestKey(req,"chat"),20,60_000);if(!limit.ok)return NextResponse.json({error:"질문 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."},{status:429});const {policyId,policyTitle,question}=await req.json();if(!policyId||!policyTitle||!String(question||"").trim())return NextResponse.json({error:"질문을 입력해주세요."},{status:400});const admin=createAdminClient();let storeName:string|undefined;if(admin){const {data}=await admin.from("policies").select("file_search_store_id").eq("id",policyId).maybeSingle();storeName=data?.file_search_store_id??undefined;}if(!storeName){storeName=mockPolicies.find(p=>p.id===policyId)?.fileSearchStoreId;}if(!storeName)return NextResponse.json({error:"이 정책의 공식 문서가 아직 색인되지 않았습니다."},{status:400});const result=await askPolicyQuestion({storeName,policyTitle,question:String(question).slice(0,1000)});return NextResponse.json({answer:result.text,citations:result.citations});}catch(e:any){return NextResponse.json({error:e.message??"질문 처리 중 오류가 발생했습니다."},{status:500})}}
