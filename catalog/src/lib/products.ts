import productsData from "@/src/data/products.json";
import { Product } from "@/src/types";

// Full product list — loaded once at module level (cached by Node.js module system)
export const allProducts = productsData as Product[];

// Slim cards — only what ProductCard needs, no description/skuId/planId/sourceUrl
export type SlimProduct = Pick<Product, "id" | "name" | "price" | "brand" | "category" | "categoryName" | "images" | "variants">;

export const slimProducts: SlimProduct[] = allProducts.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  brand: p.brand,
  category: p.category,
  categoryName: p.categoryName,
  images: p.images.slice(0, 1), // only first image for card
  variants: [],
}));

export const productCounts = allProducts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

// Pre-computed brand maps per category — built once on server start, instant on every request
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

export const brandsByCategory: Record<string, [string, Product[]][]> = {};

for (const p of allProducts) {
  if (!brandsByCategory[p.category]) brandsByCategory[p.category] = [];
  const map = new Map(brandsByCategory[p.category]);
  const brand = normalizeBrand(p.brand, p.category);
  if (!map.has(brand)) map.set(brand, []);
  map.get(brand)!.push(p);
  brandsByCategory[p.category] = Array.from(map.entries());
}

// Sort each category's brands by product count descending
for (const cat of Object.keys(brandsByCategory)) {
  brandsByCategory[cat].sort((a, b) => b[1].length - a[1].length);
}
