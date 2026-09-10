import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return <>
    <Header active="home" />
    <main>
      <section className="hero"><div className="hero-inner">
        <div className="eyebrow">RAG 기반 정책 설명 서비스</div>
        <h1>복잡한 정책,<br/>내가 이해할 수 있는 말로.</h1>
        <p>정부 정책과 지원사업의 대상, 혜택, 신청방법을 공식 자료를 근거로 쉽게 알려드려요.</p>
        <div className="hero-actions"><Link className="btn primary large" href="/dashboard">정책 찾아보기</Link><a className="btn ghost large" href="#how">이용 방법 보기</a></div>
      </div></section>
      <section id="how" className="section white"><div className="section-title"><h2>어떻게 이용하나요?</h2><p>정책을 찾고 설명 수준만 고르면 됩니다.</p></div>
        <div className="steps">
          {[["🔎","정책 검색","궁금한 지원사업을 찾아요."],["📚","공식 자료 분석","RAG가 등록된 공식 자료에서 근거를 찾아요."],["🎚️","설명 수준 선택","한눈에·쉽게·상세하게 중 선택해요."],["✍️","정책 글 완성","근거가 연결된 설명 글을 확인해요."]].map(([i,t,d])=><div className="step-card" key={t}><div className="step-icon">{i}</div><b>{t}</b><span>{d}</span></div>)}
        </div>
      </section>
      <section className="section"><div className="section-title"><h2>원하는 깊이로 설명해요</h2><p>정책의 사실은 유지하고 설명의 양과 난이도만 바꿉니다.</p></div>
        <div className="feature-grid">
          <div className="feature-card"><div className="big">⚡</div><h3>한눈에</h3><p>지원 대상과 혜택, 신청방법만 빠르게 확인해요.</p></div>
          <div className="feature-card"><div className="big">🌱</div><h3>쉽게</h3><p>어려운 행정용어까지 시민의 언어로 풀어서 설명해요.</p></div>
          <div className="feature-card"><div className="big">📄</div><h3>상세하게</h3><p>세부 조건과 예외사항, 준비서류까지 꼼꼼히 확인해요.</p></div>
        </div>
        <div className="notice">본 서비스는 교육 및 개인 연구 목적의 프로토타입입니다. 정책 내용은 변경될 수 있으므로 실제 신청 전 공식 기관의 최신 안내를 확인해주세요.</div>
      </section>
    </main>
    <Footer />
  </>;
}
