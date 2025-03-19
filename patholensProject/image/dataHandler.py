import os
import numpy as np
from pathlib import Path


# Specifies the base directory of the project (the directory that contains manage.py),
BASEDIR = Path(__file__).resolve().parent.parent
DATASETPATH = os.path.join(BASEDIR, "media")


def getNamesFromMediaFolder() -> list[str]:
    """
    Retrieves all datasets from the specified directory.

    Returns:
        list: A list of dataset names (directory names) found inside the`DATASETPATH`directory. If the directory does not exist or is not a valid directory, an empty list is returned.
    """
    global BASEDIR, DATASETPATH

    allDataSets = []

    pathExists: bool = os.path.exists(DATASETPATH)
    pathIsDirectory: bool = os.path.isdir(DATASETPATH)

    if pathExists and pathIsDirectory:
        for dir in os.listdir(DATASETPATH):
            # folders which are starting with . are system folders and should not be added 
            if not dir.startswith("."):
                allDataSets.append(dir.upper())

    return allDataSets

def getPatientURLsFromFolder(dataset: str) -> list[str]:
    """
    The function goes through the media folder and extracts all the patient IDs as our url.

    Args:
        dataset (str): The name of the dataset.

    Returns:
        List[str]: A list of patient IDs extracted from the dataset folder.

    """
    global DATASETPATH

    # Has all the paths to the available data sets
    allSubPaths: list[str] = os.listdir(os.path.join(DATASETPATH, dataset))

    allSubURLs = []
    for sub in allSubPaths:
        if "sub-" in sub:
            # Splits the string at '-' and takes only the number of the string (our ID)
            subID: str = sub.split("-")[1]
            allSubURLs.append(subID)

    return allSubURLs

def shuffleList(aList: list) -> list:
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

def getAIModelNamesFromMediaFolder(dataset: str) -> list[str]:
    """
    Extracts AI model names from a given dataset's media folder.
    
    This function navigates through the dataset directory structure to find AI-generated
    mask images and extracts the model names.
    
    Args:
        dataset (str): The name of the dataset folder.
    
    Returns:
        list[str]: A list of AI model names extracted from the file names.
    """
    global DATASETPATH
    
    modelNames = []
    
    # Define the path to the AI-generated derivative folder
    aiSubPath = os.path.join(DATASETPATH, dataset, "derivatives", "ai")
    
    if not os.path.exists(aiSubPath):
        return []
    
    allSubDirs: list[str] = os.listdir(aiSubPath)
    firstSubDir = allSubDirs[0]  # Pick the first sub-directory to locate AI model outputs
    
    # Path to AI-generated predictions: media/datasetname/derivatives/ai/sub-.../pred/
    aiPredPath = os.path.join(aiSubPath, firstSubDir, "pred")
    aiFiles: list[str] = os.listdir(aiPredPath)
    
    for filePath in aiFiles:
         # Filter out files that are not related to masks
        if "mask" in filePath:
            prefix = "acq-"  # prefix to look for in the file path
            prefixPosition = filePath.rfind(prefix)
            suffixPosition = filePath.rfind('_mask')
            
            # Since the prefix is always in the string, start extracting after the prefix
            model = filePath[prefixPosition + len(prefix):suffixPosition]  # Extract model name between prefix and suffix
            modelNames.append(model)
            
    return modelNames
