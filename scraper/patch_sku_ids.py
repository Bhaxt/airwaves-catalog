"""
Patch products.json with skuId and planId from the okkrep API.
Keeps all existing fields (especially B2 image URLs) intact.
Only adds/updates skuId and planId.
"""
import sys, json, re, time
from pathlib import Path
import requests

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL  = "https://okkrep.com"
API_URL   = f"{BASE_URL}/product/pageProduct"
PAGE_SIZE = 100
REQUEST_DELAY = 0.2

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": BASE_URL,
    "Accept": "application/json",
}

CATEGORIES = {
    "1706074969037": "electronic",
    "1725436535392": "perfume",
    "1725436191210": "apparel",
    "1706074969042": "shoes",
    "1756884780140": "toys",
    "1747729925493": "watches",
    "1742966278833": "jersey",
    "1731550262376": "bags",
    "1741083147411": "accessories",
    "1736760319221": "accessories",
    "1745403414560": "accessories",
}

PRODUCTS_PATH = Path(__file__).parent.parent / "catalog" / "src" / "data" / "products.json"
TMP_PATH = PRODUCTS_PATH.with_suffix(".tmp")

# Load existing products, index by product id (model field)
print("Loading products.json...")
with open(PRODUCTS_PATH, encoding="utf-8") as f:
    products = json.load(f)

product_map = {p["id"]: p for p in products}
print(f"Loaded {len(products)} products")

# Scrape all categories to get skuId/planId
patched = 0
for cat_id, cat_slug in CATEGORIES.items():
    print(f"\nScraping {cat_slug} (cat {cat_id})...")
    page = 1
    while True:
        try:
            r = requests.get(API_URL, params={
                "category": cat_id,
                "pagesize": PAGE_SIZE,
                "page": page,
                "categoryTags": "",
            }, headers=HEADERS, timeout=20)
            r.raise_for_status()
            items = r.json().get("data", {}).get("list", [])
        except Exception as e:
            print(f"  [error] page {page}: {e}")
            break

        if not items:
            break

        for item in items:
            product_id = str(item.get("model") or item.get("id") or "")
            sku_id = str(item.get("id") or "")
            plan_id = str(item.get("planId") or "")

            if product_id in product_map:
                existing = product_map[product_id]
                if not existing.get("skuId") and sku_id:
                    existing["skuId"] = sku_id
                    existing["planId"] = plan_id
                    patched += 1

        print(f"  page {page}: {len(items)} items")
        if len(items) < PAGE_SIZE:
            break
        page += 1
        time.sleep(REQUEST_DELAY)

print(f"\nPatched {patched} products with skuId/planId")

# Atomic save
print("Saving...")
with open(TMP_PATH, "w", encoding="utf-8") as f:
    json.dump(list(product_map.values()), f, ensure_ascii=False, separators=(",", ":"))
TMP_PATH.replace(PRODUCTS_PATH)
print("Done.")
