import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas,drawRectangleNiivue,loadImageAPI, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, endTimer, sendConfidence, savedEditedImage, deleteContinueDiagnosis } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function() {
    

    let startTime;
    let drawRectangle = false;
    let erasing = false;
    
    //function to drag a rectangle in the niivue 
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

    loadImages(); //loading zoomable Images 
    loadImage(); //loading main Image

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
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

    // Dropdown change listener for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown');
    displayDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
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
        nvZoom.loadVolumes(volumes);
    };

     //loading Images for the main Frame
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
        }
    });

    document.body.addEventListener("click", (e) =>{
        if(zoomed){
            console.log(e.target);
            if(e.target != comparisonContainer && e.target != zoomButton ){
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
        await endTimer('Confidence confirmed', startTime, diagnosisID, csrfToken);
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

     // save image if logged out
     //document.getElementById("logoutButton").addEventListener("click", savedEditedImage(nv, diagnosisID, csrfToken));
});
