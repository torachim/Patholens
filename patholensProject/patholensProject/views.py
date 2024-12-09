from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from accounts.doctorManager import getRandomIdAndUrl
from accounts.diagnosisManager import createDiagnosis
from accounts.doctorManager import *
from accounts.diagnosisManager import *

from image import views

@login_required
def homepage(request):
    return render(request, "home.html")


@login_required
def forwardingInformation(request):

    diagnosisID, urlForPicture = getRandomIdAndUrl(request.user.id , 'website_data')
    docObject = getDoctorObject(request.user.id)
    createDiagnosis(diagnosisID, docObject, urlForPicture)
    
    return redirect('newDiagnosis', diagnosisID= diagnosisID)

