import { NextRequest, NextResponse } from "next/server";
import { allProducts } from "@/src/lib/products";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const brand = searchParams.get("brand") ?? "";
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const filtered = allProducts.filter(p => {
    if (category && p.category !== category) return false;
    if (brand && (p.brand ?? "").toLowerCase() !== brand.toLowerCase()) return false;
    return true;
  });

  return NextResponse.json({
    products: filtered.slice(offset, offset + limit).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      brand: p.brand,
      category: p.category,
      categoryName: p.categoryName,
      images: p.images.slice(0, 1),
      variants: [],
    })),
    total: filtered.length,
  });
}
