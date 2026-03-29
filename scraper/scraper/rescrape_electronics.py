#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Re-scrape only the electronics category with:
  - Proper slugified IDs (URL-safe)
  - SKU variants parsed from the `skus` field
  - Fresh image downloads (old electronic images deleted first)
"""
import sys, json, re, time, shutil
from pathlib import Path
import requests

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_URL  = "https://okkrep.com"
API_URL   = f"{BASE_URL}/product/pageProduct"
PAGE_SIZE = 100

ELECTRONIC_CAT_ID = "1706074969037"
CAT_SLUG  = "electronic"
CAT_NAME  = "Electronic Products"

OUTPUT_DIR   = Path(__file__).parent.parent / "catalog"
IMAGES_DIR   = OUTPUT_DIR / "public" / "images"
DATA_DIR     = OUTPUT_DIR / "src" / "data"
PRODUCTS_OUT = DATA_DIR / "products.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": BASE_URL,
    "Accept":  "application/json",
}

def log(msg):
    print(msg, flush=True)

def slugify(text: str) -> str:
    text = str(text).strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return re.sub(r'^-+|-+$', '', text).lower() or 'product'

def download_image(url: str, dest: Path) -> str:
    if not url:
        return ""
    if not url.startswith("http"):
        url = BASE_URL + url
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent": HEADERS["User-Agent"]})
        r.raise_for_status()
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.content)
        return "/" + dest.relative_to(OUTPUT_DIR / "public").as_posix()
    except Exception as e:
        log(f"    [img error] {url}: {e}")
        return url

def fetch_page(page: int) -> list[dict]:
    try:
        r = requests.get(
            API_URL,
            params={"category": ELECTRONIC_CAT_ID, "pagesize": PAGE_SIZE, "page": page, "categoryTags": ""},
            headers=HEADERS, timeout=20,
        )
        r.raise_for_status()
        return r.json().get("data", {}).get("list", [])
    except Exception as e:
        log(f"  [api error] page={page}: {e}")
        return []

def build_product(item: dict) -> dict:
    # Use slugified model as ID so URLs are always clean
    raw_model = str(item.get("model") or item.get("id") or "").strip()
    if not raw_model:
        return {}
    product_id = slugify(raw_model)

    name  = (item.get("title") or item.get("seoDesc") or raw_model).strip()
    price = str(item.get("price") or "")
    brand = (item.get("brand") or "").strip()

    desc_html   = item.get("descContent") or ""
    description = re.sub(r'<[^>]+>', ' ', desc_html).strip()
    description = re.sub(r'\s+', ' ', description)[:500]

    imgs_arr = item.get("imgsArr") or []
    if not imgs_arr:
        imgs_raw = item.get("imgs") or ""
        imgs_arr = [s.strip() for s in imgs_raw.split(",") if s.strip()]

    std_url    = item.get("standardUrl") or item.get("url") or ""
    source_url = BASE_URL + std_url if std_url else ""

    # Parse SKU variants from the `skus` slash-separated string
    skus_raw = (item.get("skus") or "").strip()
    variants = []
    if skus_raw:
        for sku in skus_raw.split("/"):
            sku = sku.strip()
            if sku:
                variants.append({
                    "id":    slugify(sku),
                    "name":  sku,
                    "price": price,   # per-SKU pricing not available in listing API
                    "image": "",
                })

    return {
        "id":           product_id,
        "name":         name,
        "price":        price,
        "brand":        brand,
        "category":     CAT_SLUG,
        "categoryName": CAT_NAME,
        "description":  description,
        "images":       imgs_arr,   # raw URLs, replaced below
        "variants":     variants,
        "sourceUrl":    source_url,
    }

def run():
    # 1. Load existing products.json
    all_products: list[dict] = []
    if PRODUCTS_OUT.exists():
        try:
            all_products = json.loads(PRODUCTS_OUT.read_text(encoding="utf-8"))
            log(f"Loaded {len(all_products)} existing products.")
        except Exception:
            pass

    # 2. Remove all existing electronic products
    non_electronic = [p for p in all_products if p.get("category") != CAT_SLUG]
    removed = len(all_products) - len(non_electronic)
    log(f"Removed {removed} old electronic products. Keeping {len(non_electronic)} from other categories.")

    # 3. Delete electronic image folder so images are downloaded fresh
    elec_img_dir = IMAGES_DIR / CAT_SLUG
    if elec_img_dir.exists():
        shutil.rmtree(elec_img_dir)
        log(f"Deleted old image folder: {elec_img_dir}")
    elec_img_dir.mkdir(parents=True, exist_ok=True)

    # 4. Re-scrape electronics from API
    new_products: list[dict] = []
    seen_ids: set[str] = set()

    page_num = 1
    while True:
        log(f"\nFetching page {page_num}...")
        items = fetch_page(page_num)
        if not items:
            log("No more items. Done.")
            break

        for item in items:
            product = build_product(item)
            if not product or not product["id"]:
                continue
            pid = product["id"]
            if pid in seen_ids:
                continue
            seen_ids.add(pid)

            # Download images fresh
            img_dir = IMAGES_DIR / CAT_SLUG / pid
            local_imgs = []
            for j, img_url in enumerate(product["images"][:10]):
                ext  = Path(img_url.split("?")[0]).suffix or ".jpg"
                dest = img_dir / f"{j+1}{ext}"
                local_imgs.append(download_image(img_url, dest))
            product["images"] = local_imgs

            new_products.append(product)
            log(f"  + {pid} | {len(product['variants'])} SKUs | {len(local_imgs)} imgs | {product['name'][:50]}")

        log(f"Page {page_num}: {len(items)} items fetched, {len(new_products)} total new.")

        if len(items) < PAGE_SIZE:
            log("Last page reached.")
            break

        page_num += 1
        time.sleep(0.3)

    # 5. Merge and save
    final = non_electronic + new_products
    PRODUCTS_OUT.write_text(
        json.dumps(final, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )
    log(f"\nDone — {len(new_products)} electronics + {len(non_electronic)} others = {len(final)} total.")
    log(f"Saved to: {PRODUCTS_OUT}")

if __name__ == "__main__":
    run()
