"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product } from "@/src/types";

const PAGE_SIZE = 60;

interface Props {
  slug: string;
  catName: string;
  children: React.ReactNode;
}

export default function CategoryBrandFilter({ slug, catName, children }: Props) {
  const searchParams = useSearchParams();
  const brandFilter = searchParams.get("brand");
  const pageParam = parseInt(searchParams.get("page") ?? "1") || 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBrand = useCallback(async () => {
    if (!brandFilter) return;
    setLoading(true);
    try {
      const offset = (pageParam - 1) * PAGE_SIZE;
      const res = await fetch(
        `/api/products?category=${slug}&brand=${encodeURIComponent(brandFilter)}&offset=${offset}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [brandFilter, slug, pageParam]);

  useEffect(() => {
    if (brandFilter) fetchBrand();
  }, [brandFilter, fetchBrand]);

  if (!brandFilter) return <>{children}</>;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageUrl(p: number) {
    const params = new URLSearchParams({ brand: brandFilter! });
    if (p > 1) params.set("page", String(p));
    return `/category/${slug}?${params.toString()}`;
  }

  return (
    <div className="flex-1 min-w-0">
      <nav className="text-sm text-[#A8A29E] mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#CA8A04] transition-colors cursor-pointer">All Products</Link>
        <span>/</span>
        <Link href={`/category/${slug}`} className="hover:text-[#CA8A04] transition-colors cursor-pointer">{catName}</Link>
        <span>/</span>
        <span className="text-[#CA8A04] font-medium">{brandFilter}</span>
      </nav>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>{brandFilter}</h1>
        <p className="text-sm text-[#78716C] mt-0.5">
          {loading ? "Loading..." : `${total.toLocaleString()} products${totalPages > 1 ? ` · Page ${pageParam} of ${totalPages}` : ""}`}
        </p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-[15px] bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      )}
      {totalPages > 1 && <Pagination page={pageParam} totalPages={totalPages} pageUrl={pageUrl} />}
    </div>
  );
}

function Pagination({ page, totalPages, pageUrl }: { page: number; totalPages: number; pageUrl: (p: number) => string }) {
  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
      {page > 1 && (
        <Link href={pageUrl(page - 1)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-[#A8A29E] hover:text-[#E7E5E4] transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          ← Prev
        </Link>
      )}
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        let p: number;
        if (totalPages <= 7) p = i + 1;
        else if (page <= 4) p = i + 1;
        else if (page >= totalPages - 3) p = totalPages - 6 + i;
        else p = page - 3 + i;
        return (
          <Link key={p} href={pageUrl(p)}
            className="w-9 h-9 rounded-xl text-sm font-medium flex items-center justify-center transition-all"
            style={p === page
              ? { background: "#CA8A04", color: "#1a1714", fontWeight: 700 }
              : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#A8A29E" }}>
            {p}
          </Link>
        );
      })}
      {page < totalPages && (
        <Link href={pageUrl(page + 1)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-[#A8A29E] hover:text-[#E7E5E4] transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          Next →
        </Link>
      )}
    </div>
  );
}
