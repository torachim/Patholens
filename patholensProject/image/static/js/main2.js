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
    const selectedAI = event.target.value;
    console.log('Selected AI model:', selectedAI);

    // Example: You can load the image or perform any action based on the selected AI model
    loadImage(selectedAI);
});

});