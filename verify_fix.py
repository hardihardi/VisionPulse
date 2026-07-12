import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Set viewport to mobile to match the user's screenshot
        await page.set_viewport_size({"width": 375, "height": 812})

        print("Navigating to dashboard...")
        await page.goto("http://localhost:9002")

        # Wait for the dashboard to load
        await page.wait_for_selector("text=VisionPulse Traffic AI")

        print("Switching to Simulation mode to test player...")
        # Find simulation switch and click it
        await page.click('button[role="switch"]')

        # Wait a bit for the player to initialize
        await asyncio.sleep(10)

        # Take screenshot of the player area
        await page.screenshot(path="verification/hls_fix_test.png")
        print("Screenshot saved to verification/hls_fix_test.png")

        # Check if the loading overlay is still there
        is_loading = await page.is_visible("text=Menghubungkan ke Aliran HLS...")
        print(f"Is loading overlay visible: {is_loading}")

        # Check if error message is visible
        is_error = await page.is_visible("text=Gagal memuat manifest HLS")
        print(f"Is error message visible: {is_error}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
