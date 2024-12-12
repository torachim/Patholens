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


from image.mediaHandler import *
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


def getRandomURL(docID: str, datasetName: str):
    """
    Returns a URL for a patient or a status message depending on the doctor's progress with the dataset.

    Args:
        docID (str): The doctor's ID.
        dataSet (str): The name of the dataset.

    Returns:
        dict: A dictionary with the keys:
            - "status" (str): The status of the operation ('success', 'error', 'finished').
            - "url" (str, optional): The URL of the patient (if status is 'success').
            - "message" (str, optional): A message explaining the status.
    """
    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return {"status": "error", "message": "Doctor not found"}

    doctor = Doctors.objects.get(doctorID=docID)
     
    urls = getPatientURLs(datasetName)
    if not urls:
        return {"status": "error", "message": "No URLs available for the dataset"}

    
    datasetNamesAndURL = doctor.finishedPatients
    
    finishedDatasets = list(datasetNamesAndURL.keys())

    
    # doctor is going to use the dataset for the first time
    if datasetName not in finishedDatasets:
        index = random.randint(0, len(urls)-1)
        return {"status": "success", "url": urls[index]}

    # the datasetname is already used and can be looked up
    finishedPatients = list(datasetNamesAndURL[datasetName].values())

    # doctor has edited all the pictures of the dataset
    if len(finishedPatients) == len(urls):
        return {"status": "finished"}

    
    # get a random url (patient) from the remaining patients of the dataset   
    else:
        remaining = [patient for patient in urls if patient not in finishedPatients]
        index = random.randint(0, len(remaining)-1)
        return {"status": "success", "url": remaining[index]}


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


def addFinishedPatient(docID: str, datasetName: str, url: str, uuid: str):
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
    
    if datasetName not in finishedPatients:
        finishedPatients[datasetName] = {}

    finishedPatients[datasetName][uuid] = url
    
    doctor.finishedPatients = finishedPatients
    doctor.save()
    
    return True