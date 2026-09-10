import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAuth(){
  const supabase=await createClient();
  if(!supabase) return {supabase:null,error:NextResponse.json({error:"Supabase가 설정되지 않았습니다."},{status:503})};
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {supabase:null,error:NextResponse.json({error:"로그인이 필요합니다."},{status:401})};
  return {supabase,error:null};
}

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await getAuth(); if(auth.error||!auth.supabase)return auth.error!;
  const {id}=await params;
  const {data,error}=await auth.supabase.from("articles").select("*").eq("id",id).single();
  if(error)return NextResponse.json({error:error.message},{status:error.code==="PGRST116"?404:500});
  return NextResponse.json({article:data});
}

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await getAuth(); if(auth.error||!auth.supabase)return auth.error!;
  const {id}=await params; const body=await req.json();
  const allowed={title:body.title,subtitle:body.subtitle,content:body.content,explanation_level:body.explanation_level,writing_style:body.writing_style,citations:body.citations};
  const {data,error}=await auth.supabase.from("articles").update(allowed).eq("id",id).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({article:data});
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await getAuth(); if(auth.error||!auth.supabase)return auth.error!;
  const {id}=await params;
  const {error}=await auth.supabase.from("articles").delete().eq("id",id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
