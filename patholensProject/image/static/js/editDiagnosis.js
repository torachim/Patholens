import Niivue from "./index.js";

document.addEventListener('DOMContentLoaded', function() {
    // Loading the images

    const compareNv = new Niivue();
    const compareCanvas = document.getElementById("comparisonContainer");

    // Load FLAIR default
    let selectedFormat = "FLAIR";




    // Zoom

    const comparisonContainer = document.getElementById("comparisonContainer");
    document.getElementById("zoomButton").addEventListener("click", () =>{
        comparisonContainer.style.position ="absolute";
        comparisonContainer.style.left = "20%";
        comparisonContainer.style.width = "60%";
        comparisonContainer.style.top = "35%";
        comparisonContainer.style.height = "50%";
    });
});