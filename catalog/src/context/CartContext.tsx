"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/src/types";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("airwaves-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("airwaves-cart", JSON.stringify(items));
  }, [items]);

  function addItem(product: Product, variant?: string) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.selectedVariant === variant);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.selectedVariant === variant
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
    setIsOpen(true);
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  }

  function clear() { setItems([]); }

  const total = items.reduce((sum, i) => sum + parseFloat(i.product.price || "0") * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
