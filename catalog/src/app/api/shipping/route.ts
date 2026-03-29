import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { items, countryCode } = await req.json();

  if (!items?.length || !countryCode) {
    return NextResponse.json({ shipping: 0 });
  }

  const skuList = items.map((item: { skuId: string; planId: string; quantity: number }) => ({
    id: item.skuId,
    num: item.quantity,
    planId: item.planId || "",
  }));

  try {
    const r = await fetch("https://okkrep.com/freight/countFreight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://okkrep.com",
      },
      body: JSON.stringify({ skuList, country: countryCode }),
    });

    const data = await r.json();
    if (data.code === 0) {
      return NextResponse.json({ shipping: data.totalFreight });
    }
    return NextResponse.json({ shipping: 0 });
  } catch {
    return NextResponse.json({ shipping: 0 });
  }
}
