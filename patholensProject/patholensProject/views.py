from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from accounts.doctorManager import getRandomDiagnosis
from accounts.diagnosisManager import createDiagnosis
from accounts.models import Doctors

from image import views

@login_required
def homepage(request):
    return render(request, "home.html")


@login_required
def forwardingInformation(request):

    docID = request.user.id
    docObject = Doctors.objects.get(doctorID=docID)

    (diagID, urlForPicture) = getRandomDiagnosis(docID, "website_data")

    dia = createDiagnosis(diagID=diagID, docObject=docObject, imageUrl=urlForPicture)


    print("Hier")
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagID})
    #return redirect('newDiagnosis', {"diagnosisID": diagID})

