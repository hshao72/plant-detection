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
