from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

from image.timeServices import *
from image.views import *
from image.mediaServices import *
from image.diagnosisServices import *
from image.models import Media

from accounts.doctorServices import *


@login_required
def homepage(request):
    return render(request, "home.html")

@login_required
def forwardingInformation(request, datasetName):
    """
    Handles the forwarding of an unfinished dataset to the user for diagnosis.
    
    This function:
    - Retrieves a random url from the dataset.
    - Redirects the user based on the dataset's status (finished, error, or unfinished).
    - If the dataset is unfinished, the function proceeds to create a diagnosis.
    
    Args:
    - request: The HTTP request object, used to fetch the logged-in user's data.
    - datasetName (str): The dataset the user choose.
    
    Returns:
    - Redirect: Based on the dataset status (finished, error, or diagnosis creation).
    """
    
    datasetName = datasetName.upper()

    responseRandomURL = getRandomURL(request.user.id, datasetName)
    
    if responseRandomURL["status"] == "finished":
        return render(request, 'finishedMessage.html')
    
    elif responseRandomURL["status"] == "error":
        return redirect("/")
    
    else:
        
        pictureURL = responseRandomURL["url"]
        
        docObject = getDoctorObject(request.user.id)
        
        uuid = createUUIDs(1)[0]
        
        # This will always be an object because if it is not, the status must be "error".
        mediaFolderObject = Media.objects.get(name=datasetName)
        
        diag = createDiagnosis(uuid, docObject, pictureURL, mediaFolderObject)

        createUseTime(diag)
        
        addFinishedPatient(request.user.id, datasetName, pictureURL, uuid)

        return redirect("newDiagnosis", diagnosisID=uuid)


@login_required 
def continueDiagnosis(request):
    """
    Continues the diagnosis process.
    
    Retrieves the diagnosis object for the logged-in user and redirects to the diagnosis page.
    """
    diagnosisData: dict = getContinueDiag(request.user.id)

    
    # Check if a valid diagnosis was returned
    if diagnosisData.get("status") and diagnosisData.get("object"):
        continueDiagnosis = diagnosisData["object"]
        diagID = continueDiagnosis["Diagnosis"]
        website = continueDiagnosis["Website"]
        return redirect(website, diagnosisID=diagID)
    
@login_required
def checkUnfinishedDiagnosis(request):
    diagnosisData: dict = getContinueDiag(request.user.id)

    if diagnosisData.get("status") and diagnosisData.get("object"):
        return JsonResponse({'unfinished': True})
    else:
        return JsonResponse({'unfinished': False})
    
@login_required
def noRunningDiagnosis(request):
    return render(request, 'noRunningDiagnosis.html')

@login_required
def blockNewDiagnosis(request):
    return render(request, 'blockNewDiagnosis.html')

@login_required
def homeWindow(request):
    return render(request, 'homeWindow.html')


@login_required
def data(request):
    docID = request.user.id
    mediaNames: list = getAvailableDatasets(docID)
    finished: list = finishedDatasets(docID)
    
    finishedTitle = []
    # if datasets were finished, add them
    if finished:
        finishedTitle = [item.title() for item in finished]
    
    notFinished = [media.title() for media in mediaNames if media not in finished]
    
    allDatasets = []
    
    for dataset in notFinished:
        # Get progress statistics for the current dataset        
        stats = datasetProgress(docID, dataset)
        
        # Create a dictionary to store dataset info
        dataset_info = {"name": dataset}
        
        # If there are no stats for the dataset, set the stats to an empty string
        if not stats:
            dataset_info["stats"] = ""
        # If stats exist, format them as (completed/total) and add it to the dictionary
        else:
            dataset_info["stats"] = f"({stats[0]}/{stats[1]})"
        
        allDatasets.append(dataset_info)
        
    return render(request, 'selectDataset.html', {'allDataSets': allDatasets, 'finishedDatasets': finishedTitle})


@login_required
def finished(request, datasetName: str):
    datasetName = datasetName.title()
    return render(request, "finishedMessage.html", {'datasetName': datasetName})
