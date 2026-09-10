import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mockPolicies } from "@/lib/data/mock";

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const admin=createAdminClient();if(admin){const {data,error}=await admin.from("policies").select("*").eq("id",id).maybeSingle();if(error)return NextResponse.json({error:error.message},{status:500});if(data)return NextResponse.json({policy:{id:data.id,title:data.title,category:data.category,agency:data.agency,shortDescription:data.short_description??"",officialUrl:data.official_url??undefined,sourceFileName:data.source_file_name??undefined,lastVerifiedAt:data.last_verified_at??undefined,fileSearchStoreId:data.file_search_store_id??undefined}});}const policy=mockPolicies.find(p=>p.id===id);if(!policy)return NextResponse.json({error:"정책을 찾을 수 없습니다."},{status:404});return NextResponse.json({policy});}
