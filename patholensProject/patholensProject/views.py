from django.shortcuts import render

def homepage(request):
    return render(request, 'home.html')

def basePageTest(request): # just for testing purposes of the help function
    return render(request, "base.html")