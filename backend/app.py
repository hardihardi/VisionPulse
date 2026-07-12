import os
import cv2
import threading
import time
import pandas as pd
import json
from flask import Flask, request, jsonify, Response, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from traffic_counter import TrafficCounter
import yt_dlp
import io
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'videos'
RECORDINGS_FOLDER = 'recordings'
DATA_FOLDER = 'data'
STATS_FILE = os.path.join(DATA_FOLDER, 'traffic_stats.json')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RECORDINGS_FOLDER, exist_ok=True)
os.makedirs(DATA_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RECORDINGS_FOLDER'] = RECORDINGS_FOLDER

# Global state
counter = TrafficCounter()
is_processing = False
is_recording = False
video_source = None
processing_thread = None
current_frame = None
frame_lock = threading.Lock()
video_writer = None

def load_persistent_stats():
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, 'r') as f:
                data = json.load(f)
                # Load historical data but keep current session counts clean if preferred
                # For this implementation, we'll merge them or just use for history
                return data.get('history', [])
        except Exception as e:
            print(f"Error loading stats: {e}")
    return []

def save_persistent_stats():
    data = {
        'last_updated': datetime.now().isoformat(),
        'counts': {d: dict(v) for d, v in counter.counts.items()},
        'history': counter.history_data
    }
    try:
        with open(STATS_FILE, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Error saving stats: {e}")

def get_stream_url(url):
    """Extract direct stream URL using yt-dlp if it's a YouTube link."""
    if 'youtube.com' in url or 'youtu.be' in url:
        ydl_opts = {
            'format': 'best',
            'quiet': True,
            'no_warnings': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
                return info['url']
            except Exception as e:
                print(f"Error extracting stream: {e}")
                return url
    return url

def process_video():
    global is_processing, counter, video_source, current_frame, is_recording, video_writer

    if not video_source:
        return

    # Simulation mode for testing
    if video_source == 'test_url':
        while is_processing:
            time.sleep(1)
            counter.counts['Mendekat']['car'] += 1
            counter.history_data.append((time.time(), 'Mendekat', 'car', 1.0, 99))
            counter.detection_log.append({'id': 99, 'type': 'car', 'direction': 'Mendekat', 'time': 'now'})
            save_persistent_stats()
        return

    stream_url = get_stream_url(video_source)

    # Retry logic for HLS streams
    max_retries = 5
    retry_count = 0

    while is_processing and retry_count < max_retries:
        cap = cv2.VideoCapture(stream_url)
        if not cap.isOpened():
            print(f"Failed to open video source, retry {retry_count+1}")
            retry_count += 1
            time.sleep(2)
            continue

        retry_count = 0 # Reset on success

        # Setup VideoWriter if recording is enabled at start
        if is_recording and video_writer is None:
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 20
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"analysis_{timestamp}.mp4"
            filepath = os.path.join(app.config['RECORDINGS_FOLDER'], filename)
            # Use MP4V for compatibility
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video_writer = cv2.VideoWriter(filepath, fourcc, fps, (width, height))

        while is_processing:
            ret, frame = cap.read()
            if not ret:
                # If it's a file, loop it. If it's a stream, it might have ended or broken.
                if isinstance(video_source, str) and not video_source.startswith(('http', 'rtsp')):
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    print("Stream interrupted, attempting to reconnect...")
                    break

            processed_frame = counter.process_frame(frame)

            with frame_lock:
                current_frame = processed_frame.copy()

            if is_recording and video_writer is not None:
                video_writer.write(processed_frame)

            # Throttle processing slightly to avoid 100% CPU on fast sources
            time.sleep(0.001)

        cap.release()
        if video_writer:
            video_writer.release()
            video_writer = None

        if not is_processing:
            break

        time.sleep(1) # Wait before retry

    is_processing = False

@app.route('/upload-video', methods=['POST'])
def upload_video():
    global video_source, is_processing, processing_thread, counter

    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Stop existing processing
    is_processing = False
    if processing_thread:
        processing_thread.join()

    counter.reset()
    video_source = file_path
    is_processing = True
    processing_thread = threading.Thread(target=process_video)
    processing_thread.start()

    return jsonify({'message': 'Video uploaded and processing started', 'file_path': file_path})

@app.route('/process-url', methods=['POST'])
def process_url():
    global video_source, is_processing, processing_thread, counter

    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    # Stop existing processing
    is_processing = False
    if processing_thread:
        processing_thread.join()

    counter.reset()
    video_source = url
    is_processing = True
    processing_thread = threading.Thread(target=process_video)
    processing_thread.start()

    return jsonify({'message': 'URL received and processing started', 'url': url})

@app.route('/update-config', methods=['POST'])
def update_config():
    data = request.json
    line_y = data.get('line_y')
    if line_y is not None:
        counter.update_config(line_y=float(line_y))
        return jsonify({'message': 'Configuration updated', 'config': {'line_y': line_y}})
    return jsonify({'error': 'Invalid config data'}), 400

@app.route('/traffic-stats', methods=['GET'])
def get_traffic_stats():
    save_persistent_stats() # Auto-save on stats request
    return jsonify({
        'status': 'STARTED' if is_processing else 'STOPPED',
        'recording': is_recording,
        'stats': counter.get_stats()
    })

@app.route('/recording/start', methods=['POST'])
def start_recording():
    global is_recording
    is_recording = True
    return jsonify({'message': 'Recording enabled. It will start with the next/current video processing session.'})

@app.route('/recording/stop', methods=['POST'])
def stop_recording():
    global is_recording, video_writer
    is_recording = False
    if video_writer:
        # Note: In current architecture, process_video loop owns the writer.
        # Setting is_recording to False will make the loop stop writing but release happens at end of loop or manually here.
        pass
    return jsonify({'message': 'Recording stopped'})

@app.route('/recordings', methods=['GET'])
def list_recordings():
    files = [f for f in os.listdir(app.config['RECORDINGS_FOLDER']) if f.endswith(('.mp4', '.avi'))]
    recordings = []
    for f in files:
        path = os.path.join(app.config['RECORDINGS_FOLDER'], f)
        stats = os.stat(path)
        recordings.append({
            'filename': f,
            'size': stats.st_size,
            'created_at': datetime.fromtimestamp(stats.st_ctime).isoformat()
        })
    return jsonify({'recordings': sorted(recordings, key=lambda x: x['created_at'], reverse=True)})

@app.route('/recordings/<filename>')
def get_recording(filename):
    return send_from_directory(app.config['RECORDINGS_FOLDER'], filename)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'uptime': time.time()})

@app.route('/export/<fmt>', methods=['GET'])
def export_data(fmt):
    history = counter.history_data
    if not history:
        return jsonify({'error': 'No data available to export'}), 400

    df = pd.DataFrame(history, columns=['Timestamp', 'Direction', 'Vehicle Type', 'SKR Value', 'Track ID'])
    df['Time'] = pd.to_datetime(df['Timestamp'], unit='s').dt.strftime('%Y-%m-%d %H:%M:%S')
    df = df[['Time', 'Track ID', 'Vehicle Type', 'Direction', 'SKR Value']]

    if fmt == 'csv':
        output = io.StringIO()
        df.to_csv(output, index=False)
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=traffic_report.csv"}
        )
    elif fmt == 'xlsx':
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Detections')
            summary_mendekat = df[df['Direction'] == 'Mendekat'].groupby('Vehicle Type').size().reset_index(name='Count')
            summary_menjauh = df[df['Direction'] == 'Menjauh'].groupby('Vehicle Type').size().reset_index(name='Count')
            summary_mendekat.to_excel(writer, index=False, sheet_name='Summary Mendekat')
            summary_menjauh.to_excel(writer, index=False, sheet_name='Summary Menjauh')

        output.seek(0)
        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="traffic_report.xlsx"
        )

    return jsonify({'error': 'Unsupported format'}), 400

@app.route('/stop', methods=['POST'])
def stop_processing():
    global is_processing
    is_processing = False
    save_persistent_stats()
    return jsonify({'message': 'Processing stopped'})

def generate_frames():
    global is_processing, current_frame
    while is_processing:
        if current_frame is not None:
            with frame_lock:
                # Use lower quality for MJPEG to save bandwidth/CPU
                ret, buffer = cv2.imencode('.jpg', current_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                if not ret:
                    continue
                frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.04)

@app.route('/stream')
def stream_video():
    if not is_processing:
        return "Not processing", 404
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Initialize history if exists
    counter.history_data = load_persistent_stats()
    app.run(host='0.0.0.0', port=5000, threaded=True)
