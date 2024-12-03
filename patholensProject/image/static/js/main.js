import { Niivue } from "./index.js";

console.log(document.getElementById("imageBrain"));

const nv = new Niivue();

nv.attachTo("imageBrain")

//const apiURL = `image/api/getImage/${imageID}`;
const apiURL = `http://127.0.0.1:8000/image/api/getImage/${imageID}`;

console.log(`API URL: ${apiURL}`);

fetch(apiURL)
    .then(response => {
        console.log("Response status:", response.status);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {

        const fileURL = URL.createObjectURL(blob);

        nv.loadVolumes([
            {
                url: fileURL,
                name: `Image ${imageID}`
            },
        ]);
    })
    .catch(err => {
        console.error("Error loading NIfTI file:", err);
    });

