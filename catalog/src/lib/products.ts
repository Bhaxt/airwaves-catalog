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
