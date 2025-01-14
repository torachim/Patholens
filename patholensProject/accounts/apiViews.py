from django.http import JsonResponse
from image.diagnosisManager import getURL
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.shortcuts import render



@login_required
def getURLApi(request, diagID):
    try:
        # call `getURL`-function
        url = getURL(diagID)
        if url:
            return JsonResponse({"url": url}, status=200)
        else:
            return JsonResponse({"error": "Diagnosis not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
    
@login_required
def getDocID(request):
    try:
        # call `getDocID`-function
        docID = request.user.id
        if docID:
            return JsonResponse({"docID": docID}, status=200)
        else:
            return JsonResponse({"error": "Doctor not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)