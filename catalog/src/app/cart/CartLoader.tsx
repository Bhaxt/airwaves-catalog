"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/src/context/CartContext";
import products from "@/src/data/products.json";
import { Product } from "@/src/types";

const productMap = new Map<string, Product>(
  (products as Product[]).map(p => [p.id, p])
);

export default function CartLoader() {
  const searchParams = useSearchParams();
  const { addItem, setIsOpen } = useCart();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const itemsParam = searchParams.get("items");
    const country = searchParams.get("country");

    if (itemsParam) {
      const pairs = itemsParam.split(",");
      for (const pair of pairs) {
        const [id, qty] = pair.split(":");
        const product = productMap.get(id);
        if (product) {
          for (let i = 0; i < (parseInt(qty) || 1); i++) {
            addItem(product);
          }
        }
      }
    }

    if (country) {
      sessionStorage.setItem("cart-country", country);
    }

    setTimeout(() => setIsOpen(true), 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#57534E]">
      <p className="text-sm">Opening your cart...</p>
    </div>
  );
}
