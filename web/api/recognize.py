from flask import Flask, request, jsonify
import os
from acrcloud.recognizer import ACRCloudRecognizer

app = Flask(__name__)

# Bypass SSL verification for local dev
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

@app.route('/api/recognize', methods=['POST'])
def recognize():
    # 1. Get Audio File
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    audio_data = audio_file.read()

    # 2. Configure ACRCloud
    config = {
        'host': os.environ.get('ACRCLOUD_HOST'),
        'access_key': os.environ.get('ACRCLOUD_ACCESS_KEY'),
        'access_secret': os.environ.get('ACRCLOUD_ACCESS_SECRET'),
        'timeout': 10
    }
    
    if not config['host'] or not config['access_key'] or not config['access_secret']:
         return jsonify({'error': 'Server misconfiguration: Missing ACRCloud keys'}), 500

    # 3. Recognize
    try:
        recognizer = ACRCloudRecognizer(config)
        result = recognizer.recognize_by_filebuffer(audio_data, 0, len(audio_data))
        print(f"ACRCloud Result: {result}")
        
        return result, 200, {'Content-Type': 'application/json'}

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vercel requires the app to be available as 'app'
