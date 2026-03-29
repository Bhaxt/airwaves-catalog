import { Suspense } from "react";
import productsData from "@/src/data/products.json";
import { Product, CATEGORIES } from "@/src/types";
import ProductGrid from "@/src/components/ProductGrid";
import CategorySidebar from "@/src/components/CategorySidebar";
import SearchBar from "@/src/components/SearchBar";

const products = productsData as Product[];

// Count products per category
const productCounts = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.slug] = products.filter((p) => p.category === cat.slug).length;
    return acc;
  },
  {} as Record<string, number>
);

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();

  const filtered = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      )
    : products;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <CategorySidebar productCounts={productCounts} />

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>All Products</h1>
            <p className="text-sm text-[#78716C] mt-0.5">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
              {query && ` matching "${q}"`}
            </p>
          </div>
          <Suspense>
            <SearchBar defaultValue={q} />
          </Suspense>
        </div>

        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
