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

/**
 * Draws a rectangle when released
 * @param {Niivue} nv - Niivue instance
 * @param {*} data - The data from the drag and release
 */
export function drawRectangleNiivue(nv, data){

    const colourValue = 3 // blue
    nv.setPenValue(colourValue) 

    const { voxStart, voxEnd, axCorSag } = data
    // these rect corners will be set based on the plane the drawing was created in 
    let topLeft, topRight, bottomLeft, bottomRight


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
            break;
        }
    }

    // draw the rect lines
    nv.drawPenLine(topLeft, topRight, colourValue)
    nv.drawPenLine(topRight, bottomRight, colourValue)
    nv.drawPenLine(bottomRight, bottomLeft, colourValue)
    nv.drawPenLine(bottomLeft, topLeft, colourValue)
    // refresh the drawing
    nv.refreshDrawing(true) // true will force a redraw of the entire scene (equivalent to calling drawScene() in niivue)
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
 * @param {time} absoluteTime  - The time needed for the current action
 * @param {string} diagnosisID - The ID of the current diagnosis
 * @param {*} csrfToken - Csrf token for the api call
 */
export async function endTimer(action, startTime, diagnosisID, csrfToken){
    let endTime = performance.now();
    let absoluteTime = endTime - startTime;
    const actionTime = {
            action: action,
            absoluteTime: absoluteTime,
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
    try {
        const response = await fetch(`/api/getURL/${diagnosisID}/`, {
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

/**
 * get the ID of the current doctor
 * @returns Doctor ID
 */
async function fetchDoctorID(){
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

/**
 * Save the current diagnosis in the database
 * @param {Niivue} nv - Niivue instance
 * @param {string} diagnosisID - The ID of the current diagnosis
 * @param {string} csrfToken - csrfToken for the API
 * 
 */
export async function savedEditedImage(nv, diagnosisID, csrfToken) {
    try {
        // Wait for subID from fetchImageURL
        const subID = await fetchImageSub(diagnosisID);
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
                const URL = data.path;
                const diagURL = `http://127.0.0.1:8000/${URL}`
                console.log(diagURL);
                volumes.push({url: diagURL,
                              schema: "nifti",
                              colorMap: "blue",
                              opacity: 1.0
                });
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
        const URL = data.path;
        const diagURL = `http://127.0.0.1:8000/${URL}`
        volumes.push({url: diagURL,
                        schema: "nifti",
                        colorMap: "blue",
                        opacity: 1.0,
        });
    })
    .catch(err => {
        console.error("Error loading Nifti Files", err);
    });

return volumes;        
}