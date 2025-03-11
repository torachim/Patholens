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
    lesion: Lesions = Lesions.objects.get(lesionID = lesionID)

    if not lesion:
        return False

    lesion.deleted = True
    lesion.save()
    return True

def getLesionsConfidence(diagnosisID: str) -> list:
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    if not diagObj:
        return False
    
    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj, deleted = False)
    return list(lesions.values("lesionID", "name", "confidence"))

def getLesions(diagnosisID: str) -> list:
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    lesions: Lesions = Lesions.objects.filter(diagnosis = diagObj).order_by("lesionID")

    return list(lesions.values("url"))

def undoSoftDelete(diagnosisID: str, lesionID) -> bool:
    lesion: Lesions = Lesions.objects.get(lesionsID = lesionID)

    if not lesion:
        return False
    
    lesion.deleted = False
    lesion.save()
    return True

def getNumberOfLesion(diagnosisID: str) -> int|bool:
    diagObj: Diagnosis = Diagnosis.objects.get(diagID = diagnosisID)

    if not diagObj:
        return False

    lesionsNumber = Lesions.objects.filter(diagnosis = diagObj).count()

    return lesionsNumber
