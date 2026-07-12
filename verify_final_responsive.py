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
        await page.wait_for_timeout(5000)

        # Switch to simulation
        await page.click('button[role="switch"]')
        await page.wait_for_timeout(5000)
        await page.screenshot(path="verification/desktop_final.png")
        print("Desktop final screenshot saved.")

        # Mobile Test
        mobile_page = await browser.new_page()
        await mobile_page.set_viewport_size({"width": 375, "height": 812})
        print("Testing Mobile Viewport...")
        # Reduce timeout for mobile navigation
        try:
            await mobile_page.goto("http://localhost:9002", timeout=15000)
        except:
            print("Mobile goto timed out but continuing...")

        await mobile_page.wait_for_timeout(5000)

        # Switch to simulation - switch is at the top usually
        try:
            await mobile_page.click('button[role="switch"]')
            await mobile_page.wait_for_timeout(5000)
        except:
            print("Could not click switch on mobile, but taking screenshot anyway.")

        await mobile_page.screenshot(path="verification/mobile_final.png")
        print("Mobile final screenshot saved.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
