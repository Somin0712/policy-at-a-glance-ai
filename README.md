# 정책한눈에 AI

Google Stitch 디자인을 기반으로 구현한 **정부 정책·지원사업 RAG 설명 블로그**입니다.

## 현재 포함된 실제 정책 자료

`policy_sources/`에 아래 공식 PDF 3개가 들어 있습니다.

1. `youth-rent.pdf` — 국토교통부 2026 청년월세 지원사업 보도자료/안내
2. `employment-support.pdf` — 고용노동부 2026 국민취업지원제도 참여자 수첩
3. `housing-benefit.pdf` — 국토교통부 2026년 주거급여 사업안내

이 PDF는 개발 PC에서 OpenAI Vector Store Search에 최초 1회 색인할 때 사용합니다. `.vercelignore`에 포함되어 있으므로 Vercel 런타임에는 원본 PDF를 올릴 필요가 없습니다.

## 구현 기능

- Stitch 6개 화면 기반 한국어 UI
  - 랜딩
  - `auth.png` 기반 로그인/회원가입
  - 정책 찾기 대시보드
  - 정책 상세 및 설명 수준 선택
  - AI 정책 블로그 결과
  - 내 보관함
- Supabase Auth / 사용자별 RLS
- 정책 DB
- OpenAI Vector Store Search 기반 실제 RAG
- `한눈에 / 쉽게 / 상세하게` 3단계 설명 생성
- 공식 문서 citation 표시
- 정책 Q&A
- 선택 문단 `더 쉽게 / 더 자세히 / 짧게 / 예시 추가` 재작성
- 생성 글 저장/조회/삭제 구조
- 관리자 PDF 추가 등록 `/admin/policies`
- 제공된 공식 PDF 3개 일괄 색인 스크립트

## 1. 패키지 설치

```bash
npm install
```

## 2. 환경변수

`.env.example`을 복사해 `.env.local`을 만들고 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6
ADMIN_EMAILS=관리자로_쓸_이메일
```

## 3. Supabase DB 만들기

Supabase SQL Editor에서 아래 순서로 실행합니다.

1. `database/schema.sql`
2. `database/rls.sql`
3. `database/seed.sql`

`seed.sql`에는 현재 실제 PDF가 준비된 정책 3개만 들어 있습니다.

## 4. 공식 PDF를 OpenAI Vector Store Search에 색인

DB가 생성되고 `.env.local`이 준비되면 프로젝트 루트에서 실행합니다.

```bash
npm run index:policies
```

이 명령은 자동으로:

1. `policy_sources/manifest.json` 읽기
2. 정책별 OpenAI Vector Store 생성
3. PDF 업로드
4. 문서 chunking / embedding / indexing 완료까지 대기
5. 생성된 Vector Store ID (`vs_...`)을 Supabase `policies.file_search_store_id`에 저장

합니다.

> OpenAI Vector Store 색인은 최초 1회만 하면 됩니다. 같은 명령을 반복 실행하면 새 Store가 다시 생성되므로 필요할 때만 실행하세요.


> 이전 Gemini 버전에서 이미 색인했다면 기존 `file_search_store_id` 값은 Gemini Store ID라서 사용할 수 없습니다. 이 OpenAI 버전에서는 `npm run index:policies`를 다시 실행해 OpenAI Vector Store ID(`vs_...`)로 덮어써주세요.

## 5. 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 핵심 테스트 순서

1. 회원가입 / 로그인
2. `정책 찾기`
3. `청년월세 지원사업`, `국민취업지원제도`, `주거급여` 중 하나 선택
4. `한눈에 / 쉽게 / 상세하게` 선택
5. `설명 글 만들기`
6. 생성 결과의 `근거 보기` 확인
7. `정책 Q&A` 질문
8. `설명 바꾸기`에서 문단 재작성
9. 글 저장 → `내 보관함`

## 정책 추가하기

두 가지 방법이 있습니다.

### 방법 A — 관리자 화면

`/admin/policies`에서 공식 PDF와 정책 정보를 입력해 색인합니다.

### 방법 B — 프로젝트 기본 정책으로 추가

1. PDF를 `policy_sources/`에 저장
2. `policy_sources/manifest.json`에 정책 추가
3. `database/seed.sql`에 정책 추가
4. `npm run index:policies`

## 주의

- OpenAI API 키와 Supabase Service Role Key를 GitHub에 올리지 마세요.
- 생성형 AI가 정책 조건을 임의로 채우지 않도록, 생성/질문/재작성 API 모두 OpenAI Vector Store에서 검색한 공식 자료를 기준으로 동작합니다.
- 실제 신청 전에는 항상 화면에 연결된 공식 기관 페이지에서 최신 내용을 확인해야 합니다.

## Finalization notes

- `/admin/policies` and `/api/rag/index` require a logged-in Supabase user whose email is listed in `ADMIN_EMAILS`.
- Policy PDF uploads use the system temporary directory, which is compatible with serverless deployment environments such as Vercel.
- Generated article state is backed up to `localStorage`, so a browser refresh does not immediately discard the current generated article.
- Saved articles support view, update, and delete through `/api/articles/[id]`.
- Generated article citations are mapped to the section they support when citation offsets/evidence allow it. Q&A citations are displayed with each answer.
- RAG endpoints include a lightweight in-memory request throttle. For high-traffic production use, replace this with a shared store such as Redis/Upstash.
