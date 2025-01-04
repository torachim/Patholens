from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import os
from django.conf import settings
from image.mediaHandler import *
from accounts.doctorManager import *
from accounts.diagnosisManager import *

@login_required
def newDiagnosis(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})

def saveImage(request):
    if request.method == "POST":
        try:
            # Extract file and file name from the request
            image_file = request.FILES.get("imageFile")
            filename = request.POST.get("filename")
            subID = request.POST.get("subID") # get the subID from the request

            if not image_file or not filename or not subID:
                return JsonResponse({"error": "Invalid data"}, status=400)

            # Define the directory structure: media/website_data/derivatives/diagnosis/sub-{subID}
            sub_folder = os.path.join(
                settings.MEDIA_ROOT,
                "website_data",
                "derivatives",
                "diagnosis",
                f"sub-{subID}"
            )

            # Ensure the directory exists
            os.makedirs(sub_folder, exist_ok=True)

            # Full file path
            filepath = os.path.join(sub_folder, filename)

            # Save the file
            with open(filepath, "wb") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)

            return JsonResponse({"message": "Image saved successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)

@login_required
def transitionPage(request, diagnosisID):
    
    diagObject = getDiagnosisObject(diagnosisID)
    diagMediaFolder = diagObject.mediaFolder

    dataset = finishedDatasets(str(request.user.id))
    
    if diagMediaFolder in dataset:
        return render (request, "image/transitionPage.html", {"datasetFinished": True})



    # TODO: man muss wissen, was für eine diagnose es war damit man dann eine weitere diagnose dem patienten geben kann
    # wenn er auf "yes, continue" drückt
    # wenn aber der datensatz fertig bearbeitet wurde, muss bei "yes, continue" so etwas stehen wie
    # "You finsihed all ..." und dann nach kann man etweder nur zur hompage ODER man kann direkt zu datasets wechseln ? 
    
    return render (request, "image/transitionPage.html", {"datasetFinished": False})
