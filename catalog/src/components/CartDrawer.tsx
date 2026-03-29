"use client";

import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/src/context/CartContext";
import countries from "@/src/data/countries.json";

const COUNTRY_LIST = Object.entries(countries as Record<string, string>).sort((a, b) =>
  a[0].localeCompare(b[0])
);

export default function CartDrawer() {
  const { items, removeItem, updateQty, clear, total, count, isOpen, setIsOpen } = useCart();
  const [country, setCountry] = useState("228"); // US default
  const [countryName, setCountryName] = useState("United States");
  const [shipping, setShipping] = useState<number | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Share Cart");

  const fetchShipping = useCallback(async (code: string) => {
    if (!items.length) { setShipping(null); return; }
    const shippableItems = items.filter(i => i.product.skuId);
    if (!shippableItems.length) { setShipping(null); return; }

    setLoadingShipping(true);
    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: code,
          items: shippableItems.map(i => ({
            skuId: i.product.skuId,
            planId: i.product.planId || "",
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      setShipping(data.shipping ?? null);
    } catch {
      setShipping(null);
    } finally {
      setLoadingShipping(false);
    }
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      // Restore country from shared link if present
      const saved = sessionStorage.getItem("cart-country");
      if (saved && saved !== country) {
        const name = COUNTRY_LIST.find(([, v]) => v === saved)?.[0] ?? "";
        setCountry(saved);
        setCountryName(name);
        sessionStorage.removeItem("cart-country");
        fetchShipping(saved);
        return;
      }
      fetchShipping(country);
    }
  }, [isOpen, items, country, fetchShipping]);

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const code = e.target.value;
    const name = COUNTRY_LIST.find(([, v]) => v === code)?.[0] ?? "";
    setCountry(code);
    setCountryName(name);
    fetchShipping(code);
  }

  function shareCart() {
    const encoded = items.map(i => `${i.product.id}:${i.quantity}`).join(",");
    const url = `${window.location.origin}/cart?items=${encodeURIComponent(encoded)}&country=${country}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Share Cart"), 2000);
    });
  }

  const grandTotal = total + (shipping ?? 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "rgba(28,25,23,0.97)", backdropFilter: "blur(24px)", borderLeft: "1px solid rgba(202,138,4,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-[#E7E5E4]" style={{ fontFamily: "'Rubik', sans-serif" }}>
            Cart
            {count > 0 && <span className="ml-2 text-sm font-normal text-[#78716C]">({count} item{count !== 1 ? "s" : ""})</span>}
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-[#78716C] hover:text-[#E7E5E4] transition-colors text-xl leading-none cursor-pointer">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <p className="text-[#57534E] text-sm text-center mt-12">Your cart is empty.</p>
          ) : (
            items.map(item => (
              <div
                key={`${item.product.id}-${item.selectedVariant ?? ""}`}
                className="flex gap-3 items-start p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {item.product.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#E7E5E4] font-medium leading-snug line-clamp-2">{item.product.name}</p>
                  {item.selectedVariant && (
                    <p className="text-xs text-[#78716C] mt-0.5">{item.selectedVariant}</p>
                  )}
                  <p className="text-sm font-bold text-[#CA8A04] mt-1">
                    ${(parseFloat(item.product.price || "0") * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-[#44403C] hover:text-red-400 transition-colors text-xs cursor-pointer"
                  >
                    Remove
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#A8A29E] hover:text-[#E7E5E4] cursor-pointer transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >−</button>
                    <span className="text-sm text-[#E7E5E4] w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#A8A29E] hover:text-[#E7E5E4] cursor-pointer transition-colors"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 flex flex-col gap-3">
            {/* Country selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                Ship To
              </label>
              <select
                value={country}
                onChange={handleCountryChange}
                className="w-full px-3 py-2 rounded-lg text-sm text-[#E7E5E4] cursor-pointer"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", outline: "none" }}
              >
                {COUNTRY_LIST.map(([name, code]) => (
                  <option key={code} value={code} style={{ background: "#1c1917" }}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-[#A8A29E]">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#A8A29E]">
                <span>Shipping to {countryName}</span>
                <span>
                  {loadingShipping ? (
                    <span className="text-[#57534E]">...</span>
                  ) : shipping !== null ? (
                    shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`
                  ) : (
                    <span className="text-[#57534E]">—</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#E7E5E4] text-base pt-1 border-t border-white/5 mt-1">
                <span>Total</span>
                <span className="text-[#CA8A04]">
                  {shipping !== null ? `$${grandTotal.toFixed(2)}` : `$${total.toFixed(2)}`}
                  {shipping === null && <span className="text-xs font-normal text-[#57534E] ml-1">+ shipping</span>}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={shareCart}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 text-[#CA8A04]"
                style={{ background: "rgba(202,138,4,0.1)", border: "1px solid rgba(202,138,4,0.3)" }}
              >
                {copyLabel}
              </button>
              <button
                onClick={clear}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 text-[#57534E] hover:text-[#A8A29E]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
