import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockPolicies } from "@/lib/data/mock";
import { rewritePolicyParagraph } from "@/lib/rag/openai";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit=checkRateLimit(requestKey(req,"rewrite"),20,60_000);if(!limit.ok)return NextResponse.json({error:"재작성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요."},{status:429});
    const { policyId, policyTitle, text, action } = await req.json();
    if (!policyId || !policyTitle || !text || !["easier","detailed","shorter","example"].includes(action)) return NextResponse.json({ error: "재작성에 필요한 정보가 부족합니다." }, { status: 400 });
    const admin = createAdminClient();
    const { data, error } = admin ? await admin.from("policies").select("file_search_store_id").eq("id", policyId).maybeSingle() : { data: null, error: null };
    if (error) throw error;
    const storeName = data?.file_search_store_id ?? mockPolicies.find(p=>p.id===policyId)?.fileSearchStoreId;
    if (!storeName) return NextResponse.json({ error: "이 정책의 공식 문서가 아직 색인되지 않았습니다." }, { status: 400 });
    const result = await rewritePolicyParagraph({ storeName, policyTitle, text:String(text).slice(0,6000), action });
    return NextResponse.json(result);
  } catch (e: any) { return NextResponse.json({ error: e.message ?? "문단 재작성 중 오류가 발생했습니다." }, { status: 500 }); }
}
