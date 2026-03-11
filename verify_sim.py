import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto('http://localhost:9002')

        # Enable simulation mode
        await page.wait_for_selector('#mode-switch')
        await page.click('#mode-switch')
        print("Simulation switch clicked")

        # Wait for data to populate
        await asyncio.sleep(5)

        # Check if charts are rendering
        await page.wait_for_selector('.recharts-surface')
        print("Charts rendered in simulation mode")

        await page.screenshot(path='/home/jules/verification/simulation_mode.png')
        await browser.close()

if __name__ == '__main__':
    asyncio.run(verify())
