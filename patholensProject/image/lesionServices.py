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

    lesion: Lesions = Lesions.objects.create(name=name, confidence = confidence, url = url, deleted = False, shown = True, diagnosis = diagObj)

    return lesion


def toggleDeleteLesion(lesionID: int) -> bool:
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False
    
    lesion.deleted = not lesion.deleted
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
    return list(lesions.values("lesionID", "name", "confidence", "shown"))

def getLesions(diagnosisID: str) -> list|bool:
    """
    Returns the urls of all the lesions for a current diagnosis that are not soft deleted.

    Args:
        diagnosisID (str): ID of the current diagnosis

    Returns:
        list: A list with dictionary for each lesion which contains its url.
    """
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    if not diagObj:
        return False

    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False).order_by("lesionID")

    return list(lesions.values("url", "shown"))


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

def toggleShowLesion(lesionID) -> bool:
    """
    Toggle the deleted status of a lesion between True and False

    Args:
        lesionID (int): The ID of the lesion

    Returns:
        bool: True if successful, False else
    """
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False
    
    lesion.shown = not lesion.shown
    print(lesion.shown)
    lesion.save()
    return True

def hardDeleteLesions(diagnosisID: str) -> tuple[list,int]|bool:

    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)
    if not diagObj:
        return False
    
    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = True)
    urls = list(lesions.values_list('url', flat = True))
    deletedCount, _ = lesions.delete()
    return urls, deletedCount
