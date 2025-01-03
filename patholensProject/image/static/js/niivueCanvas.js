import { Niivue } from "./index.js";

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