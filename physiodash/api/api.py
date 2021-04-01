
#Code credit: https://github.com/NakulLakhotia/Live-Streaming-using-OpenCV-Flask/blob/main/app.py

from flask import Flask, render_template, Response, request
import cv2
import random
import numpy as np

app = Flask(__name__)
isRecording = False
streamed_frames = []

camera = cv2.VideoCapture(0)  # use 0 for web camera
frame_width = int(camera.get(3))
frame_height = int(camera.get(4))
size = (frame_width, frame_height)

fourcc = cv2.VideoWriter_fourcc('X','V','I','D')
result = cv2.VideoWriter('video_output.avi', fourcc, 10, size)

#  for cctv camera use rtsp://username:password@ip_address:554/user=username_password='password'_channel=channel_number_stream=0.sdp' instead of camera
# for local webcam use cv2.VideoCapture(0)

def gen_frames():  # generate frame by frame from camera
    maxFrames = 400

    while True:
        # Capture frame-by-frame
        success, frame = camera.read()  # read the camera frame
        if not success:
            break
        else:
            result.write(frame)
            if(maxFrames >0):
                maxFrames -=1
            else:
                result.release()


            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result


@app.route('/video_feed')
def video_feed():
    #Video streaming route. Put this in the src attribute of an img tag
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('video.html')


@app.route('/set_record', methods=['GET','POST'])
def startRecord():
    """Video streaming home page."""
    isRecording = True
    streamed_frames.append(gen_frames())
    print(len(streamed_frames))
    return {'isRecording':str(isRecording),'framesNum':str(len(streamed_frames))}

@app.route('/stop_record')
def stopRecord():
    """Video streaming home page."""
    isRecording = False

    if(len(streamed_frames)>0):
        # for frame in streamed_frames:
        #     result.write(frame)
        camera.release()
        result.release()
        cv2.destroyAllWindows()
        print("released")
    
    streamed_frames.clear()
    print("STOPPED")
    return {'isRecording':str(isRecording)}


if __name__ == '__main__':
    app.run(debug=True)
