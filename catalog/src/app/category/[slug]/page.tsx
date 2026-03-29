import { notFound } from "next/navigation";
import { allProducts, productCounts } from "@/src/lib/products";
import { CATEGORIES } from "@/src/types";
import CategorySidebar from "@/src/components/CategorySidebar";
import ProductCard from "@/src/components/ProductCard";
import BrandJumpBar from "@/src/components/BrandJumpBar";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; brand?: string }>;
}

function normalizeBrand(raw: string | undefined, category: string): string {
  const trimmed = raw?.trim() || "Other";
  if (category !== "electronic") return trimmed;
  const root = trimmed.split(/[-(\s]/)[0].toLowerCase();
  const map: Record<string, string> = {
    airpods: "AirPods", apple: "Apple", dyson: "Dyson", jbl: "JBL",
    sony: "Sony", bang: "Bang", humo: "Humo", enjoy: "Enjoy Vape",
  };
  return map[root] ?? trimmed;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam, brand: brandFilter } = await searchParams;

  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const allCatProducts = allProducts.filter((p) => p.category === slug);

  // Brand counts for jump bar
  const brandCountMap = new Map<string, number>();
  for (const p of allCatProducts) {
    const brand = normalizeBrand(p.brand, slug);
    brandCountMap.set(brand, (brandCountMap.get(brand) || 0) + 1);
  }
  const brands: [string, number][] = Array.from(brandCountMap.entries()).sort((a, b) => b[1] - a[1]);

  // Filter by brand if selected
  const filtered = brandFilter
    ? allCatProducts.filter(p => normalizeBrand(p.brand, slug).toLowerCase() === brandFilter.toLowerCase())
    : allCatProducts;

  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (brandFilter) params.set("brand", brandFilter);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/category/${slug}?${qs}` : `/category/${slug}`;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar productCounts={productCounts} />

      <div className="flex-1 min-w-0">
        <nav className="text-sm text-[#A8A29E] mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#CA8A04] transition-colors cursor-pointer">All Products</Link>
          <span className="text-[#D6D3D1]">/</span>
          <span className="text-[#A8A29E] font-medium">{cat.name}</span>
          {brandFilter && (
            <>
              <span className="text-[#D6D3D1]">/</span>
              <span className="text-[#CA8A04] font-medium">{brandFilter}</span>
            </>
          )}
        </nav>

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>
            {brandFilter ?? cat.name}
          </h1>
          <p className="text-sm text-[#78716C] mt-0.5 font-medium">
            {filtered.length.toLocaleString()} products
            {brands.length > 1 && !brandFilter && ` · ${brands.length} brands`}
            {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
          </p>
        </div>

        {brands.length > 2 && !brandFilter && (
          <BrandJumpBar brands={brands.slice(0, 30)} categorySlug={slug} />
        )}

        {brandFilter && (
          <Link href={`/category/${slug}`}
            className="inline-flex items-center gap-1 text-xs text-[#CA8A04] hover:text-[#D97706] mb-4 cursor-pointer transition-colors">
            ← All {cat.name}
          </Link>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {paginated.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

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
