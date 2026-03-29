import { notFound } from "next/navigation";
import productsData from "@/src/data/products.json";
import { Product, CATEGORIES } from "@/src/types";
import CategorySidebar from "@/src/components/CategorySidebar";
import BrandSection from "@/src/components/BrandSection";
import LazyBrandSection from "@/src/components/LazyBrandSection";
import BrandJumpBar from "@/src/components/BrandJumpBar";
import Link from "next/link";

const products = productsData as Product[];

const productCounts = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.slug] = products.filter((p) => p.category === cat.slug).length;
    return acc;
  },
  {} as Record<string, number>
);

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
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

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();

  const filtered = products.filter((p) => p.category === slug);

  const brandMap = new Map<string, Product[]>();
  for (const p of filtered) {
    const brand = normalizeBrand(p.brand, slug);
    if (!brandMap.has(brand)) brandMap.set(brand, []);
    brandMap.get(brand)!.push(p);
  }
  const brands = Array.from(brandMap.entries()).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar productCounts={productCounts} />

      <div className="flex-1 min-w-0">
        <nav className="text-sm text-[#A8A29E] mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#CA8A04] transition-colors cursor-pointer">All Products</Link>
          <span className="text-[#D6D3D1]">/</span>
          <span className="text-[#A8A29E] font-medium">{cat.name}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>{cat.name}</h1>
          <p className="text-sm text-[#78716C] mt-0.5 font-medium">
            {filtered.length} products
            {brands.length > 1 && ` · ${brands.length} brands`}
          </p>
        </div>

        {brands.length > 2 && (
          <BrandJumpBar brands={brands.map(([b, bp]) => [b, bp.length])} />
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#57534E]">
            <p>No products yet — refresh shortly.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {brands.map(([brand, brandProducts], i) =>
              i < 3 ? (
                <BrandSection key={brand} brand={brand} products={brandProducts} />
              ) : (
                <LazyBrandSection key={brand} brand={brand} products={brandProducts} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
