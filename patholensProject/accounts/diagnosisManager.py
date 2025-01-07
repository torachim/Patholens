import os
import sys
import django
from pathlib import Path

# Add project path (root directory where manage.py is located)
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Define Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

# Initialize Django
django.setup()


from image.models import Diagnosis, Media
from accounts.models import Doctors


def createDiagnosis(diagID: str, docObject: int, imageURL: str, mediaFolderObject: Media):
    """
    Creates a new diagnosis and associates it with a specified doctor and the patient image.

    Args:
        diagID (str): The unique identifier for the diagnosis.
        docID (int): The unique identifier of the doctor diagnosing the patient.
        imageURL (str): The URL to the image associated with the patient.

    Returns:
        Diagnosis: A`Diagnosis`object if the creation is successful.
        bool: `False` if the doctor does not exist or the diagnosis ID is already taken.
    """

    # Check if the doctor exists in the database or if a diagnosis with the ID already exists
    if (
        not Doctors.objects.filter(doctorID=docObject).exists()
        or Diagnosis.objects.filter(diagID=diagID).exists()
    ):
        return False

    diag = Diagnosis.objects.create(diagID=diagID, doctor=docObject, imageURL=imageURL, mediaFolder=mediaFolderObject)

    return diag


def getURL(diagID: str):
    """
    Returns the url from the diagnosis.

    Args:
        diagID (str): Diagnosis ID

    Returns:
        str: The url to the image of the patient (the patient number)
    """
    if not Diagnosis.objects.filter(diagID=diagID).exists():
        return None

    diagObject = Diagnosis.objects.get(diagID=diagID)
    url = diagObject.imageURL

    return url


def getDiagnosisObject(diagID: str):
    """
    Retrieves the Diagnosis object associated with the given diagID.

    This function checks if a diagnosis with the specified diagID exists in the database.
    If the diagnosis exists, the corresponding Diagnosis object is returned.
    If no diagnosis with the given diagID exists, the function returns False.

    Args:
        diagID (str): The ID of the diagnosis to retrieve.

    Returns:
        Diagnosis or bool: The Diagnosis object if it exists, False if no diagnosis is found.
    """
    
    # Check if the diagnosis exists in the database
    if not Diagnosis.objects.filter(diagID=diagID).exists():
        return False

    diagnosis = Diagnosis.objects.get(diagID=diagID)
    return diagnosis

    
