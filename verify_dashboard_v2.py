from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:9002")
    page.wait_for_timeout(3000)

    # Navigate to Storage page
    page.get_by_role("link", name="Penyimpanan Video").click()
    page.wait_for_timeout(2000)

    # Add a new source with the problematic Bekasi link
    page.get_by_role("button", name="Tambah Sumber Baru").click()
    page.wait_for_timeout(1000)

    page.get_by_placeholder("Contoh: Lalu Lintas Pagi Hari").fill("CCTV Bekasi CORS Error")
    page.get_by_placeholder("https://contoh.com/video.mp4").fill("https://eofficev2.bekasikota.go.id/backupcctv/m3/Depan_FTL_Fitness.m3u8")

    page.get_by_role("button", name="Tambah Sumber").click()
    page.wait_for_timeout(2000)

    # Analyze
    row = page.locator("tr", has_text="CCTV Bekasi CORS Error")
    row.get_by_role("button", name="Analisis").click()
    page.wait_for_timeout(8000)

    page.screenshot(path="hls_error_state.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
