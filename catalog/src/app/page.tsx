import { Suspense } from "react";
import { CATEGORIES } from "@/src/types";
import { slimProducts, productCounts } from "@/src/lib/products";
import ProductGrid from "@/src/components/ProductGrid";
import CategorySidebar from "@/src/components/CategorySidebar";
import SearchBar from "@/src/components/SearchBar";
import Link from "next/link";

const PAGE_SIZE = 60;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const filtered = query
    ? slimProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.categoryName.toLowerCase().includes(query) ||
        (p.brand ?? "").toLowerCase().includes(query)
      )
    : slimProducts;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", q!);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar productCounts={productCounts} />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>
              All Products
            </h1>
            <p className="text-sm text-[#78716C] mt-0.5">
              {filtered.length.toLocaleString()} {filtered.length === 1 ? "product" : "products"}
              {query && ` matching "${q}"`}
              {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
            </p>
          </div>
          <Suspense>
            <SearchBar defaultValue={q} />
          </Suspense>
        </div>

        <ProductGrid products={paginated as any} />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            {page > 1 && (
              <Link href={pageUrl(page - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#A8A29E] hover:text-[#E7E5E4] transition-colors cursor-pointer"
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
                  className="w-9 h-9 rounded-xl text-sm font-medium flex items-center justify-center transition-all cursor-pointer"
                  style={p === page
                    ? { background: "#CA8A04", color: "#1a1714", fontWeight: 700 }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#A8A29E" }
                  }>
                  {p}
                </Link>
              );
            })}

            {page < totalPages && (
              <Link href={pageUrl(page + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#A8A29E] hover:text-[#E7E5E4] transition-colors cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
