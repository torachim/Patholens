import { Niivue } from "./index.js";
import { niivueCanvas, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, sendTimeStamp, deleteContinueDiagnosis } from "./pathoLens.js";


document.addEventListener('DOMContentLoaded', function () {
   
    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({ drawOpacity: 0.5 }, canvas);
    
     //default formats
    let selectedFormatMask;
    let selectedFormatMri = "FLAIR";
    let selectedDisplay = "AI Diagnosis";

    let startTime;

    // Load default image and mask
    loadImages();
    startTime = performance.now();

    // Model Handling
    async function getModels(diagnosisID) {
        try {
            console.log('Fetching models...'); // Debug 3
            const response = await fetch(`/image/api/getAiModels/${diagnosisID}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            console.log('API Response:', data); // Debug 4
            return data.models.map((model, index) => ({
                key: model,
                displayName: "Model " + String.fromCharCode(65 + index) // A, B, C, ...
              }));
        } catch (error) {
            console.error('Model error:', error);
            return [];
        }
    }

    function createDropdownOptions(models) {
        console.log('Creating dropdown options:', models); // Debug 5
        const dropdown = document.getElementById('AIdropdown');
        if (!dropdown) {
            console.error('AIdropdown element not found!');
            return;
        }
        
        const optionsContainer = dropdown.querySelector('.options');
        const textBox = dropdown.querySelector('.textBox');

        // Creates a dropdown option for each model
        models.forEach(model => {
            const option = document.createElement('div');
            option.className = 'option';
            option.textContent = model.displayName;
            option.dataset.modelKey = model.key;
            optionsContainer.appendChild(option);
        });

        if (models.length > 0) {
            selectedFormatMask = models[0].key;
            textBox.value = models[0].displayName;
        }
    }

    // Event Handling of dropdown
    function handleDropdownClick(event) {
        const dropdown = event.currentTarget;
        const isOption = event.target.closest('.option');
        
        // Toggle dropdown visibility
        dropdown.classList.toggle('active');
        
        if (isOption) {
            const option = event.target.closest('.option');
            const textBox = dropdown.querySelector('.textBox');
            textBox.value = option.textContent;

            if (dropdown.id === 'AIdropdown') {
                selectedFormatMask = option.dataset.modelKey;
            } else if (dropdown.id === 'formatDropdown') {
                selectedFormatMri = option.textContent;
            } else if (dropdown.id === 'displayDropdown') {
                selectedDisplay = option.textContent;
            }

            loadImages();
        }
    }

    // Saves a timestamp for a given action
    async function sendTime(action){
        let utcTime = Date.now();
        sendTimeStamp(action, utcTime, diagnosisID, csrfToken);
    }

    // function to load the images in the correct overlay
    async function loadImages() {
            let volumes;
            if(selectedDisplay === "AI Diagnosis") {
                volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri, diagnosisID);
            }
            else if(selectedDisplay === "My Diagnosis") {
                volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormatMri);
            }
            else if(selectedDisplay === "Show Overlay") {
                volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri, diagnosisID);
            } 
            nv.loadVolumes(volumes);
    }

    // Initialization
    async function initialize() {
        try {
            console.log('Initializing with diagnosis ID:', diagnosisID); // Debug 14
            const models = await getModels(diagnosisID);
            createDropdownOptions(models);
            
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.addEventListener('click', handleDropdownClick);
            });

            // Initial image load
            await loadImages();
            console.log('Initialization complete'); // Debug 15
            
        } catch (error) {
            console.error('Initialization failed:', error); // Debug 16
        }
    }

    initialize();

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