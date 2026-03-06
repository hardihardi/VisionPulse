import requests
import time
import subprocess
import os
import signal

def test_api():
    print("Starting Flask server for testing...")
    # Start the server as a subprocess
    process = subprocess.Popen(['python3', 'backend/app.py'],
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)

    # Wait for the server to start (increased wait time)
    for i in range(15):
        print(f"Waiting... {i+1}")
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
        # Test 1: GET /traffic-stats (initial state)
        print("Test 1: GET /traffic-stats")
        resp = requests.get(f"{base_url}/traffic-stats")
        print(f"Status: {resp.status_code}")
        print(f"Data: {resp.json()}")
        assert resp.status_code == 200
        assert resp.json()['status'] == 'STOPPED'

        # Test 2: POST /process-url (mock URL)
        print("\nTest 2: POST /process-url")
        resp = requests.post(f"{base_url}/process-url", json={"url": "test_url"})
        print(f"Status: {resp.status_code}")
        print(f"Data: {resp.json()}")
        assert resp.status_code == 200

        # Wait a bit for processing to "start"
        time.sleep(3)

        # Test 3: GET /traffic-stats (active state)
        print("\nTest 3: GET /traffic-stats (STARTED)")
        resp = requests.get(f"{base_url}/traffic-stats")
        print(f"Status: {resp.status_code}")
        print(f"Data: {resp.json()}")
        assert resp.status_code == 200
        assert resp.json()['status'] == 'STARTED'
        # Check if some data was generated in mock
        assert resp.json()['stats']['counts']['Mendekat']['car'] > 0

        # Test 4: POST /stop
        print("\nTest 4: POST /stop")
        resp = requests.post(f"{base_url}/stop")
        print(f"Status: {resp.status_code}")
        assert resp.status_code == 200

        print("\nAll API tests passed!")

    except Exception as e:
        print(f"\nTests failed: {e}")
        # Print server logs if it failed
        out, err = process.communicate()
        print(f"Server STDOUT: {out.decode()}")
        print(f"Server STDERR: {err.decode()}")
    finally:
        # Terminate the server
        print("Stopping Flask server...")
        process.terminate()
        process.wait()

if __name__ == "__main__":
    test_api()
