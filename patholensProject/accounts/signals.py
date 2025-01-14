from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache

from .models import Doctors
from image.models import Media
from image.mediaHandler import addMedia


# Always triggered when a doctor is saved
@receiver(post_save, sender=Doctors)
def assign_default_datasets(sender, instance, created, **kwargs):
    # Only when a doctor is created the code gets triggered
    if created:
        addMedia()
        # All existing Media from the database
        allDatasets = Media.objects.all()
        # Add the datasets to the Doctor
        instance.datasets.set(allDatasets)
        