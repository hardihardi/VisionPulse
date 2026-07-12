import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # Desktop Test
        page = await browser.new_page()
        await page.set_viewport_size({"width": 1440, "height": 900})
        print("Testing Desktop Viewport...")
        await page.goto("http://localhost:9002")
        await page.wait_for_timeout(5000) # Wait for initial load

        # Switch to simulation to trigger HLS player
        await page.click('button[role="switch"]')
        await page.wait_for_timeout(10000) # Wait for HLS load
        await page.screenshot(path="verification/desktop_hls.png")
        print("Desktop screenshot saved.")

        # Mobile Test
        mobile_page = await browser.new_page()
        await mobile_page.set_viewport_size({"width": 375, "height": 812})
        print("Testing Mobile Viewport...")
        await mobile_page.goto("http://localhost:9002")
        await mobile_page.wait_for_timeout(5000)

        # Switch to simulation
        await mobile_page.click('button[role="switch"]')
        await mobile_page.wait_for_timeout(10000)
        await mobile_page.screenshot(path="verification/mobile_hls.png")
        print("Mobile screenshot saved.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
