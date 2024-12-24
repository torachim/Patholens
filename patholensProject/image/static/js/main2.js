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
    

    // Base API URL
    const baseApiURL = `/image/api/getImageAndMask/${diagnosisID}`;
    let selectedFormatMask = "DEEPFCD";
    let selectedFormatMri = "FLAIR"

    // Load default image and mask
    loadImageWithMask(selectedFormatMask, selectedFormatMri);

    // Dropdown change listener
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('change', (event) => {
        selectedFormatMask = event.target.value;
        loadImageWithMask(selectedFormatMask, selectedFormatMri);
    });

    const formatDropdown = document.getElementById('formatDropdown');
    formatDropdown.addEventListener('change', (event) => {
        selectedFormatMri = event.target.value;
        loadImageWithMask(selectedFormatMask, selectedFormatMri);
    });

    function loadImageWithMask(formatMask, formatMri) {

        // Parameters which get send to the backend -> the requested formats
        const params = new URLSearchParams({
            mask: formatMask,
            mri: formatMri,
        });

        const apiURL = `${baseApiURL}/?${params.toString()}`; // Combined API URL

        // Fetch combined MRI and Mask URLs
        fetch(apiURL)
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

                // Load MRI and mask
                nv.loadVolumes([
                    {
                        url: mriURL,
                        schema: "nifti",
                    },
                    {
                        url: maskURL,
                        schema: "nifti",
                        colorMap: "red", // Distinct color for the mask
                        opacity: 0.9,    // Adjust transparency of the mask
                    },
                ]);
            })
            .catch(err => {
                console.error("Error loading NIfTI files:", err);
            });
    }
});
