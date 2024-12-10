from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from accounts.doctorManager import getRandomIDAndURL
from accounts.diagnosisManager import createDiagnosis
from accounts.doctorManager import *
from accounts.diagnosisManager import *

from image import views


@login_required
def homepage(request):
    return render(request, "home.html")


@login_required
def forwardingInformation(request):
    """
    Handles the forwarding of information to create a new diagnosis and redirects to the diagnosis page.

    This view generates a random diagnosis ID and associated URL, creates a new diagnosis entry,
    and then redirects the user to a page to view the patient.

    Args:
        request (HttpRequest): The HTTP request object, which contains metadata and parameters.


    Returns:
        HttpResponseRedirect: A redirect response to the 'newDiagnosis' view, passing the newly created diagnosis ID in the URL.

    """
    # TODO: change website_data to variable which should be given to the function
    diagnosisID, urlForPicture = getRandomIDAndURL(request.user.id, "website_data")
    docObject = getDoctorObject(request.user.id)
    createDiagnosis(diagnosisID, docObject, urlForPicture)

    return redirect("newDiagnosis", diagnosisID=diagnosisID)
