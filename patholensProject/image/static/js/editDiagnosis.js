import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas,drawRectangleNiivue,loadImageAPI, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, sendTimeStamp, sendConfidence, savedEditedLesion, deleteContinueDiagnosis, jumpRectangle, drawCubeNV, setContinueDiag, changePenValue, getNumberOfLesions, loadEditedDiagnosis, getLesionConfidence, toggleEditLesion, toggleDeleteLesion, toggleShownLesion, hardEditedDelete} from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function() {

    let drawRectangle = false;
    let drawCube = false;
    let drawUndoCube = false;
    let pen = false;
    let lesionNumber = 1;
    let penValue = 1;
    let save = false;
    let homeOrLog= false;
    let undoDelete = false;
    let deletedLesionID;

    const jumpRect = document.getElementById("jumpRect");
    const alertMessageBox = document.getElementById("alertMessageBox");
    const closeAlertWindow = document.getElementById("closeAlertWindow");
    const saveLesionWindow = document.getElementById("saveLesionWindow");
    const saveLesion = document.getElementById("submitLesion");
    const controlLesion = document.getElementById("controlLesion");
    const saveLesionButton = document.getElementById("saveButton");
    const logOutWindow = document.getElementById("logoutInfoBox");
    const logOutWindowContinue = document.getElementById("continueLogoutButton");
    const logOutWindowAbort = document.getElementById("dontLogoutButton");
    const saveFirstWindow = document.getElementById("saveFirstInfo");
    const closeSaveFirst = document.getElementById("closeSaveInfo");
    
    //function to drag a rectangle in the niivue 
    const onDragRelease = (data) => {
        drawRectangle = true;
        //if drawing is enabled
        if (nv.opts.drawingEnabled){
            if(drawCube){
                let finishedCube;
                finishedCube = drawCubeNV(nv, data, penValue);
                if(!finishedCube){
                    showAlertWindow();
                }
                else{
                    sendTime("Cuboid Edit");
                    saveDrawingState();
                    drawUndoCube = true;
                    drawCube = false;
                    jumpRect.style.display = "none"
                    showSaveWindow();
                }
            }
            else{
                drawRectangleNiivue(nv, data, penValue)
                drawCube = true;
                saveDrawingState();
                jumpRect.style.display = "flex";
                sendTime("Rectangle Edit");
            }
            deactivateAllButtons(); //deactiviates the active style of button
        }
        nv.setDrawingEnabled(false); //drawingEnabled equals false so you have to click the button again to draw another rechtangle
    }


    //Loading Images 
    const canvasZoom = document.getElementById("imageBrainZoom");
    const nvZoom = niivueCanvas({}, canvasZoom);

    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({
        onDragRelease: onDragRelease,
        dragMode: DRAG_MODE.callbackOnly,
        penSize: 3,
        maxDrawUndoBitmaps: 200,     // max 200 undos possible
        drawOpacity: 0.65,
        }, 
        canvas)
   
    //default formats
    let selectedFormatMri = "FLAIR"
    let selectedDisplay = "AI Diagnosis"
    let selectedFormatMask;
   

    initialize();
    setContinue();

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
                loadZoomImage();
            } else if (dropdown.id === 'formatDropdown') {
                selectedFormatMri = option.textContent;
                loadZoomImage();
                loadMainImage();
            } else if (dropdown.id === 'displayDropdown') {
                const action = `Display Mode ${selectedDisplay}`;
                sendTime(action);
                selectedDisplay = option.textContent;
                loadZoomImage();
            }
        }
    }
    
    // function to load the images in the correct overlay
    async function loadZoomImage(){
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
        nvZoom.loadVolumes(volumes);
        nvZoom.updateGLVolume();  
    };

     //loading Images for the main Frame
    async function loadMainImage() {
        const volumes = await loadImageAPI(selectedFormatMri, diagnosisID);
        nv.loadVolumes(volumes);
        nv.updateGLVolume(); 
    }

    async function loadImageAndEdited(){
        const volumes = await loadEditedDiagnosis(diagnosisID, selectedFormatMri);
        let numbers = await getNumberOfLesions(diagnosisID);
        lesionNumber = numbers["lesionNumber"] + 1
        penValue = volumes.length;
        nv.loadVolumes(volumes);
    }

     // Initialization
     async function initialize() {
        const models = await getModels(diagnosisID);
        createDropdownOptions(models);
        
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.addEventListener('click', handleDropdownClick);
        });

        await loadZoomImage();
        reload()
    }

    async function reload(){
        let numberLesions = await getNumberOfLesions(diagnosisID);
        if(numberLesions["activeEdited"] != 0){
            await loadImageAndEdited();
        } else {
            await loadMainImage();
        }
        updateLesionList()
    }

     // Add drawing state to history
     function saveDrawingState() {
        nv.drawAddUndoBitmap();
    }

    /**
     * 
     * @param {int} mode
     * - 0 = Eraser, 4 = yellow, 6 = purple
     * @param {boolean} filled
     * True => drawn shape will be filled
     */
    function changeDrawingMode(mode, filled){
        changePenValue(nv, mode, filled);
    }

    jumpRect.addEventListener("click", () => {
        jumpRectangle(nv);
    })

    // Pixel
    document.getElementById("selectTool").addEventListener("click", function(e){
        if(drawCube){
            showAlertWindow();
        }
        else if(save){
            showSaveInfo();
        }
        else{
            drawRectangle = false;
            saveDrawingState();
            nv.setDrawingEnabled(true);  
            changeDrawingMode(penValue, false);
            pen = true
            activateButton("selectTool"); //changes button style while selected
        }
    });
        
     // disables drawing after a Pixel is marked
    document.getElementById("imageBrain").addEventListener("mouseup", () => {
        if(pen){
            showSaveWindow();
        }
        disableDrawing();
    })
     
    // disables drawing
    function disableDrawing(){
        deactivateAllButtons();
        if(!drawRectangle && pen){
            sendTime("Freehand Drawing Edit");
            pen = false;
            nv.setDrawingEnabled(false);
        }
    } 
        

    // INFO: You need to right click and drag to draw rectangle
    // enable rectangle drawing when the corresponding button in html is clicked
    document.getElementById("frameTool").addEventListener("click", function () {
        if(save){
            showSaveInfo();
        }
        else {
            pen = false
            saveDrawingState();
            nv.setDrawingEnabled(true);
            nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
            nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
            activateButton("frameTool"); //changes button style while drawing rectangle
        }
    });

     // Undo the drawing
     document.getElementById("undoTool").addEventListener("click", async function (e) {
        if(undoDelete){
            await toggleDeleteLesion(deletedLesionID, csrfToken);
            undoDelete = false;
            deletedLesionID = 0;
            reload();
        } else {
            nv.drawUndo();
            // If drawCube drawCube is set false so it's no longer activated
            if(drawCube){
                drawCube = false;
                jumpRect.style.display = "none";
            }
            // If drawUndoCube drawCube is set to true again so draw cube is enabled
            else if(drawUndoCube){
                drawCube = true;
                drawUndoCube = false;
                jumpRect.style.display = "flex";
            }
            saveLesionButton.style.display = "none";
            save = false;
        }
        deactivateAllButtons(); //only changes style after being clicked
        await sendTime("Undo")
    })

    //Removes the style applied when button is active
    function deactivateAllButtons() {
        document.querySelectorAll(".toolButton").forEach(button => {
            if (!button.id.includes("undoTool")) { //Exclude Undo button
                button.classList.remove("activeButton");
            }
        });
    }

    //applies style when button is active
    function activateButton(buttonId) {
        deactivateAllButtons(); 
        if (buttonId !== "undoTool") {
            const button = document.getElementById(buttonId);
            button.classList.add("activeButton"); //only changes style of button
        }
    }

    async function sendTime(action){
        let utcTime = Date.now();
        await sendTimeStamp(action, utcTime, diagnosisID, csrfToken);
    }
    

    // Zoom functionality
    
    let comparisonContainer = document.getElementById("comparisonContainer");
    const zoomButton = document.getElementById("zoomButton");
    let zoomed = false;
    const dropdownMenus = document.querySelectorAll(".dropdown");
    const overlay = document.getElementById("overlay");

    //Image while zoomed out
    function zoomOut(){
        comparisonContainer.style.width = "50%";
        comparisonContainer.style.top = "";
        comparisonContainer.style.height = "24%";
        zoomButton.src = "/static/icons/editPageZoomButton.png";
        zoomed = false;
        overlay.style.display = "none";
        sendTime("Zoom Out Edit");
    }

    zoomButton.addEventListener("click", () =>{
        if(zoomed){
            zoomOut();
        }

        //Image while zoomed in
        else{
            comparisonContainer.style.width = "81%";
            comparisonContainer.style.top = "25%";
            comparisonContainer.style.height = "60%";
            overlay.style.display = "flex";
            zoomButton.src = "/static/icons/editPageZoomOutButton.png";
            zoomed = true;
            sendTime("Zoom In Edit");
        }
    });

    document.body.addEventListener("click", (e) =>{
        if(zoomed){
            if (!comparisonContainer.contains(e.target) && e.target !== zoomButton) {

                let clickedDropdown = false;

                dropdownMenus.forEach(dropdown => {
                    if (dropdown.contains(e.target)){
                        clickedDropdown = true;
                    }
                });
                if (!clickedDropdown){
                    zoomOut();
                }     
            }
        }
    });



    //confidence meter window 
    const confirmButton = document.querySelector('.popupConfirm');
    const confidenceSliderDiagnosis = document.getElementById('confidenceMeter2');
    const confidenceSliderLesion = document.getElementById('confidenceMeter1')

    // Listener for the confirmation button
    confirmButton.addEventListener('click', () => {
        const confidenceValue = confidenceSliderDiagnosis.value; 
        endDiagnosis(confidenceValue);
    });

    //Finish the current diagnosis
    async function endDiagnosis(confidenceValue){
        let confidenceType = "edit"
        await sendConfidence(confidenceValue, diagnosisID, confidenceType, csrfToken);
        await sendTime("Finished Diagnosis");
        await hardEditedDelete(diagnosisID, csrfToken);
        await deleteContinueDiagnosis(diagnosisID, csrfToken);
        window.location.assign(`/image/editDiagnosis/${diagnosisID}/transitionPage/`)
    }

    //Finish frame with confidencemeter
    const finishButton = document.getElementById("finishButton");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const popupFrame = document.getElementById("popupFrame");

    popupOverlay.style.display = "none";

    // Function to show the confidence window
    finishButton.addEventListener("click", () => {
        if(drawCube){
            showAlertWindow();
        }
        else{
            popupOverlay.style.display = "flex";
            popupFrame.style.display = "block";
        }
    });

    // Functions to close the confidence window
    closePopup.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        sendTime("Aborted Confidence Edit");
    });

    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = "none";
            sendTime("Aborted Confidence Edit");
        }
    })


    // If the user decides to save the current lesion
    saveLesion.addEventListener("click", () => {
        const confidenceValue = confidenceSliderLesion.value; // get the confidence value
        saveImage(confidenceValue); // save the current image
        saveLesionWindow.style.display = "none";
        alertOverlay.style.display = "none";
        saveLesionButton.style.display = "none";
        drawCube = false;
        drawUndoCube = false;
        drawRectangle = false;
        save = false;
    });

    // Saves the current lesion
    async function saveImage(confidence){
        const lesionName = `edited-lesion-${lesionNumber}`;
        await savedEditedLesion(nv, diagnosisID, lesionName, confidence, csrfToken, true, "edit");
        sendTime("Edited Saved Lesion");
        nv.createEmptyDrawing();
        reload();
    }

    const alertOverlay = document.getElementById("alertOverlay");

    closeAlertWindow.addEventListener("click", () => {
        alertMessageBox.style.display = "none";
        alertOverlay.style.display = "none";
    })

    // Shows the alert window if necessary
    function showAlertWindow(){
        alertMessageBox.style.display = "flex"
        alertOverlay.style.display = "flex";
    }

    // Shows the save window if necessary
    function showSaveWindow(){
        saveLesionWindow.style.display = "flex";
        alertOverlay.style.display = "flex";
        save = true; //save eq. true so the "save lesion" block appears
    }

    // If you want to close the save Lesion window
    controlLesion.addEventListener("click", () => {
        saveLesionWindow.style.display = "none";
        alertOverlay.style.display = "none";
        saveLesionButton.style.display = "flex";
    })

    // show the save window if the user clicks on the save button
    saveLesionButton.addEventListener("click", () => {
        showSaveWindow();
    })

    const logOut = document.getElementById("logoutButton");

        //If the user clicks on the logout button
        logOut.addEventListener("click", (event) => {
            // if save is true show alert window and prevent logout 
            if(save){
                event.preventDefault();
                logOutWindow.style.display = "flex";
                alertOverlay.style.display = "flex";
                homeOrLog = false; // false for logout 
            }
            // if the user is currently drawing a cube show alert window and prevent logout 
            else if(drawCube){
                event.preventDefault();
                alertMessageBox.style.display = "flex"
                alertOverlay.style.display = "flex";
            }
        })

    const homePage = document.getElementById("homePageButton");

    //if user clicks on the home button same as the logout button 
    homePage.addEventListener("click", (event) => {
        if(save){
            event.preventDefault();
            logOutWindow.style.display = "flex";
            alertOverlay.style.display = "flex";
            homeOrLog = true; // true for back to homepage
        }
        else if(drawCube){
            event.preventDefault();
            alertMessageBox.style.display = "flex"
            alertOverlay.style.display = "flex";
        }
    })
    
    // Sets the continue to the current diagnosis and the edit page
    async function  setContinue() {
        await setContinueDiag(diagnosisID, "editDiagnosis", csrfToken);
    }

    // log out the user
    logOutWindowContinue.addEventListener("click", () => {
        if(homeOrLog){
            window.location.assign("/startingPage/");
        }
        else{
            window.location.assign("/logout/newDiagnosis");
        }
    })

    logOutWindowAbort.addEventListener("click", () => {
        logOutWindow.style.display = "none";
        alertOverlay.style.display = "none";
    })

    function showSaveInfo(){
        saveFirstWindow.style.display = "flex";
        alertOverlay.style.display = "flex";
    }

    closeSaveFirst.addEventListener("click", () => {
        saveFirstWindow.style.display = "none";
        alertOverlay.style.display = "none";
    })

    lesionListToggle.addEventListener("click", () => {
        lesionConfidenceBox.classList.toggle("show");
        lesionListToggle.textContent = lesionConfidenceBox.classList.contains("show") 
            ? "Hide Lesion List" 
            : "Saved Lesions";
    });

    // Updates the lesion window
    async function updateLesionList() {
        const lesions = await getLesionConfidence(diagnosisID);
        lesionList.innerHTML = "";

        if (lesions.length === 0) {
            lesionList.innerHTML = "<p style='color: white;'>No lesions saved yet</p>";
            return;
        }

        let colorMain = 1
        let colorEdit = 1

        for (let i = 0; i < lesions.length; i++) {
            const lesion = lesions[i];
            const listItem = document.createElement("li");
            listItem.className = "lesionItem";
            
            const colours = {
                1: [1, "red"],
                2: [2, "green"],
                3: [3, "blue"],
                4: [4, "yellow"],
                5: [5, "cyan"],
                6: [6, "magenta"],
                7: [7, "orange"],  
                8: [8, "#40E0D0"],  
                9: [19, "#C00000"],  
                0: [23, "#800080"]   
            };

            let colorIndex;

            if(!lesion.edited){
                colorIndex = colorMain
                colorMain += 1
            }else{
                colorIndex = colorEdit
                colorEdit += 1
            }

            const colorInfo = colours[colorIndex];
            let colorName = colorInfo[1];
            
            if(lesion.edited && lesion.fromMain){
                colorName = "white"
            }

            listItem.innerHTML = `
                <span class="lesionName" style="color: ${colorName}; font-weight: bold">${lesion.name}</span>
                <span class="lesionConfidence" style="color: white;"><b>Confidence:</b> ${lesion.confidence}</span>
                ${lesion.edited
                    ?   `<button class="deleteLesion", data-origin="${lesion.fromMain}", data-id="${lesion.lesionID}">
                            <i class="fas fa-times" style="color:white"></i>
                        </button>
                        <button class="toggleVisibility" data-id="${lesion.lesionID}">
                        ${lesion.shown 
                            ? '<i class="fas fa-eye" style="color:white"></i>' 
                            : '<i class="fas fa-eye-slash" style="color:white"></i>'}
                        </button>`
                    :   `<button class="transferLesion" data-id="${lesion.lesionID}">
                           <i class="fas fa-arrow-up-right-from-square" style="color: #ffffff;"></i>
                        </button>`}`;

            lesionList.appendChild(listItem);
        }

        // If a lesion should be soft deleted
        document.querySelectorAll(".deleteLesion").forEach(button => {
            button.addEventListener("click", async function() {
                await sendTime("Edit Deleted Lesion");
                const lesionID = this.dataset.id;
                const origin = this.dataset.origin === "true"
                if(origin){
                    await toggleEditLesion(lesionID, csrfToken)
                }else{
                    undoDelete = true;
                    deletedLesionID = lesionID
                    await toggleDeleteLesion(lesionID, csrfToken);
                }
                reload();
            });
        });

        // Toggles the visibility of a lesion
        document.querySelectorAll(".toggleVisibility").forEach(button => {
            button.addEventListener("click", async function() {
                const lesionID = this.dataset.id;
                await toggleShownLesion(lesionID, csrfToken);
                reload();
            });
        });

        // Transfers a lesion to the edit page
        document.querySelectorAll(".transferLesion").forEach(button => {
            button.addEventListener("click", async function() {
                await sendTime("Edit Transfered Lesion")
                const lesionID = this.dataset.id;
                await toggleEditLesion(lesionID, csrfToken) //This function still needs to be written
                reload();
            });
        })
    }
});

