import requests
import time
import subprocess
import os
import signal

def test_api():
    print("Starting Flask server for testing...")
    process = subprocess.Popen(['python3', 'backend/app.py'],
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)

    # Wait for the server to start
    for i in range(15):
        try:
            resp = requests.get("http://localhost:5000/traffic-stats")
            if resp.status_code == 200:
                print("Server is up!")
                break
        except:
            pass
        time.sleep(2)

    base_url = "http://localhost:5000"

    try:
        # Test 1: GET /traffic-stats
        print("Test 1: GET /traffic-stats")
        resp = requests.get(f"{base_url}/traffic-stats")
        data = resp.json()
        print(f"Stats: {data}")
        assert resp.status_code == 200
        assert 'config' in data['stats']
        assert data['stats']['config']['line_y'] == 0.5

        # Test 2: POST /update-config
        print("Test 2: POST /update-config")
        resp = requests.post(f"{base_url}/update-config", json={"line_y": 0.75})
        assert resp.status_code == 200

        resp = requests.get(f"{base_url}/traffic-stats")
        assert resp.json()['stats']['config']['line_y'] == 0.75

        # Test 3: POST /process-url (mock)
        print("Test 3: POST /process-url")
        requests.post(f"{base_url}/process-url", json={"url": "test_url"})
        time.sleep(3)

        # Test 4: GET /export/csv
        print("Test 4: GET /export/csv")
        resp = requests.get(f"{base_url}/export/csv")
        assert resp.status_code == 200
        assert 'text/csv' in resp.headers['Content-Type']

        # Test 5: GET /export/xlsx
        print("Test 5: GET /export/xlsx")
        resp = requests.get(f"{base_url}/export/xlsx")
        assert resp.status_code == 200
        assert 'spreadsheet' in resp.headers['Content-Type']

        print("\nAll Advanced API tests passed!")

    except Exception as e:
        print(f"\nTests failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("Stopping Flask server...")
        process.terminate()
        process.wait()

if __name__ == "__main__":
    test_api()
