import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AdminPolicyForm from "./AdminPolicyForm";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminPolicies(){
  const user=await getAdminUser();
  if(!user) redirect("/auth?next=/admin/policies");
  return <><Header/><main className="container"><div className="page-header"><div><h1>관리자 · 정책 자료 등록</h1><p>공식 정책 PDF를 OpenAI Vector Store에 색인하고 policies DB와 연결하기 위한 화면입니다.</p></div></div><div className="admin-grid"><AdminPolicyForm/><aside className="panel"><h2>기본 정책 자료</h2><p>프로젝트의 <code>policy_sources</code> 폴더에 공식 PDF 3개가 포함되어 있습니다. 최초 1회 <code>npm run index:policies</code>를 실행하면 OpenAI Vector Store와 Supabase에 연결됩니다.</p><div className="info-list"><div className="info-row"><b>청년</b><span>2026 청년월세 지원사업</span></div><div className="info-row"><b>취업</b><span>2026 국민취업지원제도 참여자 수첩</span></div><div className="info-row"><b>주거</b><span>2026년 주거급여 사업안내</span></div></div><div className="divider"/><div className="code-note">ADMIN_EMAILS=admin@example.com{"\n"}OPENAI_API_KEY=...{"\n"}NEXT_PUBLIC_SUPABASE_URL=...{"\n"}NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...{"\n"}SUPABASE_SERVICE_ROLE_KEY=...</div></aside></div></main></>
}
