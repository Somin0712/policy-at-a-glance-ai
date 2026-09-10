import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockPolicies } from "@/lib/data/mock";

export async function GET(){
  const admin=createAdminClient();
  if(!admin) return NextResponse.json({policies:mockPolicies,source:"local"});
  const {data,error}=await admin.from("policies").select("id,title,category,agency,short_description,official_url,source_file_name,last_verified_at,file_search_store_id").order("created_at",{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({policies:(data??[]).map((p:any)=>({id:p.id,title:p.title,category:p.category,agency:p.agency,shortDescription:p.short_description??"",officialUrl:p.official_url??undefined,sourceFileName:p.source_file_name??undefined,lastVerifiedAt:p.last_verified_at??undefined,fileSearchStoreId:p.file_search_store_id??undefined})),source:"supabase"});
}
