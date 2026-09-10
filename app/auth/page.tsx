"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

export default function AuthPage() {
  const [mode,setMode]=useState<"login"|"signup">("login"); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false); const router=useRouter();
  async function submit(e:FormEvent){e.preventDefault(); setLoading(true); setMessage("");
    if(!hasSupabaseEnv()){setMessage("Supabase 환경변수가 아직 설정되지 않았습니다. .env.local을 설정하면 실제 로그인이 활성화됩니다."); setLoading(false); return;}
    try{const supabase=createClient(); if(mode==="login"){const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; const next=new URLSearchParams(location.search).get("next"); router.push(next || "/dashboard"); router.refresh();} else {const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/auth/confirm`}}); if(error) throw error; setMessage("회원가입 요청을 보냈습니다. 이메일 인증 설정에 따라 확인 메일을 확인해주세요.");}}catch(err:any){setMessage(err.message??"인증 중 오류가 발생했습니다.");}finally{setLoading(false)}}
  return <main className="auth-wrap"><div className="auth-card"><div style={{display:"flex",justifyContent:"center"}}><Logo/></div><h1>정책한눈에 AI</h1><p className="sub">관심 정책과 생성한 설명 글을 내 공간에 저장하세요.</p>
    <div className="auth-mode"><button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>로그인</button><button className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>회원가입</button></div>
    <form onSubmit={submit}><div className="field"><label>이메일</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" type="email" required/></div><div className="field"><label>비밀번호</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={6} required/></div><button className="btn primary wide large" disabled={loading}>{loading?"처리 중...":mode==="login"?"로그인":"회원가입"}</button></form>
    {message&&<div className="status">{message}</div>}
  </div></main>
}
