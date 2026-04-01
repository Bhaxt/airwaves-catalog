import { notFound } from "next/navigation";
import { allProducts, productCounts } from "@/src/lib/products";
import { CATEGORIES, Product } from "@/src/types";
import CategorySidebar from "@/src/components/CategorySidebar";
import ProductCard from "@/src/components/ProductCard";
import BrandExpandable from "@/src/components/BrandExpandable";
import BrandJumpBar from "@/src/components/BrandJumpBar";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 60;
const BRAND_PREVIEW = 10; // products shown per brand before "View all"

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

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; brand?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam, brand: brandFilter } = await searchParams;

  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const allCatProducts = allProducts.filter((p) => p.category === slug);

  // Build brand map
  const brandMap = new Map<string, Product[]>();
  for (const p of allCatProducts) {
    const brand = normalizeBrand(p.brand, slug);
    if (!brandMap.has(brand)) brandMap.set(brand, []);
    brandMap.get(brand)!.push(p);
  }
  const brands = Array.from(brandMap.entries()).sort((a, b) => b[1].length - a[1].length);
  const brandCounts: [string, number][] = brands.map(([b, ps]) => [b, ps.length]);

  // ── Brand filter mode (paginated flat grid) ──────────────
  if (brandFilter) {
    const filtered = allCatProducts.filter(
      p => normalizeBrand(p.brand, slug).toLowerCase() === brandFilter.toLowerCase()
    );
    const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function pageUrl(p: number) {
      const params = new URLSearchParams({ brand: brandFilter! });
      if (p > 1) params.set("page", String(p));
      return `/category/${slug}?${params.toString()}`;
    }

    return (
      <div className="flex flex-col md:flex-row gap-8">
        <CategorySidebar productCounts={productCounts} />
        <div className="flex-1 min-w-0">
          <nav className="text-sm text-[#A8A29E] mb-4 flex items-center gap-1.5">
            <Link href="/" className="hover:text-[#CA8A04] transition-colors cursor-pointer">All Products</Link>
            <span>/</span>
            <Link href={`/category/${slug}`} className="hover:text-[#CA8A04] transition-colors cursor-pointer">{cat.name}</Link>
            <span>/</span>
            <span className="text-[#CA8A04] font-medium">{brandFilter}</span>
          </nav>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>{brandFilter}</h1>
            <p className="text-sm text-[#78716C] mt-0.5">{filtered.length.toLocaleString()} products{totalPages > 1 && ` · Page ${page} of ${totalPages}`}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginated.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
          </div>
          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} pageUrl={pageUrl} />}
        </div>
      </div>
    );
  }

  // ── Default mode: brand-grouped with preview ──────────────
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar productCounts={productCounts} />
      <div className="flex-1 min-w-0">
        <nav className="text-sm text-[#A8A29E] mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#CA8A04] transition-colors cursor-pointer">All Products</Link>
          <span>/</span>
          <span className="text-[#A8A29E] font-medium">{cat.name}</span>
        </nav>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>{cat.name}</h1>
          <p className="text-sm text-[#78716C] mt-0.5">{allCatProducts.length.toLocaleString()} products · {brands.length} brands</p>
        </div>

        {brands.length > 2 && (
          <BrandJumpBar brands={brandCounts.slice(0, 30)} categorySlug={slug} />
        )}

        <div className="flex flex-col gap-10">
          {brands.map(([brand, brandProducts], i) => {
            const preview = brandProducts.slice(0, BRAND_PREVIEW);
            const hasMore = brandProducts.length > BRAND_PREVIEW;
            const brandId = `brand-${brand.replace(/\s+/g, "-").toLowerCase()}`;

            return (
              <section key={brand} id={brandId} className="scroll-mt-20">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[rgba(202,138,4,0.15)]">
                  <h2 className="text-lg font-bold text-[#E7E5E4] flex items-center gap-2" style={{ fontFamily: "'Rubik', sans-serif" }}>
                    <span className="text-[#CA8A04] text-sm">◆</span>
                    {brand}
                    <span className="text-sm font-normal text-[#A8A29E]">({brandProducts.length})</span>
                  </h2>
                </div>
                <BrandExpandable
                  brand={brand}
                  categorySlug={slug}
                  initialProducts={preview as Product[]}
                  total={brandProducts.length}
                />
              </section>
            );
          })}
        </div>
      </div>
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
