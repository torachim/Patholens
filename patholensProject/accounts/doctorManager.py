import uuid
import random

from image.mediaHandler import *
from image.diagnosisManager import *
from accounts.models import Doctors


def createDoctor(user) -> Doctors:
    """
    Creates a new doctor entry in the database.

    Args:
        user (django.contrib.auth.models.User):  The`User`object representing the doctor to be created.

    Returns:
        Doctors: The created doctor object, including information about the remaining and finished patients.
    """

    doc = Doctors.objects.create(
        doctorID=user, finishedPatients=None
    )

    return doc

def createUUIDs(amount: int) -> list[str]:
    """
    Generates a specified number of unique UUIDs (Universally Unique Identifiers).

    Args:
        amount (int): The number of unique UUIDs to generate.

    Returns:
        list: A list of randomly generated UUIDs in string format.
    """
    allUUIDs:list = []
    easteregg: list = ["rafik", "torge", "christoph", "lukas",  "imad", "imene", "snehpreet"]
    for i in range(amount):
        
        uuidStr: str = str(uuid.uuid4())
        
        midpoint = len(uuidStr) // 2
        index = random.randint(0, len(easteregg)-1)
        newUUID: str = f"{uuidStr[:midpoint]}-{easteregg[index]}{uuidStr[midpoint:]}" 
        
        allUUIDs.append(newUUID)

    return allUUIDs

def getRandomURL(docID: str, datasetName: str) -> dict:
    """
    Returns a URL for a patient or a status message depending on the doctor's progress with the dataset.

    Args:
        docID (str): The doctor's ID.
        dataSet (str): The name of the dataset.

    Returns:
        dict: A dictionary with the keys:
            - "status" (str): The status of the operation ('success', 'error', 'finished').
            - "url" (str, optional): The URL of the patient (if status is 'success').
            - "message" (str, optional): A message explaining the status.
    """
    # Check if the doctor exists in the database
    doctor: Doctors = getDoctorObject(docID)
    
    if not doctor:
        return {"status": "error", "message": "Doctor not found"}
     
    urls: list = getPatientURLs(datasetName)
    if not urls:
        return {"status": "error", "message": "No URLs available for the dataset"}


    datasetNamesAndURL: dict = doctor.finishedPatients
    
    if not datasetNamesAndURL:
        datasetNamesAndURL = {}
    
    finishedDatasets: list = list(datasetNamesAndURL.keys())


    # doctor is going to use the dataset for the first time
    if datasetName not in finishedDatasets:
        index = random.randint(0, len(urls)-1)
        return {"status": "success", "url": urls[index]}

    # the datasetname is already used and can be looked up
    finishedPatients = list(datasetNamesAndURL[datasetName].values())

    # doctor has edited all the pictures of the dataset
    if len(finishedPatients) == len(urls):
        return {"status": "finished"}

    
    # get a random url (patient) from the remaining patients of the dataset
    else:
        remaining: list = [patient for patient in urls if patient not in finishedPatients]
        index = random.randint(0, len(remaining) - 1)
        return {"status": "success", "url": remaining[index]}

def getDoctorObject(docID: str) -> Doctors | bool:
    """
    Returns the object to the linked doctor

    Args:
        docID (str): The ID of the doctor

    Returns:
        Doctor: Returns the Doctor object & False if the doctor is not existent.
    """

    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    doctor = Doctors.objects.get(doctorID=docID)
    return doctor

def addFinishedPatient(docID: str, datasetName: str, url: str, uuid: str) -> bool:
    """
    Adds a URL entry to a finished patient dataset for a doctor.

    Args:
        docID (str): The ID of the doctor.
        datasetUrlKey (str): The key of the dataset under which the URL will be stored.
        url (str): The URL to be added to the finished patient dataset.

    Returns:
        bool: Returns True if the entry was successfully added, otherwise False.
    """
    # Check if the doctor exists in the database
    if not Doctors.objects.filter(doctorID=docID).exists():
        return False

    doctor = Doctors.objects.get(doctorID=docID)
    finishedPatients = doctor.finishedPatients
    if not finishedPatients:
        finishedPatients: dict = {}
    
    if datasetName not in finishedPatients:
        finishedPatients[datasetName] = {}

    finishedPatients[datasetName][uuid] = url
    
    doctor.finishedPatients = finishedPatients
    doctor.save()
    
    return True

def finishedDatasets(docID: str) -> list:
    """
    Identifies datasets where all patients have been marked as finished.
    
    This function retrieves the datasets associated with a specific doctor and checks 
    if all patients within each dataset have been completed. A dataset is considered 
    finished if the number of patients marked as completed matches the total number 
    of patients in the dataset.

    Args:
        docID (str): The ID for the doctor.

    Returns:
        list: A list of dataset names where all patients have been completed.
    """
    finishedDatasets: list = []
    
    docObject: Doctors = getDoctorObject(docID)

    datasetNamesAndURL: dict = docObject.finishedPatients
    
    # only if there are values in the dict
    if datasetNamesAndURL: 
        startedDatasets: list = list(datasetNamesAndURL.keys())
    
        
        
        for dataset in startedDatasets:
            # the patients that the doctor finished to edit
            finishedPatientULRs = list(datasetNamesAndURL[dataset])
            # all patients in the dataset 
            allPatientURLS: list[str] = getPatientURLs(dataset)

            if len(finishedPatientULRs) == len(allPatientURLS):
                finishedDatasets.append(dataset)
            
    return finishedDatasets

def getContinueDiag(docID: str) -> dict:
    """
    Retrieves the status of the doctor's ongoing diagnosis. Checks if the doctor exists
    and if there is an unfinished diagnosis to continue. Returns a dictionary with status, 
    reason, and message to indicate the result of the query.

    Args:
    docID (str): The ID of the doctor to check for an ongoing diagnosis.

    Returns (dict): A dictionary containing:
        - "status" (bool): Indicates success or failure.
        - "reason" (str): The reason for failure or empty if successful.
        - "message" (str): The message associated with the status.
    """
    returnDict = {"status": None, "reason": None, "message": None, "object" : None}

    # Define the reasons for failure cases. (constant)
    DOC_REASON: str = "Doctorobject" # Doc does not exists
    DIAG_REASON: str = "Diganosisobject" # Diag is NULL
    
    docObject: Doctors = getDoctorObject(docID=docID)
    if not docObject:
        returnDict.update ({"status": False, "reason": DOC_REASON ,"message": "The doctor does not exist."})
        return returnDict
    
    toBeContinuedDiagnosis: Diagnosis = docObject.continueDiag
    if not toBeContinuedDiagnosis:
        returnDict.update ({"status": False, "reason": DIAG_REASON ,"message": "There is no unfinished Diagnosis"})
        return returnDict
    
    returnDict.update({"status": True, "object": toBeContinuedDiagnosis})
    return returnDict

def setContinueDiag(docID: str, diagID: str) -> dict:
    """
    Associates an ongoing diagnosis with a doctor based on their respective IDs.

    This function checks if both the doctor and the diagnosis exist in the database. If either
    of them does not exist, a failure message with an appropriate reason is returned. If both exist,
    the diagnosis is assigned to the doctor's 'continueDiag' field, and the status is updated to success.

    Args:
        docID (str): The ID of the doctor to associate the diagnosis with.
        diagID (str): The ID of the diagnosis to assign to the doctor.

    Returns (dict): A dictionary containing:
        - "status" (bool): True if the operation was successful, False otherwise.
        - "reason" (str): A string providing the reason for failure, or empty if successful.
        - "message" (str): A detailed message explaining the result of the operation.
    """
    
    returnDict = {"status": None, "reason": None, "message": None}

    # Define the reasons for failure cases. (constant)
    DOC_REASON: str = "Doctorobject" # Doc does not exists
    DIAG_REASON: str = "Diganosisobject" # Diag does not exists
    
    docObject: Doctors = getDoctorObject(docID=docID)
    if not docObject:
        returnDict.update ({"status": False, "reason": DOC_REASON ,"message": "The doctor does not exist."})
        return returnDict
    
    diagObject: Diagnosis = getDiagnosisObject(diagID=diagID)
    if not diagObject:
        returnDict.update({"status": False, "reason": DIAG_REASON, "message": "The diagnosis does not exist."})
        return returnDict
    
    docObject.continueDiag = diagObject
    docObject.save()
    
    returnDict.update({"status": True})
    return returnDict
   
   
def getAvailableDatasets(docID) -> list:
    """
    Retrieves the list of available datasets associated with the specific doctor.

    Args:
        * docID (int): The unique identifier for the doctor.

    Returns:
        * list: A list of dataset names associated with the doctor. If the doctor does not exist,
              an empty list is returned.
    """
    docObject: Doctors = getDoctorObject(docID)
    
    datasets: list = []
    
    if not docObject:
        return datasets
    
    datasets: str = [sets.name for sets in docObject.datasets.all()]
    
    return datasets
           

def deleteContinueDiag(docID: str) -> dict:
    """
    Deletes the ongoing diagnosis of the doctor.

    Args:
        docID (str): The ID of the doctor.

    Returns:
        dict: A dictionary containing:
            - "status" (bool): True if the operation was successful, False otherwise.
            - "reason" (str): A string providing the reason for failure, or empty if successful.
            - "message" (str): A detailed message explaining the result of the operation.
    """
    returnDict = {"status": None, "reason": None, "message": None}

    # Define the reasons for failure cases. (constant)
    DOC_REASON: str = "Doctorobject" # Doc does not exists
    
    docObject: Doctors = getDoctorObject(docID=docID)
    if not docObject:
        returnDict.update ({"status": False, "reason": DOC_REASON ,"message": "The doctor does not exist."})
        return returnDict
    
    docObject.continueDiag = None
    docObject.save()
    
    returnDict.update({"status": True})
    return returnDict