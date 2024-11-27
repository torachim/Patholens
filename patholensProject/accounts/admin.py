from django.contrib import admin
from django.contrib.auth.models import User
from .models import doctors

# Register your models here.

admin.site.register(doctors)