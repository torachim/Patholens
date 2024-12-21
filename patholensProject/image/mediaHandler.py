import os
from pathlib import Path
import django
import sys
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

from image.dataHandler import *


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
        
        url = getPatientURLsFromFolder(datasetName)
        
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


def getPatientURLs(datasetName: str):
    savedURLAsList = []
    
    if Media.objects.filter(name=datasetName).exists():
        media = Media.objects.get(name=datasetName)  
        savedURLAsString = media.url
        
        # convert the string to a list by splitting the string at ','
        savedURLAsList = [s.strip() for s in savedURLAsString.split(",")]

    return savedURLAsList
