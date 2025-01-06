import { Niivue } from "./index.js";
import { niivueCanvas, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({}, canvas);

    //default formats
    let selectedFormatMask = "DEEPFCD";
    let selectedFormatMri = "FLAIR"
    let selectedDisplay = "AIDiagnosis"

    // Load default image and mask
    loadImages();

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('change', (event) => {
        selectedFormatMask = event.target.value;
        loadImages();
    });

    // Dropdown change listener for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('change', (event) => {
        selectedFormatMri = event.target.value;
        loadImages();
    });

    // Dropdown change listener for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown')
    displayDropdown.addEventListener('change', (event) => {
        selectedDisplay= event.target.value
        loadImages();
    });

    // function to load the images in the correct overlay
    async function loadImages(){
        let volumes;
        if(selectedDisplay == "AIDiagnosis"){
            volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri, diagnosisID);
        }
        else if(selectedDisplay == "myDiagnosis"){
            volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormatMri);
        }
        else if(selectedDisplay == "showOverlay"){
            volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri, diagnosisID);
        }
        nv.loadVolumes(volumes);
    };
});
