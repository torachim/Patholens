import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas, drawRectangleNiivue,loadImageAPI, sendTimeStamp, sendConfidence, savedEditedLesion, loadImageWithDiagnosis, drawCubeNV, jumpRectangle, setContinueDiag, changePenValue, getLesionConfidence, deleteLesion, getNumberOfLesions } from "./pathoLens.js";


document.addEventListener('DOMContentLoaded', function() {

    let drawRectangle = false;
    let erasing = false;
    let drawCube = false;
    let drawUndoCube = false;
    let pen = false;
    let lesionNumber = 1;
    let penValue = 1;
    let save = false;
    let homeOrLog= false;
    let diagnosisStarted = false;


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


    // Function to handle changes in the format selection
    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            selectedFormat = event.target.value;
            if (mode === "new") {
                if (diagnosisStarted){
                    loadImageAndEdited();
                }
                else {
                    loadImage(selectedFormat);
                }
            } else if (mode === "continue") {
                loadImageAndEdited();
            }

        });
    });

    // Call the appropriate function based on the mode
    if (mode === "new") {
        sendTime("Started Diagnosis");
        loadImage();
        updateLesionList();
    } else if (mode === "continue") {
        sendTime("Continue Diagnosis");
        loadImageAndEdited(); // Calls loadImageAndDiagnosis internally
        updateLesionList();
    }


    async function loadImageAndEdited() {
        const volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormat);
        lesionNumber = await getNumberOfLesions(diagnosisID) + 1;
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
            erasing = false;
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
        if(!drawRectangle && !erasing && pen){
            sendTime("Freehand Drawing");
            pen = false;
            nv.setDrawingEnabled(false);
        }
        else if(!drawRectangle && erasing){
            sendTime("Erasing");
            erasing = false
            nv.setDrawingEnabled(false);
        }   
    }  
    
    // enables erasing the drawing by clicking on eraser
    document.getElementById("eraseTool").addEventListener("click", function(e){
        if(drawCube){
            showAlertWindow();
        }
        else{
            erasing = true;
            drawRectangle = false;
            saveDrawingState();
            nv.setDrawingEnabled(true);
            // 0 = Eraser and true => eraser ist filled so a whole area can be erased
            changeDrawingMode(0, true);
            activateButton("eraseTool"); 
        }
    });

    // INFO: You need to right click and drag to draw rectangle
    // enable rectangle drawing when the corresponding button in html is clicked
    document.getElementById("frameTool").addEventListener("click", function () {
        if(save){
            showSaveInfo();
        }
        else{
            saveDrawingState();
            nv.setDrawingEnabled(true);
            nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
            nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
            activateButton("frameTool"); //changes button style while drawing rectangle
        }
    });

     // Undo the drawing/erasing
     document.getElementById("undoTool").addEventListener("click", function (e) {
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
        deactivateAllButtons(); //only changes style after being clicked
        sendTime("Undo")
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
        diagnosisStarted = true;
    });

    // show the save window if the user clicks on the save button
    saveLesionButton.addEventListener("click", () => {
        showSaveWindow();
    })

    // Save the image and send the time stamp
    async function saveImage(confidence){
        await savedEditedLesion(nv, diagnosisID, lesionNumber, confidence, csrfToken);
        sendTime("Saved Lesion");
        nv.createEmptyDrawing();
        loadImageAndEdited();
        updateLesionList();
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
         await setContinueDiag(diagnosisID, csrfToken);
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


    async function updateLesionList(){
        const lesions = await getLesionConfidence(diagnosisID);
        lesionList.innerHTML = "";

        if(lesions.length == 0){
            lesionList.innerHTML = "<p>No lesions saved yet</p>";
            return;
        }

        for(let i = 0; i < lesions.length; i++){
            const lesion = lesions[i]
            const listItem = document.createElement("li");
            listItem.className = "lesionItem";

            listItem.innerHTML = `
                <span class = "lesionName"> ${lesion['name']} </span>
                <span class="lesionConfidence"> Confidence: ${lesion['confidence']} </span>
                <button class="deleteLesion" data-id="${lesion['lesionID']}">&times;</button>
                `;
            
                lesionList.appendChild(listItem);
        }

        document.querySelectorAll(".deleteLesion").forEach(button => {
            button.addEventListener("click", function(){
                const lesionID = this.dataset.id;
                console.log("lesion: ", lesionID);
                deleteLesion(diagnosisID, lesionID, csrfToken);
                reload();
            })
        })


        async function reload(){
            let numberLesions = await getNumberOfLesions(diagnosisID);
            if(numberLesions != 0){
                await loadImageAndEdited();
            } else {
                await loadImage(selectedFormat);
            }
            await updateLesionList();
        }
    }

});




