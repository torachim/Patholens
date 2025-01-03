import { Niivue, DRAG_MODE } from "./index.js";
import { niivueCanvas } from "./niivueCanvas.js";


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

    const canvas = document.getElementById("imageBrain");

    const nv = niivueCanvas({
               onDragRelease: onDragRelease,
               dragMode: DRAG_MODE.callbackOnly,
               penSize: 3,
               maxDrawUndoBitmaps: 200,     // max 200 undos possible
               }, 
               canvas)

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
        saveDrawingState();
        nv.setDrawingEnabled(true);
        // 0 = Eraser and true => eraser ist filled so a whole area can be erased
        changeDrawingMode(0, true);
       
    });

    // INFO: You need to right click and drag to draw rectangle
    // enable rectangle drawing when the corresponding button in html is clicked
    document.getElementById("frameTool").addEventListener("click", function () {
        startTimer()
        saveDrawingState();
        nv.setDrawingEnabled(true);
        nv.opts.dragMode = DRAG_MODE.callbackOnly;  // Draw rectangle only when dragging
        nv.opts.onDragRelease = onDragRelease;      // Set callback for rectangle drawing
    });

    // Function to start the timer 
    function startTimer(){
        startTime = performance.now();
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
        
        sendData(confidenceValue);
        saveEditedImage();
    });

    // Send the confidence to the backend
    // Async function to handle an error that sometimes
    // appeares because of the two fetch calls back to back
    async function sendData(confidenceValue){
        await fetch(`/image/api/saveConfidence/${diagID}/`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'X-CSRFToken': getCookie('csrftoken') 
             },
             body: JSON.stringify({
                 confidence: confidenceValue
             })
         })
         .then(response => {
             if (response.ok) {
                 console.log('Confidence updated successfully!');
                 return response.json();
             } else {
                 throw new Error('Failed to save confidence value');
             }
         })
         .catch(error => console.error(error));

         endTimer('Confidence confirmed');

         window.location.assign(`/image/AIpage/${diagnosisID}`);
     }

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
        endTimer('Aborted confidence');
    });

    
    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.style.display = "none";
            endTimer('Aborted confidence');
        }
    })

    // Undo the drawing/erasing
    document.getElementById("undoTool").addEventListener("click", function (e) {
        nv.drawUndo();
    })


    // get the image diagID with getURL function from diagnosisManager
    async function fetchImageURL(diagID) {
        try {
            const response = await fetch(`/api/getURL/${diagID}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                return data.url;
            } else {
                console.error("Failed to fetch the URL:", response.status);
                return null;
            }
        } catch (error) {
            console.error("Error fetching the URL:", error);
            return null;
        }
    }

    // get the doctorID from accounts
    async function fetchDoctorID() {
        try {
            const response = await fetch(`/api/getDoctorID/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                return data.docID;
            } else {
                console.error("Failed to fetch the Doctor ID:", response.status);
                return null;
            }
        }
        catch (error) {
            console.error("Error fetching the Doctor ID:", error);
            return null;
        }
    }



    // Save the edited image
    async function saveEditedImage() {
        try {
            // Wait for subID from fetchImageURL
            const subID = await fetchImageURL(diagnosisID);
            const docID = await fetchDoctorID();
    
            if (!subID) {
                console.error("Image subID could not be retrieved.");
                return;
            }
    
            const filename = `sub-${subID}_acq-${docID}_space-edited-image.nii.gz`; // Dynamic filename
    
            // Create the blob object for the image
            const imageBlob = nv.saveImage({
                isSaveDrawing: true,
                filename: filename,
                volumeByIndex: 0,
            });
            
            // Create a FormData object
            const formData = new FormData();
            formData.append("filename", filename);
            formData.append("subID", subID)
            formData.append("imageFile", new Blob([imageBlob], { type: "application/octet-stream" }));
    
            // Send the data to the API
            const response = await fetch("/image/api/saveImage/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"), // CSRF-Security
                },
                body: formData,
            });
    
            if (response.ok) {
                console.log("Image saved successfully!");
            } else {
                console.error("Failed to save the image:", response.statusText);
            }
        } catch (error) {
            console.error("Error during save operation:", error);
        }
    }
    
    
    
    // Retrieve CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === `${name}=`) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
     
    // save image if logged out
    document.getElementById("logoutButton").addEventListener("click", saveEditedImage);
});