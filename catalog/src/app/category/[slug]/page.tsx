import { Suspense } from "react";
import { notFound } from "next/navigation";
import { allProducts, productCounts, brandsByCategory } from "@/src/lib/products";
import { CATEGORIES, Product } from "@/src/types";
import CategorySidebar from "@/src/components/CategorySidebar";
import ProductCard from "@/src/components/ProductCard";
import BrandExpandable from "@/src/components/BrandExpandable";
import BrandJumpBar from "@/src/components/BrandJumpBar";
import CategoryBrandFilter from "@/src/components/CategoryBrandFilter";
import Link from "next/link";

export const revalidate = 86400; // cache for 24h, revalidates after redeploy

const BRAND_PREVIEW = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const allCatProducts = allProducts.filter((p) => p.category === slug);
  const brands = brandsByCategory[slug] ?? [];
  const brandCounts: [string, number][] = brands.map(([b, ps]) => [b, ps.length]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar productCounts={productCounts} />
      <Suspense fallback={<div className="flex-1 min-w-0" />}>
        <CategoryBrandFilter slug={slug} catName={cat.name}>
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
              {brands.map(([brand, brandProducts]) => {
                const preview = brandProducts.slice(0, BRAND_PREVIEW);
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
        </CategoryBrandFilter>
      </Suspense>
    </div>
  );
}
