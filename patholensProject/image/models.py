from django.db import models
from accounts.models import Doctors


# diagnosis class for linkage between the different db entries that "participate" in a certain diagnosis
class Diagnosis(models.Model):
    diagID = models.CharField(primary_key=True, max_length=100)
    # If the referenced doctor is deleted, the diagnosis will be deleted as well
    doctor = models.ForeignKey(Doctors, on_delete=models.CASCADE)
    confidence = models.PositiveSmallIntegerField(null=True, blank=True)
    # contains the number of the patient and the name of the data set
    imageUrl = models.CharField(null=False, max_length=20, default="Unknown")

    def __str__(self):
        return str(self.diagID)


# useTime class for storing the timestamps of executed actions during diagnosis
class UseTime(models.Model):
    #timeID = models.AutoField(primary_key=True)
    # CASCADE: if the referenced diagnosis is deleted, the useTime entry will be automatically deleted aswell
    diagID = models.OneToOneField(Diagnosis, on_delete=models.CASCADE, db_column="diagID", primary_key=True)
    actionTime = models.JSONField(null=True)

    def __str__(self):
        return str(self.diagID)
