import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas,drawRectangleNiivue,loadImageAPI, loadImageWithDiagnosis, loadImageWithMask, loadOverlayDAI, sendTimeStamp, sendConfidence, savedEditedLesion, deleteContinueDiagnosis, jumpRectangle, drawCubeNV, setContinueDiag, changePenValue} from "./pathoLens.js";

document.addEventListener('DOMContentLoaded', function() {
    //Not working properly I have to change a few things 
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
            console.log(selectedFormatMask)
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

     // Initialization
     async function initialize() {
        const models = await getModels(diagnosisID);
        createDropdownOptions(models);
        
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.addEventListener('click', handleDropdownClick);
        });

        await loadZoomImage();
        await loadMainImage();
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
            changeDrawingMode(6, false);
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

     // Undo the drawing/erasing Should be edited
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
        await savedEditedLesion(nv, diagnosisID, csrfToken);
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

    const logOut = document.getElementById("logoutButton");
    const homePage = document.getElementById("homePageButton");
    
    async function  setContinue() {
        await setContinueDiag(diagnosisID, "editDiagnosis", csrfToken);
    }
    
    logOut.addEventListener("click", () => {
        setContinue();
    })

    homePage.addEventListener("click", () => {
        setContinue();
    })

});

