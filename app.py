import requests, os, uuid, json
from dotenv import load_dotenv
load_dotenv()


from flask import Flask, redirect, url_for, request, render_template, session
from werkzeug.utils import secure_filename
import os

from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
from msrest.authentication import ApiKeyCredentials

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
            
if __name__ == "__main__":
    app.run(debug=True)