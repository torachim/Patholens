from django.shortcuts import render
from image.models import Diagnosis
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
import json
from django.contrib.auth.decorators import login_required



@login_required
def newDiagnosis(request, diagnosisID):

    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})



def testRenderImageView(request, imageID):
    return render(request, 'image/diagnosisPage.html', {'imageID': imageID})