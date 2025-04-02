import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas,  drawRectangleNiivue,loadImageAPI, sendTimeStamp, sendConfidence, savedEditedLesion, loadImageWithDiagnosis, drawCubeNV, jumpRectangle, setContinueDiag, changePenValue, getLesionConfidence, getNumberOfLesions, toggleShownLesion, toggleDeleteLesion, hardDeleteLesions } from "./pathoLens.js";


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

    const canvas = document.getElementById("imageBrain");
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
    const lesionList = document.getElementById("lesionList");

    // Load FLAIR default
    let selectedFormat = "FLAIR";

    //function to drag a rectangle in the niivue 
    // define what happens on dragRelase (right mouse up)
    const onDragRelease = (data) => {
        drawRectangle = true;
        //if drawing is enabled
        if (nv.opts.drawingEnabled){
            if(drawCube){
                let finishedCube;
                finishedCube = drawCubeNV(nv, data, penValue);
                if(!finishedCube){
                    showAlertWindow()
                }
                else{
                    sendTime("Cuboid")
                    saveDrawingState();
                    drawUndoCube = true;
                    drawCube = false;
                    jumpRect.style.display = "none"
                    showSaveWindow();
                }
            }
            else{
                drawRectangleNiivue(nv, data, penValue);
                drawCube = true;
                saveDrawingState();
                jumpRect.style.display = "flex"
                sendTime("Rectangle");
            }
            deactivateAllButtons(); //deactiviates the active style of button
        }
        nv.setDrawingEnabled(false); //drawingEnabled equals false so you have to click the button again to draw another rectangle  
    }

    const nv = niivueCanvas({
               onDragRelease: onDragRelease,
               dragMode: DRAG_MODE.callbackOnly,
               penSize: 3,
               maxDrawUndoBitmaps: 200,     // max 200 undos possible
               drawOpacity: 0.65,
               }, 
               canvas)
    
    async function reload(){
        let numberLesions = await getNumberOfLesions(diagnosisID);
        console.log(numberLesions)
        if(numberLesions["activeLesionsNumber"] != 0){
            await loadImageAndEdited();
        } else {
            await loadImage();
        }
        await updateLesionList();
    }


    // Function to handle changes in the format selection
    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            selectedFormat = event.target.value;
            reload();
        });
    });

    // Call the appropriate function based on the mode
    sendTime("Open Diagnosis")
    reload();


    async function loadImageAndEdited() {
        const volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormat);
        let numbers = await getNumberOfLesions(diagnosisID);
        lesionNumber = numbers["lesionNumber"] + 1
        penValue = volumes.length;
        nv.loadVolumes(volumes);
    } 

    async function loadImage() {
        const volumes = await loadImageAPI(selectedFormat, diagnosisID);
        nv.loadVolumes(volumes);
    } 
  
    // Add drawing state to history
    function saveDrawingState() {
        nv.drawAddUndoBitmap();
    }

    // Jump to the bottom left corner of the drawn rectangle
    jumpRect.addEventListener("click", () => {
        jumpRectangle(nv);
    })


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
            pen = true;
            activateButton("selectTool"); //changes button style while selected
        }
    });

    // disables drawing after a pixel is marked
    document.getElementById("imageBrain").addEventListener("mouseup", () => {
    if(pen){
        showSaveWindow()
    }
    disableDrawing();
    })

    // disables drawing
    function disableDrawing(){
        deactivateAllButtons();
        if(!drawRectangle && pen){
            sendTime("Freehand Drawing");
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
        else{
            pen = false;
            saveDrawingState();
            nv.setDrawingEnabled(true);
            nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
            nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
            activateButton("frameTool"); //changes button style while drawing rectangle
        }
    });

     // Undo the drawing/
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
    
    //confidence meter window 
    const confirmButton = document.querySelector('.popupConfirm');
    const confidenceSlider1 = document.getElementById('confidenceMeter1');
    const confidenceSlider2 = document.getElementById('confidenceMeter2');

    // Listener for the confirmation button
    confirmButton.addEventListener('click', () => {
        const confidenceValue = confidenceSlider2.value; 
        endDiagnosis(confidenceValue);
    });

    async function endDiagnosis(confidenceValue){
        let confidenceType = "all Lesions"
        await sendConfidence(confidenceValue, diagnosisID, confidenceType, csrfToken);
        await sendTime("Confidence Confirmed");
        await hardDeleteLesions(diagnosisID, csrfToken);
        window.location.assign(`/image/AIpage/${diagnosisID}`)
    }

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
        sendTime("Aborted Confidence");
    });

    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = "none";
            sendTime("Aborted Confidence");
        }
    })

    closeAlertWindow.addEventListener("click", () => {
        alertMessageBox.style.display = "none";
        overlay.style.display = "none";
    })

    // Function to show the alert Window if necessary 
    function showAlertWindow(){
        alertMessageBox.style.display = "flex"
        overlay.style.display = "flex";
    }

    // Send the current timestamp to the backend
    async function sendTime(action){
        let utcTime = Date.now();
        await sendTimeStamp(action, utcTime, diagnosisID, csrfToken);
    }

    // Shows the save window if necessary
    function showSaveWindow(){
        saveLesionWindow.style.display = "flex";
        overlay.style.display = "flex";
        save = true; //save eq. true so the "save lesion" block appears
    }

    // If you want to close the save Lesion window
    controlLesion.addEventListener("click", () => {
        saveLesionWindow.style.display = "none";
        overlay.style.display = "none";
        saveLesionButton.style.display = "flex";
    })

    // If the user decides to save the current lesion
    saveLesion.addEventListener("click", () => {
        const confidenceValue = confidenceSlider1.value; // get the confidence value
        saveImage(confidenceValue); // save the current image
        saveLesionWindow.style.display = "none";
        overlay.style.display = "none";
        saveLesionButton.style.display = "none";
        drawCube = false;
        drawUndoCube = false;
        drawRectangle = false;
        save = false;
    });

    // show the save window if the user clicks on the save button
    saveLesionButton.addEventListener("click", () => {
        showSaveWindow();
    })

    // Save the image and send the time stamp
    async function saveImage(confidence){
        const lesionName = `lesion-${lesionNumber}`
        await savedEditedLesion(nv, diagnosisID, lesionName, confidence, csrfToken, false);
        sendTime("Saved Lesion");
        nv.createEmptyDrawing();
        reload();
    }

    // save image if logged out        ATTENTION: prevent saving image twice!! It wont work
    const logOut = document.getElementById("logoutButton");

    //If the user clicks on the logout button
    logOut.addEventListener("click", (event) => {
        // if save is true show alert window and prevent logout 
        if(save){
            event.preventDefault();
            logOutWindow.style.display = "flex";
            overlay.style.display = "flex";
            homeOrLog = false; // false for logout 
        }
        // if the user is currently drawing a cube show alert window and prevent logout 
        else if(drawCube){
            event.preventDefault();
            alertMessageBox.style.display = "flex"
            overlay.style.display = "flex";
        }
        else{
            setContinue(); //send continue and logout 
        }
    })

    const homePage = document.getElementById("homePageButton");

    //if user clicks on the home button same as the logout button 
    homePage.addEventListener("click", (event) => {
        if(save){
            event.preventDefault();
            logOutWindow.style.display = "flex";
            overlay.style.display = "flex";
            homeOrLog = true; // true for back to homepage
        }
        else if(drawCube){
            event.preventDefault();
            alertMessageBox.style.display = "flex"
            overlay.style.display = "flex";
        }
        else{
            setContinue();
        }
    })

    // sets continue for the current diagnosis
    async function setContinue(){
         await setContinueDiag(diagnosisID, "newDiagnosis", csrfToken);
    }

    // log out the user
    logOutWindowContinue.addEventListener("click", () => {
        setContinue();
        if(homeOrLog){
            window.location.assign("/startingPage/");
        }
        else{
            window.location.assign("/logout/newDiagnosis");
        }
    })

    logOutWindowAbort.addEventListener("click", () => {
        logOutWindow.style.display = "none";
        overlay.style.display = "none";
    })

    function showSaveInfo(){
        saveFirstWindow.style.display = "flex";
        overlay.style.display = "flex";
    }

    closeSaveFirst.addEventListener("click", () => {
        saveFirstWindow.style.display = "none";
        overlay.style.display = "none";
    })
    
    // Add this near the top with other DOM element declarations
    const lesionListToggle = document.getElementById("lesionListToggle");
    const lesionConfidenceBox = document.getElementById("lesionConfidenceBox");

    // Add this event listener with the others
    lesionListToggle.addEventListener("click", () => {
        lesionConfidenceBox.classList.toggle("show");
        lesionListToggle.textContent = lesionConfidenceBox.classList.contains("show") 
            ? "Hide Lesion List" 
            : "Saved Lesions";
    });

    // Modify the updateLesionList function to ensure proper styling:
    async function updateLesionList() {
        const lesions = await getLesionConfidence(diagnosisID);
        lesionList.innerHTML = "";

        if (lesions.length === 0) {
            lesionList.innerHTML = "<p style='color: white;'>No lesions saved yet</p>";
            return;
        }

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
                7: [7, "orange"],  // Braun als Hex-Code
                8: [8, "#40E0D0"],  // Türkis als Hex-Code
                9: [19, "#C00000"],  // Jet (sehr dunkles Grau) als Hex-Code
                0: [23, "#800080"]   // Violett als Hex-Code
            };

            const colorIndex = (i + 1) % 10;
            const colorInfo = colours[colorIndex];
            const colorName = colorInfo[1];
            
            listItem.innerHTML = `
                <span class="lesionName" style="color: ${colorName}; font-weight: bold">${lesion.name}</span>
                <span class="lesionConfidence" style="color: white;"><b>Confidence:</b> ${lesion.confidence}</span>
                <button class="deleteLesion" data-id="${lesion.lesionID}">
                    <i class="fas fa-times" style="color:white"></i>
                </button>
                <button class="toggleVisibility" data-id="${lesion.lesionID}">
                    ${lesion.shown 
                        ? '<i class="fas fa-eye" style="color:white"></i>' 
                        : '<i class="fas fa-eye-slash" style="color:white"></i>'}
                </button>
            `;

            lesionList.appendChild(listItem);
        }

        // Event listeners remain the same
        document.querySelectorAll(".deleteLesion").forEach(button => {
            button.addEventListener("click", async function() {
                await sendTime("Deleted Lesion");
                const lesionID = this.dataset.id;
                undoDelete = true;
                deletedLesionID = lesionID
                await toggleDeleteLesion(lesionID, csrfToken);
                reload();
            });
        });

        document.querySelectorAll(".toggleVisibility").forEach(button => {
            button.addEventListener("click", async function() {
                const lesionID = this.dataset.id;
                await toggleShownLesion(lesionID, csrfToken);
                reload();
            });
        });
    }

});
