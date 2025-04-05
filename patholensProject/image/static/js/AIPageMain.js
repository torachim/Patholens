import { Niivue } from "./index.js";
import { niivueCanvas, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, sendTimeStamp, deleteContinueDiagnosis, setContinueDiag, saveAIDiagnosis, getLesionConfidence } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function () {
    
    //default formats
    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({ drawOpacity: 0.5 }, canvas);
    
    let selectedFormatMask;
    let selectedFormatMri = "FLAIR";
    let selectedDisplay = "AI Diagnosis";


    initialize();
    setContinueDiag(diagnosisID, "AIpage", csrfToken);

    // Model Handling
    async function getModels(diagnosisID) {
        try {
          const response = await fetch(`/image/api/getAiModels/${diagnosisID}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          
          return data.models.map((model, index) => ({
            key: model,
            displayName: "Model " + String.fromCharCode(65 + index) 
          }));
          
        } catch (error) {
          console.error('Model error:', error);
          return [];
        }
      }

      // creates dropdown option for each modul
    function createDropdownOptions(models) {
        const dropdown = document.getElementById('AIdropdown');
        if (!dropdown) {
            console.error('AIdropdown element not found!');
            return;
        }
        
        const optionsContainer = dropdown.querySelector('.options');
        const textBox = dropdown.querySelector('.textBox');
        optionsContainer.innerHTML = '';

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

    function createPopup(models){
        const popUP = document.getElementById("popupFrame")
        const selectContainer = popUP.querySelector('.selectContainer')
        selectContainer.innerHTML = '';

        models.forEach(model => {
            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.id = model.displayName;
            checkbox.textContent = model.displayNeme
            checkbox.dataset.modelKey = model.key

            const checkboxLabel = document.createElement('lanel')
            checkboxLabel.htmlFor = model.displayName;
            checkboxLabel.textContent = model.displayName
            checkboxLabel.style.color = "white"

            const wrapper = document.createElement('div');
            wrapper.appendChild(checkboxLabel);
            wrapper.appendChild(checkbox);
 
            selectContainer.appendChild(wrapper);
        })
    }

    // Event Handling for dropdown
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
                const action = `AI Model ${selectedFormatMask}`;
                if(selectedDisplay != "My Diagnosis"){
                    sendTime(action);
                }
                selectedFormatMask = option.dataset.modelKey;
            } else if (dropdown.id === 'formatDropdown') {
                selectedFormatMri = option.textContent;
            } else if (dropdown.id === 'displayDropdown') {
                const action = `Display Mode ${selectedDisplay}`;
                sendTime(action);
                selectedDisplay = option.textContent;
            }
            loadImages();
        }
    }

    // Saves a timestamp for a given action
     
    async function sendTime(action){
        let utcTime = Date.now();
        await sendTimeStamp(action, utcTime, diagnosisID, csrfToken);
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
        nv.updateGLVolume();       
    }

    // Initialization
    async function initialize() {
            const models = await getModels(diagnosisID);

            if (models.length > 0) {
                selectedFormatMask = models[0].key; 
            } else {
                selectedFormatMask = null; 
            }
            createDropdownOptions(models);
            createPopup(models);
            
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.addEventListener('click', handleDropdownClick);
            });

            // Initial image load
            await loadImages();
    }
    
    const editDiagnosisButton = document.getElementById("editDiagnosis");

    editDiagnosisButton.addEventListener("click", () => {
        sendTime("Start Editing");
        window.location.assign(`/image/editDiagnosis/${diagnosisID}`)
    });


    const TakeMyDiagnosisButton = document.getElementById("TakeMyDiagnosis");
    TakeMyDiagnosisButton.addEventListener("click", async () => {
        await sendTime("Finished Diagnosis");
        await deleteContinueDiagnosis(diagnosisID, csrfToken);
        window.location.assign(`/image/editDiagnosis/${diagnosisID}/transitionPage/`)
    });


    const popupOverlay = document.getElementById("popupOverlay")
    const closePopup = document.getElementById("closePopup");
    const popupFrame = document.getElementById("popupFrame");
    const popupConfirm = document.getElementById("popupConfirm")
    const confidenceMeter = document.getElementById("confidenceMeter");



    const TakeAIDiagnosisButton = document.getElementById("TakeAIDiagnosis");
    TakeAIDiagnosisButton.addEventListener("click", () => {
        popupOverlay.style.display = "flex"
        popupFrame.style.display = "block"
    });

    popupConfirm.addEventListener("click", async () => {
        const checked = Array.from(document.querySelectorAll('.selectContainer input[type="checkbox"]:checked'));
        const selectedKeys = checked.map(cb => cb.dataset.modelKey);
        const confidenceValue = confidenceMeter.value

        await saveAIDiagnosis(diagnosisID, selectedKeys, confidenceValue, csrfToken)
        await sendTime("Finished Diagnosis");
        await deleteContinueDiagnosis(diagnosisID, csrfToken);
        window.location.assign(`/image/editDiagnosis/${diagnosisID}/transitionPage/`)
    })

    closePopup.addEventListener("click", () => {
        popupOverlay.style.display = "none"
        popupFrame.style.display = "none"
    })
});