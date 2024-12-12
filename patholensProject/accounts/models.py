from django.db import models
from django.conf import settings


class Doctors(models.Model):
    # 1 to 1 relation between diagnosis and user
    # when user is deleted the doctor is deleted as well
    doctorID = models.OneToOneField(
        settings.AUTH_USER_MODEL, primary_key=True, on_delete=models.CASCADE
    )
    # will get the id of the diagnosis
    activePatient = models.CharField(null=True, max_length=50)

    finishedPatients = models.JSONField(null=True)

    def __str__(self):
        return str(self.doctorID)

class Media(models.Model):
    # uniquqe of the dataset
    mediaID = models.AutoField(primary_key=True)
    # name of the dataset
    name = models.CharField(blank=False, max_length=100)
    # all the URLs linked to the patients in the dataset
    url = models.TextField(blank=False)