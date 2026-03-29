"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/src/types";
import BrandSection from "./BrandSection";

export default function LazyBrandSection({ brand, products }: { brand: string; products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const brandId = `brand-${brand.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLoaded(true); observer.disconnect(); } },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (loaded) return <BrandSection brand={brand} products={products} />;

  // Always render the anchor + header so jump links work, lazy-load only the grid
  return (
    <section id={brandId} ref={ref} className="scroll-mt-20">
      <h2
        className="text-lg font-bold text-[#E7E5E4] mb-4 pb-2 border-b border-[rgba(202,138,4,0.15)] flex items-center gap-2"
        style={{ fontFamily: "'Rubik', sans-serif" }}
      >
        <span className="text-[#CA8A04] text-sm">◆</span>
        {brand}
        <span className="text-sm font-normal text-[#A8A29E]">({products.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: Math.min(5, products.length) }).map((_, i) => (
          <div key={i} className="glass-card overflow-hidden animate-pulse">
            <div className="aspect-square bg-white/5" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-4 w-3/4 rounded bg-white/5" />
              <div className="h-4 w-1/2 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
