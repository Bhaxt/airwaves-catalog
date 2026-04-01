"use client";

import { useState } from "react";
import { Product } from "@/src/types";
import ProductCard from "./ProductCard";

interface Props {
  brand: string;
  categorySlug: string;
  initialProducts: Product[];
  total: number;
}

export default function BrandExpandable({ brand, categorySlug, initialProducts, total }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasMore = products.length < total;

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?category=${categorySlug}&brand=${encodeURIComponent(brand)}&offset=${products.length}&limit=20`
      );
      const data = await res.json();
      setProducts(prev => [...prev, ...data.products]);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadAll() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?category=${categorySlug}&brand=${encodeURIComponent(brand)}&offset=${products.length}&limit=${total}`
      );
      const data = await res.json();
      setProducts(prev => [...prev, ...data.products]);
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4 && !expanded} />
        ))}
      </div>

      {hasMore && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50"
            style={{ background: "rgba(202,138,4,0.1)", border: "1px solid rgba(202,138,4,0.35)", color: "#CA8A04" }}
          >
            {loading ? "Loading..." : `Show more`}
          </button>
          {total - products.length > 20 && (
            <button
              onClick={loadAll}
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50 text-[#78716C] hover:text-[#A8A29E]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {loading ? "..." : `View all ${total}`}
            </button>
          )}
        </div>
      )}
    </>
  );
}
