"use client";

import { useState } from "react";
import { Product } from "@/src/types";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 24;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;

  function pages(): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const list: (number | "…")[] = [1];
    if (page > 3) list.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) list.push(i);
    if (page < total - 2) list.push("…");
    list.push(total);
    return list;
  }

  const btn = "w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed";
  const base = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" };
  const active = { background: "#CA8A04", border: "1px solid #CA8A04", color: "#1a1714", fontWeight: 700 };

  return (
    <div className="flex items-center gap-1 mt-4">
      <button onClick={() => onChange(1)} disabled={page === 1} className={`${btn} text-[#A8A29E]`} style={base}>«</button>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} text-[#A8A29E]`} style={base}>‹</button>
      {pages().map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[#57534E] text-xs">…</span>
        ) : (
          <button key={n} onClick={() => onChange(n as number)} className={btn} style={n === page ? active : { ...base, color: "#A8A29E" }}>{n}</button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === total} className={`${btn} text-[#A8A29E]`} style={base}>›</button>
      <button onClick={() => onChange(total)} disabled={page === total} className={`${btn} text-[#A8A29E]`} style={base}>»</button>
    </div>
  );
}

export default function BrandSection({ brand, products }: { brand: string; products: Product[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goTo(p: number) {
    setPage(p);
    document.getElementById(`brand-${brand.replace(/\s+/g, "-").toLowerCase()}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id={`brand-${brand.replace(/\s+/g, "-").toLowerCase()}`} className="scroll-mt-20">
      <h2
        className="text-lg font-bold text-[#E7E5E4] mb-4 pb-2 border-b border-[rgba(202,138,4,0.15)] flex items-center gap-2"
        style={{ fontFamily: "'Rubik', sans-serif" }}
      >
        <span className="text-[#CA8A04] text-sm">◆</span>
        {brand}
        <span className="text-sm font-normal text-[#A8A29E]">({products.length})</span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <Pagination page={page} total={totalPages} onChange={goTo} />
    </section>
  );
}
