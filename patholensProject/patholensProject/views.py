from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def homepage(request):
    return render(request, 'home.html')
@login_required
def home1(request):
    return render(request, 'home1.html')
