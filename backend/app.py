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
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

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
stats_lock = threading.Lock()
writer_lock = threading.Lock()
video_writer = None

def load_persistent_stats():
    if os.path.exists(STATS_FILE):
        try:
            with stats_lock:
                with open(STATS_FILE, 'r') as f:
                    data = json.load(f)
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
        with stats_lock:
            with open(STATS_FILE, 'w') as f:
                json.dump(data, f)
    except Exception as e:
        print(f"Error saving stats: {e}")

# Pre-load stats on startup
counter.history_data = load_persistent_stats()
# Update counts based on history
for _, direction, v_type, skr, _ in counter.history_data:
    counter.counts[direction][v_type] += 1

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
    print(f"Starting processing for: {stream_url}")

    # Retry logic for HLS streams
    max_retries = 10
    retry_count = 0

    while retry_count < max_retries and is_processing:
        cap = cv2.VideoCapture(stream_url)
        if not cap.isOpened():
            print(f"Failed to open stream, retry {retry_count+1}/{max_retries}")
            retry_count += 1
            time.sleep(2)
            continue

        retry_count = 0 # reset on success

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30

        while is_processing:
            # Check if we should start recording
            with writer_lock:
                if is_recording and video_writer is None:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"analysis_{timestamp}.mp4"
                    filepath = os.path.join(app.config['RECORDINGS_FOLDER'], filename)
                    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                    video_writer = cv2.VideoWriter(filepath, fourcc, fps, (width, height))

            ret, frame = cap.read()
            if not ret:
                if isinstance(video_source, str) and not video_source.startswith(('http', 'rtsp')):
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    print("Stream interrupted or ended, attempting to reconnect...")
                    break

            processed_frame = counter.process_frame(frame)

            with frame_lock:
                current_frame = processed_frame.copy()

            with writer_lock:
                if is_recording and video_writer is not None:
                    video_writer.write(processed_frame)

            # Control frame rate for HLS to match stream if possible, or just throttle
            time.sleep(0.01)

        cap.release()
        with writer_lock:
            if video_writer:
                video_writer.release()
                video_writer = None

        if not is_processing:
            break

        time.sleep(2) # Wait before retry

    print("Video processing thread stopped")
    is_processing = False

@app.route('/upload-video', methods=['POST'])
def upload_video():
    global is_processing, video_source, processing_thread
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Stop existing processing
        is_processing = False
        if processing_thread:
            processing_thread.join()

        # Start new processing
        is_processing = True
        video_source = file_path
        processing_thread = threading.Thread(target=process_video)
        processing_thread.start()

        return jsonify({'message': 'File uploaded and analysis started', 'filename': filename})

@app.route('/start-url', methods=['POST'])
def start_url():
    global is_processing, video_source, processing_thread
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    # Stop existing processing
    is_processing = False
    if processing_thread:
        processing_thread.join()

    # Start new processing
    is_processing = True
    video_source = url
    processing_thread = threading.Thread(target=process_video)
    processing_thread.start()

    return jsonify({'message': 'Analysis started for URL'})

@app.route('/stop', methods=['POST'])
def stop_analysis():
    global is_processing, is_recording, video_writer
    is_processing = False
    is_recording = False
    with writer_lock:
        if video_writer:
            video_writer.release()
            video_writer = None
    save_persistent_stats()
    return jsonify({'message': 'Analysis stopped'})

@app.route('/recording/start', methods=['POST'])
def start_recording():
    global is_recording
    is_recording = True
    return jsonify({'message': 'Recording started'})

@app.route('/recording/stop', methods=['POST'])
def stop_recording():
    global is_recording, video_writer
    is_recording = False
    with writer_lock:
        if video_writer:
            video_writer.release()
            video_writer = None
    return jsonify({'message': 'Recording stopped'})

@app.route('/recordings', methods=['GET'])
def list_recordings():
    if not os.path.exists(app.config['RECORDINGS_FOLDER']):
        return jsonify({'recordings': []})
    files = [f for f in os.listdir(app.config['RECORDINGS_FOLDER']) if f.endswith(('.mp4', '.avi'))]
    recordings = []
    for f in files:
        path = os.path.join(app.config['RECORDINGS_FOLDER'], f)
        stat = os.stat(path)
        recordings.append({
            'filename': f,
            'size': stat.st_size,
            'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat()
        })
    return jsonify({'recordings': sorted(recordings, key=lambda x: x['created_at'], reverse=True)})

@app.route('/recordings/<filename>', methods=['GET'])
def get_recording(filename):
    return send_from_directory(app.config['RECORDINGS_FOLDER'], filename)

@app.route('/video_feed')
def video_feed():
    def generate():
        while True:
            with frame_lock:
                if current_frame is None:
                    time.sleep(0.1)
                    continue
                ret, buffer = cv2.imencode('.jpg', current_frame)
                frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.1)
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/traffic-stats', methods=['GET'])
def traffic_stats():
    total_m = sum(counter.counts['Mendekat'].values())
    total_j = sum(counter.counts['Menjauh'].values())

    # Calculate SKR (Satuan Kendaraan Roda Empat)
    skr_m = sum(counter.counts['Mendekat'][v] * counter.pcu_coefficients[v] for v in counter.counts['Mendekat'])
    skr_j = sum(counter.counts['Menjauh'][v] * counter.pcu_coefficients[v] for v in counter.counts['Menjauh'])

    return jsonify({
        'counts': {d: dict(v) for d, v in counter.counts.items()},
        'total_count': total_m + total_j,
        'total_skr': skr_m + skr_j,
        'moving_average_skr': {
            'Mendekat': skr_m,
            'Menjauh': skr_j
        },
        'uptime': int(time.time() - counter.start_time),
        'recording': is_recording,
        'config': {
            'line_y': counter.line_y
        },
        'recent_logs': list(counter.detection_log)
    })

@app.route('/update-config', methods=['POST'])
def update_config():
    data = request.json
    if 'line_y' in data:
        counter.line_y = float(data['line_y'])
    return jsonify({'message': 'Configuration updated'})

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
    return jsonify({'error': 'Invalid format'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
