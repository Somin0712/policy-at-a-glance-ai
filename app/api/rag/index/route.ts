import { NextResponse } from "next/server";
import { writeFile,unlink } from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";
import { indexPolicyDocument } from "@/lib/rag/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-auth";

function slugify(v:string){return v.toLowerCase().trim().replace(/[^a-z0-9가-힣]+/g,"-").replace(/(^-|-$)/g,"").slice(0,60)||`policy-${Date.now()}`}
export async function POST(req:Request){
  const user=await getAdminUser();
  if(!user)return NextResponse.json({error:"관리자 권한이 필요합니다."},{status:403});
  let tmp="";
  try{
    const form=await req.formData();const file=form.get("file") as File|null;const title=String(form.get("title")||"").trim();const category=String(form.get("category")||"").trim();const agency=String(form.get("agency")||"").trim();const officialUrl=String(form.get("officialUrl")||"").trim();
    if(!file||!title||!agency)return NextResponse.json({error:"정책명, 소관기관, PDF 파일이 필요합니다."},{status:400});
    if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf"))return NextResponse.json({error:"PDF 파일만 등록할 수 있습니다."},{status:400});
    if(file.size>20*1024*1024)return NextResponse.json({error:"PDF는 20MB 이하만 등록할 수 있습니다."},{status:400});
    tmp=path.join(os.tmpdir(),`policy-${Date.now()}-${crypto.randomUUID()}.pdf`);
    await writeFile(tmp,Buffer.from(await file.arrayBuffer()));
    const storeName=await indexPolicyDocument(tmp,file.name);
    const admin=createAdminClient();let policyId=slugify(title);
    if(admin){const {data,error}=await admin.from("policies").upsert({id:policyId,title,category,agency,official_url:officialUrl||null,source_file_name:file.name,file_search_store_id:storeName,last_verified_at:new Date().toISOString().slice(0,10)},{onConflict:"id"}).select("id").single();if(error)throw error;policyId=data.id;}
    return NextResponse.json({ok:true,policyId,storeName});
  }catch(e:any){return NextResponse.json({error:e.message??"문서 색인 중 오류가 발생했습니다."},{status:500})}finally{if(tmp)await unlink(tmp).catch(()=>{})}
}
