from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Doctors
from image.models import Media

# Always triggerd when a doctor is saved
@receiver(post_save, sender=Doctors)
def assign_default_datasets(sender, instance, created, **kwargs):
    # Only when a doctor is created the code gets triggerd
    if created:
        # All existing Media from the database
        all_datasets = Media.objects.all()
        # Add the datasets to the Doctor
        instance.datasets.set(all_datasets) 
        