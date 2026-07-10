from playwright.sync_api import sync_playwright
import os

def run_responsive_test(browser, viewport, name):
    context = browser.new_context(viewport=viewport)
    page = context.new_page()
    page.goto("http://localhost:9002")
    page.wait_for_timeout(5000)
    page.screenshot(path=f"responsive_{name}.png")

    # Go to history
    page.goto("http://localhost:9002/history")
    page.wait_for_timeout(3000)
    page.screenshot(path=f"responsive_history_{name}.png")

    # Go to plate search
    page.goto("http://localhost:9002/plate-search")
    page.wait_for_timeout(3000)
    page.screenshot(path=f"responsive_search_{name}.png")

    context.close()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile
        run_responsive_test(browser, {'width': 375, 'height': 667}, 'mobile')
        # Tablet
        run_responsive_test(browser, {'width': 768, 'height': 1024}, 'tablet')
        # Desktop
        run_responsive_test(browser, {'width': 1280, 'height': 800}, 'desktop')
        browser.close()
