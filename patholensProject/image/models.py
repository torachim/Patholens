from django.db import models
from django.conf import settings

from pathlib import Path
import sys
import os
import django

#sys.path.append(str(Path(__file__).resolve().parent.parent))
#os.environ.setdefault("DJANGO_SETTINGS_MODULE", "patholensProject.settings")

#if not settings.configured:  
#    django.setup()

from accounts.models import Doctors

# Create your models here.


# diagnosis class for linkage between the different db entries that "participate" in a certain diagnosis
class Diagnosis(models.Model):
    diagID = models.AutoField(primary_key = True)
    # PROTECT: if the referenced user is deleted, the diagnosis won't be deleted
    userID = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.PROTECT)
    confidence = models.PositiveSmallIntegerField(null = True, blank = True)
    subID = models.PositiveIntegerField(null = True, blank = True)

    def __str__(self):
        return str(self.diagID)

# useTime class for storing the timestamps of executed actions during diagnosis
class UseTime(models.Model):
    timeID = models.AutoField(primary_key = True)
    # CASCADE: if the referenced diagnosis is deleted, the useTime entry will be automatically deleted aswell
    diagID = models.ForeignKey(Diagnosis, on_delete = models.CASCADE, db_column = "diagID") 
    action = models.CharField(max_length = 30, null = False)
    timestamp = models.DurationField(null = False)

    def __str__(self):
        return str(self.timeID)