"use client";

import { useState } from "react";
import Link from "next/link";
import { Product, Variant } from "@/src/types";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants?.find(v => v.id) ?? null
  );

  const images = product.images.length > 0 ? product.images : ["/images/placeholder.png"];
  const activeImage = images[activeIdx];

  function fmtPrice(p: string | undefined) {
    if (!p) return "";
    const n = parseFloat(p);
    return isNaN(n) ? p : `$${n.toFixed(2)}`;
  }
  const displayPrice = fmtPrice(selectedVariant?.price || product.price);

  function selectVariant(v: Variant, idx: number) {
    setSelectedVariant(v);
    if (idx < images.length) setActiveIdx(idx);
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-[#57534E] mb-6 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#CA8A04] transition-colors cursor-pointer">All Products</Link>
        <span className="text-[#44403C]">/</span>
        <Link href={`/category/${product.category}`} className="hover:text-[#CA8A04] transition-colors cursor-pointer">
          {product.categoryName}
        </Link>
        <span className="text-[#44403C]">/</span>
        <span className="text-[#A8A29E] font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="glass-card relative w-full aspect-square overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain transition-opacity duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                    i === activeIdx
                      ? "border-[#CA8A04] shadow-[0_0_16px_rgba(202,138,4,0.4)]"
                      : "border-white/10 hover:border-[rgba(202,138,4,0.4)]"
                  }`}
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#CA8A04] mb-2">
              {product.categoryName}
            </p>
            <h1 className="text-2xl font-bold leading-snug text-[#E7E5E4]"
                style={{ fontFamily: "'Rubik', sans-serif" }}>
              {product.name}
            </h1>
          </div>

          {/* Price */}
          {displayPrice && (
            <div className="glass-card px-5 py-3 inline-flex items-baseline gap-1 self-start border-[rgba(202,138,4,0.3)]">
              <span className="text-3xl font-bold text-[#CA8A04]"
                    style={{ fontFamily: "'Rubik', sans-serif" }}>
                {displayPrice}
              </span>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.filter(v => v.id).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C] mb-2">
                Models
                {selectedVariant?.name && (
                  <span className="ml-2 normal-case font-normal text-[#57534E]">
                    — {selectedVariant.name}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter(v => v.id).map((v, i) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => selectVariant(v, i)}
                      className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-[#CA8A04] text-[#1a1714] font-bold shadow-[0_4px_16px_rgba(202,138,4,0.4)]"
                          : "glass-card text-[#A8A29E] hover:text-[#E7E5E4]"
                      }`}
                    >
                      {v.name || v.id}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && product.description !== "AAAAA" && (
            <div className="glass-card p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C] mb-2">Description</p>
              <p className="text-sm text-[#A8A29E] leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <Link
              href={`/category/${product.category}`}
              className="text-sm text-[#CA8A04] hover:text-[#D97706] cursor-pointer transition-colors flex items-center gap-1"
            >
              ← Back to {product.categoryName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
