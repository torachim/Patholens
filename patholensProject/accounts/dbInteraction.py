import uuid
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


import image.dataPipeline as dataPipeline
from accounts.models import Doctors


def createDoctor(user):
    allUrls = dataPipeline.getAllPatientsUrls()
    allDataSets = dataPipeline.getAllDataSets()

    # Generate ids for the patients and combine them
    # for each data Set: key = id, value = path to patient in data Set
    ids = addIdsToUrls(allDataSets, allUrls)

    # Generate the json for the finishes patients which are in the beginning empty
    remaining = {}

    for dataSet in allDataSets:
        remaining[dataSet] = {}

    doc = Doctors.objects.create(
        doctorID=user, allPatients=ids, finishedPatients=remaining
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


# create random amount of ids
def createUUIDs(amount):

    allUUIDs = []
    for i in range(amount):
        allUUIDs.append(str(uuid.uuid4()))

    return allUUIDs


def addFinishedPatient(doctorID, toBeAddedPatients: dict):
    # Exit when Doctors is not existing
    if Doctors.objects.filter(doctorID=doctorID).exists() == False:
        return False

    doctor = Doctors.objects.get(doctorID=doctorID)
    finishedPatient = doctor.finishedPatients

    for patients in finishedPatient:

        # If the key does not exist or is None, initialize it as an empty dict
        if patients not in finishedPatient or finishedPatient[patients] is None:
            finishedPatient[patients] = {}

        # Add new keys or overwrite existing values
        for key, value in toBeAddedPatients[patients].items():
            finishedPatient[patients][key] = value

    doctor.save()

    return True
