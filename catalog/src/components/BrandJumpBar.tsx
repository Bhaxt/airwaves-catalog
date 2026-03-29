"use client";

import { useState } from "react";

const INITIAL_SHOW = 10;

export default function BrandJumpBar({ brands, categorySlug }: { brands: [string, number][]; categorySlug?: string }) {
  const [expanded, setExpanded] = useState(false);

  // Sort by product count descending
  const sorted = [...brands].sort((a, b) => b[1] - a[1]);
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_SHOW);
  const hidden = sorted.length - INITIAL_SHOW;

  return (
    <div className="mb-8 pb-6 border-b border-white/5">
      <div className="flex flex-wrap gap-2">
        {visible.map(([brand, count]) => (
          <a
            key={brand}
            href={categorySlug ? `/category/${categorySlug}?brand=${encodeURIComponent(brand)}` : `#brand-${brand.replace(/\s+/g, "-").toLowerCase()}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#D6D3D1] transition-all duration-200 cursor-pointer hover:text-[#CA8A04]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(202,138,4,0.5)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          >
            {brand}
            <span className="ml-1.5 text-[#57534E]">{count}</span>
          </a>
        ))}

        {!expanded && hidden > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#CA8A04] cursor-pointer transition-all duration-200 hover:text-[#D97706]"
            style={{ background: "rgba(202,138,4,0.08)", border: "1px solid rgba(202,138,4,0.2)" }}
          >
            +{hidden} more
          </button>
        )}

        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#78716C] cursor-pointer transition-all duration-200 hover:text-[#A8A29E]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
