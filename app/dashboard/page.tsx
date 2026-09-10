"use client";
import { useEffect,useMemo,useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PolicyCard from "@/components/PolicyCard";
import { mockPolicies } from "@/lib/data/mock";
import { Policy } from "@/lib/types";

export default function Dashboard(){const [q,setQ]=useState(""); const [cat,setCat]=useState("전체"); const [policies,setPolicies]=useState<Policy[]>(mockPolicies); const [source,setSource]=useState("local"); const cats=["전체","청년","주거","취업","복지","육아","교육"]; useEffect(()=>{fetch("/api/policies").then(r=>r.json()).then(d=>{if(Array.isArray(d.policies)&&d.policies.length){setPolicies(d.policies);setSource(d.source??"api")}}).catch(()=>{})},[]); const items=useMemo(()=>policies.filter(p=>(cat==="전체"||p.category===cat)&&(`${p.title} ${p.shortDescription} ${p.agency}`).toLowerCase().includes(q.toLowerCase())),[q,cat,policies]); return <><Header active="search"/><main className="container"><div className="search-hero"><h1>어떤 정책이 궁금하신가요?</h1><p>공식 자료를 기준으로 정책을 찾고 필요한 만큼 쉽게 설명해드려요.</p><div className="searchbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="청년 월세 지원, 취업 지원, 주거급여 등을 검색해보세요."/><button className="btn primary">검색</button></div><div className="chips">{cats.map(c=><button key={c} className={`chip ${cat===c?"active":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div></div><div className="page-header"><div><h1>추천 정책</h1><p>{source==="supabase"?"Supabase에 등록된 정책 자료입니다.":"프로젝트에 포함된 공식 정책 3종 미리보기입니다. Supabase와 OpenAI 색인 후 실제 RAG 생성이 활성화됩니다."}</p></div></div>{items.length?<div className="grid-3">{items.map(p=><PolicyCard policy={p} key={p.id}/>)}</div>:<div className="empty">검색 조건에 맞는 정책이 없습니다.</div>}</main><Footer/></>}
