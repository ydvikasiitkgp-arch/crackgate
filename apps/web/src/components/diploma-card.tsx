"use client";

import Link from "next/link";
import { AddToCartBtn } from "./add-to-cart-btn";

export function DiplomaCard({
  href,
  badge,
  badgeCls,
  title,
  description,
  syllabus,
  exam,
  subject,
  mockCount = 20,
  price = 399,
}: {
  href: string;
  badge: string;
  badgeCls: string;
  title: string;
  description: string;
  syllabus: string[];
  exam: string;
  subject: string;
  mockCount?: number;
  price?: number;
}) {
  return (
    <div className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop">
      <Link href={href} className="flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className={`badge ${badgeCls}`}>{badge}</span>
          <span className="badge badge-pro">{mockCount} mocks</span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 flex-1 text-sm text-muted leading-snug">{description}</p>
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {syllabus.map((t) => (
            <li key={t}>▸ {t}</li>
          ))}
        </ul>
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Link href={href} className="text-sm font-semibold text-brand">
          Open mock series <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{mockCount} mocks · ₹{price}</span>
          <AddToCartBtn exam={exam} subject={subject} size="md" />
        </div>
      </div>
    </div>
  );
}
