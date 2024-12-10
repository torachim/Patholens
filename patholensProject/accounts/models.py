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

    # ids from the patients
    remainingPatients = models.JSONField(null=True)
    finishedPatients = models.JSONField(null=True)

    def __str__(self):
        return str(self.doctorID)
