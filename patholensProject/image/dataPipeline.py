import os
from pathlib import Path
import django
import sys


# Add project path (root directory where manage.py is located)
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Define Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

# Initialize Django
django.setup()

from accounts.models import Doctors


BASEDIR = Path(__file__).resolve().parent.parent
DATASETPATH = os.path.join(BASEDIR, "dataSets")


# go through all data Sets in the directory and return the names of the data Sets
def getAllDataSets():
    global BASEDIR, DATASETPATH

    allDataSets = []

    pathExists = os.path.exists(DATASETPATH)
    pathIsDirectory = os.path.isdir(DATASETPATH)

    if pathExists and pathIsDirectory:
        for dir in os.listdir(DATASETPATH):
            allDataSets.append(dir)

    return allDataSets


def getAllPatientsUrls():
    global DATASETPATH

    allPatients = {}

    allDataSets = getAllDataSets()

    for dataSet in allDataSets:
        # has all the paths to the availabe data sets
        allSubPaths = os.listdir(os.path.join(DATASETPATH, dataSet))

        allSubIDs = []
        for sub in allSubPaths:
            if "sub-" in sub:
                # splits the string at '-' and takes only the number of the string (our ID)
                subID = sub.split("-")[1]
                allSubIDs.append(dataSet + "-" + subID)

        allPatients[dataSet] = {"url": allSubIDs}

    return allPatients
