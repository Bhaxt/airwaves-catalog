import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        for test_url in [
            'https://okkrep.com/product/product_detail/airpods.html',
            'https://okkrep.com/product/product_detail/Dyson-Airwra-HS08.html',
        ]:
            print(f"\n=== {test_url.split('/')[-1]} ===")
            await page.goto(test_url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(1500)

            # Test the correct name selector
            name_el = page.locator('[class~="title"][class*="jp-"]').first
            if await name_el.count() > 0:
                name = (await name_el.inner_text()).strip()
                print(f"NAME: {name!r}")
            else:
                print("NAME: not found")

            # Check all /attachment/ images and where they come from
            imgs = await page.eval_on_selector_all(
                "img[src*='/attachment/']",
                """els => els.map(e => {
                    // Walk up to find the container
                    let p = e.parentElement;
                    let containers = [];
                    while (p && containers.length < 4) {
                        if (p.className) containers.push(p.className.substring(0,50));
                        p = p.parentElement;
                    }
                    return {src: e.src.substring(e.src.lastIndexOf('/')+1, e.src.lastIndexOf('/')+25), containers: containers};
                })"""
            )
            print(f"\nImages ({len(imgs)} total):")
            for img in imgs[:10]:
                print(f"  {img['src']} | in: {img['containers'][:2]}")

asyncio.run(test())
