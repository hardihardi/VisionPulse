import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict, deque
import time

class TrafficCounter:
    def __init__(self, model_path='yolov8n.pt', line_y=0.5):
        self.model = YOLO(model_path)
        self.line_y_ratio = line_y
        self.counts = {
            'Mendekat': defaultdict(int),
            'Menjauh': defaultdict(int)
        }
        self.skr_coefficients = {
            'motorcycle': 0.25,
            'car': 1.0,
            'bus': 1.5,
            'truck': 2.0
        }
        self.track_history = defaultdict(lambda: deque(maxlen=30))
        self.counted_ids = set()

        # For Moving Average
        self.history_data = [] # List of (timestamp, direction, vehicle_type, skr_value)

    def get_skr(self, cls_name):
        return self.skr_coefficients.get(cls_name, 1.0)

    def process_frame(self, frame):
        height, width, _ = frame.shape
        line_y = int(self.line_y_ratio * height)

        # Run YOLOv8 tracking
        results = self.model.track(frame, persist=True, verbose=False)

        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xywh.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            clss = results[0].boxes.cls.int().cpu().tolist()
            names = results[0].names

            for box, track_id, cls in zip(boxes, track_ids, clss):
                x, y, w, h = box
                cls_name = names[cls]

                # We only care about specific classes
                if cls_name not in self.skr_coefficients:
                    continue

                track = self.track_history[track_id]
                track.append((float(x), float(y)))

                # Draw bounding box and ID
                cv2.rectangle(frame, (int(x-w/2), int(y-h/2)), (int(x+w/2), int(y+h/2)), (0, 255, 0), 2)
                cv2.putText(frame, f"ID: {track_id} {cls_name}", (int(x-w/2), int(y-h/2)-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                # Check if it crossed the line
                if len(track) >= 2:
                    prev_y = track[-2][1]
                    curr_y = track[-1][1]

                    if track_id not in self.counted_ids:
                        direction = None
                        if prev_y < line_y <= curr_y:
                            direction = 'Mendekat' # Moving down
                        elif prev_y > line_y >= curr_y:
                            direction = 'Menjauh'  # Moving up

                        if direction:
                            self.counts[direction][cls_name] += 1
                            self.counted_ids.add(track_id)
                            skr_val = self.get_skr(cls_name)
                            self.history_data.append((time.time(), direction, cls_name, skr_val))

        # Draw the counting line
        cv2.line(frame, (0, line_y), (width, line_y), (0, 0, 255), 2)
        cv2.putText(frame, "Counting Line", (10, line_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        return frame

    def get_stats(self):
        # Prune history data to prevent memory leaks (keep only last 2 hours)
        now = time.time()
        two_hours_ago = now - 2 * 60 * 60
        self.history_data = [item for item in self.history_data if item[0] > two_hours_ago]

        # Calculate totals
        total_skr = {
            'Mendekat': sum(self.counts['Mendekat'][v] * self.skr_coefficients[v] for v in self.counts['Mendekat']),
            'Menjauh': sum(self.counts['Menjauh'][v] * self.skr_coefficients[v] for v in self.counts['Menjauh'])
        }

        # Calculate Moving Average (last 15 mins)
        fifteen_mins_ago = now - 15 * 60

        ma_skr = {'Mendekat': 0, 'Menjauh': 0}
        for ts, direction, vtype, skr in self.history_data:
            if ts > fifteen_mins_ago:
                ma_skr[direction] += skr

        # Convert to per hour rate
        ma_skr['Mendekat'] = ma_skr['Mendekat'] * 4 # (60/15)
        ma_skr['Menjauh'] = ma_skr['Menjauh'] * 4

        return {
            'counts': self.counts,
            'total_skr': total_skr,
            'moving_average_skr': ma_skr,
            'raw_history_count': len(self.history_data)
        }

    def reset(self):
        self.counts = {
            'Mendekat': defaultdict(int),
            'Menjauh': defaultdict(int)
        }
        self.counted_ids = set()
        self.track_history = defaultdict(lambda: deque(maxlen=30))
        self.history_data = []
