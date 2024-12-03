import requests
from django.shortcuts import render
from django.urls import reverse

def renderImageView(request, imageID):
    return render(request, 'image/loadTest.html', {'imageID' : imageID})
