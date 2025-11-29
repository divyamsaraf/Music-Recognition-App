from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/test', methods=['GET'])
@app.route('/', methods=['GET'])
def test():
    return jsonify({'message': 'Flask API is working!'})
