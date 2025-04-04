from image.models import Lesions, Diagnosis

def createLesion(diagonsisID: str, confidence: int, name: str, url: str, isEdit: bool, page: bool) -> Lesions|bool:
    """Creates a new lesion for a specified diagnosis

    Args:
        diagonsisID (str): ID of the current diagnosis
        confidence (int): confidence of the lesion
        name (str): name of the lesion
        url (str): path to the picture of the lesion
        isEdit (bool): was the image saved and is used on the edit page
        page (bool): Is the image part of the first diagnosis

    Returns:
        Lesions|bool: Lesion if save was successful, else false
    """
    
    if not Diagnosis.objects.filter(diagID = diagonsisID).exists():
        return False
    
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagonsisID)

    if isEdit == "false":
        isedited = False
    else:
        isedited = True

    lesion: Lesions = Lesions.objects.create(name=name, confidence = confidence, url = url, deleted = False, shown = True, edited = isedited, fromMain = page, diagnosis = diagObj)

    return lesion


def toggleDeleteLesion(lesionID: int) -> bool:
    """
    Toggle the delete status of a lesion between True and False
    -> soft delete or undo soft delete 
    -> soft delete just removes the lesion from the lesion list and the canvas but its reversable 

    Args:
        lesionID (int): The ID of the lesion

    Returns:
        bool: True if successful, False else
    """
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False
    
    newStatus = not lesion.deleted
    
    lesion.deleted = newStatus
    lesion.shown = not newStatus
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
    
    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False).order_by("name")
    return list(lesions.values("lesionID", "name", "confidence", "shown", "edited", "fromMain"))

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

    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False, fromMain = True).order_by("lesionID")

    return list(lesions.values("url", "shown"))

def getEditedLesions(diagnosisID):
    """
    Returns the urls of all the edited lesions for a current diagnosis that are not soft deleted.

    Args:
        diagnosisID (str): ID of the current diagnosis

    Returns:
        list: A list with dictionary for each lesion which contains its url.
    """
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    if not diagObj:
        return False
    
    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False, edited = True).order_by("lesionID")

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
    activeLesionNumber = Lesions.objects.filter(diagnosis = diagObj, shown = True).count()
    activeEditedNumber = Lesions.objects.filter(diagnosis = diagObj, shown = True, edited = True).count()
    
    return {"lesionNumber": lesionsNumber,
            "activeLesionsNumber": activeLesionNumber,
            "activeEdited": activeEditedNumber}

def toggleShowLesion(lesionID) -> bool:
    """
    Toggle the shown status of a lesion between True and False

    Args:
        lesionID (int): The ID of the lesion

    Returns:
        bool: True if successful, False else
    """
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False
    
    lesion.shown = not lesion.shown
    lesion.save()
    return True

def toggleEditedLesion(lesionID: int) -> bool:
    """
    Toggle the edited status of the lesion

    Args:
        lesionID (int): The ID of the lesion
    Returns:
        bool: If the toggle was successful
    """
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False
    
    lesion.edited = not lesion.edited
    lesion.save()
    return True

def hardDeleteLesions(diagnosisID: str) -> tuple[list,int]|bool:
    """
    Hard delete a lesion -> removes it from the database not reversable

    Args:
        diagnosisID (str): The ID of the current diagnosis

    Returns:
        tuple[list,int]|bool: tuple contains a list which contains all the urls of the lesions
                              where the the deleted status is true(so the lesions that are soft deleted) 
                              and the number of hard deleted lesion
                              False if there is no correct diagnosis ID   
    """

    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)
    if not diagObj:
        return False
    
    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = True)
    urls = list(lesions.values_list('url', flat = True))
    deletedCount, _ = lesions.delete()
    return urls, deletedCount
