"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/src/types";

const CATEGORY_ICONS: Record<string, string> = {
  electronic:  "⚡",
  perfume:     "✦",
  apparel:     "◈",
  shoes:       "◉",
  accessories: "◎",
  bags:        "◆",
  toys:        "◇",
  watches:     "◐",
  jersey:      "▲",
};

interface Props {
  productCounts: Record<string, number>;
}

export default function CategorySidebar({ productCounts }: Props) {
  const pathname = usePathname();

  const allCount = Object.values(productCounts).reduce((a, b) => a + b, 0);

  return (
    <aside className="w-full md:w-56 shrink-0">
      {/* Mobile: horizontal scrollable pill bar */}
      <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 w-max">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              pathname === "/"
                ? "bg-[#CA8A04] text-black"
                : "glass-card text-[#D6D3D1]"
            }`}
          >
            <span>All</span>
            <span className="text-xs opacity-70">{allCount}</span>
          </Link>
          {CATEGORIES.map((cat) => {
            const active = pathname === `/category/${cat.slug}`;
            const count = productCounts[cat.slug] ?? 0;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? "bg-[#CA8A04] text-black"
                    : "glass-card text-[#D6D3D1]"
                }`}
              >
                <span>{CATEGORY_ICONS[cat.slug] ?? "◦"}</span>
                <span>{cat.name}</span>
                <span className="text-xs opacity-70">{count}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop: vertical list */}
      <div className="hidden md:block">
        <h2 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#78716C] mb-3 px-3"
            style={{ fontFamily: "'Rubik', sans-serif" }}>
          Categories
        </h2>
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
              pathname === "/"
                ? "glass-card gold-border text-white"
                : "text-[#D6D3D1] hover:text-white hover:bg-white/8"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-[#CA8A04] text-xs">●</span>
              <span>All Products</span>
            </span>
            <span className="text-xs text-[#A8A29E] tabular-nums">{allCount}</span>
          </Link>

          {CATEGORIES.map((cat) => {
            const active = pathname === `/category/${cat.slug}`;
            const count = productCounts[cat.slug] ?? 0;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200 ${
                  active
                    ? "glass-card gold-border text-white font-semibold"
                    : "text-[#D6D3D1] hover:text-white hover:bg-white/8"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`text-xs ${active ? "text-[#CA8A04]" : "text-[#A8A29E]"}`}>
                    {CATEGORY_ICONS[cat.slug] ?? "◦"}
                  </span>
                  <span>{cat.name}</span>
                </span>
                <span className="text-xs text-[#A8A29E] tabular-nums">{count}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
