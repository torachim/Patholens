from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def newDiagnosis(request, diagnosisID):
    return render(request, "image/diagnosisPage.html", {"diagnosisID": diagnosisID})



def testRenderImageView(request, imageID):
    return render(request, 'image/diagnosisPage.html', {'imageID': imageID})

def editDiagnosis(request):
    return render(request, 'image/editDiagnosis.html')

@login_required
def AIPage(request):
    return render(request, "image/AIPage.html")


