"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Citation, GeneratedArticle, Policy } from "@/lib/types";

const levelLabel: Record<string, string> = { quick: "한눈에", easy: "쉽게", detailed: "상세하게" };
const rewriteSections: { key: keyof GeneratedArticle; label: string }[] = [
  { key: "whatIsThis", label: "이 정책은 무엇인가요?" }, { key: "whoCanApply", label: "누가 신청할 수 있나요?" },
  { key: "benefits", label: "얼마나 지원받을 수 있나요?" }, { key: "whenToApply", label: "언제 신청하나요?" },
  { key: "howToApply", label: "어떻게 신청하나요?" }, { key: "requiredDocuments", label: "무엇을 준비해야 하나요?" },
  { key: "importantNotes", label: "이런 부분은 꼭 확인하세요" },
];
const sections: { key: keyof GeneratedArticle; title: string }[] = [
  {key:"whatIsThis",title:"이 정책은 무엇인가요?"},{key:"whoCanApply",title:"누가 신청할 수 있나요?"},
  {key:"benefits",title:"얼마나 지원받을 수 있나요?"},{key:"whenToApply",title:"언제 신청하나요?"},
  {key:"howToApply",title:"어떻게 신청하나요?"},{key:"requiredDocuments",title:"무엇을 준비해야 하나요?"},
  {key:"importantNotes",title:"이런 부분은 꼭 확인하세요"},
];

type ChatMessage={role:"user"|"ai";text:string;citations?:Citation[]};

export default function ArticleResult() {
  const params=useParams<{id:string}>();
  const [article,setArticle]=useState<GeneratedArticle|null>(null); const [policy,setPolicy]=useState<Policy|null>(null);
  const [level,setLevel]=useState("easy"); const [style,setStyle]=useState("정보형 블로그"); const [savedId,setSavedId]=useState<string|null>(null);
  const [loading,setLoading]=useState(true); const [tab,setTab]=useState<"evidence"|"rewrite"|"chat">("evidence"); const [cit,setCit]=useState(1);
  const [question,setQuestion]=useState(""); const [messages,setMessages]=useState<ChatMessage[]>([]); const [chatLoading,setChatLoading]=useState(false);
  const [saveMessage,setSaveMessage]=useState(""); const [rewriteKey,setRewriteKey]=useState<keyof GeneratedArticle>("whatIsThis"); const [rewriteLoading,setRewriteLoading]=useState(false);

  useEffect(()=>{(async()=>{try{
    const routeId=String(params.id);
    const cachedArticle=JSON.parse(sessionStorage.getItem("generated-article")||localStorage.getItem("generated-article")||"null");
    const cachedPolicy=JSON.parse(sessionStorage.getItem("generated-policy")||localStorage.getItem("generated-policy")||"null");
    if(cachedArticle&&cachedPolicy?.id===routeId){setArticle(cachedArticle);setPolicy(cachedPolicy);setLevel(sessionStorage.getItem("generated-level")||localStorage.getItem("generated-level")||"easy");setStyle(sessionStorage.getItem("generated-style")||localStorage.getItem("generated-style")||"정보형 블로그");return;}
    const res=await fetch(`/api/articles/${encodeURIComponent(routeId)}`); if(!res.ok)return; const d=await res.json(); const saved=d.article;
    setArticle({...saved.content,citations:saved.content?.citations??saved.citations??[]}); setLevel(saved.explanation_level||"easy"); setStyle(saved.writing_style||"정보형 블로그"); setSavedId(saved.id);
    if(saved.policy_id){const pr=await fetch(`/api/policies/${encodeURIComponent(saved.policy_id)}`);if(pr.ok){const pd=await pr.json();if(pd.policy)setPolicy(pd.policy)}}
  }catch{}finally{setLoading(false)}})()},[params.id]);

  useEffect(()=>{if(!loading&&article){localStorage.setItem("generated-article",JSON.stringify(article));if(policy)localStorage.setItem("generated-policy",JSON.stringify(policy));localStorage.setItem("generated-level",level);localStorage.setItem("generated-style",style)}},[article,policy,level,style,loading]);

  const evidence=useMemo(()=>article?.citations?.find(c=>c.id===cit),[article,cit]);
  if(loading)return <><Header/><main className="container narrow"><div className="empty">정책 글을 불러오는 중...</div></main></>;
  if(!article)return <><Header/><main className="container narrow"><div className="empty">생성된 글을 찾을 수 없습니다. 정책 상세 페이지에서 새 글을 만들거나 로그인 후 내 글에서 다시 열어주세요.</div></main></>;

  function sectionCitations(key:keyof GeneratedArticle){return (article?.citations||[]).filter(c=>c.section===String(key)||(key==="whatIsThis"&&c.section==="introduction"));}
  const cite=(n:number)=>{setCit(n);setTab("evidence")};

  async function save(){if(!article||!policy){setSaveMessage("원본 정책 정보를 찾지 못해 저장할 수 없습니다.");return}setSaveMessage("저장 중...");try{const body={policy_id:policy.id,title:article.title,subtitle:article.subtitle??"",content:article,explanation_level:level,writing_style:style,citations:article.citations??[]};const res=await fetch(savedId?`/api/articles/${savedId}`:"/api/articles",{method:savedId?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await res.json();if(res.ok){setSavedId(d.article?.id||savedId);setSaveMessage(savedId?"수정 내용을 저장했습니다.":"저장했습니다.")}else setSaveMessage(d.error??"저장에 실패했습니다.")}catch{setSaveMessage("저장에 실패했습니다.")}}

  async function ask(){if(!question.trim()||!policy)return;const q=question.trim();setQuestion("");setMessages(m=>[...m,{role:"user",text:q}]);setChatLoading(true);try{const res=await fetch("/api/rag/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({policyId:policy.id,policyTitle:policy.title,question:q})});const d=await res.json();setMessages(m=>[...m,{role:"ai",text:res.ok?d.answer:(d.error??"답변을 생성하지 못했습니다."),citations:res.ok?d.citations:[]}])}finally{setChatLoading(false)}}

  async function rewrite(action:"easier"|"detailed"|"shorter"|"example"){if(!policy||!article)return;const currentPolicy=policy;const currentArticle=article;const current=currentArticle[rewriteKey];if(typeof current!=="string"||!current.trim())return;setRewriteLoading(true);try{const res=await fetch("/api/rag/rewrite",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({policyId:currentPolicy.id,policyTitle:currentPolicy.title,text:current,action})});const d=await res.json();if(!res.ok){alert(d.error??"재작성에 실패했습니다.");return}const replacement=(d.citations||[]).map((c:Citation)=>({...c,section:String(rewriteKey)}));const kept=(currentArticle.citations||[]).filter(c=>c.section!==String(rewriteKey));const next={...currentArticle,[rewriteKey]:d.text,citations:[...kept,...replacement]} as GeneratedArticle;setArticle(next);sessionStorage.setItem("generated-article",JSON.stringify(next));localStorage.setItem("generated-article",JSON.stringify(next))}finally{setRewriteLoading(false)}}

  return <><Header/><main className="container"><div className="article-actions"><button className="btn ghost" onClick={()=>navigator.clipboard?.writeText(document.querySelector(".article-main")?.textContent||"")}>복사</button><button className="btn primary" onClick={save}>{savedId?"수정 저장":"저장"}</button></div>{saveMessage&&<div className="status" style={{marginBottom:12}}>{saveMessage}</div>}<div className="article-shell"><article className="article-main"><span className={`badge ${level}`}>{levelLabel[level]??"쉽게"} 설명</span><h1>{article.title}</h1><div className="lead">{article.subtitle}</div>
    {sections.map(({key,title})=>{const value=article[key]||(key==="whatIsThis"?article.introduction:"");if(typeof value!=="string"||!value)return null;const cs=sectionCitations(key);return <div key={String(key)}><h2>{title}</h2><p>{value}{cs.map(c=><button key={c.id} className="citation" onClick={()=>cite(c.id)}>[{c.id}]</button>)}</p></div>})}
    <div className="summary-box"><b>한눈에 정리</b>{(article.summary||[]).map((s,i)=><div key={i}>• {s}</div>)}</div></article>
    <aside className="side-panel"><div className="tabs"><button className={tab==="evidence"?"active":""} onClick={()=>setTab("evidence")}>근거 보기</button><button className={tab==="rewrite"?"active":""} onClick={()=>setTab("rewrite")}>설명 바꾸기</button><button className={tab==="chat"?"active":""} onClick={()=>setTab("chat")}>정책 Q&A</button></div><div className="tab-body">
      {tab==="evidence"&&<><h3>공식 근거 {evidence?`[${cit}]`:""}</h3><div className="evidence-box">{evidence?<><b>{evidence.fileName||"공식 정책 자료"}</b><p>{evidence.evidence||evidence.source||"검색된 공식 문서 근거입니다."}</p></>:<p>본문의 근거 번호를 누르면 공식 문서 근거를 확인할 수 있습니다.</p>}</div>{policy?.officialUrl&&<a className="btn ghost wide" href={policy.officialUrl} target="_blank" rel="noreferrer">공식 자료 확인</a>}</>}
      {tab==="rewrite"&&<><h3>설명 바꾸기</h3><div className="field"><label>수정할 문단</label><select value={String(rewriteKey)} onChange={e=>setRewriteKey(e.target.value as keyof GeneratedArticle)}>{rewriteSections.map(s=><option key={String(s.key)} value={String(s.key)}>{s.label}</option>)}</select></div><div style={{display:"grid",gap:8}}><button className="btn ghost" disabled={rewriteLoading} onClick={()=>rewrite("easier")}>더 쉽게</button><button className="btn ghost" disabled={rewriteLoading} onClick={()=>rewrite("detailed")}>더 자세히</button><button className="btn ghost" disabled={rewriteLoading} onClick={()=>rewrite("shorter")}>짧게</button><button className="btn ghost" disabled={rewriteLoading} onClick={()=>rewrite("example")}>예시 추가</button></div>{rewriteLoading&&<div className="helper">공식 근거를 다시 확인하며 문단을 수정하고 있습니다...</div>}</>}
      {tab==="chat"&&<><div className="chat-list">{messages.length===0&&<div className="muted small">이 정책의 대상, 서류, 신청 조건 등을 물어보세요.</div>}{messages.map((m,i)=><div key={i} className={`chat-bubble ${m.role}`}><div>{m.text}</div>{m.role==="ai"&&m.citations?.length?<details style={{marginTop:8}}><summary>공식 근거 {m.citations.length}개 보기</summary>{m.citations.map(c=><div key={c.id} className="muted small" style={{marginTop:6}}><b>[{c.id}] {c.fileName||"공식 자료"}</b>{c.evidence&&<div>{c.evidence}</div>}</div>)}</details>:null}</div>)}{chatLoading&&<div className="chat-bubble ai">공식 근거 검색 중...</div>}</div><div className="chat-input"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")ask()}} placeholder="정책에 대해 질문하세요"/><button className="btn primary" onClick={ask} disabled={chatLoading}>전송</button></div></>}
    </div></aside></div></main><Footer/></>
}
