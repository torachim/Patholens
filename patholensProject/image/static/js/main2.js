import { Niivue } from "./index.js";

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Niivue instance
    const nv = new Niivue({});
    const canvas = document.getElementById("imageBrain");

    // Adjust canvas for DPI
    function adjustCanvasForDPI(canvas) {
        const dpi = window.devicePixelRatio || 1;

        // Get size from CSS
        const computedStyle = getComputedStyle(canvas);
        const width = parseInt(computedStyle.getPropertyValue('width'), 10);
        const height = parseInt(computedStyle.getPropertyValue('height'), 10);

        // Set new width and height
        canvas.width = width * dpi;
        canvas.height = height * dpi;
    }

    nv.attachToCanvas(canvas);
    adjustCanvasForDPI(canvas);
    nv.setMultiplanarPadPixels(60);

    // Base API URLs
    const getIMbaseApiURL = `/image/api/getImageAndMask/${diagnosisID}`;
    const getDApiURL = `/image/api/getDiagnosis/${diagnosisID}`;
    const getIbaseApiURL = `/image/api/getImage/${diagnosisID}`;

    //default formats
    let selectedFormatMask = "DEEPFCD";
    let selectedFormatMri = "FLAIR"
    let selectedDisplay = "AIDiagnosis"

    // Load default image and mask
    loadImages();

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('change', (event) => {
        selectedFormatMask = event.target.value;
        loadImages();
    });

    // Dropdown change listender for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('change', (event) => {
        selectedFormatMri = event.target.value;
        loadImages();
    });

    // Dropdown change listender for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown')
    displayDropdown.addEventListener('change', (event) => {
        selectedDisplay= event.target.value
        loadImages();
    });

    // function to load the images in the correct overlay
    async function loadImages(){
        if(selectedDisplay == "AIDiagnosis"){
            const volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri);
            console.log("b",volumes);
            nv.loadVolumes(volumes);
        }
        else if(selectedDisplay == "myDiagnosis"){
            const volumes = await loadImageWithDiagnosis(selectedFormatMri);
            console.log("b",volumes);
            nv.loadVolumes(volumes);
        }
        else if(selectedDisplay == "showOverlay"){
            const volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri);
            console.log(volumes)
            nv.loadVolumes(volumes);
        }
    
    };


    async function loadImageWithDiagnosis(formatMri) {
        const imageApiURL = `${getIbaseApiURL}/?format =${formatMri}`;
        let volumes = [];

        await fetch(imageApiURL)
            .then(response => {
                console.log(imageApiURL);
                if(!response.ok){
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json()
            })
            .then(data => {
                const imageURL = `http://127.0.0.1:8000${data.path}`
                console.log(imageURL)

                volumes.push({url: imageURL,
                            schema: "nifti",
                });
            })
            .catch(err => {
                console.error("Error loading Nifti Files", err);
            });

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
                console.log("a",volumes);
            })
            .catch(err => {
                console.error("Error loading Nifti Files", err);
            });
        
        //nv.loadVolumes(volumes)
        return volumes;
    }
    
    async function loadImageWithMask(formatMask, formatMri) {
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
                    console.log("MRI URL:", mriURL);
                    console.log("Mask URL:", maskURL);

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

                    console.log("a",volumes);

                    /*let volumes = [{
                        url: mriURL,
                        schema: "nifti",
                    },
                    {
                        url: maskURL,
                        schema: "nifti",
                        colorMap: "red", // Distinct color for the mask
                        opacity: 0.9,    // Adjust transparency of the mask
                    },]*/

                    // Load MRI and mask
                    //nv.loadVolumes(volumes);
                })
                .catch(err => {
                    console.error("Error loading NIfTI files:", err);
                });
        
        return volumes;
    }

    async function loadOverlayDAI(formatMask, formatMri) {
        
        let volumes = [];
        //let volumesDiag = [];
        
        volumes = await loadImageWithMask(formatMask, formatMri);

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
            console.log("a",volumes);
        })
        .catch(err => {
            console.error("Error loading Nifti Files", err);
        });
    
    console.log(volumes);
    return volumes;
        
    }

});
