import requests, os, uuid, json
from flask import jsonify
from dotenv import load_dotenv
load_dotenv()


from flask import Flask, redirect, url_for, request, render_template, session
from werkzeug.utils import secure_filename
import os

from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
from msrest.authentication import ApiKeyCredentials

endpoint = os.getenv('CUSTOM_VISION_ENDPOINT')
print("Endpoint URL:", endpoint)  # This should print the actual endpoint URL

prediction_key = os.getenv('PREDICTION_KEY')
print("Prediction Key:", prediction_key)  # This should print the prediction key


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index2.html')


@app.route('/', methods=['POST'])
def index_post():
    if 'file' not in request.files:
        return redirect(request.url)
    file = request.files['file']
    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == '':
        return redirect(request.url)
    if file:
        # Secure the filename before saving it directly
        filename = secure_filename(file.filename)
        # Save the file to a directory, e.g., 'uploads'
        filepath = os.path.join('upload', filename)
        file.save(filepath)
        # Now you can use the image for further processing as needed
    
    return render_template(
        'results2.html'
    )
    
@app.route('/upload', methods=['POST'])   
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        # Process the file as needed, e.g., save it to a file or a database
        filename = secure_filename(file.filename)
        filepath = os.path.join('upload', filename)
        file.save(filepath)
        return 'File uploaded successfully', 200
    
    
@app.route('/classify-image', methods=['POST'])
def classify_image():
    # Load the Azure Custom Vision API details from .env
    endpoint = os.getenv('CUSTOM_VISION_ENDPOINT')
    prediction_key = os.getenv('PREDICTION_KEY')
    headers = {
        'Content-Type': 'application/octet-stream',
        'Prediction-Key': prediction_key
    }

    # Get the image from the request
    image = request.files['file'].read()

    # Send the image to Azure Custom Vision API
    response = requests.post(endpoint, headers=headers, data=image)
    response.raise_for_status()
    results = response.json()

    # Return the classification results
    return jsonify(results)

            
if __name__ == "__main__":
    app.run(debug=True)