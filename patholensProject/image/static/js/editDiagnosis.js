import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas,drawRectangleNiivue,loadImageAPI, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, endTimer, sendConfidence, savedEditedImage } from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function() {
    
    // tool bar functions 
    let startTime;
    let drawRectangle = false;
    let erasing = false;
    
    //function to drag a rectangle in the niivue 
    const onDragRelease = (data) => {
        drawRectangle = true;
        //if drawing is enabled
        if (nvMain.opts.drawingEnabled){
            drawRectangleNiivue(nvMain, data)
            endTimer("Rectangle", startTime, diagnosisID, csrfToken)
            nvMain.setDrawingEnabled(false); //drawingEnabled equals false so you have to click the button again to draw another rechtangle
        }
    }



    //Loading Images for the zoom Frame

    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({}, canvas);

    const canvasMain = document.getElementById("imageBrainMain");
    const nvMain = niivueCanvas({
        onDragRelease: onDragRelease,
        dragMode: DRAG_MODE.callbackOnly,
        penSize: 3,
        maxDrawUndoBitmaps: 200,     // max 200 undos possible
        drawOpacity: 0.65,
        }, 
        canvasMain)
   
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

    loadImages();
    loadImage();

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
        nv.loadVolumes(volumes);
    };

    
     //loading Images for the main Frame

    async function loadImage() {
        const volumes = await loadImageAPI(selectedFormat, diagnosisID);
        nvMain.loadVolumes(volumes);
    }


     // Add drawing state to history
     function saveDrawingState() {
        nvMain.drawAddUndoBitmap();
    }

    /**
     * 
     * @param {int} mode
     * - 0 = Eraser, 4 = yellow, 6 = purple
     * @param {boolean} filled
     * True => drawn shape will be filled
     */
    function changeDrawingMode(mode, filled){
        nvMain.setPenValue(mode, filled);
    }

    // Pixel
    document.getElementById("selectTool").addEventListener("click", function(e){
        drawRectangle = false;
        erasing = false;
        startTimer()
        saveDrawingState();
        nvMain.setDrawingEnabled(true);  
        changeDrawingMode(6, false);
    });
        
  // disables drawing after a Pixel is marked
    document.getElementById("imageBrainMain").addEventListener("mouseup", disableDrawing)
       
    // disables drawing
    function disableDrawing(){
        if(!drawRectangle && !erasing){
            endTimer('Freehand drawing', startTime, diagnosisID, csrfToken)
        }
        else if(!drawRectangle && erasing){
            endTimer('Erasing', startTime, diagnosisID, csrfToken)
            erasing = false
        }
        nvMain.setDrawingEnabled(false);
    } 
        
        
        // enables erasing the drawing by clicking on eraser
    document.getElementById("eraseTool").addEventListener("click", function(e){
        erasing = true;
        drawRectangle = false;
        startTimer();
        saveDrawingState();
        nvMain.setDrawingEnabled(true);
        // 0 = Eraser and true => eraser ist filled so a whole area can be erased
        changeDrawingMode(0, true);
       
    });

    // enable rectangle drawing when the corresponding button in html is clicked
    document.getElementById("frameTool").addEventListener("click", function () {
        startTimer()
        saveDrawingState();
        nvMain.setDrawingEnabled(true);
        nvMain.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
        nvMain.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
    });

    // Function to start the timer 
    function startTimer(){
        startTime = performance.now();
    }
    


    // Zoom

    const comparisonContainer = document.getElementById("comparisonContainer");
    const zoomButton = document.getElementById("zoomButton");
    let zoomed = false;
    const dropdownMenus = document.querySelectorAll(".dropdown");

    function zoomOut(){
        comparisonContainer.style.width = "50%";
        comparisonContainer.style.top = "";
        comparisonContainer.style.height = "24%";
        zoomButton.src = "/static/icons/editPageZoomButton.png";
        zoomed = false;
    }

    zoomButton.addEventListener("click", () =>{
        if(zoomed){
            zoomOut();
        }

        else{
            comparisonContainer.style.width = "74%";
            comparisonContainer.style.top = "35%";
            comparisonContainer.style.height = "53%";
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


    // dropdown function

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

    // Undo the drawing/erasing
    document.getElementById("undoTool").addEventListener("click", function (e) {
        nvMain.drawUndo();
    })
    
     // save image if logged out
     document.getElementById("logoutButton").addEventListener("click", savedEditedImage(nv, diagnosisID, csrfToken));
});

//Test 7