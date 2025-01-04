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
    const zoomButton = document.getElementById("zoomButton");
    let zoomed = false;
    zoomButton.addEventListener("click", () =>{
        if(zoomed){
            comparisonContainer.style.width = "50%";
            comparisonContainer.style.top = "";
            comparisonContainer.style.height = "24%";
            zoomButton.src = "/static/icons/editPageZoomButton.png";
            zoomed = false;
        }

        else{
            comparisonContainer.style.width = "74%";
            comparisonContainer.style.top = "35%";
            comparisonContainer.style.height = "53%";
            zoomButton.src = "/static/icons/editPageZoomOutButton.png";
            zoomed = true;
        }

    });
});