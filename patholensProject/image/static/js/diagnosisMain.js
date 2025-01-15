import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas, drawRectangleNiivue,loadImageAPI, endTimer, sendConfidence, savedEditedImage, loadImageWithDiagnosis } from "./pathoLens.js";


document.addEventListener('DOMContentLoaded', function() {

    let startTime;
    let drawRectangle = false;
    let erasing = false;

    //function to drag a rectangle in the niivue 
    // define what happens on dragRelase (right mouse up)
    const onDragRelease = (data) => {
        drawRectangle = true;
        //if drawing is enabled
        if (nv.opts.drawingEnabled){
            drawRectangleNiivue(nv, data)
            endTimer("Rectangle", startTime, diagnosisID, csrfToken)
            nv.setDrawingEnabled(false); //drawingEnabled equals false so you have to click the button again to draw another rechtangle
            deactivateAllButtons(); //deactiviates the active style of button
        }
    }

    const canvas = document.getElementById("imageBrain");

    const nv = niivueCanvas({
               onDragRelease: onDragRelease,
               dragMode: DRAG_MODE.callbackOnly,
               penSize: 3,
               maxDrawUndoBitmaps: 200,     // max 200 undos possible
               drawOpacity: 0.65,
               }, 
               canvas)

    // Load FLAIR default
    let selectedFormat = "FLAIR";

    // Function to handle changes in the format selection
    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach((radio) => {
        radio.addEventListener('change', (event) => {
            selectedFormat = event.target.value;
            if (mode === "new") {
                loadImage(selectedFormat);
            } else if (mode === "continue") {
                loadImageAndEdited();
            }
        });
    });

    // Call the appropriate function based on the mode
    if (mode === "new") {
        loadImage();
    } else if (mode === "continue") {
        loadImageAndEdited(); // Calls loadImageAndDiagnosis internally
    }


    async function loadImageAndEdited() {
        const volumes = await loadImageWithDiagnosis(diagnosisID, selectedFormat);
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

    /**
     * 
     * @param {int} mode
     * - 0 = Eraser, 4 = yellow, 6 = purple
     * @param {boolean} filled
     * True => drawn shape will be filled
     */
    function changeDrawingMode(mode, filled){
        nv.setPenValue(mode, filled);
    }

    // Pixel
    document.getElementById("selectTool").addEventListener("click", function(e){
        drawRectangle = false;
        erasing = false;
        startTimer()
        saveDrawingState();
        nv.setDrawingEnabled(true);  
        changeDrawingMode(6, false);
        activateButton("selectTool"); //changes button style while selected
    });

    // disables drawing after a Pixel is marked
    document.getElementById("imageBrain").addEventListener("mouseup", disableDrawing)

    // disables drawing
    function disableDrawing(){
        deactivateAllButtons();
        if(!drawRectangle && !erasing){
            endTimer('Freehand drawing', startTime, diagnosisID, csrfToken)
        }
        else if(!drawRectangle && erasing){
            endTimer('Erasing', startTime, diagnosisID, csrfToken)
            erasing = false
        }
        nv.setDrawingEnabled(false);
    }  
    
    // enables erasing the drawing by clicking on eraser
    document.getElementById("eraseTool").addEventListener("click", function(e){
        erasing = true;
        drawRectangle = false;
        startTimer();
        saveDrawingState();
        nv.setDrawingEnabled(true);
        // 0 = Eraser and true => eraser ist filled so a whole area can be erased
        changeDrawingMode(0, true);
        activateButton("eraseTool"); 
    });

    // INFO: You need to right click and drag to draw rectangle
    // enable rectangle drawing when the corresponding button in html is clicked
    document.getElementById("frameTool").addEventListener("click", function () {
        startTimer()
        saveDrawingState();
        nv.setDrawingEnabled(true);
        nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
        nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
        activateButton("frameTool"); //changes button style while drawing rectangle
    });

     // Undo the drawing/erasing
     document.getElementById("undoTool").addEventListener("click", function (e) {
        nv.drawUndo();
        deactivateAllButtons(); //only changes style after being clicked
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
    

    // Function to start the timer 
    function startTimer(){
        startTime = performance.now();
    }

    //confidence meter window 
    const confirmButton = document.querySelector('.popupConfirm');
    const confidenceSlider = document.getElementById('confidenceMeter');

    // Listener for the confirmation button
    confirmButton.addEventListener('click', () => {
        const confidenceValue = confidenceSlider.value; 
        endDiagnosis(confidenceValue);
    });

    async function endDiagnosis(confidenceValue){
        await sendConfidence(confidenceValue, diagnosisID, csrfToken);
        await endTimer('Confidence confirmed', startTime, diagnosisID, csrfToken);
        await savedEditedImage(nv, diagnosisID, csrfToken);
        window.location.assign(`/image/AIpage/${diagnosisID}`)
    }

    const finishButton = document.getElementById("finishButton");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const popupFrame = document.getElementById("popupFrame");

    popupOverlay.style.display = "none";

    // Function to show the confidence window
    finishButton.addEventListener("click", () => {
        popupOverlay.style.display = "flex";
        popupFrame.style.display = "block";
        startTimer();
    });

    // Functions to close the confidence window
    closePopup.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        endTimer('Aborted confidence', startTime, diagnosisID, csrfToken);
    });

    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = "none";
            endTimer('Aborted confidence', startTime, diagnosisID, csrfToken);
        }
    })

    // save image if logged out        ATTENTION: prevent saving image twice!! It wont work
    //document.getElementById("logoutButton").addEventListener("click", savedEditedImage(nv, diagnosisID, csrfToken));

});


