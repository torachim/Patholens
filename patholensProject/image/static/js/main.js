import { Niivue, DRAG_MODE } from "./index.js";

document.addEventListener('DOMContentLoaded', function() {

    let startTime, endTime;

    let drawRectangle = false;
    let erasing = false;
    //function to drag a rectangle in the niivue 
    // define what happens on dragRelase (right mouse up)
    const onDragRelease = (data) => {

        drawRectangle = true;

        //if drawing is enabled
        if (nv.opts.drawingEnabled){
            const value = 3 // blue
            nv.setPenValue(value) 

            const { voxStart, voxEnd, axCorSag } = data
            // these rect corners will be set based on the plane the drawing was created in 
            let topLeft, topRight, bottomLeft, bottomRight
        
            if (axCorSag === 0) {
                // axial view: Z is fixed, vary X and Y
                const minX = Math.min(voxStart[0], voxEnd[0])
                const maxX = Math.max(voxStart[0], voxEnd[0])
                const minY = Math.min(voxStart[1], voxEnd[1])
                const maxY = Math.max(voxStart[1], voxEnd[1])
                const fixedZ = voxStart[2]
                topLeft = [minX, minY, fixedZ]
                topRight = [maxX, minY, fixedZ]
                bottomLeft = [minX, maxY, fixedZ]
                bottomRight = [maxX, maxY, fixedZ]
            } else if (axCorSag === 1) {
                // coronal view: Y is fixed, vary X and Z
                const minX = Math.min(voxStart[0], voxEnd[0])
                const maxX = Math.max(voxStart[0], voxEnd[0])
                const minZ = Math.min(voxStart[2], voxEnd[2])
                const maxZ = Math.max(voxStart[2], voxEnd[2])
                const fixedY = voxStart[1]
                topLeft = [minX, fixedY, minZ]
                topRight = [maxX, fixedY, minZ]
                bottomLeft = [minX, fixedY, maxZ]
                bottomRight = [maxX, fixedY, maxZ]
            } else if (axCorSag === 2) {
                // sagittal view: X is fixed, vary Y and Z
                const minY = Math.min(voxStart[1], voxEnd[1])
                const maxY = Math.max(voxStart[1], voxEnd[1])
                const minZ = Math.min(voxStart[2], voxEnd[2])
                const maxZ = Math.max(voxStart[2], voxEnd[2])
                const fixedX = voxStart[0]
                topLeft = [fixedX, minY, minZ]
                topRight = [fixedX, maxY, minZ]
                bottomLeft = [fixedX, minY, maxZ]
                bottomRight = [fixedX, maxY, maxZ]
            }

            // draw the rect lines
            nv.drawPenLine(topLeft, topRight, value)
            nv.drawPenLine(topRight, bottomRight, value)
            nv.drawPenLine(bottomRight, bottomLeft, value)
            nv.drawPenLine(bottomLeft, topLeft, value)
            // refresh the drawing
            nv.refreshDrawing(true) // true will force a redraw of the entire scene (equivalent to calling drawScene() in niivue)
            endTimer("Rectangle")
            nv.setDrawingEnabled(false); //drawingEnabled equals false so you have to click the button again to draw another rechtangle

        }
    }
        
    // init niivue instance
    const nv = new Niivue({
        onDragRelease: onDragRelease,
        dragMode: DRAG_MODE.callbackOnly,
        penSize: 3,
    });
        
    const canvas = document.getElementById("imageBrain");

    //function to resize the canvas field in dependency of the device
    function adjustCanvasForDPI(canvas) {
        const dpi = window.devicePixelRatio || 1;
    
        // Get the size from the canvas element from the css
        const computedStyle = getComputedStyle(canvas);
        const width = parseInt(computedStyle.getPropertyValue('width'), 10);
        const height = parseInt(computedStyle.getPropertyValue('height'), 10);
    
        // set the new width and height 
        canvas.width = width * dpi;
        canvas.height = height * dpi;
    }
    
    nv.attachToCanvas(canvas);

    adjustCanvasForDPI(canvas);

    nv.setMultiplanarPadPixels(60);


    const baseApiURL = `/image/api/getImage/${diagnosisID}`;


    // Load FLAIR default
    let selectedFormat = "FLAIR";
    loadImage(selectedFormat);

    //function to change the picture format if the buttons are clicked
    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (event) => {
            selectedFormat = event.target.value;
            loadImage(selectedFormat);
        });
    });

    
    function loadImage(format) {
        //get the apiURL to fetch the path to the requested image
        const apiURL = `${baseApiURL}/?format =${format}`;
        console.log(`API URL: ${apiURL}`);

        //fetch the data from the given apiURL
        fetch(apiURL)
            .then(response => {
                console.log("Response status:", response.status);
                //if response not ok throw the error
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                console.log(response)
                return response.json();
            })
            .then(data => {
                //get the image URL with the data.path from the api
                const imageURL = `http://127.0.0.1:8000${data.path}`;
                console.log("Image URL:", imageURL);

                //load the nifti with the fetched imageURL 
                nv.loadVolumes([
                    {
                        url: imageURL,
                        schema: "nifti"
                    },
                ]);

            })
            //catch the possible error
            .catch(err => {
                console.error("Error loading NIfTI file:", err);
            });
    }

    // Drawing functions from here on
    nv.setDrawOpacity(0.65);
    
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
        nv.setDrawingEnabled(true);  
        changeDrawingMode(6, false);
    });
    

    // disables drawing after a Pixel is marked
    document.getElementById("imageBrain").addEventListener("mouseup", disableDrawing)

    // disables drawing
    function disableDrawing(){
        if(!drawRectangle && !erasing){
            endTimer('Freehand drawing')
        }
        else if(!drawRectangle && erasing){
            endTimer('Erasing')
            erasing = false
        }
        nv.setDrawingEnabled(false);
    }  

    
    // enables erasing the drawing by clicking on eraser
    document.getElementById("eraseTool").addEventListener("click", function(e){
        erasing = true;
        drawRectangle = false;
        startTimer();
        nv.setDrawingEnabled(true);
        // 0 = Eraser and true => eraser ist filled so a whole area can be erased
        changeDrawingMode(0, true);
       
    });

    // INFO: You need to right click and drag to draw rectangle
    // enable rectangle drawing when the corresponding button in html is clicked
    document.getElementById("frameTool").addEventListener("click", function () {
        startTimer()
        nv.setDrawingEnabled(true);
        nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
        nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
    });

    // Function to start the timer 
    function startTimer(){
        startTime = performance.now();
        console.log("start")
    }

    // Function to send the timer and give the time to the API
    function endTimer(action){
        endTime = performance.now();

        const absoluteTime =  endTime - startTime;

        sendTimeAPI(action, absoluteTime)
    }

    // Function to send the useTime with the API to the backend
    function sendTimeAPI(action, absoluteTime){
        const actionTime = {
                action: action,
                absoluteTime: absoluteTime,
                diagnosisID: diagnosisID,
        }

        // Fetch the API URL
        fetch('/image/api/setUseTime/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(actionTime)
        })
        .then(response => {
            if(!response.ok){
                throw new Error('Error while saving the time!');
            }
            return response.json()
        })
        .then(data => console.log('Saving Time succesfull', data))
        .catch(error => console.log('error', error))

    }

    // Buttons in the confidence Window
    const confirmButton = document.querySelector('.popupConfirm');
    const confidenceSlider = document.getElementById('confidenceMeter');

    // Fetch diagID from the hidden input field
    const diagID = document.getElementById('diagID').value;

    // Listener for the confirmation button
    confirmButton.addEventListener('click', () => {
        const confidenceValue = confidenceSlider.value;
        

        // Send the confidence to the backend
        fetch(`/image/api/saveConfidence/${diagID}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                confidence: confidenceValue
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Confidence updated successfully!');
                return response.json();
            } else {
                throw new Error('Failed to save confidence value');
            }
        })
        .catch(error => console.error(error));
        
        setTimeout(() => {endTimer('Confidence confirmed')}, 100);
    
    });

    // Function to retrieve CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const finishButton = document.getElementById("finishButton");
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");

    popupOverlay.style.display = "none";


    // Function to show the confidence window
    finishButton.addEventListener("click", () => {
        popupOverlay.style.display = "flex";
        startTimer();
    });

    // Functions to close the confidence window
    closePopup.addEventListener("click", () => {
        popupOverlay.style.display = "none";
        endTimer('Aborted confidence');
    });

    
    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = "none";
            endTimer('Aborted confidence');
        }
    });

});