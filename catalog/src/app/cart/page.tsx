import { Suspense } from "react";
import CartLoader from "./CartLoader";

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#57534E]">
        <p className="text-sm">Loading your cart...</p>
      </div>
    }>
      <CartLoader />
    </Suspense>
  );
}
