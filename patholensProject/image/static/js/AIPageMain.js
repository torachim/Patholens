import { Niivue } from "./index.js";
import { niivueCanvas, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, sendTimeStamp, deleteContinueDiagnosis } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function () {

    async function getModels(diagnosisID) {
        try {
            const response = await fetch(`/image/api/getAiModels/${diagnosisID}`);
    
            if (!response.ok) {
                // Hier wird der Fehler behandelt, falls die Antwort des Servers keinen Erfolg hatte
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
    
            // Überprüfen, ob der Status der Antwort 'success' ist
            if (data.status === 'success') {
                // Die Modelle werden als Array zurückgegeben, sodass sie weiterverwendet werden können
                return data.models;
                
            } else {
                // Fehlerbehandlung, falls der Status der API 'error' ist
                throw new Error("Error: " + data.message);
            }
            
        } catch (error) {
            console.error('Error fetching AI models: ', error.message);
            // Falls ein Fehler auftritt, gibt es einen leeren Array zurück oder einen Fehler
            return [];
        }
    }
    

    getModels(diagnosisID);
    
    
    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({drawOpacity: 0.5}, canvas);

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
                sendTime(action);
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
                sendTime(action);
            }
            selectedDisplay = event.target.textContent;
            loadImages();
        }
    });

    // Saves a timestamp for a given action
    async function sendTime(action){
        let utcTime = Date.now();
        sendTimeStamp(action, utcTime, diagnosisID, csrfToken);
    }

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
        sendTime("Start Editing");
        window.location.assign(`/image/editDiagnosis/${diagnosisID}`)
    });


    const TakeMyDiagnosisButton = document.getElementById("TakeMyDiagnosis");
    TakeMyDiagnosisButton.addEventListener("click", () => {
        sendTime("Finished Diagnosis");
        deleteContinueDiagnosis(diagnosisID, csrfToken);
        window.location.assign(`/image/editDiagnosis/${diagnosisID}/transitionPage/`)
    });


    const TakeAIDiagnosisButton = document.getElementById("TakeAIDiagnosis");
    TakeAIDiagnosisButton.addEventListener("click", () => {
        sendTime("Finished Diagnosis");
        deleteContinueDiagnosis(diagnosisID, csrfToken);
        window.location.assign(`/image/editDiagnosis/${diagnosisID}/transitionPage/`)
    });
});
