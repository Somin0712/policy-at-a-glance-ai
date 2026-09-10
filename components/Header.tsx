"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import Logo from "@/components/Logo";
import { createClient,hasSupabaseEnv } from "@/lib/supabase/client";

export default function Header({ active }: { active?: "home" | "search" | "articles" }) {
  const [email,setEmail]=useState<string|null>(null);
  useEffect(()=>{if(!hasSupabaseEnv())return;const supabase=createClient();supabase.auth.getUser().then(({data})=>setEmail(data.user?.email??null));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setEmail(s?.user.email??null));return()=>data.subscription.unsubscribe()},[]);
  async function logout(){if(!hasSupabaseEnv())return;await createClient().auth.signOut();setEmail(null);location.href="/"}
  return <header className="topbar"><div className="topbar-inner"><Logo/><nav className="nav-links"><Link className={active==="home"?"active":""} href="/">홈</Link><Link className={active==="search"?"active":""} href="/dashboard">정책 찾기</Link><Link className={active==="articles"?"active":""} href="/my-articles">내 글</Link></nav><div className="topbar-actions">{email?<><span className="muted small" title={email}>{email.split("@")[0]}님</span><button className="btn ghost" onClick={logout}>로그아웃</button></>:<Link className="btn ghost" href="/auth">로그인</Link>}<Link className="btn primary" href="/dashboard">시작하기</Link></div></div></header>
}
