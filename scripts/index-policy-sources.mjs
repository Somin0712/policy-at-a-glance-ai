import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "policy_sources", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const apiKey = process.env.OPENAI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY가 필요합니다.");
if (!supabaseUrl || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
const base = "https://api.openai.com/v1";
const auth = { Authorization: `Bearer ${apiKey}` };
async function json(pathname, init={}) {
  const res = await fetch(`${base}${pathname}`, init);
  const text = await res.text();
  let data={}; try { data=text?JSON.parse(text):{}; } catch { data={raw:text}; }
  if(!res.ok) throw new Error(data?.error?.message || `OpenAI API 오류 (${res.status})`);
  return data;
}
async function indexFile(filePath, displayName, policyId) {
  const form = new FormData();
  form.append("purpose", "user_data");
  form.append("file", new Blob([fs.readFileSync(filePath)], { type: "application/pdf" }), displayName);
  const uploaded = await json("/files", { method:"POST", headers:auth, body:form });
  const store = await json("/vector_stores", { method:"POST", headers:{...auth,"Content-Type":"application/json"}, body:JSON.stringify({name:`policy-${policyId}`}) });
  const attached = await json(`/vector_stores/${store.id}/files`, { method:"POST", headers:{...auth,"Content-Type":"application/json"}, body:JSON.stringify({file_id:uploaded.id}) });
  let status=attached.status;
  for(let i=0;i<120 && status==="in_progress";i++){
    await new Promise(r=>setTimeout(r,2000));
    const current=await json(`/vector_stores/${store.id}/files/${uploaded.id}`, {headers:auth});
    status=current.status;
    if(status==="failed"||status==="cancelled") throw new Error(current?.last_error?.message || `색인 실패: ${status}`);
    process.stdout.write(".");
  }
  process.stdout.write("\n");
  if(status!=="completed") throw new Error("OpenAI 문서 색인이 제한 시간 안에 완료되지 않았습니다.");
  return store.id;
}

for (const policy of manifest) {
  const filePath = path.join(root, "policy_sources", policy.file);
  if (!fs.existsSync(filePath)) throw new Error(`파일 없음: ${filePath}`);
  console.log(`\n[${policy.title}] OpenAI Vector Store 생성/색인...`);
  const storeId = await indexFile(filePath, policy.file, policy.id);
  const { error } = await supabase.from("policies").upsert({
    id: policy.id,
    title: policy.title,
    category: policy.category,
    agency: policy.agency,
    short_description: policy.shortDescription,
    official_url: policy.officialUrl,
    source_file_name: policy.file,
    file_search_store_id: storeId,
    last_verified_at: policy.lastVerifiedAt,
  }, { onConflict: "id" });
  if (error) throw error;
  console.log(`[${policy.title}] 완료: ${storeId}`);
}
console.log("\n정책 PDF 색인 및 Supabase 연결 완료.");
