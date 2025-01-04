import { Niivue } from "./index.js";

/**
 * Create a niivue object and attach it to a given canvas
 * @param {dictionary} niivueOptions - A Dictionary with the Niivue options -> see Niivue documantation
 * @param {*} canvas - A HTML canvas object to which the niivue object got attached to. 
 * @returns Niivue object
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