import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas,drawRectangleNiivue,loadImageAPI, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, sendTimeStamp, sendConfidence, savedEditedImage, deleteContinueDiagnosis, jumpRectangle, drawCubeNV } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function() {
    
    let drawRectangle = false;
    let erasing = false;
    let drawCube = false;
    let drawUndoCube = false;

    const jumpRect = document.getElementById("jumpRect");
    const alertMessageBox = document.getElementById("alertMessageBox");
    const closeAlertWindow = document.getElementById("closeAlertWindow");
    
    //function to drag a rectangle in the niivue 
    const onDragRelease = (data) => {
        drawRectangle = true;
        //if drawing is enabled
        if (nv.opts.drawingEnabled){
            if(drawCube){
                let finishedCube;
                finishedCube = drawCubeNV(nv, data);
                if(!finishedCube){
                    showAlertWindow();
                }
                else{
                    sendTime("Cuboid Edit");
                    saveDrawingState();
                    drawUndoCube = true;
                    drawCube = false;
                    jumpRect.style.display = "none"
                }
            }
            else{
                drawRectangleNiivue(nv, data)
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
    let selectedFormatMask = "DEEPFCD";
    let selectedFormatMri = "FLAIR"
    let selectedDisplay = "AI Diagnosis"
    let selectedFormat = "FLAIR";

    const aiModelMapping = {
        "Model A": "DEEPFCD",
        "Model B": "MAP18",
        "Model C": "MELD",
        "Model D": "NNUNET"
    };

    loadZoomImage(); //loading zoomable Images 
    loadMainImage(); //loading main Image

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('click', (event) => {
        const action = `AI Model ${selectedFormatMask}`;
        if (event.target.classList.contains('option')) {
            if(selectedDisplay != "My Diagnosis"){
                sendTime(action);
            }
            selectedFormatMask = aiModelMapping[event.target.textContent];
            loadZoomImage();
        }
    });

    // Dropdown change listener for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            selectedFormatMri = event.target.textContent;
            loadZoomImage();
            loadMainImage();
        }
    });

    // Dropdown change listener for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown');
    displayDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            if(event.target.textContent == "My Diagnosis"){
                const action = `AI Model ${selectedFormatMask}`;
                sendTime(action);
            }
            selectedDisplay = event.target.textContent;
            loadZoomImage();
        }
    });
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
    };

     //loading Images for the main Frame
    async function loadMainImage() {
        const volumes = await loadImageAPI(selectedFormatMri, diagnosisID);
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

    jumpRect.addEventListener("click", () => {
        jumpRectangle(nv);
    })

    // Pixel
    document.getElementById("selectTool").addEventListener("click", function(e){
        if(drawCube){
            showAlertWindow();
        }
        else{
            drawRectangle = false;
            erasing = false;
            saveDrawingState();
            nv.setDrawingEnabled(true);  
            changeDrawingMode(6, false);
            activateButton("selectTool"); //changes button style while selected
        }
    });
        
     // disables drawing after a Pixel is marked
    document.getElementById("imageBrain").addEventListener("mouseup", disableDrawing)
     
    // disables drawing
    function disableDrawing(){
        deactivateAllButtons();
        if(!drawRectangle && !erasing){
            sendTime("Freehand Drawing Edit");
        }
        else if(!drawRectangle && erasing){
            sendTime("Erasing Edit");
            erasing = false
        }
        nv.setDrawingEnabled(false);
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
        saveDrawingState();
        nv.setDrawingEnabled(true);
        nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
        nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
        activateButton("frameTool"); //changes button style while drawing rectangle
    });

     // Undo the drawing/erasing
     document.getElementById("undoTool").addEventListener("click", function (e) {
        nv.drawUndo();
        if(drawCube){
            drawCube = false;
            jumpRect.style.display = "none";
        }
        else if(drawUndoCube){
            drawCube = true;
            drawUndoCube = false;
            jumpRect.style.display = "flex";
        }
        sendTime("Undo Edit")
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
            console.log(e.target);
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

    
    // dropdown functionality

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
        await sendTime("Finished Diagnosis");
        await savedEditedImage(nv, diagnosisID, csrfToken);
        await deleteContinueDiagnosis(diagnosisID, csrfToken);
        window.location.assign(`/image/editDiagnosis/${diagnosisID}/transitionPage/`)
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
        sendTime("Aborted Confidence Edit");
    });

    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = "none";
            sendTime("Aborted Confidence Edit");
        }
    })
    
    const alertOverlay = document.getElementById("alertOverlay");

    closeAlertWindow.addEventListener("click", () => {
        alertMessageBox.style.display = "none";
        alertOverlay.style.display = "none";
    })

 
    function showAlertWindow(){
        alertMessageBox.style.display = "flex"
        alertOverlay.style.display = "flex";
    }

     // save image if logged out
     //document.getElementById("logoutButton").addEventListener("click", savedEditedImage(nv, diagnosisID, csrfToken));
});

//1