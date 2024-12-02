# myapp/views.py
from django.shortcuts import render
from django.http import FileResponse, Http404
from django.conf import settings
import os

def display(request):
    return render(request, 'image/index.html')