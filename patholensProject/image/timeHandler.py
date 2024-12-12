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
        diagObjesct (Diagnosis): The started diagnosis. Seperates the id to use it as a forigin and primary key

    Returns:
        timeObj (useTime): An useTime objects that stores the time and the action.
    """
    timestamps = {}
    diag = diagObjesct

    timeObj = UseTime.objects.create(diag = diag, actionTime = timestamps)

    return timeObj



    



def setUseTime(diagID: str, timestamp):
    pass