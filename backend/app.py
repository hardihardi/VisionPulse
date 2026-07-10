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
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

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
        logger.info(f"Extracting YouTube stream for: {url}")
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
                logger.error(f"Error extracting YouTube stream: {e}")
                return url
    return url

def process_video():
    global is_processing, counter, video_source, current_frame
    if not video_source:
        return

    logger.info(f"Starting video processing for source: {video_source}")
    stream_url = get_stream_url(video_source)

    # Try to open with ffmpeg backend explicitly if possible
    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():
        logger.error(f"Failed to open video source: {stream_url}")
        is_processing = False
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0: fps = 30
    delay = 1.0 / fps

    while is_processing:
        ret, frame = cap.read()
        if not ret:
            logger.warning("End of stream or read error.")
            if isinstance(video_source, str) and not video_source.startswith(('http', 'rtsp')):
                logger.info("Looping local file.")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            else:
                break

        try:
            processed_frame = counter.process_frame(frame)
            with frame_lock:
                current_frame = processed_frame.copy()
        except Exception as e:
            logger.error(f"Error processing frame: {e}")

        time.sleep(delay * 0.5) # Process slightly faster than real-time if needed

    cap.release()
    is_processing = False
    logger.info("Video processing stopped.")

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

    logger.info(f"Received process-url request: {url}")

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
    return jsonify({
        'status': 'healthy',
        'is_processing': is_processing,
        'video_source': video_source,
        'backend': 'opencv',
        'uptime': time.time()
    })

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
                ret, buffer = cv2.imencode('.jpg', current_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                if not ret:
                    continue
                frame_bytes = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        else:
            time.sleep(0.1)
        time.sleep(0.03)

@app.route('/stream')
def stream_video():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
