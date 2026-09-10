import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정책한눈에 AI",
  description: "정부 정책과 지원사업을 공식 자료 기반으로 쉽게 설명하는 RAG 서비스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
