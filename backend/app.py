import os
import cv2
import threading
import time
import pandas as pd
from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from traffic_counter import TrafficCounter
import yt_dlp
import io

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'videos'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global state
counter = TrafficCounter()
is_processing = False
video_source = None
processing_thread = None
current_frame = None
frame_lock = threading.Lock()

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
    global is_processing, counter, video_source, current_frame
    if not video_source:
        return

    if video_source == 'test_url':
        while is_processing:
            time.sleep(1)
            counter.counts['Mendekat']['car'] += 1
            counter.history_data.append((time.time(), 'Mendekat', 'car', 1.0, 99))
            counter.detection_log.append({'id': 99, 'type': 'car', 'direction': 'Mendekat', 'time': 'now'})
        return

    stream_url = get_stream_url(video_source)
    cap = cv2.VideoCapture(stream_url)

    while is_processing:
        ret, frame = cap.read()
        if not ret:
            if isinstance(video_source, str) and not video_source.startswith(('http', 'rtsp')):
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                break

        processed_frame = counter.process_frame(frame)
        with frame_lock:
            current_frame = processed_frame.copy()
        time.sleep(0.01)

    cap.release()
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
    return jsonify({
        'status': 'STARTED' if is_processing else 'STOPPED',
        'stats': counter.get_stats()
    })

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
    app.run(host='0.0.0.0', port=5000, threaded=True)
