import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { CartProvider } from "@/src/context/CartContext";
import NavCartButton from "@/src/components/NavCartButton";
import CartDrawer from "@/src/components/CartDrawer";

export const metadata: Metadata = {
  title: "Airwaves — Product Catalog",
  description: "Browse our full premium product catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to font servers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Non-render-blocking font load */}
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&family=Nunito+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-ignore
          onload="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700&family=Nunito+Sans:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </noscript>
        {/* Preconnect to image CDN */}
        <link rel="preconnect" href="https://f005.backblazeb2.com" />
      </head>
      <body>
        <CartProvider>
          <div className="bg-blob bg-blob-1" aria-hidden="true" />
          <div className="bg-blob bg-blob-2" aria-hidden="true" />

          <header className="glass-nav sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                <span className="text-xl font-bold tracking-tight text-[#E7E5E4] group-hover:text-[#CA8A04] transition-colors duration-200"
                      style={{ fontFamily: "'Rubik', sans-serif" }}>
                  Airwaves
                </span>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#CA8A04] opacity-75 mt-0.5">
                  Catalog
                </span>
              </Link>
              <NavCartButton />
            </div>
          </header>

          <CartDrawer />

          <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>

          <footer className="relative z-10 mt-16"
            style={{ background: "rgba(255,255,255,0.04)", borderTop: "1px solid rgba(202,138,4,0.15)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-[#57534E]">
              © {new Date().getFullYear()} Airwaves · All rights reserved
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
