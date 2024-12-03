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

    ids = generateIdsForUrls(allDataSets, allUrls)

    doc = Doctors.objects.create(doctorID=user, allPatients=ids)

    return doc


def generateIdsForUrls(allDataSets, allUrls):

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


# creates random ids
def createUUIDs(amount):

    allUUIDs = []
    for i in range(amount):
        allUUIDs.append(str(uuid.uuid4()))

    return allUUIDs
