"""
Quickly visits each productList page and prints the first 3 product names
so we can manually map list IDs to category names.
"""
import asyncio
from playwright.async_api import async_playwright

BASE = "https://okkrep.com"
LIST_IDS = [
    "1706074969037",
    "1725436535392",
    "1725436191210",
    "1706074969042",
    "1756884780140",
    "1747729925493",
    "1742966278833",
]

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.set_default_timeout(45000)

        for lid in LIST_IDS:
            url = f"{BASE}/product/productList?category={lid}"
            try:
                await page.goto(url, wait_until="networkidle", timeout=45000)
                await page.wait_for_timeout(2000)
                await page.evaluate("window.scrollBy(0,500)")
                await page.wait_for_timeout(800)

                # Get first few product titles
                titles = await page.eval_on_selector_all(
                    "a[href*='product_detail']",
                    "els => [...new Set(els.map(e => e.textContent.trim().substring(0,60)))].filter(t=>t.length>2)"
                )

                print(f"\n{lid}:")
                for t in titles[:6]:
                    print(f"  - {t!r}")

            except Exception as e:
                print(f"\n{lid}: ERROR {e}")

        await browser.close()

asyncio.run(run())
