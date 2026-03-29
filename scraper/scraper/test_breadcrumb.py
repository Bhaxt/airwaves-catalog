import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        for url in [
            'https://okkrep.com/product/product_detail/airpods.html',
            'https://okkrep.com/product/product_detail/Rolex-Submariner.html',
            'https://okkrep.com/product/product_detail/LV-Monogram-Bag.html',
        ]:
            await page.goto(url, wait_until='networkidle', timeout=20000)
            await page.wait_for_timeout(1000)
            links = await page.eval_on_selector_all(
                'a',
                'els => els.map(e => ({href: e.href, text: e.textContent.trim().substring(0,50)}))'
            )
            print(f"\n=== {url.split('/')[-1]} ===")
            for l in links:
                if l['text'] and 'okkrep' in l.get('href','') and l['href'] != 'https://okkrep.com/':
                    print(f"  {l['text']!r:40} -> {l['href']}")
        await browser.close()

asyncio.run(test())
