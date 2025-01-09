from django.db import models
from django.conf import settings



class Doctors(models.Model):
    # 1 to 1 relation between diagnosis and user
    # when user is deleted the doctor is deleted as well
    doctorID = models.OneToOneField(
        settings.AUTH_USER_MODEL, primary_key=True, on_delete=models.CASCADE
    )

    finishedPatients = models.JSONField(null=True)
    
    # references to the diagnosis. When deleted it will be set to NULL
    continueDiag = models.OneToOneField("image.Diagnosis", on_delete=models.SET_NULL, null=True, default=None)
    
    def __str__(self):
        return str(self.doctorID)
