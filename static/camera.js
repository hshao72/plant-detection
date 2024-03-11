navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    document.querySelector('video').srcObject = stream;
});


var video = document.getElementById('video'); // The video element
var canvas = document.getElementById('canvas'); // The canvas element
var context = canvas.getContext('2d');


document.getElementById('capture').addEventListener('click', function() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(function(blob) {
        var formData = new FormData();
        formData.append('file', blob, 'capture.jpg');

        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                console.log('Upload successful');
            } else {
                console.error('Upload failed');
            }
        });

        fetch('/classify-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        //.then(response => {
            //console.log(response); // Process and display the results
            // Example: display the first prediction
            //alert("Predicted: " + response.predictions[0].tagName + 
                  //" with probability: " + response.predictions[0].probability);
        .then(data => {
            // Dynamically update the webpage with the prediction results
            displayResults(data);

        })
        .catch(error => console.error('Error calling Azure Custom Vision API:', error));

    }, 'image/jpeg');
});


function classifyImage() {
    const formData = new FormData(document.getElementById('upload-form'));
    fetch('/classify-image2', {
        method: 'POST',
        body: formData, // No need to set Content-Type header, as it's multipart/form-data
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data); // Handle displaying the results on the page
    })
    .catch(error => console.error('Error:', error));

    return false; // Prevent the default form submission
}


function displayResults(data) {
    const predictions = data.predictions;
    const predictionElement = document.getElementById('prediction');
    predictionElement.innerHTML = ''; // Clear previous results
    
    predictions.forEach(prediction => {
        // Create a new paragraph for each prediction
        const p = document.createElement('p');
        p.textContent = `Tag: ${prediction.tagName}, Probability: ${(prediction.probability * 100).toFixed(2)}%`;
        predictionElement.appendChild(p);
    });
}


function previewImage() {
    const input = document.querySelector('input[type=file]');
    const preview = document.getElementById('image-preview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block'; // Show the preview
        };
        
        reader.readAsDataURL(input.files[0]); // Convert the image file to a Data URL
    }
}


function autoUploadImage() {
    const input = document.getElementById('image-input');
    if (input.files && input.files[0]) {
        const file = input.files[0];

        // Optionally, display an image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').src = e.target.result;
            document.getElementById('image-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);

        // Prepare the file for sending
        const formData = new FormData();
        formData.append('file', file);

        // Send the file to your Flask endpoint
        fetch('/classify-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            displayResults(data);
        })
        .catch(error => console.error('Error:', error));
    }
}
