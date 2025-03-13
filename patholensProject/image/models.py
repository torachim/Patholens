from django.db import models
from accounts.models import Doctors


# diagnosis class for linkage between the different db entries that "participate" in a certain diagnosis
class Diagnosis(models.Model):
    diagID = models.CharField(primary_key=True, max_length=100, verbose_name="Diagnosis ID")
    
    # diagnosis will be deleted, when doctor is deleted
    doctor = models.ForeignKey(Doctors, on_delete=models.CASCADE, verbose_name="Diagnosing doctor") 
    
    # media folder to imageURL
    mediaFolder = models.ForeignKey("image.Media", on_delete=models.SET_NULL, null=True, default=None, verbose_name="Dataset")
    
    # unique int form the namen of the sub
    imageURL = models.CharField(null=False, max_length=20, default="Unknown", verbose_name="Url to the picture")
    
    confidence = models.JSONField(null=True, verbose_name="Confidence for the marked lesions")
    confidenceOfEditedDiag = models.JSONField(null=True, verbose_name="Confidence for the lessions after seeing AI Diagnosis")
    confidenceOfAIdiag = models.JSONField(null=True, verbose_name="Confidence to take the AI Diagnosis")
    
    def __str__(self):
        return str(self.diagID)


class Lesions(models.Model):
    """
    Table to safe all the lesions for all the diagnosis.
    Also safe the confidence of the lesions
    """
    # lesion ID
    lesionID = models.AutoField(primary_key=True)
    # lesion Name
    name = models.CharField(max_length=255)
    # confidence Value for each lesion
    confidence = models.IntegerField()
    # url to the lesion picture
    url = models.TextField(blank=False)
    # if true the lesion is deleted and should not be shown -> soft delete
    deleted = models.BooleanField(default=False)
    # if true the lesion is shown on the edited page
    shown = models.BooleanField(default=True)
    # key for the diagnosis
    diagnosis = models.ForeignKey(
        Diagnosis,
        on_delete=models.CASCADE,
        related_name="lesions"
    )

    def __int__(self):
        return (self.lesionID)



# useTime class for storing the timestamps of executed actions during diagnosis
class UseTime(models.Model):
    """
    Table to safe the Time that the doctor needs to do an action during the
    diagnosis process
    """
    # CASCADE: if the referenced diagnosis is deleted, the useTime entry will be automatically deleted aswell
    diag = models.OneToOneField(Diagnosis, on_delete=models.CASCADE, primary_key=True, default=1)
    actionTime = models.JSONField(null=True)

    def __str__(self):
        return str(self.diag)
    
    def toDict(self):
        return {
            "diag": str(self.diag),
            "actionTime": self.actionTime
        }


class Media(models.Model):
    # uniquqe of the dataset
    mediaID = models.AutoField(primary_key=True)
    # name of the dataset
    name = models.CharField(blank=False, max_length=100, unique=True)
    # all the URLs linked to the patients in the dataset
    url = models.TextField(blank=False)
    # indicates whether the media is visible to all doctors
    visibility = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        # makes name str to upper case
        if self.name:
            self.name = self.name.upper()
        
        # calls original save() logic
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
