#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
okkrep.com Product Scraper — v5 (API-based, fast, complete)

Uses the /product/pageProduct JSON API to get ALL products across all pages.
No browser/Playwright needed for listings — just fast HTTP requests.
"""
import sys, json, re, time
from pathlib import Path
from urllib.parse import urljoin

import requests

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# ── Config ─────────────────────────────────────────────────────────────────────

BASE_URL = "https://okkrep.com"
API_URL  = f"{BASE_URL}/product/pageProduct"
PAGE_SIZE = 100   # max per API request

# Confirmed category ID → (slug, display name)
LIST_TO_CATEGORY = {
    "1706074969037": ("electronic",   "Electronic Products"),
    "1725436535392": ("perfume",      "Perfume"),
    "1725436191210": ("apparel",      "Apparel"),
    "1706074969042": ("shoes",        "Shoes"),
    "1756884780140": ("toys",         "Toys"),
    "1747729925493": ("watches",      "Watches"),
    "1742966278833": ("jersey",       "Jersey"),
    "1731550262376": ("bags",         "Bags"),
    "1741083147411": ("accessories",  "Apparel Accessories"),
    "1736760319221": ("accessories",  "Apparel Accessories"),
    "1745403414560": ("accessories",  "Apparel Accessories"),
}

OUTPUT_DIR   = Path(__file__).parent.parent / "catalog"
IMAGES_DIR   = OUTPUT_DIR / "public" / "images"
DATA_DIR     = OUTPUT_DIR / "src" / "data"
PRODUCTS_OUT = DATA_DIR / "products.json"

DOWNLOAD_IMAGES = False
REQUEST_DELAY   = 0.3   # seconds between API calls (be polite)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": BASE_URL,
    "Accept": "application/json",
}

# ── Helpers ─────────────────────────────────────────────────────────────────────

def log(msg):
    print(msg, flush=True)

def slugify(text: str) -> str:
    text = str(text).strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return re.sub(r'^-+|-+$', '', text).lower() or 'product'

def download_image(url: str, dest: Path) -> str:
    """Download image, return /images/... public path."""
    if not url:
        return ""
    if not url.startswith("http"):
        url = BASE_URL + url
    if dest.exists():
        return "/" + dest.relative_to(OUTPUT_DIR / "public").as_posix()
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": HEADERS["User-Agent"]})
        r.raise_for_status()
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.content)
        return "/" + dest.relative_to(OUTPUT_DIR / "public").as_posix()
    except Exception as e:
        log(f"    [img error] {url}: {e}")
        return url

def fetch_products_page(category_id: str, page: int) -> list[dict]:
    """Call the API and return the list of product dicts for one page."""
    try:
        r = requests.get(
            API_URL,
            params={
                "category": category_id,
                "pagesize": PAGE_SIZE,
                "page": page,
                "categoryTags": "",
            },
            headers=HEADERS,
            timeout=20,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("data", {}).get("list", [])
    except Exception as e:
        log(f"    [api error] cat={category_id} page={page}: {e}")
        return []

def build_product(item: dict, cat_slug: str, cat_name: str) -> dict:
    """Convert a raw API item into our product schema."""
    product_id = str(item.get("model") or item.get("id") or "")
    if not product_id:
        return {}

    name  = (item.get("title") or item.get("seoDesc") or product_id).strip()
    price = str(item.get("price") or "")
    brand = (item.get("brand") or "").strip()
    desc_html = item.get("descContent") or ""

    # Strip HTML tags from description
    description = re.sub(r'<[^>]+>', ' ', desc_html).strip()
    description = re.sub(r'\s+', ' ', description)[:500]

    # Images — imgsArr is an array; imgs is a comma-separated string fallback
    imgs_arr = item.get("imgsArr") or []
    if not imgs_arr:
        imgs_raw = item.get("imgs") or ""
        imgs_arr = [s.strip() for s in imgs_raw.split(",") if s.strip()]

    # Source URL for reference
    std_url = item.get("standardUrl") or item.get("url") or ""
    source_url = BASE_URL + std_url if std_url else ""

    # SKU variants — comma or slash separated string
    skus_raw = item.get("skus") or ""
    variants = [s.strip() for s in re.split(r"[/,]", skus_raw) if s.strip()]

    # Freight calculation fields
    sku_id = str(item.get("id") or "")
    plan_id = str(item.get("planId") or "")

    return {
        "id":           product_id,
        "name":         name,
        "price":        price,
        "brand":        brand,
        "category":     cat_slug,
        "categoryName": cat_name,
        "description":  description,
        "images":       imgs_arr,
        "variants":     variants,
        "skuId":        sku_id,
        "planId":       plan_id,
        "sourceUrl":    source_url,
    }

# ── Main ─────────────────────────────────────────────────────────────────────────

def run():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing products to resume
    all_products: list[dict] = []
    if PRODUCTS_OUT.exists():
        try:
            all_products = json.loads(PRODUCTS_OUT.read_text(encoding="utf-8"))
            log(f"Resuming — {len(all_products)} products already saved.")
        except Exception:
            pass
    already_done: set[str] = {p["id"] for p in all_products}

    global_seen: set[str] = set(already_done)

    for cat_id, (cat_slug, cat_name) in LIST_TO_CATEGORY.items():
        log(f"\n{'='*60}")
        log(f"  Category: {cat_name} (id={cat_id})")
        log(f"{'='*60}")

        page_num = 1
        cat_count = 0

        while True:
            log(f"  Fetching page {page_num}...")
            items = fetch_products_page(cat_id, page_num)

            if not items:
                log(f"  No more items on page {page_num}. Done with {cat_name}.")
                break

            new_count = 0
            for item in items:
                product = build_product(item, cat_slug, cat_name)
                if not product or not product["id"]:
                    continue

                pid = product["id"]
                if pid in global_seen:
                    continue
                global_seen.add(pid)

                # Download images
                if DOWNLOAD_IMAGES and product["images"]:
                    img_dir = IMAGES_DIR / cat_slug / pid
                    local_imgs = []
                    for j, img_url in enumerate(product["images"][:10]):
                        ext = Path(img_url).suffix or ".jpg"
                        dest = img_dir / f"{j+1}{ext}"
                        local_imgs.append(download_image(img_url, dest))
                    product["images"] = local_imgs

                all_products.append(product)
                already_done.add(pid)
                new_count += 1
                cat_count += 1

            log(f"  Page {page_num}: {len(items)} items, {new_count} new. Total so far: {len(all_products)}")

            # Save checkpoint every page
            PRODUCTS_OUT.write_text(
                json.dumps(all_products, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )

            # If fewer items than PAGE_SIZE returned, this was the last page
            if len(items) < PAGE_SIZE:
                log(f"  Last page reached for {cat_name}.")
                break

            page_num += 1
            time.sleep(REQUEST_DELAY)

        log(f"  {cat_name} complete: {cat_count} new products added.")

    # Final save
    PRODUCTS_OUT.write_text(
        json.dumps(all_products, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    log(f"\n{'='*60}")
    log(f"  DONE — {len(all_products)} total products")
    log(f"  Saved to: {PRODUCTS_OUT}")
    log(f"{'='*60}")

if __name__ == "__main__":
    run()
