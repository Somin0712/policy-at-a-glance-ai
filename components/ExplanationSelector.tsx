"use client";

import { ExplanationLevel } from "@/lib/types";

const items: { id: ExplanationLevel; title: string; icon: string; description: string; detail: string }[] = [
  { id: "quick", title: "한눈에", icon: "⚡", description: "핵심만 빠르게 확인하고 싶어요.", detail: "지원 대상 · 혜택 · 신청방법 중심" },
  { id: "easy", title: "쉽게", icon: "🌱", description: "처음 보는 정책이라 쉽게 알고 싶어요.", detail: "어려운 행정용어를 풀어서 설명" },
  { id: "detailed", title: "상세하게", icon: "📄", description: "조건과 예외까지 꼼꼼히 알고 싶어요.", detail: "세부 조건 · 예외 · 절차 · 주의사항" },
];

export default function ExplanationSelector({ value, onChange }: { value: ExplanationLevel; onChange: (v: ExplanationLevel) => void }) {
  return <div className="level-list">{items.map((item) => (
    <button key={item.id} onClick={() => onChange(item.id)} className={`level-card ${value === item.id ? "selected" : ""}`}>
      <span className="level-icon">{item.icon}</span>
      <span className="level-copy"><b>{item.title}</b><span>{item.description}</span><small>{item.detail}</small></span>
      <span className="radio-dot">{value === item.id ? "✓" : ""}</span>
    </button>
  ))}</div>;
}
