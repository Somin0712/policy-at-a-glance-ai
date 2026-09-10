import { readFile } from "fs/promises";
import { Citation, ExplanationLevel, GeneratedArticle } from "@/lib/types";

const OPENAI_BASE = "https://api.openai.com/v1";

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  return key;
}

function headers(json = true) {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

async function openaiJson(path: string, init: RequestInit = {}) {
  const res = await fetch(`${OPENAI_BASE}${path}`, init);
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    const message = data?.error?.message || data?.message || `OpenAI API 오류 (${res.status})`;
    throw new Error(message);
  }
  return data;
}

const levelGuide: Record<ExplanationLevel, string> = {
  quick: "핵심만 짧게 설명하되 지원 대상, 혜택, 신청 방법과 중요한 제한조건은 절대 생략하지 마세요.",
  easy: "처음 정책을 접하는 시민에게 설명하듯 어려운 행정용어를 쉬운 한국어로 풀어주세요. 수치와 조건은 원문 그대로 유지하세요.",
  detailed: "실제 신청을 검토하는 사용자를 위해 조건, 예외, 절차, 필요서류, 제한사항을 구체적으로 설명하세요. 수치와 날짜는 원문 그대로 유지하세요.",
};

const sectionQueries: { key: keyof GeneratedArticle; query: string }[] = [
  { key: "whatIsThis", query: "사업 목적 제도 개요 지원 취지 정책 설명" },
  { key: "whoCanApply", query: "지원 대상 신청 자격 연령 소득 재산 제외 대상 요건" },
  { key: "benefits", query: "지원 내용 지원 금액 혜택 지급 기간 한도" },
  { key: "whenToApply", query: "신청 기간 접수 기간 날짜 마감" },
  { key: "howToApply", query: "신청 방법 신청 절차 접수처 온라인 오프라인" },
  { key: "requiredDocuments", query: "필요 서류 제출 서류 구비 서류 증빙" },
  { key: "importantNotes", query: "주의사항 예외 제한 중복 지원 제외 유의사항" },
];

type SearchChunk = { file_id?: string; filename?: string; score?: number; content?: { type?: string; text?: string }[] };

async function searchStore(storeId: string, query: string, max = 4): Promise<SearchChunk[]> {
  const data = await openaiJson(`/vector_stores/${encodeURIComponent(storeId)}/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ query, max_num_results: max, rewrite_query: true }),
  });
  return Array.isArray(data?.data) ? data.data : [];
}

function chunkText(chunk: SearchChunk) {
  return (chunk.content ?? []).map((c) => c.text ?? "").filter(Boolean).join("\n").trim();
}

function citationsFromChunks(chunks: SearchChunk[], section?: string): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const chunk of chunks) {
    const evidence = chunkText(chunk);
    if (!evidence) continue;
    const key = `${chunk.file_id || chunk.filename}|${evidence.slice(0, 180)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: out.length + 1,
      fileName: chunk.filename,
      source: chunk.file_id,
      evidence: evidence.slice(0, 650),
      section,
    });
  }
  return out;
}

function evidenceBlock(chunks: SearchChunk[]) {
  return chunks.map((c, i) => `[근거 ${i + 1} | ${c.filename || c.file_id || "공식 문서"}]\n${chunkText(c)}`).join("\n\n");
}

async function createResponse(input: string, opts: { json?: boolean } = {}) {
  const model = process.env.OPENAI_MODEL || "gpt-5.6";
  const body: any = { model, input };
  if (opts.json) {
    body.text = {
      format: {
        type: "json_schema",
        name: "policy_article",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            introduction: { type: "string" },
            whatIsThis: { type: "string" },
            whoCanApply: { type: "string" },
            benefits: { type: "string" },
            whenToApply: { type: "string" },
            howToApply: { type: "string" },
            requiredDocuments: { type: "string" },
            importantNotes: { type: "string" },
            summary: { type: "array", items: { type: "string" } },
          },
          required: ["title","subtitle","introduction","whatIsThis","whoCanApply","benefits","whenToApply","howToApply","requiredDocuments","importantNotes","summary"],
        },
      },
    };
  }
  const data = await openaiJson("/responses", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  for (const item of data?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const part of item?.content ?? []) {
      if (part?.type === "output_text" && part?.text) return String(part.text).trim();
    }
  }
  throw new Error("OpenAI가 텍스트 응답을 반환하지 않았습니다.");
}

export async function indexPolicyDocument(filePath: string, displayName: string) {
  const bytes = await readFile(filePath);
  const form = new FormData();
  form.append("purpose", "user_data");
  form.append("file", new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), displayName);

  const uploaded = await openaiJson("/files", {
    method: "POST",
    headers: headers(false),
    body: form,
  });

  const store = await openaiJson("/vector_stores", {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name: `policy-${Date.now()}-${displayName}` }),
  });

  const attached = await openaiJson(`/vector_stores/${encodeURIComponent(store.id)}/files`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ file_id: uploaded.id }),
  });

  let status = attached.status;
  for (let i = 0; i < 90 && status === "in_progress"; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const current = await openaiJson(`/vector_stores/${encodeURIComponent(store.id)}/files/${encodeURIComponent(uploaded.id)}`, {
      headers: headers(),
    });
    status = current.status;
    if (status === "failed" || status === "cancelled") {
      throw new Error(current?.last_error?.message || `OpenAI 문서 색인에 실패했습니다. (${status})`);
    }
  }
  if (status !== "completed") throw new Error("OpenAI 문서 색인이 제한 시간 안에 완료되지 않았습니다.");
  return store.id as string;
}

export async function generatePolicyArticle(params: {
  storeName: string;
  policyTitle: string;
  level: ExplanationLevel;
  style?: string;
}) {
  const retrieved: Record<string, SearchChunk[]> = {};
  for (const section of sectionQueries) {
    retrieved[String(section.key)] = await searchStore(params.storeName, `${params.policyTitle} ${section.query}`, 3);
  }
  const introChunks = await searchStore(params.storeName, `${params.policyTitle} 사업 개요 핵심 내용`, 3);
  const allEvidence = sectionQueries.map((section) =>
    `### ${section.key}\n${evidenceBlock(retrieved[String(section.key)]) || "검색된 근거 없음"}`
  ).join("\n\n");

  const prompt = `
당신은 대한민국 정부 정책을 일반 시민에게 설명하는 공공정보 에디터입니다.
아래에 제공된 OpenAI Vector Store 검색 결과에 포함된 공식 문서 근거만 사용하세요.
모델의 일반 상식으로 조건이나 수치, 날짜를 보완하지 마세요.
확인되지 않는 정보는 "공식 자료에서 확인되지 않았습니다"라고 명시하세요.

정책명: ${params.policyTitle}
설명 수준: ${params.level}
글 스타일: ${params.style ?? "정보형 블로그"}
수준별 규칙: ${levelGuide[params.level]}

[공식 문서 검색 근거]
${allEvidence}

JSON 스키마에 맞춰 작성하세요. 각 항목은 해당 항목의 근거만 사용하세요.
연령, 소득, 지원금액, 날짜, 자격조건, 예외사항은 임의로 바꾸지 마세요.
summary는 3~5개의 짧은 핵심 요약 문장으로 작성하세요.
`;

  const text = await createResponse(prompt, { json: true });
  let article: GeneratedArticle;
  try { article = JSON.parse(text); }
  catch { article = { title: `${params.policyTitle} 쉽게 알아보기`, introduction: text }; }

  const citations: Citation[] = [];
  for (const section of sectionQueries) {
    for (const c of citationsFromChunks(retrieved[String(section.key)], String(section.key))) {
      citations.push({ ...c, id: citations.length + 1 });
    }
  }
  for (const c of citationsFromChunks(introChunks, "introduction")) citations.push({ ...c, id: citations.length + 1 });
  article.citations = citations;
  return article;
}

export async function askPolicyQuestion(params: { storeName: string; policyTitle: string; question: string }) {
  const chunks = await searchStore(params.storeName, `${params.policyTitle} ${params.question}`, 5);
  const evidence = evidenceBlock(chunks);
  const text = await createResponse(`
정책명: ${params.policyTitle}
사용자 질문: ${params.question}

아래 공식 문서 검색 근거만 사용해 한국어로 답하세요.
근거가 부족하면 "공식 자료만으로는 해당 내용을 명확히 확인하기 어렵습니다. 소관기관에 확인해주세요."라고 답하세요.
수치, 날짜, 자격조건을 추측하지 마세요.

[공식 문서 근거]\n${evidence || "검색된 근거 없음"}
`);
  return { text, citations: citationsFromChunks(chunks) };
}

export async function rewritePolicyParagraph(params: {
  storeName: string;
  policyTitle: string;
  text: string;
  action: "easier" | "detailed" | "shorter" | "example";
}) {
  const actionGuide = {
    easier: "행정용어를 쉬운 한국어로 풀어서 더 쉽게 설명",
    detailed: "공식 문서에서 확인되는 조건과 예외를 보강하여 더 자세히 설명",
    shorter: "핵심 사실과 중요한 제한조건은 유지하면서 더 짧게 정리",
    example: "공식 조건을 바꾸지 않는 범위에서 이해를 돕는 가상의 예시를 1개 추가하고 예시는 실제 자격판정이 아님을 명시",
  }[params.action];
  const chunks = await searchStore(params.storeName, `${params.policyTitle} ${params.text.slice(0, 1200)}`, 5);
  const text = await createResponse(`
정책명: ${params.policyTitle}
원문 문단: ${params.text}
요청: ${actionGuide}

아래 공식 문서 검색 근거로 사실을 검증하면서 재작성하세요.
숫자·날짜·자격조건을 바꾸지 마세요. 재작성된 문단만 한국어로 출력하세요.

[공식 문서 근거]\n${evidenceBlock(chunks) || "검색된 근거 없음"}
`);
  return { text, citations: citationsFromChunks(chunks) };
}
