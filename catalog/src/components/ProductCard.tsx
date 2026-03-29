"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Product } from "@/src/types";
import { useCart } from "@/src/context/CartContext";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const thumb = product.images[0] || "/images/placeholder.png";
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/product/${encodeURIComponent(product.id)}`}
      className="glass-card group flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-[15px]"
           style={{ background: "rgba(255,255,255,0.04)" }}>
        <Image
          src={thumb}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          quality={60}
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(202,138,4,0.15)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <button
          onClick={handleAdd}
          className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
          style={added
            ? { background: "rgba(202,138,4,0.2)", border: "1px solid rgba(202,138,4,0.5)", color: "#CA8A04" }
            : { background: "rgba(202,138,4,0.85)", color: "#1a1714" }
          }
        >
          {added ? "Added ✓" : "+ Cart"}
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-sm font-medium text-[#D6D3D1] line-clamp-2 leading-snug">
          {product.name}
        </p>
        {product.price && (
          <p className="text-base font-bold text-[#CA8A04]"
             style={{ fontFamily: "'Rubik', sans-serif" }}>
            ${parseFloat(product.price).toFixed(2)}
          </p>
        )}
        <p className="text-[11px] text-[#57534E] uppercase tracking-wide font-medium">
          {product.categoryName}
        </p>
      </div>
    </Link>
  );
}
