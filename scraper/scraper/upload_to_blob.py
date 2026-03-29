#!/usr/bin/env python3
"""Upload all product images to Vercel Blob and update products.json URLs."""
import json, os, sys, time, requests
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

TOKEN = "vercel_blob_rw_sDKWP2Gf1lwaiF4a_XwjxOLruwDK7TJ1Fl3VE3ugQJTFzWD"
BLOB_API = "https://blob.vercel-storage.com"
IMAGES_DIR = Path(__file__).parent.parent / "catalog" / "public" / "images"
PRODUCTS_FILE = Path(__file__).parent.parent / "catalog" / "src" / "data" / "products.json"

def upload_file(local_path: Path, blob_path: str) -> str | None:
    """Upload a local file to Vercel Blob, return public URL."""
    with open(local_path, "rb") as f:
        data = f.read()
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "x-api-version": "7",
        "x-content-type": _mime(local_path.suffix),
        "cache-control": "public, max-age=31536000, immutable",
    }
    r = requests.put(f"{BLOB_API}/{blob_path}", data=data, headers=headers, timeout=30)
    if r.status_code in (200, 201):
        return r.json().get("url")
    print(f"  FAILED {blob_path}: {r.status_code} {r.text[:100]}")
    return None

def _mime(ext: str) -> str:
    return {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "gif": "image/gif"}.get(ext.lstrip(".").lower(), "image/jpeg")

def upload_url(src_url: str, blob_path: str) -> str | None:
    """Download from URL and upload to Vercel Blob."""
    try:
        r = requests.get(src_url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        if r.status_code != 200:
            return None
        ext = src_url.split(".")[-1].split("?")[0][:4]
        headers = {
            "Authorization": f"Bearer {TOKEN}",
            "x-api-version": "7",
            "x-content-type": _mime(ext),
            "cache-control": "public, max-age=31536000, immutable",
        }
        resp = requests.put(f"{BLOB_API}/{blob_path}", data=r.content, headers=headers, timeout=30)
        if resp.status_code in (200, 201):
            return resp.json().get("url")
    except Exception as e:
        print(f"  ERROR {blob_path}: {e}")
    return None

with open(PRODUCTS_FILE, encoding="utf-8") as f:
    products = json.load(f)

print(f"Total products: {len(products)}")
total_imgs = sum(len(p["images"]) for p in products)
print(f"Total images to process: {total_imgs}")

updated = 0
skipped = 0
failed = 0

for i, product in enumerate(products):
    pid = product["id"]
    cat = product["category"]
    new_images = []

    for j, img_url in enumerate(product["images"]):
        ext = img_url.split(".")[-1].split("?")[0][:4] or "jpg"
        blob_path = f"products/{cat}/{pid}/{j}.{ext}"

        if img_url.startswith("/images/"):
            # Local file
            local = IMAGES_DIR / img_url[8:]  # strip /images/
            if local.exists():
                url = upload_file(local, blob_path)
                if url:
                    new_images.append(url)
                    updated += 1
                else:
                    new_images.append(img_url)
                    failed += 1
            else:
                skipped += 1
        elif img_url.startswith("http"):
            # External URL — download and re-upload
            url = upload_url(img_url, blob_path)
            if url:
                new_images.append(url)
                updated += 1
            else:
                new_images.append(img_url)
                failed += 1
        else:
            new_images.append(img_url)
            skipped += 1

    product["images"] = new_images

    if (i + 1) % 50 == 0:
        print(f"  [{i+1}/{len(products)}] uploaded={updated} failed={failed} skipped={skipped}")
        # Save progress
        with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, separators=(",", ":"))

# Final save
with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, separators=(",", ":"))

print(f"\nDone! Uploaded={updated} Failed={failed} Skipped={skipped}")
print("products.json updated with Vercel Blob URLs.")
