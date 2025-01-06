import { Niivue } from "./index.js";
import { niivueCanvas, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({}, canvas);

    //default formats
    let selectedFormatMask = "DEEPFCD";
    let selectedFormatMri = "FLAIR"
    let selectedDisplay = "AI diagnosis"


    const aiModelMapping = {
        "Model A": "DEEPFCD",
        "Model B": "MAP18",
        "Model C": "MELD",
        "Model D": "NNUNET"
    };

    // Load default image and mask
    loadImages();

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            const selectedOption = event.target.textContent;
            selectedFormatMask = aiModelMapping[selectedOption];
            
            loadImages();
        }
    });

    // Dropdown change listener for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            const selectedOption = event.target.textContent;
            selectedFormatMri = selectedOption;
            loadImages();
        }
    });

    // Dropdown change listener for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown');
    displayDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            const selectedOption = event.target.textContent;
            selectedDisplay = selectedOption;
            loadImages();
        }
    });
    // function to load the images in the correct overlay
    async function loadImages(){
        let volumes;
        if(selectedDisplay == "AI diagnosis"){
            volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri, diagnosisID);
        }
        else if(selectedDisplay == "my diagnosis"){
            volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormatMri);
        }
        else if(selectedDisplay == "show Overlay"){
            volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri, diagnosisID);
        }
        nv.loadVolumes(volumes);
    };
});
