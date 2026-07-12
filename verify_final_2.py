import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 375, "height": 812})

        print("Navigating to dashboard...")
        await page.goto("http://localhost:9002", wait_until="networkidle")

        # Switch to simulation to trigger HlsVideoPlayer
        await page.click('button[role="switch"]')
        print("Switched to simulation mode.")

        # Wait for potential timeout (20s)
        print("Waiting 25 seconds for player state...")
        await asyncio.sleep(25)

        await page.screenshot(path="verification/final_verified.png")

        # Check for retry button if it failed
        has_retry = await page.is_visible("text=Coba Hubungkan Kembali")
        print(f"Retry button visible: {has_retry}")

        # Check for backend status
        backend_offline = await page.is_visible("text=Backend Offline")
        print(f"Backend Offline visible: {backend_offline}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
