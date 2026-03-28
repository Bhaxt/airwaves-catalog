import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Airwaves — Product Catalog",
  description: "Browse our full premium product catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Morphing background blobs */}
        <div className="bg-blob bg-blob-1" aria-hidden="true" />
        <div className="bg-blob bg-blob-2" aria-hidden="true" />

        {/* Navbar — liquid glass */}
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
            <span className="text-xs font-medium tracking-wide text-[#A8A29E]">
              Premium Collection
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>

        {/* Footer — glass */}
        <footer className="relative z-10 mt-16"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(202,138,4,0.15)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-[#57534E]">
            © {new Date().getFullYear()} Airwaves · All rights reserved
          </div>
        </footer>
      </body>
    </html>
  );
}
