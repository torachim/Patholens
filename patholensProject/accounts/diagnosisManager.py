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


from image.models import Diagnosis
from accounts.models import Doctors


def createDiagnosis(diagID: str, docID: int, imageUrl: str):
    """
    Creates a new diagnosis and associates it with a specified doctor and the patient image.

    Args:
        diagID (str): The unique identifier for the diagnosis.
        docID (int): The unique identifier of the doctor diagnosing the patient.
        imageUrl (str): The URL to the image associated with the patient.

    Returns:
        Diagnosis: A`Diagnosis`object if the creation is successful.
        bool: `False` if the doctor does not exist or the diagnosis ID is already taken.
    """

    # Check if the doctor exists in the database or if a diagnosis with the ID already exists
    if (
        not Doctors.objects.filter(doctorID=docID).exists()
        or Diagnosis.objects.filter(diagID=diagID).exists()
    ):
        return False

    diag = Diagnosis.objects.create(diagID=diagID, doctorID=docID, imageUrl=imageUrl)

    return diag
