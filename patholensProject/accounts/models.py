from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser (AbstractUser):
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # Entferne 'email' hier


    
    def __str__ (self):
        return self.email

