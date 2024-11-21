from django.db import models
from django.conf import settings

# Create your models here.


# diagnosis class for linkage between the different db entries that "participate" in a certain diagnosis
class diagnosis(models.Model):
    diagID = models.AutoField(primary_key = True)
    # PROTECT: if the referenced user is deleted, the diagnosis won't be deleted
    userID = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete = models.PROTECT)
    confidence = models.PositiveSmallIntegerField(null = True, blank = True)
    subID = models.PositiveIntegerField(null = True, blank = True)

    def __str__(self):
        return str(self.diagID)

# useTime class for storing the timestamps of executed actions during diagnosis
class useTime(models.Model):
    timeID = models.AutoField(primary_key = True)
    # CASCADE: if the referenced diagnosis is deleted, the useTime entry will be automatically deleted aswell
    diagID = models.ForeignKey(diagnosis, on_delete = models.CASCADE, db_column = "diagID") 
    action = models.CharField(max_length = 30, null = False)
    timestamp = models.DurationField(null = False)

    def __str__(self):
        return str(self.timeID)