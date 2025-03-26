from .dataHandler import *
from .aiModelServices import syncAIEntries
from .models import Media, AIModel


def syncData() -> bool:
    """
    Synchronizes media entries by calling `syncMediaEntries` and `syncAIEntries` 
    for each dataset found in `getNamesFromMediaFolder`.

    Returns:
        bool: `True` if all media and AI entries were successfully synchronized, 
              otherwise `False`.
    """
    allDatasets: list[str] = getNamesFromMediaFolder()
    
    if allDatasets == []:
        return False

    for datasetName in allDatasets:
        if not syncMediEntries(datasetName):
            return False

        if not syncAIEntries(datasetName):
            return False
    
    return True
        
def syncMediEntries(datasetName) -> bool:
    """
    This function processes all datasets in the media directory, checks if they already exist in the Media 
    database, and updates or adds new dataset entries accordingly.


    Returns:
        bool:  
        - `True`if the function successfully processes all datasets, updates existing ones, and creates new entries as needed.
        - `False`if there are no datasets in the directory.
    """
    urlList: list[str] = getPatientURLsFromFolder(datasetName)
        
    # dataset exists in the media db
    if Media.objects.filter(name=datasetName).exists():
        media: Media = Media.objects.get(name=datasetName) 
        
        savedURLAsString: str = media.url
        # convert the string to a list by splitting the string at ','
        savedURLAsList: list = [s.strip() for s in savedURLAsString.split(",")]

        # if patients were added after creating the dataset in the db: add the missing patients
        if len(savedURLAsList) < len(urlList):
            # adds all missing patinents url to savedURLAsList
            [savedURLAsList.append(patientURL) for patientURL in urlList if patientURL not in savedURLAsList]
            
            # converts the list to a string
            savedURLAsList = str(savedURLAsList).replace("[", "").replace("]", "").replace("'", "")
            
            media.url = savedURLAsList
            media.save()
    
    # dataset needs to be added to the media db
    else:
        urlStr: str = str(urlList).replace("[", "").replace("]", "").replace("'", "")
        Media.objects.create(name=datasetName, url=urlStr)
        
    return True

def getPatientURLs(datasetName: str) -> list[str]:
    savedURLAsList = []
    
    if Media.objects.filter(name=datasetName).exists():
        media: Media = Media.objects.get(name=datasetName)  
        savedURLAsString: str = media.url
        
        # convert the string to a list by splitting the string at ','
        savedURLAsList: list = [s.strip() for s in savedURLAsString.split(",")]

    return savedURLAsList 

def getAIModels(datasetName: str) -> list[str]:
    """
    Iterates through the media entry and returns all the available (visible for the doctors) ai models.

    Args:
        datasetName (str): Name of the dataset

    Returns:
        list[str]: Ai model names
    """
    names = []
    
    if not Media.objects.filter(name=datasetName).exists():
        return []

    media: Media = Media.objects.get(name=datasetName)
    aiModels: AIModel = media.aimodel_set.all() # retrieves all the ai models
    aiModels = [model for model in aiModels if model.visibility] # take only the models which should be visible to the doctors
    
    for model in aiModels:
        nameOfModel = model.modelName.split(f"_{datasetName}")[0] # cut off the name of the dataset in the name of the ai model
        names.append(nameOfModel)
        
    return names
