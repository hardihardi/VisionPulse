import cv2
url = 'https://eofficev2.bekasikota.go.id/backupcctv/m3/Depan_FTL_Fitness.m3u8'
cap = cv2.VideoCapture(url)
if cap.isOpened():
    print("SUCCESS: Stream opened by OpenCV")
    ret, frame = cap.read()
    if ret:
        print("SUCCESS: Frame read successfully")
        cv2.imwrite("verification/stream_frame.jpg", frame)
    else:
        print("FAILURE: Could not read frame")
else:
    print("FAILURE: Could not open stream")
cap.release()
