from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.contrib.auth.decorators import login_required

from accounts.doctorServices import *
from .mediaServices import *
from .diagnosisServices import *
from .lesionServices import setShownTrueAll

import os


@login_required
def newDiagnosis(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})

@login_required
def editDiagnosis(request, diagnosisID):
    return render(request, 'image/editDiagnosis.html', {"diagnosisID": diagnosisID})

@login_required
def AIPage(request, diagnosisID):
    setShownTrueAll(diagnosisID)
    return render(request, "image/AIPage.html", {"diagnosisID": diagnosisID})

@login_required
def transitionPage(request, diagnosisID):
    """
    Handles the transition page view for a specific diagnosis.

    This function determines whether the dataset associated with a diagnosis 
    has been marked as finished for the current user. Depending on the status, 
    it renders the appropriate HTML template with the necessary context

    Args:
        * request (HttpRequest): The HTTP request object containing metadata 
            about the request and the user making it.
        
        * diagnosisID (str): The unique identifier of the diagnosis.

    Returns:
        * HttpResponse: The HTTP response object rendering the 'transitionPage.html' 
            template with context data indicating the dataset status.
    """
    diagObject = getDiagnosisObject(diagnosisID)
    diagMediaFolder = str(diagObject.mediaFolder)
    diagMediaFolderTitle = str(diagMediaFolder).title()
    
    dataset = finishedDatasets(str(request.user.id)) 
    
    
    if diagMediaFolder in dataset:
        return render (request, "image/transitionPage.html", {"datasetFinished": True, "datasetName":diagMediaFolderTitle })
    
    
    return render (request, "image/transitionPage.html", {"datasetFinished": False, "datasetName":diagMediaFolderTitle })
