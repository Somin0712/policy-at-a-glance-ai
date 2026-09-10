import Link from "next/link";
import { Policy } from "@/lib/types";

export default function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <article className="policy-card">
      <div className="card-topline"><span className="badge soft">{policy.category}</span><span className="muted small">{policy.agency}</span></div>
      <h3>{policy.title}</h3>
      <p>{policy.shortDescription}</p>
      <Link className="text-link" href={`/policies/${policy.id}`}>자세히 보기 →</Link>
    </article>
  );
}
