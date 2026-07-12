import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict, deque
import time

class TrafficCounter:
    def __init__(self, model_path='yolov8n.pt', line_y=0.5):
        self.model = YOLO(model_path)
        self.line_y = line_y
        self.counts = {
            'Mendekat': defaultdict(int),
            'Menjauh': defaultdict(int)
        }
        self.pcu_coefficients = {
            'motorcycle': 0.25,
            'car': 1.0,
            'bus': 1.5,
            'truck': 2.0,
            'trailer': 2.5
        }
        self.track_history = defaultdict(lambda: deque(maxlen=30))
        self.counted_ids = set()
        self.detection_log = deque(maxlen=20)
        self.history_data = []
        self.start_time = time.time()

    def get_skr(self, cls_name):
        return self.pcu_coefficients.get(cls_name, 1.0)

    def update_config(self, line_y=None):
        if line_y is not None:
            self.line_y = line_y

    def process_frame(self, frame):
        height, width, _ = frame.shape
        line_y_px = int(self.line_y * height)

        results = self.model.track(frame, persist=True, verbose=False)

        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xywh.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            clss = results[0].boxes.cls.int().cpu().tolist()
            names = results[0].names

            for box, track_id, cls in zip(boxes, track_ids, clss):
                x, y, w, h = box
                cls_name = names[cls]
                if cls_name not in self.pcu_coefficients:
                    continue

                track = self.track_history[track_id]
                track.append((float(x), float(y)))

                color = (0, 255, 0)
                cv2.rectangle(frame, (int(x-w/2), int(y-h/2)), (int(x+w/2), int(y+h/2)), color, 2)
                cv2.putText(frame, f"ID: {track_id} {cls_name}", (int(x-w/2), int(y-h/2)-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                if len(track) >= 2:
                    prev_y = track[-2][1]
                    curr_y = track[-1][1]

                    if track_id not in self.counted_ids:
                        direction = None
                        if prev_y < line_y_px <= curr_y:
                            direction = 'Mendekat'
                        elif prev_y > line_y_px >= curr_y:
                            direction = 'Menjauh'

                        if direction:
                            self.counts[direction][cls_name] += 1
                            self.counted_ids.add(track_id)
                            skr_val = self.get_skr(cls_name)
                            timestamp = time.time()
                            self.history_data.append((timestamp, direction, cls_name, skr_val, track_id))
                            self.detection_log.append({
                                'id': track_id,
                                'type': cls_name,
                                'direction': direction,
                                'time': time.strftime('%H:%M:%S', time.localtime(timestamp))
                            })

        cv2.line(frame, (0, line_y_px), (width, line_y_px), (0, 0, 255), 2)
        cv2.putText(frame, f"Counting Line ({self.line_y:.2f})", (10, line_y_px - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        return frame

    def reset(self):
        self.counts = {
            'Mendekat': defaultdict(int),
            'Menjauh': defaultdict(int)
        }
        self.counted_ids = set()
        self.track_history = defaultdict(lambda: deque(maxlen=30))
        self.history_data = []
        self.detection_log.clear()
        self.start_time = time.time()
