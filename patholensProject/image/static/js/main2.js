import { Niivue, DRAG_MODE } from "./index.js";

document.addEventListener('DOMContentLoaded', function() {
    // init niivue instance
    const nv = new Niivue({
    });
        
    const canvas = document.getElementById("imageBrain");

    //function to resize the canvas field in dependency of the device
    function adjustCanvasForDPI(canvas) {
        const dpi = window.devicePixelRatio || 1;
    
        // Get the size from the canvas element from the css
        const computedStyle = getComputedStyle(canvas);
        const width = parseInt(computedStyle.getPropertyValue('width'), 10);
        const height = parseInt(computedStyle.getPropertyValue('height'), 10);
    
        // set the new width and height 
        canvas.width = width * dpi;
        canvas.height = height * dpi;
    }
    
    nv.attachToCanvas(canvas);

    adjustCanvasForDPI(canvas);

    nv.setMultiplanarPadPixels(60);


    const baseApiURL = `/image/api/getAImask/${diagnosisID}`;

    // Load  default
    let selectedFormat = "DEEPFCD";
    loadImage(selectedFormat);
    

    // Get the select element with the ID 'AIdropdown'
    const aiDropdown = document.getElementById('AIdropdown');

    // Add an event listener for the 'change' event
    aiDropdown.addEventListener('change', (event) => {
        // Get the value of the selected option
        selectedFormat = event.target.value;
        loadImage(selectedFormat);
        
    });


    function loadImage(format) {
        //get the apiURL to fetch the path to the requested image
        const apiURL = `${baseApiURL}/?format =${format}`;
        console.log(`API URL: ${apiURL}`);

        //fetch the data from the given apiURL
        fetch(apiURL)
            .then(response => {
                console.log("Response status:", response.status);
                //if response not ok throw the error
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                console.log(response)
                return response.json();
            })
            .then(data => {
                //get the image URL with the data.path from the api
                const imageURL = `http://127.0.0.1:8000${data.path}`;
                console.log("Image URL:", imageURL);

                //load the nifti with the fetched imageURL 
                nv.loadVolumes([
                    {
                        url: imageURL,
                        schema: "nifti"
                    },
                ]);

            })
            //catch the possible error
            .catch(err => {
                console.error("Error loading NIfTI file:", err);
            });
    }

});