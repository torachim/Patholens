import { Niivue } from "./index.js";



document.addEventListener('DOMContentLoaded', function() {

    const nv = new Niivue()
    const canvas = document.getElementById("imageBrain");

    nv.attachToCanvas(canvas);

    const baseApiURL = `/image/api/getImage/${imageID}`;


    // Load FLAIR default
    let selectedFormat = "FLAIR";
    loadImage(selectedFormat);

    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (event) => {
            selectedFormat = event.target.value;
            loadImage(selectedFormat);
        });
    });

  


    console.log(selectedFormat)

    

    function loadImage(format) {
        const apiURL = `${baseApiURL}/?format =${format}`;
        console.log(`API URL: ${apiURL}`);

        fetch(apiURL)
            .then(response => {
                console.log("Response status:", response.status);
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                console.log(response)
                return response.json();
            })
            .then(data => {
                const imageURL = `http://127.0.0.1:8000${data.path}`;
                console.log("Image URL:", imageURL);

                
                nv.loadVolumes([
                    {
                        url: imageURL,
                        schema: "nifti"
                    },
                ]);

            })
            .catch(err => {
                console.error("Error loading NIfTI file:", err);
            });
    }
})