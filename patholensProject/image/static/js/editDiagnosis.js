//import {Niivue} from "./index.js";

document.addEventListener('DOMContentLoaded', function() {
    /*
    // Loading the images

    const compareNv = new Niivue();
    const compareCanvas = document.getElementById("comparisonContainer");

    // Load FLAIR default
    let selectedFormat = "FLAIR";

    */


    // Zoom

    const comparisonContainer = document.getElementById("comparisonContainer");
    document.getElementById("zoomButton").addEventListener("click", () =>{
        console.log("button pressed")
        comparisonContainer.style.width = "74%";
        comparisonContainer.style.top = "35%";
        comparisonContainer.style.height = "53%";
    });
});