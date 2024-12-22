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
    const baseApiURL = `/image/api/getAImask/${diagnosisID}`;
    let selectedFormat = "DEEPFCD";

    // Load default image and mask
    loadImageWithMask(selectedFormat);

    // Dropdown change listener
    const aiDropdown = document.getElementById('AIdropdown');
    aiDropdown.addEventListener('change', (event) => {
        selectedFormat = event.target.value;
        loadImageWithMask(selectedFormat);
    });

    function loadImageWithMask(format) {
        const mriApiURL = `/image/api/getMRI/${diagnosisID}`; // API for the MRI image
        const maskApiURL = `${baseApiURL}/?format=${format}`; // API for the AI mask

        // Fetch both MRI and Mask URLs
        Promise.all([
            fetch(mriApiURL).then(response => {
                if (!response.ok) {
                    throw new Error(`MRI HTTP error! status: ${response.status}`);
                }
                return response.json();
            }),
            fetch(maskApiURL).then(response => {
                if (!response.ok) {
                    throw new Error(`Mask HTTP error! status: ${response.status}`);
                }
                return response.json();
            }),
        ])
            .then(([mriData, maskData]) => {
                const mriURL = `http://127.0.0.1:8000${mriData.path}`;
                const maskURL = `http://127.0.0.1:8000${maskData.path}`;
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
                        opacity: 0.5,    // Adjust transparency of the mask
                    },
                ]);
            })
            .catch(err => {
                console.error("Error loading NIfTI files:", err);
            });
    }
});
