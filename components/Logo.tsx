import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">✓</span>
      <span>정책한눈에 AI</span>
    </Link>
  );
}
