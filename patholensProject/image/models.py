from django.db import models
from accounts.models import Doctors


# diagnosis class for linkage between the different db entries that "participate" in a certain diagnosis
class Diagnosis(models.Model):
    diagID = models.CharField(primary_key=True, max_length=100)
    # If the referenced doctor is deleted, the diagnosis will be deleted as well
    doctor = models.ForeignKey(Doctors, on_delete=models.CASCADE)
    confidence = models.PositiveSmallIntegerField(null=True, blank=True)
    editedDiagConfidence = models.PositiveSmallIntegerField(null=True, blank=True)
    # contains the number of the patient and the name of the data set
    imageURL = models.CharField(null=False, max_length=20, default="Unknown")
    # media folder to imageURL
    mediaFolder = models.ForeignKey("image.Media", on_delete=models.SET_NULL, null=True, default=None)
    
    
    def __str__(self):
        return str(self.diagID)


# useTime class for storing the timestamps of executed actions during diagnosis
class UseTime(models.Model):
    """
    Table to safe the Time that the doctor needs to do an action during the
    diagnosis process
    """
    # CASCADE: if the referenced diagnosis is deleted, the useTime entry will be automatically deleted aswell
    diag= models.OneToOneField(Diagnosis, on_delete=models.CASCADE, primary_key=True, default=1)
    actionTime = models.JSONField(null=True)

    def __str__(self):
        return str(self.diag)


class Media(models.Model):
    # uniquqe of the dataset
    mediaID = models.AutoField(primary_key=True)
    # name of the dataset
    name = models.CharField(blank=False, max_length=100, unique=True)
    # all the URLs linked to the patients in the dataset
    url = models.TextField(blank=False)

    def save(self, *args, **kwargs):
        # makes name str to upper case
        if self.name:
            self.name = self.name.upper()
        
        # calls original save() logic
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
