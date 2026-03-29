"""
Intercept network requests on a product page to find the JSON API
that returns product details (variants, images, category, prices).
"""
import asyncio
import json
from playwright.async_api import async_playwright

async def run():
    captured = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Intercept all XHR / fetch requests
        async def on_response(response):
            url = response.url
            ct = response.headers.get("content-type", "")
            if "json" in ct or "api" in url.lower() or "product" in url.lower():
                try:
                    body = await response.json()
                    captured.append({"url": url, "body": body})
                    print(f"  JSON response: {url}")
                except Exception:
                    pass

        page.on("response", on_response)

        print("Loading AirPods page...")
        await page.goto(
            "https://okkrep.com/product/product_detail/airpods.html",
            wait_until="networkidle",
            timeout=30000,
        )
        await page.wait_for_timeout(3000)

        print(f"\nCaptured {len(captured)} JSON responses:\n")
        for item in captured:
            print(f"URL: {item['url']}")
            body_str = json.dumps(item['body'], indent=2, ensure_ascii=False)
            print(body_str[:2000])
            print("---")

        await browser.close()

asyncio.run(run())
