from http.server import BaseHTTPRequestHandler
import os
import json
import cgi
import ssl
from acrcloud.recognizer import ACRCloudRecognizer

# Bypass SSL verification for local dev (fixes macOS certificate issue)
ssl._create_default_https_context = ssl._create_unverified_context

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Parse Multipart Form Data
        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD': 'POST',
                     'CONTENT_TYPE': self.headers['Content-Type'],
                     }
        )

        # 2. Get Audio File
        if 'audio' not in form:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'No audio file provided'}).encode())
            return

        audio_item = form['audio']
        audio_data = audio_item.file.read()

        # 3. Configure ACRCloud
        config = {
            'host': os.environ.get('ACRCLOUD_HOST'),
            'access_key': os.environ.get('ACRCLOUD_ACCESS_KEY'),
            'access_secret': os.environ.get('ACRCLOUD_ACCESS_SECRET'),
            'timeout': 10 # seconds
        }
        
        if not config['host'] or not config['access_key'] or not config['access_secret']:
             self.send_response(500)
             self.end_headers()
             self.wfile.write(json.dumps({'error': 'Server misconfiguration: Missing ACRCloud keys'}).encode())
             return

        # 4. Recognize
        try:
            recognizer = ACRCloudRecognizer(config)
            # This function generates the fingerprint LOCALLY and then sends it to ACRCloud
            # It returns a JSON string
            result = recognizer.recognize_by_filebuffer(audio_data, 0, len(audio_data))
            print(f"ACRCloud Result: {result}") # DEBUG LOG
            
            # DEBUG: Write to file
            try:
                with open('public/debug_result.json', 'w') as f:
                    f.write(result)
            except Exception as e:
                print(f"Failed to write debug file: {e}")
            
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(result.encode())

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
