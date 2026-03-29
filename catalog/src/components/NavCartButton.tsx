"use client";

import { useCart } from "@/src/context/CartContext";

export default function NavCartButton() {
  const { count, setIsOpen } = useCart();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5"
      aria-label="Open cart"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#A8A29E]">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 text-[#1a1714]"
          style={{ background: "#CA8A04" }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
