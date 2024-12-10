import { Niivue, DRAG_MODE } from "./index.js";

document.addEventListener('DOMContentLoaded', function() {

    const onDragRelease = (data) => {
        const value = 1; // Color for rectangle (1 = Red)
        nv.setPenValue(value);

        const { voxStart, voxEnd, axCorSag } = data;
        let topLeft, topRight, bottomLeft, bottomRight;

        if (axCorSag === 0) {
            const minX = Math.min(voxStart[0], voxEnd[0]);
            const maxX = Math.max(voxStart[0], voxEnd[0]);
            const minY = Math.min(voxStart[1], voxEnd[1]);
            const maxY = Math.max(voxStart[1], voxEnd[1]);
            const fixedZ = voxStart[2];
            topLeft = [minX, minY, fixedZ];
            topRight = [maxX, minY, fixedZ];
            bottomLeft = [minX, maxY, fixedZ];
            bottomRight = [maxX, maxY, fixedZ];
        } else if (axCorSag === 1) {
            const minX = Math.min(voxStart[0], voxEnd[0]);
            const maxX = Math.max(voxStart[0], voxEnd[0]);
            const minZ = Math.min(voxStart[2], voxEnd[2]);
            const maxZ = Math.max(voxStart[2], voxEnd[2]);
            const fixedY = voxStart[1];
            topLeft = [minX, fixedY, minZ];
            topRight = [maxX, fixedY, minZ];
            bottomLeft = [minX, fixedY, maxZ];
            bottomRight = [maxX, fixedY, maxZ];
        } else if (axCorSag === 2) {
            const minY = Math.min(voxStart[1], voxEnd[1]);
            const maxY = Math.max(voxStart[1], voxEnd[1]);
            const minZ = Math.min(voxStart[2], voxEnd[2]);
            const maxZ = Math.max(voxStart[2], voxEnd[2]);
            const fixedX = voxStart[0];
            topLeft = [fixedX, minY, minZ];
            topRight = [fixedX, maxY, minZ];
            bottomLeft = [fixedX, minY, maxZ];
            bottomRight = [fixedX, maxY, maxZ];
        }

        nv.drawPenLine(topLeft, topRight, value);
        nv.drawPenLine(topRight, bottomRight, value);
        nv.drawPenLine(bottomRight, bottomLeft, value);
        nv.drawPenLine(bottomLeft, topLeft, value);

        nv.refreshDrawing(true);
    };


    const nv = new Niivue({
        onDragRelease: onDragRelease,
        dragMode: DRAG_MODE.callbackOnly,
      });

    const canvas = document.getElementById("imageBrain");

    //function to resize the canvas field in dependency of the device
    function adjustCanvasForDPI(canvas) {
        const context = canvas.getContext('2d');
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


    const baseApiURL = `/image/api/getImage/${imageID}`;


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

  
    console.log(selectedFormat)
  
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
        nv.setDrawingEnabled(true);  
        changeDrawingMode(6, false);
    });
    

    // disables drawing after a Pixel is marked
    document.getElementById("imageBrain").addEventListener("mouseup", disableDrawing)

    // disables drawing
    function disableDrawing(){
        nv.setDrawingEnabled(false);
    }  

    
    // enables erasing the drawing by clicking on eraser
    document.getElementById("eraseTool").addEventListener("click", function(e){
        nv.setDrawingEnabled(true);
        // 0 = Eraser and true => eraser ist filled so a whole area can be erased
        changeDrawingMode(0, true);

    });

})