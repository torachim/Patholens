from django.db import models
from django.conf import settings



class Doctors(models.Model):
    # 1 to 1 relation between diagnosis and user
    # when user is deleted the doctor is deleted as well
    doctorID = models.OneToOneField(
        settings.AUTH_USER_MODEL, primary_key=True, on_delete=models.CASCADE
    )

    # references to the diagnosis. When deleted it will be set to NULL
    continueDiag = models.OneToOneField("image.Diagnosis", on_delete=models.SET_NULL, null=True, default=None)
    
    # datasets which the Doctor can edit
    datasets = models.ManyToManyField("image.Media", blank=True)
    
    finishedPatients = models.JSONField(null=True, blank=True)
    
   
    def __str__(self):
        # the shown name in the admin panel is the name of the doctor
        return f"{self.doctorID.first_name} {self.doctorID.last_name}"
