import uuid
import os
import sys
import django
from pathlib import Path
from image.models import UseTime
from image.models import Diagnosis

def createUseTime(diagObjesct: Diagnosis):
    """
    Create a new Usetime for a started diagnosis. Connects it with the started diagnosis.

    Args:
        diagObjesct (Diagnosis): The started diagnosis. 

    Returns:
        timeObj (useTime): An useTime objects that stores the time and the action.
    """
    diag = diagObjesct

    timeObj = UseTime.objects.create(diag = diag, actionTime = timestamps)

    return timeObj



def setUseTime(diagID: str, action: str, duration):
    """
    Creates a dictionary which includes the action and the needed time to finnished this action.
    This dictionary get added to the entry with given diagnois.

    Args:
        diagID (str): The diagnosis ID for the diagnosis where the action takes place
        action (str): The action (f.e "rectangle" or "freehand")
        duration (_type_): The duration for the given action

    Returns:
        useTime: The use edited useTime object
    """
   
    useTime = UseTime.objects.get(diag__diagID = diagID)

    if useTime.actionTime is None:
        useTime.actionTime = {}
    
    useTime.actionTime[action] = duration

    useTime.save()

    return useTime
