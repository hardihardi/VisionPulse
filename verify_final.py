import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_viewport_size({"width": 375, "height": 812})

        print("Navigating to dashboard...")
        await page.goto("http://localhost:9002")

        # Check backend status
        await page.wait_for_selector(".badge")
        status_text = await page.inner_text(".badge:has-text('Backend')")
        print(f"Backend status on UI: {status_text}")

        # Test HLS player in simulation
        await page.click('button[role="switch"]')
        print("Switched to simulation mode.")

        await asyncio.sleep(5)
        await page.screenshot(path="verification/final_check.png")

        # Verify if loading overlay disappears or error shows up
        is_loading = await page.is_visible("text=Menghubungkan ke Aliran HLS...")
        is_error = await page.is_visible("text=Gagal memuat manifest HLS")
        print(f"Loading: {is_loading}, Error: {is_error}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
