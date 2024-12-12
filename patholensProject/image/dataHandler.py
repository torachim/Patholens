import os
from pathlib import Path
import django
import sys
import numpy as np
from django.apps import apps


# Add project path (root directory where manage.py is located)
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Define Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

# Check if Django is already initialized
if not apps.ready:
    django.setup()
    

# Specifies the base directory of the project (the directory that contains manage.py),
BASEDIR = Path(__file__).resolve().parent.parent
DATASETPATH = os.path.join(BASEDIR, "media")

from image.models import Media


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


def getPatientURLs(dataset: str):
    """
    The function goes through the media folder and extracts all the patient IDs as our url.

    Args:
        dataset (str): The name of the dataset.

    Returns:
        List[str]: A list of patient IDs extracted from the dataset folder.

    """
    global DATASETPATH

    # Has all the paths to the available data sets
    allSubPaths = os.listdir(os.path.join(DATASETPATH, dataset))

    allSubURLs = []
    for sub in allSubPaths:
        if "sub-" in sub:
            # Splits the string at '-' and takes only the number of the string (our ID)
            subID = sub.split("-")[1]
            allSubURLs.append(subID)

    return allSubURLs


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


def addMedia():
    """
    This function processes all datasets in the media directory, checks if they already exist in the Media 
    database, and updates or adds new dataset entries accordingly.


    Returns:
        bool:  
        - `True`if the function successfully processes all datasets, updates existing ones, and creates new entries as needed.
        - `False`if their are no datasets in the directory.
    """
    allDatasets = getDataSetNames()
    
    if allDatasets == []:
        return False

    for datasetName in allDatasets:
        
        url = getPatientURLs(datasetName)
        
        # dataset exists in the media db 
        if Media.objects.filter(name=datasetName).exists():
            media = Media.objects.get(name=datasetName)    
            
            savedURLAsString = media.url
            # convert the string to a list by splitting the string at ','
            savedURLAsList = [s.strip() for s in savedURLAsString.split(",")]

            # if patients where added after creating the dataset in the db: add the missing patients
            if len(savedURLAsList) < len(url):
                # adds all missing patinents url to savedURLAsList
                [savedURLAsList.append(patientURL) for patientURL in url if patientURL not in savedURLAsList]
                
                # converts the list to a string
                savedURLAsList = str(savedURLAsList).replace("[", "").replace("]", "").replace("'", "")
                
                media.url = savedURLAsList
                media.save()
        
        # dataset needs to be added to the media db     
        else:
            url = str(url).replace("[", "").replace("]", "").replace("'", "")
            Media.objects.create(name=datasetName, url=url)
    
    return True