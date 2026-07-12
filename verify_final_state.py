import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Desktop
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1280, "height": 800})
        print("Desktop Viewport...")
        await page.goto("http://localhost:9002", wait_until="commit")
        await asyncio.sleep(5)
        await page.screenshot(path="verification/desktop_final.png", full_page=False)

        # Mobile
        mobile_page = await browser.new_page()
        await mobile_page.set_viewport_size({"width": 375, "height": 812})
        print("Mobile Viewport...")
        await mobile_page.goto("http://localhost:9002", wait_until="commit")
        await asyncio.sleep(5)
        await mobile_page.screenshot(path="verification/mobile_final.png", full_page=False)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
