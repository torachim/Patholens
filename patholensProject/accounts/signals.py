from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache

from .models import Doctors
from image.models import Media
from image.mediaHandler import syncMediaToDB


# Always triggered when a doctor is saved
@receiver(post_save, sender=Doctors)
def assign_default_datasets(sender, instance, created, **kwargs):
    # Only when a doctor is created the code gets triggered
    if created:
        syncMediaToDB()
        # All existing Media from the database
        allDatasets = Media.objects.all()
        # Add the datasets to the Doctor
        instance.datasets.set(allDatasets)
        
        
# Always when a new dataset is created
@receiver(post_save, sender=Media)
def assign_datasets_to_doctors(sender, instance, created, **kwargs):
    if created:
        doctors = Doctors.objects.all()
        for doctor in doctors:
            doctor.datasets.add(instance)
