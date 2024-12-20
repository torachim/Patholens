from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from accounts.doctorManager import getRandomURL
from accounts.diagnosisManager import createDiagnosis
from accounts.doctorManager import *
from accounts.diagnosisManager import *

from image import views

@login_required
def homepage(request):
    return render(request, "home.html")

@login_required
def forwardingInformation(request):
    """
    Handles the forwarding of an unfinished dataset to the user for diagnosis.
    
    This function:
    - Retrieves a random url from the dataset.
    - Redirects the user based on the dataset's status (finished, error, or unfinished).
    - If the dataset is unfinished, the function proceeds to create a diagnosis.
    
    Args:
    - request: The HTTP request object, used to fetch the logged-in user's data.
    
    Returns:
    - Redirect: Based on the dataset status (finished, error, or diagnosis creation).
    """
    
    # TODO: change website_data to variable which should be given to the function
    datasetName = "website_data"
    
    message = getRandomURL(request.user.id, datasetName)
    
    # TODO: Add a own function that checks which dataset is finished -> should be checked after loggin in !!!
    # that dataset should not be clickable, maybe gray -> when clicked maybe show message that the dataset is finished
    if message["status"] == "finished":
        # TODO: CHANFE TO A OTHER URL (have to wait for snehs branch)
        print("All the patients are edited")
        return redirect("/")
    
    elif message["status"] == "error":
        # TODO: redirect to the correct URL (have to wait for snehs branch)
        print(message["message"])
        return redirect("/")
    
    else:
        
        pictureURL = message["url"]
        
        docObject = getDoctorObject(request.user.id)
        
        uuid = createUUIDs(1)[0]
        
        createDiagnosis(uuid, docObject, pictureURL)
        
        addFinishedPatient(request.user.id, datasetName, pictureURL, uuid)

        return redirect("newDiagnosis", diagnosisID=uuid)

@login_required
def homeWindow(request):
    return render(request, 'homeWindow.html')


def data(request):
    allDataSets = [
        "Dataset 1",
        "Dataset 2",
        "Dataset 3",
    ]
    
    return render(request, 'selectDataset.html', {'allDataSets': allDataSets})
