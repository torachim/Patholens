document.addEventListener("DOMContentLoaded", () => {   
    document.getElementById('homeButton').addEventListener("click", function () {
        window.location.href = "/"; // go back to homepage
    });
    
    const continueButton = document.getElementById('continueButton');
    if (continueButton) {
        continueButton.addEventListener("click", function () {
            window.location.href = `/selectDataset/forwarding/${datasetName}`; //Add the datasetname to the url
        });
    }
});
