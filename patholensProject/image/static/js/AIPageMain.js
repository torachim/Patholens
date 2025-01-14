import { Niivue } from "./index.js";
import { niivueCanvas, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, endTimer, deleteContinueDiagnosis } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({}, canvas);

    //default formats
    let selectedFormatMask = "DEEPFCD";
    let selectedFormatMri = "FLAIR"
    let selectedDisplay = "AI Diagnosis"


    const aiModelMapping = {
        "Model A": "DEEPFCD",
        "Model B": "MAP18",
        "Model C": "MELD",
        "Model D": "NNUNET"
    };

    let startTime;

    // Load default image and mask
    loadImages();
    startTime = performance.now();

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('click', (event) => {
        const action = `AI Model ${selectedFormatMask}`;
        if (event.target.classList.contains('option')) {
            if(selectedDisplay != "My Diagnosis"){
                endTimer(action, startTime, diagnosisID, csrfToken);
                startTime = performance.now();
            }
            selectedFormatMask = aiModelMapping[event.target.textContent];
            loadImages();
        }   
    });

    // Dropdown change listener for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            selectedFormatMri = event.target.textContent;
            loadImages();
        }
    });


    const displayDropdown = document.getElementById('displayDropdown');
    displayDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            if(event.target.textContent == "My Diagnosis"){
                const action = `AI Model ${selectedFormatMask}`;
                endTimer(action, startTime, diagnosisID, csrfToken);
            }
            if(selectedDisplay == "My Diagnosis"){
                startTime = performance.now();
            }
            selectedDisplay = event.target.textContent;
            loadImages();
        }
    });

    // function to load the images in the correct overlay
    async function loadImages(){
        let volumes;
        if(selectedDisplay == "AI Diagnosis"){
            volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri, diagnosisID);
        }
        else if(selectedDisplay == "My Diagnosis"){
            volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormatMri);
        }
        else if(selectedDisplay == "Show Overlay"){
            volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri, diagnosisID);
        }
        nv.loadVolumes(volumes);
    };
    
    function swapOptions(optionElement) {
        const parentDropdown = optionElement.closest('.dropdown');
        const textBox = parentDropdown.querySelector('.textBox');
        const clickedValue = optionElement.textContent;
        // Update the text box value
        textBox.value = clickedValue;
    }

    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });
    });

    document.querySelectorAll('.dropdown .option').forEach(option => {
        option.addEventListener('click', (event) => {
            swapOptions(event.target);
        });
    })



    const editDiagnosisButton = document.getElementById("editDiagnosis");

    editDiagnosisButton.addEventListener("click", () => {
        window.location.assign(`/image/editDiagnosis/${diagnosisID}`)
    });


    const TakeMyDiagnosisButton = document.getElementById("TakeMyDiagnosis");
    TakeMyDiagnosisButton.addEventListener("click", () => {
        deleteContinueDiagnosis(diagnosisID, csrfToken);
    });


    const TakeAIDiagnosisButton = document.getElementById("TakeAIDiagnosis");
    TakeAIDiagnosisButton.addEventListener("click", () => {
        deleteContinueDiagnosis(diagnosisID, csrfToken);
    });

    
});
