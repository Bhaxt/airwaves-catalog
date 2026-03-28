"use client";

import { useState } from "react";
import { Product } from "@/src/types";
import ProductCard from "./ProductCard";

const PAGE_SIZE = 24;

export default function CategoryGrid({
  products,
  brands,
}: {
  products: Product[];
  brands: [string, number][];
}) {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const sorted = [...brands].sort((a, b) => b[1] - a[1]);

  const brandFiltered = activeBrand
    ? products.filter((p) => (p.brand ?? "Other") === activeBrand)
    : products;

  const totalPages = Math.max(1, Math.ceil(brandFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = brandFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goTo(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectBrand(brand: string | null) {
    setActiveBrand(brand);
    setPage(1);
  }

  // Build page numbers to show
  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (safePage > 3) pages.push("…");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  return (
    <div>
      {/* Brand filter chips */}
      {sorted.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => selectBrand(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeBrand === null
                ? "text-[#1a1714] font-bold"
                : "text-[#D6D3D1] hover:text-[#CA8A04]"
            }`}
            style={
              activeBrand === null
                ? { background: "#CA8A04", border: "1px solid #CA8A04" }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            All
            <span className={`ml-1.5 ${activeBrand === null ? "text-[#1a1714]" : "text-[#57534E]"}`}>
              {products.length}
            </span>
          </button>
          {sorted.map(([brand, count]) => (
            <button
              key={brand}
              onClick={() => selectBrand(brand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeBrand === brand
                  ? "text-[#1a1714] font-bold"
                  : "text-[#D6D3D1] hover:text-[#CA8A04]"
              }`}
              style={
                activeBrand === brand
                  ? { background: "#CA8A04", border: "1px solid #CA8A04" }
                  : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {brand}
              <span className={`ml-1.5 ${activeBrand === brand ? "text-[#1a1714]" : "text-[#57534E]"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-10">
          {/* First / Prev */}
          <button
            onClick={() => goTo(1)}
            disabled={safePage === 1}
            className="w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[#A8A29E] hover:text-[#E7E5E4]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage === 1}
            className="w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[#A8A29E] hover:text-[#E7E5E4]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* Page numbers */}
          {pageNumbers().map((n, i) =>
            n === "…" ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[#57534E] text-sm">…</span>
            ) : (
              <button
                key={n}
                onClick={() => goTo(n as number)}
                className="w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200 cursor-pointer"
                style={
                  n === safePage
                    ? { background: "#CA8A04", border: "1px solid #CA8A04", color: "#1a1714", fontWeight: 700 }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#A8A29E" }
                }
              >
                {n}
              </button>
            )
          )}

          {/* Next / Last */}
          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage === totalPages}
            className="w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[#A8A29E] hover:text-[#E7E5E4]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Next page"
          >
            ›
          </button>
          <button
            onClick={() => goTo(totalPages)}
            disabled={safePage === totalPages}
            className="w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[#A8A29E] hover:text-[#E7E5E4]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}
