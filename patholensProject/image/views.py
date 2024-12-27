from django.shortcuts import render
from image.models import Diagnosis
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
from django.contrib.auth.decorators import login_required
import os
import base64
from django.conf import settings



@login_required
def newDiagnosis(request, diagnosisID):

    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})



def testRenderImageView(request, imageID):
    return render(request, 'image/diagnosisPage.html', {'imageID': imageID})


def save_edited_image(request):
    if request.method == "POST":
        try:
            # Datei und Dateiname aus der Anfrage extrahieren
            image_file = request.FILES.get("image_file")
            filename = request.POST.get("filename")

            if not image_file or not filename:
                return JsonResponse({"error": "Invalid data"}, status=400)

            # Speicherpfad im Media-Ordner
            filepath = os.path.join(settings.MEDIA_ROOT, filename)

            # Speichere die Datei
            with open(filepath, "wb") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)

            return JsonResponse({"message": "Image saved successfully", "path": filepath})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Invalid request method"}, status=405)