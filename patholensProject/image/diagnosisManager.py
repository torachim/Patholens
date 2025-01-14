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

def setConfidence(diagID: str, confidenceType: ConfidenceType, keyValues: list[dict]) -> dict:
    """
    Updates the confidence values for a specific diagnosis.

    Args:
        * diagID (str): The ID of the diagnosis to update.
        * confidenceType (ConfidenceType): The type of confidence being updated (e.g., ai, first edit, second edit).
        * keyValues (list[dict]): A list of key-value pairs representing the confidence values to add.

    Returns:
        * dict: A dictionary with the status of the update and a message indicating success or failure.
    """
    returnValue: dict = {"status": None, "message": None}
    
    diagObj: Diagnosis = getDiagnosisObject(diagID)
    if not diagObj:
        returnValue.update({"status": False, "message": "Diagnosis not found."})
        return returnValue
    
    if not isinstance(confidenceType, ConfidenceType):
        returnValue.update({"status": False, "message": "Not confidence type"})
        return returnValue 
    
    # One of the confidence attributes in Diagnosis
    attribute: str = confidenceType.value
    
    # If the value of attribute is not an attribute in Diagnosis
    if not hasattr(Diagnosis, attribute):
        returnValue.update({"status": False, "message": "Confidence type was not found."})
        return returnValue
    
    
    alreadySavedConfidences: dict | None = getattr(diagObj, attribute, None)
    alreadySavedConfidences: dict = alreadySavedConfidences if alreadySavedConfidences else {}
    
    for lesions in keyValues:
        alreadySavedConfidences.update(lesions)
    
    # Dynamically set the attribute of diagObj to updated savedValues 
    setattr(diagObj, attribute, alreadySavedConfidences)
    diagObj.save()

    returnValue.update({"status": True, "message": "New Values where saved."})
    return returnValue
