import uuid
import os
import sys
import django
from pathlib import Path
from image.models import UseTime
from image.models import Diagnosis
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .serializer import useTimeSerialize

def createUseTime(diagObjesct: Diagnosis):
    """
    Create a new Usetime for a started diagnosis. Connects it with the started diagnosis.

    Args:
        diagObjesct (Diagnosis): The started diagnosis. 

    Returns:
        timeObj (useTime): An useTime objects that stores the time and the action.
    """
    diag = diagObjesct

    timeObj = UseTime.objects.create(diag = diag)

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
    try:
        diagnosis = Diagnosis.objects.get(diagID = diagID)

        print(diagnosis)

        with transaction.atomic():
            print("was geht")
            useTimeInstance = UseTime.objects.get(diag = diagnosis)

            newActionTime = {action: duration}



            useTimeAction = useTimeInstance.actionTime or {}

            print(useTimeAction)

            if useTimeAction == {}:
                print("asdf")
                useTimeAction[1] = newActionTime
            
            else:
                print("tutz")
                lastKey = next(reversed(useTimeAction))
                print(lastKey)
                print("zup")
                newKey = lastKey + 1
                print(newKey)
                useTimeAction[newKey] = newActionTime
            
            print(useTimeAction)

            serializer = useTimeSerialize(
                instance = useTimeInstance,
                data = {"diag": diagnosis,
                        "actionTime": useTimeAction
                       },
            )

            print("was läuft")

            if serializer.is_valid():
                serializer.save()
                return serializer.data
            else:
                ValidationError(serializer.errors)

    except Diagnosis.DoesNotExist:
        raise ValidationError({'error': 'Diagnosis with this ID does not exists'})
    except Exception as e:
        raise ValidationError({'error': e})
     

    
