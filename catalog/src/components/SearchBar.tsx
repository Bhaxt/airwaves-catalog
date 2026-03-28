"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      const val = e.target.value.trim();
      if (val) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="relative w-full max-w-md">
      <span className="absolute inset-y-0 left-3 flex items-center text-[#78716C]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </span>
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Search products…"
        className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-[#E7E5E4] placeholder-[#57534E] focus:outline-none focus:ring-1 focus:ring-[#CA8A04]"
        style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
      />
    </div>
  );
}
