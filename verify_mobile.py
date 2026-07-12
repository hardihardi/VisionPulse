import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 375, "height": 812})
        print("Navigating to dashboard (Mobile)...")
        try:
            await page.goto("http://localhost:9002", timeout=20000, wait_until="commit")
            await asyncio.sleep(5)
            await page.screenshot(path="verification/mobile_layout.png")
            print("Mobile layout screenshot saved.")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
