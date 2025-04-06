from enum import Enum, unique

from image.models import Diagnosis, Media
from accounts.models import Doctors


@unique
class ConfidenceType(Enum):
    FIRST_EDIT = "confidence"
    SECOND_EDIT = "confidenceOfEditedDiag"
    AI = "confidenceOfAIdiag"
    

def createDiagnosis(diagID: str, docObject: int, imageURL: str, mediaFolderObject: Media) -> Diagnosis | bool:
    """
    Creates a new diagnosis and associates it with a specified doctor and the patient image.

    Args:
        * diagID (str): The unique diagnosis ID.
        * docObject (int): The unique identifier of the doctor making the diagnosis.
        * imageURL (str): The URL to the image related to the diagnosis.
        * mediaFolderObject (Media): The media folder object associated with the diagnosis..
        * imageURL (str): The URL to the image associated with the patient.

    Returns:
        * Diagnosis: A`Diagnosis`object if the creation is successful.
        * bool: `False` if the doctor does not exist or the diagnosis ID is already taken.
    """
    # Check if the doctor exists in the database or if a diagnosis with the ID already exists
    if (
        not Doctors.objects.filter(doctorID=docObject).exists()
        or Diagnosis.objects.filter(diagID=diagID).exists()
    ):
        return False

    diag: Diagnosis = Diagnosis.objects.create(diagID=diagID, doctor=docObject, imageURL=imageURL, mediaFolder=mediaFolderObject)

    return diag

def getURL(diagID: str) -> str | None:
    """
    Returns the url from the diagnosis.

    Args:
        * diagID (str): Diagnosis ID

    Returns:
        * str: The url to the image of the patient (the patient number)
    """
    if not Diagnosis.objects.filter(diagID=diagID).exists():
        return None

    diagObject: Diagnosis = Diagnosis.objects.get(diagID=diagID)
    url: str = diagObject.imageURL

    return url

def getDiagnosisObject(diagID: str) -> Diagnosis | bool:
    """
    Retrieves a `Diagnosis` object based on the provided diagnosis ID.

    Args:
        * diagID (str): The unique ID of the diagnosis.

    Returns:
        * Diagnosis: The Diagnosis object if it exists.
        * bool: False if no diagnosis is found.
    """
    # Check if the diagnosis exists in the database
    if not Diagnosis.objects.filter(diagID=diagID).exists():
        return False

    diagnosis: Diagnosis = Diagnosis.objects.get(diagID=diagID)
    return diagnosis

def setConfidence(diagID: str, confidenceType: int, confidenceValue: int) -> dict:
    """
    Updates the confidence values for a specific diagnosis.

    Args:
        * diagID (str): The ID of the diagnosis to update.
        * confidenceType (int): The type of confidence being updated 0 -> My diagnosis, 1 -> AI Diagnosis, 2 -> Edited Diagnosis.
        * confidenceValue (int): The confidence value

    Returns:
        * dict: A dictionary with the status of the update and a message indicating success or failure.
    """
    returnValue: dict = {"status": None, "message": None}
    
    diagObj: Diagnosis = getDiagnosisObject(diagID)
    if not diagObj:
        returnValue.update({"status": False, "message": "Diagnosis not found."})
        return returnValue
    

    # get in which field the confidence value is saved
    if(confidenceType == 0):
        attribute = "confidenceMyDiagnosis"
    elif(confidenceType == 1):
        attribute = "confidenceOfAIdiag"
    else:
        attribute = "confidenceOfEditedDiag"
    
    # Dynamically set the attribute of diagObj to updated savedValues 
    setattr(diagObj, attribute, confidenceValue)
    diagObj.save()

    returnValue.update({"status": True, "message": "New Values where saved."})
    return returnValue

def getDatasetName(diagnosisID: str) -> str | bool:
    """Returns the name of a dataset, given the diagnosis ID.

    Args:
        diagnosisID (str): ID of the diagnosis

    Returns:
        the dataset name if the diagnosis exists, otherwise False
    """

    if not Diagnosis.objects.filter(diagID = diagnosisID).exists():
        return False
    
    diagnosis: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    dataset = diagnosis.mediaFolder

    datasetName = dataset.name

    return datasetName

