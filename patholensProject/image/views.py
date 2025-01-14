from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
from django.contrib.auth.decorators import login_required

from accounts.doctorManager import *
from image.mediaHandler import *
from image.diagnosisManager import *

import os


@login_required
def newDiagnosis(request, diagnosisID, mode):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID, "mode": mode})

@login_required
def editDiagnosis(request, diagnosisID):
    return render(request, 'image/editDiagnosis.html', {"diagnosisID": diagnosisID})

@login_required
def AIPage(request, diagnosisID):
    return render(request, "image/AIPage.html", {"diagnosisID": diagnosisID})

@login_required
def saveImage(request):
    if request.method == "POST":
        try:
            # Extract file and file name from the request
            image_file = request.FILES.get("imageFile")
            filename = request.POST.get("filename")
            diagnosisID = request.POST.get("diagnosisID")  # get the subID from the request

            if not image_file or not filename or not diagnosisID:
                return JsonResponse({"error": "Invalid data"}, status=400)

            docID = request.user.id
            subID = getURL(diagnosisID)

            # Define the directory structure: media/website_data/derivatives/diagnosis/sub-{subID}
            sub_folder = os.path.join(
                settings.MEDIA_ROOT,
                "website_data",
                "derivatives",
                "diagnosis",
                f"sub-{subID}"
                f"/doc-{docID}"
            )

            # Ensure the directory exists
            os.makedirs(sub_folder, exist_ok=True)

            # Full file path
            filepath = os.path.join(sub_folder, filename)

            # Save the file
            with open(filepath, "wb") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)


            setContinueDiag(docID, diagnosisID)

            return JsonResponse({"message": "Image saved successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@login_required
def transitionPage(request, diagnosisID, mode=None):
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
