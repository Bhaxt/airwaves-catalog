"""
Test pagination on productList pages and the AJAX endpoint.
"""
import asyncio, requests
from playwright.async_api import async_playwright

BASE = "https://okkrep.com"

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.set_default_timeout(40000)

        # Check how many pages the perfume productList has
        cat_id = "1725436535392"   # perfume
        url = f"{BASE}/product/productList?category={cat_id}"
        await page.goto(url, wait_until="networkidle", timeout=40000)
        await page.wait_for_timeout(2000)
        await page.evaluate("window.scrollBy(0, 2000)")
        await page.wait_for_timeout(1000)

        # Count product links on page 1
        p1_links = await page.eval_on_selector_all(
            "a[href*='product_detail']", "els => [...new Set(els.map(e=>e.href))]"
        )
        print(f"Page 1 product links: {len(p1_links)}")

        # Look for pagination
        pag_text = await page.eval_on_selector_all(
            ".J-paginationjs-page, [class*='page'] a, [class*='pagination'] a, .page-link",
            "els => els.map(e => e.textContent.trim()).filter(t => t)"
        )
        print(f"Pagination elements: {pag_text}")

        # Try AJAX endpoint with large pagesize
        print("\n--- Testing AJAX endpoint ---")
        for pagesize in [100, 50]:
            try:
                r = requests.get(
                    f"{BASE}/product/pageProduct",
                    params={"category": cat_id, "pagesize": pagesize, "page": 1, "categoryTags": ""},
                    headers={"User-Agent": "Mozilla/5.0", "Referer": BASE},
                    timeout=15,
                )
                print(f"pagesize={pagesize}: status={r.status_code}, content-type={r.headers.get('content-type','')}")
                txt = r.text[:500]
                print(f"  Body preview: {txt!r}")
            except Exception as e:
                print(f"  Error: {e}")

        # Try page 2 directly
        print("\n--- Page 2 of perfume productList ---")
        await page.goto(f"{url}&page=2", wait_until="networkidle", timeout=40000)
        await page.wait_for_timeout(2000)
        p2_links = await page.eval_on_selector_all(
            "a[href*='product_detail']", "els => [...new Set(els.map(e=>e.href))]"
        )
        print(f"Page 2 product links: {len(p2_links)}")
        for l in p2_links[:5]:
            print(f"  {l}")

        await browser.close()

asyncio.run(test())
