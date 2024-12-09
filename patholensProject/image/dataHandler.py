import os
from pathlib import Path
import django
import sys
import numpy as np


# Add project path (root directory where manage.py is located)
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Define Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

# Initialize Django
django.setup()

# Specifies the base directory of the project (the directory that contains manage.py),
BASEDIR = Path(__file__).resolve().parent.parent
DATASETPATH = os.path.join(BASEDIR, "media")


def getDataSetNames():
    """
    Retrieves all datasets from the specified directory.

    Returns:
        list: A list of dataset names (directory names) found inside the`DATASETPATH`directory. If the directory does not exist or is not a valid directory, an empty list is returned.
    """
    global BASEDIR, DATASETPATH

    allDataSets = []

    pathExists = os.path.exists(DATASETPATH)
    pathIsDirectory = os.path.isdir(DATASETPATH)

    if pathExists and pathIsDirectory:
        for dir in os.listdir(DATASETPATH):
            allDataSets.append(dir)

    return allDataSets


def getAllPatientsUrls():
    """
    Retrieves a dictionary of all patient IDs grouped by datasets.

    This function iterates through all datasets in the `DATASETPATH` directory, and for each dataset, it
    looks for subdirectories that contain patient data. It extracts the patient ID from each subdirectory name
    (based on the string pattern "sub-<ID>"), and stores these IDs in a dictionary where the key is the dataset
    name and the value is a dictionary containing a list of patient IDs (URLs).

    Returns:
        dict: A dictionary where the keys are dataset names and the values are dictionaries with a key `"url"`
            that holds a list of patient IDs in the following form:
            {
            "dataSet":
                {
                    "url" : ["id of the patient", "id of the second patient" ...]
                },
            ...
            }

    """
    global DATASETPATH

    allPatients = {}

    allDataSets = getDataSetNames()

    for dataSet in allDataSets:
        # Has all the paths to the availabe data sets
        allSubPaths = os.listdir(os.path.join(DATASETPATH, dataSet))

        allSubIDs = []
        for sub in allSubPaths:
            if "sub-" in sub:
                # Splits the string at '-' and takes only the number of the string (our ID)
                subID = sub.split("-")[1]
                allSubIDs.append(subID)

        allPatients[dataSet] = {"url": allSubIDs}

    return allPatients


def shuffleList(aList: list):
    """
    This function takes a list of elements and shuffles them in place using a random permutation.

    Args:
        aList (list): The list to be shuffled.

    Returns:
        list: A new list with the elements shuffled randomly.
    """

    # shuffles the list random
    newList = np.random.permutation(aList)
    return list(newList)
