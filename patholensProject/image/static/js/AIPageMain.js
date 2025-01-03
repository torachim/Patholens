import { Niivue } from "./index.js";
import { niivueCanvas } from "./niivueCanvas.js";

document.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById("imageBrain");
    const nv = niivueCanvas({}, canvas);

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

    // Dropdown change listener for format of the pictures
    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('change', (event) => {
        selectedFormatMri = event.target.value;
        loadImages();
    });

    // Dropdown change listener for the Overlay structure
    const displayDropdown = document.getElementById('displayDropdown')
    displayDropdown.addEventListener('change', (event) => {
        selectedDisplay= event.target.value
        loadImages();
    });

    // function to load the images in the correct overlay
    async function loadImages(){
        if(selectedDisplay == "AIDiagnosis"){
            const volumes = await loadImageWithMask(selectedFormatMask, selectedFormatMri);
            nv.loadVolumes(volumes);
        }
        else if(selectedDisplay == "myDiagnosis"){
            const volumes = await loadImageWithDiagnosis(selectedFormatMri);
            nv.loadVolumes(volumes);
        }
        else if(selectedDisplay == "showOverlay"){
            const volumes = await loadOverlayDAI(selectedFormatMask, selectedFormatMri);
            nv.loadVolumes(volumes);
        }
    };

    /**
     * Returns two volumes one with the main MRI image and the other one with the doctor's diagnosis for the current case
     * @param formatMri The requested Format for the MRI Picture (T1 or Flair)
     * @returns Array with the volumes
     */
    async function loadImageWithDiagnosis(formatMri) {
        const imageApiURL = `${getIbaseApiURL}/?format =${formatMri}`;
        let volumes = [];

        // API call to fetch the imageURL in the requested format (T1 or Flair)
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
     * @param  formatMask The requested AI Mask (DEEPFCD, map18, meld, nnunet)
     * @param  formatMri The requested MRI format (T1, Flair)
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
