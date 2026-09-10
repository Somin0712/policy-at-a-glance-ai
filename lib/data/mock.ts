import { Policy } from "@/lib/types";

export const mockPolicies: Policy[] = [
  {
    id: "youth-rent",
    fileSearchStoreId: "vs_6aa296f895e08191aa9bfe5233e4c2c5",
    title: "청년월세 지원사업",
    category: "청년",
    agency: "국토교통부",
    shortDescription: "부모와 별도 거주하는 무주택 청년의 월세 부담을 줄이기 위한 지원사업입니다.",
    officialUrl: "https://www.molit.go.kr/USR/NEWS/dtl.jsp?id=95091798",
    lastVerifiedAt: "2026-03-19",
    purpose: "청년의 주거비 부담 완화",
    eligibility: ["19~34세", "부모와 별도 거주", "무주택 청년", "소득·재산 요건 충족"],
    benefits: ["실제 납부 임대료 범위에서 월 최대 20만원", "최장 24개월, 생애 1회"],
    applicationPeriod: "2026년 3월 30일 09:00 ~ 5월 29일 16:00",
    applicationMethod: ["복지로 누리집", "거주지 기초자치단체"],
    requiredDocuments: ["월세지원 신청서", "소득·재산 신고서", "임대차계약서", "최근 3개월 월세 이체 증빙", "통장 사본", "가족관계증명서 등"],
    warnings: ["주택 소유자, 일부 공공임대주택 거주자, 다른 월세지원 사업 수혜자 등은 제외될 수 있습니다."],
  },
  {
    id: "employment-support",
    fileSearchStoreId: "vs_6aa2970bb4248191b272a3ad07b9b211",
    title: "국민취업지원제도",
    category: "취업",
    agency: "고용노동부",
    shortDescription: "취업지원서비스와 유형별 생계지원을 함께 제공하는 한국형 실업부조 제도입니다.",
    officialUrl: "https://www.moel.go.kr/policy/policydata/view.do?bbs_seq=20260301325",
    lastVerifiedAt: "2026-03-01",
    purpose: "취업지원이 필요한 참여자에게 상담·훈련·일경험·복지 연계와 유형별 소득지원을 제공",
    benefits: ["Ⅰ유형 구직촉진수당 월 60만원×6개월 + 조건에 따른 가족수당", "Ⅱ유형 참여수당·참여장려수당", "취업지원서비스", "조건 충족 시 취업성공수당"],
    applicationMethod: ["고용24", "고용센터 상담"],
    warnings: ["유형별 참여 조건과 지원 내용이 다릅니다.", "구직활동·소득·취창업 변동사항 신고 의무가 있습니다."],
  },
  {
    id: "housing-benefit",
    fileSearchStoreId: "vs_6aa29736723481918288c9ce047a1ceb",
    title: "주거급여",
    category: "주거",
    agency: "국토교통부",
    shortDescription: "주거가 필요한 가구에 임차급여 또는 수선유지급여 등을 지원하는 제도입니다.",
    officialUrl: "https://www.molit.go.kr/USR/policyTarget/m_24066/dtl.jsp?idx=1065",
    lastVerifiedAt: "2026-01-01",
    purpose: "주거급여 수급권자의 주거 안정과 적정한 주거수준 보장",
    warnings: ["신청·선정 기준, 임차급여와 수선유지급여의 세부 기준은 공식 사업안내에서 확인해야 합니다."],
  },
];

export const mockArticles: { id: string; title: string; policy: string; level: string; date: string }[] = [];
