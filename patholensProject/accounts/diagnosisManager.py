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


def addDiagnosis(diagID, docID, confidence, imageUrl):
    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    diag = Diagnosis.objects.create(
        diagID=diagID, doctorID=docID, confidence=confidence, imageUrl=imageUrl
    )

    return diag
