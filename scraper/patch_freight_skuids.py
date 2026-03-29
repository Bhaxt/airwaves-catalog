"""
Fetch the correct freight skuId for each product from the product detail page HTML.
The listing API returns 13-digit IDs that don't work with the freight API.
The product detail page HTML has the real short numeric skuId in data-skuId attributes.
"""
import sys, json, re, time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import requests

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PRODUCTS_PATH = Path("G:/My Drive/okkrep-catalog/catalog/src/data/products.json")
TMP_PATH = PRODUCTS_PATH.with_suffix(".tmp")
WORKERS = 20
DELAY = 0.1

_lock = threading.Lock()
_counters = {"patched": 0, "failed": 0, "skipped": 0}

def get_cookie():
    r = requests.get("https://okkrep.com", headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
    for h, v in r.headers.items():
        if h.lower() == "set-cookie" and "_jpanonym=" in v:
            m = re.search(r'_jpanonym=([^;]+)', v)
            if m:
                return f"_jpanonym={m.group(1)}"
    return ""

print("Getting cookie...")
COOKIE = get_cookie()
print(f"Cookie: {COOKIE[:40]}...")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://okkrep.com",
    "Cookie": COOKIE,
}

print("Loading products.json...")
with open(PRODUCTS_PATH, encoding="utf-8") as f:
    products = json.load(f)
print(f"Loaded {len(products)} products")

def fetch_freight_skuid(product):
    # The listing API stores the 13-digit ID as skuId — we need the short one
    listing_id = product.get("skuId", "")

    # If skuId is already short (<=8 digits), it's already correct
    if listing_id and len(listing_id) <= 8:
        return product["id"], None, "already_short"

    if not listing_id:
        return product["id"], None, "no_skuid"

    # Fetch the product detail page to get the real skuId
    url = f"https://okkrep.com/product/product_detail/{listing_id}.html"
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
        html = r.text

        # Extract data-skuId from the skuArea
        skuids = re.findall(r'data-skuId="(\d+)"', html)
        planids = re.findall(r'data-planId="([^"]*)"', html)

        if skuids:
            return product["id"], {"skuId": skuids[0], "planId": planids[0] if planids else ""}, "ok"
        else:
            return product["id"], None, "no_match"
    except Exception as e:
        return product["id"], None, f"error: {e}"

# Build index
product_map = {p["id"]: p for p in products}

print(f"Fetching freight skuIds with {WORKERS} workers...")
completed = 0
save_every = 200

with ThreadPoolExecutor(max_workers=WORKERS) as executor:
    futures = {executor.submit(fetch_freight_skuid, p): p for p in products}
    for future in as_completed(futures):
        prod_id, result, status = future.result()

        if result:
            product_map[prod_id]["skuId"] = result["skuId"]
            product_map[prod_id]["planId"] = result["planId"]
            _counters["patched"] += 1
        elif status == "already_short":
            _counters["skipped"] += 1
        elif status == "no_skuid":
            _counters["skipped"] += 1
        else:
            _counters["failed"] += 1
            if "error" in status:
                print(f"  [{prod_id}] {status}", flush=True)

        completed += 1
        if completed % 100 == 0:
            print(f"[{completed}/{len(products)}] patched={_counters['patched']} failed={_counters['failed']} skipped={_counters['skipped']}", flush=True)

        if completed % save_every == 0:
            with _lock:
                with open(TMP_PATH, "w", encoding="utf-8") as f:
                    json.dump(list(product_map.values()), f, ensure_ascii=False, separators=(",", ":"))
                TMP_PATH.replace(PRODUCTS_PATH)
            print("  [saved checkpoint]", flush=True)

        time.sleep(DELAY / WORKERS)

# Final save
with open(TMP_PATH, "w", encoding="utf-8") as f:
    json.dump(list(product_map.values()), f, ensure_ascii=False, separators=(",", ":"))
TMP_PATH.replace(PRODUCTS_PATH)

print(f"\nDone! patched={_counters['patched']} failed={_counters['failed']} skipped={_counters['skipped']}")
