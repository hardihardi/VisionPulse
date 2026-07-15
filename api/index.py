from flask import Flask, jsonify, request
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Mock state
is_processing = False
video_source = None
start_time = None
counts = {
    'Mendekat': {'car': 0, 'bus': 0, 'truck': 0, 'motorcycle': 0},
    'Menjauh': {'car': 0, 'bus': 0, 'truck': 0, 'motorcycle': 0}
}
recent_logs = []

@app.route('/api/traffic-stats', methods=['GET'])
@app.route('/traffic-stats', methods=['GET'])
def traffic_stats():
    global is_processing, counts, start_time
    status = 'STARTED' if is_processing else 'STOPPED'
    
    # Generate mock increments if processing
    if is_processing:
        import random
        # Randomly increment vehicle counts
        directions = ['Mendekat', 'Menjauh']
        types = ['car', 'bus', 'truck', 'motorcycle']
        if random.random() > 0.4:
            d = random.choice(directions)
            t = random.choice(types)
            counts[d][t] += 1
            timestamp = time.time()
            recent_logs.insert(0, {
                'id': random.randint(100, 999),
                'type': t,
                'direction': d,
                'time': time.strftime('%H:%M:%S', time.localtime(timestamp))
            })
            if len(recent_logs) > 10:
                recent_logs.pop()

    # Calculate total SKR
    coefficients = {'motorcycle': 0.25, 'car': 1.0, 'bus': 1.5, 'truck': 2.0}
    total_skr = {
        'Mendekat': sum(counts['Mendekat'][k] * coefficients.get(k, 1.0) for k in counts['Mendekat']),
        'Menjauh': sum(counts['Menjauh'][k] * coefficients.get(k, 1.0) for k in counts['Menjauh'])
    }
    
    # Calculate moving average (mock)
    moving_average = {
        'Mendekat': float(sum(counts['Mendekat'].values())),
        'Menjauh': float(sum(counts['Menjauh'].values()))
    }

    return jsonify({
        'status': status,
        'stats': {
            'config': {'line_y': 0.5},
            'counts': counts,
            'moving_average_skr': moving_average,
            'total_skr': total_skr,
            'recent_logs': recent_logs,
            'raw_history_count': sum(sum(d.values()) for d in counts.values())
        }
    })

@app.route('/api/process-url', methods=['POST'])
@app.route('/process-url', methods=['POST'])
def process_url():
    global is_processing, video_source, start_time, counts, recent_logs
    data = request.json or {}
    url = data.get('url')
    
    is_processing = True
    video_source = url
    start_time = time.time()
    
    # Reset counts
    counts = {
        'Mendekat': {'car': 0, 'bus': 0, 'truck': 0, 'motorcycle': 0},
        'Menjauh': {'car': 0, 'bus': 0, 'truck': 0, 'motorcycle': 0}
    }
    recent_logs = []
    
    return jsonify({
        'message': 'URL received and processing started',
        'url': url
    })

@app.route('/api/stop', methods=['POST'])
@app.route('/stop', methods=['POST'])
def stop():
    global is_processing
    is_processing = False
    return jsonify({'message': 'Processing stopped'})

# Fallback for Vercel WSGI
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({"error": "Not Found"}), 404
