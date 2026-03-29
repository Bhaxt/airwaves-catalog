import { NextRequest, NextResponse } from "next/server";

async function getOkkrepCookie(): Promise<string> {
  try {
    const r = await fetch("https://okkrep.com", {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    const setCookie = r.headers.get("set-cookie") || "";
    const match = setCookie.match(/_jpanonym=([^;]+)/);
    return match ? `_jpanonym=${match[1]}` : "";
  } catch {
    return "";
  }
}

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
    const cookie = await getOkkrepCookie();

    const r = await fetch("https://okkrep.com/freight/countFreight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://okkrep.com",
        ...(cookie ? { "Cookie": cookie } : {}),
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
