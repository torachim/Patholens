import { Niivue } from "./index.js";

/**
 * Create a niivue object and attach it to a given canvas
 * @param {dictionary} niivueOptions - A Dictionary with the Niivue options -> see Niivue documentation
 * @param {*} canvas - A HTML canvas object to which the niivue object got attached to. 
 * @returns Niivue object
 * @example niivueCanvas({drawOpacity: 0.8}, canvas)
 */
export function niivueCanvas(niivueOptions, canvas){
    // init niivue instance
    const nv = new Niivue(niivueOptions);
            
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

    return nv;
}


let rectangleTR = [-10, -10, -10];
let rectangleTL = [-10, -10, -10];
let rectangleBR = [-10, -10, -10];
let rectangleBL = [-10, -10, -10];
let corAx;

/**
 * Draws a rectangle when released
 * @param {Niivue} nv - Niivue instance
 * @param {*} data - The data from the drag and release
 */
export function drawRectangleNiivue(nv, data){

    nv.setDrawOpacity(0.5);
    const colourValue = 3 // blue
    nv.setPenValue(colourValue) 

    const { voxStart, voxEnd, axCorSag } = data
    // these rect corners will be set based on the plane the drawing was created in 
    let topLeft, topRight, bottomLeft, bottomRight
    let newAxCor;

    switch(axCorSag){
        case(0):{
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

            newAxCor = 0;

            break;
        }
        case (1) :{
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

            newAxCor = 1;

            break;
        }
        case(2) :{
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

            newAxCor = 2;

            break;
        }
    }

    fillRectangle(nv, bottomLeft, bottomRight, topLeft, topRight);

    // draw the rect lines
    nv.drawPenLine(topLeft, topRight, colourValue);
    nv.drawPenLine(topRight, bottomRight, colourValue);
    nv.drawPenLine(bottomRight, bottomLeft, colourValue);
    nv.drawPenLine(bottomLeft, topLeft, colourValue);

    rectangleBL = bottomLeft;
    rectangleBR = bottomRight;
    rectangleTL = topLeft;
    rectangleTR = topRight;

    corAx = newAxCor;
    
    // refresh the drawing
    nv.refreshDrawing(true) // true will force a redraw of the entire scene (equivalent to calling drawScene() in niivue)  
}


/**
 * Jumps to the bottom Left corner (viewer perspective) of the drawn rectangle 
 * @param {Niivue} nv - Niivue instance
 */
export function jumpRectangle(nv){
    nv.moveCrosshairInVox(-207, -319, -319);
    const positionX = rectangleTL[0];
    const positionY = rectangleTL[1];
    const positionZ = rectangleTL[2];
    nv.moveCrosshairInVox(positionX, positionY, positionZ)
}

/**
 * Draw a cube when a second rectangle is connected to the first
 * @param {Niivue} nv - Niivue instance
 * @param {dict} data - The data created by the drag release
 * @returns bool
 */
export function drawCubeNV(nv, data){

    const colourValue = 3;
    nv.setPenValue(colourValue);

    // Get the data from the drag
    const { voxStart, voxEnd, axCorSag } = data;

    let topLeftD, topRightD, bottomLeftD, bottomRightD;

    // Copy the variables to move them in the depth
    topLeftD = { ...rectangleTL };
    topRightD = { ...rectangleTR };
    bottomLeftD = { ...rectangleBL };
    bottomRightD = { ...rectangleBR};

    let depth;

    // Check if either voxStart or voxEnd is near an edge of the existing rectangle
    const voxStartNear = comparePtToRect(voxStart);
    const voxEndNear = comparePtToRect(voxEnd);

    // If it is near an edge
    if(voxStartNear || voxEndNear){

        switch(corAx){
            case(0):{
                // Calculate the depth
                if(Math.abs(voxStart[2] - rectangleTR[2]) < Math.abs(voxEnd[2] - rectangleTR[2])){
                    depth = voxEnd[2] - voxStart[2];
                }
                else{
                    depth = voxStart[2] - voxEnd[2];
                }
                // Calculate the missing corners of the cuboid
                topLeftD[2] = topLeftD[2] + depth;
                topRightD[2] = topRightD[2] + depth;
                bottomLeftD[2] = bottomLeftD[2] + depth;
                bottomRightD[2] = bottomRightD[2] + depth;
                break;
            }
            case(1):{
                // Calculate the depth
                if(Math.abs(voxStart[1] - rectangleTR[1]) < Math.abs(voxEnd[1] - rectangleTR[1])){
                    depth = voxEnd[1] - voxStart[1];
                }
                else{
                    depth = voxStart[1] - voxEnd[1];
                }
                // Calculate the missing corners of the cuboid
                topLeftD[1] = topLeftD[1] + depth;
                topRightD[1] = topRightD[1] + depth;
                bottomLeftD[1] = bottomLeftD[1] + depth;
                bottomRightD[1] = bottomRightD[1] + depth;
                break;
            }
            case(2):{
                // Calculate the depth
                if(Math.abs(voxStart[0] - rectangleTR[0]) < Math.abs(voxEnd[0] - rectangleTR[0])){
                    depth = voxEnd[0] - voxStart[0];
                }
                else{
                    depth = voxStart[0] - voxEnd[0];
                }
                // Calculate the missing corners of the cuboid
                topLeftD[0] = topLeftD[0] + depth;
                topRightD[0] = topRightD[0] + depth;
                bottomLeftD[0] = bottomLeftD[0] + depth;
                bottomRightD[0] = bottomRightD[0] + depth;
                break;
            }
        }

        // Draw the missing edges
        nv.drawPenLine(rectangleTL, topLeftD, colourValue);
        nv.drawPenLine(rectangleTR, topRightD, colourValue);
        nv.drawPenLine(rectangleBL, bottomLeftD, colourValue);
        nv.drawPenLine(rectangleBR, bottomRightD, colourValue);
        nv.drawPenLine(topLeftD, topRightD, colourValue);
        nv.drawPenLine(topRightD, bottomRightD, colourValue);
        nv.drawPenLine(topLeftD, bottomLeftD, colourValue);
        nv.drawPenLine(bottomLeftD, bottomRightD, colourValue);

        nv.refreshDrawing(true);

        // Fill all the faces
        fillRectangle(nv, rectangleBL, rectangleBR, bottomLeftD, bottomRightD);
        fillRectangle(nv, rectangleTL, rectangleTR, topLeftD, topRightD);
        fillRectangle(nv, rectangleBL, rectangleTL, bottomLeftD, topLeftD);
        fillRectangle(nv, rectangleBR, rectangleTR, bottomRightD, topRightD);
        fillRectangle(nv, bottomLeftD, bottomRightD, topLeftD, topRightD);

        nv.refreshDrawing(true);

        return true;
    }
    else{
        return false;
    }
}

/**
 * Returns whether or not a point B is located in a certain neighbourhood around a given point A
 * @param {Array<int>} ptA - Point A in a 3D room
 * @param {Array<int>} ptB - Point B in a 3D room
 * @returns {bool} 
 */
function comparePoints(ptA, ptB){

    let isNear;

    for(let i = 0; i <= 2; i++){
        if((ptA[i] - 8 <= ptB[i]) && (ptB[i] <= ptA[i] + 8)){
            isNear = true;
            if(isNear){
                break;
            }
        }
    }

    return isNear;
}

/**
 * Returns if a Point is near a given edge of a rectangle
 * @param {Array<int>} pt - The point which is checked if it's near the given edge
 * @param {Array<int>} edgePtA - Starting point of an edge
 * @param {Array<int>} edgePtB - Ending point of an edge
 * @returns {bool} - True -> point is near this edge. False -> point is not near this edge
 */
function comparePointToEdge(pt, edgePtA, edgePtB){
    let isNear;
    const xVal = edgePtA[0] - edgePtB[0];
    const yVal = edgePtA[1] - edgePtB[1];
    const zVal = edgePtA[2] - edgePtB[2];
   
    if(xVal != 0){
        const xMin = Math.min(edgePtA[0], edgePtB[0]);
        const xMax = Math.max(edgePtA[0], edgePtB[0]);

        for(let i = xMin; i <= xMax; i++){
            isNear = comparePoints([i, edgePtA[1], edgePtA[2]], pt);
            if(isNear){
                break;
            };
        }
    }
    else if(yVal != 0){
        const yMin = Math.min(edgePtA[1], edgePtB[1]);
        const yMax = Math.max(edgePtA[1], edgePtB[1]);

        for(let i = yMin; i <= yMax; i++){
            isNear = comparePoints([edgePtA[0], i, edgePtA[2]], pt);
            if(isNear){
                break;
            };
        }
    }
    else if(zVal != 0){
        const zMin = Math.min(edgePtA[2], edgePtB[2]);
        const zMax = Math.max(edgePtA[2], edgePtB[2]);

        for(let i = zMin; i <= zMax; i++){
            isNear = comparePoints([edgePtA[0], edgePtA[1], i], pt);
            if(isNear){
                break;
            };
        }
    }
    return isNear;
}

/**
 * Returns whether or not a point is loacated near to at least one of the edges of the last drawn rectangle
 * @param {*} pt - The point which ich checked if it is located near the rectangle
 * @returns {bool} - True -> point is located near an edge of the rectangle
 */
function comparePtToRect(pt){
    const nearTopEdge = comparePointToEdge(pt, rectangleTL, rectangleTR);
    const nearLeftEdge = comparePointToEdge(pt, rectangleBL, rectangleTL);
    const nearBottomEdge = comparePointToEdge(pt, rectangleBL, rectangleBR);
    const nearRightEdge = comparePointToEdge(pt, rectangleBR, rectangleTR);

    if(nearTopEdge || nearLeftEdge || nearBottomEdge || nearRightEdge){
        return true;
    }
    return false;
}


/**
 * Fill a rectangle in 3D volume
 * @param {Niivue} nv - Niivue instance
 * @param {Array<int>} PtBL - Bottom-Left point of a rectangle [x, y, z]
 * @param {Array<int>} PtBR - Bottom-Right point of a rectangle [x, y, z]
 * @param {Array<int>} PtTL  - Top-Left point of a rectangle [x, y, z]
 * @param {Array<int>} PtTR  - Top-Right point of a rectangle [x, y, z]
 */
function fillRectangle(nv, PtBL, PtBR, PtTL, PtTR){
    const colourValue = 3;
    nv.setPenValue(colourValue);

    const xMin = Math.min(PtBL[0], PtBR[0], PtTR[0], PtTL[0]);
    const xMax = Math.max(PtBL[0], PtBR[0], PtTR[0], PtTL[0]);
    const yMin = Math.min(PtBL[1], PtBR[1], PtTR[1], PtTL[1]);
    const yMax = Math.max(PtBL[1], PtBR[1], PtTR[1], PtTL[1]);
    const zMin = Math.min(PtBL[2], PtBR[2], PtTR[2], PtTL[2]);
    const zMax = Math.max(PtBL[2], PtBR[2], PtTR[2], PtTL[2]);

    if(PtBL[0] == PtTR[0]){
        for(let i = yMin; i <= yMax; i++){
            for(let j = zMin; j <= zMax; j++){
                nv.drawPt(PtBL[0], i, j, colourValue);
            }
        }
    }
    else if(PtBL[1] == PtTR[1]){
        for(let i = xMin; i <= xMax; i++){
            for(let j = zMin; j <= zMax; j++){
                nv.drawPt(i, PtBL[1], j, colourValue);
            }
        }
    }
    else{
        for(let i = xMin + 1; i <= xMax; i++){
            for(let j = yMin; j <= yMax; j++){
                nv.drawPt(i, j, PtBL[2], colourValue);
            }
        }
    }
    nv.refreshDrawing(true);
}


/**
 * API call to get the volumes for the current diagnosis
 * @param {string} format - the format of the MRI image 
 * @param {string} diagnosisID - the ID of the current diagnosis
 * @returns list of niivue volumes 
 */
export async function loadImageAPI(format, diagnosisID) {
    let volumes = [];
    //get the apiURL to fetch the path to the requested image
    const apiURL = `/image/api/getImage/${diagnosisID}/?format =${format}`;
    console.log(`API URL: ${apiURL}`);

    //fetch the data from the given apiURL
    await fetch(apiURL)
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

                volumes.push({
                    url: imageURL,
                    schema: "nifti"
                })
            })
            //catch the possible error
            .catch(err => {
                console.error("Error loading NIfTI file:", err);
            });
    return volumes;
}

/**
 * API call to save the time for a given action in the database
 * @param {string} action - The current action
 * @param {time} timestamp  - The time needed for the current action
 * @param {string} diagnosisID - The ID of the current diagnosis
 * @param {*} csrfToken - Csrf token for the api call
 */
export async function sendTimeStamp(action, timestamp, diagnosisID, csrfToken){
    const actionTime = {
            action: action,
            absoluteTime: timestamp,
            diagnosisID: diagnosisID,
    }

    // Fetch the API URL
    await fetch('/image/api/setUseTime/', {
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



/**
 * Saves the value of how confident the doctor is with his diagnosis in the database
 * @param {int} confidenceValue - The confidence value of the doctor for the current diagnosis
 * @param {string} diagnosisID - The ID of the current diagnosis
 * @param {string} csrfToken - csrf Token for the API call
 */
export async function sendConfidence(confidenceValue, diagnosisID, csrfToken){
    await fetch(`/image/api/saveConfidence/${diagnosisID}/`, {
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
            console.log('Confidence updated successfully!');
            return response.json();
        } else {
            throw new Error('Failed to save confidence value');
        }
    })
    .catch(error => console.error(error));  
}

/**
 * get the Sub number of the image of the current diagnosis
 * @param {string} diagnosisID 
 * @returns {string} sub number
 */
async function fetchImageSub(diagnosisID) {
    let diagURL;
    await fetch(`/api/getURL/${diagnosisID}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json()
        })
        .then(data =>{ 
            diagURL = data.url 
        })
        .catch(err => {
            console.error("Error loadng Nifti Files", err);
        })

    return diagURL;      
}

/**
 * get the ID of the current doctor
 * @returns Doctor ID
 */
async function fetchDoctorID(){
    let docID;
    await fetch(`/api/getDoctorID/`)
        .then(response => {
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            docID = data.docID;
        })
        .catch(err => {
            console.error("Error loading Nifti Files", err);
        })
    return docID;
}


export async function setContinueDiag(diagnosisID, csrfToken) {
    const docID = await fetchDoctorID();
    console.log(docID);
    await fetch('/image/api/setContinue/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            docID: docID,
            diagnosisID: diagnosisID
        })
    })
    .then(response => {
        if (response.ok) {
            console.log('Continue diagnosis updated successfully!');
            return response.json();
        } else {
            throw new Error('Failed to update continue value');
        }
    })
    .catch(error => console.error(error));  
}


/**
 * Save the current diagnosis in the database
 * @param {Niivue} nv - Niivue instance
 * @param {string} diagnosisID - The ID of the current diagnosis
 * @param {Int} lesionNumber - The Number of the current lesion.
 * @param {string} csrfToken - csrfToken for the API
 * 
 */
export async function savedEditedImage(nv, diagnosisID, lesionNumber, csrfToken) {
    try {
        // Wait for subID from fetchImageURL
        const subID = await fetchImageSub(diagnosisID);
        const docID = await fetchDoctorID();

        if (!subID) {
            console.error("Image subID could not be retrieved.");
            return;
        }

        const filename = `sub-${subID}_acq-${docID}_lesion-${lesionNumber}_mask.nii.gz`; // Dynamic filename

        // Create the blob object for the image
        const imageBlob = nv.saveImage({
            isSaveDrawing: true,
            filename: filename,
            volumeByIndex: 0,
        });
        
        // Create a FormData object
        const formData = new FormData();
        formData.append("filename", filename);
        formData.append("diagnosisID", diagnosisID)
        formData.append("imageFile", new Blob([imageBlob], { type: "application/octet-stream" }));

        // Send the data to the API
        const response = await fetch("/image/api/saveImage/", {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken, // CSRF-Security
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

/**
 * Returns two volumes one with the main MRI image and the other one with the doctor's diagnosis for the current case
 * @param {string} diagnosisID The ID of the current diagnosis
 * @param {string} formatMri The requested Format for the MRI Picture (T1 or Flair)
 * @returns Array with the volumes
 */
export async function loadImageWithDiagnosis(diagnosisID, formatMri) {
        const getDApiURL = `/image/api/getDiagnosis/${diagnosisID}`;


        // API call to fetch the imageURL in the requested format (T1 or Flair)
        let volumes = await loadImageAPI(formatMri, diagnosisID)

        // API call to fetch the diagnosis
        await fetch(getDApiURL)
            .then(response => {
                if(!response.ok){
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const urls = data.files;
                for (let url in urls){
                    const diagUrl = `http://127.0.0.1:8000/${urls[url]}`;
                    console.log(diagUrl);
                    volumes.push({url: diagUrl,
                                  schema: "nifti",
                                  colorMap: "blue",
                                  opacity: 0.65,

                    });

                }
            })
            .catch(err => {
                console.error("Error loading Nifti Files", err);
            });

        return volumes;
    }

/**
 * Returns two volumes the first is the normal MRI image and the second is the AI Diagnosis
 * @param {string} formatMask The requested AI Mask (DEEPFCD, map18, meld, nnunet)
 * @param {string} formatMri The requested MRI format (T1, Flair)
 * @param {string} diagnosisID The ID of the current diagnosis
 * @returns Array with 2 volumes
 */
export async function loadImageWithMask(formatMask, formatMri, diagnosisID) {
    const getIMbaseApiURL = `/image/api/getImageAndMask/${diagnosisID}`;
    // Parameters which get send to the backend -> the requested formats
    const params = new URLSearchParams({
        mask: formatMask,
        mri: formatMri,
    });

    let volumes = [];

    const apiURL = `${getIMbaseApiURL}/?${params.toString()}`; // Combined API URL

    // Fetch combined MRI and Mask URLs
    await fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const URLs = data.data;
                const mriURL = `http://127.0.0.1:8000${URLs.mriPath}`;
                const maskURL = `http://127.0.0.1:8000${URLs.maskPath}`;

                volumes.push({
                    url: mriURL,
                    schema: "nifti",
                });
                
                volumes.push({
                    url: maskURL,
                    schema: "nifti",
                    colorMap: "red", // Distinct color for the mask
                    opacity: 0.9,    // Adjust transparency of the mask
                });
            })
            .catch(err => {
                console.error("Error loading NIfTI files:", err);
            });
    
    return volumes;
}

/**
 * Returns 3 volumes. The first is the normal Mri Image. The second is the AI Mask and the third is the diagnosis
 * @param {string} formatMask The requested AI Mask (DEEPFCD, map18, meld, nnunet)
 * @param {string} formatMri The requestet Mri format (T1, Flair)
 * @param {string} diagnosisID The ID of the current diagnosis
 * @returns  Array with 3 Volumes
 */
export async function loadOverlayDAI(formatMask, formatMri, diagnosisID) {
    const getDApiURL = `/image/api/getDiagnosis/${diagnosisID}`;
    let volumes = [];
    
    volumes = await loadImageWithMask(formatMask, formatMri, diagnosisID);

    await fetch(getDApiURL)
    .then(response => {
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const urls = data.files;
        for(let url in urls){
            const diagUrl = `http://127.0.0.1:8000/${urls[url]}`;
            console.log(diagUrl);
            volumes.push({url: diagUrl,
                          schema: "nifti",
                          colorMap: "blue",
                          opacity: 0.65,

            });
        }
    })
    .catch(err => {
        console.error("Error loading Nifti Files", err);
    });

return volumes;        
}


/**
 * Deletes the current diagnosis from the database
 * @param {string} diagnosisID - The ID of the current diagnosis
 * @param {string} csrfToken - csrfToken for the API
 * @returns 
 */
export async function deleteContinueDiagnosis(diagnosisID, csrfToken) {
    try {
        const response = await fetch(`/image/api/deleteDiagnosis/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error:', error.message || 'Unknown error');
            throw new Error(error.message || 'Failed to delete the diagnosis');
        }

        console.log('Diagnosis deleted successfully!');
        return response.json();
    } catch (error) {
        console.error('Error during deletion:', error.message || error);
    }
}