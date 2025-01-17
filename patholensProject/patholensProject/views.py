from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from accounts.diagnosisManager import *
from image.timeHandler import *

from image.views import *
from image.mediaHandler import *
from accounts.doctorManager import *
from image.models import Media

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

    mode = "new"
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

        return redirect("newDiagnosis", diagnosisID=uuid, mode=mode)


@login_required 
def continueDiagnosis(request):
    """
    Continues the diagnosis process.
    
    Retrieves the diagnosis object for the logged-in user and redirects to the diagnosis page.
    """
    diagnosisData = getContinueDiag(request.user.id)

    mode = "continue"
    
    # Check if a valid diagnosis was returned
    if diagnosisData.get("status") and diagnosisData.get("object"):
        diagID = diagnosisData["object"].diagID
        return redirect("newDiagnosis", diagnosisID=diagID, mode=mode)
    
@login_required
def checkUnfinishedDiagnosis(request):
    diagnosisData = getContinueDiag(request.user.id)

    mode = "continue"
    if diagnosisData.get("status") and diagnosisData.get("object"):
        return JsonResponse({'unfinished': True})
    else:
        return JsonResponse({'unfinished': False})
    
@login_required
def noUnfinishedDiagnosis(request):
    return render(request, 'noUnfinishedDiagnosis.html')


@login_required
def homeWindow(request):
    return render(request, 'homeWindow.html')


@login_required
def data(request):
    mediaNames = getAllDatasetNames()
    finished = finishedDatasets(request.user.id)
    
    notFinished = [media.title() for media in mediaNames if media not in finished]
    finishedTitle = [item.title() for item in finished]
        
    return render(request, 'selectDataset.html', {'allDataSets': notFinished, 'finishedDatasets': finishedTitle})


@login_required
def finished(request, datasetName: str):
    datasetName = datasetName.title()
    return render(request, "finishedMessage.html", {'datasetName': datasetName})
        
