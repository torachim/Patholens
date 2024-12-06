from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def homepage(request):
    return render(request, 'home.html')
@login_required
def homeWindow(request):
    return render(request, 'homeWindow.html')

def data(request):
    allDataSets = [
        "Dataset 1",
        "Dataset 2",
        "Dataset 3",
    ]
     
    return render(request, 'selectDataset.html', {'allDataSets': allDataSets})
