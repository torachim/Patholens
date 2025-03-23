from image.models import UseTime, Diagnosis
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .serializer import useTimeSerialize


def createUseTime(diagObjesct: Diagnosis) -> UseTime:
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

def setUseTime(diagID: str, action: str, duration: float) -> None:
    """
    Creates a dictionary which includes the action and the needed time to finnished this action.
    This dictionary get added to the entry with given diagnois.

    Args:
        diagID (str): The diagnosis ID for the diagnosis where the action takes place
        action (str): The action (f.e "rectangle" or "freehand")
        duration (float): The duration for the given action

    Returns:
        useTime: The use edited useTime object
    """
    try:
        diagnosis = Diagnosis.objects.get(diagID=diagID)

        with transaction.atomic():
            useTimeInstance=UseTime.objects.get(diag=diagnosis)

            roundDuration = round(duration, 2)

            newActionTime = {action: roundDuration}

            useTimeAction = useTimeInstance.actionTime or {}

            if useTimeAction == {}:
                k = 1
                useTimeAction[k] = newActionTime
            
            else:
                lastKey = list(useTimeAction)[-1]
                newKey = int(lastKey) + 1
                useTimeAction[newKey] = newActionTime
    
            serializer = useTimeSerialize(
                instance = useTimeInstance,
                data = {"diag": diagnosis,
                        "actionTime": useTimeAction
                       },
            )

            if serializer.is_valid():
                serializer.save()
                return serializer.data
            else:
                ValidationError(serializer.errors)

    except Diagnosis.DoesNotExist:
        raise ValidationError({'error': 'Diagnosis with this ID does not exists'})
    except Exception as e:
        raise ValidationError({'error': e})
     