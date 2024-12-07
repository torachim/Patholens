from django.shortcuts import render
from image.models import Diagnosis
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
from django.contrib.auth.decorators import login_required


# Create your views here.
def diagnosisView(request):
    return render(request, "diagnosisPage.html")


def diagnosisView(request, diagID):
    diagnosisObj = Diagnosis.objects.get(diagID=diagID)
    return render(request, "image/diagnosisPage.html", {"diagID": diagnosisObj.diagID})


def saveConfidence(request, diagID):
    if request.method == "POST":
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            confidence = data.get("confidence")

            # Validate confidence value (must be between 0 and 100)
            if confidence is None or not (0 <= int(confidence) <= 100):
                return JsonResponse(
                    {
                        "error": "Invalid confidence value. It must be between 0 and 100."
                    },
                    status=400,
                )

            diag = get_object_or_404(Diagnosis, diagID=diagID)

            # Update the confidence value
            diag.confidence = int(confidence)
            diag.save()

            return JsonResponse(
                {"message": "Confidence value saved successfully!"}, status=200
            )

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data in request."}, status=400)
        except Exception as e:
            return JsonResponse(
                {"error": f"An unexpected error occurred: {str(e)}"}, status=500
            )
    else:

        return JsonResponse({"error": "Invalid request method. Use POST."}, status=405)


@login_required
def newDiagnosis(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})


def testRenderImageView(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})
