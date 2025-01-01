from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import os
import base64
from django.conf import settings
from accounts.doctorManager import *
from accounts.diagnosisManager import *

@login_required
def newDiagnosis(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})


def testRenderImageView(request, imageID):
    return render(request, 'image/diagnosisPage.html', {'imageID': imageID})


from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

@login_required
def saveImage(request):
    if request.method == "POST":
        try:
            # Extract file and file name from the request
            image_file = request.FILES.get("imageFile")
            filename = request.POST.get("filename")
            subID = request.POST.get("subID")  # get the subID from the request
            docID = request.POST.get("docID")  # get the docID from the request
            diagnosisID = request.POST.get("diagnosisID")  # get the diagnosisID from the request

            if not image_file or not filename or not subID or not docID:
                return JsonResponse({"error": "Invalid data"}, status=400)

            # Call setContinueDiag only if the user is authenticated and valid
            if request.user.is_authenticated:
                response = setContinueDiag(docID, diagnosisID)
                if not response.get("status"):
                    print(f"Error in setContinueDiag: {response.get('message')}")
            else:
                print("User is not authenticated. Skipping setContinueDiag.")

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
