from image.models import Lesions, Diagnosis

def createLesion(diagonsisID: str, confidence: int, name: str, url: str) -> Lesions|bool:
    """Creates a new lesion for a specified diagnosis

    Args:
        diagonsisID (str): ID of the current diagnosis
        confidence (int): confidence of the lesion
        name (str): name of the lesion
        url (str): path to the picture of the lesion

    Returns:
        Lesions|bool: Lesion if save was successful, else false
    """
    
    if not Diagnosis.objects.filter(diagID = diagonsisID).exists():
        return False
    
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagonsisID)

    lesion: Lesions = Lesions.objects.create(name=name, confidence = confidence, url = url, deleted = False, diagnosis = diagObj)

    return lesion

def softDeleteLesion(diagnosisID: str, lesionID) -> bool:
    """
    soft delets in diagnosis -> sets the argument deleted in the table to true

    Args:
        diagnosisID (str): The ID of the current diagnosis
        lesionID (int): The ID of the lesion that is going to be deleted

    Returns:
        bool: True -> successful, False -> an error occured
    """
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False

    lesion.deleted = True
    lesion.save()
    return True

def getLesionsConfidence(diagnosisID: str) -> list:
    """
    Returns the confidence value for all lesions of the current diagnosis
    that are not soft deleted

    Args:
        diagnosisID (str): ID of the current diagnosis

    Returns:
        list: A list that includes dictionaries with the ID (lesionID),
        the name(name) and the confidence(confidence) of all the lesions.
    """
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    if not diagObj:
        return False
    
    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False)
    return list(lesions.values("lesionID", "name", "confidence"))

def getLesions(diagnosisID: str) -> list:
    """
    Returns the urls of all the lesions for a current diagnosis that are not soft deleted.

    Args:
        diagnosisID (str): ID of the current diagnosis

    Returns:
        list: A list with dictionary for each lesion which contains its url.
    """
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False).order_by("lesionID")

    return list(lesions.values("url"))

def undoSoftDelete(diagnosisID: str, lesionID) -> bool:
    """undos the soft delete -> set the argument delete to false

    Args:
        diagnosisID (str): ID of the current diagnosis
        lesionID (int): ID of the lesion

    Returns:
        bool: True -> successful, False -> an error occured
    """
    lesion: Lesions = Lesions.objects.get(lesionsID = lesionID)

    if not lesion:
        return False
    
    lesion.deleted = False
    lesion.save()
    return True

def getNumberOfLesion(diagnosisID: str) -> int|bool:
    """
    Returns the number of Lesions of a diagnosis, includes the soft deleted ones

    Args:
        diagnosisID (str): ID of the current diagnosis

    Returns:
        int|bool: Returns the number of Lesion or false if an error occures
    """
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    if not diagObj:
        return False

    lesionsNumber = Lesions.objects.filter(diagnosis = diagObj).count()

    return lesionsNumber
