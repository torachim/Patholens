import uuid
import os
import sys
import django
from pathlib import Path
import random

# Add project path (root directory where manage.py is located)
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Define Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

# Initialize Django
django.setup()


import image.dataHandler as dataHandler
from accounts.models import Doctors


def createDoctor(user: django.contrib.auth.models.User):
    """
    Creates a new doctor entry in the database.

    Args:
        user (django.contrib.auth.models.User):  The`User`object representing the doctor to be created.

    Returns:
        Doctors: The created doctor object, including information about the remaining and finished patients.
    """

    doc = Doctors.objects.create(
        doctorID=user, finishedPatients = {}
    )

    return doc


def createUUIDs(amount: int):
    """
    Generates a specified number of unique UUIDs (Universally Unique Identifiers).

    Args:
        amount (int): The number of unique UUIDs to generate.

    Returns:
        list: A list of randomly generated UUIDs in string format.
    """
    allUUIDs = []
    for i in range(amount):
        allUUIDs.append(str(uuid.uuid4()))

    return allUUIDs


def getRandomIDAndURL(docID: str, dataSet: str):
    """

    Returns a random diagnosis id with the linked url from the doctors`remainingPatients`dictionary.

    Args:
        docID (str): The unique identifier of the doctor
        dataSet (str): The name of the dataset, which must exist within the`remainingPatients`dictionary associated with the doctor.

    Raises:
        KeyError: If the specified dataset (dataSet) is not found in the doctor's`remainingPatients`dictionary.

    Returns:
        tuple: A tuple containing:
            - str: The ID of the diagnosis entry.
            - str: The URL of the picture.
        Returns False if no remaining patients are available or the doctor does not exist.
    """
    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    doctor = Doctors.objects.get(doctorID=docID)

    if dataSet not in doctor.remainingPatients:
        raise KeyError(f"Data set '{dataSet}' not found for doctor {docID}")

    remainingPatients = doctor.remainingPatients
    remainingPatientsAsList = list(remainingPatients[dataSet].keys())

    # Return False if no remaining patients are available
    if len(remainingPatientsAsList) <= 0:
        return False

    # Randomly select a patient from the remaining ones
    index = random.randint(0, len(remainingPatientsAsList) - 1)

    idForPicture = remainingPatientsAsList[index]
    urlForPicture = remainingPatients[dataSet][idForPicture]

    return (idForPicture, urlForPicture)


def getDoctorObject(docID: str):
    """
    Returns the object to the linked doctor

    Args:
        docID (str): The ID of the doctor

    Returns:
        Doctor: Returns the object of the Doctor
    """

    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    doctor = Doctors.objects.get(doctorID=docID)
    return doctor


def addFinishedPatient(docID: str, datasetUrlKey: str, url: str):
    """
    Adds a URL entry to a finished patient dataset for a doctor.

    Args:
        docID (str): The ID of the doctor.
        datasetUrlKey (str): The key of the dataset under which the URL will be stored.
        url (str): The URL to be added to the finished patient dataset.

    Returns:
        bool: Returns True if the entry was successfully added, otherwise False.
    """
    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    doctor = Doctors.objects.get(doctorID=docID)    
    finishedPatients = doctor.finishedPatients
    
    # creates a unique id and returns it in a list
    uuid = createUUIDs(1)[0]   
    if datasetUrlKey not in finishedPatients:
        finishedPatients[datasetUrlKey] = {}

    finishedPatients[datasetUrlKey][uuid] = url

    return True