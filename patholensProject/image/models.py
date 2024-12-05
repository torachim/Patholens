from django.db import models
from django.conf import settings
from accounts.models import Doctors


# diagnosis class for linkage between the different db entries that "participate" in a certain diagnosis
class Diagnosis(models.Model):
    diagID = models.CharField(primary_key=True, max_length=100)
    # PROTECT: if the referenced doctor is deleted, the diagnosis won't be deleted
    doctorID = models.ForeignKey(Doctors, on_delete=models.PROTECT)
    confidence = models.PositiveSmallIntegerField(null=True, blank=True)
    # contains the number of the patient and the name of the data set
    imageUrl = models.CharField(null=False, max_length=20, default="Unknown")

    def __str__(self):
        return str(self.diagID)


# useTime class for storing the timestamps of executed actions during diagnosis
class UseTime(models.Model):
    timeID = models.AutoField(primary_key=True)
    # CASCADE: if the referenced diagnosis is deleted, the useTime entry will be automatically deleted aswell
    diagID = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, db_column="diagID")
    action = models.CharField(max_length=30, null=False)
    timestamp = models.DurationField(null=False)

    def __str__(self):
        return str(self.timeID)
