"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/src/types";
import BrandSection from "./BrandSection";

export default function LazyBrandSection({ brand, products }: { brand: string; products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <BrandSection brand={brand} products={products} />
      ) : (
        // Placeholder keeps layout height so page doesn't jump
        <div style={{ minHeight: Math.ceil(products.length / 5) > 1 ? 320 : 280 }}>
          <div className="h-8 w-48 rounded bg-white/5 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: Math.min(5, products.length) }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="aspect-square bg-white/5" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-4 w-1/2 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
