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
    let selectedDisplay = "AI diagnosis"

    const aiModelMapping = {
        "Model A": "DEEPFCD",
        "Model B": "MAP18",
        "Model C": "MELD",
        "Model D": "NNUNET"
    };

    // Load default image and mask
    loadImages();

    // Dropdown change listener for the AI Mask
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            const selectedOption = event.target.textContent;
            selectedFormatMask = aiModelMapping[selectedOption];
            
            loadImages();
        }
    });

    // Dropdown change listener for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            const selectedOption = event.target.textContent;
            selectedFormatMri = selectedOption;
            loadImages();
        }
    });

    // Dropdown change listener for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown');
    displayDropdown.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            const selectedOption = event.target.textContent;
            selectedDisplay = selectedOption;
            loadImages();
        }
    });

    // function to load the images in the correct overlay
    async function loadImages(){
        if(selectedDisplay == "AI diagnosis"){
            const volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri);
            nv.loadVolumes(volumes);
        }
        else if(selectedDisplay == "my diagnosis"){
            const volumes = await loadImageWithDiagnosis(selectedFormatMri);
            nv.loadVolumes(volumes);
        }
        else if(selectedDisplay == "show Overlay"){
            const volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri);
            nv.loadVolumes(volumes);
        }
    
    };

    /**
     * Returns two volumes one with the main Mri image and the other one with the doctors diagnosis for the current case
     * @param formatMri The requested Format for the Mri Picture (T1 or Flair)
     * @returns Array with the volumes
     */
    async function loadImageWithDiagnosis(formatMri) {
        const imageApiURL = `${getIbaseApiURL}/?format =${formatMri}`;
        let volumes = [];

        // Api call to fetch the imageURL in the requested format (T1 or Flair)
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

        // Api call to fetch the diagnosis
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
     * Returns two volumes the first is the normal Mri image and the second is the AI Diagnosis
     * @param  formatMask The requested AI Mask (DEEPFCD, map18, meld, nnunet)
     * @param  formatMri The requestet Mri format (T1, Flair)
     * @returns Array with 2 volumes
     */
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
                })
                .catch(err => {
                    console.error("Error loading NIfTI files:", err);
                });
        
        return volumes;
    }

    /**
     * Returns 3 volumes. The first is the normal Mri Image. The second is the AI Mask and the third is the diagnosis
     * @param  formatMask The requested AI Mask (DEEPFCD, map18, meld, nnunet)
     * @param  formatMri The requestet Mri format (T1, Flair)
     * @returns Array with 3 Volumes
     */
    async function loadOverlayDAI(formatMask, formatMri) {
        
        let volumes = [];
        
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
                          opacity: 1.0,
            });
        })
        .catch(err => {
            console.error("Error loading Nifti Files", err);
        });
    
    return volumes;        
    }
});
