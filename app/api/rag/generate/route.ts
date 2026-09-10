import { NextResponse } from "next/server";
import { generatePolicyArticle } from "@/lib/rag/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockPolicies } from "@/lib/data/mock";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(req:Request){try{const limit=checkRateLimit(requestKey(req,"generate"),10,60_000);if(!limit.ok)return NextResponse.json({error:"요청이 너무 많습니다. 잠시 후 다시 시도해주세요."},{status:429});const body=await req.json();const {policyId,policyTitle,level,style}=body;if(!policyId||!policyTitle||!["quick","easy","detailed"].includes(level))return NextResponse.json({error:"생성 요청 정보가 올바르지 않습니다."},{status:400});let storeName:string|undefined;const admin=createAdminClient();if(admin){const {data}=await admin.from("policies").select("file_search_store_id").eq("id",policyId).maybeSingle();storeName=data?.file_search_store_id??undefined;}if(!storeName){storeName=mockPolicies.find(p=>p.id===policyId)?.fileSearchStoreId;}if(!storeName)return NextResponse.json({error:"이 정책의 공식 PDF가 아직 OpenAI Vector Store에 색인되지 않았습니다. 관리자에게 정책 자료 등록을 요청해주세요."},{status:400});const article=await generatePolicyArticle({storeName,policyTitle,level,style});return NextResponse.json({article});}catch(e:any){return NextResponse.json({error:e.message??"블로그 생성 중 오류가 발생했습니다."},{status:500})}}
