from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import os
import base64
from django.conf import settings

@login_required
def newDiagnosis(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})


def testRenderImageView(request, imageID):
    return render(request, 'image/diagnosisPage.html', {'imageID': imageID})


def saveImage(request):
    if request.method == "POST":
        try:
            # Extract file and file name from the request
            image_file = request.FILES.get("imageFile")
            filename = request.POST.get("filename")
            diagnosisID = request.POST.get("diagnosisID") # get the diagnosis ID from the request

            if not image_file or not filename or not diagnosisID:
                return JsonResponse({"error": "Invalid data"}, status=400)

            # Define the directory structure: media/website_data/derivatives/diagnosis/sub-{diagnosis_id}
            sub_folder = os.path.join(
                settings.MEDIA_ROOT,
                "website_data",
                "derivatives",
                "diagnosis",
                f"sub-{diagnosisID}"
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
