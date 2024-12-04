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


def createDoctor(user):
    allUrls = dataHandler.getAllPatientsUrls()
    allDataSets = dataHandler.getAllDataSets()

    # shuffle the URLs randomly so that each doctor has a different order
    for url in allUrls:
        shuffledUrls = dataHandler.shuffleList(allUrls[url]["url"])
        allUrls[url]["url"] = shuffledUrls

    # Generate ids for the patients and combine them
    # for each data set: key = id, value = path to patient in data set
    ids = addIdsToUrls(allDataSets, allUrls)

    # Generate the json for the finished patients which are in the beginning empty
    remaining = {}

    for dataSet in allDataSets:
        remaining[dataSet] = {}

    doc = Doctors.objects.create(
        doctorID=user, remainingPatients=ids, finishedPatients=remaining
    )

    return doc


def addIdsToUrls(allDataSets, allUrls):
    ids = {}

    for dataSet in allDataSets:
        urls = allUrls[dataSet]["url"]
        amount = len(urls)
        uuid = createUUIDs(amount)

        # Initialize the dictionary for dataSet if it does not exist yet
        if dataSet not in ids:
            ids[dataSet] = {}

        # Add urls and uuids to dictionary
        for index in range(amount):
            ids[dataSet][uuid[index]] = urls[index]

    return ids


# creates a certain amount of random ids
def createUUIDs(amount):
    allUUIDs = []
    for i in range(amount):
        allUUIDs.append(str(uuid.uuid4()))

    return allUUIDs


# dict must be in the form: {"dataSet": {id: url path, ...}, ...}
def addFinishedPatient(docID, toBeAddedPatients):
    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    if not isinstance(toBeAddedPatients, dict):
        raise ValueError("toBeAddedPatients must be a dictionary")

    doctor = Doctors.objects.get(doctorID=docID)
    finishedPatients = doctor.finishedPatients

    for patients in finishedPatients:

        # If the key does not exist or is None, initialize it as an empty dict
        if patients not in finishedPatients or finishedPatients[patients] is None:
            finishedPatients[patients] = {}

        # Add new keys or overwrite existing values
        for key, value in toBeAddedPatients[patients].items():
            finishedPatients[patients][key] = value

    doctor.save()

    return True


def getRandomPicturePath(docID, dataSet):
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
