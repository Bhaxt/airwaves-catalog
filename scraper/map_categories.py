"""
Maps each productList ID to its real category name
by checking what type of products are in each list.
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
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page.set_default_timeout(40000)

        for lid in LIST_IDS:
            url = f"{BASE}/product/productList?category={lid}"
            try:
                await page.goto(url, wait_until="networkidle", timeout=40000)
                await page.wait_for_timeout(1500)
                await page.evaluate("window.scrollBy(0,600)")
                await page.wait_for_timeout(600)

                # Get first 5 product names and links
                prod_links = await page.eval_on_selector_all(
                    "a[href*='product_detail']",
                    "els => els.map(e => ({href: e.href, text: e.textContent.trim().substring(0,50)}))"
                )[:5]

                # Also look for page heading or category title
                heading = ""
                for sel in ["h1", "h2", ".category-title", ".page-title", "[class*='title']"]:
                    el = page.locator(sel).first
                    if await el.count() > 0:
                        t = (await el.inner_text()).strip()
                        if t:
                            heading = t[:60]
                            break

                print(f"\n{lid}:")
                print(f"  Heading: {heading!r}")
                for p_info in prod_links:
                    print(f"  Product: {p_info['text']!r}")

            except Exception as e:
                print(f"\n{lid}: ERROR - {e}")

        await browser.close()

asyncio.run(run())
