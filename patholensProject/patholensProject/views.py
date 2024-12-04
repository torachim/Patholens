from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def homepage(request):
    return render(request, 'home.html')
@login_required
def homeWindow(request):
    return render(request, 'homeWindow.html')

def data(request):
    return render(request, 'selectDataset.html')

def datasets_view(request):
    allDataSets = [
        "Climate Change Data 2023",
        "World Population Statistics 2024",
        "COVID-19 Research Dataset",
        "Global Financial Markets Data",
        "ImageNet 2024: Computer Vision Dataset",
    ]
    return render(request, 'datasets.html', {'allDataSets': allDataSets})