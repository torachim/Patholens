//import {Niivue} from "./index.js";

document.addEventListener('DOMContentLoaded', function() {
    /*
    // Loading the images

    const compareNv = new Niivue();
    const compareCanvas = document.getElementById("comparisonContainer");

    // Load FLAIR default
    let selectedFormat = "FLAIR";

    */


    // Zoom

    const comparisonContainer = document.getElementById("comparisonContainer");
    const zoomButton = document.getElementById("zoomButton");
    let zoomed = false;
    const dropdownMenus = document.querySelectorAll(".dropdown");

    function zoomOut(){
        comparisonContainer.style.width = "50%";
        comparisonContainer.style.top = "";
        comparisonContainer.style.height = "24%";
        zoomButton.src = "/static/icons/editPageZoomButton.png";
        zoomed = false;
    }

    zoomButton.addEventListener("click", () =>{
        if(zoomed){
            zoomOut();
        }

        else{
            comparisonContainer.style.width = "74%";
            comparisonContainer.style.top = "35%";
            comparisonContainer.style.height = "53%";
            zoomButton.src = "/static/icons/editPageZoomOutButton.png";
            zoomed = true;
        }
    });

    document.body.addEventListener("click", (e) =>{
        if(zoomed){
            console.log(e.target);
            if(e.target != comparisonContainer && e.target != zoomButton ){
                let clickedDropdown = false;
                dropdownMenus.forEach(dropdown => {
                    if (dropdown.contains(e.target)){
                        clickedDropdown = true;
                    }
                });
                if (!clickedDropdown){
                    zoomOut();
                }     
            }
        }
    });

    function swapOptions(optionElement) {
        const parentDropdown = optionElement.closest('.dropdown');
        const textBox = parentDropdown.querySelector('.textBox');
        const clickedValue = optionElement.textContent;
        // Update the text box value
        textBox.value = clickedValue;
    }

    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', () => {
            dropdown.classList.toggle('active');
        });
    });

    document.querySelectorAll('.dropdown .option').forEach(option => {
        option.addEventListener('click', (event) => {
            swapOptions(event.target);
        });
    })

});

