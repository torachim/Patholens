# myapp/views.py
from django.shortcuts import render

def home(request):
    return render(request, 'image/index.html')